package com.sliit.smartcampus.bookingmanagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

public record BookingCreateRequest(
		@NotBlank String resourceId,
		@NotNull LocalDate bookingDate,
		@NotNull LocalTime startTime,
		@NotNull LocalTime endTime,
		@NotBlank String purpose,
		Integer expectedAttendees) {
}
