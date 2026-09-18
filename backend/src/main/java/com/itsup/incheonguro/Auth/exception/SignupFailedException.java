package com.itsup.incheonguro.Auth.exception;

public class SignupFailedException extends RuntimeException {

    public SignupFailedException() {
        super("회원가입 API 연동에 실패했습니다.");
    }

    public SignupFailedException(String message) {
        super(message);
    }
}
