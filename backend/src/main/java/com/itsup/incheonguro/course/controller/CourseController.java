package com.itsup.incheonguro.course.controller;

import com.itsup.incheonguro.course.dto.CourseRequest;
import com.itsup.incheonguro.course.dto.CourseResponse;
import com.itsup.incheonguro.course.service.CourseService;

import com.itsup.incheonguro.Auth.entity.Member;
import com.itsup.incheonguro.Auth.support.CurrentMember;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;

@Validated
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/courses")
public class CourseController {
    private final CourseService courseService;

    @GetMapping
    public List<CourseResponse> findAll(@CurrentMember Member member) {
        return courseService.findAll(member.getId());
    }

    @GetMapping("/{courseId}")
    public CourseResponse findById(@CurrentMember Member member, @PathVariable @Positive Long courseId) {
        return courseService.findById(member.getId(), courseId);
    }

    @PostMapping
    public ResponseEntity<CourseResponse> create(@CurrentMember Member member, @Valid @RequestBody CourseRequest request) {
        CourseResponse created = courseService.create(member.getId(), request);
        return ResponseEntity.created(URI.create("/api/courses/" + created.id())).body(created);
    }

    @PutMapping("/{courseId}")
    public CourseResponse update(@CurrentMember Member member, @PathVariable @Positive Long courseId,
            @Valid @RequestBody CourseRequest request) {
        return courseService.update(member.getId(), courseId, request);
    }

    @DeleteMapping("/{courseId}")
    public ResponseEntity<Void> delete(@CurrentMember Member member, @PathVariable @Positive Long courseId) {
        courseService.delete(member.getId(), courseId);
        return ResponseEntity.noContent().build();
    }
}
