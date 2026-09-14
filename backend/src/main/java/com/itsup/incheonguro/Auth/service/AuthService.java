package com.itsup.incheonguro.Auth.service;

import java.time.LocalDate;
import java.util.Map;

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
import com.itsup.incheonguro.RegionRecommendPage.entity.Region;
import com.itsup.incheonguro.RegionRecommendPage.repository.RegionRepository;
import com.itsup.incheonguro.emailverification.service.EmailVerificationService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private static final Map<String, String> REGION_MASCOTS = Map.ofEntries(
            Map.entry("강화군", "ganghwa"),
            Map.entry("검단구", "geomdan"),
            Map.entry("계양구", "gyeyang"),
            Map.entry("남동구", "namdong"),
            Map.entry("미추홀구", "michuhol"),
            Map.entry("부평구", "bupyeong"),
            Map.entry("서해구", "seohae"),
            Map.entry("연수구", "yeonsu"),
            Map.entry("영종구", "yeongjong"),
            Map.entry("옹진군", "ongjin"),
            Map.entry("제물포구", "jemulpo"));

    private final MemberRepository memberRepository;
    private final RegionRepository regionRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailVerificationService emailVerificationService;

    // ==========================================
    // 로그인 ID 중복 확인
    // ==========================================

    public boolean isLoginIdAvailable(String loginId) {
        return !loginId.startsWith("oauth:") && !memberRepository.existsByLoginId(loginId);
    }

    // ==========================================
    // 회원가입
    // ==========================================

    @Transactional
    public SignupResponse signup(SignupRequest request) {

        // 아이디 중복 확인
        if (request.getLoginId().startsWith("oauth:")
                || memberRepository.existsByLoginId(request.getLoginId())) {
            throw new SignupFailedException();
        }

        // 이메일 인증 완료 확인
        if (!emailVerificationService.isVerified(request.getEmail())) {
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

        regionRepository.findById(request.getInterestedRegion())
                .map(Region::getRegionName)
                .map(REGION_MASCOTS::get)
                .ifPresent(member::changeProfileMascot);

        memberRepository.save(member);
        emailVerificationService.consume(request.getEmail());

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
