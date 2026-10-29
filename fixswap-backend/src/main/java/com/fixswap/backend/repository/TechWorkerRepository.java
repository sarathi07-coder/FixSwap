package com.fixswap.backend.repository;

import com.fixswap.backend.entity.TechWorker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TechWorkerRepository extends JpaRepository<TechWorker, UUID> {
    List<TechWorker> findByShopShopId(UUID shopId);
    List<TechWorker> findByShopShopIdAndIsOnDutyTrue(UUID shopId);

    @Query("SELECT w FROM TechWorker w JOIN FETCH w.authCredential WHERE w.workerType = :workerType AND w.kycStatus = :kycStatus ORDER BY w.fullName ASC")
    List<TechWorker> findByWorkerTypeAndKycStatusWithAuth(@Param("workerType") String workerType, @Param("kycStatus") String kycStatus);
}
