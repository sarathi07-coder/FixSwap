package com.fixswap.backend.controller;

import com.fixswap.backend.dto.CreateGarageApplianceRequest;
import com.fixswap.backend.entity.GarageAppliance;
import com.fixswap.backend.entity.AuthCredential;
import com.fixswap.backend.entity.enums.RoleType;
import com.fixswap.backend.repository.GarageApplianceRepository;
import com.fixswap.backend.repository.AuthCredentialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/garage")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class GarageApplianceController {

    private final GarageApplianceRepository garageRepository;
    private final AuthCredentialRepository authRepository;

    @PostMapping("/add")
    public ResponseEntity<?> addAppliance(@RequestBody CreateGarageApplianceRequest request) {
        AuthCredential auth = authRepository.findById(UUID.fromString(request.getUserId()))
                .orElseThrow(() -> new RuntimeException("User not found"));

        GarageAppliance appliance = new GarageAppliance();
        appliance.setUser(auth);
        appliance.setCategory(request.getCategory());
        appliance.setProduct(request.getProduct());
        appliance.setBrand(request.getBrand());
        appliance.setModel(request.getModel());
        appliance.setPurchaseYear(request.getPurchaseYear());
        appliance.setPhotoBase64(request.getPhotoBase64());
        appliance.setRegistryType(request.getRegistryType() != null ? request.getRegistryType() : "HOUSEHOLD");

        return ResponseEntity.ok(garageRepository.save(appliance));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<GarageAppliance>> getUserGarage(
            @PathVariable String userId,
            @RequestParam(defaultValue = "HOUSEHOLD") String registryType) {
        return ResponseEntity.ok(
                garageRepository.findByUserAuthIdAndRegistryTypeOrderByCreatedAtDesc(
                        UUID.fromString(userId), registryType));
    }

    @GetMapping("/user/{userId}/enterprise")
    @Transactional
    public ResponseEntity<List<GarageAppliance>> getEnterpriseAssets(@PathVariable String userId) {
        UUID authId = UUID.fromString(userId);
        AuthCredential auth = authRepository.findById(authId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (auth.getRole() == RoleType.HOTEL_B2B || auth.getRole() == RoleType.B2B_ADMIN) {
            List<GarageAppliance> legacy = garageRepository.findByUserAuthIdAndRegistryTypeIsNullOrderByCreatedAtDesc(authId);
            for (GarageAppliance item : legacy) {
                item.setRegistryType("ENTERPRISE");
                garageRepository.save(item);
            }
            List<GarageAppliance> household = garageRepository.findByUserAuthIdAndRegistryTypeOrderByCreatedAtDesc(authId, "HOUSEHOLD");
            for (GarageAppliance item : household) {
                item.setRegistryType("ENTERPRISE");
                garageRepository.save(item);
            }
        }
        return ResponseEntity.ok(
                garageRepository.findByUserAuthIdAndRegistryTypeOrderByCreatedAtDesc(authId, "ENTERPRISE"));
    }

    @DeleteMapping("/{garageId}")
    public ResponseEntity<?> deleteAppliance(@PathVariable String garageId) {
        garageRepository.deleteById(UUID.fromString(garageId));
        return ResponseEntity.ok().build();
    }
}
