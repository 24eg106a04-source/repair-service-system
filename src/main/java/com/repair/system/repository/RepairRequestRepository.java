package com.repair.system.repository;

import com.repair.system.entity.RepairRequest;
import com.repair.system.entity.RepairStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RepairRequestRepository extends JpaRepository<RepairRequest, Long> {
    Optional<RepairRequest> findByTrackingNumber(String trackingNumber);

    List<RepairRequest> findByCustomerEmailIgnoreCase(String customerEmail);

    List<RepairRequest> findByStatus(RepairStatus status);

    List<RepairRequest> findByAssignedTechnicianId(Long technicianId);

    long countByStatus(RepairStatus status);

    @Query("SELECT COALESCE(SUM(r.finalCost), 0.0) FROM RepairRequest r WHERE r.status = 'COMPLETED'")
    Double calculateTotalRevenue();

    List<RepairRequest> findAllByOrderByCreatedAtDesc();
}
