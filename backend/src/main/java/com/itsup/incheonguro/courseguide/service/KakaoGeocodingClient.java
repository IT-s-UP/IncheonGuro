package com.itsup.incheonguro.courseguide.service;

import java.net.URI;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.RequestEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import tools.jackson.databind.JsonNode;

import lombok.extern.slf4j.Slf4j;

// 카카오맵 "주소로 좌표 변환" API 호출 담당 (1회성 마이그레이션에서 사용)
// 정식 도로명/지번이 아닌 관광지 애칭(예: "월미문화의거리") 등은 주소 검색으로 안 잡혀서,
// 실패 시 "키워드로 장소 검색" API로 한 번 더 시도하는 폴백을 둠
@Slf4j
@Component
public class KakaoGeocodingClient {

  private static final String ADDRESS_URL = "https://dapi.kakao.com/v2/local/search/address.json";
  private static final String KEYWORD_URL = "https://dapi.kakao.com/v2/local/search/keyword.json";

  private final RestTemplate restTemplate;

  @Value("${kakao.rest-api-key}")
  private String kakaoRestApiKey;

  public KakaoGeocodingClient(RestTemplate restTemplate) {
    this.restTemplate = restTemplate;
  }

  // 주소 문자열로 좌표(x=경도, y=위도)를 찾는다. 결과 없으면 null 반환
  public double[] geocode(String address) {
    double[] result = geocodeByAddress(address);
    if (result != null) {
      return result;
    }

    // 주소 검색으로 못 찾으면, 키워드 검색으로 한 번 더 시도
    // (관광지 애칭처럼 정식 도로명/지번이 아닌 경우를 위한 폴백)
    log.info("주소 검색 실패, 키워드 검색으로 재시도: {}", address);
    return geocodeByKeyword(address);
  }

  private double[] geocodeByAddress(String address) {
    String url = UriComponentsBuilder.fromUriString(ADDRESS_URL)
        .queryParam("query", address)
        .encode()
        .build().toUri().toString();

    JsonNode response = request(url);
    JsonNode documents = response.path("documents");
    if (documents.isEmpty()) {
      return null;
    }

    JsonNode first = documents.get(0);
    double x = first.path("x").asDouble(); // 경도
    double y = first.path("y").asDouble(); // 위도
    return new double[] { x, y };
  }

  private double[] geocodeByKeyword(String keyword) {
    String url = UriComponentsBuilder.fromUriString(KEYWORD_URL)
        .queryParam("query", keyword)
        .encode()
        .build().toUri().toString();

    JsonNode response = request(url);
    JsonNode documents = response.path("documents");
    if (documents.isEmpty()) {
      return null;
    }

    JsonNode first = documents.get(0);
    // 키워드 검색 응답은 x/y가 문자열로 옴 (주소 검색은 숫자)
    double x = Double.parseDouble(first.path("x").asString());
    double y = Double.parseDouble(first.path("y").asString());
    return new double[] { x, y };
  }

  private JsonNode request(String url) {
    HttpHeaders headers = new HttpHeaders();
    headers.set("Authorization", "KakaoAK " + kakaoRestApiKey);

    RequestEntity<Void> requestEntity = new RequestEntity<>(headers, HttpMethod.GET, URI.create(url));
    return restTemplate.exchange(requestEntity, JsonNode.class).getBody();
  }
}
