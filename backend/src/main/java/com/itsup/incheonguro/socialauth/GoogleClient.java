package com.itsup.incheonguro.socialauth;

import java.net.http.HttpClient;
import java.time.Duration;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.client.RestClient;

@Component
public class GoogleClient {
    private final RestClient http;
    private final String clientId, secret, redirectUri;
    @Autowired
    public GoogleClient(@Value("${google.auth.client-id}") String clientId,
                        @Value("${google.auth.client-secret}") String secret,
                        @Value("${google.auth.redirect-uri}") String redirectUri) {
        this(clientId, secret, redirectUri, newHttpClient());
    }
    GoogleClient(String clientId, String secret, String redirectUri, RestClient http) {
        this.clientId = clientId; this.secret = secret; this.redirectUri = redirectUri; this.http = http;
    }
    private static RestClient newHttpClient() {
        var factory = new JdkClientHttpRequestFactory(HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5)).build());
        factory.setReadTimeout(Duration.ofSeconds(10));
        return RestClient.builder().requestFactory(factory).build();
    }
    public GoogleMember authenticate(String code, String verifier) {
        var form = new LinkedMultiValueMap<String, String>();
        form.add("grant_type", "authorization_code");
        form.add("client_id", clientId);
        form.add("client_secret", secret);
        form.add("redirect_uri", redirectUri);
        form.add("code", code);
        form.add("code_verifier", verifier);
        Map<?, ?> token = http.post().uri("https://oauth2.googleapis.com/token")
            .contentType(MediaType.APPLICATION_FORM_URLENCODED).body(form)
            .retrieve().body(Map.class);
        if (token == null || !(token.get("access_token") instanceof String accessToken)
                || accessToken.isBlank()) throw new IllegalStateException("Missing access token");
        // Resolve identity from Google's authenticated HTTPS UserInfo response.
        // Never accept browser-supplied tokens/identity or decode unverified JWT claims.
        Map<?, ?> profile = http.get().uri("https://openidconnect.googleapis.com/v1/userinfo")
            .headers(headers -> headers.setBearerAuth(accessToken)).retrieve().body(Map.class);
        if (profile == null || !(profile.get("sub") instanceof String id)
                || id.isBlank() || id.length() > 255)
            throw new IllegalStateException("Missing Google identity");
        String nickname = "탐험가";
        if (profile.get("name") instanceof String name && !name.isBlank())
            nickname = name.substring(0, Math.min(200, name.length()));
        // No email-based account merging; no provider tokens persisted or exposed.
        return new GoogleMember(id, nickname);
    }
}
