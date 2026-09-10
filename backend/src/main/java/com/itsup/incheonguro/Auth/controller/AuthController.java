package com.itsup.incheonguro.Auth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.itsup.incheonguro.Auth.dto.LoginRequest;
import com.itsup.incheonguro.Auth.dto.LoginResponse;
import com.itsup.incheonguro.Auth.dto.SignupRequest;
import com.itsup.incheonguro.Auth.dto.SignupResponse;
import com.itsup.incheonguro.Auth.service.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Validated
public class AuthController {

    private final AuthService authService;

    // ==========================================
    // 로그인
    // POST /auth/login
    // ==========================================

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request) {

        return ResponseEntity.ok(
                authService.login(request));
    }

    // ==========================================
    // 회원가입
    // POST /auth/signup
    // ==========================================

    @PostMapping("/signup")
    public ResponseEntity<SignupResponse> signup(
            @Valid @RequestBody SignupRequest request) {

        return ResponseEntity.ok(
                authService.signup(request));
    }
}
