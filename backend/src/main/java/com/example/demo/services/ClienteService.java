package com.example.demo.services;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.models.Cliente;
import com.example.demo.repositories.ClienteRepository;

@Service
public class ClienteService {

    private final ClienteRepository repository;

    public ClienteService(ClienteRepository repository) {
        this.repository = repository;
    }

    private void validar(Cliente c) {
        if (c.getEmpregadoresRendimentos() != null && c.getEmpregadoresRendimentos().size() > 3) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Máximo de 3 empregadores/rendimentos");
        }
    }

    public List<Cliente> listar() {
        return repository.findAll();
    }

    public Cliente buscar(UUID id) {
        return repository.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente não encontrado"));
    }

    public Cliente criar(Cliente cliente) {
        validar(cliente);
        return repository.save(cliente);
    }

    public Cliente atualizar(UUID id, Cliente dados) {
        validar(dados);
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
        buscar(id);
        repository.deleteById(id);
    }
}