package com.itsup.incheonguro.socialauth;

public class GoogleMember {
    private String googleId;
    private String nickname;
    private String email;
    protected GoogleMember() {}
    public GoogleMember(String googleId, String nickname) {
        this(googleId, nickname, null);
    }
    public GoogleMember(String googleId, String nickname, String email) {
        this.googleId = googleId;
        this.nickname = nickname;
        this.email = email;
    }
    public String getGoogleId() { return googleId; }
    public String getNickname() { return nickname; }
    public String getEmail() { return email; }
}
