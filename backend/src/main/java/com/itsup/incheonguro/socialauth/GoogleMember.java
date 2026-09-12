package com.itsup.incheonguro.socialauth;

public class GoogleMember {
    private String googleId;
    private String nickname;
    protected GoogleMember() {}
    public GoogleMember(String googleId, String nickname) {
        this.googleId = googleId;
        this.nickname = nickname;
    }
    public String getGoogleId() { return googleId; }
    public String getNickname() { return nickname; }
}
