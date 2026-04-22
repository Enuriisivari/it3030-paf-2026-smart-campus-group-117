package com.sliit.smartcampus.maintenancetickets.dto;

import jakarta.validation.constraints.NotBlank;

public record CommentRequest(@NotBlank String commentText) {
}
