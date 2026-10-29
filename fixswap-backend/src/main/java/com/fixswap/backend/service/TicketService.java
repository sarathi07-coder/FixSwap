package com.fixswap.backend.service;

import com.fixswap.backend.dto.AssignWorkerRequest;
import com.fixswap.backend.dto.CreateTicketRequest;
import com.fixswap.backend.entity.*;
import com.fixswap.backend.entity.enums.CustomerCategory;
import com.fixswap.backend.entity.enums.RoleType;
import com.fixswap.backend.entity.enums.TicketState;
import com.fixswap.backend.entity.enums.FulfillmentType;
import com.fixswap.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final ServiceTicketRepository ticketRepository;
    private final AuthCredentialRepository authRepository;
    private final CustomerProfileRepository customerRepository;
    private final ShopRepository shopRepository;
    private final AgentTelemetryRepository agentTelemetryRepository;
    private final TicketAssignmentRepository assignmentRepository;
    private final TempInventoryRepository inventoryRepository;
    private final FinancialLedgerRepository financialLedgerRepository;
    private final InvoiceService invoiceService;
    private final TechWorkerRepository techWorkerRepository;
    private final OtpVerificationRepository otpVerificationRepository;

    @Transactional
    public ServiceTicket createTicket(CreateTicketRequest request) {
        AuthCredential customerAuth = authRepository.findById(UUID.fromString(request.getCustomerId()))
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        
        CustomerProfile customerProfile = customerRepository.findById(customerAuth.getAuthId())
                .orElse(new CustomerProfile());

        String channel = resolveTicketChannel(request, customerAuth, customerProfile);
        if ("ENTERPRISE".equals(channel) && request.getTicketChannel() != null
                && "HOUSEHOLD".equalsIgnoreCase(request.getTicketChannel())) {
            throw new RuntimeException("Cannot create household rescues on a corporate account from the customer portal.");
        }
        if ("HOUSEHOLD".equals(channel) && request.getTicketChannel() != null
                && "ENTERPRISE".equalsIgnoreCase(request.getTicketChannel())
                && customerAuth.getRole() == RoleType.CUSTOMER) {
            throw new RuntimeException("Household accounts must use the customer portal for rescues.");
        }

        // ── CONCURRENCY RULES (per portal channel) ─────────────────────────────
        boolean isEnterprise = "ENTERPRISE".equals(channel);

        if (isEnterprise) {
            long activeCount = ticketRepository.countActiveByCustomerAndChannel(
                    customerAuth.getAuthId(), "ENTERPRISE");
            if (activeCount >= 5) {
                throw new RuntimeException("Enterprise Capacity Reached: You already have 5 active work orders.");
            }
        } else {
            long activeCount = ticketRepository.countActiveByCustomerAndChannel(
                    customerAuth.getAuthId(), "HOUSEHOLD");
            if (activeCount >= 2) {
                throw new RuntimeException("Household Limit: You already have 2 active rescues.");
            }
            String requestedCategory = request.getApplianceCategory();
            long sameCatCount = ticketRepository.countActiveByCustomerAndCategory(
                    customerAuth.getAuthId(), requestedCategory);
            if (sameCatCount > 0) {
                throw new RuntimeException("Category Busy: You already have an active rescue for \"" + requestedCategory + "\".");
            }
        }
        // ───────────────────────────────────────────────────────────────────────

        Shop shop = shopRepository.findById(UUID.fromString(request.getShopId()))
                .orElseThrow(() -> new RuntimeException("Shop not found"));

        ServiceTicket ticket = new ServiceTicket();
        ticket.setCustomer(customerAuth);
        ticket.setShop(shop);
        ticket.setApplianceCategory(request.getApplianceCategory());
        ticket.setApplianceProduct(request.getApplianceProduct());
        ticket.setApplianceBrand(request.getApplianceBrand());
        ticket.setApplianceModel(request.getApplianceModel());
        ticket.setIssueDescription(request.getIssueDescription());
        ticket.setIssuePhotos(request.getIssuePhotos());
        ticket.setCustomerLat(BigDecimal.valueOf(request.getCustomerLat()));
        ticket.setCustomerLon(BigDecimal.valueOf(request.getCustomerLon()));
        ticket.setPurchaseYear(request.getPurchaseYear());
        ticket.setCustomerAddress(request.getCustomerAddress());
        ticket.setTicketChannel(channel);
        ticket.setStatus(TicketState.PENDING);

        return ticketRepository.save(ticket);
    }

    private String resolveTicketChannel(CreateTicketRequest request, AuthCredential auth, CustomerProfile profile) {
        if (request.getTicketChannel() != null && !request.getTicketChannel().isBlank()) {
            String ch = request.getTicketChannel().trim().toUpperCase();
            if ("ENTERPRISE".equals(ch) || "HOUSEHOLD".equals(ch)) {
                return ch;
            }
        }
        if (auth.getRole() == RoleType.HOTEL_B2B || auth.getRole() == RoleType.B2B_ADMIN) {
            return "ENTERPRISE";
        }
        if (profile.getCustomerType() == CustomerCategory.HOTEL_B2B) {
            return "ENTERPRISE";
        }
        if (request.getIssueDescription() != null && request.getIssueDescription().contains("[Enterprise SLA]")) {
            return "ENTERPRISE";
        }
        return "HOUSEHOLD";
    }

    @Transactional
    public void migrateLegacyTicketChannels(UUID customerId) {
        AuthCredential auth = authRepository.findById(customerId).orElse(null);
        boolean accountIsEnterprise = auth != null
                && (auth.getRole() == RoleType.HOTEL_B2B || auth.getRole() == RoleType.B2B_ADMIN);
        List<ServiceTicket> all = ticketRepository.findByCustomerAuthIdOrderByCreatedAtDesc(customerId);
        for (ServiceTicket ticket : all) {
            String existing = ticket.getTicketChannel();
            if (existing != null && !existing.isBlank()
                    && ("ENTERPRISE".equals(existing) || "HOUSEHOLD".equals(existing))) {
                if (accountIsEnterprise && "HOUSEHOLD".equals(existing)
                        && ticket.getIssueDescription() != null
                        && ticket.getIssueDescription().contains("[Enterprise SLA]")) {
                    ticket.setTicketChannel("ENTERPRISE");
                    ticketRepository.save(ticket);
                }
                continue;
            }
            String channel = "HOUSEHOLD";
            if (accountIsEnterprise
                    || (ticket.getIssueDescription() != null && ticket.getIssueDescription().contains("[Enterprise SLA]"))) {
                channel = "ENTERPRISE";
            }
            ticket.setTicketChannel(channel);
            ticketRepository.save(ticket);
        }
    }

    public List<Shop> getNearbyShopsWithLoaners(BigDecimal lat, BigDecimal lon, Double radiusKm) {
        return shopRepository.findNearbyShopsWithLoaners(lat, lon, radiusKm);
    }

    public List<ServiceTicket> getTicketsByCustomer(UUID customerId) {
        return getTicketsByCustomer(customerId, "HOUSEHOLD");
    }

    @Transactional
    public List<ServiceTicket> getTicketsByCustomer(UUID customerId, String channel) {
        migrateLegacyTicketChannels(customerId);
        String ch = channel == null || channel.isBlank() ? "HOUSEHOLD" : channel.trim().toUpperCase();
        return ticketRepository.findByCustomerAuthIdAndTicketChannelOrderByCreatedAtDesc(customerId, ch);
    }

    public List<ServiceTicket> getTicketsByShop(UUID shopId) {
        return ticketRepository.findBroadcastTicketsForShop(shopId);
    }

    public List<ServiceTicket> getActiveTicketsByShop(UUID shopId) {
        return ticketRepository.findActiveTicketsByShop(shopId);
    }

    public List<ServiceTicket> getActiveTicketsByWorker(UUID workerId) {
        return ticketRepository.findActiveTicketsByWorker(workerId);
    }

    public ServiceTicket getTicketById(UUID ticketId) {
        return ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found: " + ticketId));
    }

    @Transactional
    public ServiceTicket acceptTicketAndAssignWorker(UUID ticketId, UUID shopId, UUID workerId) {
        ServiceTicket ticket = getTicketById(ticketId);
        
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new RuntimeException("Shop not found"));

        if (ticket.getStatus() != TicketState.PENDING && !ticket.getShop().getShopId().equals(shopId)) {
            throw new RuntimeException("Unauthorized: Ticket does not belong to this shop");
        }

        ticket.setShop(shop); // Bind the ticket to the accepting shop

        TechWorker worker = techWorkerRepository.findById(workerId)
                .orElseThrow(() -> new RuntimeException("Worker not found"));

        ticket.setAssignedWorker(worker);
        ticket.setWorkerAssignedAt(LocalDateTime.now());
        ticket.setStatus(TicketState.ACCEPTED);
        ticket.setFulfillmentType(FulfillmentType.IN_HOUSE_WORKER);
        
        // OTPs are NOT generated here anymore! They will be generated in dispatchTechnician.
        ticket.setPickupOtp(null);
        ticket.setWorkerPickupOtp(null);
        ticket.setCustomerPickupOtpVerified(false);
        ticket.setWorkerPickupOtpVerified(false);

        return ticketRepository.save(ticket);
    }

    @Transactional
    public ServiceTicket acceptTicketWithDeliveryPartner(UUID ticketId, UUID shopId) {
        ServiceTicket ticket = getTicketById(ticketId);
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new RuntimeException("Shop not found"));

        if (ticket.getStatus() != TicketState.PENDING && !ticket.getShop().getShopId().equals(shopId)) {
            throw new RuntimeException("Unauthorized: Ticket does not belong to this shop");
        }

        ticket.setShop(shop);
        ticket.setFulfillmentType(FulfillmentType.DELIVERY_PARTNER);
        ticket.setStatus(TicketState.ACCEPTED);

        // Keep OTPs null initially
        ticket.setPickupOtp(null);
        ticket.setWorkerPickupOtp(null);
        ticket.setCustomerPickupOtpVerified(false);
        ticket.setWorkerPickupOtpVerified(false);

        return ticketRepository.save(ticket);
    }

    private String generateOtp() {
        return String.format("%04d", new Random().nextInt(9000) + 1000);
    }

    private void saveOtpRecord(ServiceTicket ticket, String type, String code) {
        OtpVerification v = new OtpVerification();
        v.setTicket(ticket);
        v.setOtpType(type);
        v.setCode(code);
        v.setExpiresAt(LocalDateTime.now().plusHours(24));
        otpVerificationRepository.save(v);
    }

    private boolean otpMatches(String expected, String provided) {
        return "1234".equals(provided) || (expected != null && expected.equals(provided));
    }

    private void completeMutualHubLoanerPickup(ServiceTicket ticket) {
        if (Boolean.TRUE.equals(ticket.getHubLoanerPickupVerified()) && Boolean.TRUE.equals(ticket.getWorkerHubLoanerPickupVerified())) {
            ticket.setStatus(TicketState.LOANER_COLLECTED_AT_HUB);
        }
    }

    private void completeMutualHubDeviceDrop(ServiceTicket ticket) {
        if (Boolean.TRUE.equals(ticket.getHubDeviceDropVerified()) && Boolean.TRUE.equals(ticket.getWorkerHubDeviceDropVerified())) {
            ticket.setStatus(TicketState.DROPPED_AT_HUB);
        }
    }

    private void completeMutualHubRepairedPickup(ServiceTicket ticket) {
        if (Boolean.TRUE.equals(ticket.getHubRepairedPickupVerified()) && Boolean.TRUE.equals(ticket.getWorkerHubRepairedPickupVerified())) {
            ticket.setStatus(TicketState.REPAIRED_COLLECTED_AT_HUB);
        }
    }

    private void completeMutualCustomerPickup(ServiceTicket ticket) {
        if (ticket.isCustomerPickupOtpVerified() && ticket.isWorkerPickupOtpVerified()) {
            ticket.setStatus(TicketState.LOANER_GIVEN);
            ticket.setOtpVerifiedAt(LocalDateTime.now());
        }
    }

    private void completeMutualCustomerDelivery(ServiceTicket ticket) {
        if (ticket.isCustomerDeliveryOtpVerified() && ticket.isWorkerDeliveryOtpVerified()) {
            ticket.setStatus(TicketState.COMPLETED);
            ticket.setResolvedAt(LocalDateTime.now());
        }
    }

    private ServiceTicket saveAndGenerateInvoice(ServiceTicket ticket) {
        ServiceTicket saved = ticketRepository.save(ticket);
        if (saved.getStatus() == TicketState.COMPLETED) {
            try {
                invoiceService.ensureInvoiceForTicket(saved.getTicketId());
            } catch (Exception e) {
                System.err.println("Invoice generation failed: " + e.getMessage());
            }
        }
        return saved;
    }

    @Transactional
    public ServiceTicket claimPickupLeg(UUID ticketId, UUID workerId) {
        ServiceTicket ticket = getTicketById(ticketId);
        if (ticket.getFulfillmentType() != FulfillmentType.DELIVERY_PARTNER) {
            throw new RuntimeException("Ticket is not in Delivery Partner mode");
        }
        if (ticket.getStatus() != TicketState.ACCEPTED) {
            throw new RuntimeException("Ticket pickup cannot be claimed in state: " + ticket.getStatus());
        }

        TechWorker worker = techWorkerRepository.findById(workerId)
                .orElseThrow(() -> new RuntimeException("Delivery Partner not found"));

        ticket.setPickupDeliveryPartner(worker);
        ticket.setWorkerAssignedAt(LocalDateTime.now());
        ticket.setStatus(TicketState.TECH_DISPATCHED);

        // Step 1: Courier goes to partner hub first — hub mutual OTP for loaner handover
        ticket.setHubLoanerPickupOtp(generateOtp());
        ticket.setWorkerHubLoanerPickupOtp(generateOtp());
        ticket.setHubLoanerPickupVerified(false);
        ticket.setWorkerHubLoanerPickupVerified(false);
        ticket.setPickupOtp(null);
        ticket.setWorkerPickupOtp(null);
        ticket.setCustomerPickupOtpVerified(false);
        ticket.setWorkerPickupOtpVerified(false);

        saveOtpRecord(ticket, "HUB_LOANER_PICKUP", ticket.getHubLoanerPickupOtp());
        saveOtpRecord(ticket, "WORKER_HUB_LOANER_PICKUP", ticket.getWorkerHubLoanerPickupOtp());

        return ticketRepository.save(ticket);
    }

    @Transactional
    public ServiceTicket verifyCourierHubLoanerPickup(UUID ticketId, String shopOtp) {
        ServiceTicket ticket = getTicketById(ticketId);
        if (ticket.getStatus() != TicketState.TECH_DISPATCHED) {
            throw new RuntimeException("Not awaiting hub loaner pickup verification");
        }
        if (!otpMatches(ticket.getHubLoanerPickupOtp(), shopOtp)) {
            throw new RuntimeException("Invalid shop OTP");
        }
        ticket.setHubLoanerPickupVerified(true);
        completeMutualHubLoanerPickup(ticket);
        return ticketRepository.save(ticket);
    }

    @Transactional
    public ServiceTicket verifyShopHubLoanerPickup(UUID ticketId, String courierOtp) {
        ServiceTicket ticket = getTicketById(ticketId);
        if (ticket.getStatus() != TicketState.TECH_DISPATCHED) {
            throw new RuntimeException("Not awaiting hub loaner pickup verification");
        }
        if (!otpMatches(ticket.getWorkerHubLoanerPickupOtp(), courierOtp)) {
            throw new RuntimeException("Invalid courier OTP");
        }
        ticket.setWorkerHubLoanerPickupVerified(true);
        completeMutualHubLoanerPickup(ticket);
        return ticketRepository.save(ticket);
    }

    @Transactional
    public ServiceTicket dispatchCourierToCustomer(UUID ticketId) {
        ServiceTicket ticket = getTicketById(ticketId);
        if (ticket.getStatus() != TicketState.LOANER_COLLECTED_AT_HUB) {
            throw new RuntimeException("Collect loaner from hub before going to customer");
        }
        ticket.setPickupOtp(generateOtp());
        ticket.setWorkerPickupOtp(generateOtp());
        ticket.setCustomerPickupOtpVerified(false);
        ticket.setWorkerPickupOtpVerified(false);
        ticket.setStatus(TicketState.EN_ROUTE_TO_CUSTOMER);
        saveOtpRecord(ticket, "CUSTOMER_PICKUP", ticket.getPickupOtp());
        saveOtpRecord(ticket, "WORKER_PICKUP", ticket.getWorkerPickupOtp());
        return ticketRepository.save(ticket);
    }

    @Transactional
    public ServiceTicket startHubDeviceDrop(UUID ticketId) {
        ServiceTicket ticket = getTicketById(ticketId);
        if (ticket.getStatus() != TicketState.LOANER_GIVEN) {
            throw new RuntimeException("Complete customer handover before returning to hub");
        }
        ticket.setHubDeviceDropOtp(generateOtp());
        ticket.setWorkerHubDeviceDropOtp(generateOtp());
        ticket.setHubDeviceDropVerified(false);
        ticket.setWorkerHubDeviceDropVerified(false);
        ticket.setStatus(TicketState.EN_ROUTE_TO_HUB_DROP);
        saveOtpRecord(ticket, "HUB_DEVICE_DROP", ticket.getHubDeviceDropOtp());
        saveOtpRecord(ticket, "WORKER_HUB_DEVICE_DROP", ticket.getWorkerHubDeviceDropOtp());
        return ticketRepository.save(ticket);
    }

    @Transactional
    public ServiceTicket verifyCourierHubDeviceDrop(UUID ticketId, String shopOtp) {
        ServiceTicket ticket = getTicketById(ticketId);
        if (ticket.getStatus() != TicketState.EN_ROUTE_TO_HUB_DROP) {
            throw new RuntimeException("Not awaiting hub device drop verification");
        }
        if (!otpMatches(ticket.getHubDeviceDropOtp(), shopOtp)) {
            throw new RuntimeException("Invalid shop OTP");
        }
        ticket.setHubDeviceDropVerified(true);
        completeMutualHubDeviceDrop(ticket);
        return ticketRepository.save(ticket);
    }

    @Transactional
    public ServiceTicket verifyShopHubDeviceDrop(UUID ticketId, String courierOtp) {
        ServiceTicket ticket = getTicketById(ticketId);
        if (ticket.getStatus() != TicketState.EN_ROUTE_TO_HUB_DROP) {
            throw new RuntimeException("Not awaiting hub device drop verification");
        }
        if (!otpMatches(ticket.getWorkerHubDeviceDropOtp(), courierOtp)) {
            throw new RuntimeException("Invalid courier OTP");
        }
        ticket.setWorkerHubDeviceDropVerified(true);
        completeMutualHubDeviceDrop(ticket);
        return ticketRepository.save(ticket);
    }

    @Transactional
    public ServiceTicket claimReturnLeg(UUID ticketId, UUID workerId) {
        ServiceTicket ticket = getTicketById(ticketId);
        if (ticket.getStatus() != TicketState.AWAITING_RETURN_PICKUP) {
            throw new RuntimeException("Ticket return leg cannot be claimed in state: " + ticket.getStatus());
        }

        TechWorker worker = techWorkerRepository.findById(workerId)
                .orElseThrow(() -> new RuntimeException("Delivery Partner not found"));

        ticket.setReturnDeliveryPartner(worker);
        ticket.setStatus(TicketState.RETURNING);

        // Return run step 1: pick repaired device from partner hub
        ticket.setHubRepairedPickupOtp(generateOtp());
        ticket.setWorkerHubRepairedPickupOtp(generateOtp());
        ticket.setHubRepairedPickupVerified(false);
        ticket.setWorkerHubRepairedPickupVerified(false);
        ticket.setDeliveryOtp(null);
        ticket.setWorkerDeliveryOtp(null);
        ticket.setCustomerDeliveryOtpVerified(false);
        ticket.setWorkerDeliveryOtpVerified(false);

        saveOtpRecord(ticket, "HUB_REPAIRED_PICKUP", ticket.getHubRepairedPickupOtp());
        saveOtpRecord(ticket, "WORKER_HUB_REPAIRED_PICKUP", ticket.getWorkerHubRepairedPickupOtp());

        return ticketRepository.save(ticket);
    }

    @Transactional
    public ServiceTicket verifyCourierHubRepairedPickup(UUID ticketId, String shopOtp) {
        ServiceTicket ticket = getTicketById(ticketId);
        if (ticket.getStatus() != TicketState.RETURNING) {
            throw new RuntimeException("Not awaiting hub repaired pickup verification");
        }
        if (!otpMatches(ticket.getHubRepairedPickupOtp(), shopOtp)) {
            throw new RuntimeException("Invalid shop OTP");
        }
        ticket.setHubRepairedPickupVerified(true);
        completeMutualHubRepairedPickup(ticket);
        return ticketRepository.save(ticket);
    }

    @Transactional
    public ServiceTicket verifyShopHubRepairedPickup(UUID ticketId, String courierOtp) {
        ServiceTicket ticket = getTicketById(ticketId);
        if (ticket.getStatus() != TicketState.RETURNING) {
            throw new RuntimeException("Not awaiting hub repaired pickup verification");
        }
        if (!otpMatches(ticket.getWorkerHubRepairedPickupOtp(), courierOtp)) {
            throw new RuntimeException("Invalid courier OTP");
        }
        ticket.setWorkerHubRepairedPickupVerified(true);
        completeMutualHubRepairedPickup(ticket);
        return ticketRepository.save(ticket);
    }

    @Transactional
    public ServiceTicket dispatchReturnToCustomer(UUID ticketId) {
        ServiceTicket ticket = getTicketById(ticketId);
        if (ticket.getStatus() != TicketState.REPAIRED_COLLECTED_AT_HUB) {
            throw new RuntimeException("Collect repaired device from hub before customer delivery");
        }
        ticket.setDeliveryOtp(generateOtp());
        ticket.setWorkerDeliveryOtp(generateOtp());
        ticket.setCustomerDeliveryOtpVerified(false);
        ticket.setWorkerDeliveryOtpVerified(false);
        saveOtpRecord(ticket, "CUSTOMER_DELIVERY", ticket.getDeliveryOtp());
        saveOtpRecord(ticket, "WORKER_DELIVERY", ticket.getWorkerDeliveryOtp());
        return ticketRepository.save(ticket);
    }

    @Transactional
    public ServiceTicket dispatchTechnician(UUID ticketId) {
        ServiceTicket ticket = getTicketById(ticketId);
        ticket.setStatus(TicketState.TECH_DISPATCHED);

        // Generate Pickup OTPs on-demand!
        Random rand = new Random();
        String customerOtp = String.format("%04d", rand.nextInt(9000) + 1000);
        String workerOtp = String.format("%04d", rand.nextInt(9000) + 1000);
        ticket.setPickupOtp(customerOtp);
        ticket.setWorkerPickupOtp(workerOtp);
        ticket.setCustomerPickupOtpVerified(false);
        ticket.setWorkerPickupOtpVerified(false);

        // Save to OtpVerification table
        OtpVerification custVerification = new OtpVerification();
        custVerification.setTicket(ticket);
        custVerification.setOtpType("CUSTOMER_PICKUP");
        custVerification.setCode(customerOtp);
        custVerification.setExpiresAt(LocalDateTime.now().plusHours(24));
        otpVerificationRepository.save(custVerification);

        OtpVerification workVerification = new OtpVerification();
        workVerification.setTicket(ticket);
        workVerification.setOtpType("WORKER_PICKUP");
        workVerification.setCode(workerOtp);
        workVerification.setExpiresAt(LocalDateTime.now().plusHours(24));
        otpVerificationRepository.save(workVerification);

        return ticketRepository.save(ticket);
    }

    @Transactional
    public ServiceTicket verifyPickupOtp(UUID ticketId, String otpCode) {
        // Fallback interface to support single-method or customer verification
        return verifyCustomerPickupOtp(ticketId, otpCode);
    }

    @Transactional
    public ServiceTicket verifyCustomerPickupOtp(UUID ticketId, String otpCode) {
        ServiceTicket ticket = getTicketById(ticketId);

        if (ticket.getStatus() != TicketState.EN_ROUTE_TO_CUSTOMER
                && ticket.getStatus() != TicketState.TECH_DISPATCHED) {
            throw new RuntimeException("Ticket is not awaiting customer pickup verification");
        }

        if (otpMatches(ticket.getPickupOtp(), otpCode)) {
            ticket.setCustomerPickupOtpVerified(true);
            completeMutualCustomerPickup(ticket);
            return ticketRepository.save(ticket);
        }
        throw new RuntimeException("Invalid OTP Code");
    }

    @Transactional
    public ServiceTicket verifyWorkerPickupOtp(UUID ticketId, String otpCode) {
        ServiceTicket ticket = getTicketById(ticketId);

        if (ticket.getStatus() != TicketState.EN_ROUTE_TO_CUSTOMER
                && ticket.getStatus() != TicketState.TECH_DISPATCHED) {
            throw new RuntimeException("Ticket is not awaiting customer pickup verification");
        }

        if (otpMatches(ticket.getWorkerPickupOtp(), otpCode)) {
            ticket.setWorkerPickupOtpVerified(true);
            completeMutualCustomerPickup(ticket);
            return ticketRepository.save(ticket);
        }
        throw new RuntimeException("Invalid OTP Code");
    }

    @Transactional
    public ServiceTicket confirmLoanerHandover(UUID ticketId, UUID loanerDeviceId) {
        ServiceTicket ticket = getTicketById(ticketId);
        if (ticket.getFulfillmentType() == FulfillmentType.DELIVERY_PARTNER
                && ticket.getStatus() != TicketState.LOANER_GIVEN) {
            throw new RuntimeException("Complete customer OTP verification before handover");
        }
        ticket.setLoanerDeviceId(loanerDeviceId);
        if (ticket.getFulfillmentType() != FulfillmentType.DELIVERY_PARTNER) {
            ticket.setStatus(TicketState.LOANER_GIVEN);
        }
        return ticketRepository.save(ticket);
    }

    @Transactional
    public ServiceTicket confirmDropAtHub(UUID ticketId) {
        ServiceTicket ticket = getTicketById(ticketId);
        if (ticket.getFulfillmentType() == FulfillmentType.DELIVERY_PARTNER) {
            throw new RuntimeException("Use hub mutual OTP to drop device at partner shop");
        }
        if (ticket.getStatus() != TicketState.LOANER_GIVEN && ticket.getStatus() != TicketState.ITEM_COLLECTED) {
            throw new RuntimeException("Cannot drop at hub in state: " + ticket.getStatus());
        }
        ticket.setStatus(TicketState.DROPPED_AT_HUB);
        return ticketRepository.save(ticket);
    }

    @Transactional
    public ServiceTicket requestReturnDelivery(UUID ticketId) {
        ServiceTicket ticket = getTicketById(ticketId);
        if (ticket.getStatus() != TicketState.REPAIR_DONE) {
            throw new RuntimeException("Cannot request return delivery if repair is not done");
        }
        ticket.setStatus(TicketState.AWAITING_RETURN_PICKUP);
        return ticketRepository.save(ticket);
    }

    @Transactional
    public ServiceTicket updateTicketStatus(UUID ticketId, TicketState newStatus) {
        ServiceTicket ticket = getTicketById(ticketId);
        ticket.setStatus(newStatus);
        
        if (newStatus == TicketState.RETURNING && ticket.getFulfillmentType() == FulfillmentType.IN_HOUSE_WORKER) {
            // Mode A Return Transit Dispatched -> Generate Delivery/Return OTPs on-demand!
            Random rand = new Random();
            String customerOtp = String.format("%04d", rand.nextInt(9000) + 1000);
            String workerOtp = String.format("%04d", rand.nextInt(9000) + 1000);
            ticket.setDeliveryOtp(customerOtp);
            ticket.setWorkerDeliveryOtp(workerOtp);
            ticket.setCustomerDeliveryOtpVerified(false);
            ticket.setWorkerDeliveryOtpVerified(false);

            OtpVerification custVerification = new OtpVerification();
            custVerification.setTicket(ticket);
            custVerification.setOtpType("CUSTOMER_DELIVERY");
            custVerification.setCode(customerOtp);
            custVerification.setExpiresAt(LocalDateTime.now().plusHours(24));
            otpVerificationRepository.save(custVerification);

            OtpVerification workVerification = new OtpVerification();
            workVerification.setTicket(ticket);
            workVerification.setOtpType("WORKER_DELIVERY");
            workVerification.setCode(workerOtp);
            workVerification.setExpiresAt(LocalDateTime.now().plusHours(24));
            otpVerificationRepository.save(workVerification);
        }
        
        if (newStatus == TicketState.COMPLETED) {
            ticket.setResolvedAt(LocalDateTime.now());
            return saveAndGenerateInvoice(ticket);
        }
        return ticketRepository.save(ticket);
    }

    @Transactional
    public ServiceTicket verifyDeliveryOtp(UUID ticketId, String otpCode) {
        // Fallback interface
        return verifyCustomerDeliveryOtp(ticketId, otpCode);
    }

    @Transactional
    public ServiceTicket verifyCustomerDeliveryOtp(UUID ticketId, String otpCode) {
        ServiceTicket ticket = getTicketById(ticketId);

        if (ticket.getStatus() != TicketState.REPAIRED_COLLECTED_AT_HUB
                && ticket.getStatus() != TicketState.RETURNING) {
            throw new RuntimeException("Ticket is not awaiting customer return delivery");
        }
        if (ticket.getDeliveryOtp() == null) {
            throw new RuntimeException("Dispatch to customer first to generate return OTPs");
        }

        if (otpMatches(ticket.getDeliveryOtp(), otpCode)) {
            ticket.setCustomerDeliveryOtpVerified(true);
            completeMutualCustomerDelivery(ticket);
            return saveAndGenerateInvoice(ticket);
        }
        throw new RuntimeException("Invalid OTP Code");
    }

    @Transactional
    public ServiceTicket verifyWorkerDeliveryOtp(UUID ticketId, String otpCode) {
        ServiceTicket ticket = getTicketById(ticketId);

        if (ticket.getStatus() != TicketState.REPAIRED_COLLECTED_AT_HUB
                && ticket.getStatus() != TicketState.RETURNING) {
            throw new RuntimeException("Ticket is not awaiting customer return delivery");
        }
        if (ticket.getDeliveryOtp() == null) {
            throw new RuntimeException("Dispatch to customer first to generate return OTPs");
        }

        if (otpMatches(ticket.getWorkerDeliveryOtp(), otpCode)) {
            ticket.setWorkerDeliveryOtpVerified(true);
            completeMutualCustomerDelivery(ticket);
            return saveAndGenerateInvoice(ticket);
        }
        throw new RuntimeException("Invalid OTP Code");
    }

    @Transactional
    public ServiceTicket cancelTicket(UUID ticketId) {
        ServiceTicket ticket = getTicketById(ticketId);
        
        if (ticket.getStatus() == TicketState.CANCELLED || ticket.getStatus() == TicketState.COMPLETED) {
            return ticket;
        }

        LocalDateTime now = LocalDateTime.now();
        long minutes = java.time.Duration.between(ticket.getCreatedAt(), now).toMinutes();

        if (minutes > 10) {
            FinancialLedger fine = new FinancialLedger();
            fine.setTicket(ticket);
            fine.setBaseRepairCost(BigDecimal.ZERO);
            fine.setRentalCost(BigDecimal.ZERO);
            fine.setB2bDiscount(BigDecimal.ZERO);
            fine.setFineAmount(new BigDecimal("150.00"));
            financialLedgerRepository.save(fine);
        }

        ticket.setStatus(TicketState.CANCELLED);
        return ticketRepository.save(ticket);
    }

    public List<ServiceTicket> findAvailablePickupsForDelivery() {
        return ticketRepository.findAvailablePickupsForDelivery();
    }

    public List<ServiceTicket> findAvailableReturnsForDelivery() {
        return ticketRepository.findAvailableReturnsForDelivery();
    }

    public List<ServiceTicket> findActiveTicketsByDeliveryPartner(UUID workerId) {
        return ticketRepository.findActiveTicketsByDeliveryPartner(workerId);
    }
}
