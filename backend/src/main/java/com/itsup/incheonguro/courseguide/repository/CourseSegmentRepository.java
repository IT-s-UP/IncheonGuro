package com.itsup.incheonguro.courseguide.repository;

import com.itsup.incheonguro.courseguide.entity.CourseSegment;
import com.itsup.incheonguro.courseguide.entity.TransportMode;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

// course_segment 테이블에 접근하는 리포지토리
public interface CourseSegmentRepository extends JpaRepository<CourseSegment, Long> {

  // 특정 코스의 특정 이동수단 구간들을 순서대로 조회
  List<CourseSegment> findByCourseIdAndTransportModeOrderByOrderIndexAsc(Long courseId, TransportMode transportMode);
}
