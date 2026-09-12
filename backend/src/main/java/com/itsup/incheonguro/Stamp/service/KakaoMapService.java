package com.itsup.incheonguro.Stamp.service;

import com.itsup.incheonguro.Stamp.dto.KakaoRegionResponse;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import org.springframework.web.client.RestTemplate;

import org.springframework.http.*;

@Service
@RequiredArgsConstructor
public class KakaoMapService {

    @Value("${kakao.rest-api-key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public String getDistrict(
            double latitude,
            double longitude) {

        String url = "https://dapi.kakao.com/v2/local/geo/coord2regioncode.json"
                +
                "?x=" + longitude
                +
                "&y=" + latitude;

        HttpHeaders headers = new HttpHeaders();

        headers.set(
                "Authorization",
                "KakaoAK " + apiKey);

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<KakaoRegionResponse> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                entity,
                KakaoRegionResponse.class);

        return response
                .getBody()
                .getDocuments()
                .get(0)
                .getRegion_2depth_name();

    }

}
