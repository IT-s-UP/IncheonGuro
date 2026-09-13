package com.itsup.incheonguro.mypage.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.itsup.incheonguro.Auth.entity.Member;
import com.itsup.incheonguro.Auth.support.CurrentMember;
import com.itsup.incheonguro.mypage.dto.EmailChangeRequest;
import com.itsup.incheonguro.mypage.dto.MyPageResponse;
import com.itsup.incheonguro.mypage.dto.MyPageUpdateRequest;
import com.itsup.incheonguro.mypage.dto.PasswordChangeRequest;
import com.itsup.incheonguro.mypage.dto.ProfileMascotRequest;
import com.itsup.incheonguro.mypage.service.MyPageService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Validated
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/mypage")
public class MyPageController {

    private final MyPageService myPageService;

    // ==========================================
    // 내 정보 조회
    // GET /api/mypage
    // ==========================================

    @GetMapping
    public MyPageResponse getMyPage(@CurrentMember Member member) {
        return myPageService.getMyPage(member);
    }

    // ==========================================
    // 내 정보 수정
    // PUT /api/mypage
    // ==========================================

    @PutMapping
    public MyPageResponse updateProfile(
            @CurrentMember Member member,
            @Valid @RequestBody MyPageUpdateRequest request) {
        return myPageService.updateProfile(member, request);
    }

    // ==========================================
    // 이메일 변경
    // PATCH /api/mypage/email
    // ==========================================

    @PatchMapping("/email")
    public MyPageResponse changeEmail(
            @CurrentMember Member member,
            @Valid @RequestBody EmailChangeRequest request) {
        return myPageService.changeEmail(member, request);
    }

    // ==========================================
    // 비밀번호 변경
    // PATCH /api/mypage/password
    // ==========================================

    @PatchMapping("/password")
    public ResponseEntity<Void> changePassword(
            @CurrentMember Member member,
            @Valid @RequestBody PasswordChangeRequest request) {
        myPageService.changePassword(member, request);
        return ResponseEntity.noContent().build();
    }

    // ==========================================
    // 프로필 마스코트 선택 / 해제
    // PATCH/DELETE /api/mypage/profile-mascot
    // ==========================================

    @PatchMapping("/profile-mascot")
    public MyPageResponse changeProfileMascot(
            @CurrentMember Member member,
            @Valid @RequestBody ProfileMascotRequest request) {
        return myPageService.changeProfileMascot(member, request);
    }

    @DeleteMapping("/profile-mascot")
    public ResponseEntity<Void> resetProfileMascot(@CurrentMember Member member) {
        myPageService.resetProfileMascot(member);
        return ResponseEntity.noContent().build();
    }
}
