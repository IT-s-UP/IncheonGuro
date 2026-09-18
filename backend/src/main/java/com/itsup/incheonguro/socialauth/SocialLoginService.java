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

    public Member establish(HttpServletRequest request, String provider, String subject, String nickname) {
        return establish(request, provider, subject, nickname, null, null, null);
    }

    public Member establish(HttpServletRequest request, String provider, String subject, String nickname,
            String gender, LocalDate birth) {
        return establish(request, provider, subject, nickname, gender, birth, null);
    }

    public Member establish(HttpServletRequest request, String provider, String subject, String nickname,
            String gender, LocalDate birth, String verifiedEmail) {
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
            // 처음 보는 소셜 계정이면, 검증된 이메일이 같은 기존 계정(이메일 가입이든 다른 소셜이든)이
            // 있는지 먼저 확인해서 새로 만들지 않고 그 계정에 로그인시킴 (동일인 중복가입 방지).
            if (verifiedEmail != null) {
                var byEmail = members.findFirstByEmail(verifiedEmail);
                if (byEmail.isPresent()) {
                    byEmail.get().fillMissingSocialProfile(birth, gender);
                    return members.saveAndFlush(byEmail.get());
                }
            }
            return members.saveAndFlush(new Member(loginId,
                    passwords.encode(randomValue()), null, nickname, birth, gender, verifiedEmail, nickname, null));
        });
        String token = jwt.createAccessToken(member);
        var session = request.getSession();
        request.changeSessionId();
        session.setAttribute("auth.csrf", randomValue());
        session.setAttribute("auth.user", new AuthUser(String.valueOf(member.getId()), provider, member.getNickname()));
        session.setAttribute("auth.token", token);
        session.setMaxInactiveInterval(1800);
        return member;
    }

    private static String randomValue() {
        byte[] bytes = new byte[32];
        new SecureRandom().nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
