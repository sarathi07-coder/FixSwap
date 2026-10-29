package com.fixswap.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceLineItemDto {
    private String code;
    private String label;
    private String description;
    private BigDecimal amount;
    private String beneficiary; // CUSTOMER, SHOP, COURIER_PICKUP, COURIER_RETURN, PLATFORM
}
