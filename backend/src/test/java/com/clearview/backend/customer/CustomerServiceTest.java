package com.clearview.backend.customer;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

class CustomerServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    @InjectMocks
    private CustomerService customerService;

    private Customer testCustomer;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);

        testCustomer = new Customer();
        testCustomer.setId(1L);
        testCustomer.setName("Alice");
        testCustomer.setPhone("123456789");
        testCustomer.setEmail("alice@example.com");
        testCustomer.setAddress("123 Street");
    }

    @Test
    void testCreateCustomer() {
        when(customerRepository.save(testCustomer)).thenReturn(testCustomer);

        Customer saved = customerService.createCustomer(testCustomer);

        assertEquals("Alice", saved.getName());
        verify(customerRepository).save(testCustomer);
    }

    @Test
    void testGetCustomersByUser() {
        when(customerRepository.findByCreatedById(1L)).thenReturn(List.of(testCustomer));

        List<Customer> result = customerService.getCustomersByUser(1L);

        assertEquals(1, result.size());
        assertEquals("Alice", result.get(0).getName());
        verify(customerRepository).findByCreatedById(1L);
    }
}
