package com.sliit.smartcampus.maintenancetickets.dto;

import jakarta.validation.constraints.NotNull;

public record AssignRequest(@NotNull String userId) {
}
