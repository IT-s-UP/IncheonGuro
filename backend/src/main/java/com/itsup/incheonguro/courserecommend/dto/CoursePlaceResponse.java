package com.itsup.incheonguro.courserecommend.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CoursePlaceResponse {

    private long id;

    private String name;

    private String category;

    private String description;

    private String imageUrl;
}
