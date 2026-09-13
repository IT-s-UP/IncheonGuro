package com.itsup.incheonguro.emailverification.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.itsup.incheonguro.emailverification.dto.EmailVerificationCodeRequest;
import com.itsup.incheonguro.emailverification.dto.EmailVerificationCodeResponse;
import com.itsup.incheonguro.emailverification.dto.EmailVerificationConfirmRequest;
import com.itsup.incheonguro.emailverification.service.EmailVerificationService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Validated
@RestController
@RequiredArgsConstructor
@RequestMapping("/auth/email")
public class EmailVerificationController {

    private final EmailVerificationService emailVerificationService;

    // ==========================================
    // 인증번호 발송
    // POST /auth/email/verification-code
    // ==========================================

    @PostMapping("/verification-code")
    public EmailVerificationCodeResponse sendCode(
            @Valid @RequestBody EmailVerificationCodeRequest request) {

        String devCode = emailVerificationService.sendCode(request.getEmail());
        return new EmailVerificationCodeResponse(devCode, 200, "OK");
    }

    // ==========================================
    // 인증번호 확인
    // POST /auth/email/verification-code/confirm
    // ==========================================

    @PostMapping("/verification-code/confirm")
    public ResponseEntity<Void> confirm(
            @Valid @RequestBody EmailVerificationConfirmRequest request) {

        emailVerificationService.confirm(request);
        return ResponseEntity.noContent().build();
    }
}
