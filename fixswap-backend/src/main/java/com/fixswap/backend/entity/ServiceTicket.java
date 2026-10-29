package com.fixswap.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fixswap.backend.entity.enums.TicketState;
import com.fixswap.backend.entity.enums.FulfillmentType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "service_tickets")
@Getter
@Setter
public class ServiceTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "ticket_id", updatable = false, nullable = false)
    private UUID ticketId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "passwordHash", "createdAt"})
    private AuthCredential customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shop_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "owner"})
    private Shop shop;

    @Column(name = "appliance_category", nullable = false, length = 50)
    private String applianceCategory;

    @Column(name = "appliance_product", nullable = false, length = 100)
    private String applianceProduct;

    @Column(name = "appliance_brand", length = 100)
    private String applianceBrand;

    @Column(name = "appliance_model", length = 100)
    private String applianceModel;

    @Column(name = "purchase_year")
    private Integer purchaseYear;

    @Column(name = "customer_address", columnDefinition = "text")
    private String customerAddress;

    /** HOUSEHOLD = B2C customer portal; ENTERPRISE = B2B corporate portal */
    @Column(name = "ticket_channel", length = 20, nullable = false)
    private String ticketChannel = "HOUSEHOLD";

    @Column(name = "issue_description", nullable = false, columnDefinition = "text")
    private String issueDescription;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "issue_photos", columnDefinition = "jsonb")
    private List<String> issuePhotos;

    @Column(name = "customer_lat", nullable = false, precision = 10, scale = 8)
    private BigDecimal customerLat;

    @Column(name = "customer_lon", nullable = false, precision = 11, scale = 8)
    private BigDecimal customerLon;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", columnDefinition = "varchar(50)")
    private TicketState status;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_worker_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "authCredential", "shop"})
    private TechWorker assignedWorker;

    @Column(name = "pickup_otp", length = 6)
    private String pickupOtp;

    @Column(name = "delivery_otp", length = 6)
    private String deliveryOtp;

    @Column(name = "loaner_device_id")
    private UUID loanerDeviceId;

    @Column(name = "worker_assigned_at")
    private LocalDateTime workerAssignedAt;

    @Column(name = "otp_verified_at")
    private LocalDateTime otpVerifiedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "fulfillment_type", length = 30)
    private FulfillmentType fulfillmentType = FulfillmentType.IN_HOUSE_WORKER;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pickup_delivery_partner_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "authCredential", "shop"})
    private TechWorker pickupDeliveryPartner;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "return_delivery_partner_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "authCredential", "shop"})
    private TechWorker returnDeliveryPartner;

    @Column(name = "worker_pickup_otp", length = 6)
    private String workerPickupOtp;

    @Column(name = "worker_delivery_otp", length = 6)
    private String workerDeliveryOtp;

    @Column(name = "customer_pickup_otp_verified")
    private boolean customerPickupOtpVerified = false;

    @Column(name = "worker_pickup_otp_verified")
    private boolean workerPickupOtpVerified = false;

    @Column(name = "customer_delivery_otp_verified")
    private boolean customerDeliveryOtpVerified = false;

    @Column(name = "worker_delivery_otp_verified")
    private boolean workerDeliveryOtpVerified = false;

    // Hub leg OTPs — loaner pickup from partner shop (pickup run step 1)
    @Column(name = "hub_loaner_pickup_otp", length = 6)
    private String hubLoanerPickupOtp;

    @Column(name = "worker_hub_loaner_pickup_otp", length = 6)
    private String workerHubLoanerPickupOtp;

    @Column(name = "hub_loaner_pickup_verified")
    private Boolean hubLoanerPickupVerified = false;

    @Column(name = "worker_hub_loaner_pickup_verified")
    private Boolean workerHubLoanerPickupVerified = false;

    // Hub leg OTPs — broken device drop at partner shop (pickup run step 3)
    @Column(name = "hub_device_drop_otp", length = 6)
    private String hubDeviceDropOtp;

    @Column(name = "worker_hub_device_drop_otp", length = 6)
    private String workerHubDeviceDropOtp;

    @Column(name = "hub_device_drop_verified")
    private Boolean hubDeviceDropVerified = false;

    @Column(name = "worker_hub_device_drop_verified")
    private Boolean workerHubDeviceDropVerified = false;

    // Hub leg OTPs — repaired device pickup for return run
    @Column(name = "hub_repaired_pickup_otp", length = 6)
    private String hubRepairedPickupOtp;

    @Column(name = "worker_hub_repaired_pickup_otp", length = 6)
    private String workerHubRepairedPickupOtp;

    @Column(name = "hub_repaired_pickup_verified")
    private Boolean hubRepairedPickupVerified = false;

    @Column(name = "worker_hub_repaired_pickup_verified")
    private Boolean workerHubRepairedPickupVerified = false;
}

