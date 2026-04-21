package com.sliit.smartcampus.domain.entity;

import com.sliit.smartcampus.domain.enums.TicketPriority;
import com.sliit.smartcampus.domain.enums.TicketStatus;
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

@Document(collection = "tickets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ticket {

	@Id
	private String id;

	@Indexed
	private String resourceId;

	@Indexed
	private String createdById;

	@Indexed
	private String assignedToId;

	private String category;

	private String description;

	private TicketPriority priority;

	@Builder.Default
	private TicketStatus status = TicketStatus.OPEN;

	private String resolutionNote;

	private String rejectedReason;

	@CreatedDate
	private Instant createdAt;

	@LastModifiedDate
	private Instant updatedAt;
}
