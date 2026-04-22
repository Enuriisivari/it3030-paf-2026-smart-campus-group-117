package com.sliit.smartcampus.repository;

import com.sliit.smartcampus.domain.entity.TicketAttachment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TicketAttachmentRepository extends MongoRepository<TicketAttachment, String> {

	List<TicketAttachment> findByTicketId(String ticketId);
}
