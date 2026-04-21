package com.sliit.smartcampus.bookingmanagement.dto;

import jakarta.validation.constraints.NotBlank;

public record VerifyQrRequest(@NotBlank String payload) {
}
