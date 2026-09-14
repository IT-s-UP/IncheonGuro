package com.itsup.incheonguro.RegionRecommendPage.controller;

import com.itsup.incheonguro.RegionRecommendPage.dto.RegionRecommendRequest;
import com.itsup.incheonguro.RegionRecommendPage.dto.RegionRecommendResponse;
import com.itsup.incheonguro.RegionRecommendPage.dto.RegionSummaryResponse;
import com.itsup.incheonguro.RegionRecommendPage.service.RegionRecommendService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/region")
public class RegionRecommendController {

    private final RegionRecommendService regionRecommendService;

    /**
     * 지역 목록 조회 (관심 구/군 선택 등에 사용)
     *
     * GET /api/region
     */
    @GetMapping
    public List<RegionSummaryResponse> list() {
        return regionRecommendService.findAll();
    }

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
