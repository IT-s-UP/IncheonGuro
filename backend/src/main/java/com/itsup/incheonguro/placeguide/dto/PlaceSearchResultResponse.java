package com.itsup.incheonguro.placeguide.dto;

import com.itsup.incheonguro.courseguide.dto.CourseSummaryResponse;
import lombok.Getter;
import java.util.List;

// 통합 검색 결과 조회에서 사용하는 응답 - 장소와 코스를 한 번에 담음
@Getter
public class PlaceSearchResultResponse {

  // 검색어와 일치한 장소들의 목록
  private List<PlaceSummaryResponse> places;

  // 검색어와 일치한 코스들의 목록
  private List<CourseSummaryResponse> courses;

  // 장소 리스트, 코스 리스트를 각각 받아서 하나로 묶어주는 생성자
  public PlaceSearchResultResponse(List<PlaceSummaryResponse> places, List<CourseSummaryResponse> courses) {
    this.places = places;
    this.courses = courses;
  }
}
