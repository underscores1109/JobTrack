
        package com.jobtrack.jobtrack.controller;

import com.jobtrack.jobtrack.entity.JobApplication;
import com.jobtrack.jobtrack.entity.User;
import com.jobtrack.jobtrack.repository.JobApplicationRepository;
import com.jobtrack.jobtrack.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class JobApplicationController {

    private final JobApplicationRepository repository;
    private final UserRepository userRepository;

    public JobApplicationController(
            JobApplicationRepository repository,
            UserRepository userRepository) {
        this.repository = repository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<JobApplication> getAllApplications(
            Authentication authentication) {
        return repository.findByUserEmail(authentication.getName());
    }

    @PostMapping
    public ResponseEntity<?> createApplication(
            @RequestBody JobApplication application,
            Authentication authentication) {

        User user = userRepository
                .findByEmail(authentication.getName())
                .orElse(null);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("User not found");
        }

        application.setId(null);
        application.setUser(user);

        JobApplication saved = repository.save(application);

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateApplication(
            @PathVariable Long id,
            @RequestBody JobApplication updatedApplication,
            Authentication authentication) {

        JobApplication existing = repository
                .findByIdAndUserEmail(id, authentication.getName())
                .orElse(null);

        if (existing == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Application not found");
        }

        existing.setCompany(updatedApplication.getCompany());
        existing.setPosition(updatedApplication.getPosition());
        existing.setStatus(updatedApplication.getStatus());
        existing.setAppliedDate(updatedApplication.getAppliedDate());

        return ResponseEntity.ok(repository.save(existing));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteApplication(
            @PathVariable Long id,
            Authentication authentication) {

        JobApplication existing = repository
                .findByIdAndUserEmail(id, authentication.getName())
                .orElse(null);

        if (existing == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Application not found");
        }

        repository.delete(existing);

        return ResponseEntity.ok("Application deleted successfully");
    }
}
