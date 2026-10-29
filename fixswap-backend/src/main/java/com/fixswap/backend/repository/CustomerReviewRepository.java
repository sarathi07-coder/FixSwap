package com.fixswap.backend.repository;

import com.fixswap.backend.entity.CustomerReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CustomerReviewRepository extends JpaRepository<CustomerReview, UUID> {

    @Query("SELECT AVG(r.rating) FROM CustomerReview r WHERE r.ticket.shop.shopId = :shopId")
    Double getAverageRatingByShop(@Param("shopId") UUID shopId);

    long countByTicketShopShopId(UUID shopId);
}
