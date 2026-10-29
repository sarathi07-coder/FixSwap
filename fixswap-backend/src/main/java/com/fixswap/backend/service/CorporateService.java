package com.fixswap.backend.service;

import com.fixswap.backend.entity.*;
import com.fixswap.backend.entity.enums.TicketState;
import com.fixswap.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CorporateService {

    private final AuthCredentialRepository authRepository;
    private final B2bContractRepository contractRepository;
    private final GarageApplianceRepository garageRepository;
    private final ServiceTicketRepository ticketRepository;
    private final CorporateTeamMemberRepository teamRepository;
    private final EWastePickupRequestRepository eWastePickupRepository;
    private final EnterpriseAssetIntelligenceService assetIntelligence;

    public Map<String, Object> getDashboard(UUID companyId) {
        ensureDefaultTeam(companyId);
        List<ServiceTicket> tickets = ticketRepository.findByCustomerAuthIdOrderByCreatedAtDesc(companyId);
        long active = tickets.stream().filter(t -> t.getStatus() != TicketState.COMPLETED && t.getStatus() != TicketState.CANCELLED).count();
        long completed = tickets.stream().filter(t -> t.getStatus() == TicketState.COMPLETED).count();
        long assets = garageRepository.findByUserAuthIdAndRegistryTypeOrderByCreatedAtDesc(companyId, "ENTERPRISE").size();

        B2bContract contract = contractRepository.findByHotelAuthId(companyId).orElse(null);
        BigDecimal retainer = contract != null ? contract.getMonthlyRetainerFee() : BigDecimal.ZERO;

        double slaUptime = completed == 0 ? 100.0 : Math.max(85, 100 - getDelays(companyId).size() * 2.5);

        Map<String, Object> m = new HashMap<>();
        m.put("slaUptime", Math.round(slaUptime * 10) / 10.0);
        m.put("totalAssets", assets);
        m.put("activeTickets", active);
        m.put("completedTickets", completed);
        m.put("monthlyRetainer", retainer);
        m.put("contract", contract != null ? mapContract(contract) : null);
        return m;
    }

    public Map<String, Object> mapContract(B2bContract c) {
        Map<String, Object> m = new HashMap<>();
        m.put("contractId", c.getContractId());
        m.put("companyName", c.getCompanyName());
        m.put("monthlyRetainerFee", c.getMonthlyRetainerFee());
        m.put("includedSwapsPerMonth", c.getIncludedSwapsPerMonth());
        m.put("swapsUsedThisMonth", c.getSwapsUsedThisMonth());
        m.put("status", c.getStatus() != null ? c.getStatus().name() : "ACTIVE");
        m.put("validUntil", c.getValidUntil());
        m.put("slaLevel", c.getIncludedSwapsPerMonth() >= 20 ? "Platinum (Zero-Downtime)" : "Gold");
        m.put("responseGuarantee", c.getIncludedSwapsPerMonth() >= 20 ? "2 Hours (On-Site)" : "4 Hours (On-Site)");
        return m;
    }

    public List<Map<String, Object>> getDelays(UUID companyId) {
        List<ServiceTicket> tickets = ticketRepository.findByCustomerAuthIdOrderByCreatedAtDesc(companyId);
        List<Map<String, Object>> delays = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        for (ServiceTicket t : tickets) {
            if (t.getStatus() == TicketState.CANCELLED || t.getStatus() == TicketState.COMPLETED) {
                if (t.getStatus() == TicketState.COMPLETED && t.getCreatedAt() != null && t.getResolvedAt() != null) {
                    long mins = ChronoUnit.MINUTES.between(t.getCreatedAt(), t.getResolvedAt());
                    if (mins > 240) {
                        delays.add(delayRow(t, "RESOLUTION_SLOW", mins, "Repair exceeded 4h SLA window"));
                    }
                }
                continue;
            }
            long mins = ChronoUnit.MINUTES.between(t.getCreatedAt(), now);
            if (mins > 30 && t.getStatus() == TicketState.PENDING) {
                delays.add(delayRow(t, "DISPATCH_DELAY", mins, "No partner accepted within 30 minutes"));
            } else if (mins > 90 && t.getStatus() != TicketState.PENDING && t.getStatus() != TicketState.COMPLETED) {
                delays.add(delayRow(t, "ACTIVE_SLA_RISK", mins, "Work order open beyond 90 minutes"));
            }
        }
        return delays;
    }

    private Map<String, Object> delayRow(ServiceTicket t, String type, long mins, String msg) {
        Map<String, Object> m = new HashMap<>();
        m.put("ticketId", t.getTicketId());
        m.put("ticketShortId", t.getTicketId().toString().substring(0, 8).toUpperCase());
        m.put("applianceProduct", t.getApplianceProduct());
        m.put("status", t.getStatus().name());
        m.put("delayType", type);
        m.put("minutesOpen", mins);
        m.put("message", msg);
        return m;
    }

    public Map<String, Object> getEsgReport(UUID companyId) {
        List<GarageAppliance> assets = garageRepository.findByUserAuthIdAndRegistryTypeOrderByCreatedAtDesc(companyId, "ENTERPRISE");
        List<EWastePickupRequest> pickups = eWastePickupRepository.findByCompanyAuthIdOrderByCreatedAtDesc(companyId);

        BigDecimal totalKg = pickups.stream()
                .map(EWastePickupRequest::getEstimatedKg)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalKg.compareTo(BigDecimal.ZERO) == 0) {
            totalKg = BigDecimal.valueOf(assets.size() * 45L);
        }

        Map<String, Object> m = new HashMap<>();
        m.put("totalWasteDivertedKg", totalKg);
        m.put("carbonOffsetKg", totalKg.multiply(BigDecimal.valueOf(2.1)).setScale(1, RoundingMode.HALF_UP));
        m.put("pickupRequests", pickups.stream().map(this::mapPickup).collect(Collectors.toList()));
        m.put("assetCount", assets.size());
        return m;
    }

    private Map<String, Object> mapPickup(EWastePickupRequest p) {
        Map<String, Object> m = new HashMap<>();
        m.put("requestId", p.getRequestId());
        m.put("wasteType", p.getWasteType());
        m.put("estimatedKg", p.getEstimatedKg());
        m.put("status", p.getStatus());
        m.put("createdAt", p.getCreatedAt());
        return m;
    }

    @Transactional
    public EWastePickupRequest schedulePickup(UUID companyId, String wasteType, BigDecimal estimatedKg) {
        AuthCredential company = authRepository.findById(companyId).orElseThrow();
        EWastePickupRequest req = new EWastePickupRequest();
        req.setCompany(company);
        req.setWasteType(wasteType);
        req.setEstimatedKg(estimatedKg != null ? estimatedKg : BigDecimal.valueOf(50));
        req.setStatus("SCHEDULED");
        return eWastePickupRepository.save(req);
    }

    public List<Map<String, Object>> getTeam(UUID companyId) {
        ensureDefaultTeam(companyId);
        return teamRepository.findByCompanyAuthIdOrderByCreatedAtDesc(companyId).stream()
                .map(this::mapTeamMember)
                .collect(Collectors.toList());
    }

    @Transactional
    public CorporateTeamMember addTeamMember(UUID companyId, String fullName, String email, String role) {
        AuthCredential company = authRepository.findById(companyId).orElseThrow();
        CorporateTeamMember m = new CorporateTeamMember();
        m.setCompany(company);
        m.setFullName(fullName);
        m.setEmail(email);
        m.setRole(role != null ? role : "Viewer");
        applyRoleDefaults(m);
        return teamRepository.save(m);
    }

    @Transactional
    public void removeTeamMember(UUID memberId) {
        teamRepository.deleteById(memberId);
    }

    private void applyRoleDefaults(CorporateTeamMember m) {
        switch (m.getRole()) {
            case "HQ Admin" -> { m.setCanCreate(true); m.setCanDispatch(true); m.setCanView(true); }
            case "Dispatcher" -> { m.setCanCreate(true); m.setCanDispatch(true); m.setCanView(true); }
            case "Technician" -> { m.setCanCreate(false); m.setCanDispatch(false); m.setCanView(true); }
            default -> { m.setCanCreate(false); m.setCanDispatch(false); m.setCanView(true); }
        }
    }

    private void ensureDefaultTeam(UUID companyId) {
        if (!teamRepository.findByCompanyAuthIdOrderByCreatedAtDesc(companyId).isEmpty()) return;
        AuthCredential company = authRepository.findById(companyId).orElseThrow();
        CorporateTeamMember owner = new CorporateTeamMember();
        owner.setCompany(company);
        owner.setFullName("Account Owner");
        owner.setEmail(company.getEmail());
        owner.setRole("HQ Admin");
        owner.setCanCreate(true);
        owner.setCanDispatch(true);
        owner.setCanView(true);
        teamRepository.save(owner);
    }

    private Map<String, Object> mapTeamMember(CorporateTeamMember m) {
        Map<String, Object> map = new HashMap<>();
        map.put("memberId", m.getMemberId());
        map.put("fullName", m.getFullName());
        map.put("email", m.getEmail());
        map.put("role", m.getRole());
        map.put("canCreate", m.getCanCreate());
        map.put("canDispatch", m.getCanDispatch());
        map.put("canView", m.getCanView());
        map.put("isOwner", "HQ Admin".equals(m.getRole()) && m.getEmail().equalsIgnoreCase(m.getCompany().getEmail()));
        return map;
    }

    public Map<String, Object> analyzeAsset(Map<String, Object> body) {
        return assetIntelligence.analyzeAsset(
                (String) body.get("category"),
                (String) body.get("product"),
                (String) body.get("brand"),
                body.get("purchaseYear") != null ? ((Number) body.get("purchaseYear")).intValue() : null,
                (String) body.get("issueHint")
        );
    }
}
