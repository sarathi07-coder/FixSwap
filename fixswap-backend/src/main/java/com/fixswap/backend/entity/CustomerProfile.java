package com.fixswap.backend.entity;

import com.fixswap.backend.entity.enums.CustomerCategory;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "customer_profiles")
@Getter
@Setter
public class CustomerProfile {

    @Id
    @Column(name = "customer_id")
    private UUID customerId;

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "customer_id")
    private AuthCredential authCredential;

    @Column(name = "full_name", nullable = false, length = 150)
    private String fullName;

    @Enumerated(EnumType.STRING)
    @Column(name = "customer_type", columnDefinition = "customer_category")
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    private CustomerCategory customerType = CustomerCategory.HOUSEHOLD;

    @Column(name = "trust_score", precision = 3, scale = 2)
    @ColumnDefault("5.00")
    private BigDecimal trustScore;

    @Column(name = "household_address")
    private String householdAddress;

    @Column(name = "profile_photo", columnDefinition = "TEXT")
    private String profilePhoto;

    @Column(name = "sms_notifications", columnDefinition = "boolean default true")
    private Boolean smsNotifications = true;

    @Column(name = "whatsapp_notifications", columnDefinition = "boolean default true")
    private Boolean whatsappNotifications = true;
}
