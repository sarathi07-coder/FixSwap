package com.fixswap.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "otp_verifications")
@Getter
@Setter
public class OtpVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "otp_id", updatable = false, nullable = false)
    private UUID otpId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false)
    private ServiceTicket ticket;

    @Column(name = "otp_type", nullable = false, length = 40)
    private String otpType; // e.g. HUB_LOANER_PICKUP, WORKER_HUB_LOANER_PICKUP

    @Column(name = "code", nullable = false, length = 6)
    private String code;

    @Column(name = "is_verified")
    private Boolean isVerified = false;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;
}
