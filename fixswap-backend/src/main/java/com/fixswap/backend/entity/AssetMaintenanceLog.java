package com.fixswap.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "asset_maintenance_logs")
@Getter
@Setter
public class AssetMaintenanceLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "log_id", updatable = false, nullable = false)
    private UUID logId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id")
    private TempInventory asset;

    @Column(name = "maintenance_cost", nullable = false, precision = 10, scale = 2)
    private BigDecimal maintenanceCost;

    @Column(columnDefinition = "text")
    private String description;

    @Column(name = "logged_at", insertable = false, updatable = false)
    private LocalDateTime loggedAt;
}
