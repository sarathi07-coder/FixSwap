package com.fixswap.backend.controller;

import com.fixswap.backend.dto.RegisterUserRequest;
import com.fixswap.backend.entity.AuthCredential;
import com.fixswap.backend.entity.enums.RoleType;
import com.fixswap.backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @GetMapping
    public ResponseEntity<List<AuthCredential>> getAllUsers() {
        return ResponseEntity.ok(authService.getAllUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AuthCredential> getUserById(@PathVariable UUID id) {
        return ResponseEntity.ok(authService.getUserById(id));
    }

    @GetMapping("/role/{role}")
    public ResponseEntity<List<AuthCredential>> getUsersByRole(@PathVariable String role) {
        return ResponseEntity.ok(authService.getUsersByRole(RoleType.valueOf(role)));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthCredential> registerUser(@RequestBody RegisterUserRequest request) {
        return ResponseEntity.ok(authService.registerUser(request));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> loginUser(@RequestBody Map<String, String> credentials) {
        String identifier = credentials.get("email") != null ? credentials.get("email") : credentials.get("phoneNumber");
        AuthCredential user = authService.loginUser(
            identifier, 
            credentials.get("password"),
            credentials.get("type")
        );
        return ResponseEntity.ok(authService.getLoginResponse(user));
    }

    @PostMapping("/logout/{userId}")
    public ResponseEntity<String> logoutUser(@PathVariable UUID userId) {
        authService.logoutUser(userId);
        return ResponseEntity.ok("Logged out successfully");
    }
}
