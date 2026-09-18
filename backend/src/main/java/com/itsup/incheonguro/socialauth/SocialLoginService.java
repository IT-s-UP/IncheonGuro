package com.itsup.incheonguro.socialauth;

import jakarta.servlet.http.HttpServletRequest;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.util.Base64;
import com.itsup.incheonguro.Auth.entity.Member;
import com.itsup.incheonguro.Auth.repository.MemberRepository;
import com.itsup.incheonguro.Auth.service.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

@Service
public class SocialLoginService {
    private final MemberRepository members;
    private final JwtService jwt;
    private final PasswordEncoder passwords;
    private final TransactionTemplate transaction;

    public SocialLoginService(MemberRepository members, JwtService jwt,
            PasswordEncoder passwords, PlatformTransactionManager manager) {
        this.members = members;
        this.jwt = jwt;
        this.passwords = passwords;
        this.transaction = new TransactionTemplate(manager);
    }

    public void establish(HttpServletRequest request, String provider, String subject, String nickname) {
        establish(request, provider, subject, nickname, null, null);
    }

    public void establish(HttpServletRequest request, String provider, String subject, String nickname,
            String gender, LocalDate birth) {
        String loginId = "oauth:" + provider + ":" + subject;
        if (!(provider.equals("kakao") || provider.equals("google")) || loginId.length() > 255) {
            throw new IllegalArgumentException("Invalid social identity");
        }
        // Finish the DB commit before establishing an authenticated session.
        Member member = transaction.execute(status -> {
            var existing = members.findByLoginId(loginId);
            if (existing.isPresent()) {
                existing.get().fillMissingSocialProfile(birth, gender);
                return members.saveAndFlush(existing.get());
            }
            return members.saveAndFlush(new Member(loginId,
                    passwords.encode(randomValue()), null, nickname, birth, gender, null, nickname, null));
        });
        String token = jwt.createAccessToken(member);
        var session = request.getSession();
        request.changeSessionId();
        session.setAttribute("auth.csrf", randomValue());
        session.setAttribute("auth.user", new AuthUser(String.valueOf(member.getId()), provider, member.getNickname()));
        session.setAttribute("auth.token", token);
        session.setMaxInactiveInterval(1800);
    }

    private static String randomValue() {
        byte[] bytes = new byte[32];
        new SecureRandom().nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
