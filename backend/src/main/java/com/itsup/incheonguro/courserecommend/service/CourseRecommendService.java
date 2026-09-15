package com.itsup.incheonguro.courserecommend.service;

import com.itsup.incheonguro.courserecommend.dto.CourseCostResponse;
import com.itsup.incheonguro.courserecommend.dto.CourseDayResponse;
import com.itsup.incheonguro.courserecommend.dto.CoursePlaceResponse;
import com.itsup.incheonguro.courserecommend.dto.CourseRecommendRequest;
import com.itsup.incheonguro.courserecommend.dto.CourseRecommendResponse;
import com.itsup.incheonguro.placeguide.dto.PlaceSummaryResponse;
import com.itsup.incheonguro.placeguide.entity.PlaceCategory;
import com.itsup.incheonguro.placeguide.service.PlaceGuideService;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.EnumMap;
import java.util.EnumSet;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * PlaceGuide(관광공사 실시간 API)에서 실제 장소를 가져와
 * 여행 스타일/기간/일정 강도에 맞춰 코스를 조합하는 서비스.
 *
 * 지리적 동선 최적화는 하지 않으며, 비용은 카테고리별 평균 추정치입니다.
 */
@Service
@RequiredArgsConstructor
public class CourseRecommendService {

    private static final int MAX_DAYS = 10;

    // 여행 스타일 → 장소 카테고리 매핑
    private static final Map<String, Set<PlaceCategory>> STYLE_TO_CATEGORIES = Map.of(
            "힐링", EnumSet.of(PlaceCategory.CAFE, PlaceCategory.ATTRACTION),
            "맛집 탐방", EnumSet.of(PlaceCategory.RESTAURANT),
            "쇼핑", EnumSet.of(PlaceCategory.SHOPPING),
            "관광", EnumSet.of(PlaceCategory.ATTRACTION),
            "SNS 핫플레이스", EnumSet.of(PlaceCategory.CAFE, PlaceCategory.SHOPPING),
            "체험 / 액티비티", EnumSet.of(PlaceCategory.ATTRACTION),
            "문화 / 예술 / 역사", EnumSet.of(PlaceCategory.ATTRACTION),
            "자연", EnumSet.of(PlaceCategory.ATTRACTION));

    // 이동 수단별 하루 교통비 추정치
    private static final Map<String, Integer> TRANSPORT_DAILY_COST = Map.of(
            "도보", 0,
            "자전거", 0,
            "대중교통", 5000,
            "자차", 10000,
            "택시", 20000,
            "공유차 / 렌터카", 15000);

    // 카테고리별 1인 평균 비용 추정치
    private static final Map<PlaceCategory, Integer> CATEGORY_AVG_COST = Map.of(
            PlaceCategory.ATTRACTION, 8000,
            PlaceCategory.CAFE, 7000,
            PlaceCategory.RESTAURANT, 15000,
            PlaceCategory.SHOPPING, 20000);

    // 장소 카드에 표시할 카테고리 한글 라벨
    private static final Map<PlaceCategory, String> CATEGORY_LABEL = Map.of(
            PlaceCategory.ATTRACTION, "관광지",
            PlaceCategory.CAFE, "카페",
            PlaceCategory.RESTAURANT, "식당",
            PlaceCategory.SHOPPING, "쇼핑");

    // 비용 항목에 표시할 카테고리 한글 라벨
    private static final Map<PlaceCategory, String> CATEGORY_COST_LABEL = Map.of(
            PlaceCategory.ATTRACTION, "입장료",
            PlaceCategory.CAFE, "카페 비용",
            PlaceCategory.RESTAURANT, "식비",
            PlaceCategory.SHOPPING, "쇼핑 비용");

    private final PlaceGuideService placeGuideService;

    public CourseRecommendResponse recommend(CourseRecommendRequest request) {
        LocalDate startDate;
        LocalDate endDate;

        try {
            startDate = LocalDate.parse(request.getStartDate());
            endDate = LocalDate.parse(request.getEndDate());
        } catch (java.time.format.DateTimeParseException e) {
            throw new IllegalArgumentException("여행 날짜 형식이 올바르지 않습니다.");
        }

        long totalDays = ChronoUnit.DAYS.between(startDate, endDate) + 1;

        if (totalDays < 1) {
            throw new IllegalArgumentException("여행 종료일은 시작일 이후여야 합니다.");
        }

        int days = (int) Math.min(totalDays, MAX_DAYS);
        int placesPerDay = "빡빡하고 바쁜, 많은 일정".equals(request.getScheduleType()) ? 4 : 3;

        List<PlaceSummaryResponse> pool = buildPlacePool(request.getTravelStyles());

        List<PlaceSummaryResponse> itinerary = buildItinerary(pool, days * placesPerDay);

        int transportCost = TRANSPORT_DAILY_COST.getOrDefault(request.getTransport(), 0);

        long[] placeIdSeq = { 1 };
        long[] costIdSeq = { 1 };

        List<CourseDayResponse> dayResponses = new ArrayList<>();

        for (int day = 1; day <= days; day++) {
            List<PlaceSummaryResponse> dayPlaces = itinerary.subList(
                    (day - 1) * placesPerDay,
                    day * placesPerDay);

            dayResponses.add(buildDay(day, dayPlaces, transportCost, placeIdSeq, costIdSeq));
        }

        return CourseRecommendResponse.builder()
                .id(UUID.randomUUID().toString())
                .title(String.join(" · ", request.getTravelStyles()) + " 코스")
                .description("선택하신 여행 스타일에 맞춰 인천의 실제 장소로 구성한 " + days + "일 코스예요.")
                .mapLabel("인천 맞춤 코스 지도")
                .days(dayResponses)
                .build();
    }

    /**
     * 선택한 여행 스타일에 해당하는 카테고리의 실제 장소를 관광공사 API에서 가져와
     * 이름 기준으로 중복 제거한 후보 목록을 만듭니다.
     */
    private List<PlaceSummaryResponse> buildPlacePool(List<String> travelStyles) {
        Set<PlaceCategory> categories = travelStyles.stream()
                .map(STYLE_TO_CATEGORIES::get)
                .filter(java.util.Objects::nonNull)
                .flatMap(Set::stream)
                .collect(Collectors.toCollection(LinkedHashSet::new));

        if (categories.isEmpty()) {
            categories = EnumSet.of(PlaceCategory.ATTRACTION);
        }

        List<PlaceSummaryResponse> places = placeGuideService.getPlaces(null, new ArrayList<>(categories));

        Map<String, PlaceSummaryResponse> uniqueByName = new LinkedHashMap<>();
        for (PlaceSummaryResponse place : places) {
            if (place.getCategory() != null) {
                uniqueByName.putIfAbsent(place.getTitle(), place);
            }
        }

        if (uniqueByName.isEmpty()) {
            throw new IllegalStateException("추천할 장소를 찾지 못했습니다.");
        }

        List<PlaceSummaryResponse> pool = new ArrayList<>(uniqueByName.values());
        Collections.shuffle(pool);
        return pool;
    }

    /**
     * 후보 장소 목록에서 필요한 개수만큼 일정을 구성합니다.
     * 후보가 부족하면 앞에서부터 다시 순환합니다.
     */
    private List<PlaceSummaryResponse> buildItinerary(List<PlaceSummaryResponse> pool, int neededPlaces) {
        List<PlaceSummaryResponse> itinerary = new ArrayList<>(neededPlaces);

        for (int i = 0; i < neededPlaces; i++) {
            itinerary.add(pool.get(i % pool.size()));
        }

        return itinerary;
    }

    private CourseDayResponse buildDay(
            int day,
            List<PlaceSummaryResponse> dayPlaces,
            int transportCost,
            long[] placeIdSeq,
            long[] costIdSeq) {

        List<CoursePlaceResponse> placeResponses = new ArrayList<>();
        Map<PlaceCategory, Integer> categoryCount = new EnumMap<>(PlaceCategory.class);

        for (PlaceSummaryResponse place : dayPlaces) {
            placeResponses.add(CoursePlaceResponse.builder()
                    .id(placeIdSeq[0]++)
                    .name(place.getTitle())
                    .category(CATEGORY_LABEL.getOrDefault(place.getCategory(), "장소"))
                    .description(place.getSubtitle())
                    .imageUrl(place.getImageUrl())
                    .build());

            categoryCount.merge(place.getCategory(), 1, Integer::sum);
        }

        List<CourseCostResponse> costResponses = new ArrayList<>();
        int totalCost = 0;

        if (transportCost > 0) {
            costResponses.add(CourseCostResponse.builder()
                    .id(costIdSeq[0]++)
                    .label("교통비")
                    .amount(transportCost)
                    .build());

            totalCost += transportCost;
        }

        for (Map.Entry<PlaceCategory, Integer> entry : categoryCount.entrySet()) {
            int amount = CATEGORY_AVG_COST.getOrDefault(entry.getKey(), 0) * entry.getValue();

            costResponses.add(CourseCostResponse.builder()
                    .id(costIdSeq[0]++)
                    .label(CATEGORY_COST_LABEL.getOrDefault(entry.getKey(), "기타 비용"))
                    .amount(amount)
                    .build());

            totalCost += amount;
        }

        return CourseDayResponse.builder()
                .day(day)
                .title(day + "일차: " + dayPlaces.get(0).getTitle() + " 둘러보기")
                .places(placeResponses)
                .costs(costResponses)
                .totalCost(totalCost)
                .build();
    }
}
