package com.itsup.incheonguro.mypage.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class MyPageUpdateRequest {

    @NotBlank
    private String name;

    @NotBlank
    private String nickname;

    private String birth;

    private String gender;

    private String phoneNumber;

    @NotNull
    private Long interestedRegion;
}
