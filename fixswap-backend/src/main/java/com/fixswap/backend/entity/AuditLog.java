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
@Table(name = "audit_logs")
@Getter
@Setter
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "log_id", updatable = false, nullable = false)
    private UUID logId;

    @Column(name = "table_name", nullable = false, length = 50)
    private String tableName;

    @Column(name = "action_type", nullable = false, length = 20)
    private String actionType;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "record_data", columnDefinition = "jsonb")
    private Map<String, Object> recordData;

    @Column(name = "logged_at", insertable = false, updatable = false)
    private LocalDateTime loggedAt;
}
