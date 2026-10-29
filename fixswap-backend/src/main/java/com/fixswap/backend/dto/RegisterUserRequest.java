package com.fixswap.backend.dto;

import lombok.Data;

@Data
public class RegisterUserRequest {
    private String fullName;
    private String email;
    private String phoneNumber;
    private String password;
    private String role;           // CUSTOMER, SHOP_OWNER, RESCUE_WORKER
    private String customerType;   // HOUSEHOLD, HOTEL_B2B
    private String taxId;
    private String address;
}
