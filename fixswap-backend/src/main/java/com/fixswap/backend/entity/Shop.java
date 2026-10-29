package com.fixswap.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "shops")
@Getter
@Setter
public class Shop {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "shop_id", updatable = false, nullable = false)
    private UUID shopId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private AuthCredential owner;

    @Column(name = "owner_name", length = 150)
    private String ownerName;

    @Column(name = "shop_name", nullable = false, length = 150)
    private String shopName;

    @Column(nullable = false, columnDefinition = "text")
    private String address;

    @Column(name = "geo_lat", nullable = false, precision = 10, scale = 8)
    private BigDecimal geoLat;

    @Column(name = "geo_lon", nullable = false, precision = 11, scale = 8)
    private BigDecimal geoLon;

    @Column(name = "is_active")
    private Boolean isActive;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Column(name = "service_radius_km")
    private Double serviceRadius = 8.0;

    @Column(name = "has_loaner_device")
    private Boolean hasLoanerDevice = true;
}
