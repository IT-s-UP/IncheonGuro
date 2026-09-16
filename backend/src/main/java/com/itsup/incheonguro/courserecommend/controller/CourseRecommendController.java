package com.itsup.incheonguro.courserecommend.controller;

import com.itsup.incheonguro.Auth.entity.Member;
import com.itsup.incheonguro.Auth.support.CurrentMember;
import com.itsup.incheonguro.courserecommend.dto.CourseRecommendRequest;
import com.itsup.incheonguro.courserecommend.dto.CourseRecommendResponse;
import com.itsup.incheonguro.courserecommend.service.CourseRecommendService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/course-recommend")
public class CourseRecommendController {

    private final CourseRecommendService courseRecommendService;

    /**
     * 맞춤 코스 추천
     *
     * POST /api/course-recommend/recommend
     */
    @PostMapping("/recommend")
    public CourseRecommendResponse recommend(
            @Valid @RequestBody CourseRecommendRequest request,
            @CurrentMember Member member) {

        return courseRecommendService.recommend(request, member);
    }
}
