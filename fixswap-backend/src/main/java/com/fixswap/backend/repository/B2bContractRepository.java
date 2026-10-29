package com.fixswap.backend.repository;

import com.fixswap.backend.entity.B2bContract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface B2bContractRepository extends JpaRepository<B2bContract, UUID> {
    Optional<B2bContract> findByHotelAuthId(UUID hotelAuthId);
}
