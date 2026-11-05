package com.example.demo.controllers;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.models.ContratoCredito;
import com.example.demo.services.ContratoService;

@RestController
@RequestMapping("/api/contratos")
public class ContratoController {

    public record ContratoRequest(UUID pedidoId) {}

    private final ContratoService service;

    public ContratoController(ContratoService service) {
        this.service = service;
    }

    @PostMapping
    @PreAuthorize("hasRole('AGENTE')")
    @ResponseStatus(HttpStatus.CREATED)
    public ContratoCredito conceder(@AuthenticationPrincipal Jwt jwt, @RequestBody ContratoRequest req) {
        return service.conceder(jwt.getSubject(), req.pedidoId());
    }

    @GetMapping
    @PreAuthorize("hasRole('AGENTE')")
    public List<ContratoCredito> todos() {
        return service.listarTodos();
    }

    @GetMapping("/meus")
    @PreAuthorize("hasRole('CLIENTE')")
    public List<ContratoCredito> meus(@AuthenticationPrincipal Jwt jwt) {
        return service.listarDoCliente(jwt.getSubject());
    }
}