package com.sliit.smartcampus.domain.entity;

import com.sliit.smartcampus.domain.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

	@Id
	private String id;

	@Indexed
	private String userId;

	private String title;

	private String message;

	private NotificationType type;

	private String referenceId;

	@Builder.Default
	private Boolean isRead = false;

	@CreatedDate
	private Instant createdAt;
}
