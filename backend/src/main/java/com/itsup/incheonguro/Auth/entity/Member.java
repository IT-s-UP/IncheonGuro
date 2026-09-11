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

    @Column(nullable = false)
    private String phoneNumber;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private LocalDate birth;

    @Column(nullable = false)
    private String gender;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String nickname;

    @Column(nullable = false)
    private Long interestedRegion;

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
}
