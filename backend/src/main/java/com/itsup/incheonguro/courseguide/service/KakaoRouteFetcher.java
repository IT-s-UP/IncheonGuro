package com.itsup.incheonguro.courseguide.service;

import java.net.URI;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.RequestEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriComponentsBuilder;

// import com.fasterxml.jackson.databind.JsonNode;
import tools.jackson.databind.JsonNode;

/**
 * 카카오맵/카카오모빌리티 경로 조회 API를 직접 호출하는 클라이언트.
 *
 * courseroute.CourseRouteService(팀원 구현)의 아래 좋은 점들을 그대로 가져와서 적용함:
 * - 요청/응답 타임아웃 처리
 * - 429(트래픽 초과) 응답을 사용자 친화적 메시지로 변환
 * - 좌표값 유효성 검사(위도/경도 범위)
 * - 크리덴셜/원본 에러 메시지를 그대로 노출하지 않고 감싸서 반환
 *
 * 여기에 추가로 우리 서비스에 필요한 기능을 더함:
 * - 도보/자전거는 경유지(via)를 최대 5개까지 한 번의 호출로 처리 (코스 장소가 여러 개일 때 API 호출량 절약)
 * - 지도 위에 경로선을 그릴 수 있도록 좌표(polyline) 목록까지 추출
 */
@Component
public class KakaoRouteFetcher {

  private static final String WALK_URL = "https://dapi.kakao.com/v2/routing/walk";
  private static final String BICYCLE_URL = "https://dapi.kakao.com/v2/routing/bicycle";
  private static final String TRANSIT_URL = "https://dapi.kakao.com/v2/routing/publictraffic";
  private static final String CAR_URL = "https://apis-navi.kakaomobility.com/v1/directions";

  private static final Set<String> VALID_MODES = Set.of("walk", "bicycle", "transit", "car");

  // 공용 RestTemplate 빈이랑 별도로, 타임아웃이 걸린 전용 RestTemplate을 만들어 씀
  // (다른 곳에서 쓰는 RestTemplate 빈에 영향 안 주려고 분리)
  private final RestTemplate restTemplate;

  @Value("${kakao.rest-api-key}")
  private String kakaoRestApiKey;

  public KakaoRouteFetcher() {
    SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
    factory.setConnectTimeout((int) Duration.ofSeconds(5).toMillis());
    factory.setReadTimeout((int) Duration.ofSeconds(12).toMillis());
    this.restTemplate = new RestTemplate(factory);
  }

  // 경로 하나(구간 여러 개 포함 가능)를 담는 결과
  public record RouteResult(int distanceMeters, int durationSeconds, List<double[]> pathPoints) {
  }

  // ===== 도보 / 자전거 - 경유지 지원 (한 번에 최대 7지점: 출발+경유5+도착) =====
  // legs[] 배열이 지점 쌍마다 구간별로 나눠져서 오므로, 구간별 RouteResult 리스트로 반환
  public List<RouteResult> callWalkLegs(List<double[]> points) {
    return callWalkOrBicycleLegs(WALK_URL, points);
  }

  public List<RouteResult> callBicycleLegs(List<double[]> points) {
    return callWalkOrBicycleLegs(BICYCLE_URL, points);
  }

  private List<RouteResult> callWalkOrBicycleLegs(String baseUrl, List<double[]> points) {
    validateCoordList(points);
    if (points.size() > 7) {
      throw new IllegalArgumentException("한 번에 최대 7개 지점(출발+경유5+도착)까지 지원합니다.");
    }

    double[] start = points.get(0);
    double[] end = points.get(points.size() - 1);
    List<double[]> via = points.subList(1, points.size() - 1);

    UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(baseUrl)
        .queryParam("start_x", start[0])
        .queryParam("start_y", start[1])
        .queryParam("end_x", end[0])
        .queryParam("end_y", end[1]);

    if (!via.isEmpty()) {
      builder.queryParam("via_x", joinCoord(via, 0));
      builder.queryParam("via_y", joinCoord(via, 1));
    }

    JsonNode response = request(builder.build().toUri().toString());

    String status = response.path("status").asText();
    if (!"OK".equals(status)) {
      throw upstream("경로를 찾지 못했습니다. (" + status + ")");
    }

    List<RouteResult> legs = new ArrayList<>();
    for (JsonNode leg : response.path("route").path("legs")) {
      int distance = leg.path("properties").path("distance").asInt();
      int time = leg.path("properties").path("time").asInt();
      legs.add(new RouteResult(distance, time, extractPoints(leg.path("steps"))));
    }
    return legs;
  }

  // ===== 대중교통 - 경유지 미지원, 좌표 한 쌍만 =====
  public RouteResult callTransit(double[] start, double[] end) {
    validateCoord(start);
    validateCoord(end);
    if (sameCoord(start, end)) {
      return new RouteResult(0, 0, List.of());
    }

    String url = UriComponentsBuilder.fromUriString(TRANSIT_URL)
        .queryParam("start_x", start[0])
        .queryParam("start_y", start[1])
        .queryParam("end_x", end[0])
        .queryParam("end_y", end[1])
        .build().toUri().toString();

    JsonNode response = request(url);

    String status = response.path("status").asText();
    if (!"OK".equals(status)) {
      throw upstream("대중교통 경로를 찾지 못했습니다. (" + status + ")");
    }

    // 후보 경로 중 totalTime이 가장 짧은 것 하나 선택
    JsonNode fastest = null;
    int minTime = Integer.MAX_VALUE;
    for (JsonNode route : response.path("routes")) {
      int time = route.path("properties").path("totalTime").asInt();
      if (time < minTime) {
        minTime = time;
        fastest = route;
      }
    }
    if (fastest == null) {
      throw upstream("대중교통 경로를 찾지 못했습니다.");
    }

    int distance = fastest.path("properties").path("totalDistance").asInt();
    List<double[]> points = new ArrayList<>();
    for (JsonNode step : fastest.path("steps")) {
      points.addAll(extractStepPoints(step));
    }
    return new RouteResult(distance, minTime, points);
  }

  // ===== 자동차 - 카카오모빌리티 Directions API, 경유지 미지원, 좌표 한 쌍만 =====
  // 승인 전까지는 호출하면 401/403 등으로 실패함. CourseRouteAssembler에서 구간별로 실패 처리함
  public RouteResult callCar(double[] start, double[] end) {
    validateCoord(start);
    validateCoord(end);
    if (sameCoord(start, end)) {
      return new RouteResult(0, 0, List.of());
    }

    String url = UriComponentsBuilder.fromUriString(CAR_URL)
        .queryParam("origin", start[0] + "," + start[1])
        .queryParam("destination", end[0] + "," + end[1])
        .queryParam("summary", true)
        .build().toUri().toString();

    JsonNode response = request(url);

    for (JsonNode route : response.path("routes")) {
      if (route.path("result_code").asInt(-1) == 0) {
        JsonNode summary = route.path("summary");
        int duration = summary.path("duration").asInt();
        int distance = summary.path("distance").asInt();
        // TODO: 카카오모빌리티 응답의 sections[].roads[].vertexes에서 폴리라인을 뽑을 수 있음.
        // 지금은 승인 전이라 실제 응답을 못 받아봐서 폴리라인 파싱은 일단 보류, 거리/시간만 사용
        return new RouteResult(distance, duration, List.of());
      }
    }
    throw upstream("자동차 경로를 찾지 못했습니다.");
  }

  // ===== 공통 =====

  private JsonNode request(String url) {
    HttpHeaders headers = new HttpHeaders();
    headers.set("Authorization", "KakaoAK " + kakaoRestApiKey);

    RequestEntity<Void> requestEntity = new RequestEntity<>(headers, HttpMethod.GET, URI.create(url));

    try {
      JsonNode body = restTemplate.exchange(requestEntity, JsonNode.class).getBody();
      if (body == null) {
        throw upstream("경로 조회 응답이 비어 있습니다.");
      }
      return body;
    } catch (org.springframework.web.client.HttpClientErrorException.TooManyRequests e) {
      throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "길찾기 요청이 많습니다. 잠시 후 다시 시도해주세요.");
    } catch (RestClientException e) {
      // 크리덴셜이나 원본 요청 상세는 노출하지 않고 감싸서 던짐
      throw upstream("경로 조회 중 오류가 발생했습니다.");
    }
  }

  private ResponseStatusException upstream(String message) {
    return new ResponseStatusException(HttpStatus.BAD_GATEWAY, message);
  }

  private void validateCoordList(List<double[]> points) {
    if (points.size() < 2) {
      throw new IllegalArgumentException("경로 조회에는 출발지/도착지 최소 2개 좌표가 필요합니다.");
    }
    points.forEach(this::validateCoord);
  }

  private void validateCoord(double[] coord) {
    double x = coord[0]; // 경도
    double y = coord[1]; // 위도
    if (!valid(x, 180) || !valid(y, 90)) {
      throw new IllegalArgumentException("유효하지 않은 좌표입니다: x=" + x + ", y=" + y);
    }
  }

  private boolean valid(double value, int limit) {
    return Double.isFinite(value) && Math.abs(value) <= limit;
  }

  private boolean sameCoord(double[] a, double[] b) {
    return a[0] == b[0] && a[1] == b[1];
  }

  private String joinCoord(List<double[]> via, int idx) {
    StringBuilder sb = new StringBuilder();
    for (int i = 0; i < via.size(); i++) {
      if (i > 0)
        sb.append(",");
      sb.append(via.get(i)[idx]);
    }
    return sb.toString();
  }

  private List<double[]> extractPoints(JsonNode steps) {
    List<double[]> points = new ArrayList<>();
    for (JsonNode step : steps) {
      points.addAll(extractStepPoints(step));
    }
    return points;
  }

  private List<double[]> extractStepPoints(JsonNode step) {
    List<double[]> points = new ArrayList<>();
    for (JsonNode point : step.path("path").path("points")) {
      points.add(new double[] { point.get(0).asDouble(), point.get(1).asDouble() });
    }
    return points;
  }
}
