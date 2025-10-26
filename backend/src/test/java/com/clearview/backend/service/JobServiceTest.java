package com.clearview.backend.service;

import com.clearview.backend.customer.Customer;
import com.clearview.backend.job.Job;
import com.clearview.backend.job.JobController;
import com.clearview.backend.job.JobRepository;
import com.clearview.backend.job.JobService;
import com.clearview.backend.job.dto.JobDto;
import com.clearview.backend.job.dto.JobRequest;
import com.clearview.backend.job.dto.RevenueDto;
import com.clearview.backend.user.User;
import com.clearview.backend.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import java.security.Principal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JobControllerServiceTest {

    @Mock
    private JobRepository jobRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private JobService jobService;

    @InjectMocks
    private JobController jobController;

    private User testUser;
    private Job testJob;
    private JobRequest testJobRequest;
    private Principal testPrincipal;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");

        testJob = new Job();
        testJob.setId(1L);
        testJob.setService("Window Cleaning");
        testJob.setJobDate("2025-09-01");
        testJob.setPrice(100.0);
        testJob.setNotes("Test job");
        testJob.setCustomerName("John Doe");
        testJob.setAddress("123 Main St");
        testJob.setPaid(false);
        testJob.setCreatedBy(testUser);

        testJobRequest = new JobRequest(
                "Window Cleaning",
                "2025-09-01",
                100.0,
                "Test job",
                null,
                "John Doe",
                "123 Main St");

        testPrincipal = () -> "testuser";
    }

    // JobService Tests
    @Test
    void testGetJobByIdAndUser_Success() {
        when(jobRepository.findByIdAndCreatedBy_Id(1L, 1L)).thenReturn(Optional.of(testJob));

        Optional<Job> result = jobService.getJobByIdAndUser(1L, 1L);

        assertTrue(result.isPresent());
        assertEquals(testJob, result.get());
        verify(jobRepository).findByIdAndCreatedBy_Id(1L, 1L);
    }

    @Test
    void testGetJobByIdAndUser_NotFound() {
        when(jobRepository.findByIdAndCreatedBy_Id(1L, 1L)).thenReturn(Optional.empty());

        Optional<Job> result = jobService.getJobByIdAndUser(1L, 1L);

        assertFalse(result.isPresent());
        verify(jobRepository).findByIdAndCreatedBy_Id(1L, 1L);
    }

    @Test
    void testGetJobsByUser_Success() {
        when(jobRepository.findByCreatedBy_Id(1L)).thenReturn(List.of(testJob));

        List<Job> result = jobService.getJobsByUser(1L);

        assertEquals(1, result.size());
        assertEquals(testJob, result.get(0));
        verify(jobRepository).findByCreatedBy_Id(1L);
    }

    @Test
    void testCreateJob_Success() {
        when(jobRepository.save(any(Job.class))).thenReturn(testJob);

        Job result = jobService.createJob(testJob);

        assertEquals(testJob, result);
        verify(jobRepository).save(testJob);
    }

    @Test
    void testUpdateJob_Success() {
        when(jobRepository.save(any(Job.class))).thenReturn(testJob);

        Job result = jobService.updateJob(testJob);

        assertEquals(testJob, result);
        verify(jobRepository).save(testJob);
    }

    @Test
    void testGetJobById_Success() {
        when(jobRepository.findById(1L)).thenReturn(Optional.of(testJob));

        JobDto result = jobService.getJobById(1L);

        assertEquals(testJob.getId(), result.id());
        assertEquals(testJob.getService(), result.service());
        verify(jobRepository).findById(1L);
    }

    @Test
    void testGetJobById_NotFound() {
        when(jobRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> jobService.getJobById(1L));
        verify(jobRepository).findById(1L);
    }

    @Test
    void testUpdateJobById_Success() {
        when(jobRepository.findById(1L)).thenReturn(Optional.of(testJob));
        when(jobRepository.save(any(Job.class))).thenReturn(testJob);

        JobDto result = jobService.updateJob(1L, testJobRequest);

        assertEquals(testJob.getId(), result.id());
        assertEquals(testJobRequest.service(), result.service());
        verify(jobRepository).findById(1L);
        verify(jobRepository).save(any(Job.class));
    }

    @Test
    void testUpdateJobById_NotFound() {
        when(jobRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> jobService.updateJob(1L, testJobRequest));
        verify(jobRepository).findById(1L);
    }

    @Test
    void testDeleteJob_Success() {
        doNothing().when(jobRepository).deleteById(1L);

        jobService.deleteJob(1L);

        verify(jobRepository).deleteById(1L);
    }

    @Test
    void testGetRevenueForUser_Success() {
        // Arrange
        JobRepository jobRepository = mock(JobRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        JobService jobService = new JobService(jobRepository, userRepository);

        Authentication auth = mock(Authentication.class);
        when(auth.getName()).thenReturn("hayden");

        User mockUser = new User();
        mockUser.setId(1L);
        mockUser.setUsername("hayden");
        when(userRepository.findByUsername("hayden")).thenReturn(Optional.of(mockUser));

        RevenueDto revenueDto = new RevenueDto("2025-09", 100.0, 50.0);
        when(jobRepository.getRevenueByUserId(1L)).thenReturn(List.of(revenueDto));

        // Act
        List<RevenueDto> result = jobService.getRevenueForUser(auth);

        // Assert
        assertEquals(1, result.size());
        assertEquals("2025-09", result.get(0).getMonth());
        assertEquals(100.0, result.get(0).getPaid());
        assertEquals(50.0, result.get(0).getUnpaid());

        verify(userRepository).findByUsername("hayden");
        verify(jobRepository).getRevenueByUserId(1L);
    }

}