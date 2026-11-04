package com.example.demo.repositories;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.models.PedidoAluguel;

public interface PedidoAluguelRepository extends JpaRepository<PedidoAluguel, UUID> {
    List<PedidoAluguel> findByClienteIdOrderByDataCriacaoDesc(UUID clienteId);
    List<PedidoAluguel> findAllByOrderByDataCriacaoDesc();
}