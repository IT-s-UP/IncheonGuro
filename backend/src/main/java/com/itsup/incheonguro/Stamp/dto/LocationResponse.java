package com.itsup.incheonguro.Stamp.dto;


import lombok.AllArgsConstructor;
import lombok.Getter;


@Getter
@AllArgsConstructor
public class LocationResponse {


    private Long regionId;


    private String regionName;


    private long stayMinutes;


    private boolean activated;

}
