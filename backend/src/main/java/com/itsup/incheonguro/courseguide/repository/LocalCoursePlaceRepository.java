package com.itsup.incheonguro.courseguide.repository;

import com.itsup.incheonguro.courseguide.entity.LocalCoursePlace;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LocalCoursePlaceRepository extends JpaRepository<LocalCoursePlace, Long> {

  List<LocalCoursePlace> findByCourseIdOrderByOrderIndexAsc(Long courseId);
}
