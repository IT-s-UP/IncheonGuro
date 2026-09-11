package com.itsup.incheonguro.Auth.dto;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SignupResponse {

    private Data data;
    private int status;
    private String message;

    @Getter
    @AllArgsConstructor
    public static class Data {

        private String name;
        private LocalDate birth;
        private String gender;
        private String email;
        private String nickname;
        private Long interestedRegion;
    }
}
