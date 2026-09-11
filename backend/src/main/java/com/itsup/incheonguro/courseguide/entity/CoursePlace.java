package com.itsup.incheonguro.courseguide.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

// course_place 테이블과 매핑되는 엔티티, 코스에 속한 장소 하나(출발지/경유지/도착지)를 담음
@Entity
@Table(name = "course_place")
@Getter
@NoArgsConstructor
public class CoursePlace {

  // 장소 고유 번호
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  // 이 장소가 속한 코스
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "course_id", nullable = false)
  private Course course;

  // 장소 이름
  @Column(nullable = false, length = 30)
  private String name;

  // 장소 주소
  @Column(nullable = false, length = 200)
  private String address;

  // 코스 안에서 몇 번째 장소인지? (0, 1, 2, ...)
  @Column(name = "order_index", nullable = false)
  private int orderIndex;
}
