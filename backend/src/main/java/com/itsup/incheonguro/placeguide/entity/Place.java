package com.itsup.incheonguro.placeguide.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.util.ArrayList;
import java.util.List;

// place 테이블과 매핑되는 엔티티, 장소 하나의 기본 정보를 담음
@Entity
@Table(name = "place")
@Getter
@NoArgsConstructor
public class Place {

  // 장소 고유 번호
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  // 장소 이름
  @Column(nullable = false, length = 50)
  private String title;

  // 장소 주소
  @Column(nullable = false, length = 200)
  private String subtitle;

  // 소속 구
  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private District district;

  // 장소 유형(관광지/카페/식당/숙소/쇼핑)
  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private PlaceCategory category;

  // 장소 소개글
  @Column(nullable = false, length = 500)
  private String description;

  // 이 장소가 가진 이미지 목록
  @OneToMany(mappedBy = "place", cascade = CascadeType.ALL, orphanRemoval = true)
  @OrderBy("orderIndex ASC")
  private List<PlaceImage> images = new ArrayList<>();

  // 이 장소에 달린 태그 목록
  @OneToMany(mappedBy = "place", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<PlaceTag> tags = new ArrayList<>();
}
