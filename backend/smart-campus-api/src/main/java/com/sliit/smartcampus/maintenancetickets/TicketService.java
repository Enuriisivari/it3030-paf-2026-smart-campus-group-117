package com.sliit.smartcampus.maintenancetickets;

import com.sliit.smartcampus.authnotifications.NotificationService;
import com.sliit.smartcampus.domain.entity.Comment;
import com.sliit.smartcampus.domain.entity.Resource;
import com.sliit.smartcampus.domain.entity.Ticket;
import com.sliit.smartcampus.domain.entity.TicketAttachment;
import com.sliit.smartcampus.domain.entity.User;
import com.sliit.smartcampus.domain.enums.NotificationType;
import com.sliit.smartcampus.domain.enums.TicketPriority;
import com.sliit.smartcampus.domain.enums.TicketStatus;
import com.sliit.smartcampus.domain.enums.UserRole;
import com.sliit.smartcampus.maintenancetickets.dto.AssignRequest;
import com.sliit.smartcampus.maintenancetickets.dto.CommentRequest;
import com.sliit.smartcampus.maintenancetickets.dto.CommentResponse;
import com.sliit.smartcampus.maintenancetickets.dto.TicketResponse;
import com.sliit.smartcampus.maintenancetickets.dto.TicketStatusUpdateRequest;
import com.sliit.smartcampus.repository.CommentRepository;
import com.sliit.smartcampus.repository.ResourceRepository;
import com.sliit.smartcampus.repository.TicketAttachmentRepository;
import com.sliit.smartcampus.repository.TicketRepository;
import com.sliit.smartcampus.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
public class TicketService {

	private final TicketRepository ticketRepository;
	private final ResourceRepository resourceRepository;
	private final UserRepository userRepository;
	private final TicketAttachmentRepository ticketAttachmentRepository;
	private final CommentRepository commentRepository;
	private final NotificationService notificationService;
	private final String uploadDir;

	public TicketService(
			TicketRepository ticketRepository,
			ResourceRepository resourceRepository,
			UserRepository userRepository,
			TicketAttachmentRepository ticketAttachmentRepository,
			CommentRepository commentRepository,
			NotificationService notificationService,
			@Value("${app.upload.dir:uploads}") String uploadDir) {
		this.ticketRepository = ticketRepository;
		this.resourceRepository = resourceRepository;
		this.userRepository = userRepository;
		this.ticketAttachmentRepository = ticketAttachmentRepository;
		this.commentRepository = commentRepository;
		this.notificationService = notificationService;
		this.uploadDir = uploadDir;
	}

	@Transactional
	public TicketResponse create(
			String resourceId,
			String category,
			String description,
			TicketPriority priority,
			List<MultipartFile> files,
			User currentUser) {
		Resource resource = resourceRepository.findById(resourceId)
				.orElseThrow(() -> new IllegalArgumentException("Resource not found: " + resourceId));
		Ticket t = Ticket.builder()
				.resourceId(resource.getId())
				.createdById(currentUser.getId())
				.category(category.trim())
				.description(description.trim())
				.priority(priority)
				.status(TicketStatus.OPEN)
				.build();
		t = ticketRepository.save(t);
		if (files != null) {
			for (MultipartFile file : files) {
				if (file != null && !file.isEmpty()) {
					saveAttachment(t, file);
				}
			}
		}
		return toResponse(t);
	}

	@Transactional(readOnly = true)
	public List<TicketResponse> list(User user) {
		List<Ticket> list;
		if (user.getRole() == UserRole.ADMIN) {
			list = ticketRepository.findAllByOrderByCreatedAtDesc();
		} else if (user.getRole() == UserRole.TECHNICIAN) {
			list = ticketRepository.findByAssignedToIdOrderByCreatedAtDesc(user.getId());
		} else {
			list = ticketRepository.findByCreatedByIdOrderByCreatedAtDesc(user.getId());
		}
		return list.stream().map(this::toResponse).toList();
	}

	@Transactional(readOnly = true)
	public TicketResponse get(String id, User user) {
		Ticket t = ticketRepository.findById(id)
				.orElseThrow(() -> new IllegalArgumentException("Ticket not found: " + id));
		assertCanView(t, user);
		return toResponse(t);
	}

	@Transactional
	public TicketResponse assign(String id, AssignRequest req, User admin) {
		if (admin.getRole() != UserRole.ADMIN) {
			throw new AccessDeniedException("Admin only");
		}
		Ticket t = ticketRepository.findById(id)
				.orElseThrow(() -> new IllegalArgumentException("Ticket not found: " + id));
		User tech = userRepository.findById(req.userId())
				.orElseThrow(() -> new IllegalArgumentException("User not found: " + req.userId()));
		if (tech.getRole() != UserRole.TECHNICIAN) {
			throw new IllegalArgumentException("Assignee must have role TECHNICIAN");
		}
		t.setAssignedToId(tech.getId());
		t = ticketRepository.save(t);
		notificationService.create(
				tech,
				"Ticket assigned",
				"You were assigned ticket #" + t.getId() + ": " + t.getCategory(),
				NotificationType.TICKET,
				t.getId());
		return toResponse(t);
	}

	@Transactional
	public TicketResponse updateStatus(String id, TicketStatusUpdateRequest req, User user) {
		Ticket t = ticketRepository.findById(id)
				.orElseThrow(() -> new IllegalArgumentException("Ticket not found: " + id));
		assertCanUpdateStatus(t, user);
		t.setStatus(req.status());
		if (req.resolutionNote() != null) {
			t.setResolutionNote(req.resolutionNote());
		}
		if (req.rejectedReason() != null) {
			t.setRejectedReason(req.rejectedReason());
		}
		t = ticketRepository.save(t);
		return toResponse(t);
	}

	@Transactional
	public CommentResponse addComment(String ticketId, CommentRequest req, User user) {
		Ticket t = ticketRepository.findById(ticketId)
				.orElseThrow(() -> new IllegalArgumentException("Ticket not found: " + ticketId));
		assertCanView(t, user);
		Comment c = Comment.builder()
				.ticketId(t.getId())
				.userId(user.getId())
				.commentText(req.commentText().trim())
				.build();
		c = commentRepository.save(c);
		if (!t.getCreatedById().equals(user.getId())) {
			User createdBy = userRepository.findById(t.getCreatedById())
					.orElseThrow(() -> new IllegalArgumentException("User not found: " + t.getCreatedById()));
			notificationService.create(
					createdBy,
					"New comment on ticket",
					user.getFullName() + " commented on ticket #" + t.getId(),
					NotificationType.COMMENT,
					t.getId());
		}
		return CommentResponse.from(c, user.getFullName());
	}

	@Transactional(readOnly = true)
	public List<CommentResponse> listComments(String ticketId, User user) {
		Ticket t = ticketRepository.findById(ticketId)
				.orElseThrow(() -> new IllegalArgumentException("Ticket not found: " + ticketId));
		assertCanView(t, user);
		return commentRepository.findByTicketIdOrderByCreatedAtAsc(t.getId()).stream()
				.map(c -> {
					User author = userRepository.findById(c.getUserId())
							.orElseThrow(() -> new IllegalArgumentException("User not found: " + c.getUserId()));
					return CommentResponse.from(c, author.getFullName());
				})
				.toList();
	}

	private void assertCanView(Ticket t, User u) {
		if (u.getRole() == UserRole.ADMIN) {
			return;
		}
		if (t.getCreatedById().equals(u.getId())) {
			return;
		}
		if (u.getRole() == UserRole.TECHNICIAN
				&& t.getAssignedToId() != null
				&& t.getAssignedToId().equals(u.getId())) {
			return;
		}
		throw new AccessDeniedException("Not allowed to view this ticket");
	}

	private void assertCanUpdateStatus(Ticket t, User u) {
		if (u.getRole() == UserRole.ADMIN) {
			return;
		}
		if (u.getRole() == UserRole.TECHNICIAN
				&& t.getAssignedToId() != null
				&& t.getAssignedToId().equals(u.getId())) {
			return;
		}
		throw new AccessDeniedException("Not allowed to update this ticket");
	}

	private TicketResponse toResponse(Ticket t) {
		Resource resource = resourceRepository.findById(t.getResourceId())
				.orElseThrow(() -> new IllegalArgumentException("Resource not found: " + t.getResourceId()));
		User createdBy = userRepository.findById(t.getCreatedById())
				.orElseThrow(() -> new IllegalArgumentException("User not found: " + t.getCreatedById()));
		String assignedToName = null;
		if (t.getAssignedToId() != null) {
			User assignedTo = userRepository.findById(t.getAssignedToId())
					.orElseThrow(() -> new IllegalArgumentException("User not found: " + t.getAssignedToId()));
			assignedToName = assignedTo.getFullName();
		}
		List<TicketAttachment> attachments = ticketAttachmentRepository.findByTicketId(t.getId());
		return TicketResponse.from(t, resource.getName(), createdBy.getFullName(), assignedToName, attachments);
	}

	private void saveAttachment(Ticket ticket, MultipartFile file) {
		String safe = safeName(file.getOriginalFilename());
		String dir = "ticket-attachments/" + ticket.getId();
		Path dirPath = Paths.get(uploadDir, dir);
		try {
			Files.createDirectories(dirPath);
			String unique = UUID.randomUUID() + "_" + safe;
			Path dest = dirPath.resolve(unique);
			file.transferTo(dest);
			ticketAttachmentRepository.save(TicketAttachment.builder()
					.ticketId(ticket.getId())
					.fileName(file.getOriginalFilename() != null ? file.getOriginalFilename() : safe)
					.filePath(dir + "/" + unique)
					.build());
		} catch (IOException e) {
			throw new IllegalStateException("Failed to store attachment", e);
		}
	}

	private static String safeName(String original) {
		String n = original == null ? "file" : original.replaceAll("[^a-zA-Z0-9._-]", "_");
		if (n.isBlank()) {
			return "file";
		}
		return n;
	}
}
