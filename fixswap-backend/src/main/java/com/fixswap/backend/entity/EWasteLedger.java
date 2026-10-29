package com.fixswap.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "e_waste_ledger")
@Getter
@Setter
public class EWasteLedger {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "ledger_id", updatable = false, nullable = false)
    private UUID ledgerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false)
    private ServiceTicket ticket;

    @Column(name = "carbon_saved_kg", nullable = false, precision = 8, scale = 2)
    private BigDecimal carbonSavedKg;

    @Column(name = "metal_saved_kg", nullable = false, precision = 8, scale = 2)
    private BigDecimal metalSavedKg;

    @Column(name = "coolant_saved_g", nullable = false, precision = 8, scale = 2)
    private BigDecimal coolantSavedG;

    @Column(name = "logged_at", insertable = false, updatable = false)
    private LocalDateTime loggedAt;
}
