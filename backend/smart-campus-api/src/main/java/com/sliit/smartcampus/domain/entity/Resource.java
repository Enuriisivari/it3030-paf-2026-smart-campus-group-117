package com.sliit.smartcampus.domain.entity;

import com.sliit.smartcampus.domain.enums.ResourceStatus;
import com.sliit.smartcampus.domain.enums.ResourceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.time.LocalTime;

@Document(collection = "resources")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resource {

	@Id
	private String id;

	private String name;

	private ResourceType type;

	private Integer capacity;

	private String location;

	private LocalTime availableFrom;

	private LocalTime availableTo;

	@Builder.Default
	private ResourceStatus status = ResourceStatus.ACTIVE;

	@CreatedDate
	private Instant createdAt;

	@LastModifiedDate
	private Instant updatedAt;
}
