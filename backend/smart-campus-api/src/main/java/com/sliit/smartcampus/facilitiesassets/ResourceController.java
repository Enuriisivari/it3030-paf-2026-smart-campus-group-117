package com.sliit.smartcampus.facilitiesassets;

import com.sliit.smartcampus.domain.enums.ResourceStatus;
import com.sliit.smartcampus.domain.enums.ResourceType;
import com.sliit.smartcampus.facilitiesassets.dto.ResourceRequest;
import com.sliit.smartcampus.facilitiesassets.dto.ResourceResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
public class ResourceController {

	private final ResourceService resourceService;

	public ResourceController(ResourceService resourceService) {
		this.resourceService = resourceService;
	}

	@GetMapping
	public List<ResourceResponse> list(
			@RequestParam(required = false) String name,
			@RequestParam(required = false) ResourceType type,
			@RequestParam(required = false) String location,
			@RequestParam(required = false) ResourceStatus status) {
		return resourceService.findAll(name, type, location, status);
	}

	@GetMapping("/{id}")
	public ResourceResponse get(@PathVariable String id) {
		return resourceService.findById(id);
	}

	@PostMapping
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<ResourceResponse> create(@Valid @RequestBody ResourceRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(resourceService.create(request));
	}

	@PutMapping("/{id}")
	@PreAuthorize("hasRole('ADMIN')")
	public ResourceResponse update(@PathVariable String id, @Valid @RequestBody ResourceRequest request) {
		return resourceService.update(id, request);
	}

	@DeleteMapping("/{id}")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<Void> delete(@PathVariable String id) {
		resourceService.delete(id);
		return ResponseEntity.noContent().build();
	}
}
