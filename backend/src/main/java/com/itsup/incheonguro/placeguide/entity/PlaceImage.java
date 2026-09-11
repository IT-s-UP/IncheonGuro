package com.itsup.incheonguro.placeguide.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

// place_image 테이블과 매핑되는 엔티티, 장소 상세 이미지 한 장을 담음
@Entity
@Table(name = "place_image")
@Getter
@NoArgsConstructor
public class PlaceImage {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  // 이 이미지가 속한 장소
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "place_id", nullable = false)
  private Place place;

  // 이미지 URL
  @Column(name = "image_url", nullable = false, length = 500)
  private String imageUrl;

  // 몇 번째 이미지인지 (0, 1, 2, ...)
  @Column(name = "order_index", nullable = false)
  private int orderIndex;
}
