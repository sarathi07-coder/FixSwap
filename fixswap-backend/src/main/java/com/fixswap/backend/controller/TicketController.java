package com.fixswap.backend.controller;

import com.fixswap.backend.dto.AssignWorkerRequest;
import com.fixswap.backend.dto.CreateTicketRequest;
import com.fixswap.backend.entity.ServiceTicket;
import com.fixswap.backend.entity.enums.TicketState;
import com.fixswap.backend.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

// TicketController — REST API for service ticket operations

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    @PostMapping("/create")
    public ResponseEntity<ServiceTicket> createTicket(@RequestBody CreateTicketRequest request) {
        return ResponseEntity.ok(ticketService.createTicket(request));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<ServiceTicket>> getTicketsByCustomer(
            @PathVariable UUID customerId,
            @RequestParam(defaultValue = "HOUSEHOLD") String channel) {
        return ResponseEntity.ok(ticketService.getTicketsByCustomer(customerId, channel));
    }

    @GetMapping("/customer/{customerId}/enterprise")
    public ResponseEntity<List<ServiceTicket>> getEnterpriseTicketsByCustomer(@PathVariable UUID customerId) {
        return ResponseEntity.ok(ticketService.getTicketsByCustomer(customerId, "ENTERPRISE"));
    }

    @GetMapping("/shop/{shopId}")
    public ResponseEntity<List<ServiceTicket>> getTicketsByShop(@PathVariable UUID shopId) {
        return ResponseEntity.ok(ticketService.getTicketsByShop(shopId));
    }

    @GetMapping("/shop/{shopId}/active")
    public ResponseEntity<List<ServiceTicket>> getActiveTicketsByShop(@PathVariable UUID shopId) {
        return ResponseEntity.ok(ticketService.getActiveTicketsByShop(shopId));
    }

    @GetMapping("/{ticketId}")
    public ResponseEntity<ServiceTicket> getTicketById(@PathVariable UUID ticketId) {
        return ResponseEntity.ok(ticketService.getTicketById(ticketId));
    }

    @PostMapping("/accept-and-assign")
    public ResponseEntity<ServiceTicket> acceptAndAssignTicket(
            @RequestParam UUID ticketId,
            @RequestParam UUID shopId,
            @RequestParam UUID workerId) {
        return ResponseEntity.ok(ticketService.acceptTicketAndAssignWorker(ticketId, shopId, workerId));
    }

    @PostMapping("/{ticketId}/dispatch")
    public ResponseEntity<ServiceTicket> dispatchTechnician(@PathVariable UUID ticketId) {
        return ResponseEntity.ok(ticketService.dispatchTechnician(ticketId));
    }

    @PatchMapping("/{ticketId}/status")
    public ResponseEntity<ServiceTicket> updateStatus(@PathVariable UUID ticketId, @RequestBody Map<String, String> body) {
        TicketState newStatus = TicketState.valueOf(body.get("status"));
        return ResponseEntity.ok(ticketService.updateTicketStatus(ticketId, newStatus));
    }

    @PutMapping("/{ticketId}/cancel")
    public ResponseEntity<ServiceTicket> cancelTicket(@PathVariable UUID ticketId) {
        return ResponseEntity.ok(ticketService.cancelTicket(ticketId));
    }

    @PostMapping("/accept-delivery-mode")
    public ResponseEntity<ServiceTicket> acceptDeliveryMode(
            @RequestParam UUID ticketId,
            @RequestParam UUID shopId) {
        return ResponseEntity.ok(ticketService.acceptTicketWithDeliveryPartner(ticketId, shopId));
    }

    @PostMapping("/{ticketId}/claim-pickup")
    public ResponseEntity<ServiceTicket> claimPickup(
            @PathVariable UUID ticketId,
            @RequestParam UUID workerId) {
        return ResponseEntity.ok(ticketService.claimPickupLeg(ticketId, workerId));
    }

    @PostMapping("/{ticketId}/claim-return")
    public ResponseEntity<ServiceTicket> claimReturn(
            @PathVariable UUID ticketId,
            @RequestParam UUID workerId) {
        return ResponseEntity.ok(ticketService.claimReturnLeg(ticketId, workerId));
    }

    @PostMapping("/{ticketId}/drop-at-hub")
    public ResponseEntity<ServiceTicket> dropAtHub(@PathVariable UUID ticketId) {
        return ResponseEntity.ok(ticketService.confirmDropAtHub(ticketId));
    }

    @PostMapping("/{ticketId}/verify-shop-hub-loaner")
    public ResponseEntity<ServiceTicket> verifyShopHubLoaner(
            @PathVariable UUID ticketId,
            @RequestParam String otp) {
        return ResponseEntity.ok(ticketService.verifyShopHubLoanerPickup(ticketId, otp));
    }

    @PostMapping("/{ticketId}/verify-shop-hub-device-drop")
    public ResponseEntity<ServiceTicket> verifyShopHubDeviceDrop(
            @PathVariable UUID ticketId,
            @RequestParam String otp) {
        return ResponseEntity.ok(ticketService.verifyShopHubDeviceDrop(ticketId, otp));
    }

    @PostMapping("/{ticketId}/verify-shop-hub-repaired")
    public ResponseEntity<ServiceTicket> verifyShopHubRepaired(
            @PathVariable UUID ticketId,
            @RequestParam String otp) {
        return ResponseEntity.ok(ticketService.verifyShopHubRepairedPickup(ticketId, otp));
    }

    @PostMapping("/{ticketId}/request-return")
    public ResponseEntity<ServiceTicket> requestReturn(@PathVariable UUID ticketId) {
        return ResponseEntity.ok(ticketService.requestReturnDelivery(ticketId));
    }

    @PostMapping("/{ticketId}/verify-worker-otp")
    public ResponseEntity<ServiceTicket> verifyWorkerOtp(
            @PathVariable UUID ticketId,
            @RequestParam String otp) {
        return ResponseEntity.ok(ticketService.verifyWorkerPickupOtp(ticketId, otp));
    }

    @PostMapping("/{ticketId}/verify-worker-delivery-otp")
    public ResponseEntity<ServiceTicket> verifyWorkerDeliveryOtp(
            @PathVariable UUID ticketId,
            @RequestParam String otp) {
        return ResponseEntity.ok(ticketService.verifyWorkerDeliveryOtp(ticketId, otp));
    }
}
