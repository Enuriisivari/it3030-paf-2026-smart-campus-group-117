package com.sliit.smartcampus.facilitiesassets.dto;

import com.sliit.smartcampus.domain.entity.Resource;
import com.sliit.smartcampus.domain.enums.ResourceStatus;
import com.sliit.smartcampus.domain.enums.ResourceType;

import java.time.Instant;
import java.time.LocalTime;

public record ResourceResponse(
		String id,
		String name,
		ResourceType type,
		Integer capacity,
		String location,
		LocalTime availableFrom,
		LocalTime availableTo,
		ResourceStatus status,
		Instant createdAt,
		Instant updatedAt) {

	public static ResourceResponse from(Resource r) {
		return new ResourceResponse(
				r.getId(),
				r.getName(),
				r.getType(),
				r.getCapacity(),
				r.getLocation(),
				r.getAvailableFrom(),
				r.getAvailableTo(),
				r.getStatus(),
				r.getCreatedAt(),
				r.getUpdatedAt());
	}
}
