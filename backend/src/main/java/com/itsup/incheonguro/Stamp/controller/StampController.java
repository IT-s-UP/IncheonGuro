package com.itsup.incheonguro.Stamp.controller;

import com.itsup.incheonguro.Stamp.dto.LocationRequest;
import com.itsup.incheonguro.Stamp.dto.MyStampResponse;
import com.itsup.incheonguro.Stamp.service.StampService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
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
     * 스탬프 획득
     *
     * 사용자가 스탬프를 클릭하면
     * 현재 GPS 좌표를 받아 실제 해당 지역에 있는지 확인한 후
     * 스탬프를 획득합니다.
     */
    @PostMapping("/{regionId}/claim")
    public ResponseEntity<?> claim(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long regionId,
            @RequestBody LocationRequest request) {

        Long memberId = Long.valueOf(jwt.getSubject());

        try {
            stampService.claim(
                    memberId,
                    regionId,
                    request);

            return ResponseEntity.ok("스탬프 획득 완료");

        } catch (IllegalStateException e) {

            /*
             * 이미 획득한 스탬프
             */
            if ("ALREADY_CLAIMED".equals(e.getMessage())) {
                return ResponseEntity
                        .status(HttpStatus.CONFLICT)
                        .body("이미 획득한 스탬프입니다.");
            }

            throw e;
        }
    }

    /*
     * 내가 가진 스탬프 조회
     */
    @GetMapping("/my")
    public ResponseEntity<List<MyStampResponse>> getMyStamps(
            @AuthenticationPrincipal Jwt jwt) {

        Long memberId = Long.valueOf(jwt.getSubject());

        return ResponseEntity.ok(
                stampService.getMyStamps(memberId));
    }
}
