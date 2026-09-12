package com.itsup.incheonguro.Stamp.controller;


import com.itsup.incheonguro.Stamp.dto.LocationRequest;
import com.itsup.incheonguro.Stamp.dto.MyStampResponse;
import com.itsup.incheonguro.Stamp.service.StampService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;


@RestController
@RequestMapping("/stamp")
@RequiredArgsConstructor
public class StampController {


    private final StampService stampService;


    /*
     * 현재 위치 확인
     */
    @PostMapping("/location")
    public ResponseEntity<?> location(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody LocationRequest request
    ) {

        Long memberId =
                Long.valueOf(jwt.getSubject());

        return ResponseEntity.ok(
                stampService.checkLocation(
                        memberId,
                        request
                )
        );
    }



    /*
     * 스탬프 획득
     */
    @PostMapping("/{regionId}/claim")
    public ResponseEntity<?> claim(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long regionId
    ) {

        Long memberId =
                Long.valueOf(jwt.getSubject());


        stampService.claim(
                memberId,
                regionId
        );


        return ResponseEntity.ok(
                "스탬프 획득 완료"
        );
    }



    /*
     * 내가 가진 스탬프 조회
     */
    @GetMapping("/my")
    public ResponseEntity<List<MyStampResponse>> getMyStamps(
            @AuthenticationPrincipal Jwt jwt
    ) {

        Long memberId =
                Long.valueOf(jwt.getSubject());


        return ResponseEntity.ok(
                stampService.getMyStamps(memberId)
        );
    }

}
