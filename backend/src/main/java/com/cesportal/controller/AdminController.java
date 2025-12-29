package com.cesportal.controller;

import com.cesportal.entity.User;
import com.cesportal.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN_CES')")
public class AdminController {
    @Autowired
    AdminService adminService;

    @GetMapping("/users")
    public List<User> getCESUsers() {
        return adminService.getAllCESUsers();
    }

    @PostMapping("/users")
    public User createCESUser(@RequestBody User user) {
        return adminService.createCESUser(user);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteCESUser(@PathVariable Long id, Authentication authentication) {
        try {
            adminService.deleteCESUser(id, authentication.getName());
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
