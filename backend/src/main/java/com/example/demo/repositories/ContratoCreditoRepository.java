package com.example.demo.repositories;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.models.ContratoCredito;

public interface ContratoCreditoRepository extends JpaRepository<ContratoCredito, UUID> {
    boolean existsByPedidoIdAndBancoAgenteId(UUID pedidoId, UUID bancoAgenteId);
    List<ContratoCredito> findByPedidoId(UUID pedidoId);
    List<ContratoCredito> findByPedidoClienteId(UUID clienteId);
    List<ContratoCredito> findAllByOrderByDataConcessaoDesc();
}
