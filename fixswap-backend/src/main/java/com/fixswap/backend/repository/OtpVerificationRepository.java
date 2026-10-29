package com.fixswap.backend.repository;

import com.fixswap.backend.entity.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OtpVerificationRepository extends JpaRepository<OtpVerification, UUID> {
    Optional<OtpVerification> findByTicketTicketIdAndOtpTypeAndIsVerifiedFalse(UUID ticketId, String otpType);
}
