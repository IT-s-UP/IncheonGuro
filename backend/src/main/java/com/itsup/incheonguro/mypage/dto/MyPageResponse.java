package com.itsup.incheonguro.mypage.dto;

import java.time.LocalDate;

import com.itsup.incheonguro.Auth.entity.Member;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MyPageResponse {

    private Data data;
    private int status;
    private String message;

    public static MyPageResponse of(Member member, String regionName) {
        return new MyPageResponse(
                new Data(
                        member.getId(),
                        member.getNickname(),
                        member.getName(),
                        member.getBirth(),
                        member.getGender(),
                        member.getPhoneNumber(),
                        member.getEmail(),
                        member.getInterestedRegion(),
                        regionName,
                        member.getProfileImageUrl(),
                        member.isSocialAccount()),
                200,
                "OK");
    }

    @Getter
    @AllArgsConstructor
    public static class Data {

        private Long memberId;
        private String nickname;
        private String name;
        private LocalDate birth;
        private String gender;
        private String phoneNumber;
        private String email;
        private Long interestedRegion;
        private String interestedRegionName;
        private String profileImageUrl;
        private boolean socialAccount;
    }
}
