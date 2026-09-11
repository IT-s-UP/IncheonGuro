package com.itsup.incheonguro.RegionRecommendPage.controller;

import com.itsup.incheonguro.RegionRecommendPage.dto.RegionRecommendRequest;
import com.itsup.incheonguro.RegionRecommendPage.dto.RegionRecommendResponse;
import com.itsup.incheonguro.RegionRecommendPage.service.RegionRecommendService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/region")
public class RegionRecommendController {

    private final RegionRecommendService regionRecommendService;

    /**
     * 인천 지역 추천
     *
     * POST /api/region/recommend
     */
    @PostMapping("/recommend")
    public RegionRecommendResponse recommend(
            @Valid @RequestBody RegionRecommendRequest request) {

        return regionRecommendService.recommend(request);
    }
}
