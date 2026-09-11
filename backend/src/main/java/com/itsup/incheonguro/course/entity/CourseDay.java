package com.itsup.incheonguro.course.entity;


import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "course_days")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CourseDay {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id", nullable = false)
    private MyCourse course;

    @Column(nullable = false)
    private int dayNumber;

    @Column(nullable = false, length = 20)
    private String transport;

    @OrderBy("placeOrder ASC")
    @OneToMany(mappedBy = "courseDay", cascade = CascadeType.ALL, orphanRemoval = true)
    private final List<MyCoursePlace> places = new ArrayList<>();

    @Column(nullable = false)
    private int transportationCost;
    @Column(nullable = false)
    private int foodCost;
    @Column(nullable = false)
    private int admissionCost;
    @Column(nullable = false)
    private int etcCost;

    public CourseDay(int dayNumber, String transport, int transportationCost, int foodCost,
            int admissionCost, int etcCost) {
        this.dayNumber = dayNumber;
        this.transport = transport;
        this.transportationCost = transportationCost;
        this.foodCost = foodCost;
        this.admissionCost = admissionCost;
        this.etcCost = etcCost;
    }

    void assignCourse(MyCourse course) {
        this.course = course;
    }

    public void addPlace(MyCoursePlace place) {
        places.add(place);
        place.assignCourseDay(this);
    }
}
