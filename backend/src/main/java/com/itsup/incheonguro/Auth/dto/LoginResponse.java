package com.itsup.incheonguro.Auth.dto;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LoginResponse {

    private Data data;
    private int status;
    private String message;

    @Getter
    @AllArgsConstructor
    public static class Data {

        private String grantType;
        private String accessToken;

        private Long memberId;
        private String nickname;
        private String name;
        private LocalDate birth;
        private String gender;
        private Long interestedRegion;
        private String phoneNumber;
        private String email;
    }
}
