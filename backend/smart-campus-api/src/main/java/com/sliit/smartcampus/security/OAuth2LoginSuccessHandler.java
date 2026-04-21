package com.sliit.smartcampus.security;

import com.sliit.smartcampus.domain.entity.User;
import com.sliit.smartcampus.domain.enums.UserRole;
import com.sliit.smartcampus.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

	private final UserRepository userRepository;
	private final JwtService jwtService;
	private final String frontendUrl;

	public OAuth2LoginSuccessHandler(
			UserRepository userRepository,
			JwtService jwtService,
			@Value("${app.frontend-url:http://localhost:5173}") String frontendUrl) {
		this.userRepository = userRepository;
		this.jwtService = jwtService;
		this.frontendUrl = frontendUrl;
	}

	@Override
	@Transactional
	public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
			Authentication authentication) throws IOException, ServletException {
		OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
		String sub = oauth2User.getAttribute("sub");
		if (sub == null) {
			response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Missing OAuth subject");
			return;
		}
		String rawEmail = oauth2User.getAttribute("email");
		final String email = (rawEmail == null || rawEmail.isBlank()) ? sub + "@oauth.local" : rawEmail;
		String rawName = oauth2User.getAttribute("name");
		final String name = (rawName == null || rawName.isBlank()) ? email : rawName;
		final String picture = oauth2User.getAttribute("picture");

		User user = userRepository.findByOauthId(sub).orElseGet(() -> {
			UserRole role = userRepository.count() == 0 ? UserRole.ADMIN : UserRole.USER;
			return userRepository.save(User.builder()
					.oauthId(sub)
					.email(email)
					.fullName(name)
					.role(role)
					.profileImage(picture)
					.build());
		});

		if (user.getProfileImage() == null && picture != null) {
			user.setProfileImage(picture);
			user = userRepository.save(user);
		}

		String token = jwtService.generateToken(user.getId(), user.getRole());
		String url = frontendUrl + "/auth/callback?token=" + URLEncoder.encode(token, StandardCharsets.UTF_8);
		response.sendRedirect(url);
	}
}
