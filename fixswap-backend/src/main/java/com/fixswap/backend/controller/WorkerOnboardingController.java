package com.fixswap.backend.controller;

import com.fixswap.backend.dto.GigWorkerRegistrationDTO;
import com.fixswap.backend.entity.enums.RoleType;
import com.fixswap.backend.entity.TechWorker;
import com.fixswap.backend.entity.AuthCredential;
import com.fixswap.backend.repository.TechWorkerRepository;
import com.fixswap.backend.repository.AuthCredentialRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/worker-onboarding")
public class WorkerOnboardingController {

    @Autowired
    private AuthCredentialRepository authRepository;

    @Autowired
    private TechWorkerRepository techWorkerRepository;

    // Temporary storage for OTPs in-memory for this demo project
    private Map<String, String> otpStore = new HashMap<>();

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestParam String phone) {
        // In a real app, integrate with Twilio/SNS here
        String otp = "1234"; // Default static OTP for testing
        otpStore.put(phone, otp);
        return ResponseEntity.ok(Map.of("message", "OTP sent successfully to " + phone));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestParam String phone, @RequestParam String otp) {
        String storedOtp = otpStore.get(phone);
        if (storedOtp != null && storedOtp.equals(otp)) {
            otpStore.remove(phone);
            return ResponseEntity.ok(Map.of("verified", true));
        }
        return ResponseEntity.status(400).body(Map.of("verified", false, "error", "Invalid OTP"));
    }

    @PostMapping("/register-independent")
    public ResponseEntity<?> registerGigWorker(@RequestBody GigWorkerRegistrationDTO dto) {
        // 1. Check if auth credential exists
        if (authRepository.findByPhoneNumber(dto.getPhoneNumber()).isPresent()) {
            return ResponseEntity.badRequest().body("Phone number already registered.");
        }

        // 2. Create base AuthCredential
        AuthCredential auth = new AuthCredential();
        auth.setPhoneNumber(dto.getPhoneNumber());
        auth.setEmail(dto.getEmail());
        auth.setRole(RoleType.RESCUE_WORKER);
        auth.setPasswordHash(dto.getPassword());
        auth = authRepository.saveAndFlush(auth);

        // 3. Create TechWorker Profile with KYC details
        TechWorker worker = new TechWorker();
        worker.setAuthCredential(auth);
        worker.setFullName(dto.getFullName());
        worker.setShop(null); // Independent gig worker has no shop ID
        
        // KYC Details
        worker.setEmail(dto.getEmail());
        worker.setPhoneVerified(true); // Assuming they hit verify-otp before this
        worker.setEmailVerified(false);
        worker.setIdCardNo(dto.getIdCardNo());
        worker.setDrivingLicenseNo(dto.getDrivingLicenseNo());
        worker.setVehicleType(dto.getVehicleType());
        worker.setAadharReference(dto.getAadharReference());
        
        worker.setKycStatus("PENDING"); // Pending manual or automated KYC background check
        worker.setIsOnDuty(false);
        worker.setWorkerType(dto.getWorkerType() != null ? dto.getWorkerType() : "FIELD_TECHNICIAN");

        techWorkerRepository.save(worker);

        return ResponseEntity.ok(worker);
    }
}
