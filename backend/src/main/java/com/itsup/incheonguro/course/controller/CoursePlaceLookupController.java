package com.itsup.incheonguro.course.controller;

import com.itsup.incheonguro.course.dto.TourPlaceResponse;
import com.itsup.incheonguro.course.service.TourPlaceService;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/** 내 코스에 추가할 장소 조회. 외부 장소 ID는 코스 DB의 장소 ID와 별개입니다. */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/courses/places")
public class CoursePlaceLookupController {
    private final TourPlaceService tourPlaceService;

    // keyword를 생략하면 인천 장소 목록, 입력하면 인천 내 키워드 검색입니다.
    @GetMapping
    public TourPlaceResponse.Page search(
            @RequestParam(required = false) @Size(max = 100) String keyword,
            @RequestParam(required = false) @Pattern(regexp = "12|14|15|28|32|38|39") String contentTypeId,
            @RequestParam(defaultValue = "1") @Min(1) @Max(1000) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
        return tourPlaceService.search(keyword, contentTypeId, page, size);
    }

    @GetMapping("/{contentId}")
    public TourPlaceResponse.Detail detail(
            @PathVariable @Pattern(regexp = "[1-9][0-9]{0,18}") String contentId) {
        return tourPlaceService.detail(contentId);
    }
}
