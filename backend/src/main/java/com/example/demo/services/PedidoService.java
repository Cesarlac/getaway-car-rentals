package com.example.demo.services;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.models.Agente;
import com.example.demo.models.Automovel;
import com.example.demo.models.Cliente;
import com.example.demo.models.ContratoCredito;
import com.example.demo.models.PedidoAluguel;
import com.example.demo.models.Usuario;
import com.example.demo.repositories.AgenteRepository;
import com.example.demo.repositories.AutomovelRepository;
import com.example.demo.repositories.ClienteRepository;
import com.example.demo.repositories.ContratoCreditoRepository;
import com.example.demo.repositories.PedidoAluguelRepository;
import com.example.demo.repositories.UsuarioRepository;

@Service
public class PedidoService {

    /** Diária = 0,3% do valor do veículo. */
    private static final BigDecimal TAXA_DIARIA = new BigDecimal("0.003");
    private static final long MAX_DIAS = 365;

    private final PedidoAluguelRepository pedidos;
    private final UsuarioRepository usuarios;
    private final ClienteRepository clientes;
    private final AutomovelRepository automoveis;
    private final AgenteRepository agentes;
    private final ContratoCreditoRepository contratos;

    public PedidoService(PedidoAluguelRepository pedidos, UsuarioRepository usuarios,
                         ClienteRepository clientes, AutomovelRepository automoveis,
                         AgenteRepository agentes, ContratoCreditoRepository contratos) {
        this.pedidos = pedidos;
        this.usuarios = usuarios;
        this.clientes = clientes;
        this.automoveis = automoveis;
        this.agentes = agentes;
        this.contratos = contratos;
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
        if (id == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe o automóvel");
        }
        return automoveis.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Automóvel não encontrado"));
    }

    /** Valida o período e calcula o valor total (diária x dias) no servidor. */
    private void aplicarPeriodo(PedidoAluguel p, Automovel a, LocalDate inicio, LocalDate fim) {
        if (inicio == null || fim == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe o período do aluguel");
        }
        if (inicio.isBefore(LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "A data de início não pode estar no passado");
        }
        long dias = ChronoUnit.DAYS.between(inicio, fim);
        if (dias < 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "A data final deve ser posterior à data inicial");
        }
        if (dias > MAX_DIAS) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "O período máximo é de " + MAX_DIAS + " dias");
        }
        if (a.getValor() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Automóvel sem valor cadastrado");
        }
        BigDecimal total = a.getValor()
                .multiply(TAXA_DIARIA)
                .multiply(BigDecimal.valueOf(dias))
                .setScale(2, RoundingMode.HALF_UP);

        p.setAutomovel(a);
        p.setDataInicio(inicio);
        p.setDataFim(fim);
        p.setValorTotal(total);
    }

    // ---------- Cliente ----------

    @Transactional
    public PedidoAluguel criar(String login, UUID automovelId, LocalDate inicio, LocalDate fim) {
        Cliente cliente = clientes.findById(clienteIdDe(login)).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente não encontrado"));
        PedidoAluguel p = new PedidoAluguel();
        p.setCliente(cliente);
        aplicarPeriodo(p, buscarAutomovel(automovelId), inicio, fim);
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
    public PedidoAluguel modificar(String login, UUID id, UUID novoAutomovelId,
                                   LocalDate inicio, LocalDate fim) {
        PedidoAluguel p = pedidoDoCliente(id, login);
        exigirPendente(p);
        aplicarPeriodo(p, buscarAutomovel(novoAutomovelId), inicio, fim);
        // O crédito foi concedido para o carro e o valor anteriores: a alteração o invalida.
        contratos.deleteAll(contratos.findByPedidoId(id));
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

    /**
     * Avaliação financeira do pedido, feita só por empresas. Ao aprovar, a empresa pode
     * indicar quais créditos já concedidos por bancos serão utilizados; sem indicar
     * nenhum, o pedido é aprovado diretamente, sem crédito.
     */
    @Transactional
    public PedidoAluguel avaliar(String login, UUID id, String status, List<UUID> creditosIds) {
        boolean empresa = usuarios.findByLogin(login)
                .map(Usuario::getAgenteId)
                .flatMap(agentes::findById)
                .map(Agente::getTipo)
                .filter("Empresa"::equals)
                .isPresent();
        if (!empresa) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Apenas empresas podem avaliar pedidos");
        }
        if (!"Aprovado".equals(status) && !"Reprovado".equals(status)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Status deve ser Aprovado ou Reprovado");
        }
        PedidoAluguel p = pedidos.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido não encontrado"));
        exigirPendente(p);

        if ("Aprovado".equals(status) && creditosIds != null) {
            for (UUID creditoId : creditosIds) {
                ContratoCredito c = contratos.findById(creditoId)
                        .filter(x -> x.getPedido().getId().equals(id))
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.BAD_REQUEST, "Crédito não pertence a este pedido"));
                c.setUtilizado(true);
                contratos.save(c);
            }
        }

        p.setStatusFinanceiro(status);
        return pedidos.save(p);
    }
}
