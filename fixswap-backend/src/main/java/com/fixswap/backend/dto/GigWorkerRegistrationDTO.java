package com.fixswap.backend.dto;

import lombok.Data;

@Data
public class GigWorkerRegistrationDTO {
    private String fullName;
    private String phoneNumber;
    private String email;
    private String password;
    
    // KYC Details
    private String aadharReference; // Re-used for PAN/Aadhaar
    private String idCardNo;
    private String drivingLicenseNo;
    private String vehicleType; // BIKE, SCOOTER, CYCLE
    private String workerType; // FIELD_TECHNICIAN, DELIVERY_COURIER
}
