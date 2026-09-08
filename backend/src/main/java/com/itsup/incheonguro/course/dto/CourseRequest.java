package com.itsup.incheonguro.course.dto;


import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CourseRequest(
        @NotBlank(message = "코스 이름은 필수입니다.")
        @Size(max = 30, message = "코스 이름은 30자 이하여야 합니다.") String name,
        @NotEmpty(message = "코스에는 하루 이상의 일정이 필요합니다.")
        List<@NotNull @Valid DayRequest> days
) {
    public record DayRequest(
            @Min(value = 1, message = "DAY 번호는 1 이상이어야 합니다.") int day,
            @NotBlank(message = "이동수단은 필수입니다.")
            @Pattern(regexp = "도보|대중교통|자전거|자차", message = "올바른 이동수단을 선택해주세요.") String transport,
            @NotNull(message = "장소 목록은 필수입니다.") List<@NotNull @Valid PlaceRequest> places,
            @NotNull(message = "예상 비용은 필수입니다.") @Valid CostRequest costs
    ) {}

    public record PlaceRequest(
            @NotBlank(message = "장소 이름은 필수입니다.")
            @Size(max = 100, message = "장소 이름은 100자 이하여야 합니다.") String name,
            @NotBlank(message = "장소 주소는 필수입니다.")
            @Size(max = 255, message = "장소 주소는 255자 이하여야 합니다.") String address
    ) {}

    public record CostRequest(
            @Min(value = 0, message = "교통비는 0원 이상이어야 합니다.") int transportation,
            @Min(value = 0, message = "식비는 0원 이상이어야 합니다.") int food,
            @Min(value = 0, message = "입장료는 0원 이상이어야 합니다.") int admission,
            @Min(value = 0, message = "기타 비용은 0원 이상이어야 합니다.") int etc
    ) {}
}
