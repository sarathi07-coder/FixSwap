package com.fixswap.backend.controller;

import com.fixswap.backend.entity.AuthCredential;
import com.fixswap.backend.entity.CustomerProfile;
import com.fixswap.backend.repository.AuthCredentialRepository;
import com.fixswap.backend.repository.CustomerProfileRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;
import java.util.Optional;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ProfileController {

    private final AuthCredentialRepository authRepository;
    private final CustomerProfileRepository customerRepository;

    @GetMapping("/{userId}")
    public ResponseEntity<?> getProfile(@PathVariable String userId) {
        AuthCredential auth = authRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new RuntimeException("User not found"));

        java.util.Map<String, Object> profile = new java.util.HashMap<>();
        profile.put("email", auth.getEmail());
        profile.put("phoneNumber", auth.getPhoneNumber());

        customerRepository.findById(auth.getAuthId()).ifPresentOrElse(customer -> {
            profile.put("fullName", customer.getFullName());
            profile.put("hqAddress", customer.getHouseholdAddress());
            profile.put("profilePhoto", customer.getProfilePhoto());
            profile.put("smsNotifications", customer.getSmsNotifications() != null ? customer.getSmsNotifications() : true);
            profile.put("whatsappNotifications", customer.getWhatsappNotifications() != null ? customer.getWhatsappNotifications() : true);
            profile.put("customerType", customer.getCustomerType() != null ? customer.getCustomerType().name() : "HOUSEHOLD");
        }, () -> {
            profile.put("fullName", auth.getEmail());
            profile.put("hqAddress", "");
            profile.put("profilePhoto", null);
            profile.put("smsNotifications", true);
            profile.put("whatsappNotifications", true);
        });

        return ResponseEntity.ok(profile);
    }

    // In-memory OTP storage for demonstration (UserId -> OTP)
    private final java.util.concurrent.ConcurrentHashMap<String, String> otpStore = new java.util.concurrent.ConcurrentHashMap<>();

    @PostMapping("/{userId}/generate-otp")
    public ResponseEntity<?> generateOtp(@PathVariable String userId) {
        String otp = String.format("%06d", new java.util.Random().nextInt(999999));
        otpStore.put(userId, otp);
        // MOCK SMS SENDING
        System.out.println("=================================================");
        System.out.println("🔒 MOCK SMS GATEWAY - FIXSWAP SECURITY");
        System.out.println("To User ID: " + userId);
        System.out.println("Your FixSwap Verification Code is: " + otp);
        System.out.println("=================================================");
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{userId}/verify-otp")
    public ResponseEntity<?> verifyOtp(@PathVariable String userId, @RequestBody OtpVerificationRequest request) {
        String storedOtp = otpStore.get(userId);
        if (storedOtp != null && storedOtp.equals(request.getOtp())) {
            otpStore.remove(userId); // Clear after successful verification
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.status(401).body("Invalid or expired OTP");
    }

    @PatchMapping("/{userId}")
    public ResponseEntity<?> updateProfile(@PathVariable String userId, @RequestBody UpdateProfileRequest request) {
        AuthCredential auth = authRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new RuntimeException("User not found"));

        Optional<CustomerProfile> customerOpt = customerRepository.findById(auth.getAuthId());
        if (customerOpt.isPresent()) {
            CustomerProfile customer = customerOpt.get();
            if (request.getFullName() != null) customer.setFullName(request.getFullName());
            if (request.getHqAddress() != null) customer.setHouseholdAddress(request.getHqAddress());
            if (request.getProfilePhoto() != null) customer.setProfilePhoto(request.getProfilePhoto());
            if (request.getSmsNotifications() != null) customer.setSmsNotifications(request.getSmsNotifications());
            if (request.getWhatsappNotifications() != null) customer.setWhatsappNotifications(request.getWhatsappNotifications());
            customerRepository.save(customer);
        }

        // Update Phone Number (Assuming frontend already verified OTP)
        if (request.getPhoneNumber() != null && !request.getPhoneNumber().equals(auth.getPhoneNumber())) {
            auth.setPhoneNumber(request.getPhoneNumber());
        }

        // Password change logic with strict verification
        if (request.getNewPassword() != null && !request.getNewPassword().isEmpty()) {
            if (request.getCurrentPassword() == null) {
                return ResponseEntity.status(400).body("Current password is required to set a new password.");
            }
            
            // Strictly check current password
            if (!auth.getPasswordHash().equals(request.getCurrentPassword())) {
                return ResponseEntity.status(401).body("Current password is incorrect.");
            }

            auth.setPasswordHash(request.getNewPassword()); // In production, hash this!
        }

        authRepository.save(auth);
        return getProfile(userId);
    }

    @Data
    public static class OtpVerificationRequest {
        private String otp;
    }

    @Data
    public static class UpdateProfileRequest {
        private String fullName;
        private String phoneNumber;
        private String hqAddress;
        private String profilePhoto;
        private Boolean smsNotifications;
        private Boolean whatsappNotifications;
        private String currentPassword;
        private String newPassword;
    }
}
