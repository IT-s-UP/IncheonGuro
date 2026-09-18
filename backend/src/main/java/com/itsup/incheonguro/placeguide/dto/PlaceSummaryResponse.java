package com.itsup.incheonguro.placeguide.dto;

import com.fasterxml.jackson.databind.JsonNode;
import com.itsup.incheonguro.placeguide.entity.District;
import com.itsup.incheonguro.placeguide.entity.PlaceCategory;
import lombok.Getter;

// 장소 목록 / 필터 / 북마크 / 내주변 탭 조회에서 사용하는 응답
@Getter
public class PlaceSummaryResponse {

    private String placeId;
    private String title;
    private String subtitle;
    private District district;
    private PlaceCategory category;

    /*
     * 관광공사 데이터에 좌표가 없는 경우가 있을 수 있으므로
     * primitive double이 아닌 Double 사용
     */
    private Double latitude;
    private Double longitude;

    // 대표 이미지 URL
    private String imageUrl;

    // 관광공사 API 중분류 코드
    private String lclsSystm2;

    // 관광공사 API 대분류 코드
    private String lclsSystm1;

    /*
     * Service에서 직접 생성할 때 사용하는 생성자
     */
    public PlaceSummaryResponse(
            String placeId,
            String title,
            String subtitle,
            District district,
            PlaceCategory category,
            Double latitude,
            Double longitude,
            String imageUrl,
            String lclsSystm2,
            String lclsSystm1) {

        this.placeId = placeId;
        this.title = title;
        this.subtitle = subtitle;
        this.district = district;
        this.category = category;
        this.latitude = latitude;
        this.longitude = longitude;
        this.imageUrl = imageUrl;
        this.lclsSystm2 = lclsSystm2;
        this.lclsSystm1 = lclsSystm1;
    }

    /*
     * 관광공사 API 응답의 item 하나를
     * 우리 DTO로 변환
     */
    public static PlaceSummaryResponse from(JsonNode item) {

        String contentTypeId = item.path("contenttypeid").asText("");

        String lclsSystm2 = item.path("lclsSystm2").asText("");

        String signguCd = item.path("lDongSignguCd").asText("");

        /*
         * 좌표가 없으면 null
         */
        Double latitude = getDoubleValue(
                item.path("mapy"));

        Double longitude = getDoubleValue(
                item.path("mapx"));

        return new PlaceSummaryResponse(
                item.path("contentid").asText(""),
                item.path("title").asText(""),
                item.path("addr1").asText(""),
                District.fromSignguCd(signguCd),
                PlaceCategory.fromApiCode(
                        contentTypeId,
                        lclsSystm2),
                latitude,
                longitude,
                item.path("firstimage").asText(""),
                lclsSystm2,
                item.path("lclsSystm1").asText(""));
    }

    /*
     * 좌표를 안전하게 Double로 변환
     */
    private static Double getDoubleValue(JsonNode node) {

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
}
