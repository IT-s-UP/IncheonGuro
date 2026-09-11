package com.itsup.incheonguro.placeguide.repository;

import com.itsup.incheonguro.placeguide.entity.PlaceTag;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

// place_tag 테이블에 접근하는 리포지토리
public interface PlaceTagRepository extends JpaRepository<PlaceTag, Long> {

  // 특정 장소에 달린 태그들 조회 -> 장소 상세 응답에 태그 목록 포함시킬 때 사용
  List<PlaceTag> findByPlaceId(Long placeId);
}
