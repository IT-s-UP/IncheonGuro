package com.itsup.incheonguro.mypage.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class EmailChangeRequest {

    @NotBlank
    @Email
    private String email;
}
