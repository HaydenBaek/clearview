package com.clearview.backend.job.dto;

public class RevenueDto {
    private String month;
    private Double paid;
    private Double unpaid;

    public RevenueDto(String month, Double paid, Double unpaid) {
        this.month = month;
        this.paid = paid;
        this.unpaid = unpaid;
    }

    public String getMonth() {
        return month;
    }

    public Double getPaid() {
        return paid;
    }

    public Double getUnpaid() {
        return unpaid;
    }
}
