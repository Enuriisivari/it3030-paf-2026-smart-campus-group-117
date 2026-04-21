package com.sliit.smartcampus.security;

import com.sliit.smartcampus.domain.entity.User;
import com.sliit.smartcampus.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

	private final JwtService jwtService;
	private final UserRepository userRepository;

	public JwtAuthenticationFilter(JwtService jwtService, UserRepository userRepository) {
		this.jwtService = jwtService;
		this.userRepository = userRepository;
	}

	@Override
	protected void doFilterInternal(
			@NonNull HttpServletRequest request,
			@NonNull HttpServletResponse response,
			@NonNull FilterChain filterChain) throws ServletException, IOException {
		String header = request.getHeader(HttpHeaders.AUTHORIZATION);
		if (header != null && header.startsWith("Bearer ")) {
			String token = header.substring(7).trim();
			if (jwtService.isValid(token)) {
				String userId = jwtService.extractUserId(token);
				userRepository.findById(userId).ifPresent(user -> {
					String role = "ROLE_" + user.getRole().name();
					UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
							user,
							null,
							List.of(new SimpleGrantedAuthority(role)));
					SecurityContextHolder.getContext().setAuthentication(auth);
				});
			}
		}
		filterChain.doFilter(request, response);
	}
}
