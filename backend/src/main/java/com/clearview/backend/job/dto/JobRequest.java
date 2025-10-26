package com.clearview.backend.job.dto;

public record JobRequest(
    String service,
    String jobDate,
    Double price,
    String notes,
    Long customerId,
    String customerName,
    String address,
    Boolean paid
) {
    
    public JobRequest(
        String service,
        String jobDate,
        Double price,
        String notes,
        Long customerId,
        String customerName,
        String address
    ) {
        this(service, jobDate, price, notes, customerId, customerName, address, false);
    }
}
