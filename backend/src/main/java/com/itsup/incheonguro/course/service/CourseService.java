package com.itsup.incheonguro.course.service;

import com.itsup.incheonguro.course.dto.CourseRequest;
import com.itsup.incheonguro.course.dto.CourseResponse;
import com.itsup.incheonguro.course.entity.MyCourse;
import com.itsup.incheonguro.course.entity.CourseDay;
import com.itsup.incheonguro.course.entity.MyCoursePlace;
import com.itsup.incheonguro.course.repository.MyCourseRepository;

import java.util.List;
import java.util.HashSet;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CourseService {
    private final MyCourseRepository courseRepository;

    public List<CourseResponse> findAll() {
        return courseRepository.findAllByOrderByIdDesc().stream()
                .map(CourseResponse::from).toList();
    }

    public CourseResponse findById(Long courseId) {
        return CourseResponse.from(getCourse(courseId));
    }

    @Transactional
    public CourseResponse create(CourseRequest request) {
        validateDays(request);
        MyCourse course = new MyCourse(request.name().trim());
        request.days().forEach(day -> course.addDay(toCourseDay(day)));
        return CourseResponse.from(courseRepository.saveAndFlush(course));
    }

    @Transactional
    public CourseResponse update(Long courseId, CourseRequest request) {
        MyCourse course = getCourse(courseId);
        validateDays(request);
        course.update(request.name().trim(), request.days().stream().map(this::toCourseDay).toList());
        courseRepository.flush();
        return CourseResponse.from(course);
    }

    @Transactional
    public void delete(Long courseId) {
        courseRepository.delete(getCourse(courseId));
    }

    private void validateDays(CourseRequest request) {
        var numbers = new HashSet<Integer>();
        for (var day : request.days()) {
            if (!numbers.add(day.day())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "DAY 번호는 중복될 수 없습니다.");
            }
        }
    }

    private MyCourse getCourse(Long courseId) {
        return courseRepository.findById(courseId).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "코스를 찾을 수 없습니다. courseId=" + courseId));
    }

    private CourseDay toCourseDay(CourseRequest.DayRequest request) {
        CourseRequest.CostRequest costs = request.costs();
        CourseDay day = new CourseDay(request.day(), request.transport(),
                costs.transportation(), costs.food(), costs.admission(), costs.etc());

        for (int index = 0; index < request.places().size(); index++) {
            CourseRequest.PlaceRequest place = request.places().get(index);
            day.addPlace(new MyCoursePlace(index + 1, place.name().trim(), place.address().trim()));
        }
        return day;
    }
}
