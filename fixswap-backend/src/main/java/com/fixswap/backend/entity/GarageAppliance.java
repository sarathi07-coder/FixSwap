package com.fixswap.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_garage_appliances")
@Getter
@Setter
public class GarageAppliance {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "garage_id", updatable = false, nullable = false)
    private UUID garageId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private AuthCredential user;

    @Column(name = "category", nullable = false, length = 50)
    private String category;

    @Column(name = "product", nullable = false, length = 100)
    private String product;

    @Column(name = "brand", length = 100)
    private String brand;

    @Column(name = "model", length = 100)
    private String model;

    @Column(name = "purchase_year")
    private Integer purchaseYear;

    @Column(name = "photo_base64", columnDefinition = "TEXT")
    private String photoBase64;

    @Column(name = "registry_type", length = 20)
    private String registryType = "HOUSEHOLD";

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
