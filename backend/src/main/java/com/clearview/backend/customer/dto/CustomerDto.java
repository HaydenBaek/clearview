package com.clearview.backend.customer.dto;

import com.clearview.backend.customer.Customer;

public record CustomerDto(
    Long id,
    String name,
    String phone,
    String email,
    String address
) {
    public static CustomerDto from(Customer c) {
        return new CustomerDto(
            c.getId(),
            c.getName(),
            c.getPhone(),
            c.getEmail(),
            c.getAddress()
        );
    }
}
