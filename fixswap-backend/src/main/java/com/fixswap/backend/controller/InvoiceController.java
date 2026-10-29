package com.fixswap.backend.controller;

import com.fixswap.backend.dto.InvoiceDetailDto;
import com.fixswap.backend.service.InvoiceService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class InvoiceController {

    private final InvoiceService invoiceService;

    @GetMapping("/ticket/{ticketId}")
    public ResponseEntity<InvoiceDetailDto> getByTicket(@PathVariable UUID ticketId) {
        return ResponseEntity.ok(invoiceService.getByTicketId(ticketId));
    }

    @PostMapping("/ticket/{ticketId}/generate")
    public ResponseEntity<InvoiceDetailDto> generate(@PathVariable UUID ticketId) {
        return ResponseEntity.ok(invoiceService.ensureInvoiceForTicket(ticketId));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<InvoiceDetailDto>> customerInvoices(@PathVariable UUID customerId) {
        return ResponseEntity.ok(invoiceService.getInvoicesForCustomer(customerId));
    }

    @GetMapping("/shop/{shopId}")
    public ResponseEntity<List<InvoiceDetailDto>> shopInvoices(@PathVariable UUID shopId) {
        return ResponseEntity.ok(invoiceService.getInvoicesForShop(shopId));
    }

    @GetMapping("/courier/{workerId}")
    public ResponseEntity<List<InvoiceDetailDto>> courierEarnings(@PathVariable UUID workerId) {
        return ResponseEntity.ok(invoiceService.getCourierEarnings(workerId));
    }

    @PostMapping("/{invoiceId}/pay")
    public ResponseEntity<InvoiceDetailDto> pay(
            @PathVariable UUID invoiceId,
            @RequestBody PaymentRequest request) {
        return ResponseEntity.ok(invoiceService.processPayment(invoiceId, request.getMethod()));
    }

    @Data
    public static class PaymentRequest {
        private String method = "UPI";
    }
}
