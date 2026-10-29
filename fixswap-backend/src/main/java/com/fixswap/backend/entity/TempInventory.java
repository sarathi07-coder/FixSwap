package com.fixswap.backend.entity;

import com.fixswap.backend.entity.enums.DeviceState;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "temp_inventory")
@Getter
@Setter
public class TempInventory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "asset_id", updatable = false, nullable = false)
    private UUID assetId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shop_id")
    private Shop shop;

    @Column(name = "appliance_category", nullable = false, length = 50)
    private String applianceCategory;

    @Column(nullable = false, length = 100)
    private String brand;

    @Column(name = "serial_number", nullable = false, unique = true, length = 100)
    private String serialNumber;

    @Column(name = "replacement_value", nullable = false, precision = 10, scale = 2)
    private BigDecimal replacementValue;

    @Column(name = "daily_rental_rate", nullable = false, precision = 8, scale = 2)
    private BigDecimal dailyRentalRate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", columnDefinition = "device_state")
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    private DeviceState status;

    @Column(name = "total_life_cycles")
    private Integer totalLifeCycles;
}
