package com.itsup.incheonguro.placeguide.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * place_bookmark 테이블과 매핑되는 엔티티, "어떤 사용자가 어떤 장소를 북마크했는지?"
 * 장소 정보 자체는 관광공사 API에서 실시간으로 받아옴
 * 관광공사가 발급한 contentId(문자열)를 그대로 저장
 */
@Entity
@Table(name = "place_bookmark", uniqueConstraints = {
    @UniqueConstraint(columnNames = { "user_id", "content_id" })
})
@Getter
@NoArgsConstructor
public class PlaceBookmark {

  // 북마크 고유 번호
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  // 북마크한 사용자의 id
  @Column(name = "user_id", nullable = false)
  private Long userId;

  // 관광공사 API의 contentId (예: "126128")
  @Column(name = "content_id", nullable = false, length = 20)
  private String contentId;

  // userId와 contentId를 받아서 북마크 데이터를 새로 만들 때 사용
  public PlaceBookmark(Long userId, String contentId) {
    this.userId = userId;
    this.contentId = contentId;
  }
}
