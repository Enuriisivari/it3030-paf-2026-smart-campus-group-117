package com.sliit.smartcampus.facilitiesassets;

import com.sliit.smartcampus.domain.entity.Resource;
import com.sliit.smartcampus.domain.enums.ResourceStatus;
import com.sliit.smartcampus.domain.enums.ResourceType;
import com.sliit.smartcampus.facilitiesassets.dto.ResourceRequest;
import com.sliit.smartcampus.facilitiesassets.dto.ResourceResponse;
import com.sliit.smartcampus.repository.ResourceRepository;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ResourceService {

	private final ResourceRepository resourceRepository;
	private final MongoTemplate mongoTemplate;

	public ResourceService(ResourceRepository resourceRepository, MongoTemplate mongoTemplate) {
		this.resourceRepository = resourceRepository;
		this.mongoTemplate = mongoTemplate;
	}

	public List<ResourceResponse> findAll(String name, ResourceType type, String location, ResourceStatus status) {
		Query q = new Query().with(Sort.by(Sort.Direction.ASC, "name"));
		if (name != null && !name.isBlank()) {
			q.addCriteria(Criteria.where("name").regex(name.trim(), "i"));
		}
		if (type != null) {
			q.addCriteria(Criteria.where("type").is(type));
		}
		if (location != null && !location.isBlank()) {
			q.addCriteria(Criteria.where("location").regex(location.trim(), "i"));
		}
		if (status != null) {
			q.addCriteria(Criteria.where("status").is(status));
		}
		return mongoTemplate.find(q, Resource.class).stream()
				.map(ResourceResponse::from)
				.toList();
	}

	public ResourceResponse findById(String id) {
		Resource r = resourceRepository.findById(id)
				.orElseThrow(() -> new IllegalArgumentException("Resource not found: " + id));
		return ResourceResponse.from(r);
	}

	public ResourceResponse create(ResourceRequest req) {
		Resource r = Resource.builder()
				.name(req.name())
				.type(req.type())
				.capacity(req.capacity())
				.location(req.location())
				.availableFrom(req.availableFrom())
				.availableTo(req.availableTo())
				.status(req.status())
				.build();
		return ResourceResponse.from(resourceRepository.save(r));
	}

	public ResourceResponse update(String id, ResourceRequest req) {
		Resource r = resourceRepository.findById(id)
				.orElseThrow(() -> new IllegalArgumentException("Resource not found: " + id));
		r.setName(req.name());
		r.setType(req.type());
		r.setCapacity(req.capacity());
		r.setLocation(req.location());
		r.setAvailableFrom(req.availableFrom());
		r.setAvailableTo(req.availableTo());
		r.setStatus(req.status());
		return ResourceResponse.from(resourceRepository.save(r));
	}

	public void delete(String id) {
		if (!resourceRepository.existsById(id)) {
			throw new IllegalArgumentException("Resource not found: " + id);
		}
		resourceRepository.deleteById(id);
	}
}
