# Diagrama de Classes

## 1. Modelo de domínio (entidades)

Corresponde às classes do pacote `com.example.demo.models` e às tabelas do Supabase.

```mermaid
classDiagram
    direction LR

    class Cliente {
        -UUID id
        -String cpf
        -String rg
        -String nome
        -String endereco
        -String profissao
        -List~Rendimento~ empregadoresRendimentos
    }

    class Rendimento {
        -String empregador
        -BigDecimal valor
    }

    class Agente {
        -UUID id
        -String nome
        -String tipo
    }

    class Automovel {
        -UUID id
        -String matricula
        -String placa
        -String marca
        -String modelo
        -String ano
        -String tipoProprietario
    }

    class PedidoAluguel {
        -UUID id
        -String statusFinanceiro
        -LocalDateTime dataCriacao
    }

    class ContratoCredito {
        -UUID id
        -LocalDateTime dataConcessao
    }

    class Usuario {
        -UUID id
        -String login
        -String senhaHash
        -String perfil
        -UUID clienteId
        -UUID agenteId
    }

    Cliente "1" *-- "0..3" Rendimento : empregadoresRendimentos (jsonb)
    Cliente "1" <-- "0..*" PedidoAluguel : solicita
    Automovel "1" <-- "0..*" PedidoAluguel : refere-se a
    PedidoAluguel "1" <-- "0..1" ContratoCredito : financia
    Agente "1" <-- "0..*" ContratoCredito : concede (banco)
    Usuario "0..1" ..> "1" Cliente : perfil Cliente
    Usuario "0..1" ..> "1" Agente : perfil Agente
```

**Valores controlados (constraints no banco):**

| Campo | Valores aceitos |
|---|---|
| `Agente.tipo` | `Banco`, `Empresa` |
| `Automovel.tipoProprietario` | `Cliente`, `Empresa`, `Banco` |
| `PedidoAluguel.statusFinanceiro` | `Pendente`, `Aprovado`, `Reprovado`, `Cancelado` |
| `Usuario.perfil` | `Cliente`, `Agente` |

**Observações de modelagem:**

- `Rendimento` não é tabela: é guardado como `jsonb` dentro de `clientes`, com limite de 3 validado no `AuthService` e no `ClienteService`.
- `Usuario` referencia `Cliente` ou `Agente` por UUID (`clienteId` / `agenteId`), sem `@ManyToOne`. Exatamente um dos dois é preenchido, conforme o perfil.
- `ContratoCredito` está modelado e tem tabela, mas ainda não tem service nem endpoint (ver HU13).

## 2. Camadas (MVC no back-end)

```mermaid
classDiagram
    direction TB

    class AuthController {
        +registrar(RegistroRequest)
        +login(LoginRequest) LoginResponse
        +me(Jwt) Map
    }
    class ClienteController {
        +listar() List~Cliente~
        +buscar(UUID) Cliente
        +criar(Cliente) Cliente
        +atualizar(UUID, Cliente) Cliente
        +excluir(UUID)
    }
    class PedidoController {
        +criar(Jwt, PedidoRequest) PedidoAluguel
        +meus(Jwt) List~PedidoAluguel~
        +consultar(Jwt, UUID) PedidoAluguel
        +modificar(Jwt, UUID, PedidoRequest) PedidoAluguel
        +cancelar(Jwt, UUID) PedidoAluguel
        +todos() List~PedidoAluguel~
        +avaliar(UUID, AvaliacaoRequest) PedidoAluguel
    }
    class AutomovelController {
        +listar() List~Automovel~
    }

    class AuthService {
        +registrar(RegistroRequest)
        +login(LoginRequest) LoginResponse
    }
    class ClienteService {
        +listar() List~Cliente~
        +buscar(UUID) Cliente
        +criar(Cliente) Cliente
        +atualizar(UUID, Cliente) Cliente
        +excluir(UUID)
    }
    class PedidoService {
        +criar(String, UUID) PedidoAluguel
        +listarDoCliente(String) List~PedidoAluguel~
        +consultar(String, UUID) PedidoAluguel
        +modificar(String, UUID, UUID) PedidoAluguel
        +cancelar(String, UUID) PedidoAluguel
        +listarTodos() List~PedidoAluguel~
        +avaliar(UUID, String) PedidoAluguel
    }

    class ClienteRepository
    class AgenteRepository
    class AutomovelRepository
    class PedidoAluguelRepository
    class ContratoCreditoRepository
    class UsuarioRepository

    class SecurityConfig {
        +filterChain(HttpSecurity) SecurityFilterChain
        +passwordEncoder() PasswordEncoder
        +jwtEncoder() JwtEncoder
        +jwtDecoder() JwtDecoder
        +corsConfigurationSource() CorsConfigurationSource
    }

    AuthController --> AuthService
    ClienteController --> ClienteService
    PedidoController --> PedidoService
    AutomovelController --> AutomovelRepository

    AuthService --> UsuarioRepository
    AuthService --> ClienteRepository
    AuthService --> AgenteRepository
    AuthService --> SecurityConfig : PasswordEncoder, JwtEncoder
    ClienteService --> ClienteRepository
    PedidoService --> PedidoAluguelRepository
    PedidoService --> UsuarioRepository
    PedidoService --> ClienteRepository
    PedidoService --> AutomovelRepository
```

Todos os repositories estendem `JpaRepository<Entidade, UUID>`. Dois têm consultas extras:

- `UsuarioRepository`: `findByLogin`, `existsByLogin`
- `PedidoAluguelRepository`: `findByClienteIdOrderByDataCriacaoDesc`, `findAllByOrderByDataCriacaoDesc`

## 3. Autorização por perfil

| Endpoint | Cliente | Agente |
|---|:---:|:---:|
| `POST /api/auth/registrar`, `POST /api/auth/login` | público | público |
| `GET /api/automoveis` | ✅ | ✅ |
| `POST /api/pedidos`, `GET /api/pedidos/meus`, `GET /api/pedidos/{id}` | ✅ | ❌ 403 |
| `PUT /api/pedidos/{id}`, `PUT /api/pedidos/{id}/cancelar` | ✅ | ❌ 403 |
| `GET /api/pedidos`, `PUT /api/pedidos/{id}/avaliacao` | ❌ 403 | ✅ |
| `/api/clientes/**` | ❌ 403 | ✅ |
