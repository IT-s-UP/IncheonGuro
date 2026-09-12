package com.itsup.incheonguro.mypage.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class PasswordChangeRequest {

    @NotBlank
    private String currentPassword;

    @NotBlank
    private String newPassword;
}
