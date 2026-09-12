package com.itsup.incheonguro.courseroute;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpTimeoutException;
import java.time.Duration;
import java.util.Set;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@Service
public class CourseRouteService {
    private final String key;
    private final ObjectMapper mapper;
    private final HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();

    public CourseRouteService(@Value("${KAKAO_REST_API_KEY:}") String key, ObjectMapper mapper) {
        this.key = key.trim();
        this.mapper = mapper;
    }

    // Kakao reports seconds and metres. Transit selects the shortest total travel time.
    public record Summary(long durationSeconds, long distanceMeters) {}

    public Summary find(String mode, double startX, double startY, double endX, double endY) {
        if (!Set.of("walk", "transit", "bicycle", "car").contains(mode)
                || !valid(startX, 180) || !valid(endX, 180)
                || !valid(startY, 90) || !valid(endY, 90)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "이동수단과 좌표를 확인해주세요.");
        }
        if (key.isBlank()) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                "길찾기 서비스가 준비되지 않았습니다.");
        if (startX == endX && startY == endY) return new Summary(0, 0);
        String url = mode.equals("car")
                ? "https://apis-navi.kakaomobility.com/v1/directions?origin=" + startX + "," + startY
                    + "&destination=" + endX + "," + endY + "&summary=true"
                : "https://dapi.kakao.com/v2/routing/" + (mode.equals("transit") ? "publictraffic" : mode)
                    + "?start_x=" + startX + "&start_y=" + startY + "&end_x=" + endX + "&end_y=" + endY;
        try {
            HttpRequest request = HttpRequest.newBuilder(URI.create(url)).timeout(Duration.ofSeconds(12))
                    .header("Authorization", "KakaoAK " + key).header("Accept", "application/json").GET().build();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 429) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "길찾기 요청이 많습니다. 잠시 후 다시 시도해주세요.");
            if (response.statusCode() != 200) throw upstream();
            JsonNode root = mapper.readTree(response.body());
            if (root == null) throw upstream();
            return summarize(mode, root);
        } catch (HttpTimeoutException exception) {
            throw new ResponseStatusException(HttpStatus.GATEWAY_TIMEOUT, "길찾기 응답이 지연되고 있습니다.");
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "길찾기가 중단되었습니다.");
        } catch (ResponseStatusException exception) {
            throw exception;
        } catch (Exception exception) {
            // Do not expose credentials or upstream request details.
            throw upstream();
        }
    }

    private Summary summarize(String mode, JsonNode root) {
        if (mode.equals("transit")) {
            Summary best = null;
            for (JsonNode route : root.path("routes")) {
                Summary candidate = values(route.path("properties"), "totalTime", "totalDistance");
                if (candidate != null && (best == null || candidate.durationSeconds() < best.durationSeconds())) best = candidate;
            }
            if (best != null) return best;
        } else if (mode.equals("car")) {
            for (JsonNode route : root.path("routes")) {
                if (route.path("result_code").asInt(-1) == 0) {
                    Summary summary = values(route.path("summary"), "duration", "distance");
                    if (summary != null) return summary;
                }
            }
        } else {
            Summary summary = values(root.path("route").path("properties"), "totalTime", "totalDistance");
            if (summary != null) return summary;
        }
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "선택한 이동수단으로 이동 가능한 경로를 찾지 못했습니다.");
    }

    private Summary values(JsonNode node, String timeField, String distanceField) {
        JsonNode time = node.path(timeField), distance = node.path(distanceField);
        if (!time.isNumber() || !distance.isNumber() || time.asLong() < 0 || distance.asLong() < 0) return null;
        return new Summary(time.asLong(), distance.asLong());
    }

    private boolean valid(double value, int limit) { return Double.isFinite(value) && Math.abs(value) <= limit; }
    private ResponseStatusException upstream() {
        return new ResponseStatusException(HttpStatus.BAD_GATEWAY, "길찾기 정보를 불러오지 못했습니다.");
    }
}
