package com.itsup.incheonguro.course.entity;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "course_places")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MyCoursePlace {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_day_id", nullable = false)
    private CourseDay courseDay;

    @Column(nullable = false)
    private int placeOrder;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 255)
    private String address;

    public MyCoursePlace(int placeOrder, String name, String address) {
        this.placeOrder = placeOrder;
        this.name = name;
        this.address = address;
    }

    void assignCourseDay(CourseDay courseDay) {
        this.courseDay = courseDay;
    }
}
