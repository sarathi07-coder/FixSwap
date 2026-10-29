package com.fixswap.backend.repository;

import com.fixswap.backend.entity.EWastePickupRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface EWastePickupRequestRepository extends JpaRepository<EWastePickupRequest, UUID> {
    List<EWastePickupRequest> findByCompanyAuthIdOrderByCreatedAtDesc(UUID companyId);
}
