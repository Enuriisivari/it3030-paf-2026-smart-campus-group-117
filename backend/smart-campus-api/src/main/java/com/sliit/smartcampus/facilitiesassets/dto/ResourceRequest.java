package com.sliit.smartcampus.facilitiesassets.dto;

import com.sliit.smartcampus.domain.enums.ResourceStatus;
import com.sliit.smartcampus.domain.enums.ResourceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalTime;

public record ResourceRequest(
		@NotBlank String name,
		@NotNull ResourceType type,
		Integer capacity,
		@NotBlank String location,
		LocalTime availableFrom,
		LocalTime availableTo,
		@NotNull ResourceStatus status) {
}
