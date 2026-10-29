package com.fixswap.backend.entity;

import com.fixswap.backend.entity.enums.CustomerCategory;
import com.fixswap.backend.entity.enums.RoleType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "auth_credentials", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"phone_number", "role"})
})
@Getter
@Setter
public class AuthCredential {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "auth_id", updatable = false, nullable = false)
    @com.fasterxml.jackson.annotation.JsonProperty("userId")
    private UUID authId;

    @Column(nullable = false, length = 150)
    private String email;

    @Column(name = "phone_number", nullable = false, length = 20)
    private String phoneNumber;

    @Column(name = "password_hash")
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", columnDefinition = "role_type")
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    private RoleType role;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
