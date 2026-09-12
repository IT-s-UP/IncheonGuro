package com.itsup.incheonguro.Festival.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class FestivalDetailResponse {

    private String title;

    private String imageUrl;

    private String location;

    private String tel;

    private String description;

    private String startDate;

    private String endDate;

}
