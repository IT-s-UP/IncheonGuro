package com.itsup.incheonguro.placeguide.repository;

import com.itsup.incheonguro.placeguide.entity.District;
import com.itsup.incheonguro.placeguide.entity.Place;
import com.itsup.incheonguro.placeguide.entity.PlaceCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

// place 테이블에 접근하는 리포지토리
public interface PlaceRepository extends JpaRepository<Place, Long> {

  // 이름에 keyword가 포함된 장소 검색 -> 자동완성, 검색결과 페이지에서 사용
  List<Place> findByTitleContaining(String keyword);

  // 같은 구에 속한 다른 장소 조회 (자기 자신 제외) -> 장소 상세페이지 "해당 장소의 주변에는?"
  List<Place> findByDistrictAndIdNot(District district, Long excludedId);

  // 구/카테고리 다중 선택 필터 조회. 파라미터가 null이면 그 조건은 무시하고 전체 조회
  // (필터 없음/구만/카테고리만/둘다 4가지 경우를 이 메서드 하나로 처리)
  @Query("""
      SELECT p FROM Place p
      WHERE (:districts IS NULL OR p.district IN :districts)
        AND (:categories IS NULL OR p.category IN :categories)
      """)
  List<Place> findByFilters(@Param("districts") List<District> districts,
      @Param("categories") List<PlaceCategory> categories);

  // 특정 태그가 달린 장소들 조회 -> 태그 클릭 시 검색
  @Query("SELECT DISTINCT p FROM Place p JOIN p.tags t WHERE t.tagName = :tagName")
  List<Place> findByTagName(@Param("tagName") String tagName);
}
