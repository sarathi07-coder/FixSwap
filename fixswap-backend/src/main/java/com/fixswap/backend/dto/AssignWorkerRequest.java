package com.fixswap.backend.dto;

import lombok.Data;

@Data
public class AssignWorkerRequest {
    private String ticketId;
    private String agentId;
    private String assetId; // optional temp inventory asset
}
