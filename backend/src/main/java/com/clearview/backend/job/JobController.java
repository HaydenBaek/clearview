package com.clearview.backend.job;

import com.clearview.backend.customer.Customer;
import com.clearview.backend.job.dto.JobDto;
import com.clearview.backend.job.dto.JobRequest;
import com.clearview.backend.job.dto.RevenueDto;
import com.clearview.backend.user.User;
import com.clearview.backend.user.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private final JobService jobService;
    private final UserRepository userRepository;

    public JobController(JobService jobService, UserRepository userRepository) {
        this.jobService = jobService;
        this.userRepository = userRepository;
    }

    // === Get all jobs for logged-in user ===
    @GetMapping
    public ResponseEntity<List<JobDto>> getAllJobs(Principal principal) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(
                jobService.getJobsByUser(user.getId())
                        .stream()
                        .map(JobDto::from)
                        .toList());
    }

    // === Create new job ===
    @PostMapping
    public ResponseEntity<JobDto> createJob(@RequestBody JobRequest jobRequest, Principal principal) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Job job = new Job();
        job.setService(jobRequest.service() != null ? jobRequest.service() : "Window Cleaning");
        job.setJobDate(jobRequest.jobDate());
        job.setPrice(jobRequest.price());
        job.setNotes(jobRequest.notes());
        job.setCreatedBy(user);

        // If coming from customer tab → link relation
        if (jobRequest.customerId() != null) {
            Customer customer = new Customer();
            customer.setId(jobRequest.customerId());
            job.setCustomer(customer);
        } else {
            // Manual entry
            job.setCustomerName(jobRequest.customerName());
            job.setAddress(jobRequest.address());
        }

        return ResponseEntity.ok(JobDto.from(jobService.createJob(job)));
    }

    // === Mark job as paid ===
    @PatchMapping("/{id}/mark-paid")
    public ResponseEntity<JobDto> markJobAsPaid(@PathVariable Long id, Principal principal) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Job job = jobService.getJobByIdAndUser(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Job not found or unauthorized"));

        job.setPaid(true);
        job.setInvoiceNumber("INV-" + job.getId());

        return ResponseEntity.ok(JobDto.from(jobService.updateJob(job)));
    }

    // === Get job by ID ===
    @GetMapping("/{id}")
    public ResponseEntity<JobDto> getJobById(@PathVariable Long id) {
        return ResponseEntity.ok(jobService.getJobById(id));
    }

    // === Update job ===
    @PutMapping("/{id}")
    public ResponseEntity<JobDto> updateJob(@PathVariable Long id, @RequestBody JobRequest request) {
        return ResponseEntity.ok(jobService.updateJob(id, request));
    }

    // === Delete job ===
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJob(@PathVariable Long id) {
        jobService.deleteJob(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/revenue")
    public List<RevenueDto> getRevenue(Authentication auth) {
        return jobService.getRevenueForUser(auth);
    }

}
