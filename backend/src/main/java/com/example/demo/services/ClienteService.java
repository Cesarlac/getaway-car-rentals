package com.example.demo.services;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.example.demo.models.Cliente;
import com.example.demo.repositories.ClienteRepository;

@Service
public class ClienteService {

    private final ClienteRepository repository;

    public ClienteService(ClienteRepository repository) {
        this.repository = repository;
    }

    public List<Cliente> listar() {
        return repository.findAll();
    }

    public Cliente buscar(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));
    }

    public Cliente criar(Cliente cliente) {
        return repository.save(cliente);
    }

    public Cliente atualizar(UUID id, Cliente dados) {
        Cliente c = buscar(id);
        c.setCpf(dados.getCpf());
        c.setRg(dados.getRg());
        c.setNome(dados.getNome());
        c.setEndereco(dados.getEndereco());
        c.setProfissao(dados.getProfissao());
        c.setEmpregadoresRendimentos(dados.getEmpregadoresRendimentos());
        return repository.save(c);
    }

    public void excluir(UUID id) {
        repository.deleteById(id);
    }
}