package com.fixswap.backend.repository;

import com.fixswap.backend.entity.FinancialLedger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FinancialLedgerRepository extends JpaRepository<FinancialLedger, UUID> {

    Optional<FinancialLedger> findByTicketTicketId(UUID ticketId);

    Optional<FinancialLedger> findByInvoiceId(UUID invoiceId);

    List<FinancialLedger> findByTicketCustomerAuthIdOrderByIssuedAtDesc(UUID customerId);

    List<FinancialLedger> findByTicketShopShopIdOrderByIssuedAtDesc(UUID shopId);

    @Query("""
            SELECT f FROM FinancialLedger f
            WHERE f.ticket.status = 'COMPLETED'
            AND (f.ticket.pickupDeliveryPartner.workerId = :workerId
                 OR f.ticket.returnDeliveryPartner.workerId = :workerId)
            ORDER BY f.issuedAt DESC
            """)
    List<FinancialLedger> findCourierEarnings(@Param("workerId") UUID workerId);

    @Query("SELECT COALESCE(SUM(f.finalTotal), 0) FROM FinancialLedger f WHERE f.ticket.shop.shopId = :shopId AND f.paymentStatus = 'PAID'")
    BigDecimal getTotalRevenueByShop(@Param("shopId") UUID shopId);
}
