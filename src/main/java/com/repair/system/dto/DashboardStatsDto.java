package com.repair.system.dto;

import java.util.List;
import com.repair.system.entity.RepairRequest;

public class DashboardStatsDto {

    private long totalRequests;
    private long pendingRequests;
    private long assignedRequests;
    private long inProgressRequests;
    private long completedRequests;
    private long totalTechnicians;
    private Double totalRevenue;
    private List<RepairRequest> recentRequests;

    public DashboardStatsDto() {
    }

    public long getTotalRequests() {
        return totalRequests;
    }

    public void setTotalRequests(long totalRequests) {
        this.totalRequests = totalRequests;
    }

    public long getPendingRequests() {
        return pendingRequests;
    }

    public void setPendingRequests(long pendingRequests) {
        this.pendingRequests = pendingRequests;
    }

    public long getAssignedRequests() {
        return assignedRequests;
    }

    public void setAssignedRequests(long assignedRequests) {
        this.assignedRequests = assignedRequests;
    }

    public long getInProgressRequests() {
        return inProgressRequests;
    }

    public void setInProgressRequests(long inProgressRequests) {
        this.inProgressRequests = inProgressRequests;
    }

    public long getCompletedRequests() {
        return completedRequests;
    }

    public void setCompletedRequests(long completedRequests) {
        this.completedRequests = completedRequests;
    }

    public long getTotalTechnicians() {
        return totalTechnicians;
    }

    public void setTotalTechnicians(long totalTechnicians) {
        this.totalTechnicians = totalTechnicians;
    }

    public Double getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(Double totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public List<RepairRequest> getRecentRequests() {
        return recentRequests;
    }

    public void setRecentRequests(List<RepairRequest> recentRequests) {
        this.recentRequests = recentRequests;
    }
}
