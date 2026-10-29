package com.fixswap.backend.service;

import com.fixswap.backend.dto.ShopDashboardStats;
import com.fixswap.backend.entity.Shop;
import com.fixswap.backend.entity.TempInventory;
import com.fixswap.backend.entity.enums.DeviceState;
import com.fixswap.backend.entity.enums.TicketState;
import com.fixswap.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ShopService {

    private final ShopRepository shopRepository;
    private final ServiceTicketRepository ticketRepository;
    private final TempInventoryRepository inventoryRepository;
    private final FinancialLedgerRepository financialLedgerRepository;
    private final CustomerReviewRepository reviewRepository;

    public List<Shop> getAllShops() {
        return shopRepository.findAll();
    }

    public Shop getShopById(UUID shopId) {
        return shopRepository.findById(shopId)
                .orElseThrow(() -> new RuntimeException("Shop not found: " + shopId));
    }

    public List<Shop> getShopsByOwner(UUID ownerId) {
        return shopRepository.findByOwnerAuthId(ownerId);
    }

    public List<TempInventory> getInventoryByShop(UUID shopId) {
        return inventoryRepository.findByShopShopId(shopId);
    }

    public ShopDashboardStats getDashboardStats(UUID shopId) {
        BigDecimal revenue = financialLedgerRepository.getTotalRevenueByShop(shopId);
        long pending = ticketRepository.countByShopShopIdAndStatus(shopId, TicketState.PENDING);
        long active = ticketRepository.countByShopShopIdAndStatus(shopId, TicketState.IN_REPAIR);
        long completed = ticketRepository.countByShopShopIdAndStatus(shopId, TicketState.COMPLETED);
        Double avgRating = reviewRepository.getAverageRatingByShop(shopId);
        long totalReviews = reviewRepository.countByTicketShopShopId(shopId);
        long availableAssets = inventoryRepository.countByShopShopIdAndStatus(shopId, DeviceState.AVAILABLE);
        long totalAssets = inventoryRepository.findByShopShopId(shopId).size();

        return ShopDashboardStats.builder()
                .totalRevenue(revenue != null ? revenue : BigDecimal.ZERO)
                .pendingTickets(pending)
                .activeTickets(active)
                .completedTickets(completed)
                .avgRating(avgRating != null ? avgRating : 0.0)
                .totalReviews(totalReviews)
                .availableAssets(availableAssets)
                .totalAssets(totalAssets)
                .build();
    }
}
