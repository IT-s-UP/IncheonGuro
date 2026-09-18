package com.itsup.incheonguro.socialauth;

import java.net.*;
import java.net.http.*;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.web.util.UriComponentsBuilder;
import tools.jackson.databind.ObjectMapper;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ActiveProfiles("local")
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {"kto.service-key=test-key", "kakao.rest-api-key=test-key",
    "spring.datasource.url=jdbc:h2:mem:auth-flow;MODE=PostgreSQL;DB_CLOSE_DELAY=-1",
    "spring.sql.init.mode=always",
    "spring.sql.init.schema-locations=classpath:legacy-member.sql,file:database/social-member-nullable.sql",
    "jwt.secret=0123456789012345678901234567890123456789012345678901234567890123",
    "kakao.auth.client-id=test-kakao", "google.auth.client-id=test-google", "google.auth.client-secret=test-secret"
})
@org.springframework.context.annotation.Import(AuthFlowIntegrationTest.Probe.class)
class AuthFlowIntegrationTest {
    @org.springframework.web.bind.annotation.RestController
    static class Probe {
        @org.springframework.web.bind.annotation.GetMapping("/api/test-account")
        Map<String,String> account(@org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.oauth2.jwt.Jwt jwt) { return Map.of("loginId", jwt.getClaimAsString("loginId")); }
    }
    @LocalServerPort int port;
    @Autowired ObjectMapper json;
    @Autowired com.itsup.incheonguro.Auth.repository.MemberRepository members;
    @Autowired javax.crypto.SecretKey localKey;
    @MockitoBean GoogleClient google;
    @MockitoBean KakaoClient kakao;
    @MockitoBean com.itsup.incheonguro.Festival.service.FestivalService festivals;
    @MockitoBean org.springframework.mail.javamail.JavaMailSender mailSender;
    private HttpClient browser() { return HttpClient.newBuilder().cookieHandler(new CookieManager(null, CookiePolicy.ACCEPT_ALL)).build(); }
    private HttpRequest.Builder request(String path) { return HttpRequest.newBuilder(URI.create("http://localhost:" + port + path)); }
    private HttpResponse<String> send(HttpClient client, HttpRequest.Builder request) throws Exception {
        return client.send(request.build(), HttpResponse.BodyHandlers.ofString());
    }
    private Map<?, ?> object(String text) { return json.readValue(text, Map.class); }
    @Test void bothSocialProvidersIssueTeamJwtAndRejectCallbackReplay() throws Exception {
        when(google.authenticate(eq("google-code"), anyString())).thenReturn(new GoogleMember("test-sub", "구글 테스트"));
        when(kakao.authenticate("kakao-code")).thenReturn(new KakaoMember(112233L, "카카오 테스트"));
        for (String provider : new String[]{"google", "kakao"}) {
            var client = browser();
            var start = send(client, request("/api/auth/" + provider));
            assertEquals(302, start.statusCode());
            String state = UriComponentsBuilder.fromUriString(start.headers().firstValue("location").orElseThrow())
                .build().getQueryParams().getFirst("state");
            String callback = "/api/auth/" + provider + "/callback?code=" + provider + "-code&state=" + state;
            assertEquals(302, send(client, request(callback)).statusCode());
            var me = send(client, request("/api/auth/me"));
            assertEquals(200, me.statusCode());
            var token = (String) object(me.body()).get("accessToken");
            var user = (Map<?,?>) object(me.body()).get("user");
            var saved = members.findById(Long.valueOf(user.get("id").toString())).orElseThrow();
            assertNull(saved.getBirth());
            assertNull(saved.getPhoneNumber());
            assertNull(saved.getEmail());
            assertNotNull(saved.getPassword());
            assertEquals(saved.getNickname(), saved.getName());
            var teamKey = new javax.crypto.spec.SecretKeySpec(
                "0123456789012345678901234567890123456789012345678901234567890123".getBytes(java.nio.charset.StandardCharsets.UTF_8), "HmacSHA256");
            var teamDecoder = org.springframework.security.oauth2.jwt.NimbusJwtDecoder.withSecretKey(teamKey).build();
            assertThrows(org.springframework.security.oauth2.jwt.JwtException.class, () -> teamDecoder.decode(token));
            assertEquals(401, send(browser(), request("/api/test-account")).statusCode());
            var account = send(client, request("/api/test-account").header("Authorization", "Bearer " + token));
            assertEquals(200, account.statusCode());
            assertEquals(401, send(browser(), request("/stamp/my")).statusCode());
            assertEquals(200, send(browser(), request("/stamp/my").header("Authorization", "Bearer " + token)).statusCode());
            assertTrue(object(account.body()).get("loginId").toString().startsWith("oauth:" + provider + ":"));
            assertTrue(send(client, request(callback)).headers().firstValue("location").orElseThrow().endsWith(provider + "_state"));
            assertEquals(403, send(client, request("/api/auth/logout").POST(HttpRequest.BodyPublishers.noBody())).statusCode());
            assertEquals(204, send(client, request("/api/auth/logout").header("X-CSRF-Token", (String)object(me.body()).get("csrfToken")).POST(HttpRequest.BodyPublishers.noBody())).statusCode());
            assertEquals(401, send(client, request("/api/auth/me")).statusCode());
        }
    }
    @Test void festivalReadRemainsPublic() throws Exception {
        when(festivals.getPopularFestivals()).thenReturn(java.util.List.of());
        var response = send(browser(), request("/festivals/popular"));
        assertEquals(200, response.statusCode());
        assertEquals("[]", response.body());
    }

    @Test void legacyMemberSurvivesSchemaMigration() {
        var legacy = members.findByLoginId("legacy-member").orElseThrow();
        assertEquals("01011112222", legacy.getPhoneNumber());
        assertEquals(java.time.LocalDate.of(1990, 1, 1), legacy.getBirth());
        assertEquals("legacy@example.com", legacy.getEmail());
        assertEquals(1L, legacy.getInterestedRegion());
    }

    @Test void normalSignupLoginAndReservedSocialIdentity() throws Exception {
        var client = browser();
        var payload = new java.util.HashMap<String,Object>();
        payload.put("loginId", "normal-regression"); payload.put("password", "Test1234!");
        payload.put("phoneNumber", "01012345678"); payload.put("name", "Test");
        payload.put("birth", "2000-01-01"); payload.put("gender", "F");
        payload.put("email", "test@example.com"); payload.put("nickname", "Tester");
        payload.put("interestedRegion", 1);
        var codeResponse = send(client, request("/auth/email/verification-code").header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(json.writeValueAsString(Map.of("email", "test@example.com")))));
        assertEquals(200, codeResponse.statusCode());
        var devCode = (String) object(codeResponse.body()).get("devCode");
        assertEquals(204, send(client, request("/auth/email/verification-code/confirm").header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(json.writeValueAsString(Map.of("email", "test@example.com", "code", devCode))))).statusCode());
        assertEquals(200, send(client, request("/auth/signup").header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(json.writeValueAsString(payload)))).statusCode());
        var login = send(client, request("/auth/login").header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(json.writeValueAsString(Map.of("loginId", "normal-regression", "password", "Test1234!")))));
        assertEquals(200, login.statusCode());
        var data = (Map<?,?>)object(login.body()).get("data");
        assertEquals(200, send(client, request("/api/test-account").header("Authorization", "Bearer " + data.get("accessToken"))).statusCode());
        payload.put("loginId", "oauth:google:unclaimed");
        assertEquals(400, send(client, request("/auth/signup").header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(json.writeValueAsString(payload)))).statusCode());
        assertFalse(members.existsByLoginId("oauth:google:unclaimed"));
        payload.put("loginId", "missing-personal-info"); payload.remove("birth");
        assertEquals(400, send(client, request("/auth/signup").header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(json.writeValueAsString(payload)))).statusCode());
    }

    @Test void forgedAndCancelledOAuthDoNotAuthenticate() throws Exception {
        var client = browser();
        var failure = send(client, request("/api/auth/google/callback?code=forged&state=forged"));
        assertTrue(failure.headers().firstValue("location").orElseThrow().endsWith("google_state"));
        assertEquals(401, send(client, request("/api/auth/me")).statusCode());
        verifyNoInteractions(google);
    }

    @Autowired org.springframework.jdbc.core.JdbcTemplate jdbc;
    @Autowired com.itsup.incheonguro.Auth.service.JwtService tokens;
    @Autowired org.springframework.security.crypto.password.PasswordEncoder passwords;

    @Test void withdrawalDeletesOnlyOwnDataAndRejectsOldToken() throws Exception {
        var target = members.saveAndFlush(new com.itsup.incheonguro.Auth.entity.Member(
            "withdraw-local", passwords.encode("Test1234!"), null, "Tester", null, null, null, "Tester", null));
        var other = members.saveAndFlush(new com.itsup.incheonguro.Auth.entity.Member(
            "withdraw-other", passwords.encode("Test1234!"), null, "Other", null, null, null, "Other", null));
        String token = tokens.createAccessToken(target);
        for (Long id : java.util.List.of(target.getId(), other.getId())) {
            jdbc.update("insert into member_stamp (member_id, region_id, achieved_at) values (?, 1, CURRENT_TIMESTAMP)", id);
            jdbc.update("insert into bookmark (user_id, content_id) values (?, '67890')", id);
            jdbc.update("insert into place_bookmark (user_id, content_id) values (?, '12345')", id);
        }
        assertEquals(401, send(browser(), request("/api/mypage").header("Content-Type", "application/json")
            .method("DELETE", HttpRequest.BodyPublishers.ofString("{\"confirmed\":true}"))).statusCode());
        for (String body : new String[]{"{\"confirmed\":false,\"password\":\"Test1234!\"}", "{\"confirmed\":true,\"password\":\"wrong\"}"}) {
            assertEquals(400, send(browser(), request("/api/mypage").header("Authorization", "Bearer " + token)
                .header("Content-Type", "application/json").method("DELETE", HttpRequest.BodyPublishers.ofString(body))).statusCode());
            assertTrue(members.existsById(target.getId()));
            assertEquals(1, jdbc.queryForObject("select count(*) from member_stamp where member_id=?", Integer.class, target.getId()));
        }
        assertEquals(204, send(browser(), request("/api/mypage").header("Authorization", "Bearer " + token)
            .header("Content-Type", "application/json").method("DELETE",
                HttpRequest.BodyPublishers.ofString("{\"confirmed\":true,\"password\":\"Test1234!\"}"))).statusCode());
        assertFalse(members.existsById(target.getId()));
        assertTrue(members.existsById(other.getId()));
        for (String table : new String[]{"member_stamp", "bookmark", "place_bookmark"}) {
            String key = table.startsWith("member_") ? "member_id" : "user_id";
            assertEquals(0, jdbc.queryForObject("select count(*) from " + table + " where " + key + "=?", Integer.class, target.getId()));
            assertEquals(1, jdbc.queryForObject("select count(*) from " + table + " where " + key + "=?", Integer.class, other.getId()));
        }
        assertEquals(401, send(browser(), request("/stamp/my").header("Authorization", "Bearer " + token)).statusCode());
    }

    @Test void socialWithdrawalInvalidatesOtherSessionAndAllowsFreshSignup() throws Exception {
        when(google.authenticate(eq("withdraw-code"), anyString())).thenReturn(new GoogleMember("withdraw-social", "Social"));
        var first = browser(); var second = browser();
        for (var client : java.util.List.of(first, second)) {
            var start = send(client, request("/api/auth/google"));
            String state = UriComponentsBuilder.fromUriString(start.headers().firstValue("location").orElseThrow())
                .build().getQueryParams().getFirst("state");
            assertEquals(302, send(client, request("/api/auth/google/callback?code=withdraw-code&state=" + state)).statusCode());
        }
        var me = object(send(first, request("/api/auth/me")).body());
        var token = me.get("accessToken").toString();
        Long oldId = Long.valueOf(((Map<?,?>) me.get("user")).get("id").toString());
        assertEquals(204, send(first, request("/api/mypage").header("Authorization", "Bearer " + token)
            .header("Content-Type", "application/json").method("DELETE", HttpRequest.BodyPublishers.ofString("{\"confirmed\":true}"))).statusCode());
        assertEquals(401, send(first, request("/api/auth/me")).statusCode());
        assertEquals(401, send(second, request("/api/auth/me")).statusCode());
        assertEquals(401, send(browser(), request("/api/test-account").header("Authorization", "Bearer " + token)).statusCode());
        var start = send(first, request("/api/auth/google"));
        String state = UriComponentsBuilder.fromUriString(start.headers().firstValue("location").orElseThrow())
            .build().getQueryParams().getFirst("state");
        send(first, request("/api/auth/google/callback?code=withdraw-code&state=" + state));
        assertNotEquals(oldId, members.findByLoginId("oauth:google:withdraw-social").orElseThrow().getId());
    }

    @Test void coursesArePrivateAndWithdrawalDeletesDaysAndPlaces() throws Exception {
        var owner = members.saveAndFlush(new com.itsup.incheonguro.Auth.entity.Member(
            "course-owner", passwords.encode("Test1234!"), null, "Owner", null, null, null, "Owner", null));
        var other = members.saveAndFlush(new com.itsup.incheonguro.Auth.entity.Member(
            "course-other", passwords.encode("Test1234!"), null, "Other", null, null, null, "Other", null));
        String token = tokens.createAccessToken(owner), otherToken = tokens.createAccessToken(other);
        String payload = json.writeValueAsString(Map.of("name", "Private course", "days", java.util.List.of(
            Map.of("day", 1, "transport", "도보", "places", java.util.List.of(Map.of("name", "Place", "address", "Incheon")),
                "costs", Map.of("transportation", 0, "food", 0, "admission", 0, "etc", 0)))));
        var create = send(browser(), request("/api/courses").header("Authorization", "Bearer " + token)
            .header("Content-Type", "application/json").POST(HttpRequest.BodyPublishers.ofString(payload)));
        assertEquals(201, create.statusCode());
        Long id = ((Number)object(create.body()).get("id")).longValue();
        var otherCreate = send(browser(), request("/api/courses").header("Authorization", "Bearer " + otherToken)
            .header("Content-Type", "application/json").POST(HttpRequest.BodyPublishers.ofString(payload)));
        Long otherId = ((Number)object(otherCreate.body()).get("id")).longValue();
        jdbc.update("insert into courses (name, created_at, updated_at) values ('legacy-ownerless', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)");
        var list = send(browser(), request("/api/courses").header("Authorization", "Bearer " + token));
        assertEquals(1, json.readValue(list.body(), java.util.List.class).size());
        assertEquals(200, send(browser(), request("/api/courses/" + id).header("Authorization", "Bearer " + token)).statusCode());
        for (String method : new String[]{"GET", "PUT", "DELETE"}) {
            assertEquals(404, send(browser(), request("/api/courses/" + id).header("Authorization", "Bearer " + otherToken)
                .header("Content-Type", "application/json").method(method,
                    method.equals("PUT") ? HttpRequest.BodyPublishers.ofString(payload) : HttpRequest.BodyPublishers.noBody())).statusCode());
        }
        Long dayId = jdbc.queryForObject("select id from course_days where course_id=?", Long.class, id);
        assertEquals(1, jdbc.queryForObject("select count(*) from course_places where course_day_id=?", Integer.class, dayId));
        assertEquals(204, send(browser(), request("/api/mypage").header("Authorization", "Bearer " + token)
            .header("Content-Type", "application/json").method("DELETE",
                HttpRequest.BodyPublishers.ofString("{\"confirmed\":true,\"password\":\"Test1234!\"}"))).statusCode());
        assertEquals(0, jdbc.queryForObject("select count(*) from courses where id=?", Integer.class, id));
        assertEquals(0, jdbc.queryForObject("select count(*) from course_days where course_id=?", Integer.class, id));
        assertEquals(0, jdbc.queryForObject("select count(*) from course_places where course_day_id=?", Integer.class, dayId));
        assertEquals(1, jdbc.queryForObject("select count(*) from courses where id=?", Integer.class, otherId));
    }
}
