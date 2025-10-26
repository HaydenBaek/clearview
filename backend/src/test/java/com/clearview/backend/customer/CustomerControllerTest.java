package com.clearview.backend.customer;

import com.clearview.backend.customer.dto.CustomerDto;
import com.clearview.backend.user.User;
import com.clearview.backend.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

import java.security.Principal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CustomerControllerTest {

    @Mock
    private CustomerService customerService;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CustomerController customerController;

    private User testUser;
    private Customer testCustomer;
    private Principal testPrincipal;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);

        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");

        testCustomer = new Customer();
        testCustomer.setId(1L);
        testCustomer.setName("Alice");
        testCustomer.setPhone("123456789");
        testCustomer.setEmail("alice@example.com");
        testCustomer.setAddress("123 Street");

        testPrincipal = () -> "testuser";
    }

    @Test
    void testCreateCustomer_Success() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(customerService.createCustomer(any(Customer.class))).thenReturn(testCustomer);

        ResponseEntity<Customer> response = customerController.createCustomer(testCustomer, testPrincipal);

        assertEquals(200, response.getStatusCode().value());
        assertEquals("Alice", response.getBody().getName());
        verify(userRepository).findByUsername("testuser");
        verify(customerService).createCustomer(any(Customer.class));
    }

    @Test
    void testCreateCustomer_UserNotFound() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> customerController.createCustomer(testCustomer, testPrincipal));

        verify(userRepository).findByUsername("testuser");
    }

    @Test
    void testGetCustomers_Success() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(customerService.getCustomersByUser(1L)).thenReturn(List.of(testCustomer));

        ResponseEntity<List<CustomerDto>> response = customerController.getCustomers(testPrincipal);

        assertEquals(200, response.getStatusCode().value());
        assertEquals(1, response.getBody().size());
        assertEquals("Alice", response.getBody().get(0).name());
        verify(userRepository).findByUsername("testuser");
        verify(customerService).getCustomersByUser(1L);
    }

    @Test
    void testGetCustomers_UserNotFound() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> customerController.getCustomers(testPrincipal));

        verify(userRepository).findByUsername("testuser");
    }
}
