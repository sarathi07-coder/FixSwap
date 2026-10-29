package com.fixswap.backend.repository;

import com.fixswap.backend.entity.AuthCredential;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AuthCredentialRepository extends JpaRepository<AuthCredential, UUID> {
    Optional<AuthCredential> findByEmail(String email);
    Optional<AuthCredential> findByPhoneNumber(String phoneNumber);
    java.util.List<AuthCredential> findByRole(com.fixswap.backend.entity.enums.RoleType role);
    boolean existsByEmail(String email);
    boolean existsByPhoneNumber(String phoneNumber);
}
