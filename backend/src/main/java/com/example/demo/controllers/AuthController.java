package com.example.demo.controllers;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.controllers.AuthDtos.LoginRequest;
import com.example.demo.controllers.AuthDtos.LoginResponse;
import com.example.demo.controllers.AuthDtos.RegistroRequest;
import com.example.demo.services.AuthService;

@RestController
public class AuthController {

    private final AuthService service;

    public AuthController(AuthService service) {
        this.service = service;
    }

    @PostMapping("/api/auth/registrar")
    @ResponseStatus(HttpStatus.CREATED)
    public void registrar(@RequestBody RegistroRequest req) {
        service.registrar(req);
    }

    @PostMapping("/api/auth/login")
    public LoginResponse login(@RequestBody LoginRequest req) {
        return service.login(req);
    }

    @GetMapping("/api/me")
    public Map<String, String> me(@AuthenticationPrincipal Jwt jwt) {
        return Map.of("login", jwt.getSubject(), "perfil", jwt.getClaimAsString("perfil"));
    }
}