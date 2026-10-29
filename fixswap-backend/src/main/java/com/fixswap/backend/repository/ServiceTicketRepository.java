package com.fixswap.backend.repository;

import com.fixswap.backend.entity.ServiceTicket;
import com.fixswap.backend.entity.enums.TicketState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ServiceTicketRepository extends JpaRepository<ServiceTicket, UUID> {
    List<ServiceTicket> findByCustomerAuthIdOrderByCreatedAtDesc(UUID customerId);

    List<ServiceTicket> findByCustomerAuthIdAndTicketChannelOrderByCreatedAtDesc(UUID customerId, String ticketChannel);
    List<ServiceTicket> findByShopShopIdOrderByCreatedAtDesc(UUID shopId);
    List<ServiceTicket> findByStatus(TicketState status);
    long countByShopShopIdAndStatus(UUID shopId, TicketState status);

    @Query("SELECT t FROM ServiceTicket t WHERE t.shop.shopId = :shopId AND t.status != 'COMPLETED' AND t.status != 'CANCELLED' AND t.status != 'DISPUTED' ORDER BY t.createdAt DESC")
    List<ServiceTicket> findActiveTicketsByShop(@Param("shopId") UUID shopId);

    @Query("SELECT t FROM ServiceTicket t WHERE t.assignedWorker.workerId = :workerId AND t.status != 'COMPLETED' AND t.status != 'CANCELLED' AND t.status != 'DISPUTED' ORDER BY t.createdAt DESC")
    List<ServiceTicket> findActiveTicketsByWorker(@Param("workerId") UUID workerId);

    @Query("SELECT COUNT(t) FROM ServiceTicket t WHERE t.customer.authId = :customerId AND t.status != 'COMPLETED' AND t.status != 'CANCELLED'")
    long countActiveByCustomer(@Param("customerId") UUID customerId);

    @Query("SELECT COUNT(t) FROM ServiceTicket t WHERE t.customer.authId = :customerId AND t.ticketChannel = :channel AND t.status != 'COMPLETED' AND t.status != 'CANCELLED'")
    long countActiveByCustomerAndChannel(@Param("customerId") UUID customerId, @Param("channel") String channel);

    @Query("SELECT COUNT(t) FROM ServiceTicket t WHERE t.customer.authId = :customerId AND t.applianceCategory = :category AND t.ticketChannel = 'HOUSEHOLD' AND t.status != 'COMPLETED' AND t.status != 'CANCELLED'")
    long countActiveByCustomerAndCategory(@Param("customerId") UUID customerId, @Param("category") String category);

    @Query(value = "SELECT t.* FROM service_tickets t " +
            "WHERE t.shop_id = :shopId " +
            "   OR (t.status = 'PENDING' AND func_calc_distance_km(t.customer_lat, t.customer_lon, " +
            "       (SELECT s.geo_lat FROM shops s WHERE s.shop_id = :shopId), " +
            "       (SELECT s.geo_lon FROM shops s WHERE s.shop_id = :shopId)) <= 8.0) " +
            "ORDER BY t.created_at DESC", nativeQuery = true)
    List<ServiceTicket> findBroadcastTicketsForShop(@Param("shopId") java.util.UUID shopId);

    @Query("SELECT t FROM ServiceTicket t WHERE t.fulfillmentType = 'DELIVERY_PARTNER' AND (t.pickupDeliveryPartner.workerId = :workerId OR t.returnDeliveryPartner.workerId = :workerId) AND t.status != 'COMPLETED' AND t.status != 'CANCELLED' AND t.status != 'DISPUTED' ORDER BY t.createdAt DESC")
    List<ServiceTicket> findActiveTicketsByDeliveryPartner(@Param("workerId") UUID workerId);

    @Query("SELECT t FROM ServiceTicket t WHERE t.fulfillmentType = 'DELIVERY_PARTNER' AND t.status = 'ACCEPTED' AND t.pickupDeliveryPartner IS NULL ORDER BY t.createdAt DESC")
    List<ServiceTicket> findAvailablePickupsForDelivery();

    @Query("SELECT t FROM ServiceTicket t WHERE t.fulfillmentType = 'DELIVERY_PARTNER' AND t.status = 'AWAITING_RETURN_PICKUP' AND t.returnDeliveryPartner IS NULL ORDER BY t.createdAt DESC")
    List<ServiceTicket> findAvailableReturnsForDelivery();
}
