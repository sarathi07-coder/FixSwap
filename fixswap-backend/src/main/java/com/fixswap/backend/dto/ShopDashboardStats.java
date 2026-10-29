package com.fixswap.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class ShopDashboardStats {
    private BigDecimal totalRevenue;
    private long pendingTickets;
    private long activeTickets;
    private long completedTickets;
    private Double avgRating;
    private long totalReviews;
    private long availableAssets;
    private long totalAssets;
}
