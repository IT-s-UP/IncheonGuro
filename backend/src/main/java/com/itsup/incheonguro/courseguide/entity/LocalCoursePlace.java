package com.itsup.incheonguro.courseguide.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

// course_place 테이블과 매핑되는 엔티티. LocalCourse에 속한 정거장 하나(순서대로)
// 관광공사 API와 달리 위경도를 직접 들고 있어야, 도보/자전거/대중교통/자차 경로 계산에 바로 쓸 수 있음
@Entity
@Table(name = "course_place")
@Getter
@NoArgsConstructor
public class LocalCoursePlace {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "course_id", nullable = false)
  private Long courseId;

  @Column(nullable = false)
  private String name;

  @Column(nullable = false)
  private String address;

  @Column(name = "order_index", nullable = false)
  private int orderIndex;

  @Column(nullable = false)
  private double latitude;

  @Column(nullable = false)
  private double longitude;

  public LocalCoursePlace(Long courseId, String name, String address, int orderIndex,
      double latitude, double longitude) {
    this.courseId = courseId;
    this.name = name;
    this.address = address;
    this.orderIndex = orderIndex;
    this.latitude = latitude;
    this.longitude = longitude;
  }
}
