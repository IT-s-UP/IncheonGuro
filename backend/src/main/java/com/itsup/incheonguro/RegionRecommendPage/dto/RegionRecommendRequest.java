package com.itsup.incheonguro.RegionRecommendPage.dto;

import jakarta.validation.constraints.NotBlank;

import lombok.Getter;

@Getter
public class RegionRecommendRequest {

    // 가고 싶은 장소
    @NotBlank
    private String placeType;

    // 이동 방식
    @NotBlank
    private String transport;

    // 여행 분위기
    @NotBlank
    private String mood;

    // 함께하는 사람
    @NotBlank
    private String companion;

    /*
     * 관심 지역
     *
     * 현재는 선택적으로 사용합니다.
     *
     * 회원가입 API가 완성되면
     * 로그인한 사용자의 관심 지역을
     * 서버에서 가져오는 방식으로 변경할 수 있습니다.
     */
    private String interestedRegion;
}
