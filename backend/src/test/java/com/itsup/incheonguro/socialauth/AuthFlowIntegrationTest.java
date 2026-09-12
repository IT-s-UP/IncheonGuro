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
}
