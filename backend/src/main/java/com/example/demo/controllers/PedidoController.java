package com.example.demo.controllers;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.models.PedidoAluguel;
import com.example.demo.services.PedidoService;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    public record PedidoRequest(UUID automovelId) {}
    public record AvaliacaoRequest(String status) {}

    private final PedidoService service;

    public PedidoController(PedidoService service) {
        this.service = service;
    }

    // ----- Cliente -----

    @PostMapping
    @PreAuthorize("hasRole('CLIENTE')")
    @ResponseStatus(HttpStatus.CREATED)
    public PedidoAluguel criar(@AuthenticationPrincipal Jwt jwt, @RequestBody PedidoRequest req) {
        return service.criar(jwt.getSubject(), req.automovelId());
    }

    @GetMapping("/meus")
    @PreAuthorize("hasRole('CLIENTE')")
    public List<PedidoAluguel> meus(@AuthenticationPrincipal Jwt jwt) {
        return service.listarDoCliente(jwt.getSubject());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('CLIENTE')")
    public PedidoAluguel consultar(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        return service.consultar(jwt.getSubject(), id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('CLIENTE')")
    public PedidoAluguel modificar(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id,
                                   @RequestBody PedidoRequest req) {
        return service.modificar(jwt.getSubject(), id, req.automovelId());
    }

    @PutMapping("/{id}/cancelar")
    @PreAuthorize("hasRole('CLIENTE')")
    public PedidoAluguel cancelar(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        return service.cancelar(jwt.getSubject(), id);
    }

    // ----- Agente -----

    @GetMapping
    @PreAuthorize("hasRole('AGENTE')")
    public List<PedidoAluguel> todos() {
        return service.listarTodos();
    }

    @PutMapping("/{id}/avaliacao")
    @PreAuthorize("hasRole('AGENTE')")
    public PedidoAluguel avaliar(@PathVariable UUID id, @RequestBody AvaliacaoRequest req) {
        return service.avaliar(id, req.status());
    }
}