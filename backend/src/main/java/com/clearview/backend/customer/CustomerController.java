package com.clearview.backend.customer;

import com.clearview.backend.customer.dto.CustomerDto;
import com.clearview.backend.user.User;
import com.clearview.backend.user.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;
    private final UserRepository userRepository;

    public CustomerController(CustomerService customerService, UserRepository userRepository) {
        this.customerService = customerService;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<Customer> createCustomer(@RequestBody Customer customer, Principal principal) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        customer.setCreatedBy(user);
        Customer saved = customerService.createCustomer(customer);
        return ResponseEntity.ok(saved);
    }

    @GetMapping
public ResponseEntity<List<CustomerDto>> getCustomers(Principal principal) {
    User user = userRepository.findByUsername(principal.getName())
        .orElseThrow(() -> new RuntimeException("User not found"));

    List<CustomerDto> customers = customerService.getCustomersByUser(user.getId())
        .stream()
        .map(CustomerDto::from)
        .toList();

    return ResponseEntity.ok(customers);
}

}
