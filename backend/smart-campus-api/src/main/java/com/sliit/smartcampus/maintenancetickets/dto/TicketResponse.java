package com.sliit.smartcampus.maintenancetickets.dto;

import com.sliit.smartcampus.domain.entity.Ticket;
import com.sliit.smartcampus.domain.entity.TicketAttachment;
import com.sliit.smartcampus.domain.enums.TicketPriority;
import com.sliit.smartcampus.domain.enums.TicketStatus;

import java.time.Instant;
import java.util.List;

public record TicketResponse(
		String id,
		String resourceId,
		String resourceName,
		String createdById,
		String createdByName,
		String assignedToId,
		String assignedToName,
		String category,
		String description,
		TicketPriority priority,
		TicketStatus status,
		String resolutionNote,
		String rejectedReason,
		Instant createdAt,
		List<AttachmentResponse> attachments) {

	public static TicketResponse from(
			Ticket t,
			String resourceName,
			String createdByName,
			String assignedToName,
			List<TicketAttachment> attachments) {
		return new TicketResponse(
				t.getId(),
				t.getResourceId(),
				resourceName,
				t.getCreatedById(),
				createdByName,
				t.getAssignedToId(),
				assignedToName,
				t.getCategory(),
				t.getDescription(),
				t.getPriority(),
				t.getStatus(),
				t.getResolutionNote(),
				t.getRejectedReason(),
				t.getCreatedAt(),
				attachments.stream().map(AttachmentResponse::from).toList());
	}
}
