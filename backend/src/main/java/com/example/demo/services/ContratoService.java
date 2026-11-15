package com.example.demo.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.models.Agente;
import com.example.demo.models.ContratoCredito;
import com.example.demo.models.PedidoAluguel;
import com.example.demo.models.Usuario;
import com.example.demo.repositories.AgenteRepository;
import com.example.demo.repositories.ContratoCreditoRepository;
import com.example.demo.repositories.PedidoAluguelRepository;
import com.example.demo.repositories.UsuarioRepository;

@Service
public class ContratoService {

    private final ContratoCreditoRepository contratos;
    private final PedidoAluguelRepository pedidos;
    private final UsuarioRepository usuarios;
    private final AgenteRepository agentes;

    public ContratoService(ContratoCreditoRepository contratos, PedidoAluguelRepository pedidos,
                           UsuarioRepository usuarios, AgenteRepository agentes) {
        this.contratos = contratos;
        this.pedidos = pedidos;
        this.usuarios = usuarios;
        this.agentes = agentes;
    }

    /**
     * O banco concede crédito a um pedido ainda Pendente. Vários bancos podem conceder
     * crédito ao mesmo pedido (um contrato por banco); a empresa decide, ao aprovar,
     * quais créditos serão utilizados.
     */
    @Transactional
    public ContratoCredito conceder(String login, UUID pedidoId) {
        UUID agenteId = usuarios.findByLogin(login)
                .map(Usuario::getAgenteId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Usuário não é um agente"));
        Agente banco = agentes.findById(agenteId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Agente não encontrado"));
        if (!"Banco".equals(banco.getTipo())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Apenas bancos podem conceder crédito");
        }

        PedidoAluguel pedido = pedidos.findById(pedidoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido não encontrado"));
        if (!"Pendente".equals(pedido.getStatusFinanceiro())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Só é possível conceder crédito a pedidos Pendentes");
        }
        if (contratos.existsByPedidoIdAndBancoAgenteId(pedidoId, banco.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Este banco já concedeu crédito a este pedido");
        }

        ContratoCredito c = new ContratoCredito();
        c.setPedido(pedido);
        c.setBancoAgente(banco);
        c.setDataConcessao(LocalDateTime.now());
        c.setUtilizado(false);
        return contratos.save(c);
    }

    public List<ContratoCredito> listarTodos() {
        return contratos.findAllByOrderByDataConcessaoDesc();
    }

    public List<ContratoCredito> listarDoCliente(String login) {
        UUID clienteId = usuarios.findByLogin(login)
                .map(Usuario::getClienteId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Usuário não é um cliente"));
        return contratos.findByPedidoClienteId(clienteId);
    }
}
