package com.itsup.incheonguro.courserecommend.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class CourseDayResponse {

    private int day;

    private String title;

    private List<CoursePlaceResponse> places;

    private List<CourseCostResponse> costs;

    private int totalCost;
}
