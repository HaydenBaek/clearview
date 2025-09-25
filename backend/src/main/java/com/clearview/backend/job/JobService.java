package com.clearview.backend.job;

import org.springframework.stereotype.Service;

import com.clearview.backend.job.dto.JobDto;
import com.clearview.backend.job.dto.JobRequest;

import java.util.List;
import java.util.Optional;

@Service
public class JobService {

    private final JobRepository jobRepository;

    public JobService(JobRepository jobRepository) {
        this.jobRepository = jobRepository;
    }

    public Optional<Job> getJobByIdAndUser(Long jobId, Long userId) {
        return jobRepository.findByIdAndCreatedBy_Id(jobId, userId);
    }

    public List<Job> getJobsByUser(Long userId) {
        return jobRepository.findByCreatedBy_Id(userId);
    }

    public Job createJob(Job job) {
        return jobRepository.save(job);
    }

    public Job updateJob(Job job) {
        return jobRepository.save(job); // save also updates if ID exists
    }

   public JobDto getJobById(Long id) {
    Job job = jobRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Job not found"));
    return JobDto.from(job); 
}

public JobDto updateJob(Long id, JobRequest request) {
    Job job = jobRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Job not found"));

    job.setService(request.service());
    job.setJobDate(request.jobDate());
    job.setPrice(request.price());
    job.setNotes(request.notes());
    job.setAddress(request.address());
    job.setCustomerName(request.customerName());

    jobRepository.save(job);
    return JobDto.from(job); 
}


public void deleteJob(Long id) {
    jobRepository.deleteById(id);
}
}
