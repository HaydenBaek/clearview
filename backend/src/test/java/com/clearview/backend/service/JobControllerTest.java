package com.clearview.backend.service;

import com.clearview.backend.job.Job;
import com.clearview.backend.job.JobController;
import com.clearview.backend.job.JobService;
import com.clearview.backend.job.dto.JobDto;
import com.clearview.backend.job.dto.JobRequest;
import com.clearview.backend.job.dto.RevenueDto;
import com.clearview.backend.user.User;
import com.clearview.backend.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import java.security.Principal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class JobControllerTest {

    @Mock
    private JobService jobService;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private JobController jobController;

    private User testUser;
    private Job testJob;
    private JobRequest testJobRequest;
    private Principal testPrincipal;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);

        // Fake user
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");

        // Fake job
        testJob = new Job();
        testJob.setId(1L);
        testJob.setCustomerName("Customer A");
        testJob.setAddress("123 Street");
        testJob.setJobDate("2025-09-01");
        testJob.setPaid(true);
        testJob.setInvoiceNumber("INV-1");
        testJob.setPrice(100.0);

        // Fake request
        testJobRequest = new JobRequest(
                "Window Cleaning",
                "2025-09-01",
                100.0,
                "Test job",
                null,
                "Customer A",
                "123 Street"
        );

        // Fake principal
        testPrincipal = () -> "testuser";
    }

    @Test
    void testGetAllJobs_Success() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(jobService.getJobsByUser(1L)).thenReturn(List.of(testJob));

        ResponseEntity<List<JobDto>> response = jobController.getAllJobs(testPrincipal);

        assertEquals(200, response.getStatusCode().value());
        assertEquals(1, response.getBody().size());
        assertEquals(testJob.getId(), response.getBody().get(0).id());
        verify(userRepository).findByUsername("testuser");
        verify(jobService).getJobsByUser(1L);
    }

    @Test
    void testGetAllJobs_UserNotFound() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> jobController.getAllJobs(testPrincipal));
        verify(userRepository).findByUsername("testuser");
    }

    @Test
    void testCreateJob_Success() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(jobService.createJob(any(Job.class))).thenReturn(testJob);

        ResponseEntity<JobDto> response = jobController.createJob(testJobRequest, testPrincipal);

        assertEquals(200, response.getStatusCode().value());
        assertEquals(testJob.getId(), response.getBody().id());
        verify(userRepository).findByUsername("testuser");
        verify(jobService).createJob(any(Job.class));
    }

    @Test
    void testCreateJob_UserNotFound() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> jobController.createJob(testJobRequest, testPrincipal));
        verify(userRepository).findByUsername("testuser");
    }

    @Test
    void testMarkJobAsPaid_Success() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(jobService.getJobByIdAndUser(1L, 1L)).thenReturn(Optional.of(testJob));
        when(jobService.updateJob(any(Job.class))).thenReturn(testJob);

        ResponseEntity<JobDto> response = jobController.markJobAsPaid(1L, testPrincipal);

        assertEquals(200, response.getStatusCode().value());
        assertTrue(response.getBody().paid());
        assertEquals("INV-1", response.getBody().invoiceNumber());
        verify(userRepository).findByUsername("testuser");
        verify(jobService).getJobByIdAndUser(1L, 1L);
        verify(jobService).updateJob(any(Job.class));
    }

    @Test
    void testMarkJobAsPaid_JobNotFound() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(jobService.getJobByIdAndUser(1L, 1L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> jobController.markJobAsPaid(1L, testPrincipal));
        verify(userRepository).findByUsername("testuser");
        verify(jobService).getJobByIdAndUser(1L, 1L);
    }

    @Test
    void testGetJobById_Success() {
        when(jobService.getJobById(1L)).thenReturn(JobDto.from(testJob));

        ResponseEntity<JobDto> response = jobController.getJobById(1L);

        assertEquals(200, response.getStatusCode().value());
        assertEquals(testJob.getId(), response.getBody().id());
        verify(jobService).getJobById(1L);
    }

    @Test
    void testUpdateJob_Success() {
        when(jobService.updateJob(1L, testJobRequest)).thenReturn(JobDto.from(testJob));

        ResponseEntity<JobDto> response = jobController.updateJob(1L, testJobRequest);

        assertEquals(200, response.getStatusCode().value());
        assertEquals(testJob.getId(), response.getBody().id());
        verify(jobService).updateJob(1L, testJobRequest);
    }

    @Test
    void testDeleteJob_Success() {
        doNothing().when(jobService).deleteJob(1L);

        ResponseEntity<Void> response = jobController.deleteJob(1L);

        assertEquals(204, response.getStatusCode().value());
        verify(jobService).deleteJob(1L);
    }

      @Test
    void testGetRevenue_Success() {
        JobService jobService = mock(JobService.class);
        JobController jobController = new JobController(jobService, null);

        Authentication auth = mock(Authentication.class);
        RevenueDto dto = new RevenueDto("2025-09", 120.0, 80.0);
        when(jobService.getRevenueForUser(auth)).thenReturn(List.of(dto));

        List<RevenueDto> result = jobController.getRevenue(auth);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(dto, result.get(0));

        verify(jobService).getRevenueForUser(auth);
    }
}
