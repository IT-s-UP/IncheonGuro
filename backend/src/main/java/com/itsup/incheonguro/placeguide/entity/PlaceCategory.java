package com.itsup.incheonguro.placeguide.entity;

import java.util.List;

// 장소 유형
public enum PlaceCategory {

    ATTRACTION,
    CULTURE,
    LEISURE,
    CAFE,
    RESTAURANT,
    LODGING,
    SHOPPING;

    /*
     * 한국관광공사 API의
     * contentTypeId + lclsSystm2를
     * 우리 카테고리로 변환
     *
     * 12 = 관광지
     * 14 = 문화시설
     * 28 = 레포츠
     * 32 = 숙박
     * 38 = 쇼핑
     * 39 = 음식점
     *
     * 39 중 FD05 = 카페
     */
    public static PlaceCategory fromApiCode(
            String contentTypeId,
            String lclsSystm2) {

        return switch (contentTypeId) {

            case "12" ->
                ATTRACTION;

            case "14" ->
                CULTURE;

            case "28" ->
                LEISURE;

            case "32" ->
                LODGING;

            case "38" ->
                SHOPPING;

            case "39" ->
                "FD05".equals(lclsSystm2)
                        ? CAFE
                        : RESTAURANT;

            default ->
                null;
        };
    }

    /*
     * 카테고리별로 관광공사 API에서
     * 조회해야 하는 contentTypeId
     */
    public List<String> toContentTypeIds() {

        return switch (this) {

            case ATTRACTION ->
                List.of("12");

            case CULTURE ->
                List.of("14");

            case LEISURE ->
                List.of("28");

            /*
             * 카페와 음식점은
             * 관광공사 API에서 둘 다 39로 들어옴
             *
             * 이후 lclsSystm2로
             * CAFE / RESTAURANT를 구분
             */
            case CAFE, RESTAURANT ->
                List.of("39");

            case LODGING ->
                List.of("32");

            case SHOPPING ->
                List.of("38");
        };
    }
}
