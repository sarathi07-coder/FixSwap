package com.fixswap.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "financial_ledger")
@Getter
@Setter
public class FinancialLedger {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "ledger_id", updatable = false, nullable = false)
    private UUID ledgerId;

    @Column(name = "invoice_id", nullable = false)
    private UUID invoiceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false)
    private ServiceTicket ticket;

    @Column(name = "base_repair_cost", precision = 10, scale = 2)
    private BigDecimal baseRepairCost = BigDecimal.ZERO;

    @Column(name = "rental_cost", precision = 10, scale = 2)
    private BigDecimal rentalCost = BigDecimal.ZERO;

    @Column(name = "b2b_discount", precision = 10, scale = 2)
    private BigDecimal b2bDiscount = BigDecimal.ZERO;

    @Column(name = "fine_amount", precision = 10, scale = 2)
    private BigDecimal fineAmount = BigDecimal.ZERO;

    @Column(name = "subtotal", precision = 10, scale = 2)
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(name = "gst_amount", precision = 10, scale = 2)
    private BigDecimal gstAmount = BigDecimal.ZERO;

    @Column(name = "final_total", precision = 10, scale = 2)
    private BigDecimal finalTotal = BigDecimal.ZERO;

    @Column(name = "shop_payout", precision = 10, scale = 2)
    private BigDecimal shopPayout = BigDecimal.ZERO;

    @Column(name = "courier_pickup_payout", precision = 10, scale = 2)
    private BigDecimal courierPickupPayout = BigDecimal.ZERO;

    @Column(name = "courier_return_payout", precision = 10, scale = 2)
    private BigDecimal courierReturnPayout = BigDecimal.ZERO;

    @Column(name = "platform_fee", precision = 10, scale = 2)
    private BigDecimal platformFee = BigDecimal.ZERO;

    @Column(name = "payment_status", length = 20)
    private String paymentStatus = "UNPAID";

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "line_items_json", columnDefinition = "text")
    private String lineItemsJson;

    @Column(name = "issued_at")
    private LocalDateTime issuedAt;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() {
        if (invoiceId == null) {
            invoiceId = UUID.randomUUID();
        }
        if (issuedAt == null) {
            issuedAt = LocalDateTime.now();
        }
    }
}
