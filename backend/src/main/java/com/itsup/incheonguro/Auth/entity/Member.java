package com.itsup.incheonguro.Auth.entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "member")
@Getter
@NoArgsConstructor
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String loginId;

    @Column(nullable = false)
    private String password;

    @Column
    private String phoneNumber;

    @Column(nullable = false)
    private String name;

    @Column
    private LocalDate birth;

    @Column
    private String gender;

    @Column
    private String email;

    @Column(nullable = false)
    private String nickname;

    @Column
    private Long interestedRegion;

    @Column
    private String profileImageUrl;

    public Member(
            String loginId,
            String password,
            String phoneNumber,
            String name,
            LocalDate birth,
            String gender,
            String email,
            String nickname,
            Long interestedRegion) {
        this.loginId = loginId;
        this.password = password;
        this.phoneNumber = phoneNumber;
        this.name = name;
        this.birth = birth;
        this.gender = gender;
        this.email = email;
        this.nickname = nickname;
        this.interestedRegion = interestedRegion;
    }

    public void updateProfile(
            String name,
            String nickname,
            LocalDate birth,
            String gender,
            String phoneNumber,
            Long interestedRegion) {
        this.name = name;
        this.nickname = nickname;
        this.birth = birth;
        this.gender = gender;
        this.phoneNumber = phoneNumber;
        this.interestedRegion = interestedRegion;
    }

    public void changeEmail(String email) {
        this.email = email;
    }

    public void changePassword(String encodedPassword) {
        this.password = encodedPassword;
    }

    public void changeProfileImage(String profileImageUrl) {
        this.profileImageUrl = profileImageUrl;
    }

    public boolean isSocialAccount() {
        return loginId != null && loginId.startsWith("oauth:");
    }
}
