package com.sliit.smartcampus.authnotifications.dto;

import com.sliit.smartcampus.domain.enums.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record DevLoginRequest(
		@NotBlank @Email String email,
		@NotBlank String fullName,
		UserRole role) {
}
