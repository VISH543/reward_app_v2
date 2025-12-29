package com.cesportal.service;

import com.cesportal.entity.User;
import com.cesportal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {
    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    public List<User> getAllCESUsers() {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.CES_USER)
                .collect(Collectors.toList());
    }

    public User createCESUser(User user) {
        user.setRole(User.Role.CES_USER);
        user.setPassword(encoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public void deleteCESUser(Long id, String currentUsername) {
        userRepository.findById(id).ifPresent(user -> {
            if (!user.getUsername().equals(currentUsername)) {
                userRepository.delete(user);
            } else {
                throw new RuntimeException("Admin cannot delete himself");
            }
        });
    }
}
