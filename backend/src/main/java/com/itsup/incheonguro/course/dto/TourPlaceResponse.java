package com.itsup.incheonguro.course.dto;


import java.math.BigDecimal;
import java.util.List;
import tools.jackson.databind.JsonNode;

public record TourPlaceResponse(String contentId, String contentTypeId, String name,
        String address, BigDecimal longitude, BigDecimal latitude, String imageUrl,
        String telephone) {
    public record Page(List<TourPlaceResponse> places, int page, int size, int totalCount) {}

    // introduction의 필드는 관광지/음식점 등 contentTypeId별로 다릅니다.
    // overview/introduction에 포함된 외부 HTML은 프론트에서 그대로 삽입하지 않습니다.
    public record Detail(TourPlaceResponse place, String overview, JsonNode introduction,
            List<Image> images) {}

    public record Image(String url, String thumbnailUrl, String title) {}
}
