package com.sliit.smartcampus.security;

import com.sliit.smartcampus.domain.enums.UserRole;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

	private final SecretKey key;
	private final long expirationMs;

	public JwtService(
			@Value("${app.jwt.secret}") String secret,
			@Value("${app.jwt.expiration-ms}") long expirationMs) {
		this.key = Keys.hmacShaKeyFor(ensureMinLength(secret).getBytes(StandardCharsets.UTF_8));
		this.expirationMs = expirationMs;
	}

	private static String ensureMinLength(String secret) {
		if (secret == null || secret.length() < 32) {
			throw new IllegalStateException("app.jwt.secret must be at least 32 characters");
		}
		return secret;
	}

	public String generateToken(String userId, UserRole role) {
		Date now = new Date();
		Date exp = new Date(now.getTime() + expirationMs);
		return Jwts.builder()
				.subject(userId)
				.claim("role", role.name())
				.issuedAt(now)
				.expiration(exp)
				.signWith(key)
				.compact();
	}

	public String extractUserId(String token) {
		return parseClaims(token).getSubject();
	}

	public UserRole extractRole(String token) {
		return UserRole.valueOf(parseClaims(token).get("role", String.class));
	}

	public boolean isValid(String token) {
		try {
			parseClaims(token);
			return true;
		} catch (Exception e) {
			return false;
		}
	}

	private Claims parseClaims(String token) {
		return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
	}
}
