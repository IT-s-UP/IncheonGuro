package com.itsup.incheonguro.courseguide.repository;

import com.itsup.incheonguro.courseguide.entity.Bookmark;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

// bookmark 테이블에 접근하는 리포지토리
public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {

  // 특정 사용자(userId)가 특정 코스(courseId)를 북마크했는지 확인
  Optional<Bookmark> findByUserIdAndCourseId(Long userId, Long courseId);

  // 특정 사용자가 특정 코스를 북마크했는지 여부만 true/false로 확인 -> swagger 확인용
  boolean existsByUserIdAndCourseId(Long userId, Long courseId);

  // 특정 사용자가 북마크한 모든 북마크 데이터 조회 -> 코스 목록 탭에서 사용
  List<Bookmark> findByUserId(Long userId);
}
