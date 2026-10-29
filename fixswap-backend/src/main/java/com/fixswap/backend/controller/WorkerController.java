package com.fixswap.backend.controller;

import com.fixswap.backend.service.TechWorkerService;
import com.fixswap.backend.service.TicketService;
import com.fixswap.backend.entity.TechWorker;
import com.fixswap.backend.entity.ServiceTicket;
import com.fixswap.backend.entity.enums.TicketState;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.UUID;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/worker")
@RequiredArgsConstructor
public class WorkerController {

    private final TechWorkerService workerService;
    private final TicketService ticketService;

    @PutMapping("/{workerId}/location")
    public ResponseEntity<TechWorker> updateLocation(
            @PathVariable UUID workerId,
            @RequestBody Map<String, BigDecimal> locationData) {
        
        return ResponseEntity.ok(workerService.updateLocation(
                workerId, locationData.get("lat"), locationData.get("lon")));
    }

    @PutMapping("/{workerId}/duty")
    public ResponseEntity<TechWorker> toggleDuty(
            @PathVariable UUID workerId,
            @RequestParam boolean isOnDuty) {
        return ResponseEntity.ok(workerService.toggleDutyStatus(workerId, isOnDuty));
    }

    @PostMapping("/{workerId}/link")
    public ResponseEntity<TechWorker> linkShop(
            @PathVariable UUID workerId,
            @RequestParam UUID shopId) {
        return ResponseEntity.ok(workerService.linkToShop(workerId, shopId));
    }

    @GetMapping("/{workerId}/tickets/active")
    public ResponseEntity<List<ServiceTicket>> getWorkerActiveTickets(
            @PathVariable UUID workerId) {
        return ResponseEntity.ok(ticketService.getActiveTicketsByWorker(workerId));
    }

    // OTP AND LIFECYCLE ENDPOINTS
    
    @PostMapping("/jobs/{ticketId}/verify-pickup")
    public ResponseEntity<ServiceTicket> verifyPickup(
            @PathVariable UUID ticketId,
            @RequestParam String otp) {
        return ResponseEntity.ok(ticketService.verifyPickupOtp(ticketId, otp));
    }

    @PostMapping("/jobs/{ticketId}/handover-loaner")
    public ResponseEntity<ServiceTicket> handoverLoaner(
            @PathVariable UUID ticketId,
            @RequestParam UUID assetId) {
        return ResponseEntity.ok(ticketService.confirmLoanerHandover(ticketId, assetId));
    }

    @PostMapping("/jobs/{ticketId}/verify-delivery")
    public ResponseEntity<ServiceTicket> verifyDelivery(
            @PathVariable UUID ticketId,
            @RequestParam String otp) {
        return ResponseEntity.ok(ticketService.verifyDeliveryOtp(ticketId, otp));
    }

    @PostMapping("/jobs/{ticketId}/verify-hub-loaner-pickup")
    public ResponseEntity<ServiceTicket> verifyHubLoanerPickup(
            @PathVariable UUID ticketId,
            @RequestParam String otp) {
        return ResponseEntity.ok(ticketService.verifyCourierHubLoanerPickup(ticketId, otp));
    }

    @PostMapping("/jobs/{ticketId}/verify-hub-device-drop")
    public ResponseEntity<ServiceTicket> verifyHubDeviceDrop(
            @PathVariable UUID ticketId,
            @RequestParam String otp) {
        return ResponseEntity.ok(ticketService.verifyCourierHubDeviceDrop(ticketId, otp));
    }

    @PostMapping("/jobs/{ticketId}/verify-hub-repaired-pickup")
    public ResponseEntity<ServiceTicket> verifyHubRepairedPickup(
            @PathVariable UUID ticketId,
            @RequestParam String otp) {
        return ResponseEntity.ok(ticketService.verifyCourierHubRepairedPickup(ticketId, otp));
    }

    @PostMapping("/jobs/{ticketId}/dispatch-to-customer")
    public ResponseEntity<ServiceTicket> dispatchToCustomer(@PathVariable UUID ticketId) {
        return ResponseEntity.ok(ticketService.dispatchCourierToCustomer(ticketId));
    }

    @PostMapping("/jobs/{ticketId}/start-hub-device-drop")
    public ResponseEntity<ServiceTicket> startHubDeviceDrop(@PathVariable UUID ticketId) {
        return ResponseEntity.ok(ticketService.startHubDeviceDrop(ticketId));
    }

    @PostMapping("/jobs/{ticketId}/dispatch-return-to-customer")
    public ResponseEntity<ServiceTicket> dispatchReturnToCustomer(@PathVariable UUID ticketId) {
        return ResponseEntity.ok(ticketService.dispatchReturnToCustomer(ticketId));
    }

    @GetMapping("/delivery/couriers")
    public ResponseEntity<List<Map<String, Object>>> getVerifiedDeliveryCouriers() {
        List<Map<String, Object>> couriers = workerService.getVerifiedDeliveryCouriers().stream()
                .map(w -> {
                    Map<String, Object> row = new HashMap<>();
                    row.put("workerId", w.getWorkerId());
                    row.put("fullName", w.getFullName());
                    row.put("isOnDuty", Boolean.TRUE.equals(w.getIsOnDuty()));
                    row.put("vehicleType", w.getVehicleType() != null ? w.getVehicleType() : "BIKE");
                    row.put("kycStatus", w.getKycStatus());
                    row.put("workerType", w.getWorkerType());
                    if (w.getAuthCredential() != null) {
                        row.put("phoneNumber", w.getAuthCredential().getPhoneNumber());
                        row.put("email", w.getAuthCredential().getEmail());
                    }
                    return row;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(couriers);
    }

    @GetMapping("/delivery/available-pickups")
    public ResponseEntity<List<ServiceTicket>> getAvailablePickups() {
        return ResponseEntity.ok(ticketService.findAvailablePickupsForDelivery());
    }

    @GetMapping("/delivery/available-returns")
    public ResponseEntity<List<ServiceTicket>> getAvailableReturns() {
        return ResponseEntity.ok(ticketService.findAvailableReturnsForDelivery());
    }

    @GetMapping("/{workerId}/delivery/active")
    public ResponseEntity<List<ServiceTicket>> getDeliveryActiveTickets(@PathVariable UUID workerId) {
        return ResponseEntity.ok(ticketService.findActiveTicketsByDeliveryPartner(workerId));
    }
}
