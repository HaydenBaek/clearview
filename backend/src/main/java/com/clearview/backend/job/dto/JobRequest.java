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
) {}
