package com.fixswap.backend.service;

import com.fixswap.backend.dto.RegisterUserRequest;
import com.fixswap.backend.entity.*;
import com.fixswap.backend.entity.enums.CustomerCategory;
import com.fixswap.backend.entity.enums.RoleType;
import com.fixswap.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthCredentialRepository authRepository;
    private final CustomerProfileRepository customerRepository;
    private final ShopRepository shopRepository;
    private final LoginHistoryRepository loginHistoryRepository;
    private final TechWorkerRepository techWorkerRepository;
    private final B2bContractRepository b2bContractRepository;

    public List<AuthCredential> getAllUsers() {
        return authRepository.findAll();
    }

    public AuthCredential getUserById(UUID id) {
        return authRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));
    }

    public AuthCredential getUserByEmail(String email) {
        return authRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }

    public List<AuthCredential> getUsersByRole(RoleType role) {
        return authRepository.findByRole(role);
    }

    @Transactional
    public AuthCredential registerUser(RegisterUserRequest request) {
        if (authRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered: " + request.getEmail());
        }
        if (authRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new RuntimeException("Phone number already registered: " + request.getPhoneNumber());
        }

        AuthCredential auth = new AuthCredential();
        auth.setEmail(request.getEmail());
        auth.setPhoneNumber(request.getPhoneNumber());
        auth.setPasswordHash(request.getPassword()); // In production: use BCrypt
        auth.setRole(RoleType.valueOf(request.getRole()));

        AuthCredential savedAuth = authRepository.saveAndFlush(auth);

        // Depending on the role, create the appropriate profile
        if (savedAuth.getRole() == RoleType.CUSTOMER) {
            CustomerProfile customer = new CustomerProfile();
            customer.setAuthCredential(savedAuth);
            customer.setFullName(request.getFullName());
            if (request.getCustomerType() != null) {
                customer.setCustomerType(CustomerCategory.valueOf(request.getCustomerType()));
            }
            customer.setHouseholdAddress(request.getAddress());
            customerRepository.save(customer);
        } else if (savedAuth.getRole() == RoleType.SHOP_OWNER) {
            Shop shop = new Shop();
            shop.setOwner(savedAuth);
            shop.setOwnerName(request.getFullName());
            shop.setShopName(request.getFullName() + "'s Shop");
            shop.setAddress(request.getAddress() != null ? request.getAddress() : "Address not set — please update");
            shop.setGeoLat(new java.math.BigDecimal("13.08268"));
            shop.setGeoLon(new java.math.BigDecimal("80.27068"));
            shop.setIsActive(true);
            shopRepository.save(shop);
        } else if (savedAuth.getRole() == RoleType.RESCUE_WORKER) {
            TechWorker worker = new TechWorker();
            worker.setAuthCredential(savedAuth);
            worker.setFullName(request.getFullName());
            worker.setEmail(request.getEmail());
            worker.setIsOnDuty(false);
            worker.setKycStatus("PENDING");
            techWorkerRepository.save(worker);
        } else if (savedAuth.getRole() == RoleType.HOTEL_B2B) {
            B2bContract contract = new B2bContract();
            contract.setHotel(savedAuth);
            contract.setCompanyName(request.getFullName());
            contract.setStatus(com.fixswap.backend.entity.enums.ContractStatus.ACTIVE);
            contract.setMonthlyRetainerFee(new java.math.BigDecimal("5000.00"));
            contract.setIncludedSwapsPerMonth(5);
            contract.setSwapsUsedThisMonth(0);
            contract.setValidUntil(java.time.LocalDateTime.now().plusYears(1));
            b2bContractRepository.save(contract);
        }

        return savedAuth;
    }

    public AuthCredential loginUser(String identifier, String password, String expectedType) {
        AuthCredential auth;
        if (identifier.contains("@")) {
            auth = authRepository.findByEmail(identifier)
                    .orElseThrow(() -> new RuntimeException("User not found with email: " + identifier));
        } else {
            auth = authRepository.findByPhoneNumber(identifier)
                    .orElseThrow(() -> new RuntimeException("User not found with phone number: " + identifier));
        }
        
        if (!auth.getPasswordHash().equals(password)) {
            throw new RuntimeException("Invalid password");
        }

        if (expectedType != null) {
            if ("HOUSEHOLD".equalsIgnoreCase(expectedType)
                    && (auth.getRole() == RoleType.HOTEL_B2B || auth.getRole() == RoleType.B2B_ADMIN)) {
                throw new RuntimeException("This is a corporate (B2B) account. Please sign in at the Enterprise portal.");
            }
            if ("HOTEL_B2B".equalsIgnoreCase(expectedType) && auth.getRole() == RoleType.CUSTOMER) {
                customerRepository.findById(auth.getAuthId()).ifPresent(profile -> {
                    if (profile.getCustomerType() != CustomerCategory.HOTEL_B2B) {
                        throw new RuntimeException("This is a household (B2C) account. Please use the customer login.");
                    }
                });
            }
            if ("HOTEL_B2B".equalsIgnoreCase(expectedType)
                    && auth.getRole() != RoleType.HOTEL_B2B
                    && auth.getRole() != RoleType.B2B_ADMIN
                    && auth.getRole() != RoleType.CUSTOMER) {
                throw new RuntimeException("Invalid portal for this account type.");
            }
        }

        // Log to LoginHistory
        LoginHistory history = new LoginHistory();
        history.setUser(auth);
        history.setSessionStatus("ACTIVE");
        history.setPortalType(expectedType);
        loginHistoryRepository.save(history);
        
        return auth;
    }

    public java.util.Map<String, Object> getLoginResponse(AuthCredential user) {
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("userId", user.getAuthId());
        response.put("email", user.getEmail());
        response.put("phoneNumber", user.getPhoneNumber());
        response.put("role", user.getRole().name());

        if (user.getRole() == RoleType.CUSTOMER) {
            customerRepository.findById(user.getAuthId()).ifPresent(customer -> {
                response.put("fullName", customer.getFullName());
            });
        } else if (user.getRole() == RoleType.SHOP_OWNER) {
            shopRepository.findFirstByOwnerAuthIdAndIsActiveTrueOrderByShopNameAsc(user.getAuthId())
                    .or(() -> shopRepository.findByOwnerAuthId(user.getAuthId()).stream().findFirst())
                    .ifPresent(shop -> {
                        response.put("fullName", shop.getOwnerName());
                        response.put("shopId", shop.getShopId());
                        response.put("shopName", shop.getShopName());
                    });
        } else if (user.getRole() == RoleType.RESCUE_WORKER) {
            techWorkerRepository.findById(user.getAuthId()).ifPresent(worker -> {
                response.put("fullName", worker.getFullName());
                response.put("workerType", worker.getWorkerType());
                if (worker.getShop() != null) {
                    response.put("shopId", worker.getShop().getShopId());
                }
            });
        }

        return response;
    }

    @Transactional
    public void logoutUser(UUID userId) {
        loginHistoryRepository.findFirstByUserAuthIdAndSessionStatusOrderByLoginTimeDesc(userId, "ACTIVE")
            .ifPresent(history -> {
                java.time.LocalDateTime now = java.time.LocalDateTime.now();
                history.setLogoutTime(now);
                history.setSessionStatus("LOGGED_OUT");
                java.time.LocalDateTime lTime = history.getLoginTime();
                if (lTime != null) {
                    history.setSessionDurationSeconds(java.time.temporal.ChronoUnit.SECONDS.between(lTime, now));
                } else {
                    history.setSessionDurationSeconds(1L);
                }
                loginHistoryRepository.save(history);
            });
    }
}
