package com.sliit.smartcampus.authnotifications;

import com.sliit.smartcampus.authnotifications.dto.NotificationResponse;
import com.sliit.smartcampus.domain.entity.Notification;
import com.sliit.smartcampus.domain.entity.User;
import com.sliit.smartcampus.domain.enums.NotificationType;
import com.sliit.smartcampus.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

	private final NotificationRepository notificationRepository;

	public NotificationService(NotificationRepository notificationRepository) {
		this.notificationRepository = notificationRepository;
	}

	@Transactional
	public void create(User user, String title, String message, NotificationType type, String referenceId) {
		notificationRepository.save(Notification.builder()
				.userId(user.getId())
				.title(title)
				.message(message)
				.type(type)
				.referenceId(referenceId)
				.isRead(false)
				.build());
	}

	@Transactional(readOnly = true)
	public List<NotificationResponse> listFor(User user) {
		return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
				.map(NotificationResponse::from)
				.toList();
	}

	@Transactional
	public NotificationResponse markRead(String id, User user) {
		Notification n = notificationRepository.findById(id)
				.orElseThrow(() -> new IllegalArgumentException("Notification not found: " + id));
		if (!n.getUserId().equals(user.getId())) {
			throw new org.springframework.security.access.AccessDeniedException("Not allowed");
		}
		n.setIsRead(true);
		return NotificationResponse.from(notificationRepository.save(n));
	}
}
