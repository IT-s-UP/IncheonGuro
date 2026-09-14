package com.itsup.incheonguro.placeguide.entity;

// 인천 11개 구를 나타내는 enum (2026년 행정구역 개편 이후 기준)
public enum District {
  JEMULPO("125"),
  YEONGJONG("155"),
  SEOHAE("275"),
  GEOMDAN("290"),
  GYEYANG("245"),
  BUPYEONG("237"),
  MICHUHOL("177"),
  NAMDONG("200"),
  YEONSU("185"),
  GANGHWA("710"),
  ONGJIN("720");

  private final String signguCd;

  District(String signguCd) {
    this.signguCd = signguCd;
  }

  public String getSignguCd() {
    return signguCd;
  }

  // signguCd 문자열로부터 해당하는 District를 찾음 (API 응답을 우리 enum으로 역변환할 때 사용)
  public static District fromSignguCd(String signguCd) {
    for (District district : values()) {
      if (district.getSignguCd().equals(signguCd)) {
        return district;
      }
    }
    return null;
  }
}
