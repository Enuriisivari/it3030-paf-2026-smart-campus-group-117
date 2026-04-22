package com.sliit.smartcampus.domain.entity;

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

@Document(collection = "comments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Comment {

	@Id
	private String id;

	@Indexed
	private String ticketId;

	@Indexed
	private String userId;

	private String commentText;

	@CreatedDate
	private Instant createdAt;

	@LastModifiedDate
	private Instant updatedAt;
}
