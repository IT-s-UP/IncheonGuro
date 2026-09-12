package com.itsup.incheonguro.socialauth;

import java.net.http.HttpClient;
import java.time.Duration;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.client.RestClient;

@Component
public class KakaoClient {
    private final RestClient http;
    private final String clientId, secret, redirectUri;
    public KakaoClient(@Value("${kakao.auth.client-id}") String clientId,
                       @Value("${kakao.auth.client-secret}") String secret,
                       @Value("${kakao.auth.redirect-uri}") String redirectUri) {
        this.clientId = clientId; this.secret = secret; this.redirectUri = redirectUri;
        var factory = new JdkClientHttpRequestFactory(HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5)).build());
        factory.setReadTimeout(Duration.ofSeconds(10));
        http = RestClient.builder().requestFactory(factory).build();
    }
    public KakaoMember authenticate(String code) {
        var form = new LinkedMultiValueMap<String, String>();
        form.add("grant_type", "authorization_code");
        form.add("client_id", clientId);
        form.add("redirect_uri", redirectUri);
        form.add("code", code);
        if (!secret.isBlank()) form.add("client_secret", secret);
        Map<?, ?> token = http.post().uri("https://kauth.kakao.com/oauth/token")
            .contentType(MediaType.APPLICATION_FORM_URLENCODED).body(form)
            .retrieve().body(Map.class);
        if (token == null || !(token.get("access_token") instanceof String accessToken)
                || accessToken.isBlank()) throw new IllegalStateException("Missing access token");
        Map<?, ?> profile = http.get().uri("https://kapi.kakao.com/v2/user/me")
            .headers(headers -> headers.setBearerAuth(accessToken)).retrieve().body(Map.class);
        if (profile == null || !(profile.get("id") instanceof Number id) || id.longValue() <= 0)
            throw new IllegalStateException("Missing Kakao identity");
        String nickname = "탐험가";
        if (profile.get("properties") instanceof Map<?, ?> properties
                && properties.get("nickname") instanceof String name && !name.isBlank())
            nickname = name.substring(0, Math.min(200, name.length()));
        // Provider tokens are never stored or returned to the browser.
        return new KakaoMember(id.longValue(), nickname);
    }
}
