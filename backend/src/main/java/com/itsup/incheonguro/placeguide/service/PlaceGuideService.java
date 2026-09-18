package com.itsup.incheonguro.placeguide.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import com.itsup.incheonguro.placeguide.dto.PlaceDetailResponse;
import com.itsup.incheonguro.placeguide.dto.PlaceImageResponse;
import com.itsup.incheonguro.placeguide.dto.PlaceSearchResultResponse;
import com.itsup.incheonguro.placeguide.dto.PlaceSummaryResponse;
import com.itsup.incheonguro.placeguide.entity.District;
import com.itsup.incheonguro.placeguide.entity.PlaceBookmark;
import com.itsup.incheonguro.placeguide.entity.PlaceCategory;
import com.itsup.incheonguro.placeguide.repository.PlaceBookmarkRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlaceGuideService {

    private static final String BASE_URL = "https://apis.data.go.kr/B551011/KorService2";

    /*
     * 한국관광공사 인천 지역 코드
     */
    private static final String INCHEON_AREA_CODE = "2";

    /*
     * 인천광역시 시도 코드
     */
    private static final String INCHEON_REGION_CODE = "28";

    /*
     * 한 번에 가져올 데이터 수
     */
    private static final int NUM_OF_ROWS = 100;

    /*
     * 인천 전체 장소 목록 캐시
     *
     * 최초 1회만 관광공사 API를 호출하고
     * 이후에는 메모리에 저장된 데이터를 사용함.
     */
    private volatile List<PlaceSummaryResponse> allPlacesCache;

    private final RestTemplate restTemplate;

    private final ObjectMapper objectMapper;

    @Value("${kto.service-key}")
    private String serviceKey;

    private final PlaceBookmarkRepository placeBookmarkRepository;

    /*
     * 상세 / 이미지 조회용 캐시 서비스
     */
    private final PlaceCacheService placeCacheService;

    // =========================================================
    // 장소 목록 / 필터
    // =========================================================

    public List<PlaceSummaryResponse> getPlaces(
            List<District> districts,
            List<PlaceCategory> categories) {

        List<PlaceSummaryResponse> allPlaces = getAllPlacesCached();

        boolean hasDistrictFilter = districts != null
                && !districts.isEmpty();

        boolean hasCategoryFilter = categories != null
                && !categories.isEmpty();

        /*
         * 필터가 없으면 전체 장소 반환
         */
        if (!hasDistrictFilter
                && !hasCategoryFilter) {

            return new ArrayList<>(allPlaces);
        }

        /*
         * 지역 / 장소 유형 필터
         */
        return allPlaces.stream()
                .filter(place -> {

                    /*
                     * 지역 필터
                     */
                    if (hasDistrictFilter) {

                        if (place.getDistrict() == null) {
                            return false;
                        }

                        if (!districts.contains(
                                place.getDistrict())) {

                            return false;
                        }
                    }

                    /*
                     * 장소 유형 필터
                     */
                    if (hasCategoryFilter) {

                        if (place.getCategory() == null) {
                            return false;
                        }

                        if (!categories.contains(
                                place.getCategory())) {

                            return false;
                        }
                    }

                    return true;
                })
                .collect(Collectors.toList());
    }

    // =========================================================
    // 인천 전체 장소 조회 + 캐시
    // =========================================================

    private List<PlaceSummaryResponse> getAllPlacesCached() {

        if (allPlacesCache != null) {
            return allPlacesCache;
        }

        synchronized (this) {

            if (allPlacesCache != null) {
                return allPlacesCache;
            }

            List<PlaceSummaryResponse> result = new ArrayList<>();

            /*
             * 12 = 관광지
             */
            result.addAll(
                    getPlacesByContentType("12"));

            /*
             * 14 = 문화시설
             */
            result.addAll(
                    getPlacesByContentType("14"));

            /*
             * 28 = 레포츠
             */
            result.addAll(
                    getPlacesByContentType("28"));

            /*
             * 32 = 숙박
             */
            result.addAll(
                    getPlacesByContentType("32"));

            /*
             * 38 = 쇼핑
             */
            result.addAll(
                    getPlacesByContentType("38"));

            /*
             * 39 = 음식점
             *
             * FD05인 경우 CAFE
             * 그 외에는 RESTAURANT
             */
            result.addAll(
                    getPlacesByContentType("39"));

            /*
             * 중복 contentId 제거
             */
            List<PlaceSummaryResponse> distinct = result.stream()
                    .collect(
                            Collectors.collectingAndThen(
                                    Collectors.toMap(
                                            PlaceSummaryResponse::getPlaceId,
                                            place -> place,
                                            (first, second) -> first),
                                    map -> new ArrayList<>(
                                            map.values())));

            /*
             * 기본 정렬: 이름순
             */
            distinct.sort(
                    Comparator.comparing(
                            PlaceSummaryResponse::getTitle,
                            Comparator.nullsLast(
                                    String::compareTo)));

            /*
             * 캐시에 저장
             */
            allPlacesCache = List.copyOf(distinct);

            return allPlacesCache;
        }
    }

    // =========================================================
    // 관광공사 API 페이지네이션
    // =========================================================

    private List<PlaceSummaryResponse> getPlacesByContentType(
            String contentTypeId) {

        List<PlaceSummaryResponse> result = new ArrayList<>();

        int pageNo = 1;

        while (true) {

            JsonNode body = requestPlaceList(
                    contentTypeId,
                    pageNo);

            int totalCount = body.path("totalCount")
                    .asInt(0);

            JsonNode itemNode = body.path("items")
                    .path("item");

            /*
             * 데이터가 없으면 종료
             */
            if (itemNode.isMissingNode()
                    || itemNode.isNull()) {

                break;
            }

            int currentPageCount = 0;

            /*
             * 여러 건
             */
            if (itemNode.isArray()) {

                for (JsonNode item : itemNode) {

                    PlaceSummaryResponse place = toSummaryResponse(
                            item,
                            contentTypeId);

                    if (place != null) {

                        result.add(place);
                        currentPageCount++;
                    }
                }

            } else {

                /*
                 * 데이터가 1건이면
                 * 배열이 아닌 객체로 올 수 있음
                 */
                PlaceSummaryResponse place = toSummaryResponse(
                        itemNode,
                        contentTypeId);

                if (place != null) {

                    result.add(place);
                    currentPageCount = 1;
                }
            }

            /*
             * 더 가져올 데이터가 없는 경우 종료
             */
            if (totalCount <= 0
                    || result.size() >= totalCount
                    || currentPageCount == 0
                    || currentPageCount < NUM_OF_ROWS) {

                break;
            }

            pageNo++;
        }

        return result;
    }

    // =========================================================
    // 관광공사 장소 목록 API 호출
    // =========================================================

    private JsonNode requestPlaceList(
            String contentTypeId,
            int pageNo) {

        String url = BASE_URL
                + "/areaBasedList2"
                + "?serviceKey="
                + serviceKey
                + "&numOfRows="
                + NUM_OF_ROWS
                + "&pageNo="
                + pageNo
                + "&MobileOS=WEB"
                + "&MobileApp=IncheonGuro"
                + "&_type=json"
                + "&arrange=C"
                + "&contentTypeId="
                + contentTypeId
                + "&areaCode="
                + INCHEON_AREA_CODE
                + "&lDongRegnCd="
                + INCHEON_REGION_CODE;

        try {

            String response = restTemplate.getForObject(
                    URI.create(url),
                    String.class);

            if (response == null
                    || response.isBlank()) {

                throw new IllegalStateException(
                        "관광공사 API 응답이 비어 있습니다.");
            }

            JsonNode root = objectMapper.readTree(response);

            return root.path("response")
                    .path("body");

        } catch (RestClientException e) {

            throw new IllegalStateException(
                    "관광공사 장소 목록 API 호출에 실패했습니다.",
                    e);

        } catch (Exception e) {

            throw new IllegalStateException(
                    "관광공사 장소 목록 API 응답 처리에 실패했습니다.",
                    e);
        }
    }

    // =========================================================
    // 관광공사 데이터 → 우리 DTO 변환
    // =========================================================

    private PlaceSummaryResponse toSummaryResponse(
            JsonNode item,
            String requestedContentTypeId) {

        String contentId = item.path("contentid")
                .asText("");

        String title = item.path("title")
                .asText("");

        /*
         * contentId 또는 제목이 없으면 제외
         */
        if (contentId.isBlank()
                || title.isBlank()) {

            return null;
        }

        /*
         * 실제 API 응답의 contentTypeId 확인
         */
        String actualContentTypeId = item.path("contenttypeid")
                .asText("");

        if (actualContentTypeId.isBlank()) {
            return null;
        }

        /*
         * 장소 가이드에서 허용하는 타입만 사용
         *
         * 12 = 관광지
         * 14 = 문화시설
         * 28 = 레포츠
         * 32 = 숙박
         * 38 = 쇼핑
         * 39 = 음식점
         *
         * 15 = 축제 → 제외
         * 25 = 여행코스 → 제외
         */
        boolean allowedContentType = switch (actualContentTypeId) {

            case "12",
                    "14",
                    "28",
                    "32",
                    "38",
                    "39" ->
                true;

            default ->
                false;
        };

        if (!allowedContentType) {
            return null;
        }

        /*
         * 요청한 타입과 실제 응답 타입이 다르면 제외
         */
        if (!actualContentTypeId.equals(
                requestedContentTypeId)) {

            return null;
        }

        String address = item.path("addr1")
                .asText("");

        String imageUrl = item.path("firstimage")
                .asText("");

        if (imageUrl.isBlank()) {
            imageUrl = null;
        }

        /*
         * mapy = 위도
         * mapx = 경도
         */
        Double latitude = getDoubleValue(
                item.path("mapy"));

        Double longitude = getDoubleValue(
                item.path("mapx"));

        String lclsSystm1 = item.path("lclsSystm1")
                .asText("");

        String lclsSystm2 = item.path("lclsSystm2")
                .asText("");

        /*
         * 걷기여행길 / 나들길 등
         * 코스 형태의 데이터 제외
         */
        if ("LS01".equals(lclsSystm2)) {
            return null;
        }

        /*
         * 관광공사 구/군 코드
         */
        String signguCd = item.path("lDongSignguCd")
                .asText("");

        if (signguCd.isBlank()) {

            signguCd = item.path("signguCd")
                    .asText("");
        }

        District district = District.fromSignguCd(
                signguCd);

        /*
         * 관광공사 contentTypeId + 중분류를
         * 우리 PlaceCategory로 변환
         */
        PlaceCategory category = PlaceCategory.fromApiCode(
                actualContentTypeId,
                lclsSystm2);

        /*
         * 분류할 수 없는 데이터 제외
         */
        if (category == null) {
            return null;
        }

        return new PlaceSummaryResponse(
                contentId,
                title,
                address,
                district,
                category,
                latitude,
                longitude,
                imageUrl,
                lclsSystm2,
                lclsSystm1);
    }

    // =========================================================
    // 숫자 변환
    // =========================================================

    private Double getDoubleValue(
            JsonNode node) {

        if (node == null
                || node.isMissingNode()
                || node.isNull()) {

            return null;
        }

        String value = node.asText("");

        if (value.isBlank()) {
            return null;
        }

        try {

            return Double.parseDouble(value);

        } catch (NumberFormatException e) {

            return null;
        }
    }

    // =========================================================
    // 검색 / 자동완성
    // =========================================================

    public List<String> getAutocomplete(
            String keyword) {

        if (keyword == null
                || keyword.isBlank()) {

            return List.of();
        }

        String searchKeyword = keyword.trim()
                .toLowerCase();

        return getAllPlacesCached()
                .stream()
                .filter(place -> place.getTitle() != null
                        && place.getTitle()
                                .toLowerCase()
                                .contains(
                                        searchKeyword))
                .map(
                        PlaceSummaryResponse::getTitle)
                .distinct()
                .limit(10)
                .collect(Collectors.toList());
    }

    public PlaceSearchResultResponse getSearchResult(
            String keyword) {

        if (keyword == null
                || keyword.isBlank()) {

            return new PlaceSearchResultResponse(
                    List.of());
        }

        String searchKeyword = keyword.trim()
                .toLowerCase();

        List<PlaceSummaryResponse> places = getAllPlacesCached()
                .stream()
                .filter(place -> {

                    String title = place.getTitle() == null
                            ? ""
                            : place.getTitle();

                    String subtitle = place.getSubtitle() == null
                            ? ""
                            : place.getSubtitle();

                    return title
                            .toLowerCase()
                            .contains(
                                    searchKeyword)
                            || subtitle
                                    .toLowerCase()
                                    .contains(
                                            searchKeyword);
                })
                .collect(Collectors.toList());

        return new PlaceSearchResultResponse(
                places);
    }

    // =========================================================
    // 내 주변
    // =========================================================

    public List<PlaceSummaryResponse> getPlacesNearMe(
            double latitude,
            double longitude) {

        return getAllPlacesCached()
                .stream()
                .filter(place -> place.getLatitude() != null
                        && place.getLongitude() != null)
                .sorted(
                        Comparator.comparingDouble(
                                place -> calculateDistance(
                                        latitude,
                                        longitude,
                                        place.getLatitude(),
                                        place.getLongitude())))
                .limit(20)
                .collect(Collectors.toList());
    }

    private double calculateDistance(
            double lat1,
            double lon1,
            double lat2,
            double lon2) {

        final double EARTH_RADIUS = 6371.0;

        double latDistance = Math.toRadians(
                lat2 - lat1);

        double lonDistance = Math.toRadians(
                lon2 - lon1);

        double a = Math.sin(
                latDistance / 2)
                * Math.sin(
                        latDistance / 2)
                + Math.cos(
                        Math.toRadians(lat1))
                        * Math.cos(
                                Math.toRadians(lat2))
                        * Math.sin(
                                lonDistance / 2)
                        * Math.sin(
                                lonDistance / 2);

        double c = 2 * Math.atan2(
                Math.sqrt(a),
                Math.sqrt(1 - a));

        return EARTH_RADIUS * c;
    }

    // =========================================================
    // 주변 장소
    // =========================================================

    public List<PlaceSummaryResponse> getNearbyPlaces(
            String contentId) {

        PlaceDetailResponse target = getPlaceDetailWithoutBookmark(
                contentId);

        if (target.getDistrict() == null
                || target.getCategory() == null) {

            return List.of();
        }

        return getPlaces(
                List.of(
                        target.getDistrict()),
                List.of(
                        target.getCategory()))
                .stream()
                .filter(place -> !place.getPlaceId()
                        .equals(contentId))
                .limit(4)
                .collect(Collectors.toList());
    }

    // =========================================================
    // 상세
    // =========================================================

    public PlaceDetailResponse getPlaceDetail(
            String contentId,
            Long userId) {

        PlaceDetailResponse base = getPlaceDetailWithoutBookmark(
                contentId);

        boolean isBookmarked = userId != null
                && placeBookmarkRepository
                        .existsByUserIdAndContentId(
                                userId,
                                contentId);

        return new PlaceDetailResponse(
                base.getPlaceId(),
                base.getTitle(),
                base.getSubtitle(),
                base.getDescription(),
                base.getDistrict(),
                base.getCategory(),
                isBookmarked,
                base.getTags(),
                base.getLatitude(),
                base.getLongitude(),
                base.getUsageTime(),
                base.getRestDate(),
                base.getParking(),
                base.getInfoCenter(),
                base.getExtraInfoTexts());
    }

    private PlaceDetailResponse getPlaceDetailWithoutBookmark(
            String contentId) {

        JsonNode item = placeCacheService.getDetailCommon(
                contentId);

        if (item == null
                || item.isMissingNode()
                || item.isNull()) {

            throw new IllegalArgumentException(
                    "해당 장소를 찾을 수 없습니다.");
        }

        String contentTypeId = item.path("contenttypeid")
                .asText("");

        /*
         * 여행코스(25)는 장소 상세에서 제외
         */
        if (!isAllowedContentType(
                contentTypeId)) {

            throw new IllegalArgumentException(
                    "장소 가이드에서 지원하지 않는 장소 유형입니다.");
        }

        String lclsSystm2 = item.path("lclsSystm2")
                .asText("");

        /*
         * 걷기여행길 / 나들길 등
         * 코스 형태의 상세 데이터도 제외
         */
        if ("LS01".equals(lclsSystm2)) {

            throw new IllegalArgumentException(
                    "장소 가이드에서 지원하지 않는 장소 유형입니다.");
        }

        PlaceCategory category = PlaceCategory.fromApiCode(
                contentTypeId,
                lclsSystm2);

        IntroInfo introInfo = fetchIntroInfo(
                contentId,
                contentTypeId);

        List<String> tags = new ArrayList<>();

        if (category != null) {

            tags.add(
                    toKoreanCategoryTag(
                            category));
        }

        tags.addAll(
                introInfo.tags());

        String signguCd = item.path("lDongSignguCd")
                .asText("");

        if (signguCd.isBlank()) {

            signguCd = item.path("signguCd")
                    .asText("");
        }

        return new PlaceDetailResponse(
                contentId,
                item.path("title")
                        .asText(""),
                item.path("addr1")
                        .asText(""),
                item.path("overview")
                        .asText(""),
                District.fromSignguCd(
                        signguCd),
                category,
                false,
                tags,
                getDoubleValue(
                        item.path("mapy")),
                getDoubleValue(
                        item.path("mapx")),
                introInfo.usageTime(),
                introInfo.restDate(),
                introInfo.parking(),
                introInfo.infoCenter(),
                List.of());
    }

    // =========================================================
    // 상세 부가정보
    // =========================================================

    private IntroInfo fetchIntroInfo(
            String contentId,
            String contentTypeId) {

        JsonNode item = placeCacheService.getDetailIntro(
                contentId,
                contentTypeId);

        String usageTime = switch (contentTypeId) {

            case "12" ->
                item.path("usetime")
                        .asText("");

            case "14" ->
                item.path("usetimeculture")
                        .asText("");

            case "28" ->
                item.path("usetimeleports")
                        .asText("");

            case "32" ->
                item.path("checkintime")
                        .asText("");

            case "38" ->
                item.path("opentime")
                        .asText("");

            case "39" ->
                item.path("opentimefood")
                        .asText("");

            default ->
                "";
        };

        String restDate = switch (contentTypeId) {

            case "12" ->
                item.path("restdate")
                        .asText("");

            case "14" ->
                item.path("restdateculture")
                        .asText("");

            case "28" ->
                item.path("restdateleports")
                        .asText("");

            case "38" ->
                item.path("restdateshopping")
                        .asText("");

            case "39" ->
                item.path("restdatefood")
                        .asText("");

            default ->
                "";
        };

        String parking = switch (contentTypeId) {

            case "12" ->
                item.path("parking")
                        .asText("");

            case "14" ->
                item.path("parkingculture")
                        .asText("");

            case "28" ->
                item.path("parkingleports")
                        .asText("");

            case "32" ->
                item.path("parkinglodging")
                        .asText("");

            case "38" ->
                item.path("parkingshopping")
                        .asText("");

            case "39" ->
                item.path("parkingfood")
                        .asText("");

            default ->
                "";
        };

        String infoCenter = switch (contentTypeId) {

            case "12" ->
                item.path("infocenter")
                        .asText("");

            case "14" ->
                item.path("infocenterculture")
                        .asText("");

            case "28" ->
                item.path("infocenterleports")
                        .asText("");

            case "32" ->
                item.path("infocenterlodging")
                        .asText("");

            case "38" ->
                item.path("infocentershopping")
                        .asText("");

            case "39" ->
                item.path("infocenterfood")
                        .asText("");

            default ->
                "";
        };

        List<String> tags = new ArrayList<>();

        /*
         * 음식점 / 카페
         */
        if ("39".equals(contentTypeId)) {

            addIfNotBlank(
                    tags,
                    item.path("firstmenu")
                            .asText(""));

            addIfNotBlank(
                    tags,
                    item.path("treatmenu")
                            .asText(""));
        }

        /*
         * 쇼핑
         */
        if ("38".equals(contentTypeId)) {

            addIfNotBlank(
                    tags,
                    item.path("saleitem")
                            .asText(""));
        }

        return new IntroInfo(
                usageTime,
                restDate,
                parking,
                infoCenter,
                tags);
    }

    private void addIfNotBlank(
            List<String> tags,
            String value) {

        if (value == null
                || value.isBlank()) {

            return;
        }

        for (String part : value.split(",")) {

            String trimmed = part.trim();

            if (!trimmed.isEmpty()) {

                tags.add(trimmed);
            }
        }
    }

    // =========================================================
    // 허용 장소 유형
    // =========================================================

    private boolean isAllowedContentType(
            String contentTypeId) {

        return switch (contentTypeId) {

            case "12",
                    "14",
                    "28",
                    "32",
                    "38",
                    "39" ->
                true;

            default ->
                false;
        };
    }

    // =========================================================
    // 카테고리 한글명
    // =========================================================

    private String toKoreanCategoryTag(
            PlaceCategory category) {

        return switch (category) {

            case ATTRACTION ->
                "관광지";

            case CULTURE ->
                "문화시설";

            case LEISURE ->
                "레포츠";

            case CAFE ->
                "카페";

            case RESTAURANT ->
                "음식점";

            case LODGING ->
                "숙박";

            case SHOPPING ->
                "쇼핑";
        };
    }

    private record IntroInfo(
            String usageTime,
            String restDate,
            String parking,
            String infoCenter,
            List<String> tags) {
    }

    // =========================================================
    // 이미지
    // =========================================================

    public List<PlaceImageResponse> getPlaceImages(
            String contentId) {

        JsonNode items = placeCacheService.getDetailImages(
                contentId);

        List<PlaceImageResponse> result = new ArrayList<>();

        for (JsonNode item : items) {

            result.add(
                    PlaceImageResponse.from(
                            item));
        }

        return result;
    }

    // =========================================================
    // 북마크
    // =========================================================

    public List<PlaceSummaryResponse> getBookmarkedPlaces(
            Long userId) {

        List<PlaceBookmark> bookmarks = placeBookmarkRepository
                .findByUserId(userId);

        /*
         * 북마크만 DB에 저장하고
         * 장소 정보는 관광공사 API 캐시에서 가져옴.
         */
        List<PlaceSummaryResponse> allPlaces = getAllPlacesCached();

        List<PlaceSummaryResponse> result = new ArrayList<>();

        for (PlaceBookmark bookmark : bookmarks) {

            allPlaces.stream()
                    .filter(place -> place.getPlaceId()
                            .equals(
                                    bookmark.getContentId()))
                    .findFirst()
                    .ifPresent(
                            result::add);
        }

        return result;
    }

    public void addBookmark(
            String contentId,
            Long userId) {

        if (placeBookmarkRepository
                .existsByUserIdAndContentId(
                        userId,
                        contentId)) {

            return;
        }

        placeBookmarkRepository.save(
                new PlaceBookmark(
                        userId,
                        contentId));
    }

    public void removeBookmark(
            String contentId,
            Long userId) {

        placeBookmarkRepository
                .findByUserIdAndContentId(
                        userId,
                        contentId)
                .ifPresent(
                        placeBookmarkRepository::delete);
    }
}
