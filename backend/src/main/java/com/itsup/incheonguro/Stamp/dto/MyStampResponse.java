package com.itsup.incheonguro.Stamp.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class MyStampResponse {

    private Long regionId;

    private String regionName;

    private String imageUrl;

    private LocalDateTime achievedAt;

}
