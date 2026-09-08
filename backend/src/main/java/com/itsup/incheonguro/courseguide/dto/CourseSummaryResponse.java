package com.itsup.incheonguro.courseguide.dto;

import com.itsup.incheonguro.courseguide.entity.Course;
import lombok.Getter;

// 코스 목록 / 추천 코스 조회에서 사용하는 응답
@Getter
public class CourseSummaryResponse {

  // 코스 고유 번호
  private Long courseId;

  // 코스 이름
  private String name;

  // 코스 설명
  private String description;

  public CourseSummaryResponse(Course course) {
    this.courseId = course.getId();
    this.name = course.getName();
    this.description = course.getDescription();
  }
}
