package com.sliit.smartcampus.maintenancetickets;

import com.sliit.smartcampus.domain.entity.User;
import com.sliit.smartcampus.domain.enums.TicketPriority;
import com.sliit.smartcampus.maintenancetickets.dto.AssignRequest;
import com.sliit.smartcampus.maintenancetickets.dto.CommentRequest;
import com.sliit.smartcampus.maintenancetickets.dto.CommentResponse;
import com.sliit.smartcampus.maintenancetickets.dto.TicketResponse;
import com.sliit.smartcampus.maintenancetickets.dto.TicketStatusUpdateRequest;
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
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

	private final TicketService ticketService;

	public TicketController(TicketService ticketService) {
		this.ticketService = ticketService;
	}

	@PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<TicketResponse> create(
			@RequestParam String resourceId,
			@RequestParam String category,
			@RequestParam String description,
			@RequestParam TicketPriority priority,
			@RequestParam(value = "files", required = false) List<MultipartFile> files,
			@AuthenticationPrincipal User user) {
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(ticketService.create(resourceId, category, description, priority, files, user));
	}

	@GetMapping
	public List<TicketResponse> list(@AuthenticationPrincipal User user) {
		return ticketService.list(user);
	}

	@GetMapping("/{id}")
	public TicketResponse get(@PathVariable String id, @AuthenticationPrincipal User user) {
		return ticketService.get(id, user);
	}

	@PutMapping("/{id}/assign")
	@PreAuthorize("hasRole('ADMIN')")
	public TicketResponse assign(@PathVariable String id, @Valid @RequestBody AssignRequest request,
			@AuthenticationPrincipal User admin) {
		return ticketService.assign(id, request, admin);
	}

	@PutMapping("/{id}/status")
	public TicketResponse updateStatus(
			@PathVariable String id,
			@Valid @RequestBody TicketStatusUpdateRequest request,
			@AuthenticationPrincipal User user) {
		return ticketService.updateStatus(id, request, user);
	}

	@PostMapping("/{id}/comments")
	public CommentResponse addComment(
			@PathVariable String id,
			@Valid @RequestBody CommentRequest request,
			@AuthenticationPrincipal User user) {
		return ticketService.addComment(id, request, user);
	}

	@GetMapping("/{id}/comments")
	public List<CommentResponse> listComments(@PathVariable String id, @AuthenticationPrincipal User user) {
		return ticketService.listComments(id, user);
	}
}
