package com.example.demo.models;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "contratos_credito")
public class ContratoCredito {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "pedido_id")
    private PedidoAluguel pedido;

    @ManyToOne
    @JoinColumn(name = "banco_agente_id")
    private Agente bancoAgente;

    @Column(name = "data_concessao")
    private LocalDateTime dataConcessao;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public PedidoAluguel getPedido() { return pedido; }
    public void setPedido(PedidoAluguel pedido) { this.pedido = pedido; }
    public Agente getBancoAgente() { return bancoAgente; }
    public void setBancoAgente(Agente bancoAgente) { this.bancoAgente = bancoAgente; }
    public LocalDateTime getDataConcessao() { return dataConcessao; }
    public void setDataConcessao(LocalDateTime dataConcessao) { this.dataConcessao = dataConcessao; }
}