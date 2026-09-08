package com.itsup.incheonguro.courseguide.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.util.ArrayList;
import java.util.List;

// course 테이블과 매핑되는 엔티티, 코스 하나의 기본 정보를 담음
@Entity
@Table(name = "course")
@Getter
@NoArgsConstructor
public class Course {

  // 코스 고유 번호
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  // 코스 이름
  @Column(nullable = false, length = 50)
  private String name;

  // 코스 한줄 설명
  @Column(length = 200)
  private String description;

  // 오늘의 추천 코스인지? true면 추천 코스 조회 API에서 반환 (새로고침 버튼)
  @Column(name = "is_recommended", nullable = false)
  private boolean recommended;

  // 해당 코스에 속한 장소 목록
  @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
  @OrderBy("orderIndex ASC")
  private List<CoursePlace> places = new ArrayList<>();

  // 해당 코스에 속한 이동 구간 목록
  @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<CourseSegment> segments = new ArrayList<>();
}
