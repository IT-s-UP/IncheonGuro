package com.itsup.incheonguro.course.service;

import com.itsup.incheonguro.course.dto.TourPlaceResponse;

import java.math.BigDecimal;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpTimeoutException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

/** TourAPI KorService2 직접 조회. DB 조회/저장 및 추천 로직은 수행하지 않습니다. */
@Service
public class TourPlaceService {
    private static final String BASE_URL = "https://apis.data.go.kr/B551011/KorService2/";
    private final String serviceKey;
    private final ObjectMapper mapper;
    private final HttpClient client = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5)).build();

    // 공공데이터포털의 Decoding 인증키를 실행 환경에 설정합니다. 키를 코드에 저장하지 않습니다.
    public TourPlaceService(@Value("${TOUR_API_SERVICE_KEY:}") String serviceKey, ObjectMapper mapper) {
        this.serviceKey = serviceKey.trim();
        this.mapper = mapper;
    }

    public TourPlaceResponse.Page search(String keyword, String contentTypeId, int page, int size) {
        Map<String, String> params = new LinkedHashMap<>();
        params.put("areaCode", "2"); // TourAPI 인천 지역코드
        params.put("pageNo", String.valueOf(page));
        params.put("numOfRows", String.valueOf(size));
        params.put("arrange", "A");
        if (contentTypeId != null) params.put("contentTypeId", contentTypeId);
        boolean hasKeyword = keyword != null && !keyword.isBlank();
        if (hasKeyword) params.put("keyword", keyword.trim());
        JsonNode body = fetch(hasKeyword ? "searchKeyword2" : "areaBasedList2", params);
        return new TourPlaceResponse.Page(items(body).stream().map(this::place).toList(),
                page, size, body.path("totalCount").asInt(0));
    }

    public TourPlaceResponse.Detail detail(String contentId) {
        List<JsonNode> common = items(fetch("detailCommon2", Map.of(
                "contentId", contentId)));
        if (common.isEmpty()) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "장소를 찾을 수 없습니다.");
        JsonNode item = common.get(0);
        String type = text(item, "contenttypeid");
        if (type.isBlank()) throw upstreamError();
        List<JsonNode> introduction = items(fetch("detailIntro2", Map.of(
                "contentId", contentId, "contentTypeId", type)));
        List<TourPlaceResponse.Image> images = items(fetch("detailImage2", Map.of(
                "contentId", contentId, "numOfRows", "100")))
                .stream().map(image -> new TourPlaceResponse.Image(text(image, "originimgurl"),
                        text(image, "smallimageurl"), text(image, "imgname"))).toList();
        return new TourPlaceResponse.Detail(place(item), text(item, "overview"),
                introduction.isEmpty() ? mapper.createObjectNode() : introduction.get(0), images);
    }

    private JsonNode fetch(String operation, Map<String, String> params) {
        if (serviceKey.isBlank()) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                "장소 조회용 API 인증키가 설정되지 않았습니다.");
        Map<String, String> query = new LinkedHashMap<>();
        query.put("serviceKey", serviceKey);
        query.put("MobileOS", "ETC");
        query.put("MobileApp", "IncheonGuro");
        query.put("_type", "json");
        query.putAll(params);
        String encoded = query.entrySet().stream()
                .map(e -> e.getKey() + "=" + URLEncoder.encode(e.getValue(), StandardCharsets.UTF_8))
                .collect(java.util.stream.Collectors.joining("&"));
        try {
            HttpRequest request = HttpRequest.newBuilder(URI.create(BASE_URL + operation + "?" + encoded))
                    .timeout(Duration.ofSeconds(10)).header("Accept", "application/json").GET().build();
            HttpResponse<String> response = client.send(request,
                    HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            if (response.statusCode() != 200) throw upstreamError();
            JsonNode root = mapper.readTree(response.body());
            if (root == null) throw upstreamError();
            JsonNode envelope = root.path("response");
            if (!"0000".equals(envelope.path("header").path("resultCode").asText())) throw upstreamError();
            JsonNode body = envelope.path("body");
            if (!body.isObject()) throw upstreamError();
            return body;
        } catch (HttpTimeoutException e) {
            throw new ResponseStatusException(HttpStatus.GATEWAY_TIMEOUT, "장소 정보 제공 기관의 응답이 지연되고 있습니다.");
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "장소 조회가 중단되었습니다.");
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            // 인증키가 포함될 수 있는 외부 URL/예외 메시지는 응답이나 로그에 노출하지 않습니다.
            throw upstreamError();
        }
    }

    private List<JsonNode> items(JsonNode body) {
        JsonNode node = body.path("items").path("item");
        if (node.isMissingNode() || node.isNull() || node.isTextual() && node.asText().isBlank()) return List.of();
        if (node.isObject()) return List.of(node);
        if (!node.isArray()) throw upstreamError();
        List<JsonNode> result = new ArrayList<>();
        node.forEach(result::add);
        return result;
    }

    private TourPlaceResponse place(JsonNode item) {
        return new TourPlaceResponse(text(item, "contentid"), text(item, "contenttypeid"),
                text(item, "title"), (text(item, "addr1") + " " + text(item, "addr2")).trim(),
                coordinate(item, "mapx"), coordinate(item, "mapy"),
                text(item, "firstimage"), text(item, "tel"));
    }

    private BigDecimal coordinate(JsonNode item, String field) {
        String value = text(item, field);
        if (value.isBlank()) return null;
        try { return new BigDecimal(value); }
        catch (NumberFormatException e) { throw upstreamError(); }
    }

    private String text(JsonNode item, String field) { return item.path(field).asText(""); }

    private ResponseStatusException upstreamError() {
        return new ResponseStatusException(HttpStatus.BAD_GATEWAY, "장소 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
    }
}
