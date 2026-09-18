package com.itsup.incheonguro.socialauth;

import java.time.LocalDate;

public class KakaoMember {
    private Long kakaoId;
    private String nickname;
    private String gender;
    private LocalDate birth;
    protected KakaoMember() {}
    public KakaoMember(Long kakaoId, String nickname) {
        this(kakaoId, nickname, null, null);
    }
    public KakaoMember(Long kakaoId, String nickname, String gender, LocalDate birth) {
        this.kakaoId = kakaoId;
        this.nickname = nickname;
        this.gender = gender;
        this.birth = birth;
    }
    public Long getKakaoId() { return kakaoId; }
    public String getNickname() { return nickname; }
    public String getGender() { return gender; }
    public LocalDate getBirth() { return birth; }
}
