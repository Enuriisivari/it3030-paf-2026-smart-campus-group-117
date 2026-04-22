package com.sliit.smartcampus.maintenancetickets.dto;

import com.sliit.smartcampus.domain.entity.Comment;

import java.time.Instant;

public record CommentResponse(
		String id,
		String userId,
		String userName,
		String commentText,
		Instant createdAt) {

	public static CommentResponse from(Comment c, String userName) {
		return new CommentResponse(
				c.getId(),
				c.getUserId(),
				userName,
				c.getCommentText(),
				c.getCreatedAt());
	}
}
