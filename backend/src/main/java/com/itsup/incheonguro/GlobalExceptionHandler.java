package com.itsup.incheonguro;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.itsup.incheonguro.Auth.exception.LoginFailedException;
import com.itsup.incheonguro.Auth.exception.SignupFailedException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // ==========================================
    // 로그인 실패
    // ==========================================

    @ExceptionHandler(LoginFailedException.class)
    public ResponseEntity<Map<String, Object>> handleLoginFailedException(
            LoginFailedException e) {

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(Map.of(
                        "status", 401,
                        "message", e.getMessage()));
    }

    // ==========================================
    // 회원가입 실패
    // ==========================================

    @ExceptionHandler(SignupFailedException.class)
    public ResponseEntity<Map<String, Object>> handleSignupFailedException(
            SignupFailedException e) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of(
                        "data", (Object) null,
                        "code", "C-003",
                        "message", e.getMessage()));
    }
}
