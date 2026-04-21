package com.sliit.smartcampus.authnotifications.dto;

import com.sliit.smartcampus.domain.entity.User;
import com.sliit.smartcampus.domain.enums.UserRole;

public record UserResponse(
		String id,
		String email,
		String fullName,
		UserRole role,
		String profileImage) {

	public static UserResponse from(User u) {
		return new UserResponse(u.getId(), u.getEmail(), u.getFullName(), u.getRole(), u.getProfileImage());
	}
}
