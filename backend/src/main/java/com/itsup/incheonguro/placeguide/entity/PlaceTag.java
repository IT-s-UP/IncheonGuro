package com.itsup.incheonguro.placeguide.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

// place_tag 테이블과 매핑되는 엔티티, 장소에 붙은 태그 하나를 담음
@Entity
@Table(name = "place_tag")
@Getter
@NoArgsConstructor
public class PlaceTag {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "place_id", nullable = false)
  private Place place;

  // 태그 이름 (예: "#이국적인거리")
  @Column(name = "tag_name", nullable = false, length = 30)
  private String tagName;
}
