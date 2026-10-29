package com.fixswap.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "e_waste_pickup_requests")
@Getter
@Setter
public class EWastePickupRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "request_id", updatable = false, nullable = false)
    private UUID requestId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private AuthCredential company;

    @Column(name = "waste_type", nullable = false, length = 50)
    private String wasteType;

    @Column(name = "estimated_kg", precision = 10, scale = 2)
    private BigDecimal estimatedKg = BigDecimal.ZERO;

    @Column(name = "status", length = 20)
    private String status = "SCHEDULED";

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
