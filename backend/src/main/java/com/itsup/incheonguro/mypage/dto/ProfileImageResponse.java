package com.itsup.incheonguro.mypage.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ProfileImageResponse {

    private Data data;
    private int status;
    private String message;

    @Getter
    @AllArgsConstructor
    public static class Data {

        private String profileImageUrl;
    }
}
