package com.itsup.incheonguro.courseguide.repository;

import com.itsup.incheonguro.courseguide.entity.CoursePlace;
import org.springframework.data.jpa.repository.JpaRepository;

// course_place 테이블에 접근하는 리포지토리
public interface CoursePlaceRepository extends JpaRepository<CoursePlace, Long> {
}
