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

        Map<String, Object> body = new java.util.LinkedHashMap<>();
        body.put("data", null);
        body.put("code", "C-003");
        body.put("message", e.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    // ==========================================
    // 잘못된 요청 값 (예: 여행 종료일이 시작일보다 빠름)
    // ==========================================

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgumentException(
            IllegalArgumentException e) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of(
                        "status", 400,
                        "message", e.getMessage()));
    }

    // ==========================================
    // 추천할 데이터를 찾지 못한 경우 등 서버 측 상태 문제
    // ==========================================

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalStateException(
            IllegalStateException e) {

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                        "status", 500,
                        "message", e.getMessage()));
    }
}
