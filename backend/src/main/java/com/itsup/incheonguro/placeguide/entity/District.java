package com.itsup.incheonguro.placeguide.entity;

import java.util.List;

/**
 * 인천 8개 구를 나타내는 enum (이름은 개편 이전 8개 구 기준으로 유지)
 * 한국관광공사 API는 2026년 행정구역 개편(신설: 제물포구/영종구/서해구/검단구)을 반영하고 있음
 * -> 우리 8개 구 이름 하나가 신설구 여러 개의 코드에 대응되도록 고침
 *
 * 중구(JUNG) = 제물포구(125) + 영종구(155) <- 옛 중구가 도심/영종도로 분리됨
 * 동구(DONG) = 제물포구(125) <- 옛 동구는 제물포구에 흡수됨 (JUNG과 일부 겹침)
 * 서구(SEO) = 서해구(275) + 검단구(290) <- 옛 서구가 본토/검단으로 분리됨
 */
public enum District {
  JUNG(List.of("125", "155")),
  DONG(List.of("125")),
  SEO(List.of("275", "290")),
  GYEYANG(List.of("245")),
  BUPYEONG(List.of("237")),
  MICHUHOL(List.of("177")),
  NAMDONG(List.of("200")),
  YEONSU(List.of("185"));

  private final List<String> signguCds;

  District(List<String> signguCds) {
    this.signguCds = signguCds;
  }

  public List<String> getSignguCds() {
    return signguCds;
  }

  // signguCd 문자열로부터 해당하는 District를 찾음 (API 응답을 우리 enum으로 역변환할 때 사용)
  public static District fromSignguCd(String signguCd) {
    for (District district : values()) {
      if (district.signguCds.contains(signguCd)) {
        return district;
      }
    }
    return null; // 8개 구 외의 지역(강화군, 옹진군 등)이면 null
  }
}
