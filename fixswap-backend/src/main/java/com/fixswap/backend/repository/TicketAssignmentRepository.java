package com.fixswap.backend.repository;

import com.fixswap.backend.entity.TicketAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TicketAssignmentRepository extends JpaRepository<TicketAssignment, UUID> {
    Optional<TicketAssignment> findByTicketTicketId(UUID ticketId);
    List<TicketAssignment> findByAgentAgentIdOrderByAssignedAtDesc(UUID agentId);
}
