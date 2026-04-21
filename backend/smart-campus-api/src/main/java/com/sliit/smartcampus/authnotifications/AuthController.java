package com.sliit.smartcampus.authnotifications;

import com.sliit.smartcampus.authnotifications.dto.DevLoginRequest;
import com.sliit.smartcampus.authnotifications.dto.TokenResponse;
import com.sliit.smartcampus.authnotifications.dto.UserResponse;
import com.sliit.smartcampus.domain.entity.User;
import com.sliit.smartcampus.domain.enums.UserRole;
import com.sliit.smartcampus.repository.UserRepository;
import com.sliit.smartcampus.security.JwtService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

	private final UserRepository userRepository;
	private final JwtService jwtService;
	private final boolean devLoginEnabled;

	public AuthController(
			UserRepository userRepository,
			JwtService jwtService,
			@Value("${app.dev-login.enabled:false}") boolean devLoginEnabled) {
		this.userRepository = userRepository;
		this.jwtService = jwtService;
		this.devLoginEnabled = devLoginEnabled;
	}

	@PostMapping("/dev-login")
	public ResponseEntity<TokenResponse> devLogin(@Valid @RequestBody DevLoginRequest req) {
		if (!devLoginEnabled) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Dev login is disabled");
		}
		String oauthId = "dev:" + req.email().trim().toLowerCase();
		Optional<User> existing = userRepository.findByOauthId(oauthId);
		if (existing.isEmpty()) {
			existing = userRepository.findByEmail(req.email().trim());
		}
		User user;
		if (existing.isEmpty()) {
			UserRole role = req.role() != null ? req.role() : (userRepository.count() == 0 ? UserRole.ADMIN : UserRole.USER);
			user = userRepository.save(User.builder()
					.oauthId(oauthId)
					.email(req.email().trim())
					.fullName(req.fullName().trim())
					.role(role)
					.build());
		} else {
			user = existing.get();
			user.setFullName(req.fullName().trim());
			if (req.role() != null) {
				user.setRole(req.role());
			}
			user = userRepository.save(user);
		}
		String token = jwtService.generateToken(user.getId(), user.getRole());
		return ResponseEntity.ok(new TokenResponse(token, UserResponse.from(user)));
	}
}
