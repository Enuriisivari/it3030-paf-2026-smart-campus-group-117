package com.sliit.smartcampus.repository;

import com.sliit.smartcampus.domain.entity.Ticket;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TicketRepository extends MongoRepository<Ticket, String> {

	List<Ticket> findAllByOrderByCreatedAtDesc();

	List<Ticket> findByCreatedByIdOrderByCreatedAtDesc(String createdById);

	List<Ticket> findByAssignedToIdOrderByCreatedAtDesc(String assignedToId);
}
