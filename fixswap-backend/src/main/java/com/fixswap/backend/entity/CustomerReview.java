package com.fixswap.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "customer_reviews")
@Getter
@Setter
public class CustomerReview {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "review_id", updatable = false, nullable = false)
    private UUID reviewId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false)
    private ServiceTicket ticket;

    @Column(name = "rating")
    private Integer rating;

    @Column(columnDefinition = "text")
    private String comments;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
