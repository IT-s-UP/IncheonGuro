package com.itsup.incheonguro.socialauth;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;

class GoogleClientTest {
    private final RestClient.Builder builder = RestClient.builder();
    private final MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
    private final GoogleClient client = new GoogleClient("id", "secret", "callback", builder.build());

    private void token(String json) {
        server.expect(requestTo("https://oauth2.googleapis.com/token"))
            .andExpect(method(HttpMethod.POST))
            .andExpect(content().string("grant_type=authorization_code&client_id=id&client_secret=secret&redirect_uri=callback&code=code&code_verifier=verifier"))
            .andRespond(withSuccess(json, MediaType.APPLICATION_JSON));
    }
    private void profile(String json) {
        server.expect(requestTo("https://openidconnect.googleapis.com/v1/userinfo"))
            .andExpect(header("Authorization", "Bearer token"))
            .andRespond(withSuccess(json, MediaType.APPLICATION_JSON));
    }
    @Test void exchangesCodeWithPkceAndUsesGoogleSubject() {
        token("{\"access_token\":\"token\"}");
        profile("{\"sub\":\"123456789012345678901\",\"name\":\"Alice\",\"email\":\"ignored@example.com\"}");
        var member = client.authenticate("code", "verifier");
        assertEquals("123456789012345678901", member.getGoogleId());
        assertEquals("Alice", member.getNickname());
        server.verify();
    }
    @Test void rejectsMissingAccessToken() {
        token("{}");
        assertThrows(IllegalStateException.class, () -> client.authenticate("code", "verifier"));
        server.verify();
    }
    @Test void rejectsMissingSubjectEvenIfEmailExists() {
        token("{\"access_token\":\"token\"}");
        profile("{\"email\":\"ignored@example.com\"}");
        assertThrows(IllegalStateException.class, () -> client.authenticate("code", "verifier"));
        server.verify();
    }
    @Test void missingNameUsesFallback() {
        token("{\"access_token\":\"token\"}");
        profile("{\"sub\":\"123\"}");
        assertEquals("탐험가", client.authenticate("code", "verifier").getNickname());
        server.verify();
    }
}
