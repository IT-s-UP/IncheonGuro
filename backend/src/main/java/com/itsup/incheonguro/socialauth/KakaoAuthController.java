package com.itsup.incheonguro.socialauth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.net.URI;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("/api/auth")
public class KakaoAuthController {
    @org.springframework.beans.factory.annotation.Autowired
    private SocialLoginService socialLogin;
    private static final String FLOW = "kakao.flow", USER = "auth.user", CSRF = "auth.csrf";
    private final KakaoClient kakao;
    private final String clientId, redirectUri, frontend;
    private record Flow(String state, long expiresAt) implements java.io.Serializable {}
    private static String random() {
        byte[] bytes = new byte[32];
        new SecureRandom().nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
    public KakaoAuthController(KakaoClient kakao,
            @Value("${kakao.auth.client-id}") String clientId,
            @Value("${kakao.auth.redirect-uri}") String redirectUri,
            @Value("${kakao.auth.frontend-url}") String frontend) {
        this.kakao = kakao; this.clientId = clientId;
        this.redirectUri = redirectUri; this.frontend = frontend.replaceAll("/+$", "");
    }
    private ResponseEntity<Void> redirect(String location) {
        return ResponseEntity.status(302).header("Cache-Control", "no-store")
            .header("Referrer-Policy", "no-referrer").location(URI.create(location)).build();
    }
    @GetMapping("/kakao")
    public ResponseEntity<Void> start(HttpServletRequest request) {
        if (clientId.isBlank()) return redirect(frontend + "/login?error=kakao_config");
        String state = random();
        request.getSession().setAttribute(FLOW, new Flow(state, System.currentTimeMillis() + 300_000));
        return redirect(UriComponentsBuilder.fromUriString("https://kauth.kakao.com/oauth/authorize")
            .queryParam("client_id", clientId).queryParam("redirect_uri", redirectUri)
            .queryParam("response_type", "code").queryParam("state", state).build().encode().toUriString());
    }
    @GetMapping("/kakao/callback")
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
        if (flow == null || state == null || !flow.state().equals(state)
                || flow.expiresAt() < System.currentTimeMillis())
            return redirect(frontend + "/login?error=kakao_state");
        if (error != null || code == null || code.isBlank())
            return redirect(frontend + "/login?error=kakao_cancelled");
        try {
            KakaoMember identity = kakao.authenticate(code);
            socialLogin.establish(request, "kakao", String.valueOf(identity.getKakaoId()), identity.getNickname());
            return redirect(frontend + "/");
        } catch (RuntimeException exception) {
            // Do not log provider responses, authorization codes, secrets or access tokens.
            return redirect(frontend + "/login?error=kakao_failed");
        }
    }
    @GetMapping("/me")
    public ResponseEntity<?> me(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute(USER) == null)
            return ResponseEntity.status(401).header("Cache-Control", "no-store").build();
        return ResponseEntity.ok().header("Cache-Control", "no-store")
            .body(Map.of("user", session.getAttribute(USER), "csrfToken", session.getAttribute(CSRF), "accessToken", session.getAttribute("auth.token")));
    }
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request,
            @RequestHeader(value = "X-CSRF-Token", required = false) String csrf) {
        HttpSession session = request.getSession(false);
        if (session == null) return ResponseEntity.noContent().build();
        if (csrf == null || !csrf.equals(session.getAttribute(CSRF)))
            return ResponseEntity.status(403).build();
        session.invalidate();
        return ResponseEntity.noContent().build();
    }
}
