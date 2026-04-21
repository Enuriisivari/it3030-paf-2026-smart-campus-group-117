package com.sliit.smartcampus.authnotifications;

import com.sliit.smartcampus.authnotifications.dto.NotificationResponse;
import com.sliit.smartcampus.domain.entity.User;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

	private final NotificationService notificationService;

	public NotificationController(NotificationService notificationService) {
		this.notificationService = notificationService;
	}

	@GetMapping
	public List<NotificationResponse> list(@AuthenticationPrincipal User user) {
		return notificationService.listFor(user);
	}

	@PutMapping("/{id}/read")
	public NotificationResponse markRead(@PathVariable String id, @AuthenticationPrincipal User user) {
		return notificationService.markRead(id, user);
	}
}
