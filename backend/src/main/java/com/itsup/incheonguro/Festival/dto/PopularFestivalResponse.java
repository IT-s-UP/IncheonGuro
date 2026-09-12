package com.itsup.incheonguro.Festival.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PopularFestivalResponse {

    private String contentId;

    private String title;

    private String imageUrl;

    private String startDate;

    private String endDate;

}
