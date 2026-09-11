package com.itsup.incheonguro.Auth.service;

import java.time.LocalDate;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.itsup.incheonguro.Auth.dto.LoginRequest;
import com.itsup.incheonguro.Auth.dto.LoginResponse;
import com.itsup.incheonguro.Auth.dto.SignupRequest;
import com.itsup.incheonguro.Auth.dto.SignupResponse;
import com.itsup.incheonguro.Auth.entity.Member;
import com.itsup.incheonguro.Auth.exception.LoginFailedException;
import com.itsup.incheonguro.Auth.exception.SignupFailedException;
import com.itsup.incheonguro.Auth.repository.MemberRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    // ==========================================
    // 회원가입
    // ==========================================

    @Transactional
    public SignupResponse signup(SignupRequest request) {

        // 아이디 중복 확인
        if (memberRepository.existsByLoginId(request.getLoginId())) {
            throw new SignupFailedException();
        }

        // 생년월일 변환
        LocalDate birth;

        try {
            birth = LocalDate.parse(request.getBirth());
        } catch (Exception e) {
            throw new SignupFailedException();
        }

        // 비밀번호 BCrypt 암호화
        String encodedPassword = passwordEncoder.encode(request.getPassword());

        // 회원 생성
        Member member = new Member(
                request.getLoginId(),
                encodedPassword,
                request.getPhoneNumber(),
                request.getName(),
                birth,
                request.getGender(),
                request.getEmail(),
                request.getNickname(),
                request.getInterestedRegion());

        memberRepository.save(member);

        SignupResponse.Data data = new SignupResponse.Data(
                member.getName(),
                member.getBirth(),
                member.getGender(),
                member.getEmail(),
                member.getNickname(),
                member.getInterestedRegion());

        return new SignupResponse(
                data,
                200,
                "OK");
    }

    // ==========================================
    // 로그인
    // ==========================================

    public LoginResponse login(LoginRequest request) {

        Member member = memberRepository
                .findByLoginId(request.getLoginId())
                .orElseThrow(LoginFailedException::new);

        // BCrypt 비밀번호 검증
        if (!passwordEncoder.matches(
                request.getPassword(),
                member.getPassword())) {
            throw new LoginFailedException();
        }

        // JWT 발급
        String accessToken = jwtService.createAccessToken(member);

        LoginResponse.Data data = new LoginResponse.Data(
                "Bearer",
                accessToken,
                member.getId(),
                member.getNickname(),
                member.getName(),
                member.getBirth(),
                member.getGender(),
                member.getInterestedRegion(),
                member.getPhoneNumber(),
                member.getEmail());

        return new LoginResponse(
                data,
                200,
                "OK");
    }
}
