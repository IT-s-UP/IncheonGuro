package com.itsup.incheonguro.courseguide.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

// bookmark 테이블과 매핑되는 엔티티, "어떤 사용자가 어떤 코스를 북마크했는지?"
@Entity
@Table(name = "bookmark", uniqueConstraints = {
    @UniqueConstraint(columnNames = { "user_id", "course_id" })
})
@Getter
@NoArgsConstructor
public class Bookmark {

  // 북마크 고유 번호
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  // 북마크한 사용자의 id
  @Column(name = "user_id", nullable = false)
  private Long userId;

  // 북마크한 코스
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "course_id", nullable = false)
  private Course course;

  // userId와 course를 받아서 북마크 데이터를 새로 만들 때 사용
  public Bookmark(Long userId, Course course) {
    this.userId = userId;
    this.course = course;
  }
}
