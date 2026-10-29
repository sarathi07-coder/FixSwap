package com.fixswap.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "ticket_assignments")
@Getter
@Setter
public class TicketAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "assignment_id", updatable = false, nullable = false)
    private UUID assignmentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false)
    private ServiceTicket ticket;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agent_id", nullable = false)
    private AgentTelemetry agent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id")
    private TempInventory asset;

    @Column(name = "assigned_at", insertable = false, updatable = false)
    private LocalDateTime assignedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;
}
