package com.itsup.incheonguro.course.repository;

import com.itsup.incheonguro.course.entity.MyCourse;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MyCourseRepository extends JpaRepository<MyCourse, Long> {
    List<MyCourse> findAllByOrderByIdDesc();
}
