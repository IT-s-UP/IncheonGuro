package com.itsup.incheonguro.courseguide.repository;

import com.itsup.incheonguro.courseguide.entity.LocalCourse;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LocalCourseRepository extends JpaRepository<LocalCourse, Long> {
}
