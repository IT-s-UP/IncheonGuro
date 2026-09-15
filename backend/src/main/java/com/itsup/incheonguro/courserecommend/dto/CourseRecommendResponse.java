package com.itsup.incheonguro.courserecommend.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class CourseRecommendResponse {

    private String id;

    private String title;

    private String description;

    private String mapLabel;

    private List<CourseDayResponse> days;
}
