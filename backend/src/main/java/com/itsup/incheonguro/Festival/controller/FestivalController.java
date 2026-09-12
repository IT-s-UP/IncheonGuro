package com.itsup.incheonguro.Festival.controller;

import com.itsup.incheonguro.Festival.dto.*;
import com.itsup.incheonguro.Festival.service.FestivalService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/festivals")
@RequiredArgsConstructor
public class FestivalController {

    private final FestivalService festivalService;

    // 인기 TOP5

    @GetMapping("/popular")
    public ResponseEntity<List<PopularFestivalResponse>> popular()
            throws Exception {

        return ResponseEntity.ok(
                festivalService.getPopularFestivals());

    }

    // 구/군별 조회

    @GetMapping
    public ResponseEntity<List<FestivalCardResponse>> region(
            @RequestParam String region)
            throws Exception {

        return ResponseEntity.ok(
                festivalService.getFestivalByRegion(region));

    }

    // 상세

    @GetMapping("/{contentId}")
    public ResponseEntity<FestivalDetailResponse> detail(
            @PathVariable String contentId)
            throws Exception {

        return ResponseEntity.ok(
                festivalService.getDetail(contentId));

    }

}
