package com.repair.system.dto;

import jakarta.validation.constraints.NotNull;

public class TechnicianAssignDto {

    @NotNull(message = "Technician ID is required")
    private Long technicianId;

    private Double estimatedCost;

    public TechnicianAssignDto() {
    }

    public Long getTechnicianId() {
        return technicianId;
    }

    public void setTechnicianId(Long technicianId) {
        this.technicianId = technicianId;
    }

    public Double getEstimatedCost() {
        return estimatedCost;
    }

    public void setEstimatedCost(Double estimatedCost) {
        this.estimatedCost = estimatedCost;
    }
}
