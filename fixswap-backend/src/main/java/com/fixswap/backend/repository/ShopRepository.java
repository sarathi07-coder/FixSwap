package com.fixswap.backend.repository;

import com.fixswap.backend.entity.Shop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ShopRepository extends JpaRepository<Shop, UUID> {
    List<Shop> findByOwnerAuthId(UUID ownerId);
    Optional<Shop> findFirstByOwnerAuthIdAndIsActiveTrueOrderByShopNameAsc(UUID ownerId);
    List<Shop> findByIsActiveTrue();

    @org.springframework.data.jpa.repository.Query(value = "SELECT * FROM shops WHERE is_active = true AND has_loaner_device = true AND func_calc_distance_km(geo_lat, geo_lon, :lat, :lon) <= :radiusKm", nativeQuery = true)
    List<Shop> findNearbyShopsWithLoaners(@org.springframework.data.repository.query.Param("lat") java.math.BigDecimal lat, 
                                          @org.springframework.data.repository.query.Param("lon") java.math.BigDecimal lon, 
                                          @org.springframework.data.repository.query.Param("radiusKm") Double radiusKm);
}
