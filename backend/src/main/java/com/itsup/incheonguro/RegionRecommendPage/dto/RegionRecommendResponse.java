package com.itsup.incheonguro.RegionRecommendPage.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RegionRecommendResponse {

    private String regionName;

    private String description;

    private String imageUrl;

    private int score;
}
