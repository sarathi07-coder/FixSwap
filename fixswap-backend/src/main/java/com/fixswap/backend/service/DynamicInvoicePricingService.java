package com.fixswap.backend.service;

import com.fixswap.backend.dto.InvoiceLineItemDto;
import com.fixswap.backend.entity.ServiceTicket;
import com.fixswap.backend.entity.enums.CustomerCategory;
import com.fixswap.backend.entity.enums.FulfillmentType;
import com.fixswap.backend.repository.CustomerProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

/**
 * Product-aware dynamic pricing (category, brand, age, issue complexity, fulfillment mode).
 */
@Service
@RequiredArgsConstructor
public class DynamicInvoicePricingService {

    private static final BigDecimal GST_RATE = new BigDecimal("0.18");
    public static final String MODEL_VERSION = "fixswap-pricing-v1";

    private final CustomerProfileRepository customerProfileRepository;

    private static final Map<String, BigDecimal> CATEGORY_BASE = Map.ofEntries(
            Map.entry("KITCHEN ESSENTIALS", bd(420)),
            Map.entry("LARGE APPLIANCES", bd(950)),
            Map.entry("HVAC SYSTEMS", bd(780)),
            Map.entry("HOME ELECTRICALS", bd(380)),
            Map.entry("SMART ELECTRONICS", bd(520)),
            Map.entry("COMMERCIAL APPLIANCES", bd(1100)),
            Map.entry("AUTOMOTIVE & MOBILITY", bd(650)),
            Map.entry("IOT DEVICE", bd(300))
    );

    private static final Map<String, BigDecimal> BRAND_MULTIPLIER = Map.ofEntries(
            Map.entry("SAMSUNG", bd("1.12")),
            Map.entry("LG", bd("1.10")),
            Map.entry("BOSCH", bd("1.15")),
            Map.entry("APPLE", bd("1.20")),
            Map.entry("PIGEON", bd("0.92")),
            Map.entry("PRESTIGE", bd("0.95")),
            Map.entry("WHIRLPOOL", bd("1.05"))
    );

    public PricingResult calculate(ServiceTicket ticket) {
        List<InvoiceLineItemDto> items = new ArrayList<>();
        String categoryKey = normalize(ticket.getApplianceCategory());
        BigDecimal base = CATEGORY_BASE.getOrDefault(categoryKey, bd(500));

        base = base.multiply(brandMultiplier(ticket.getApplianceBrand()));
        base = base.multiply(ageFactor(ticket.getPurchaseYear()));
        base = base.multiply(complexityFactor(ticket.getIssueDescription()));

        items.add(item("REPAIR_BASE", "Repair & diagnostics",
                ticket.getApplianceProduct() + " (" + nullSafe(ticket.getApplianceBrand()) + ") — labour, testing, parts allowance",
                base, "SHOP"));

        BigDecimal partsEstimate = base.multiply(bd("0.18")).setScale(2, RoundingMode.HALF_UP);
        items.add(item("PARTS", "Estimated spare parts",
                "Category-adjusted parts estimate for " + ticket.getApplianceCategory(),
                partsEstimate, "SHOP"));

        boolean delivery = ticket.getFulfillmentType() == FulfillmentType.DELIVERY_PARTNER;
        BigDecimal pickupFee = bd(0);
        BigDecimal returnFee = bd(0);
        if (delivery) {
            pickupFee = bd(220).multiply(distanceFactor(ticket));
            returnFee = bd(220).multiply(distanceFactor(ticket));
            items.add(item("COURIER_PICKUP", "Delivery — hub to customer (pickup leg)",
                    "Loaner handover at your home + broken device collection", pickupFee, "COURIER_PICKUP"));
            items.add(item("COURIER_RETURN", "Delivery — return leg",
                    "Repaired device delivery + loaner return to partner hub", returnFee, "COURIER_RETURN"));
            items.add(item("HUB_HANDLING", "Partner hub handling",
                    "Device intake, secure storage, dispatch coordination", bd(120), "SHOP"));
        }

        long rentalDays = Math.max(1, ChronoUnit.DAYS.between(
                ticket.getCreatedAt() != null ? ticket.getCreatedAt() : LocalDateTime.now().minusDays(1),
                ticket.getResolvedAt() != null ? ticket.getResolvedAt() : LocalDateTime.now()));
        BigDecimal dailyRental = categoryKey.contains("KITCHEN") ? bd(85) : bd(120);
        BigDecimal rentalTotal = dailyRental.multiply(BigDecimal.valueOf(rentalDays));
        items.add(item("LOANER_RENTAL", "Loaner appliance rental",
                rentalDays + " day(s) zero-downtime loaner @ ₹" + dailyRental + "/day", rentalTotal, "SHOP"));

        BigDecimal platformFee = items.stream()
                .map(InvoiceLineItemDto::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .multiply(bd("0.06"))
                .setScale(2, RoundingMode.HALF_UP);
        items.add(item("PLATFORM", "FixSwap platform & SLA fee", "Dispatch, OTP security, insurance buffer", platformFee, "PLATFORM"));

        BigDecimal subtotal = items.stream().map(InvoiceLineItemDto::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal b2bDiscount = BigDecimal.ZERO;
        if (ticket.getCustomer() != null) {
            b2bDiscount = customerProfileRepository.findById(ticket.getCustomer().getAuthId())
                    .filter(p -> p.getCustomerType() == CustomerCategory.HOTEL_B2B)
                    .map(p -> subtotal.multiply(bd("0.15")).setScale(2, RoundingMode.HALF_UP))
                    .orElse(BigDecimal.ZERO);
        }

        BigDecimal taxable = subtotal.subtract(b2bDiscount).max(BigDecimal.ZERO);
        BigDecimal gst = taxable.multiply(GST_RATE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal finalTotal = taxable.add(gst);

        BigDecimal shopPayout = base.add(partsEstimate).add(delivery ? bd(120) : BigDecimal.ZERO).add(rentalTotal);
        BigDecimal courierPickup = pickupFee;
        BigDecimal courierReturn = returnFee;

        String summary = String.format(
                "Dynamic quote for %s %s — base ₹%s × brand × age × complexity%s%s",
                ticket.getApplianceCategory(),
                ticket.getApplianceProduct(),
                CATEGORY_BASE.getOrDefault(categoryKey, bd(500)),
                delivery ? " + delivery legs" : "",
                b2bDiscount.compareTo(BigDecimal.ZERO) > 0 ? " − B2B 15%" : ""
        );

        return new PricingResult(items, subtotal, rentalTotal, base.add(partsEstimate), b2bDiscount, gst, finalTotal,
                shopPayout, courierPickup, courierReturn, platformFee, summary);
    }

    private InvoiceLineItemDto item(String code, String label, String desc, BigDecimal amount, String beneficiary) {
        return InvoiceLineItemDto.builder()
                .code(code)
                .label(label)
                .description(desc)
                .amount(amount.setScale(2, RoundingMode.HALF_UP))
                .beneficiary(beneficiary)
                .build();
    }

    private static BigDecimal bd(double v) {
        return BigDecimal.valueOf(v).setScale(2, RoundingMode.HALF_UP);
    }

    private static BigDecimal bd(String v) {
        return new BigDecimal(v).setScale(2, RoundingMode.HALF_UP);
    }

    private static String normalize(String s) {
        return s == null ? "" : s.trim().toUpperCase(Locale.ROOT);
    }

    private static String nullSafe(String s) {
        return s == null || s.isBlank() ? "Generic" : s;
    }

    private BigDecimal brandMultiplier(String brand) {
        if (brand == null) return BigDecimal.ONE;
        return BRAND_MULTIPLIER.getOrDefault(normalize(brand), BigDecimal.ONE);
    }

    private BigDecimal ageFactor(Integer year) {
        if (year == null || year < 1990) return bd("1.0");
        int age = Math.max(0, LocalDateTime.now().getYear() - year);
        if (age <= 2) return bd("1.05");
        if (age <= 5) return bd("1.0");
        if (age <= 10) return bd("0.95");
        return bd("0.88");
    }

    private BigDecimal complexityFactor(String issue) {
        if (issue == null || issue.isBlank()) return bd("1.0");
        String lower = issue.toLowerCase(Locale.ROOT);
        double score = 1.0;
        if (lower.length() > 80) score += 0.08;
        if (lower.matches(".*(burn|smoke|spark|leak|pcb|compressor|motor).*")) score += 0.12;
        if (lower.matches(".*(not working|dead|no power|broken).*")) score += 0.06;
        return BigDecimal.valueOf(Math.min(score, 1.35)).setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal distanceFactor(ServiceTicket ticket) {
        return bd("1.0");
    }

    public record PricingResult(
            List<InvoiceLineItemDto> lineItems,
            BigDecimal subtotal,
            BigDecimal rentalCost,
            BigDecimal baseRepairCost,
            BigDecimal b2bDiscount,
            BigDecimal gstAmount,
            BigDecimal finalTotal,
            BigDecimal shopPayout,
            BigDecimal courierPickupPayout,
            BigDecimal courierReturnPayout,
            BigDecimal platformFee,
            String pricingSummary
    ) {}
}
