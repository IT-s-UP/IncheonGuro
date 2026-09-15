package com.itsup.incheonguro.courseguide.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

// 오늘의 추천 코스 5개를 랜덤으로 뽑아서 날짜(date)를 캐시 키로 저장하는 서비스
// 같은 날엔 몇 번을 호출해도 처음 뽑힌 5개가 그대로 나오고, 날짜가 바뀌면 캐시가 자연스럽게 미스나면서 새로 뽑힘
// (CourseCacheService와 다른 클래스로 분리한 이유는, 이 안에서 courseCacheService.getCourseList()를
//  또 다른 빈으로 호출해야 캐싱이 제대로 걸리기 때문)
@Service
public class DailyRecommendationCacheService {

  private static final int RECOMMEND_COUNT = 5;

  private final CourseCacheService courseCacheService;

  public DailyRecommendationCacheService(CourseCacheService courseCacheService) {
    this.courseCacheService = courseCacheService;
  }

  @Cacheable(value = "dailyRecommendedCourseIds", key = "#date")
  public List<String> getRecommendedCourseIds(LocalDate date) {
    List<String> ids = courseCacheService.getCourseList().stream()
        .map(item -> item.path("contentid").asText())
        .collect(Collectors.toCollection(ArrayList::new));

    Collections.shuffle(ids);

    return ids.stream().limit(RECOMMEND_COUNT).collect(Collectors.toList());
  }
}
