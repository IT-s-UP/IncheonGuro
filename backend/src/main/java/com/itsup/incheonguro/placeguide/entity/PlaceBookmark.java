package com.itsup.incheonguro.placeguide.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

// place_bookmark 테이블과 매핑되는 엔티티, "어떤 사용자가 어떤 장소를 북마크했는지?"
@Entity
@Table(name = "place_bookmark", uniqueConstraints = {
    @UniqueConstraint(columnNames = { "user_id", "place_id" })
})
@Getter
@NoArgsConstructor
public class PlaceBookmark {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "user_id", nullable = false)
  private Long userId;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "place_id", nullable = false)
  private Place place;

  public PlaceBookmark(Long userId, Place place) {
    this.userId = userId;
    this.place = place;
  }
}
