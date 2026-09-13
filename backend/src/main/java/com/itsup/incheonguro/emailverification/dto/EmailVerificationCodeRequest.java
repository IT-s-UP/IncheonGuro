package com.itsup.incheonguro.emailverification.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class EmailVerificationCodeRequest {

    @NotBlank
    @Email
    private String email;
}
