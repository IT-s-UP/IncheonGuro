package com.itsup.incheonguro.socialauth;

public class KakaoMember {
    private Long kakaoId;
    private String nickname;
    protected KakaoMember() {}
    public KakaoMember(Long kakaoId, String nickname) {
        this.kakaoId = kakaoId;
        this.nickname = nickname;
    }
    public Long getKakaoId() { return kakaoId; }
    public String getNickname() { return nickname; }
}
