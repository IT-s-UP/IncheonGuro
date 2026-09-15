package com.itsup.incheonguro.courserecommend.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CourseCostResponse {

    private long id;

    private String label;

    private int amount;
}
