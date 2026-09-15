package com.itsup.incheonguro.courserecommend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import lombok.Getter;

import java.util.List;

@Getter
public class CourseRecommendRequest {

    // 이동 수단
    @NotBlank
    private String transport;

    // 여행 시작일 (yyyy-MM-dd)
    @NotBlank
    private String startDate;

    // 여행 종료일 (yyyy-MM-dd)
    @NotBlank
    private String endDate;

    // 일정 스타일 (빡빡한 일정 / 여유로운 일정)
    @NotBlank
    private String scheduleType;

    // 여행 스타일 (복수 선택)
    @NotEmpty
    private List<String> travelStyles;

    // 동행인
    @NotBlank
    private String companion;
}
