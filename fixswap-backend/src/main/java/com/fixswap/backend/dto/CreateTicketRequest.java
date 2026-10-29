package com.fixswap.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class CreateTicketRequest {
    private String customerId;
    private String shopId;
    private String applianceCategory;
    private String applianceProduct;
    private String applianceBrand;
    private String applianceModel;
    private String issueDescription;
    private List<String> issuePhotos;
    private Double customerLat;
    private Double customerLon;
    private Integer purchaseYear;
    private String customerAddress;
    /** HOUSEHOLD or ENTERPRISE — set by portal; defaults from account type */
    private String ticketChannel;
}
