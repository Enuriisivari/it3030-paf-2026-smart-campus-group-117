package com.sliit.smartcampus.repository;

import com.sliit.smartcampus.domain.entity.Booking;
import com.sliit.smartcampus.domain.enums.BookingStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.util.List;

public interface BookingRepository extends MongoRepository<Booking, String> {

	List<Booking> findByUserIdOrderByBookingDateDescStartTimeDesc(String userId);

	List<Booking> findAllByOrderByBookingDateDescStartTimeDesc();

	List<Booking> findByBookingDateAndStatusIn(LocalDate bookingDate, List<BookingStatus> statuses);

	List<Booking> findByResourceIdAndBookingDateAndStatusIn(String resourceId, LocalDate bookingDate, List<BookingStatus> statuses);
}
