package com.sliit.smartcampus.bookingmanagement;

import com.sliit.smartcampus.bookingmanagement.dto.BookingCreateRequest;
import com.sliit.smartcampus.bookingmanagement.dto.BookingResponse;
import com.sliit.smartcampus.bookingmanagement.dto.BusySlotResponse;
import com.sliit.smartcampus.bookingmanagement.dto.RejectRequest;
import com.sliit.smartcampus.bookingmanagement.dto.VerifyQrRequest;
import com.sliit.smartcampus.domain.entity.User;
import com.sliit.smartcampus.domain.enums.UserRole;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

	private final BookingService bookingService;

	public BookingController(BookingService bookingService) {
		this.bookingService = bookingService;
	}

	@PostMapping
	public ResponseEntity<BookingResponse> create(
			@Valid @RequestBody BookingCreateRequest request,
			@AuthenticationPrincipal User user) {
		return ResponseEntity.status(HttpStatus.CREATED).body(bookingService.create(request, user));
	}

	@GetMapping("/busy")
	public List<BusySlotResponse> busy(@RequestParam LocalDate date) {
		return bookingService.busyForDate(date);
	}

	@GetMapping("/my")
	public List<BookingResponse> myBookings(@AuthenticationPrincipal User user) {
		return bookingService.myBookings(user);
	}

	@GetMapping
	@PreAuthorize("hasRole('ADMIN')")
	public List<BookingResponse> allBookings() {
		return bookingService.allBookings();
	}

	@GetMapping("/{id}")
	public BookingResponse get(@PathVariable String id, @AuthenticationPrincipal User user) {
		BookingResponse b = bookingService.getById(id);
		if (user.getRole() != UserRole.ADMIN && !b.userId().equals(user.getId())) {
			throw new org.springframework.security.access.AccessDeniedException("Not allowed");
		}
		return b;
	}

	@PutMapping("/{id}/approve")
	@PreAuthorize("hasRole('ADMIN')")
	public BookingResponse approve(@PathVariable String id, @AuthenticationPrincipal User admin) {
		return bookingService.approve(id, admin);
	}

	@PutMapping("/{id}/reject")
	@PreAuthorize("hasRole('ADMIN')")
	public BookingResponse reject(
			@PathVariable String id,
			@RequestBody(required = false) RejectRequest body,
			@AuthenticationPrincipal User admin) {
		return bookingService.reject(id, admin, body != null ? body.reason() : null);
	}

	@GetMapping(value = "/{id}/qr", produces = MediaType.IMAGE_PNG_VALUE)
	public byte[] qr(@PathVariable String id, @AuthenticationPrincipal User user) {
		BookingResponse b = bookingService.getById(id);
		if (user.getRole() != UserRole.ADMIN && !b.userId().equals(user.getId())) {
			throw new org.springframework.security.access.AccessDeniedException("Not allowed");
		}
		return bookingService.qrPng(id);
	}

	@PostMapping("/verify")
	public BookingResponse verify(@Valid @RequestBody VerifyQrRequest request) {
		return bookingService.verifyQr(request);
	}
}
