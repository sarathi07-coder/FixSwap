package com.fixswap.backend.repository;

import com.fixswap.backend.entity.CorporateTeamMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CorporateTeamMemberRepository extends JpaRepository<CorporateTeamMember, UUID> {
    List<CorporateTeamMember> findByCompanyAuthIdOrderByCreatedAtDesc(UUID companyId);
}
