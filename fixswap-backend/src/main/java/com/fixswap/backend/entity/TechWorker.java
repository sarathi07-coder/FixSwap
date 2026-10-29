package com.fixswap.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "technician_workers")
@Getter
@Setter
public class TechWorker {

    @Id
    @Column(name = "worker_id")
    private UUID workerId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "worker_id")
    private AuthCredential authCredential;

    @Column(name = "full_name", nullable = false, length = 150)
    private String fullName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shop_id", nullable = true) // nullable to allow self-signup before shop linking
    private Shop shop;

    @Column(name = "is_on_duty")
    private Boolean isOnDuty = false;

    @Column(name = "current_lat", precision = 10, scale = 8)
    private BigDecimal currentLat;

    @Column(name = "current_lon", precision = 11, scale = 8)
    private BigDecimal currentLon;

    @Column(name = "vehicle_type", length = 50)
    private String vehicleType; // BIKE, CYCLE, WALK

    @Column(name = "active_job_count")
    private Integer activeJobCount = 0;

    @Column(name = "profile_photo_url")
    private String profilePhotoUrl;

    @Column(name = "aadhar_reference")
    private String aadharReference;

    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;

    // --- New KYC Fields for Gig Workers ---
    
    @Column(name = "email")
    private String email;

    @Column(name = "phone_verified")
    private Boolean phoneVerified = false;

    @Column(name = "email_verified")
    private Boolean emailVerified = false;

    @Column(name = "driving_license_no", length = 50)
    private String drivingLicenseNo;

    @Column(name = "id_card_no", length = 50)
    private String idCardNo;

    @Column(name = "kyc_status", length = 20)
    private String kycStatus = "PENDING"; // PENDING, VERIFIED, REJECTED

    @Column(name = "worker_type", length = 30)
    private String workerType = "FIELD_TECHNICIAN"; // FIELD_TECHNICIAN, DELIVERY_COURIER

    @PrePersist
    @PreUpdate
    public void updateTimestamp() {
        this.lastUpdated = LocalDateTime.now();
    }
}
