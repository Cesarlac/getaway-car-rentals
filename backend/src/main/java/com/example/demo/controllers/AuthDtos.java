package com.example.demo.controllers;

import com.example.demo.models.Agente;
import com.example.demo.models.Cliente;

public class AuthDtos {
    public record LoginRequest(String login, String senha) {}
    public record LoginResponse(String token, String perfil) {}
    public record RegistroRequest(String login, String senha, String perfil,
                                  Cliente cliente, Agente agente) {}
}