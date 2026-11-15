package com.example.demo.models;

import java.math.BigDecimal;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "automoveis")
public class Automovel {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true)
    private String matricula;

    @Column(unique = true)
    private String placa;

    private String marca;
    private String modelo;
    private String ano;

    @Column(name = "tipo_proprietario")
    private String tipoProprietario; // "Cliente", "Empresa" ou "Banco"

    private BigDecimal valor;
    private String motor;
    private Integer cv;
    private String torque;
    private String transmissao;
    private String tracao;
    private String aceleracao;

    @Column(name = "velocidade_maxima")
    private String velocidadeMaxima;

    private String equipamentos; // um item por linha (opcional)
    private Boolean destaque = false;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getMatricula() { return matricula; }
    public void setMatricula(String matricula) { this.matricula = matricula; }
    public String getPlaca() { return placa; }
    public void setPlaca(String placa) { this.placa = placa; }
    public String getMarca() { return marca; }
    public void setMarca(String marca) { this.marca = marca; }
    public String getModelo() { return modelo; }
    public void setModelo(String modelo) { this.modelo = modelo; }
    public String getAno() { return ano; }
    public void setAno(String ano) { this.ano = ano; }
    public String getTipoProprietario() { return tipoProprietario; }
    public void setTipoProprietario(String tipoProprietario) { this.tipoProprietario = tipoProprietario; }
    public BigDecimal getValor() { return valor; }
    public void setValor(BigDecimal valor) { this.valor = valor; }
    public String getMotor() { return motor; }
    public void setMotor(String motor) { this.motor = motor; }
    public Integer getCv() { return cv; }
    public void setCv(Integer cv) { this.cv = cv; }
    public String getTorque() { return torque; }
    public void setTorque(String torque) { this.torque = torque; }
    public String getTransmissao() { return transmissao; }
    public void setTransmissao(String transmissao) { this.transmissao = transmissao; }
    public String getTracao() { return tracao; }
    public void setTracao(String tracao) { this.tracao = tracao; }
    public String getAceleracao() { return aceleracao; }
    public void setAceleracao(String aceleracao) { this.aceleracao = aceleracao; }
    public String getVelocidadeMaxima() { return velocidadeMaxima; }
    public void setVelocidadeMaxima(String velocidadeMaxima) { this.velocidadeMaxima = velocidadeMaxima; }
    public String getEquipamentos() { return equipamentos; }
    public void setEquipamentos(String equipamentos) { this.equipamentos = equipamentos; }
    public Boolean getDestaque() { return destaque; }
    public void setDestaque(Boolean destaque) { this.destaque = destaque; }
}
