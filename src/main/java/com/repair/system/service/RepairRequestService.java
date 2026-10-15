package com.repair.system.service;

import com.repair.system.dto.RepairRequestCreateDto;
import com.repair.system.dto.RepairStatusUpdateDto;
import com.repair.system.dto.TechnicianAssignDto;
import com.repair.system.entity.RepairRequest;
import com.repair.system.entity.RepairStatus;
import com.repair.system.entity.Technician;
import com.repair.system.repository.RepairRequestRepository;
import com.repair.system.repository.TechnicianRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.Year;
import java.util.List;
import java.util.Random;

@Service
@Transactional
public class RepairRequestService {

    private final RepairRequestRepository repairRequestRepository;
    private final TechnicianRepository technicianRepository;
    private final Random random = new Random();

    public RepairRequestService(RepairRequestRepository repairRequestRepository, TechnicianRepository technicianRepository) {
        this.repairRequestRepository = repairRequestRepository;
        this.technicianRepository = technicianRepository;
    }

    public RepairRequest createRepairRequest(RepairRequestCreateDto dto) {
        RepairRequest request = new RepairRequest();
        
        // Generate friendly Tracking Number e.g. REP-2026-8492
        String trackingCode = "REP-" + Year.now().getValue() + "-" + (1000 + random.nextInt(9000));
        while (repairRequestRepository.findByTrackingNumber(trackingCode).isPresent()) {
            trackingCode = "REP-" + Year.now().getValue() + "-" + (1000 + random.nextInt(9000));
        }

        request.setTrackingNumber(trackingCode);
        request.setCustomerName(dto.getCustomerName());
        request.setCustomerEmail(dto.getCustomerEmail());
        request.setCustomerPhone(dto.getCustomerPhone());
        request.setDeviceType(dto.getDeviceType());
        request.setDeviceBrand(dto.getDeviceBrand());
        request.setDeviceModel(dto.getDeviceModel());
        request.setSerialNumber(dto.getSerialNumber());
        request.setIssueDescription(dto.getIssueDescription());
        request.setPriority(dto.getPriority() != null ? dto.getPriority() : "MEDIUM");
        request.setStatus(RepairStatus.PENDING);
        request.setEstimatedCost(0.0);
        request.setFinalCost(0.0);

        return repairRequestRepository.save(request);
    }

    public List<RepairRequest> getAllRepairRequests() {
        return repairRequestRepository.findAllByOrderByCreatedAtDesc();
    }

    public RepairRequest getRepairRequestById(Long id) {
        return repairRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Repair request not found with ID: " + id));
    }

    public RepairRequest getRepairRequestByTrackingNumber(String trackingNumber) {
        return repairRequestRepository.findByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new RuntimeException("No repair request found with tracking number: " + trackingNumber));
    }

    public List<RepairRequest> getRequestsByCustomerEmail(String email) {
        return repairRequestRepository.findByCustomerEmailIgnoreCase(email);
    }

    public List<RepairRequest> getRequestsByStatus(RepairStatus status) {
        return repairRequestRepository.findByStatus(status);
    }

    public List<RepairRequest> getRequestsByTechnician(Long technicianId) {
        return repairRequestRepository.findByAssignedTechnicianId(technicianId);
    }

    public RepairRequest assignTechnician(Long requestId, TechnicianAssignDto dto) {
        RepairRequest request = getRepairRequestById(requestId);
        Technician technician = technicianRepository.findById(dto.getTechnicianId())
                .orElseThrow(() -> new RuntimeException("Technician not found with ID: " + dto.getTechnicianId()));

        request.setAssignedTechnician(technician);
        request.setStatus(RepairStatus.ASSIGNED);
        if (dto.getEstimatedCost() != null && dto.getEstimatedCost() > 0) {
            request.setEstimatedCost(dto.getEstimatedCost());
        }

        technician.setActiveJobsCount(technician.getActiveJobsCount() + 1);
        technicianRepository.save(technician);

        return repairRequestRepository.save(request);
    }

    public RepairRequest updateRepairStatus(Long requestId, RepairStatusUpdateDto dto) {
        RepairRequest request = getRepairRequestById(requestId);
        RepairStatus previousStatus = request.getStatus();
        request.setStatus(dto.getStatus());

        if (dto.getTechnicianNotes() != null) {
            request.setTechnicianNotes(dto.getTechnicianNotes());
        }

        if (dto.getFinalCost() != null && dto.getFinalCost() > 0) {
            request.setFinalCost(dto.getFinalCost());
        }

        if (dto.getEstimatedCost() != null && dto.getEstimatedCost() > 0) {
            request.setEstimatedCost(dto.getEstimatedCost());
        }

        if (dto.getStatus() == RepairStatus.COMPLETED) {
            request.setCompletedAt(LocalDateTime.now());
            if (request.getFinalCost() == null || request.getFinalCost() == 0.0) {
                request.setFinalCost(request.getEstimatedCost());
            }
            if (request.getAssignedTechnician() != null && previousStatus != RepairStatus.COMPLETED) {
                Technician tech = request.getAssignedTechnician();
                if (tech.getActiveJobsCount() > 0) {
                    tech.setActiveJobsCount(tech.getActiveJobsCount() - 1);
                    technicianRepository.save(tech);
                }
            }
        }

        return repairRequestRepository.save(request);
    }

    public void deleteRepairRequest(Long id) {
        repairRequestRepository.deleteById(id);
    }
}
