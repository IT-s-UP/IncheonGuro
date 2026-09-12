package com.itsup.incheonguro.Stamp.service;


import com.itsup.incheonguro.RegionRecommendPage.entity.Region;
import com.itsup.incheonguro.RegionRecommendPage.repository.RegionRepository;

import com.itsup.incheonguro.Stamp.dto.LocationRequest;
import com.itsup.incheonguro.Stamp.dto.LocationResponse;
import com.itsup.incheonguro.Stamp.dto.MyStampResponse;

import com.itsup.incheonguro.Stamp.entity.MemberRegionStay;
import com.itsup.incheonguro.Stamp.entity.MemberStamp;

import com.itsup.incheonguro.Stamp.repository.MemberRegionStayRepository;
import com.itsup.incheonguro.Stamp.repository.MemberStampRepository;


import lombok.RequiredArgsConstructor;


import org.springframework.stereotype.Service;


import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;



@Service
@RequiredArgsConstructor
public class StampService {


    private final KakaoMapService kakaoMapService;

    private final RegionRepository regionRepository;

    private final MemberRegionStayRepository stayRepository;

    private final MemberStampRepository stampRepository;



    /*
     * 현재 위치 확인
     * GPS 좌표 -> 카카오 API -> 지역 확인
     */
    public LocationResponse checkLocation(
            Long memberId,
            LocationRequest request
    ){


        String district =
                kakaoMapService.getDistrict(
                        request.getLatitude(),
                        request.getLongitude()
                );



        Region region =
                regionRepository
                        .findByRegionName(district)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "해당 지역을 찾을 수 없습니다."
                                )
                        );



        MemberRegionStay stay =
                stayRepository
                        .findByMemberIdAndRegionId(
                                memberId,
                                region.getId()
                        )
                        .orElseGet(() ->
                                stayRepository.save(
                                        new MemberRegionStay(
                                                memberId,
                                                region.getId()
                                        )
                                )
                        );



        long minutes =
                Duration.between(
                        stay.getEnteredAt(),
                        LocalDateTime.now()
                )
                .toMinutes();



        if(minutes >= 10){

            stay.activate();

            stayRepository.save(stay);

        }



        return new LocationResponse(
                region.getId(),
                region.getRegionName(),
                minutes,
                stay.isActivated()
        );

    }




    /*
     * 스탬프 획득
     */
    public void claim(
            Long memberId,
            Long regionId
    ){


        if(
                stampRepository.existsByMemberIdAndRegionId(
                        memberId,
                        regionId
                )
        ){

            throw new RuntimeException(
                    "이미 획득한 스탬프입니다."
            );

        }



        stampRepository.save(
                new MemberStamp(
                        memberId,
                        regionId
                )
        );

    }





    /*
     * 내가 획득한 스탬프 조회
     */
    public List<MyStampResponse> getMyStamps(
            Long memberId
    ){


        return stampRepository
                .findByMemberId(memberId)
                .stream()
                .map(stamp -> {


                    Region region =
                            regionRepository
                                    .findById(
                                            stamp.getRegionId()
                                    )
                                    .orElseThrow(
                                            () -> new RuntimeException(
                                                    "지역 정보를 찾을 수 없습니다."
                                            )
                                    );



                    return new MyStampResponse(
                            region.getId(),
                            region.getRegionName(),
                            region.getImageUrl(),
                            stamp.getAchievedAt()
                    );

                })
                .collect(Collectors.toList());

    }

}
