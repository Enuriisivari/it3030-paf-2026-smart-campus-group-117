package com.sliit.smartcampus.maintenancetickets.dto;

import com.sliit.smartcampus.domain.enums.TicketStatus;
import jakarta.validation.constraints.NotNull;

public record TicketStatusUpdateRequest(
		@NotNull TicketStatus status,
		String resolutionNote,
		String rejectedReason) {
}
