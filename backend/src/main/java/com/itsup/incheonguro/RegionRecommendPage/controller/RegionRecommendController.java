package com.itsup.incheonguro.RegionRecommendPage.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;

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
            @Valid @RequestBody RegionRecommendRequest request,
            @AuthenticationPrincipal Jwt jwt) {

        System.out.println("===== 지역 추천 API 진입 =====");

        System.out.println("JWT = " + jwt);

        Long memberId = Long.valueOf(jwt.getSubject());

        System.out.println("회원 ID = " + memberId);

        RegionRecommendResponse response = regionRecommendService.recommend(
                request,
                memberId);

        System.out.println("===== 지역 추천 API 종료 =====");

        return response;
    }
}
