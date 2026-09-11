package com.itsup.incheonguro.courseguide.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

// course_segment 테이블과 매핑되는 엔티티, 장소와 장소 사이의 이동 구간 관련 정보를 담음
@Entity
@Table(name = "course_segment")
@Getter
@NoArgsConstructor
public class CourseSegment {

  // 구간 고유 번호
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  // 이 구간이 속한 코스
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "course_id", nullable = false)
  private Course course;

  // 이동수단 종류 (WALK, TRANSIT, BIKE, CAR)
  @Enumerated(EnumType.STRING)
  @Column(name = "transport_mode", nullable = false, length = 20)
  private TransportMode transportMode;

  // 해당 이동수단 안에서 몇 번째 구간인지? (0, 1, 2, ...)
  @Column(name = "order_index", nullable = false)
  private int orderIndex;

  // 이동 거리
  @Column(nullable = false, length = 20)
  private String distance; // 예: "300m"

  // 이동 소요시간
  @Column(nullable = false, length = 20)
  private String duration; // 예: "5분"
}
