package com.sliit.smartcampus.maintenancetickets.dto;

import com.sliit.smartcampus.domain.entity.TicketAttachment;

public record AttachmentResponse(String id, String fileName, String url) {

	public static AttachmentResponse from(TicketAttachment a) {
		String p = a.getFilePath().replace("\\", "/").replaceFirst("^/+", "");
		String url = "/uploads/" + p;
		return new AttachmentResponse(a.getId(), a.getFileName(), url);
	}
}
