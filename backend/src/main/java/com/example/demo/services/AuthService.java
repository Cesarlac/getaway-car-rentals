package com.example.demo.services;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.controllers.AuthDtos.LoginRequest;
import com.example.demo.controllers.AuthDtos.LoginResponse;
import com.example.demo.controllers.AuthDtos.RegistroRequest;
import com.example.demo.models.Agente;
import com.example.demo.models.Cliente;
import com.example.demo.models.Usuario;
import com.example.demo.repositories.AgenteRepository;
import com.example.demo.repositories.ClienteRepository;
import com.example.demo.repositories.UsuarioRepository;

@Service
public class AuthService {

    private final UsuarioRepository usuarios;
    private final ClienteRepository clientes;
    private final AgenteRepository agentes;
    private final PasswordEncoder encoder;
    private final JwtEncoder jwtEncoder;

    public AuthService(UsuarioRepository usuarios, ClienteRepository clientes,
                       AgenteRepository agentes, PasswordEncoder encoder, JwtEncoder jwtEncoder) {
        this.usuarios = usuarios;
        this.clientes = clientes;
        this.agentes = agentes;
        this.encoder = encoder;
        this.jwtEncoder = jwtEncoder;
    }

    @Transactional
    public void registrar(RegistroRequest req) {
        if (req.login() == null || req.login().isBlank()
                || req.senha() == null || req.senha().length() < 6) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Login e senha (mínimo 6 caracteres) são obrigatórios");
        }
        if (usuarios.existsByLogin(req.login())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Login já existe");
        }

        Usuario u = new Usuario();
        u.setLogin(req.login());
        u.setSenhaHash(encoder.encode(req.senha()));

        if ("Agente".equals(req.perfil())) {
            if (req.agente() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Dados do agente são obrigatórios");
            }
            Agente a = agentes.save(req.agente());
            u.setPerfil("Agente");
            u.setAgenteId(a.getId());
        } else {
            if (req.cliente() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Dados do cliente são obrigatórios");
            }
            if (req.cliente().getEmpregadoresRendimentos() != null
                    && req.cliente().getEmpregadoresRendimentos().size() > 3) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Máximo de 3 empregadores/rendimentos");
            }
            Cliente c = clientes.save(req.cliente());
            u.setPerfil("Cliente");
            u.setClienteId(c.getId());
        }
        usuarios.save(u);
    }

    public LoginResponse login(LoginRequest req) {
        Usuario u = usuarios.findByLogin(req.login())
                .filter(x -> encoder.matches(req.senha(), x.getSenhaHash()))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Login ou senha inválidos"));

        Instant agora = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .subject(u.getLogin())
                .issuedAt(agora)
                .expiresAt(agora.plus(2, ChronoUnit.HOURS))
                .claim("perfil", u.getPerfil().toUpperCase())
                .claim("usuarioId", u.getId().toString())
                .build();

        String token = jwtEncoder.encode(
                JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims))
                .getTokenValue();

        return new LoginResponse(token, u.getPerfil());
    }
}