package com.itsup.incheonguro.courseguide.dto;

import lombok.Getter;

// 코스 저장 시 초기값으로 쓰이는 예상 비용. 코스 추천(courserecommend)에서 쓰는
// 카테고리별 평균 비용 방식과 동일한 기준으로 계산함
@Getter
public class EstimatedCostResponse {

  private int transportation;
  private int food;
  private int admission;
  private int etc;

  public EstimatedCostResponse(int transportation, int food, int admission, int etc) {
    this.transportation = transportation;
    this.food = food;
    this.admission = admission;
    this.etc = etc;
  }
}
