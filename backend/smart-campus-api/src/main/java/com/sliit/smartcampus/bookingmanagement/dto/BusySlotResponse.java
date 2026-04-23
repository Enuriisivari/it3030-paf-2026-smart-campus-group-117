package com.sliit.smartcampus.bookingmanagement.dto;

import java.time.LocalTime;

public record BusySlotResponse(
		String resourceId,
		LocalTime startTime,
		LocalTime endTime
) {
}

