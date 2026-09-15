package com.itsup.incheonguro.courseguide.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

// bookmark 테이블과 매핑되는 엔티티, "어떤 사용자가 어떤 코스(관광공사 contentId)를 북마크했는지?"
// 코스가 이제 우리 DB에 없으므로, placeguide의 PlaceBookmark처럼 FK 대신 contentId(String)를 직접 저장
@Entity
@Table(name = "bookmark", uniqueConstraints = {
    @UniqueConstraint(columnNames = { "user_id", "content_id" })
})
@Getter
@NoArgsConstructor
public class Bookmark {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "user_id", nullable = false)
  private Long userId;

  @Column(name = "content_id", nullable = false, length = 20)
  private String contentId;

  public Bookmark(Long userId, String contentId) {
    this.userId = userId;
    this.contentId = contentId;
  }
}
