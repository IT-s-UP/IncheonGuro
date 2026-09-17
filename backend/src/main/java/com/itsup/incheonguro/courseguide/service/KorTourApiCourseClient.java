package com.itsup.incheonguro.courseguide.service;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import tools.jackson.databind.JsonNode;

// 한국관광공사 KorService2 API 중 여행코스(contentTypeId=25) 관련 호출만 담당하는 클라이언트
// serviceKey는 UriComponentsBuilder로 재인코딩하지 않고 문자열 그대로 붙임
// (공공데이터포털 서비스키가 이미 인코딩된 형태라, .encode()를 걸면 이중 인코딩되어 인증 실패남 - PlaceGuideService와 동일한 방식으로 통일)
@Component
public class KorTourApiCourseClient {

  private static final String BASE_URL = "https://apis.data.go.kr/B551011/KorService2";
  private static final String INCHEON_AREA_CODE = "2";
  private static final String COURSE_CONTENT_TYPE_ID = "25";

  private final RestTemplate restTemplate;

  @Value("${kto.service-key}")
  private String serviceKey;

  public KorTourApiCourseClient(RestTemplate restTemplate) {
    this.restTemplate = restTemplate;
  }

  // 인천 지역 여행코스 전체 목록
  public List<JsonNode> getCourseList(int numOfRows) {
    String url = BASE_URL + "/areaBasedList2"
        + "?serviceKey=" + serviceKey
        + "&MobileApp=IncheonGuro"
        + "&MobileOS=ETC"
        + "&_type=json"
        + "&numOfRows=" + numOfRows
        + "&pageNo=1"
        + "&contentTypeId=" + COURSE_CONTENT_TYPE_ID
        + "&areaCode=" + INCHEON_AREA_CODE;

    return toItemList(request(url));
  }

  // 키워드로 여행코스 검색
  public List<JsonNode> searchCourses(String keyword, int numOfRows) {
    String encodedKeyword = URLEncoder.encode(keyword, StandardCharsets.UTF_8);
    String url = BASE_URL + "/searchKeyword2"
        + "?serviceKey=" + serviceKey
        + "&MobileApp=IncheonGuro"
        + "&MobileOS=ETC"
        + "&_type=json"
        + "&numOfRows=" + numOfRows
        + "&pageNo=1"
        + "&contentTypeId=" + COURSE_CONTENT_TYPE_ID
        + "&areaCode=" + INCHEON_AREA_CODE
        + "&keyword=" + encodedKeyword;

    return toItemList(request(url));
  }

  // 콘텐츠(코스 자체 또는 정거장) 공통정보 - 제목/주소/좌표
  public JsonNode getDetailCommon(String contentId) {
    String url = BASE_URL + "/detailCommon2"
        + "?serviceKey=" + serviceKey
        + "&MobileApp=IncheonGuro"
        + "&MobileOS=ETC"
        + "&_type=json"
        + "&contentId=" + contentId;

    List<JsonNode> items = toItemList(request(url));
    return items.isEmpty() ? null : items.get(0);
  }

  // 코스에 속한 정거장 목록 (subname/subnum/subcontentid 등)
  public List<JsonNode> getCourseSubItems(String contentId) {
    String url = BASE_URL + "/detailInfo2"
        + "?serviceKey=" + serviceKey
        + "&MobileApp=IncheonGuro"
        + "&MobileOS=ETC"
        + "&_type=json"
        + "&contentId=" + contentId
        + "&contentTypeId=" + COURSE_CONTENT_TYPE_ID;

    List<JsonNode> items = toItemList(request(url));
    items.sort(Comparator.comparingInt(i -> i.path("subnum").asInt(0)));
    return items;
  }

  private JsonNode request(String url) {
    JsonNode body = restTemplate.getForObject(URI.create(url), JsonNode.class);
    if (body == null) {
      throw new IllegalStateException("관광공사 API 응답이 비어 있습니다.");
    }
    return body.path("response").path("body").path("items").path("item");
  }

  // 결과가 1건이면 객체로, 여러 건이면 배열로 오는 TourAPI 특성을 리스트로 통일
  private List<JsonNode> toItemList(JsonNode itemNode) {
    if (itemNode.isMissingNode() || itemNode.isNull()) {
      return List.of();
    }
    if (itemNode.isArray()) {
      List<JsonNode> list = new ArrayList<>();
      itemNode.forEach(list::add);
      return list;
    }
    return List.of(itemNode);
  }
}
