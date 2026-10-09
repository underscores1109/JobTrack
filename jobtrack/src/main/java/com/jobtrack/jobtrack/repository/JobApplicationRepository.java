
        package com.jobtrack.jobtrack.repository;
        import java.util.Optional;
import com.jobtrack.jobtrack.entity.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobApplicationRepository
        extends JpaRepository<JobApplication, Long> {

    List<JobApplication> findByUserEmail(String email);
    Optional<JobApplication> findByIdAndUserEmail(Long id, String email);
}