package com.fixswap.backend.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.Data;

@Data
public class CreateGarageApplianceRequest {
    private String userId;
    private String category;
    private String product;
    private String brand;
    private String model;
    @JsonAlias("year")
    private Integer purchaseYear;
    private String photoBase64;
    private String registryType; // HOUSEHOLD or ENTERPRISE
}
