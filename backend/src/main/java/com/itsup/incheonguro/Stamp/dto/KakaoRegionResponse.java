package com.itsup.incheonguro.Stamp.dto;


import lombok.Getter;

import java.util.List;


@Getter
public class KakaoRegionResponse {


    private List<Document> documents;



    @Getter
    public static class Document {


        private String region_1depth_name;


        private String region_2depth_name;


        private String region_3depth_name;

    }

}
