package com.sliit.smartcampus.domain.entity;

import com.sliit.smartcampus.domain.enums.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

@Document(collection = "bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

	@Id
	private String id;

	@Indexed
	private String resourceId;

	@Indexed
	private String userId;

	@Indexed
	private LocalDate bookingDate;

	private LocalTime startTime;

	private LocalTime endTime;

	private String purpose;

	private Integer expectedAttendees;

	@Builder.Default
	private BookingStatus status = BookingStatus.PENDING;

	private String rejectionReason;

	private String approvedById;

	@CreatedDate
	private Instant createdAt;

	@LastModifiedDate
	private Instant updatedAt;
}
