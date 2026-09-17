package com.itsup.incheonguro.mypage.service;

import java.time.LocalDate;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.itsup.incheonguro.Auth.entity.Member;
import com.itsup.incheonguro.Auth.repository.MemberRepository;
import com.itsup.incheonguro.RegionRecommendPage.repository.RegionRepository;
import com.itsup.incheonguro.mypage.dto.EmailChangeRequest;
import com.itsup.incheonguro.mypage.dto.MyPageResponse;
import com.itsup.incheonguro.mypage.dto.MyPageStatsResponse; // [추가]
import com.itsup.incheonguro.mypage.dto.MyPageUpdateRequest;
import com.itsup.incheonguro.mypage.dto.PasswordChangeRequest;
import com.itsup.incheonguro.mypage.dto.ProfileMascotRequest;
import com.itsup.incheonguro.emailverification.service.EmailVerificationService;
import com.itsup.incheonguro.placeguide.repository.PlaceBookmarkRepository; // [추가]
import com.itsup.incheonguro.courseguide.repository.BookmarkRepository; // [추가]

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MyPageService {

    private static final Set<String> VALID_MASCOTS = Set.of(
            "ganghwa", "geomdan", "gyeyang", "namdong", "michuhol",
            "bupyeong", "seohae", "yeonsu", "yeongjong", "ongjin", "jemulpo");

    private final MemberRepository memberRepository;
    private final RegionRepository regionRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailVerificationService emailVerificationService;
    private final PlaceBookmarkRepository placeBookmarkRepository; // [추가] 장소 북마크 개수 조회용
    private final BookmarkRepository courseBookmarkRepository; // [추가] 코스 북마크 개수 조회용

    // ==========================================
    // 내 정보 조회
    // ==========================================

    public MyPageResponse getMyPage(Member member) {
        return MyPageResponse.of(member, regionNameOf(member.getInterestedRegion()));
    }

    // ==========================================
    // [추가] 마이페이지 통계 조회 (내 코스 / 북마크 / 스탬프 개수)
    // 메뉴 드로어에서 사용. bookmarkCount만 실제로 집계하고, 나머지는 0 고정
    // ==========================================

    public MyPageStatsResponse getStats(Member member) {
        Long userId = member.getId();

        int placeBookmarkCount = placeBookmarkRepository.findByUserId(userId).size();
        int courseBookmarkCount = courseBookmarkRepository.findByUserId(userId).size();

        return new MyPageStatsResponse(placeBookmarkCount + courseBookmarkCount);
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
        emailVerificationService.consume(request.getEmail());

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
    // 프로필 마스코트 선택 / 해제
    // ==========================================

    @Transactional
    public MyPageResponse changeProfileMascot(Member member, ProfileMascotRequest request) {

        if (!VALID_MASCOTS.contains(request.getMascot())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "존재하지 않는 마스코트입니다.");
        }

        member.changeProfileMascot(request.getMascot());
        memberRepository.save(member);

        return MyPageResponse.of(member, regionNameOf(member.getInterestedRegion()));
    }

    @Transactional
    public void resetProfileMascot(Member member) {
        member.changeProfileMascot(null);
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
