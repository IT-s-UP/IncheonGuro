package com.itsup.incheonguro.courserecommend.service;

import com.itsup.incheonguro.Auth.entity.Member;
import com.itsup.incheonguro.RegionRecommendPage.entity.Region;
import com.itsup.incheonguro.RegionRecommendPage.repository.RegionRepository;
import com.itsup.incheonguro.courserecommend.dto.CourseCostResponse;
import com.itsup.incheonguro.courserecommend.dto.CourseDayResponse;
import com.itsup.incheonguro.courserecommend.dto.CoursePlaceResponse;
import com.itsup.incheonguro.courserecommend.dto.CourseRecommendRequest;
import com.itsup.incheonguro.courserecommend.dto.CourseRecommendResponse;
import com.itsup.incheonguro.placeguide.dto.PlaceSummaryResponse;
import com.itsup.incheonguro.placeguide.entity.District;
import com.itsup.incheonguro.placeguide.entity.PlaceCategory;
import com.itsup.incheonguro.placeguide.service.PlaceGuideService;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.IdentityHashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Random;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * PlaceGuide(관광공사 실시간 API)에서 실제 장소를 가져와
 * 여행 스타일/기간/일정 강도에 맞춰 코스를 조합하는 서비스.
 *
 * 선택한 여행 스타일은 하루 일정의 "중심"이 되고, 식사(식당)는 스타일에
 * 포함되어 있지 않아도 항상 일정에 포함됩니다. 같은 날 방문하는 장소들은
 * 위경도 기준 최근접 이웃 방식으로 동선을 정렬합니다.
 */
@Service
@RequiredArgsConstructor
public class CourseRecommendService {

    private static final int MAX_DAYS = 10;

    // 코스 전체를 한 구 안에서 구성하기 위한 최소 테마 장소 후보 수
    private static final int MIN_THEME_POOL_SIZE = 2;

    // 옹진군처럼 여러 섬으로 나뉜 구에서, 이 거리(km) 이내의 장소들을 "같은 섬"으로 간주해 묶습니다.
    private static final double ISLAND_CLUSTER_RADIUS_KM = 5.0;

    // 쇼핑 카테고리 중 개별 브랜드 매장(아울렛 입점 매장, 마트, 올리브영 등) 코드 - 여행 코스에는 부적합해 제외
    private static final String SHOPPING_INDIVIDUAL_STORE_CODE = "SH04";

    // 인천 구/군 한글 표기
    private static final Map<District, String> DISTRICT_LABEL = Map.ofEntries(
            Map.entry(District.JEMULPO, "제물포구"),
            Map.entry(District.YEONGJONG, "영종구"),
            Map.entry(District.SEOHAE, "서해구"),
            Map.entry(District.GEOMDAN, "검단구"),
            Map.entry(District.GYEYANG, "계양구"),
            Map.entry(District.BUPYEONG, "부평구"),
            Map.entry(District.MICHUHOL, "미추홀구"),
            Map.entry(District.NAMDONG, "남동구"),
            Map.entry(District.YEONSU, "연수구"),
            Map.entry(District.GANGHWA, "강화군"),
            Map.entry(District.ONGJIN, "옹진군"));

    // 여행 스타일 → 장소 카테고리 매핑 (테마 카테고리, 식당 제외)
    private static final Map<String, Set<PlaceCategory>> STYLE_TO_CATEGORIES = Map.of(
            "힐링", EnumSet.of(PlaceCategory.CAFE, PlaceCategory.ATTRACTION),
            "맛집 탐방", EnumSet.of(PlaceCategory.RESTAURANT, PlaceCategory.ATTRACTION),
            "쇼핑", EnumSet.of(PlaceCategory.SHOPPING),
            "관광", EnumSet.of(PlaceCategory.ATTRACTION),
            "SNS 핫플레이스", EnumSet.of(PlaceCategory.CAFE, PlaceCategory.SHOPPING),
            "체험 / 액티비티", EnumSet.of(PlaceCategory.ATTRACTION),
            "문화 / 예술 / 역사", EnumSet.of(PlaceCategory.ATTRACTION),
            "자연", EnumSet.of(PlaceCategory.ATTRACTION));

    // 관광지(ATTRACTION) 안에서도 여행 스타일별로 관광공사 대분류 코드(lclsSystm1)를 제한해
    // "관광/체험액티비티/문화예술역사/자연"이 전부 같은 후보로 뭉개지지 않게 함.
    // NA=자연, HS=역사관광지, VE=체험·문화시설, EX/LS=레포츠.
    // "관광"·"힐링"처럼 이 맵에 없는 스타일은 제한 없이 관광지 전체를 후보로 봄.
    private static final Map<String, Set<String>> STYLE_TO_ATTRACTION_CODES = Map.of(
            "자연", Set.of("NA"),
            "문화 / 예술 / 역사", Set.of("HS", "VE"),
            "체험 / 액티비티", Set.of("VE", "EX", "LS"));

    // 동행인별로 여행 스타일 테마에 추가로 고려할 카테고리
    private static final Map<String, PlaceCategory> COMPANION_EXTRA_CATEGORY = Map.of(
            "혼자", PlaceCategory.CAFE,
            "연인", PlaceCategory.CAFE,
            "친구", PlaceCategory.SHOPPING);

    // 아이/부모님/반려동물과 함께하면 하루 일정 강도를 한 단계 낮춤
    private static final Set<String> RELAXED_PACE_COMPANIONS = Set.of("아이", "부모님", "반려동물");
    private static final int MIN_PLACES_PER_DAY = 2;

    // 프론트에서 올 수 있는 값 검증용. 프론트 문구가 바뀌면 여기서 걸러져 400으로 응답한다.
    private static final Set<String> KNOWN_SCHEDULE_TYPES =
            Set.of("빡빡하고 바쁜, 많은 일정", "여유롭고 널널한, 적은 일정");
    private static final Set<String> KNOWN_COMPANIONS =
            Set.of("혼자", "가족", "친구", "연인", "아이", "부모님", "반려동물", "기타");

    // 이동 수단별 하루 교통비 추정치
    private static final Map<String, Integer> TRANSPORT_DAILY_COST = Map.of(
            "도보", 0,
            "자전거", 0,
            "대중교통", 5000,
            "자차", 10000,
            "택시", 20000,
            "공유차 / 렌터카", 15000);

    // 카테고리별 1인 평균 비용 추정치
    private static final Map<PlaceCategory, Integer> CATEGORY_AVG_COST = Map.of(
            PlaceCategory.ATTRACTION, 8000,
            PlaceCategory.CAFE, 7000,
            PlaceCategory.RESTAURANT, 15000,
            PlaceCategory.SHOPPING, 20000);

    // 장소 카드에 표시할 카테고리 한글 라벨
    private static final Map<PlaceCategory, String> CATEGORY_LABEL = Map.of(
            PlaceCategory.ATTRACTION, "관광지",
            PlaceCategory.CAFE, "카페",
            PlaceCategory.RESTAURANT, "식당",
            PlaceCategory.SHOPPING, "쇼핑");

    // 비용 항목에 표시할 카테고리 한글 라벨
    private static final Map<PlaceCategory, String> CATEGORY_COST_LABEL = Map.of(
            PlaceCategory.ATTRACTION, "입장료",
            PlaceCategory.CAFE, "카페 비용",
            PlaceCategory.RESTAURANT, "식비",
            PlaceCategory.SHOPPING, "쇼핑 비용");

    private final PlaceGuideService placeGuideService;
    private final RegionRepository regionRepository;

    public CourseRecommendResponse recommend(CourseRecommendRequest request, Member member) {
        validateChoices(request);

        LocalDate startDate;
        LocalDate endDate;

        try {
            startDate = LocalDate.parse(request.getStartDate());
            endDate = LocalDate.parse(request.getEndDate());
        } catch (java.time.format.DateTimeParseException e) {
            throw new IllegalArgumentException("여행 날짜 형식이 올바르지 않습니다.");
        }

        long totalDays = ChronoUnit.DAYS.between(startDate, endDate) + 1;

        if (totalDays < 1) {
            throw new IllegalArgumentException("여행 종료일은 시작일 이후여야 합니다.");
        }

        if (totalDays > MAX_DAYS) {
            throw new IllegalArgumentException("여행 기간은 최대 " + MAX_DAYS + "일까지 추천할 수 있습니다.");
        }

        int days = (int) totalDays;
        int placesPerDay = "빡빡하고 바쁜, 많은 일정".equals(request.getScheduleType()) ? 4 : 3;

        if (RELAXED_PACE_COMPANIONS.contains(request.getCompanion())) {
            placesPerDay = Math.max(MIN_PLACES_PER_DAY, placesPerDay - 1);
        }

        Set<PlaceCategory> themeCategories = resolveCategories(request.getTravelStyles());

        PlaceCategory companionCategory = COMPANION_EXTRA_CATEGORY.get(request.getCompanion());
        if (companionCategory != null) {
            themeCategories.add(companionCategory);
        }

        boolean foodIsTheme = themeCategories.contains(PlaceCategory.RESTAURANT);
        Set<String> attractionCodeFilter = resolveAttractionCodeFilter(request.getTravelStyles());

        // 같은 회원이 같은 조건으로 다시 요청하면 같은 결과가 나오도록, 무작위 순서를
        // 매 요청 새로 뽑지 않고 요청 내용에서 뽑은 시드로 고정한다. 조건이 하나라도
        // 다르면 다른 시드가 되어 결과도 달라진다.
        Random random = new Random(Objects.hash(member == null ? null : member.getId(),
                request.getStartDate(), request.getEndDate(), request.getScheduleType(),
                request.getTravelStyles(), request.getCompanion(), request.getTransport()));

        // 식당이 그 자체로 테마가 아니면(예: "맛집 탐방"을 고르지 않았으면), 하루에 넣을
        // 식당 수는 이 목표치를 넘지 않는다 - 실제 구를 찾기 전에 필요한 테마 장소 수를
        // 미리 가늠해서, 후보가 넉넉한 구를 우선 찾는 데 씀 (같은 장소 반복 방문을 줄임)
        int mealsTarget = foodIsTheme ? 0 : (placesPerDay >= 4 ? 2 : 1);
        int minThemeSlotsPerDay = placesPerDay - mealsTarget;
        int desiredThemeCount = Math.max(MIN_THEME_POOL_SIZE, days * minThemeSlotsPerDay);

        District preferredDistrict = resolvePreferredDistrict(member);
        DistrictPools pools = buildDistrictPools(
                themeCategories, foodIsTheme, preferredDistrict, attractionCodeFilter, desiredThemeCount, random);
        String districtLabel = DISTRICT_LABEL.getOrDefault(pools.district(), "인천");

        // 식사는 테마에 포함되어 있지 않아도 항상 일정에 넣되,
        // 식당 후보가 부족하면 그만큼만 넣고 나머지는 테마 장소로 채움
        int mealsPerDay = foodIsTheme ? 0 : Math.min(mealsTarget, pools.mealPlaces().size());
        int themeSlotsPerDay = placesPerDay - mealsPerDay;

        List<PlaceSummaryResponse> themeSequence = buildSequence(pools.themePlaces(), days * themeSlotsPerDay);
        List<PlaceSummaryResponse> mealSequence = buildSequence(pools.mealPlaces(), days * mealsPerDay);

        int transportCost = TRANSPORT_DAILY_COST.getOrDefault(request.getTransport(), 0);

        long[] placeIdSeq = { 1 };
        long[] costIdSeq = { 1 };

        List<CourseDayResponse> dayResponses = new ArrayList<>();

        for (int day = 1; day <= days; day++) {
            List<PlaceSummaryResponse> themeForDay = themeSequence.subList(
                    (day - 1) * themeSlotsPerDay,
                    day * themeSlotsPerDay);

            List<PlaceSummaryResponse> mealsForDay = mealSequence.subList(
                    (day - 1) * mealsPerDay,
                    day * mealsPerDay);

            List<PlaceSummaryResponse> orderedTheme = orderByProximity(new ArrayList<>(themeForDay));
            List<PlaceSummaryResponse> dayPlaces = interleaveMeals(orderedTheme, mealsForDay);

            dayResponses.add(buildDay(day, dayPlaces, transportCost, placeIdSeq, costIdSeq));
        }

        return CourseRecommendResponse.builder()
                .id(UUID.randomUUID().toString())
                .title(districtLabel + "에서 즐기는 " + String.join(" · ", request.getTravelStyles()) + " 코스")
                .description(districtLabel + "의 실제 장소로 구성한 " + days + "일 코스예요.")
                .mapLabel(districtLabel + " 맞춤 코스 지도")
                .days(dayResponses)
                .build();
    }

    private record DistrictPools(District district, List<PlaceSummaryResponse> themePlaces,
            List<PlaceSummaryResponse> mealPlaces) {
    }

    /**
     * 프론트 설문 옵션 문구와 백엔드 매핑 키가 어긋나면(예: 프론트 문구만 바뀌고 백엔드는
     * 그대로인 경우) 조용히 기본값으로 빠지지 않도록, 알려진 값인지 미리 검증한다.
     */
    private void validateChoices(CourseRecommendRequest request) {
        if (!KNOWN_SCHEDULE_TYPES.contains(request.getScheduleType())) {
            throw new IllegalArgumentException("알 수 없는 일정 강도입니다: " + request.getScheduleType());
        }

        if (!TRANSPORT_DAILY_COST.containsKey(request.getTransport())) {
            throw new IllegalArgumentException("알 수 없는 이동 수단입니다: " + request.getTransport());
        }

        if (!KNOWN_COMPANIONS.contains(request.getCompanion())) {
            throw new IllegalArgumentException("알 수 없는 동행인입니다: " + request.getCompanion());
        }

        for (String style : request.getTravelStyles()) {
            if (!STYLE_TO_CATEGORIES.containsKey(style)) {
                throw new IllegalArgumentException("알 수 없는 여행 스타일입니다: " + style);
            }
        }
    }

    /**
     * 회원가입 때 선택한 관심 지역을, 코스를 구성할 구로 우선 고려하기 위해
     * District로 변환합니다. 관심 지역이 없거나 알 수 없는 지역이면 null.
     */
    private District resolvePreferredDistrict(Member member) {
        if (member == null || member.getInterestedRegion() == null) {
            return null;
        }

        return regionRepository.findById(member.getInterestedRegion())
                .map(Region::getRegionName)
                .flatMap(this::districtByLabel)
                .orElse(null);
    }

    private java.util.Optional<District> districtByLabel(String label) {
        return DISTRICT_LABEL.entrySet().stream()
                .filter(entry -> entry.getValue().equals(label))
                .map(Map.Entry::getKey)
                .findFirst();
    }

    /**
     * 선택한 여행 스타일에 해당하는 테마 장소와, 식사를 위한 식당 후보를
     * 관광공사 API에서 구 단위로 가져옵니다. 코스 전체를 하나의 구 안에서
     * 구성할 수 있도록 테마 후보가 충분한 구를 고르고, 어느 구도 충분하지
     * 않으면 후보가 가장 많은 구로 대체합니다. 회원의 관심 지역이 있으면
     * 가장 먼저 시도합니다.
     */
    private DistrictPools buildDistrictPools(
            Set<PlaceCategory> themeCategories, boolean foodIsTheme, District preferredDistrict,
            Set<String> attractionCodeFilter, int requiredThemeCount, Random random) {
        Set<PlaceCategory> fetchCategories = EnumSet.copyOf(themeCategories);

        if (!foodIsTheme) {
            fetchCategories.add(PlaceCategory.RESTAURANT);
        }

        List<PlaceCategory> categoryList = new ArrayList<>(fetchCategories);

        List<District> districts = new ArrayList<>(List.of(District.values()));
        Collections.shuffle(districts, random);

        if (preferredDistrict != null) {
            districts.remove(preferredDistrict);
            districts.add(0, preferredDistrict);
        }

        DistrictPools best = null;

        for (District district : districts) {
            List<PlaceSummaryResponse> places = placeGuideService.getPlaces(List.of(district), categoryList);
            List<PlaceSummaryResponse> filtered = filterAndDedupe(places);

            List<PlaceSummaryResponse> theme = filtered.stream()
                    .filter(place -> themeCategories.contains(place.getCategory()))
                    .filter(place -> place.getCategory() != PlaceCategory.ATTRACTION
                            || attractionCodeFilter == null
                            || attractionCodeFilter.contains(place.getLclsSystm1()))
                    .collect(Collectors.toCollection(ArrayList::new));

            List<PlaceSummaryResponse> meal = foodIsTheme
                    ? List.<PlaceSummaryResponse>of()
                    : filtered.stream()
                            .filter(place -> place.getCategory() == PlaceCategory.RESTAURANT)
                            .collect(Collectors.toCollection(ArrayList::new));

            // 옹진군은 다리로 연결되지 않은 여러 섬으로 이루어져 있어(백령도/연평도/대청도/자월도/덕적도 등)
            // 서로 다른 섬의 장소가 한 코스에 섞이지 않도록, 좌표 기준으로 가장 크게 뭉친
            // 섬(클러스터) 하나만 남깁니다.
            if (district == District.ONGJIN) {
                List<PlaceSummaryResponse> combined = new ArrayList<>(theme);
                combined.addAll(meal);

                Set<PlaceSummaryResponse> largestCluster =
                        Collections.newSetFromMap(new IdentityHashMap<>());
                largestCluster.addAll(keepLargestCluster(combined));

                theme = theme.stream()
                        .filter(largestCluster::contains)
                        .collect(Collectors.toCollection(ArrayList::new));
                meal = meal.stream()
                        .filter(largestCluster::contains)
                        .collect(Collectors.toCollection(ArrayList::new));
            }

            if (theme.size() >= requiredThemeCount) {
                Collections.shuffle(theme, random);
                Collections.shuffle(meal, random);
                return new DistrictPools(district, theme, meal);
            }

            if (best == null || theme.size() > best.themePlaces().size()) {
                best = new DistrictPools(district, theme, meal);
            }
        }

        if (best == null || best.themePlaces().size() < MIN_THEME_POOL_SIZE) {
            throw new IllegalStateException("추천할 장소를 찾지 못했습니다.");
        }

        Collections.shuffle(best.themePlaces(), random);
        Collections.shuffle(best.mealPlaces(), random);
        return best;
    }

    /**
     * 좌표 기준으로 서로 {@link #ISLAND_CLUSTER_RADIUS_KM} 이내에 있는 장소들을
     * 하나의 섬(클러스터)으로 묶고, 가장 장소가 많은 클러스터만 남깁니다.
     * (Union-Find로 연결된 장소들을 그룹화하는 방식)
     */
    private List<PlaceSummaryResponse> keepLargestCluster(List<PlaceSummaryResponse> places) {
        int n = places.size();

        if (n <= 1) {
            return places;
        }

        int[] parent = new int[n];

        for (int i = 0; i < n; i++) {
            parent[i] = i;
        }

        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                if (distanceKm(places.get(i), places.get(j)) <= ISLAND_CLUSTER_RADIUS_KM) {
                    union(parent, i, j);
                }
            }
        }

        Map<Integer, List<PlaceSummaryResponse>> clusters = new HashMap<>();

        for (int i = 0; i < n; i++) {
            clusters.computeIfAbsent(find(parent, i), key -> new ArrayList<>()).add(places.get(i));
        }

        return clusters.values().stream()
                .max(Comparator.comparingInt(List::size))
                .orElse(places);
    }

    private int find(int[] parent, int i) {
        while (parent[i] != i) {
            parent[i] = parent[parent[i]];
            i = parent[i];
        }

        return i;
    }

    private void union(int[] parent, int a, int b) {
        int rootA = find(parent, a);
        int rootB = find(parent, b);

        if (rootA != rootB) {
            parent[rootA] = rootB;
        }
    }

    private Set<PlaceCategory> resolveCategories(List<String> travelStyles) {
        Set<PlaceCategory> categories = travelStyles.stream()
                .map(STYLE_TO_CATEGORIES::get)
                .filter(Objects::nonNull)
                .flatMap(Set::stream)
                .collect(Collectors.toCollection(LinkedHashSet::new));

        if (categories.isEmpty()) {
            categories = EnumSet.of(PlaceCategory.ATTRACTION);
        }

        return categories;
    }

    /**
     * 관광지(ATTRACTION) 후보를 제한할 lclsSystm1 코드 집합을 계산합니다.
     * "관광"/"힐링"처럼 관광지를 제한 없이 요청하는 스타일이 하나라도 있으면
     * 제한을 두지 않고(null), 그 외에는 선택한 스타일들이 요구하는 코드의 합집합을 씁니다.
     */
    private Set<String> resolveAttractionCodeFilter(List<String> travelStyles) {
        boolean hasUnrestrictedAttractionStyle = travelStyles.stream()
                .anyMatch(style -> STYLE_TO_CATEGORIES.getOrDefault(style, Set.of()).contains(PlaceCategory.ATTRACTION)
                        && !STYLE_TO_ATTRACTION_CODES.containsKey(style));

        if (hasUnrestrictedAttractionStyle) {
            return null;
        }

        Set<String> codes = travelStyles.stream()
                .map(STYLE_TO_ATTRACTION_CODES::get)
                .filter(Objects::nonNull)
                .flatMap(Set::stream)
                .collect(Collectors.toCollection(LinkedHashSet::new));

        return codes.isEmpty() ? null : codes;
    }

    /**
     * 카테고리 없는 항목, 쇼핑 카테고리 중 개별 브랜드 매장을 제외하고
     * 이름 기준으로 중복 제거합니다.
     */
    private List<PlaceSummaryResponse> filterAndDedupe(List<PlaceSummaryResponse> places) {
        Map<String, PlaceSummaryResponse> uniqueByName = new LinkedHashMap<>();

        for (PlaceSummaryResponse place : places) {
            if (place.getCategory() == null) {
                continue;
            }

            boolean isIndividualShop = place.getCategory() == PlaceCategory.SHOPPING
                    && SHOPPING_INDIVIDUAL_STORE_CODE.equals(place.getLclsSystm2());

            if (isIndividualShop) {
                continue;
            }

            uniqueByName.putIfAbsent(place.getTitle(), place);
        }

        return new ArrayList<>(uniqueByName.values());
    }

    /**
     * 후보 장소 목록에서 필요한 개수만큼 순서열을 만듭니다.
     * 후보가 부족하면 앞에서부터 다시 순환합니다. 후보가 비어 있으면
     * 빈 순서열을 돌려줍니다(식당 후보가 하나도 없는 경우 등).
     */
    private List<PlaceSummaryResponse> buildSequence(List<PlaceSummaryResponse> pool, int neededPlaces) {
        List<PlaceSummaryResponse> sequence = new ArrayList<>(neededPlaces);

        if (pool.isEmpty()) {
            return sequence;
        }

        for (int i = 0; i < neededPlaces; i++) {
            sequence.add(pool.get(i % pool.size()));
        }

        return sequence;
    }

    /**
     * 하루 일정 안의 장소들을, 위경도 기준 최근접 이웃 방식으로 정렬해
     * 동선이 크게 튀지 않도록 합니다. (엄밀한 최단 경로는 아닌 휴리스틱)
     */
    private List<PlaceSummaryResponse> orderByProximity(List<PlaceSummaryResponse> places) {
        if (places.size() <= 2) {
            return places;
        }

        List<PlaceSummaryResponse> remaining = new ArrayList<>(places);
        List<PlaceSummaryResponse> ordered = new ArrayList<>();

        PlaceSummaryResponse current = remaining.remove(0);
        ordered.add(current);

        while (!remaining.isEmpty()) {
            PlaceSummaryResponse from = current;

            PlaceSummaryResponse nearest = remaining.stream()
                    .min(Comparator.comparingDouble(place -> distanceKm(from, place)))
                    .orElseThrow();

            remaining.remove(nearest);
            ordered.add(nearest);
            current = nearest;
        }

        return ordered;
    }

    /**
     * 이미 동선이 정해진 테마 장소 사이에 식사(식당)를 끼워 넣습니다.
     *
     * 각 식당은, 끼워 넣었을 때 동선이 가장 적게 늘어나는 위치(최소 삽입 비용)에
     * 넣습니다. 단, 이미 배치된 식당 바로 옆자리는 후보에서 제외해서
     * 식당이 연속으로 이어지는 일은 없도록 합니다.
     */
    private List<PlaceSummaryResponse> interleaveMeals(
            List<PlaceSummaryResponse> themeRoute,
            List<PlaceSummaryResponse> meals) {

        List<PlaceSummaryResponse> route = new ArrayList<>(themeRoute);

        for (PlaceSummaryResponse meal : meals) {
            int gap = findBestMealGap(route, meal);
            route.add(gap, meal);
        }

        return route;
    }

    private int findBestMealGap(List<PlaceSummaryResponse> route, PlaceSummaryResponse meal) {
        int bestGap = route.size();
        double bestCost = Double.MAX_VALUE;

        for (int gap = 0; gap <= route.size(); gap++) {
            boolean beforeIsMeal = gap > 0 && route.get(gap - 1).getCategory() == PlaceCategory.RESTAURANT;
            boolean afterIsMeal = gap < route.size() && route.get(gap).getCategory() == PlaceCategory.RESTAURANT;

            // 식당 바로 옆에는 넣지 않음 (식당 연속 방지)
            if (beforeIsMeal || afterIsMeal) {
                continue;
            }

            double cost = mealInsertionCost(route, gap, meal);

            if (cost < bestCost) {
                bestCost = cost;
                bestGap = gap;
            }
        }

        return bestGap;
    }

    /** 특정 위치에 장소 하나를 끼워 넣을 때 늘어나는 동선 거리를 계산합니다. */
    private double mealInsertionCost(List<PlaceSummaryResponse> route, int gap, PlaceSummaryResponse meal) {
        if (route.isEmpty()) {
            return 0;
        }

        if (gap == 0) {
            return distanceKm(meal, route.get(0));
        }

        if (gap == route.size()) {
            return distanceKm(route.get(route.size() - 1), meal);
        }

        PlaceSummaryResponse before = route.get(gap - 1);
        PlaceSummaryResponse after = route.get(gap);

        return distanceKm(before, meal) + distanceKm(meal, after) - distanceKm(before, after);
    }

    /** 두 지점 사이의 거리를 하버사인 공식으로 계산합니다 (km 단위). */
    private double distanceKm(PlaceSummaryResponse a, PlaceSummaryResponse b) {
        double earthRadiusKm = 6371;

        double dLat = Math.toRadians(b.getLatitude() - a.getLatitude());
        double dLng = Math.toRadians(b.getLongitude() - a.getLongitude());

        double lat1 = Math.toRadians(a.getLatitude());
        double lat2 = Math.toRadians(b.getLatitude());

        double h = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

        double c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));

        return earthRadiusKm * c;
    }

    private CourseDayResponse buildDay(
            int day,
            List<PlaceSummaryResponse> dayPlaces,
            int transportCost,
            long[] placeIdSeq,
            long[] costIdSeq) {

        List<CoursePlaceResponse> placeResponses = new ArrayList<>();
        Map<PlaceCategory, Integer> categoryCount = new EnumMap<>(PlaceCategory.class);

        for (PlaceSummaryResponse place : dayPlaces) {
            placeResponses.add(CoursePlaceResponse.builder()
                    .id(placeIdSeq[0]++)
                    .name(place.getTitle())
                    .category(CATEGORY_LABEL.getOrDefault(place.getCategory(), "장소"))
                    .description(place.getSubtitle())
                    .imageUrl(place.getImageUrl())
                    .latitude(place.getLatitude())
                    .longitude(place.getLongitude())
                    .build());

            categoryCount.merge(place.getCategory(), 1, Integer::sum);
        }

        List<CourseCostResponse> costResponses = new ArrayList<>();
        int totalCost = 0;

        if (transportCost > 0) {
            costResponses.add(CourseCostResponse.builder()
                    .id(costIdSeq[0]++)
                    .label("교통비")
                    .amount(transportCost)
                    .build());

            totalCost += transportCost;
        }

        for (Map.Entry<PlaceCategory, Integer> entry : categoryCount.entrySet()) {
            int amount = CATEGORY_AVG_COST.getOrDefault(entry.getKey(), 0) * entry.getValue();

            costResponses.add(CourseCostResponse.builder()
                    .id(costIdSeq[0]++)
                    .label(CATEGORY_COST_LABEL.getOrDefault(entry.getKey(), "기타 비용"))
                    .amount(amount)
                    .build());

            totalCost += amount;
        }

        return CourseDayResponse.builder()
                .day(day)
                .title(day + "일차: " + dayPlaces.get(0).getTitle() + " 둘러보기")
                .places(placeResponses)
                .costs(costResponses)
                .totalCost(totalCost)
                .build();
    }
}
