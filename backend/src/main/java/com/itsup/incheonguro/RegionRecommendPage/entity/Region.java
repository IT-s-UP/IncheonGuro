package com.itsup.incheonguro.RegionRecommendPage.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "region")
@Getter
@NoArgsConstructor
public class Region {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ==========================================
    // 기본 정보
    // ==========================================

    @Column(nullable = false, unique = true)
    private String regionName;

    private String description;

    private String imageUrl;

    // ==========================================
    // 장소 유형 점수
    // ==========================================

    private int seaScore;

    private int natureScore;

    private int foodScore;

    private int marketScore;

    private int cultureScore;

    private int shoppingScore;

    private int historyScore;

    private int hotplaceScore;

    // ==========================================
    // 이동 방식 점수
    // ==========================================

    private int walkScore;

    private int publicScore;

    private int carScore;

    private int shortScore;

    // ==========================================
    // 분위기 점수
    // ==========================================

    private int seaNatureScore;

    private int healingScore;

    private int historyMoodScore;

    private int foodieScore;

    private int activityScore;

    private int shoppingMoodScore;

    private int cityScore;

    private int retroScore;

    // ==========================================
    // 동행 점수
    // ==========================================

    private int aloneScore;

    private int coupleScore;

    private int friendScore;

    private int familyScore;
}
