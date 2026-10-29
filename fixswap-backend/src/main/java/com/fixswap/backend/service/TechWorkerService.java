package com.fixswap.backend.service;

import com.fixswap.backend.entity.TechWorker;
import com.fixswap.backend.entity.Shop;
import com.fixswap.backend.repository.TechWorkerRepository;
import com.fixswap.backend.repository.ShopRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TechWorkerService {

    private final TechWorkerRepository workerRepository;
    private final ShopRepository shopRepository;

    public List<TechWorker> getWorkersByShop(UUID shopId) {
        return workerRepository.findByShopShopId(shopId);
    }

    public List<TechWorker> getOnDutyWorkers(UUID shopId) {
        return workerRepository.findByShopShopIdAndIsOnDutyTrue(shopId);
    }

    public List<TechWorker> getVerifiedDeliveryCouriers() {
        return workerRepository.findByWorkerTypeAndKycStatusWithAuth("DELIVERY_COURIER", "VERIFIED");
    }

    @Transactional
    public TechWorker toggleDutyStatus(UUID workerId, boolean isOnDuty) {
        TechWorker worker = workerRepository.findById(workerId)
                .orElseThrow(() -> new RuntimeException("Worker not found"));
        worker.setIsOnDuty(isOnDuty);
        return workerRepository.save(worker);
    }

    @Transactional
    public TechWorker updateLocation(UUID workerId, BigDecimal lat, BigDecimal lon) {
        TechWorker worker = workerRepository.findById(workerId)
                .orElseThrow(() -> new RuntimeException("Worker not found"));
        worker.setCurrentLat(lat);
        worker.setCurrentLon(lon);
        return workerRepository.save(worker);
    }

    @Transactional
    public TechWorker linkToShop(UUID workerId, UUID shopId) {
        TechWorker worker = workerRepository.findById(workerId)
                .orElseThrow(() -> new RuntimeException("Worker not found"));
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new RuntimeException("Shop not found"));
        
        worker.setShop(shop);
        return workerRepository.save(worker);
    }
}
