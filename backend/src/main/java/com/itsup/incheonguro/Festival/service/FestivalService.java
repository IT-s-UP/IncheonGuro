package com.itsup.incheonguro.Festival.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import com.itsup.incheonguro.Festival.dto.*;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FestivalService {

    private final RestTemplate restTemplate;

    private final ObjectMapper objectMapper;

    @Value("${kto.service-key}")
    private String serviceKey;

    /*
     * 인기 행사 TOP5
     */
    public List<PopularFestivalResponse> getPopularFestivals()
            throws Exception {

        JsonNode items = callFestivalApi(null, 5);

        List<PopularFestivalResponse> result = new ArrayList<>();

        for (JsonNode item : items) {

            result.add(
                    new PopularFestivalResponse(
                            item.path("contentid").asText(),
                            item.path("title").asText(),
                            item.path("firstimage").asText(),
                            item.path("eventstartdate").asText(),
                            item.path("eventenddate").asText()));
        }

        return result;
    }

    /*
     * 구/군별 행사 조회
     */
    public List<FestivalCardResponse> getFestivalByRegion(
            String region) throws Exception {

        String signguCode = getSignguCode(region);

        JsonNode items = callFestivalApi(signguCode, 20);

        List<FestivalCardResponse> result = new ArrayList<>();

        for (JsonNode item : items) {

            result.add(
                    new FestivalCardResponse(
                            item.path("contentid").asText(),
                            item.path("title").asText(),
                            item.path("firstimage").asText(),
                            item.path("addr1").asText(),
                            item.path("eventstartdate").asText(),
                            item.path("eventenddate").asText()));
        }

        return result;

    }

    /*
     * 상세 조회
     *
     * detailCommon2
     * - 제목
     * - 이미지
     * - 주소
     * - 전화번호
     * - 설명
     *
     * searchFestival2
     * - 시작일
     * - 종료일
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

                endDate

        );

    }

    /*
     * 상세 페이지 날짜 조회용
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
                + "&eventEndDate=20261231"
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
     * 행사 목록 API
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

            url += "&lDongSignguCd=" + signguCode;

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
     * 법정동 코드 조회
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

}
