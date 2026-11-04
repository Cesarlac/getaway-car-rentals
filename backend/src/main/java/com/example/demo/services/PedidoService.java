package com.example.demo.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.models.Automovel;
import com.example.demo.models.Cliente;
import com.example.demo.models.PedidoAluguel;
import com.example.demo.models.Usuario;
import com.example.demo.repositories.AutomovelRepository;
import com.example.demo.repositories.ClienteRepository;
import com.example.demo.repositories.PedidoAluguelRepository;
import com.example.demo.repositories.UsuarioRepository;

@Service
public class PedidoService {

    private final PedidoAluguelRepository pedidos;
    private final UsuarioRepository usuarios;
    private final ClienteRepository clientes;
    private final AutomovelRepository automoveis;

    public PedidoService(PedidoAluguelRepository pedidos, UsuarioRepository usuarios,
                         ClienteRepository clientes, AutomovelRepository automoveis) {
        this.pedidos = pedidos;
        this.usuarios = usuarios;
        this.clientes = clientes;
        this.automoveis = automoveis;
    }

    private UUID clienteIdDe(String login) {
        return usuarios.findByLogin(login)
                .map(Usuario::getClienteId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.FORBIDDEN, "Usuário não é um cliente"));
    }

    private PedidoAluguel pedidoDoCliente(UUID id, String login) {
        UUID clienteId = clienteIdDe(login);
        PedidoAluguel p = pedidos.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido não encontrado"));
        if (!p.getCliente().getId().equals(clienteId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido não encontrado");
        }
        return p;
    }

    private void exigirPendente(PedidoAluguel p) {
        if (!"Pendente".equals(p.getStatusFinanceiro())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Só é possível alterar pedidos com status Pendente");
        }
    }

    private Automovel buscarAutomovel(UUID id) {
        return automoveis.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Automóvel não encontrado"));
    }

    // ---------- Cliente ----------

    @Transactional
    public PedidoAluguel criar(String login, UUID automovelId) {
        Cliente cliente = clientes.findById(clienteIdDe(login)).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente não encontrado"));
        PedidoAluguel p = new PedidoAluguel();
        p.setCliente(cliente);
        p.setAutomovel(buscarAutomovel(automovelId));
        p.setStatusFinanceiro("Pendente");
        p.setDataCriacao(LocalDateTime.now());
        return pedidos.save(p);
    }

    public List<PedidoAluguel> listarDoCliente(String login) {
        return pedidos.findByClienteIdOrderByDataCriacaoDesc(clienteIdDe(login));
    }

    public PedidoAluguel consultar(String login, UUID id) {
        return pedidoDoCliente(id, login);
    }

    @Transactional
    public PedidoAluguel modificar(String login, UUID id, UUID novoAutomovelId) {
        PedidoAluguel p = pedidoDoCliente(id, login);
        exigirPendente(p);
        p.setAutomovel(buscarAutomovel(novoAutomovelId));
        return pedidos.save(p);
    }

    @Transactional
    public PedidoAluguel cancelar(String login, UUID id) {
        PedidoAluguel p = pedidoDoCliente(id, login);
        exigirPendente(p);
        p.setStatusFinanceiro("Cancelado");
        return pedidos.save(p);
    }

    // ---------- Agente ----------

    public List<PedidoAluguel> listarTodos() {
        return pedidos.findAllByOrderByDataCriacaoDesc();
    }

    @Transactional
    public PedidoAluguel avaliar(UUID id, String status) {
        if (!"Aprovado".equals(status) && !"Reprovado".equals(status)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Status deve ser Aprovado ou Reprovado");
        }
        PedidoAluguel p = pedidos.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido não encontrado"));
        exigirPendente(p);
        p.setStatusFinanceiro(status);
        return pedidos.save(p);
    }

    
}