package com.itsup.incheonguro.emailverification.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class EmailVerificationCodeResponse {

    private String devCode;

    private int status;

    private String message;
}
