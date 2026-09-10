package com.itsup.incheonguro.Auth.exception;

public class LoginFailedException extends RuntimeException {

    public LoginFailedException() {
        super("아이디 또는 비밀번호가 일치하지 않습니다.");
    }
}
