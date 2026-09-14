package com.itsup.incheonguro.placeguide.dto;

import com.itsup.incheonguro.placeguide.entity.District;
import com.itsup.incheonguro.placeguide.entity.PlaceCategory;
import lombok.Getter;

import java.util.List;

// 장소 상세 조회에서 사용하는 응답
@Getter
public class PlaceDetailResponse {

  // 한국관광공사 콘텐츠 고유번호 (contentId)
  private String placeId;

  // 장소 이름
  private String title;

  // 장소 주소
  private String subtitle;

  // 장소 소개글
  private String description;

  // 장소가 속한 구
  private District district;

  // 장소 유형
  private PlaceCategory category;

  // 로그인한 사용자가 이 장소를 북마크했는지? (로그인X -> 항상 false)
  private boolean isBookmarked;

  // 소분류명(lclsSystm3)을 태그처럼 사용
  private List<String> tags;

  // GPS 위도(latitude) - 상세 지도에 마커 찍을 때 사용
  private double latitude;

  // GPS 경도(longitude) - 상세 지도에 마커 찍을 때 사용
  private double longitude;

  // 이용시간 (관광공사 detailIntro2에서 가져옴, 카테고리별로 필드명이 다름)
  private String usageTime;

  // 쉬는날
  private String restDate;

  // 주차시설 정보
  private String parking;

  // 문의 및 안내 (전화번호 등)
  private String infoCenter;

  // 4가지 고정 항목(이용시간/쉬는날/주차/문의)이 전부 비어있을 때 대신 보여줄 추가 안내정보
  // (관광공사 detailInfo2의 "입장료: 무료", "화장실: 있음" 같은 항목들, 이미 "라벨:값" 형태로 조합된 문자열)
  private List<String> extraInfoTexts;

  public PlaceDetailResponse(String placeId, String title, String subtitle, String description,
      District district, PlaceCategory category, boolean isBookmarked, List<String> tags,
      double latitude, double longitude, String usageTime, String restDate, String parking,
      String infoCenter, List<String> extraInfoTexts) {
    this.placeId = placeId;
    this.title = title;
    this.subtitle = subtitle;
    this.description = description;
    this.district = district;
    this.category = category;
    this.isBookmarked = isBookmarked;
    this.tags = tags;
    this.latitude = latitude;
    this.longitude = longitude;
    this.usageTime = usageTime;
    this.restDate = restDate;
    this.parking = parking;
    this.infoCenter = infoCenter;
    this.extraInfoTexts = extraInfoTexts;
  }
}
