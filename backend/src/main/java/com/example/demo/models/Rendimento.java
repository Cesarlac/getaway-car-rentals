package com.example.demo.models;

import java.math.BigDecimal;

public class Rendimento {
    private String empregador;
    private BigDecimal valor;

    public String getEmpregador() { return empregador; }
    public void setEmpregador(String empregador) { this.empregador = empregador; }
    public BigDecimal getValor() { return valor; }
    public void setValor(BigDecimal valor) { this.valor = valor; }
}