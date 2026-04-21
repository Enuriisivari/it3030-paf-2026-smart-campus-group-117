package com.sliit.smartcampus.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

	@Value("${app.upload.dir:uploads/ticket-attachments}")
	private String uploadDir;

	@Override
	public void addResourceHandlers(ResourceHandlerRegistry registry) {
		String location = uploadDir.endsWith("/") ? "file:" + uploadDir : "file:" + uploadDir + "/";
		registry.addResourceHandler("/uploads/**").addResourceLocations(location);
	}
}
