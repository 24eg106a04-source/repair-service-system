package com.repair.system.dto;

import com.repair.system.entity.RepairStatus;
import jakarta.validation.constraints.NotNull;

public class RepairStatusUpdateDto {

    @NotNull(message = "Status cannot be null")
    private RepairStatus status;

    private String technicianNotes;

    private Double finalCost;

    private Double estimatedCost;

    public RepairStatusUpdateDto() {
    }

    public RepairStatus getStatus() {
        return status;
    }

    public void setStatus(RepairStatus status) {
        this.status = status;
    }

    public String getTechnicianNotes() {
        return technicianNotes;
    }

    public void setTechnicianNotes(String technicianNotes) {
        this.technicianNotes = technicianNotes;
    }

    public Double getFinalCost() {
        return finalCost;
    }

    public void setFinalCost(Double finalCost) {
        this.finalCost = finalCost;
    }

    public Double getEstimatedCost() {
        return estimatedCost;
    }

    public void setEstimatedCost(Double estimatedCost) {
        this.estimatedCost = estimatedCost;
    }
}
