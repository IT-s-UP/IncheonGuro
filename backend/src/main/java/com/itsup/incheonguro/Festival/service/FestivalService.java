package com.itsup.incheonguro.Festival.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.itsup.incheonguro.Festival.dto.*;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FestivalService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${kto.service-key}")
    private String serviceKey;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd");

    /*
     * =========================
     * 인기 행사 TOP5
     * =========================
     */
    public List<PopularFestivalResponse> getPopularFestivals()
            throws Exception {

        JsonNode items = callFestivalApi(null, 50);

        List<PopularFestivalResponse> result = new ArrayList<>();

        for (JsonNode item : items) {

            String startDate = item.path("eventstartdate").asText();
            String endDate = item.path("eventenddate").asText();

            // 이미 종료된 행사 제외
            if (isPastFestival(endDate)) {
                continue;
            }

            result.add(
                    new PopularFestivalResponse(
                            item.path("contentid").asText(),
                            item.path("title").asText(),
                            item.path("firstimage").asText(),
                            startDate,
                            endDate));

            if (result.size() >= 5) {
                break;
            }
        }

        return result;
    }

    /*
     * =========================
     * 구 / 군별 행사 조회
     * =========================
     */
    public List<FestivalCardResponse> getFestivalByRegion(
            String region) throws Exception {

        List<JsonNode> festivalItems = new ArrayList<>();

        /*
         * 전체
         */
        if ("전체".equals(region)) {

            JsonNode items = callFestivalApi(null, 100);

            for (JsonNode item : items) {
                festivalItems.add(item);
            }
        }

        /*
         * 제물포구
         *
         * 기존 중구 내륙 + 동구
         */
        else if ("제물포구".equals(region)) {

            String jungguCode = getSignguCode("중구");
            String dongguCode = getSignguCode("동구");

            JsonNode jungguItems = callFestivalApi(
                    jungguCode,
                    100);

            JsonNode dongguItems = callFestivalApi(
                    dongguCode,
                    100);

            /*
             * 기존 중구에서 영종/용유 지역은 제외
             * → 제물포구는 중구 내륙 지역만 포함
             */
            for (JsonNode item : jungguItems) {

                String address = item.path("addr1").asText();

                if (!isYeongjongArea(address)) {
                    festivalItems.add(item);
                }
            }

            for (JsonNode item : dongguItems) {
                festivalItems.add(item);
            }
        }

        /*
         * 영종구
         *
         * 기존 중구에서 영종/용유 지역만 추출
         */
        else if ("영종구".equals(region)) {

            String jungguCode = getSignguCode("중구");

            JsonNode items = callFestivalApi(
                    jungguCode,
                    100);

            for (JsonNode item : items) {

                String address = item.path("addr1").asText();

                if (isYeongjongArea(address)) {
                    festivalItems.add(item);
                }
            }
        }

        /*
         * 서해구
         *
         * 기존 서구 중 남부 지역
         */
        else if ("서해구".equals(region)) {

            String seoguCode = getSignguCode("서구");

            JsonNode items = callFestivalApi(
                    seoguCode,
                    100);

            for (JsonNode item : items) {

                String address = item.path("addr1").asText();

                if (isSeoHaeArea(address)) {
                    festivalItems.add(item);
                }
            }
        }

        /*
         * 검단구
         *
         * 기존 서구 중 북부 지역
         */
        else if ("검단구".equals(region)) {

            String seoguCode = getSignguCode("서구");

            JsonNode items = callFestivalApi(
                    seoguCode,
                    100);

            for (JsonNode item : items) {

                String address = item.path("addr1").asText();

                if (isGeomdanArea(address)) {
                    festivalItems.add(item);
                }
            }
        }

        /*
         * 기존 행정구역
         *
         * 미추홀구
         * 연수구
         * 남동구
         * 부평구
         * 계양구
         * 강화군
         * 옹진군
         */
        else {

            String signguCode = getSignguCode(region);

            if (signguCode != null) {

                JsonNode items = callFestivalApi(
                        signguCode,
                        100);

                for (JsonNode item : items) {
                    festivalItems.add(item);
                }
            }
        }

        /*
         * 최종 결과
         *
         * 이미 종료된 행사 제거
         */
        List<FestivalCardResponse> result = new ArrayList<>();

        for (JsonNode item : festivalItems) {

            String startDate = item.path("eventstartdate").asText();

            String endDate = item.path("eventenddate").asText();

            // 이미 종료된 행사 제외
            if (isPastFestival(endDate)) {
                continue;
            }

            result.add(
                    new FestivalCardResponse(
                            item.path("contentid").asText(),
                            item.path("title").asText(),
                            item.path("firstimage").asText(),
                            item.path("addr1").asText(),
                            startDate,
                            endDate));
        }

        return result;
    }

    /*
     * =========================
     * 상세 조회
     * =========================
     */
    public FestivalDetailResponse getDetail(
            String contentId) throws Exception {

        /*
         * 1. 상세 정보 조회
         */
        String detailUrl = "https://apis.data.go.kr/B551011/KorService2/detailCommon2"
                + "?serviceKey=" + serviceKey
                + "&MobileOS=WEB"
                + "&MobileApp=IncheonGuro"
                + "&_type=json"
                + "&contentId=" + contentId;

        String detailResponse = restTemplate.getForObject(
                URI.create(detailUrl),
                String.class);

        JsonNode item = objectMapper
                .readTree(detailResponse)
                .path("response")
                .path("body")
                .path("items")
                .path("item");

        if (item.isArray()) {
            item = item.get(0);
        }

        /*
         * 2. 행사 날짜 조회
         */
        JsonNode dateItem = getFestivalDate(contentId);

        String startDate = "";
        String endDate = "";

        if (dateItem != null) {

            startDate = dateItem.path("eventstartdate").asText();

            endDate = dateItem.path("eventenddate").asText();
        }

        return new FestivalDetailResponse(
                item.path("title").asText(),
                item.path("firstimage").asText(),
                item.path("addr1").asText(),
                item.path("tel").asText(),
                item.path("overview").asText(),
                startDate,
                endDate);
    }

    /*
     * =========================
     * 상세 페이지 날짜 조회
     * =========================
     */
    private JsonNode getFestivalDate(
            String contentId) throws Exception {

        String url = "https://apis.data.go.kr/B551011/KorService2/searchFestival2"
                + "?serviceKey=" + serviceKey
                + "&numOfRows=100"
                + "&pageNo=1"
                + "&MobileOS=WEB"
                + "&MobileApp=IncheonGuro"
                + "&_type=json"
                + "&eventStartDate=20260101"
                + "&eventEndDate=20301231"
                + "&arrange=P";

        String response = restTemplate.getForObject(
                URI.create(url),
                String.class);

        JsonNode items = objectMapper
                .readTree(response)
                .path("response")
                .path("body")
                .path("items")
                .path("item");

        for (JsonNode item : items) {

            if (item.path("contentid")
                    .asText()
                    .equals(contentId)) {

                return item;
            }
        }

        return null;
    }

    /*
     * =========================
     * 행사 목록 API
     * =========================
     */
    private JsonNode callFestivalApi(
            String signguCode,
            int size) throws Exception {

        String url = "https://apis.data.go.kr/B551011/KorService2/searchFestival2"
                + "?serviceKey=" + serviceKey
                + "&numOfRows=" + size
                + "&pageNo=1"
                + "&MobileOS=WEB"
                + "&MobileApp=IncheonGuro"
                + "&_type=json"
                + "&eventStartDate=20260101"
                + "&arrange=P"
                + "&lDongRegnCd=28";

        if (signguCode != null) {

            url += "&lDongSignguCd="
                    + signguCode;
        }

        String response = restTemplate.getForObject(
                URI.create(url),
                String.class);

        return objectMapper
                .readTree(response)
                .path("response")
                .path("body")
                .path("items")
                .path("item");
    }

    /*
     * =========================
     * 법정동 코드 조회
     * =========================
     */
    private String getSignguCode(
            String regionName) throws Exception {

        String url = "https://apis.data.go.kr/B551011/KorService2/ldongCode2"
                + "?serviceKey=" + serviceKey
                + "&numOfRows=100"
                + "&pageNo=1"
                + "&MobileOS=WEB"
                + "&MobileApp=IncheonGuro"
                + "&_type=json"
                + "&lDongRegnCd=28"
                + "&lDongListYn=N";

        String response = restTemplate.getForObject(
                URI.create(url),
                String.class);

        JsonNode items = objectMapper
                .readTree(response)
                .path("response")
                .path("body")
                .path("items")
                .path("item");

        for (JsonNode item : items) {

            if (item.path("name")
                    .asText()
                    .equals(regionName)) {

                return item.path("code")
                        .asText();
            }
        }

        return null;
    }

    /*
     * =========================
     * 영종구 지역인지 확인
     * =========================
     *
     * 기존 중구에서 영종구로 편입된
     * 영종 / 운서 / 용유 지역을 구분
     */
    private boolean isYeongjongArea(
            String address) {

        if (address == null) {
            return false;
        }

        String[] keywords = {

                // 영종 지역
                "영종동",
                "영종1동",
                "영종2동",

                // 운서 지역
                "운서동",
                "운서1동",
                "운서2동",

                // 영종도 법정동
                "운남동",
                "운북동",
                "중산동",

                // 용유 지역
                "용유동",
                "을왕동",
                "왕산동",
                "남북동",
                "덕교동",

                // 무의 지역
                "무의동",
                "무의도"
        };

        for (String keyword : keywords) {

            if (address.contains(keyword)) {
                return true;
            }
        }

        return false;
    }

    /*
     * =========================
     * 서해구 지역인지 확인
     * =========================
     *
     * 기존 서구 남부
     */
    private boolean isSeoHaeArea(
            String address) {

        if (address == null) {
            return false;
        }

        String[] keywords = {

                "검암동",
                "경서동",
                "연희동",

                "청라동",
                "청라1동",
                "청라2동",
                "청라3동",

                "가정동",
                "가정1동",
                "가정2동",
                "가정3동",

                "신현동",
                "원창동",

                "석남동",
                "석남1동",
                "석남2동",
                "석남3동",

                "가좌동",
                "가좌1동",
                "가좌2동",
                "가좌3동",
                "가좌4동"
        };

        for (String keyword : keywords) {

            if (address.contains(keyword)) {
                return true;
            }
        }

        return false;
    }

    /*
     * =========================
     * 검단구 지역인지 확인
     * =========================
     *
     * 기존 서구 북부
     */
    private boolean isGeomdanArea(
            String address) {

        if (address == null) {
            return false;
        }

        String[] keywords = {

                "검단동",

                "불로동",
                "불로대곡동",

                "원당동",

                "당하동",

                "오류동",
                "왕길동",
                "오류왕길동",

                "마전동",

                "아라동",
                "아라1동",
                "아라2동"
        };

        for (String keyword : keywords) {

            if (address.contains(keyword)) {
                return true;
            }
        }

        return false;
    }

    /*
     * =========================
     * 과거 행사 여부
     * =========================
     *
     * 종료일이 오늘보다 이전이면 제외
     *
     * 오늘 종료 → 표시
     * 오늘 진행 중 → 표시
     * 미래 행사 → 표시
     */
    private boolean isPastFestival(
            String endDate) {

        if (endDate == null
                || endDate.isBlank()) {

            return false;
        }

        try {

            LocalDate festivalEndDate = LocalDate.parse(
                    endDate,
                    DATE_FORMATTER);

            return festivalEndDate
                    .isBefore(LocalDate.now());

        } catch (Exception e) {

            return false;
        }
    }
}
