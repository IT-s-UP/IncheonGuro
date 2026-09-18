package com.itsup.incheonguro.socialauth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Clock;
import java.util.Base64;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("/api/auth/google")
public class GoogleAuthController {
    @org.springframework.beans.factory.annotation.Autowired
    private SocialLoginService socialLogin;
    private static final String FLOW = "google.flow";
    private final GoogleClient google;
    private final String clientId, secret, redirectUri, frontend;
    private final Clock clock;
    private record Flow(String state, String verifier, long expiresAt) implements java.io.Serializable {}
    private static String random() {
        byte[] bytes = new byte[32];
        new SecureRandom().nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
    @Autowired
    public GoogleAuthController(GoogleClient google,
            @Value("${google.auth.client-id}") String clientId,
            @Value("${google.auth.client-secret}") String secret,
            @Value("${google.auth.redirect-uri}") String redirectUri,
            @Value("${google.auth.frontend-url}") String frontend) {
        this(google, clientId, secret, redirectUri, frontend, Clock.systemUTC());
    }
    GoogleAuthController(GoogleClient google, String clientId,
            String secret, String redirectUri, String frontend, Clock clock) {
        this.google = google; this.clientId = clientId; this.secret = secret;
        this.redirectUri = redirectUri; this.frontend = frontend.replaceAll("/+$", ""); this.clock = clock;
    }
    private ResponseEntity<Void> redirect(String location) {
        return ResponseEntity.status(302).header("Cache-Control", "no-store")
            .header("Referrer-Policy", "no-referrer").location(URI.create(location)).build();
    }
    @GetMapping
    public ResponseEntity<Void> start(HttpServletRequest request) {
        if (clientId.isBlank() || secret.isBlank())
            return redirect(frontend + "/login?error=google_config");
        String state = random(), verifier = random(), challenge;
        try {
            challenge = Base64.getUrlEncoder().withoutPadding().encodeToString(
                MessageDigest.getInstance("SHA-256").digest(verifier.getBytes(StandardCharsets.US_ASCII)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException(exception);
        }
        request.getSession().setAttribute(FLOW, new Flow(state, verifier, clock.millis() + 300_000));
        return redirect(UriComponentsBuilder.fromUriString("https://accounts.google.com/o/oauth2/v2/auth")
            .queryParam("client_id", clientId).queryParam("redirect_uri", redirectUri)
            .queryParam("response_type", "code").queryParam("scope", "openid profile")
            .queryParam("state", state).queryParam("code_challenge", challenge)
            .queryParam("code_challenge_method", "S256").queryParam("prompt", "select_account")
            .build().encode().toUriString());
    }
    @GetMapping("/callback")
    public ResponseEntity<Void> callback(HttpServletRequest request,
            @RequestParam(required = false) String code, @RequestParam(required = false) String state,
            @RequestParam(required = false) String error) {
        HttpSession session = request.getSession(false);
        Flow flow = null;
        if (session != null) {
            synchronized (session) {
                flow = (Flow) session.getAttribute(FLOW);
                session.removeAttribute(FLOW);
            }
        }
        if (flow == null || state == null || !flow.state().equals(state) || flow.expiresAt() <= clock.millis())
            return redirect(frontend + "/login?error=google_state");
        if (error != null || code == null || code.isBlank())
            return redirect(frontend + "/login?error=google_cancelled");
        try {
            GoogleMember identity = google.authenticate(code, flow.verifier());
            var member = socialLogin.establish(request, "google", String.valueOf(identity.getGoogleId()),
                    identity.getNickname());
            return redirect(frontend + (member.getInterestedRegion() == null ? "/complete-profile" : "/"));
        } catch (RuntimeException exception) {
            // Provider error payloads may contain credentials; never expose or log them.
            return redirect(frontend + "/login?error=google_failed");
        }
    }
}
