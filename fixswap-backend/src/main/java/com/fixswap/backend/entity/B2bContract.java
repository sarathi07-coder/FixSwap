package com.fixswap.backend.entity;

import com.fixswap.backend.entity.enums.ContractStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "b2b_contracts")
@Getter
@Setter
public class B2bContract {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "contract_id", updatable = false, nullable = false)
    private UUID contractId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id")
    private AuthCredential hotel;

    @Column(name = "company_name", length = 150)
    private String companyName;

    @Column(name = "company_contact_name", length = 150)
    private String companyContactName;

    @Column(name = "monthly_retainer_fee", nullable = false, precision = 12, scale = 2)
    private BigDecimal monthlyRetainerFee;

    @Column(name = "included_swaps_per_month", nullable = false)
    private Integer includedSwapsPerMonth;

    @Column(name = "swaps_used_this_month")
    private Integer swapsUsedThisMonth;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", columnDefinition = "contract_status")
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    private ContractStatus status;

    @Column(name = "valid_until", nullable = false)
    private LocalDateTime validUntil;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
