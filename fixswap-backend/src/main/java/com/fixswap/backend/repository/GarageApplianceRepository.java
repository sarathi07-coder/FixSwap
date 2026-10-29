package com.fixswap.backend.repository;

import com.fixswap.backend.entity.GarageAppliance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface GarageApplianceRepository extends JpaRepository<GarageAppliance, UUID> {
    List<GarageAppliance> findByUserAuthIdOrderByCreatedAtDesc(UUID authId);

    List<GarageAppliance> findByUserAuthIdAndRegistryTypeOrderByCreatedAtDesc(UUID authId, String registryType);

    List<GarageAppliance> findByUserAuthIdAndRegistryTypeIsNullOrderByCreatedAtDesc(UUID authId);
}
