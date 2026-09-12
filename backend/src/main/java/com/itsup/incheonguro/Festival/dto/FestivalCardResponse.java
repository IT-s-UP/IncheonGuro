package com.itsup.incheonguro.Festival.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class FestivalCardResponse {

    private String contentId;

    private String title;

    private String imageUrl;

    private String location;

    private String startDate;

    private String endDate;

}
