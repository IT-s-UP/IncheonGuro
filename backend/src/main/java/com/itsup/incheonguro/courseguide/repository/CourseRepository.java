package com.itsup.incheonguro.courseguide.repository;

import com.itsup.incheonguro.courseguide.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

// course 테이블에 접근하는 리포지토리
public interface CourseRepository extends JpaRepository<Course, Long> {

  // 오늘의 추천 코스 목록 조회 (is_recommended가 true인 코스만 조회)
  List<Course> findByRecommendedTrue();

  // 코스 목록 조회 (keyword로 이름 또는 설명 검색)
  // 지금 사용 X, 코스 목록 탭은 북마크한 코스만 조회하니 이거 안씀...
  // 추후 "전체 코스 검색" 기능이 필요해지면 재사용
  List<Course> findByNameContainingOrDescriptionContaining(String nameKeyword, String descriptionKeyword);
}
