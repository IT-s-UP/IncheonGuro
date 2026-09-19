package com.itsup.incheonguro.courseguide.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

// course 테이블과 매핑되는 엔티티. 관광공사 API 코스 목록에 우리가 직접 만든 코스를 추가로 섞어 보여주기 위해 사용
@Entity
@Table(name = "course")
@Getter
@NoArgsConstructor
public class LocalCourse {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String name;

  @Column(nullable = false)
  private String description;

  @Column(name = "is_recommended", nullable = false)
  private boolean recommended;

  @Column(name = "image_url")
  private String imageUrl;

  public LocalCourse(String name, String description, boolean recommended, String imageUrl) {
    this.name = name;
    this.description = description;
    this.recommended = recommended;
    this.imageUrl = imageUrl;
  }

  // API contentId와 겹치지 않도록 구분되는 접두사를 붙인 값을 우리 코스의 contentId로 사용
  public String toContentId() {
    return "local-" + id;
  }
}
