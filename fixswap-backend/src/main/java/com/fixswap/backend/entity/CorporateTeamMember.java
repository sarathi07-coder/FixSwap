package com.fixswap.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "corporate_team_members")
@Getter
@Setter
public class CorporateTeamMember {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "member_id", updatable = false, nullable = false)
    private UUID memberId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private AuthCredential company;

    @Column(name = "full_name", nullable = false, length = 150)
    private String fullName;

    @Column(name = "email", nullable = false, length = 150)
    private String email;

    @Column(name = "role", nullable = false, length = 50)
    private String role;

    @Column(name = "can_create")
    private Boolean canCreate = false;

    @Column(name = "can_dispatch")
    private Boolean canDispatch = false;

    @Column(name = "can_view")
    private Boolean canView = true;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
