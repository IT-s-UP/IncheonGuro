package com.itsup.incheonguro.Stamp.service;

import com.itsup.incheonguro.RegionRecommendPage.entity.Region;
import com.itsup.incheonguro.RegionRecommendPage.repository.RegionRepository;
import com.itsup.incheonguro.Stamp.dto.LocationRequest;
import com.itsup.incheonguro.Stamp.dto.MyStampResponse;
import com.itsup.incheonguro.Stamp.entity.MemberStamp;
import com.itsup.incheonguro.Stamp.repository.MemberStampRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StampService {

    private final KakaoMapService kakaoMapService;
    private final RegionRepository regionRepository;
    private final MemberStampRepository stampRepository;

    /*
     * 스탬프 획득
     *
     * 1. 클릭한 스탬프 지역 확인
     * 2. 사용자의 현재 GPS 좌표 확인
     * 3. 카카오 API를 통해 현재 구/군 확인
     * 4. 클릭한 지역과 현재 지역이 같은지 확인
     * 5. 이미 획득한 스탬프인지 확인
     * 6. 스탬프 저장
     */
    public void claim(
            Long memberId,
            Long regionId,
            LocationRequest request) {

        /*
         * 1. 클릭한 스탬프 지역 확인
         */
        Region targetRegion = regionRepository
                .findById(regionId)
                .orElseThrow(
                        () -> new RuntimeException(
                                "해당 지역을 찾을 수 없습니다."));

        /*
         * 2. 현재 GPS 좌표를 이용하여
         * 사용자가 실제 위치한 구/군 확인
         */
        String currentDistrict = kakaoMapService.getDistrict(
                request.getLatitude(),
                request.getLongitude());

        /*
         * 테스트를 위해 현재 위치를 콘솔에서 확인
         */
        System.out.println("===== 스탬프 위치 확인 =====");
        System.out.println("클릭한 지역 ID = " + regionId);
        System.out.println("클릭한 지역 = " + targetRegion.getRegionName());
        System.out.println("현재 GPS 위도 = " + request.getLatitude());
        System.out.println("현재 GPS 경도 = " + request.getLongitude());
        System.out.println("카카오 현재 지역 = " + currentDistrict);

        /*
         * 3. 현재 위치한 지역과
         * 클릭한 스탬프 지역이 다른 경우
         */
        if (!targetRegion
                .getRegionName()
                .equals(currentDistrict)) {

            System.out.println("지역 불일치 → 스탬프 획득 거부");

            throw new IllegalArgumentException(
                    "현재 위치에서는 해당 스탬프를 획득할 수 없습니다.");
        }

        /*
         * 4. 이미 획득한 스탬프인지 확인
         */
        if (stampRepository.existsByMemberIdAndRegionId(
                memberId,
                regionId)) {

            System.out.println("이미 획득한 스탬프 → 409");

            throw new IllegalStateException(
                    "ALREADY_CLAIMED");
        }

        /*
         * 5. 스탬프 저장
         */
        stampRepository.save(
                new MemberStamp(
                        memberId,
                        regionId));

        System.out.println("스탬프 획득 완료");
    }

    /*
     * 내가 획득한 스탬프 조회
     */
    public List<MyStampResponse> getMyStamps(
            Long memberId) {

        return stampRepository
                .findByMemberId(memberId)
                .stream()
                .map(stamp -> {

                    Region region = regionRepository
                            .findById(
                                    stamp.getRegionId())
                            .orElseThrow(
                                    () -> new RuntimeException(
                                            "지역 정보를 찾을 수 없습니다."));

                    return new MyStampResponse(
                            region.getId(),
                            region.getRegionName(),
                            region.getImageUrl(),
                            stamp.getAchievedAt());
                })
                .collect(Collectors.toList());
    }
}
