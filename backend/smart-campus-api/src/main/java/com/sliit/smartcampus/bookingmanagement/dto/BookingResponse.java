package com.sliit.smartcampus.bookingmanagement.dto;

import com.sliit.smartcampus.domain.entity.Booking;
import com.sliit.smartcampus.domain.enums.BookingStatus;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

public record BookingResponse(
		String id,
		String resourceId,
		String resourceName,
		String userId,
		String userEmail,
		LocalDate bookingDate,
		LocalTime startTime,
		LocalTime endTime,
		String purpose,
		Integer expectedAttendees,
		BookingStatus status,
		String rejectionReason,
		String approvedById,
		Instant createdAt,
		Instant updatedAt) {

	public static BookingResponse from(Booking b, String resourceName, String userEmail) {
		return new BookingResponse(
				b.getId(),
				b.getResourceId(),
				resourceName,
				b.getUserId(),
				userEmail,
				b.getBookingDate(),
				b.getStartTime(),
				b.getEndTime(),
				b.getPurpose(),
				b.getExpectedAttendees(),
				b.getStatus(),
				b.getRejectionReason(),
				b.getApprovedById(),
				b.getCreatedAt(),
				b.getUpdatedAt());
	}
}
