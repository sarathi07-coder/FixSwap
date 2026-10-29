package com.fixswap.backend.controller;

import com.fixswap.backend.dto.ShopDashboardStats;
import com.fixswap.backend.entity.Shop;
import com.fixswap.backend.entity.TempInventory;
import com.fixswap.backend.service.ShopService;
import com.fixswap.backend.service.TicketService;
import com.fixswap.backend.service.TechWorkerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/shop")
@RequiredArgsConstructor
public class ShopController {

    private final ShopService shopService;
    private final TicketService ticketService;
    private final TechWorkerService workerService;

    @GetMapping("/all")
    public ResponseEntity<List<Shop>> getAllShops() {
        return ResponseEntity.ok(shopService.getAllShops());
    }

    @GetMapping("/{shopId}")
    public ResponseEntity<Shop> getShopById(@PathVariable UUID shopId) {
        return ResponseEntity.ok(shopService.getShopById(shopId));
    }

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<List<Shop>> getShopsByOwner(@PathVariable UUID ownerId) {
        return ResponseEntity.ok(shopService.getShopsByOwner(ownerId));
    }

    @GetMapping("/{shopId}/inventory")
    public ResponseEntity<List<TempInventory>> getInventory(@PathVariable UUID shopId) {
        return ResponseEntity.ok(shopService.getInventoryByShop(shopId));
    }

    @GetMapping("/{shopId}/dashboard-stats")
    public ResponseEntity<ShopDashboardStats> getDashboardStats(@PathVariable UUID shopId) {
        return ResponseEntity.ok(shopService.getDashboardStats(shopId));
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<Shop>> getNearbyShops(
            @RequestParam java.math.BigDecimal lat,
            @RequestParam java.math.BigDecimal lon,
            @RequestParam(defaultValue = "8.0") Double radiusKm) {
        // In a real app this should be in ShopService, but TicketService has it here
        return ResponseEntity.ok(ticketService.getNearbyShopsWithLoaners(lat, lon, radiusKm));
    }

    @Autowired
    private com.fixswap.backend.repository.AuthCredentialRepository authRepository;

    @Autowired
    private com.fixswap.backend.repository.TechWorkerRepository techWorkerRepository;

    @GetMapping("/{shopId}/workers")
    public ResponseEntity<List<com.fixswap.backend.entity.TechWorker>> getWorkerRoster(@PathVariable UUID shopId) {
        return ResponseEntity.ok(workerService.getWorkersByShop(shopId));
    }

    @PostMapping("/{shopId}/workers")
    public ResponseEntity<?> createWorker(
            @PathVariable UUID shopId,
            @RequestBody com.fixswap.backend.dto.GigWorkerRegistrationDTO dto) {
        
        com.fixswap.backend.entity.Shop shop = shopService.getShopById(shopId);
        if (shop == null) return ResponseEntity.badRequest().body("Shop not found");

        if (authRepository.findByPhoneNumber(dto.getPhoneNumber()).isPresent()) {
            return ResponseEntity.badRequest().body("Phone number already registered.");
        }

        com.fixswap.backend.entity.AuthCredential auth = new com.fixswap.backend.entity.AuthCredential();
        auth.setPhoneNumber(dto.getPhoneNumber());
        auth.setEmail(dto.getEmail() != null && !dto.getEmail().isEmpty() ? dto.getEmail() : dto.getPhoneNumber() + "@fixswap.local");
        auth.setPasswordHash("worker123"); // Default password — worker should change after first login
        auth.setRole(com.fixswap.backend.entity.enums.RoleType.RESCUE_WORKER);
        auth = authRepository.saveAndFlush(auth);

        com.fixswap.backend.entity.TechWorker worker = new com.fixswap.backend.entity.TechWorker();
        worker.setAuthCredential(auth);
        worker.setFullName(dto.getFullName());
        worker.setShop(shop);
        
        worker.setEmail(auth.getEmail());
        worker.setPhoneVerified(true); // Assumed verified by partner adding them manually
        worker.setEmailVerified(false);
        worker.setIdCardNo(dto.getIdCardNo());
        worker.setDrivingLicenseNo(dto.getDrivingLicenseNo());
        worker.setVehicleType(dto.getVehicleType() != null ? dto.getVehicleType() : "BIKE");
        worker.setAadharReference(dto.getAadharReference());
        worker.setKycStatus("VERIFIED"); // Verified implicitly because the partner shop takes responsibility
        worker.setIsOnDuty(false);

        techWorkerRepository.save(worker);

        // Return login credentials along with worker info for the partner to share
        java.util.Map<String, Object> result = new java.util.HashMap<>();
        result.put("workerId", auth.getAuthId());
        result.put("fullName", worker.getFullName());
        result.put("phoneNumber", auth.getPhoneNumber());
        result.put("loginPassword", "worker123");
        result.put("message", "Worker created. Default password is 'worker123'.");

        return ResponseEntity.ok(result);
    }
}
