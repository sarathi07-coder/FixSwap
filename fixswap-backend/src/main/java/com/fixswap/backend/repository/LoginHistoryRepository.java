package com.fixswap.backend.repository;

import com.fixswap.backend.entity.LoginHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LoginHistoryRepository extends JpaRepository<LoginHistory, UUID> {
    Optional<LoginHistory> findFirstByUserAuthIdAndSessionStatusOrderByLoginTimeDesc(UUID authId, String sessionStatus);
    List<LoginHistory> findByUserAuthIdOrderByLoginTimeDesc(UUID authId);
}
