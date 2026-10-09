
        package com.jobtrack.jobtrack.controller;

import com.jobtrack.jobtrack.dto.UserResponse;
import com.jobtrack.jobtrack.entity.User;
import com.jobtrack.jobtrack.repository.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;

    public UserController(
            UserRepository repository,
            PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping
    public UserResponse createUser(@RequestBody User user) {

        // Hash the password before saving
        user.setPassword(
                passwordEncoder.encode(user.getPassword())
        );

        // Save user in the database
        User savedUser = repository.save(user);

        // Return user details without the password
        return new UserResponse(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail()
        );
    }
}