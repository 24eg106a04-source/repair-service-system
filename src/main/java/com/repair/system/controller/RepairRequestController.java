package com.repair.system.controller;

import com.repair.system.dto.RepairRequestCreateDto;
import com.repair.system.dto.RepairStatusUpdateDto;
import com.repair.system.dto.TechnicianAssignDto;
import com.repair.system.entity.RepairRequest;
import com.repair.system.entity.RepairStatus;
import com.repair.system.service.RepairRequestService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/repairs")
@CrossOrigin(origins = "*")
public class RepairRequestController {

    private final RepairRequestService repairRequestService;

    public RepairRequestController(RepairRequestService repairRequestService) {
        this.repairRequestService = repairRequestService;
    }

    @PostMapping
    public ResponseEntity<RepairRequest> createRequest(@Valid @RequestBody RepairRequestCreateDto dto) {
        RepairRequest created = repairRequestService.createRepairRequest(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<RepairRequest>> getAllRequests(
            @RequestParam(required = false) RepairStatus status,
            @RequestParam(required = false) String email) {
        if (status != null) {
            return ResponseEntity.ok(repairRequestService.getRequestsByStatus(status));
        }
        if (email != null && !email.trim().isEmpty()) {
            return ResponseEntity.ok(repairRequestService.getRequestsByCustomerEmail(email));
        }
        return ResponseEntity.ok(repairRequestService.getAllRepairRequests());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RepairRequest> getRequestById(@PathVariable Long id) {
        return ResponseEntity.ok(repairRequestService.getRepairRequestById(id));
    }

    @GetMapping("/track/{trackingNumber}")
    public ResponseEntity<RepairRequest> trackByNumber(@PathVariable String trackingNumber) {
        return ResponseEntity.ok(repairRequestService.getRepairRequestByTrackingNumber(trackingNumber));
    }

    @GetMapping("/customer/{email}")
    public ResponseEntity<List<RepairRequest>> getByCustomerEmail(@PathVariable String email) {
        return ResponseEntity.ok(repairRequestService.getRequestsByCustomerEmail(email));
    }

    @GetMapping("/technician/{technicianId}")
    public ResponseEntity<List<RepairRequest>> getByTechnician(@PathVariable Long technicianId) {
        return ResponseEntity.ok(repairRequestService.getRequestsByTechnician(technicianId));
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<RepairRequest> assignTechnician(
            @PathVariable Long id,
            @Valid @RequestBody TechnicianAssignDto dto) {
        return ResponseEntity.ok(repairRequestService.assignTechnician(id, dto));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<RepairRequest> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody RepairStatusUpdateDto dto) {
        return ResponseEntity.ok(repairRequestService.updateRepairStatus(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRequest(@PathVariable Long id) {
        repairRequestService.deleteRepairRequest(id);
        return ResponseEntity.noContent().build();
    }
}
