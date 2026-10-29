package com.fixswap.backend.repository;

import com.fixswap.backend.entity.TempInventory;
import com.fixswap.backend.entity.enums.DeviceState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TempInventoryRepository extends JpaRepository<TempInventory, UUID> {
    List<TempInventory> findByShopShopId(UUID shopId);
    List<TempInventory> findByShopShopIdAndStatus(UUID shopId, DeviceState status);
    long countByShopShopIdAndStatus(UUID shopId, DeviceState status);
}
