package com.fixswap.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "login_history")
@Getter
@Setter
public class LoginHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "log_id", updatable = false, nullable = false)
    private UUID logId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private AuthCredential user;

    @Column(name = "login_time", insertable = false, updatable = false)
    private LocalDateTime loginTime;

    @Column(name = "logout_time")
    private LocalDateTime logoutTime;

    @Column(name = "session_status", length = 20)
    private String sessionStatus = "ACTIVE";

    @Column(name = "portal_type", length = 20)
    private String portalType;

    @Column(name = "session_duration_seconds")
    private Long sessionDurationSeconds;
}
