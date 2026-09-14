package com.itsup.incheonguro.placeguide.repository;

import com.itsup.incheonguro.placeguide.entity.PlaceBookmark;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

// place_bookmark 테이블에 접근하는 리포지토리
public interface PlaceBookmarkRepository extends JpaRepository<PlaceBookmark, Long> {

  // 특정 사용자가 특정 콘텐츠(장소)를 북마크했는지 확인
  Optional<PlaceBookmark> findByUserIdAndContentId(Long userId, String contentId);

  // 특정 사용자가 특정 콘텐츠를 북마크했는지 여부만 true/false로 확인 -> swagger 확인용
  boolean existsByUserIdAndContentId(Long userId, String contentId);

  // 특정 사용자가 북마크한 모든 콘텐츠 id 목록 조회 -> 북마크 탭에서 사용
  List<PlaceBookmark> findByUserId(Long userId);
}
