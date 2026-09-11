package com.itsup.incheonguro.course.dto;

import com.itsup.incheonguro.course.entity.MyCourse;
import com.itsup.incheonguro.course.entity.CourseDay;
import com.itsup.incheonguro.course.entity.MyCoursePlace;

import java.time.LocalDateTime;
import java.util.List;

public record CourseResponse(Long id, String name, List<DayResponse> days,
        LocalDateTime createdAt, LocalDateTime updatedAt) {

    public static CourseResponse from(MyCourse course) {
        return new CourseResponse(course.getId(), course.getName(),
                course.getDays().stream().map(DayResponse::from).toList(),
                course.getCreatedAt(), course.getUpdatedAt());
    }

    public record DayResponse(Long id, int day, String transport,
            List<PlaceResponse> places, CostResponse costs) {
        static DayResponse from(CourseDay day) {
            return new DayResponse(day.getId(), day.getDayNumber(), day.getTransport(),
                    day.getPlaces().stream().map(PlaceResponse::from).toList(),
                    new CostResponse(day.getTransportationCost(), day.getFoodCost(),
                            day.getAdmissionCost(), day.getEtcCost()));
        }
    }

    public record PlaceResponse(Long id, String name, String address) {
        static PlaceResponse from(MyCoursePlace place) {
            return new PlaceResponse(place.getId(), place.getName(), place.getAddress());
        }
    }

    public record CostResponse(int transportation, int food, int admission, int etc) {}
}
