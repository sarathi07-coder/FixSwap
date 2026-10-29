package com.fixswap.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class InvoiceDetailDto {
    private UUID invoiceId;
    private UUID ledgerId;
    private UUID ticketId;
    private String ticketShortId;
    private String paymentStatus;
    private LocalDateTime issuedAt;
    private LocalDateTime paidAt;

    private String applianceCategory;
    private String applianceProduct;
    private String applianceBrand;
    private String applianceModel;
    private Integer purchaseYear;
    private String issueDescription;
    private String fulfillmentType;
    private String shopName;

    private List<InvoiceLineItemDto> lineItems;
    private BigDecimal subtotal;
    private BigDecimal rentalCost;
    private BigDecimal baseRepairCost;
    private BigDecimal b2bDiscount;
    private BigDecimal fineAmount;
    private BigDecimal gstAmount;
    private BigDecimal finalTotal;

    private BigDecimal shopPayout;
    private BigDecimal courierPickupPayout;
    private BigDecimal courierReturnPayout;
    private BigDecimal platformFee;

    private String pricingModelVersion;
    private String pricingSummary;
}
