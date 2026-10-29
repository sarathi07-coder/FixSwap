package com.fixswap.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "iot_error_logs")
@Getter
@Setter
public class IotErrorLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "log_id", updatable = false, nullable = false)
    private UUID logId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private AuthCredential user;

    @Column(name = "appliance_type", length = 50)
    private String applianceType;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "sensor_payload", nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> sensorPayload;

    @Column(name = "is_processed")
    private Boolean isProcessed;

    @Column(name = "logged_at", insertable = false, updatable = false)
    private LocalDateTime loggedAt;
}
