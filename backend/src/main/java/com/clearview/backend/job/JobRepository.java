package com.clearview.backend.job;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface JobRepository extends JpaRepository<Job, Long> {
    // find all jobs created by a given user
    List<Job> findByCreatedBy_Id(Long userId);

    Optional<Job> findByIdAndCreatedBy_Id(Long id, Long userId);

}
