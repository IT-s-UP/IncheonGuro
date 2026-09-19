package com.itsup.incheonguro.RegionRecommendPage.controller;

import com.itsup.incheonguro.RegionRecommendPage.dto.RegionRecommendRequest;
import com.itsup.incheonguro.RegionRecommendPage.dto.RegionRecommendResponse;
import com.itsup.incheonguro.RegionRecommendPage.dto.RegionRecommendedResponse;
import com.itsup.incheonguro.RegionRecommendPage.dto.RegionSummaryResponse;
import com.itsup.incheonguro.RegionRecommendPage.service.RegionRecommendService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/region")
public class RegionRecommendController {

    private final RegionRecommendService regionRecommendService;

    /**
     * 지역 목록 조회
     *
     * GET /api/region
     */
    @GetMapping
    public List<RegionSummaryResponse> list() {

        return regionRecommendService.findAll();
    }

    /**
     * 현재 로그인한 사용자의 GUMBTI 추천 지역 조회
     *
     * GET /api/region/recommended
     *
     * 추천 결과가 있으면
     * regionId와 regionName을 반환합니다.
     *
     * 추천 결과가 없으면
     * regionId와 regionName은 null입니다.
     */
    @GetMapping("/recommended")
    public RegionRecommendedResponse getRecommendedRegion(
            @AuthenticationPrincipal Jwt jwt) {

        Long memberId = Long.valueOf(jwt.getSubject());

        return regionRecommendService.getRecommendedRegion(memberId);
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

        Long memberId = Long.valueOf(jwt.getSubject());

        return regionRecommendService.recommend(
                request,
                memberId);
    }
}
