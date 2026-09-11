package com.itsup.incheonguro.placeguide.repository;

import com.itsup.incheonguro.placeguide.entity.PlaceImage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

// place_image 테이블에 접근하는 리포지토리
public interface PlaceImageRepository extends JpaRepository<PlaceImage, Long> {

  // 특정 장소의 이미지들을 순서대로 조회 -> "장소 상세 이미지 목록 조회" API
  List<PlaceImage> findByPlaceIdOrderByOrderIndexAsc(Long placeId);
}
