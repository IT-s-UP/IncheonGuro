package com.itsup.incheonguro.RegionRecommendPage.service;

import com.itsup.incheonguro.RegionRecommendPage.dto.RegionRecommendRequest;
import com.itsup.incheonguro.RegionRecommendPage.dto.RegionRecommendResponse;
import com.itsup.incheonguro.RegionRecommendPage.dto.RegionSummaryResponse;
import com.itsup.incheonguro.RegionRecommendPage.entity.Region;
import com.itsup.incheonguro.RegionRecommendPage.repository.RegionRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class RegionRecommendService {

    private final RegionRepository regionRepository;

    /**
     * 관심 구/군 선택 등에 쓰이는 지역 목록(id, 이름)을 조회합니다.
     */
    public List<RegionSummaryResponse> findAll() {
        return regionRepository.findAll().stream()
                .map(RegionSummaryResponse::from)
                .toList();
    }

    /**
     * 사용자의 선택을 기준으로
     * 인천 지역 한 곳을 추천합니다.
     */
    public RegionRecommendResponse recommend(
            RegionRecommendRequest request) {

        List<Region> regions = regionRepository.findAll();

        if (regions.isEmpty()) {

            throw new IllegalStateException(
                    "추천할 지역 데이터가 없습니다.");
        }

        /*
         * 모든 지역의 최종 점수를 계산합니다.
         */
        List<RegionScore> regionScores = new ArrayList<>();

        for (Region region : regions) {

            int score = calculateScore(
                    region,
                    request);

            regionScores.add(
                    new RegionScore(
                            region,
                            score));
        }

        /*
         * 가장 높은 점수를 찾습니다.
         */
        int maxScore = regionScores.stream()
                .mapToInt(RegionScore::score)
                .max()
                .orElseThrow();

        /*
         * 최고 점수와 동일한 지역들을 찾습니다.
         */
        List<RegionScore> candidates = regionScores.stream()
                .filter(
                        regionScore -> regionScore.score() == maxScore)
                .toList();

        /*
         * 동점이면 랜덤으로 하나를 선택합니다.
         */
        RegionScore selectedRegion = candidates.get(
                ThreadLocalRandom.current()
                        .nextInt(candidates.size()));

        Region region = selectedRegion.region();

        return RegionRecommendResponse.builder()
                .regionName(
                        region.getRegionName())
                .description(
                        region.getDescription())
                .imageUrl(
                        region.getImageUrl())
                .score(
                        selectedRegion.score())
                .build();
    }

    /**
     * 지역별 최종 점수를 계산합니다.
     *
     * 최종 점수 =
     * 장소 점수
     * + 이동 점수
     * + 분위기 점수
     * + 동행 점수
     * + 지역 특화 보너스
     * + 관심 지역 보너스
     */
    private int calculateScore(
            Region region,
            RegionRecommendRequest request) {

        int score = 0;

        // ==========================================
        // 1. 장소 유형
        // ==========================================

        switch (request.getPlaceType()) {

            case "SEA":
                score += region.getSeaScore();
                break;

            case "NATURE":
                score += region.getNatureScore();
                break;

            case "FOOD":
                score += region.getFoodScore();
                break;

            case "MARKET":
                score += region.getMarketScore();
                break;

            case "CULTURE":
                score += region.getCultureScore();
                break;

            case "SHOPPING":
                score += region.getShoppingScore();
                break;

            case "HISTORY":
                score += region.getHistoryScore();
                break;

            default:
                break;
        }

        // ==========================================
        // 2. 이동 방식
        // ==========================================

        switch (request.getTransport()) {

            case "WALK":
                score += region.getWalkScore();
                break;

            case "PUBLIC":
                score += region.getPublicScore();
                break;

            case "CAR":
                score += region.getCarScore();
                break;

            case "SHORT":
                score += region.getShortScore();
                break;

            default:
                break;
        }

        // ==========================================
        // 3. 여행 분위기
        // ==========================================

        switch (request.getMood()) {

            case "SEA_NATURE":
                score += region.getSeaNatureScore();
                break;

            case "HEALING":
                score += region.getHealingScore();
                break;

            case "HISTORY":
                score += region.getHistoryMoodScore();
                break;

            case "FOODIE":
                score += region.getFoodieScore();
                break;

            case "ACTIVITY":
                score += region.getActivityScore();
                break;

            case "SHOPPING":
                score += region.getShoppingMoodScore();
                break;

            case "CITY":
                score += region.getCityScore();
                break;

            case "RETRO":
                score += region.getRetroScore();
                break;

            default:
                break;
        }

        // ==========================================
        // 4. 동행
        // ==========================================

        switch (request.getCompanion()) {

            case "ALONE":
                score += region.getAloneScore();
                break;

            case "COUPLE":
                score += region.getCoupleScore();
                break;

            case "FRIEND":
                score += region.getFriendScore();
                break;

            case "FAMILY":
                score += region.getFamilyScore();
                break;

            default:
                break;
        }

        // ==========================================
        // 5. 지역 특화 보너스
        // ==========================================

        score += calculateSpecialtyBonus(
                region,
                request);

        // ==========================================
        // 6. 회원가입 관심 지역 보너스
        // ==========================================

        score += calculateInterestedRegionBonus(
                region,
                request);

        return score;
    }

    /**
     * 지역별 대표 선택 조합에 대한 추가 점수입니다.
     *
     * 단순히 NATURE 같은 하나의 선택만 보고
     * 큰 점수를 주지 않고,
     * 여러 선택의 조합이 맞을 때 추가 점수를 줍니다.
     */
    private int calculateSpecialtyBonus(
            Region region,
            RegionRecommendRequest request) {

        String regionName = region.getRegionName();

        String placeType = request.getPlaceType();

        String transport = request.getTransport();

        String mood = request.getMood();

        String companion = request.getCompanion();

        // ==========================================
        // 제물포구
        // 역사 + 걷기 + 레트로 + 연인
        // ==========================================

        if ("제물포구".equals(regionName)) {

            if ("HISTORY".equals(placeType)
                    && "WALK".equals(transport)
                    && "RETRO".equals(mood)) {

                return 80;
            }

            if ("CULTURE".equals(placeType)
                    && "RETRO".equals(mood)) {

                return 60;
            }
        }

        // ==========================================
        // 영종구
        // 바다 + 자차 + 바다/자연 + 연인
        // ==========================================

        if ("영종구".equals(regionName)) {

            if ("SEA".equals(placeType)
                    && "CAR".equals(transport)
                    && "SEA_NATURE".equals(mood)
                    && "COUPLE".equals(companion)) {

                return 100;
            }

            if ("SEA".equals(placeType)
                    && "CAR".equals(transport)
                    && "COUPLE".equals(companion)) {

                return 60;
            }
        }

        // ==========================================
        // 미추홀구
        // 문화 + 대중교통 + 도시 + 친구
        // ==========================================

        if ("미추홀구".equals(regionName)) {

            if ("CULTURE".equals(placeType)
                    && "PUBLIC".equals(transport)
                    && "CITY".equals(mood)
                    && "FRIEND".equals(companion)) {

                return 90;
            }

            if ("CULTURE".equals(placeType)
                    && "CITY".equals(mood)) {

                return 50;
            }
        }

        // ==========================================
        // 연수구
        // 쇼핑 + 대중교통/자차 + 도시 + 연인
        // ==========================================

        if ("연수구".equals(regionName)) {

            if ("SHOPPING".equals(placeType)
                    && "CITY".equals(mood)
                    && "COUPLE".equals(companion)) {

                return 100;
            }

            if ("SHOPPING".equals(placeType)
                    && "CITY".equals(mood)) {

                return 60;
            }
        }

        // ==========================================
        // 남동구
        // 시장 + 먹거리 + 친구
        // ==========================================

        if ("남동구".equals(regionName)) {

            if ("MARKET".equals(placeType)
                    && "FOODIE".equals(mood)
                    && "FRIEND".equals(companion)) {

                return 100;
            }

            if ("MARKET".equals(placeType)
                    && "FOODIE".equals(mood)) {

                return 60;
            }
        }

        // ==========================================
        // 부평구
        // 맛집 + 활동/쇼핑 + 친구
        // ==========================================

        if ("부평구".equals(regionName)) {

            if ("FOOD".equals(placeType)
                    && "ACTIVITY".equals(mood)
                    && "FRIEND".equals(companion)) {

                return 100;
            }

            if ("FOOD".equals(placeType)
                    && "FRIEND".equals(companion)) {

                return 60;
            }
        }

        // ==========================================
        // 계양구
        // 자연 + 걷기 + 힐링 + 혼자
        // ==========================================

        if ("계양구".equals(regionName)) {

            if ("NATURE".equals(placeType)
                    && "WALK".equals(transport)
                    && "HEALING".equals(mood)
                    && "ALONE".equals(companion)) {

                return 120;
            }

            if ("NATURE".equals(placeType)
                    && "WALK".equals(transport)
                    && "HEALING".equals(mood)) {

                return 70;
            }
        }

        // ==========================================
        // 서해구
        // 자연 + 자차 + 힐링 + 가족
        // ==========================================

        if ("서해구".equals(regionName)) {

            if ("NATURE".equals(placeType)
                    && "CAR".equals(transport)
                    && "HEALING".equals(mood)
                    && "FAMILY".equals(companion)) {

                return 120;
            }

            if ("NATURE".equals(placeType)
                    && "HEALING".equals(mood)
                    && "FAMILY".equals(companion)) {

                return 70;
            }
        }

        // ==========================================
        // 검단구
        // 도시 + 자차 + 가족
        // ==========================================

        if ("검단구".equals(regionName)) {

            if ("CITY".equals(mood)
                    && "CAR".equals(transport)
                    && "FAMILY".equals(companion)) {

                return 120;
            }

            if ("CITY".equals(mood)
                    && "FAMILY".equals(companion)) {

                return 80;
            }
        }

        // ==========================================
        // 강화군
        // 역사 + 자차 + 역사 분위기 + 가족
        // ==========================================

        if ("강화군".equals(regionName)) {

            if ("HISTORY".equals(placeType)
                    && "CAR".equals(transport)
                    && "HISTORY".equals(mood)
                    && "FAMILY".equals(companion)) {

                return 120;
            }

            if ("HISTORY".equals(placeType)
                    && "HISTORY".equals(mood)) {

                return 70;
            }
        }

        // ==========================================
        // 옹진군
        // 바다 + 자차 + 바다/자연 + 가족
        // ==========================================

        if ("옹진군".equals(regionName)) {

            if ("SEA".equals(placeType)
                    && "CAR".equals(transport)
                    && "SEA_NATURE".equals(mood)
                    && "FAMILY".equals(companion)) {

                return 120;
            }

            if ("SEA".equals(placeType)
                    && "SEA_NATURE".equals(mood)) {

                return 70;
            }
        }

        return 0;
    }

    /**
     * 회원가입 때 저장한 관심 지역에 대한 보너스입니다.
     *
     * 현재는 Request에 관심 지역을 직접 넣는 방식입니다.
     *
     * 나중에는 로그인 사용자 정보를 조회해서
     * 관심 지역을 가져오도록 변경하면 됩니다.
     */
    private int calculateInterestedRegionBonus(
            Region region,
            RegionRecommendRequest request) {

        String interestedRegion = request.getInterestedRegion();

        // 관심 지역을 선택하지 않은 경우
        if (interestedRegion == null
                || interestedRegion.isBlank()) {

            return 0;
        }

        // 관심 지역과 현재 지역이 같은 경우
        if (region.getRegionName()
                .equals(interestedRegion)) {

            return 30;
        }

        return 0;
    }

    /**
     * 지역과 계산된 점수를 함께 보관하기 위한 내부 record
     */
    private record RegionScore(
            Region region,
            int score) {
    }
}
