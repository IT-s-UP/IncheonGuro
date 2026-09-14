package com.itsup.incheonguro.RegionRecommendPage.dto;

import com.itsup.incheonguro.RegionRecommendPage.entity.Region;

public record RegionSummaryResponse(Long id, String regionName) {

    public static RegionSummaryResponse from(Region region) {
        return new RegionSummaryResponse(region.getId(), region.getRegionName());
    }
}
