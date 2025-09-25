package com.clearview.backend.job.dto;

import com.clearview.backend.job.Job;

public record JobDto(
    Long id,
    String service,
    String customerName,
    String address,
    String jobDate,
    Double price,
    String notes,
    boolean paid,
    String invoiceNumber
) {
    public static JobDto from(Job job) {
        return new JobDto(
            job.getId(),
            job.getService(),
            job.getCustomer() != null ? job.getCustomer().getName() : job.getCustomerName(),
            job.getCustomer() != null ? job.getCustomer().getAddress() : job.getAddress(),
            job.getJobDate(),
            job.getPrice(),
            job.getNotes(),
            job.isPaid(),
            job.getInvoiceNumber()
        );
    }
}
