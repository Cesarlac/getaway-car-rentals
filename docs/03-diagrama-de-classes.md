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
        -BigDecimal valor
        -String motor
        -Integer cv
        -String torque
        -String transmissao
        -String tracao
        -String aceleracao
        -String velocidadeMaxima
        -String equipamentos
        -Boolean destaque
    }

    class PedidoAluguel {
        -UUID id
        -String statusFinanceiro
        -LocalDateTime dataCriacao
        -LocalDate dataInicio
        -LocalDate dataFim
        -BigDecimal valorTotal
    }

    class ContratoCredito {
        -UUID id
        -LocalDateTime dataConcessao
        -boolean utilizado
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
    PedidoAluguel "1" <-- "0..*" ContratoCredito : recebe crédito
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
- `ContratoCredito` é concedido por agente `Banco` para pedido `Pendente`. Um pedido pode ter vários créditos, no máximo um por banco (constraint única em `pedido_id` + `banco_agente_id`). Implementado em `ContratoService` e `ContratoController` (HU13).
- `ContratoCredito.utilizado` fica `true` quando a `Empresa`, ao aprovar, escolhe usar aquele crédito (`PedidoService.avaliar`, HU20). Aprovar sem escolher nenhum é permitido.
- Quando o cliente modifica o pedido, os créditos já concedidos são apagados (`PedidoService.modificar`), porque valiam para o carro e o valor anteriores.
- O tipo do agente (`Banco` ou `Empresa`) não vai no token: é lido do banco a cada ação, em `ContratoService.conceder` e `PedidoService.avaliar`.
- **Regra de preço:** diária = 0,3% de `Automovel.valor`; `PedidoAluguel.valorTotal` = diária × dias do período. O cálculo é feito em `PedidoService.aplicarPeriodo`, nunca no navegador.

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
        +avaliar(Jwt, UUID, AvaliacaoRequest) PedidoAluguel
    }
    class AutomovelController {
        +listar() List~Automovel~
    }

    class ContratoController {
        +conceder(Jwt, ContratoRequest) ContratoCredito
        +todos() List~ContratoCredito~
        +meus(Jwt) List~ContratoCredito~
    }

    class AuthService {
        +registrar(RegistroRequest)
        +login(LoginRequest) LoginResponse
        +tipoAgente(String) String
        +agenteId(String) String
    }
    class ClienteService {
        +listar() List~Cliente~
        +buscar(UUID) Cliente
        +criar(Cliente) Cliente
        +atualizar(UUID, Cliente) Cliente
        +excluir(UUID)
    }
    class PedidoService {
        +criar(String, UUID, LocalDate, LocalDate) PedidoAluguel
        +listarDoCliente(String) List~PedidoAluguel~
        +consultar(String, UUID) PedidoAluguel
        +modificar(String, UUID, UUID, LocalDate, LocalDate) PedidoAluguel
        +cancelar(String, UUID) PedidoAluguel
        +listarTodos() List~PedidoAluguel~
        +avaliar(String, UUID, String, List~UUID~) PedidoAluguel
    }

    class ContratoService {
        +conceder(String, UUID) ContratoCredito
        +listarTodos() List~ContratoCredito~
        +listarDoCliente(String) List~ContratoCredito~
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
    ContratoController --> ContratoService

    AuthService --> UsuarioRepository
    AuthService --> ClienteRepository
    AuthService --> AgenteRepository
    AuthService --> SecurityConfig : PasswordEncoder, JwtEncoder
    ClienteService --> ClienteRepository
    PedidoService --> PedidoAluguelRepository
    PedidoService --> UsuarioRepository
    PedidoService --> ClienteRepository
    PedidoService --> AutomovelRepository
    PedidoService --> AgenteRepository
    PedidoService --> ContratoCreditoRepository
    ContratoService --> ContratoCreditoRepository
    ContratoService --> PedidoAluguelRepository
    ContratoService --> UsuarioRepository
    ContratoService --> AgenteRepository
```

Todos os repositories estendem `JpaRepository<Entidade, UUID>`. Três têm consultas extras:

- `UsuarioRepository`: `findByLogin`, `existsByLogin`
- `PedidoAluguelRepository`: `findByClienteIdOrderByDataCriacaoDesc`, `findAllByOrderByDataCriacaoDesc`
- `ContratoCreditoRepository`: `existsByPedidoIdAndBancoAgenteId`, `findByPedidoId`, `findByPedidoClienteId`, `findAllByOrderByDataConcessaoDesc`

## 3. Autorização por perfil

| Endpoint | Cliente | Banco | Empresa |
|---|:---:|:---:|:---:|
| `POST /api/auth/registrar`, `POST /api/auth/login` | público | público | público |
| `GET /api/automoveis`, `GET /api/me` | ✅ | ✅ | ✅ |
| `POST /api/pedidos`, `GET /api/pedidos/meus`, `GET /api/pedidos/{id}` | ✅ | ❌ 403 | ❌ 403 |
| `PUT /api/pedidos/{id}`, `PUT /api/pedidos/{id}/cancelar` | ✅ | ❌ 403 | ❌ 403 |
| `GET /api/pedidos` | ❌ 403 | ✅ | ✅ |
| `PUT /api/pedidos/{id}/avaliacao` | ❌ 403 | ❌ 403 | ✅ |
| `/api/clientes/**` | ❌ 403 | ✅ | ✅ |
| `POST /api/contratos` | ❌ 403 | ✅ | ❌ 403 |
| `GET /api/contratos` | ❌ 403 | ✅ | ✅ |
| `GET /api/contratos/meus` | ✅ | ❌ 403 | ❌ 403 |

O perfil (`Cliente` ou `Agente`) é verificado com `@PreAuthorize`, a partir do token. A distinção entre `Banco` e `Empresa` é verificada dentro dos services, consultando o agente no banco.
