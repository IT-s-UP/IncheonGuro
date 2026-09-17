package com.itsup.incheonguro.mypage.dto;

// GET /api/mypage/stats 응답
// [추가] 마이페이지 메뉴 드로어(북마크 숫자)용 통계 응답
// 북마크 개수(장소 북마크 + 코스 북마크 합산)만 집계함
public record MyPageStatsResponse(
    int bookmarkCount) {
}
