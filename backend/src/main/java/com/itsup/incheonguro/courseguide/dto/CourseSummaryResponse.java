package com.itsup.incheonguro.courseguide.dto;

// 코스 목록 / 추천 코스 조회에서 사용하는 응답 (관광공사 API 응답 기반)
// description은 지금은 코스 주소(addr1)를 대신 사용. 실제 "코스 설명" 텍스트가 필요하면
// detailCommon2의 overview를 코스마다 추가 조회해야 해서 API 호출이 코스 개수만큼 늘어남 - 팀 결정 필요
public record CourseSummaryResponse(
        String courseId,
        String name,
        String description,
        String imageUrl,
        boolean isBookmarked) {
}
