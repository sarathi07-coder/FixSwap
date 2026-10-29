package com.fixswap.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "agent_telemetry")
@Getter
@Setter
public class AgentTelemetry {

    @Id
    @Column(name = "agent_id")
    private UUID agentId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "agent_id")
    private AuthCredential agent;

    @Column(name = "is_on_duty")
    private Boolean isOnDuty;

    @Column(name = "current_lat", precision = 10, scale = 8)
    private BigDecimal currentLat;

    @Column(name = "current_lon", precision = 11, scale = 8)
    private BigDecimal currentLon;

    @Column(name = "last_updated", insertable = false, updatable = false)
    private LocalDateTime lastUpdated;
}
