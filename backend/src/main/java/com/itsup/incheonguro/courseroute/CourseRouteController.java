package com.itsup.incheonguro.courseroute;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/course-routes")
public class CourseRouteController {
    private final CourseRouteService service;

    @GetMapping
    public CourseRouteService.Summary find(
            @RequestParam String mode,
            @RequestParam double startX, @RequestParam double startY,
            @RequestParam double endX, @RequestParam double endY) {
        return service.find(mode, startX, startY, endX, endY);
    }
}
