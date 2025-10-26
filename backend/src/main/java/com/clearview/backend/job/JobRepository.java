package com.clearview.backend.job;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.clearview.backend.job.dto.RevenueDto;

import java.util.List;
import java.util.Optional;

public interface JobRepository extends JpaRepository<Job, Long> {

    List<Job> findByCreatedBy_Id(Long userId);

    Optional<Job> findByIdAndCreatedBy_Id(Long id, Long userId);

    @Query("SELECT new com.clearview.backend.job.dto.RevenueDto( " +
            "SUBSTRING(j.jobDate, 1, 7), " +
            "SUM(CASE WHEN j.paid = true THEN j.price ELSE 0 END), " +
            "SUM(CASE WHEN j.paid = false THEN j.price ELSE 0 END)) " +
            "FROM Job j " +
            "WHERE j.createdBy.id = :userId " +
            "GROUP BY SUBSTRING(j.jobDate, 1, 7) " +
            "ORDER BY SUBSTRING(j.jobDate, 1, 7)")
    List<RevenueDto> getRevenueByUserId(Long userId);

}
