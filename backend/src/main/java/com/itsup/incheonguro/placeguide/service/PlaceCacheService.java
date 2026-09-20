package com.itsup.incheonguro.placeguide.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URI;

// 관광공사 API 원본 응답(JsonNode)을 캐싱하는 전용 서비스
// PlaceGuideService와 분리한 이유: 같은 클래스 안에서 @Cacheable 메서드를 호출하면
// Spring 프록시 방식의 한계로 캐싱이 적용되지 않기 때문에, 별도 클래스로 분리함
@Slf4j
@Service
@RequiredArgsConstructor
public class PlaceCacheService {

  private static final String BASE_URL = "https://apis.data.go.kr/B551011/KorService2";

  private final RestTemplate restTemplate;
  private final ObjectMapper objectMapper;

  @Value("${kto.service-key}")
  private String serviceKey;

  // detailCommon2(공통정보) 캐싱 - contentId 기준, 같은 장소는 재호출 없이 캐시된 값을 씀
  @Cacheable(value = "detailCommon", key = "#contentId")
  public JsonNode getDetailCommon(String contentId) {
    log.debug("[캐시 미스] detailCommon 실제 API 호출: {}", contentId);
    String url = BASE_URL + "/detailCommon2"
        + "?serviceKey=" + serviceKey
        + "&MobileOS=WEB"
        + "&MobileApp=IncheonGuro"
        + "&_type=json"
        + "&contentId=" + contentId;
    return callApi(url);
  }

  // detailIntro2(소개정보) 캐싱 - contentId + contentTypeId 조합 기준
  @Cacheable(value = "detailIntro", key = "#contentId + '_' + #contentTypeId")
  public JsonNode getDetailIntro(String contentId, String contentTypeId) {
    String url = BASE_URL + "/detailIntro2"
        + "?serviceKey=" + serviceKey
        + "&MobileOS=WEB"
        + "&MobileApp=IncheonGuro"
        + "&_type=json"
        + "&contentId=" + contentId
        + "&contentTypeId=" + contentTypeId;
    return callApi(url);
  }

  // detailImage2(이미지 목록) 캐싱 - contentId 기준
  @Cacheable(value = "detailImages", key = "#contentId")
  public JsonNode getDetailImages(String contentId) {
    String url = BASE_URL + "/detailImage2"
        + "?serviceKey=" + serviceKey
        + "&MobileOS=WEB"
        + "&MobileApp=IncheonGuro"
        + "&_type=json"
        + "&contentId=" + contentId
        + "&imageYN=Y";
    return callApiForItems(url);
  }

  // detailInfo2(반복정보) 캐싱 - contentId + contentTypeId 조합 기준
  @Cacheable(value = "detailInfo", key = "#contentId + '_' + #contentTypeId")
  public JsonNode getDetailInfo(String contentId, String contentTypeId) {
    String url = BASE_URL + "/detailInfo2"
        + "?serviceKey=" + serviceKey
        + "&MobileOS=WEB"
        + "&MobileApp=IncheonGuro"
        + "&_type=json"
        + "&contentId=" + contentId
        + "&contentTypeId=" + contentTypeId;
    return callApiForItems(url);
  }

  private JsonNode callApiForItems(String url) {
    String response = restTemplate.getForObject(URI.create(url), String.class);
    try {
      return objectMapper.readTree(response)
          .path("response")
          .path("body")
          .path("items")
          .path("item");
    } catch (Exception e) {
      throw new RuntimeException("관광공사 API 응답 파싱 실패", e);
    }
  }

  private JsonNode callApi(String url) {
    JsonNode item = callApiForItems(url);
    return item.isArray() ? item.get(0) : item;
  }
}
