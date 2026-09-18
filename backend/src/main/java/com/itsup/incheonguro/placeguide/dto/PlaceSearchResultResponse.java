package com.itsup.incheonguro.placeguide.dto;

import lombok.Getter;

import java.util.List;

// 장소 검색 결과 조회에서 사용하는 응답
@Getter
public class PlaceSearchResultResponse {

    // 검색어와 일치한 장소들의 목록
    private final List<PlaceSummaryResponse> places;

    public PlaceSearchResultResponse(
            List<PlaceSummaryResponse> places) {

        this.places = places;
    }
}
