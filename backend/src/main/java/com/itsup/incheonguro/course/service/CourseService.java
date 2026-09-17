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
    private final jakarta.persistence.EntityManager em;

    private void lockOwner(Long id) {
        if (em.find(com.itsup.incheonguro.Auth.entity.Member.class, id, jakarta.persistence.LockModeType.PESSIMISTIC_WRITE) == null)
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
    }

    public List<CourseResponse> findAll(Long memberId) {
        return courseRepository.findAllByMemberIdOrderByIdDesc(memberId).stream()
                .map(CourseResponse::from).toList();
    }

    public CourseResponse findById(Long memberId, Long courseId) {
        return CourseResponse.from(getCourse(memberId, courseId));
    }

    @Transactional
    public CourseResponse create(Long memberId, CourseRequest request) {
        lockOwner(memberId);
        validateDays(request);
        MyCourse course = new MyCourse(request.name().trim(), memberId);
        request.days().forEach(day -> course.addDay(toCourseDay(day)));
        return CourseResponse.from(courseRepository.saveAndFlush(course));
    }

    @Transactional
    public CourseResponse update(Long memberId, Long courseId, CourseRequest request) {
        MyCourse course = getCourse(memberId, courseId);
        validateDays(request);
        course.update(request.name().trim(), request.days().stream().map(this::toCourseDay).toList());
        courseRepository.flush();
        return CourseResponse.from(course);
    }

    @Transactional
    public void delete(Long memberId, Long courseId) {
        courseRepository.delete(getCourse(memberId, courseId));
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

    private MyCourse getCourse(Long memberId, Long courseId) {
        return courseRepository.findByIdAndMemberId(courseId, memberId).orElseThrow(() ->
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
