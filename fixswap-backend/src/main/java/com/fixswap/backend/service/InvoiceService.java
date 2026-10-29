package com.fixswap.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fixswap.backend.dto.InvoiceDetailDto;
import com.fixswap.backend.dto.InvoiceLineItemDto;
import com.fixswap.backend.entity.FinancialLedger;
import com.fixswap.backend.entity.ServiceTicket;
import com.fixswap.backend.entity.enums.TicketState;
import com.fixswap.backend.repository.FinancialLedgerRepository;
import com.fixswap.backend.repository.ServiceTicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final FinancialLedgerRepository ledgerRepository;
    private final ServiceTicketRepository ticketRepository;
    private final DynamicInvoicePricingService pricingService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public InvoiceDetailDto ensureInvoiceForTicket(UUID ticketId) {
        ServiceTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        if (ticket.getStatus() != TicketState.COMPLETED && ticket.getStatus() != TicketState.CANCELLED) {
            throw new RuntimeException("Invoice is only available for completed or cancelled tickets");
        }
        return ledgerRepository.findByTicketTicketId(ticketId)
                .map(this::toDto)
                .orElseGet(() -> createAndSaveInvoice(ticket));
    }

    @Transactional
    public InvoiceDetailDto processPayment(UUID invoiceId, String paymentMethod) {
        FinancialLedger ledger = ledgerRepository.findByInvoiceId(invoiceId)
                .or(() -> ledgerRepository.findById(invoiceId))
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
        if ("PAID".equalsIgnoreCase(ledger.getPaymentStatus())) {
            return toDto(ledger);
        }
        ledger.setPaymentStatus("PAID");
        ledger.setPaidAt(LocalDateTime.now());
        return toDto(ledgerRepository.save(ledger));
    }

    public List<InvoiceDetailDto> getInvoicesForCustomer(UUID customerId) {
        return ledgerRepository.findByTicketCustomerAuthIdOrderByIssuedAtDesc(customerId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<InvoiceDetailDto> getInvoicesForShop(UUID shopId) {
        return ledgerRepository.findByTicketShopShopIdOrderByIssuedAtDesc(shopId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<InvoiceDetailDto> getCourierEarnings(UUID workerId) {
        return ledgerRepository.findCourierEarnings(workerId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public InvoiceDetailDto getByTicketId(UUID ticketId) {
        return ledgerRepository.findByTicketTicketId(ticketId)
                .map(this::toDto)
                .orElseGet(() -> {
                    ServiceTicket t = ticketRepository.findById(ticketId).orElseThrow();
                    if (t.getStatus() == TicketState.COMPLETED) {
                        return createAndSaveInvoice(t);
                    }
                    throw new RuntimeException("No invoice for this ticket yet");
                });
    }

    private InvoiceDetailDto createAndSaveInvoice(ServiceTicket ticket) {
        if (ticket.getStatus() == TicketState.CANCELLED) {
            FinancialLedger existing = ledgerRepository.findByTicketTicketId(ticket.getTicketId()).orElse(null);
            if (existing != null) return toDto(existing);
            FinancialLedger fineOnly = new FinancialLedger();
            fineOnly.setTicket(ticket);
            fineOnly.setInvoiceId(UUID.randomUUID());
            fineOnly.setFineAmount(new BigDecimal("150.00"));
            fineOnly.setBaseRepairCost(BigDecimal.ZERO);
            fineOnly.setRentalCost(BigDecimal.ZERO);
            fineOnly.setB2bDiscount(BigDecimal.ZERO);
            fineOnly.setSubtotal(new BigDecimal("150.00"));
            fineOnly.setGstAmount(BigDecimal.ZERO);
            fineOnly.setFinalTotal(new BigDecimal("150.00"));
            fineOnly.setPaymentStatus("UNPAID");
            fineOnly.setLineItemsJson(writeJson(List.of(
                    InvoiceLineItemDto.builder().code("CANCEL_FINE").label("Late cancellation fine")
                            .description("Cancelled after free window").amount(new BigDecimal("150.00"))
                            .beneficiary("PLATFORM").build()
            )));
            return toDto(ledgerRepository.save(fineOnly));
        }

        DynamicInvoicePricingService.PricingResult quote = pricingService.calculate(ticket);
        FinancialLedger ledger = new FinancialLedger();
        ledger.setTicket(ticket);
        ledger.setInvoiceId(UUID.randomUUID());
        ledger.setBaseRepairCost(quote.baseRepairCost());
        ledger.setRentalCost(quote.rentalCost());
        ledger.setB2bDiscount(quote.b2bDiscount());
        ledger.setFineAmount(BigDecimal.ZERO);
        ledger.setSubtotal(quote.subtotal());
        ledger.setGstAmount(quote.gstAmount());
        ledger.setFinalTotal(quote.finalTotal());
        ledger.setShopPayout(quote.shopPayout());
        ledger.setCourierPickupPayout(quote.courierPickupPayout());
        ledger.setCourierReturnPayout(quote.courierReturnPayout());
        ledger.setPlatformFee(quote.platformFee());
        ledger.setPaymentStatus("UNPAID");
        ledger.setLineItemsJson(writeJson(quote.lineItems()));
        ledger.setIssuedAt(LocalDateTime.now());
        return toDto(ledgerRepository.save(ledger));
    }

    private InvoiceDetailDto toDto(FinancialLedger ledger) {
        ServiceTicket t = ledger.getTicket();
        return InvoiceDetailDto.builder()
                .invoiceId(ledger.getInvoiceId())
                .ledgerId(ledger.getLedgerId())
                .ticketId(t.getTicketId())
                .ticketShortId(t.getTicketId().toString().substring(0, 8).toUpperCase())
                .paymentStatus(ledger.getPaymentStatus() != null ? ledger.getPaymentStatus() : "UNPAID")
                .issuedAt(ledger.getIssuedAt() != null ? ledger.getIssuedAt() : ledger.getCreatedAt())
                .paidAt(ledger.getPaidAt())
                .applianceCategory(t.getApplianceCategory())
                .applianceProduct(t.getApplianceProduct())
                .applianceBrand(t.getApplianceBrand())
                .applianceModel(t.getApplianceModel())
                .purchaseYear(t.getPurchaseYear())
                .issueDescription(t.getIssueDescription())
                .fulfillmentType(t.getFulfillmentType() != null ? t.getFulfillmentType().name() : "IN_HOUSE_WORKER")
                .shopName(t.getShop() != null ? t.getShop().getShopName() : "Partner Hub")
                .lineItems(readJson(ledger.getLineItemsJson()))
                .subtotal(nz(ledger.getSubtotal()))
                .rentalCost(nz(ledger.getRentalCost()))
                .baseRepairCost(nz(ledger.getBaseRepairCost()))
                .b2bDiscount(nz(ledger.getB2bDiscount()))
                .fineAmount(nz(ledger.getFineAmount()))
                .gstAmount(nz(ledger.getGstAmount()))
                .finalTotal(nz(ledger.getFinalTotal()))
                .shopPayout(nz(ledger.getShopPayout()))
                .courierPickupPayout(nz(ledger.getCourierPickupPayout()))
                .courierReturnPayout(nz(ledger.getCourierReturnPayout()))
                .platformFee(nz(ledger.getPlatformFee()))
                .pricingModelVersion(DynamicInvoicePricingService.MODEL_VERSION)
                .pricingSummary("AI-style dynamic pricing from appliance profile & service path")
                .build();
    }

    private BigDecimal nz(BigDecimal v) {
        return v != null ? v : BigDecimal.ZERO;
    }

    private String writeJson(List<InvoiceLineItemDto> items) {
        try {
            return objectMapper.writeValueAsString(items);
        } catch (JsonProcessingException e) {
            return "[]";
        }
    }

    private List<InvoiceLineItemDto> readJson(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (JsonProcessingException e) {
            return List.of();
        }
    }
}
