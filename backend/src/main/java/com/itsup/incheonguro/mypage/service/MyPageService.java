package com.itsup.incheonguro.mypage.service;

import java.time.LocalDate;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.itsup.incheonguro.Auth.entity.Member;
import com.itsup.incheonguro.Auth.repository.MemberRepository;
import com.itsup.incheonguro.RegionRecommendPage.repository.RegionRepository;
import com.itsup.incheonguro.mypage.dto.EmailChangeRequest;
import com.itsup.incheonguro.mypage.dto.MyPageResponse;
import com.itsup.incheonguro.mypage.dto.MyPageUpdateRequest;
import com.itsup.incheonguro.mypage.dto.PasswordChangeRequest;
import com.itsup.incheonguro.mypage.dto.ProfileImageResponse;
import com.itsup.incheonguro.emailverification.service.EmailVerificationService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MyPageService {

    private final MemberRepository memberRepository;
    private final RegionRepository regionRepository;
    private final PasswordEncoder passwordEncoder;
    private final ProfileImageStorageService profileImageStorageService;
    private final EmailVerificationService emailVerificationService;

    // ==========================================
    // 내 정보 조회
    // ==========================================

    public MyPageResponse getMyPage(Member member) {
        return MyPageResponse.of(member, regionNameOf(member.getInterestedRegion()));
    }

    // ==========================================
    // 내 정보 수정
    // ==========================================

    @Transactional
    public MyPageResponse updateProfile(Member member, MyPageUpdateRequest request) {

        LocalDate birth;
        try {
            birth = LocalDate.parse(request.getBirth());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "생년월일 형식이 올바르지 않습니다.");
        }

        if (!regionRepository.existsById(request.getInterestedRegion())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "존재하지 않는 관심 지역입니다.");
        }

        member.updateProfile(
                request.getName(),
                request.getNickname(),
                birth,
                request.getGender(),
                request.getPhoneNumber(),
                request.getInterestedRegion());

        memberRepository.save(member);

        return MyPageResponse.of(member, regionNameOf(member.getInterestedRegion()));
    }

    // ==========================================
    // 이메일 변경 (소셜 로그인 계정은 불가)
    // ==========================================

    @Transactional
    public MyPageResponse changeEmail(Member member, EmailChangeRequest request) {

        if (member.isSocialAccount()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "소셜 로그인 계정은 이메일을 변경할 수 없습니다.");
        }

        if (!emailVerificationService.isVerified(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "이메일 인증을 먼저 완료해주세요.");
        }

        member.changeEmail(request.getEmail());
        memberRepository.save(member);

        return MyPageResponse.of(member, regionNameOf(member.getInterestedRegion()));
    }

    // ==========================================
    // 비밀번호 변경
    // ==========================================

    @Transactional
    public void changePassword(Member member, PasswordChangeRequest request) {

        if (!passwordEncoder.matches(request.getCurrentPassword(), member.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "현재 비밀번호가 일치하지 않습니다.");
        }

        member.changePassword(passwordEncoder.encode(request.getNewPassword()));
        memberRepository.save(member);
    }

    // ==========================================
    // 프로필 사진 업로드 / 삭제
    // ==========================================

    @Transactional
    public ProfileImageResponse uploadProfileImage(Member member, MultipartFile file) {

        String previousImageUrl = member.getProfileImageUrl();
        String savedUrl = profileImageStorageService.save(member.getId(), file);

        member.changeProfileImage(savedUrl);
        memberRepository.save(member);
        profileImageStorageService.delete(previousImageUrl);

        return new ProfileImageResponse(new ProfileImageResponse.Data(savedUrl), 200, "OK");
    }

    @Transactional
    public void deleteProfileImage(Member member) {
        profileImageStorageService.delete(member.getProfileImageUrl());
        member.changeProfileImage(null);
        memberRepository.save(member);
    }

    private String regionNameOf(Long regionId) {
        if (regionId == null) {
            return null;
        }
        return regionRepository.findById(regionId)
                .map(region -> region.getRegionName())
                .orElse(null);
    }
}
