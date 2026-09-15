package com.itsup.incheonguro.courseguide.service;

import java.util.List;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import tools.jackson.databind.JsonNode;

// placeguide의 PlaceCacheService와 같은 이유(같은 클래스 안에서 @Cacheable 메서드를 호출하면
// Spring 프록시 한계로 캐싱이 안 먹힘)로 별도 클래스로 분리함
@Service
public class CourseCacheService {

  private final KorTourApiCourseClient client;

  public CourseCacheService(KorTourApiCourseClient client) {
    this.client = client;
  }

  // 인천 여행코스 전체 목록. 자주 안 바뀌는 데이터라 캐싱
  @Cacheable(value = "courseAreaList")
  public List<JsonNode> getCourseList() {
    return client.getCourseList(100); // 인천 코스 전체가 100개 이내라고 가정. 초과하면 페이지네이션 추가 필요
  }

  // 콘텐츠 공통정보. 코스 자체 상세뿐 아니라, 정거장(subcontentid)의 좌표 조회에도 재사용됨
  @Cacheable(value = "courseDetailCommon", key = "#contentId")
  public JsonNode getDetailCommon(String contentId) {
    return client.getDetailCommon(contentId);
  }

  // 코스별 정거장 목록
  @Cacheable(value = "courseSubItems", key = "#contentId")
  public List<JsonNode> getCourseSubItems(String contentId) {
    return client.getCourseSubItems(contentId);
  }
}
