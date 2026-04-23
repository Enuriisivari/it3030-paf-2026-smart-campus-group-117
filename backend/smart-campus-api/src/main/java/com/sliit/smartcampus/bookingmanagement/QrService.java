package com.sliit.smartcampus.bookingmanagement;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.sliit.smartcampus.domain.entity.Booking;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;

@Service
public class QrService {

	private final byte[] hmacKey;

	public QrService(@Value("${app.qr.hmac-secret}") String secret) {
		if (secret == null || secret.length() < 16) {
			throw new IllegalStateException("app.qr.hmac-secret must be at least 16 characters");
		}
		this.hmacKey = secret.getBytes(StandardCharsets.UTF_8);
	}

	public String buildSignedPayload(Booking booking) {
		String sig = sign(booking.getId());
		return booking.getId() + ":" + sig;
	}

	public boolean verifySignature(String bookingId, String signatureHex) {
		if (bookingId == null || signatureHex == null || signatureHex.isBlank()) {
			return false;
		}
		return constantTimeEquals(sign(bookingId), signatureHex);
	}

	private String sign(String bookingId) {
		try {
			Mac mac = Mac.getInstance("HmacSHA256");
			mac.init(new SecretKeySpec(hmacKey, "HmacSHA256"));
			byte[] raw = mac.doFinal(bookingId.getBytes(StandardCharsets.UTF_8));
			return HexFormat.of().formatHex(raw);
		} catch (Exception e) {
			throw new IllegalStateException("HMAC failed", e);
		}
	}

	private static boolean constantTimeEquals(String a, String b) {
		if (a == null || b == null || a.length() != b.length()) {
			return false;
		}
		int result = 0;
		for (int i = 0; i < a.length(); i++) {
			result |= a.charAt(i) ^ b.charAt(i);
		}
		return result == 0;
	}

	public byte[] toPngBytes(String text, int width, int height) {
		try {
			QRCodeWriter writer = new QRCodeWriter();
			BitMatrix matrix = writer.encode(text, BarcodeFormat.QR_CODE, width, height);
			ByteArrayOutputStream out = new ByteArrayOutputStream();
			MatrixToImageWriter.writeToStream(matrix, "PNG", out);
			return out.toByteArray();
		} catch (Exception e) {
			throw new IllegalStateException("QR generation failed", e);
		}
	}
}
