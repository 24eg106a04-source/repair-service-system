package com.repair.system.service;

import com.repair.system.dto.DashboardStatsDto;
import com.repair.system.entity.RepairRequest;
import com.repair.system.entity.RepairStatus;
import com.repair.system.repository.RepairRequestRepository;
import com.repair.system.repository.TechnicianRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DashboardService {

    private final RepairRequestRepository repairRequestRepository;
    private final TechnicianRepository technicianRepository;

    public DashboardService(RepairRequestRepository repairRequestRepository, TechnicianRepository technicianRepository) {
        this.repairRequestRepository = repairRequestRepository;
        this.technicianRepository = technicianRepository;
    }

    public DashboardStatsDto getDashboardStats() {
        DashboardStatsDto stats = new DashboardStatsDto();
        stats.setTotalRequests(repairRequestRepository.count());
        stats.setPendingRequests(repairRequestRepository.countByStatus(RepairStatus.PENDING));
        stats.setAssignedRequests(repairRequestRepository.countByStatus(RepairStatus.ASSIGNED));
        stats.setInProgressRequests(repairRequestRepository.countByStatus(RepairStatus.IN_PROGRESS));
        stats.setCompletedRequests(repairRequestRepository.countByStatus(RepairStatus.COMPLETED));
        stats.setTotalTechnicians(technicianRepository.count());
        stats.setTotalRevenue(repairRequestRepository.calculateTotalRevenue());

        List<RepairRequest> all = repairRequestRepository.findAllByOrderByCreatedAtDesc();
        stats.setRecentRequests(all.stream().limit(5).toList());

        return stats;
    }
}
