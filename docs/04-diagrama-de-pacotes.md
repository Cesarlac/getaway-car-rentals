# Diagrama de Pacotes (Visão Lógica)

O sistema tem dois subsistemas, como descrito no enunciado: **gestão de pedidos e contratos** (back-end) e **construção dinâmica das páginas web** (front-end).

## Visão geral

```mermaid
flowchart LR
    subgraph FE["Front-end · React + Vite · localhost:5173"]
        direction TB
        pages["pages<br/>Login, Cadastro, Inicio, Catalogo,<br/>CarroDetalhe, MeusPedidos, Painel"]
        components["components<br/>Layout, Menu, ProtectedRoute,<br/>RotaPorPerfil"]
        authfe["auth<br/>AuthContext, AuthProvider"]
        apijs["api.js<br/>fetch + token JWT"]
        fotosjs["fotos.js<br/>URL das fotos"]
        perfiljs["perfil.js"]

        pages --> components
        pages --> authfe
        pages --> apijs
        pages --> fotosjs
        components --> authfe
        components --> perfiljs
        authfe --> apijs
    end

    subgraph BE["Back-end · Spring Boot 4 · localhost:8080"]
        direction TB
        controllers["controllers<br/>Auth, Cliente, Pedido, Automovel"]
        services["services<br/>AuthService, ClienteService,<br/>PedidoService"]
        repositories["repositories<br/>JpaRepository x6"]
        models["models<br/>entidades JPA"]
        config["config<br/>SecurityConfig (JWT, CORS)"]

        controllers --> services
        controllers --> repositories
        services --> repositories
        repositories --> models
        services --> models
        controllers --> models
        config -.-> controllers
        config -.-> services
    end

    subgraph SB["Supabase"]
        db[("PostgreSQL<br/>6 tabelas")]
        storage[("Storage<br/>bucket carros")]
    end

    apijs -- "HTTP/JSON + Bearer JWT" --> controllers
    repositories -- "JDBC (Session Pooler)" --> db
    fotosjs -- "HTTPS (imagens AVIF)" --> storage
```

## Pacotes do back-end (`com.example.demo`)

| Pacote | Responsabilidade | Depende de |
|---|---|---|
| `controllers` | Endpoints REST e regras de acesso por perfil (`@PreAuthorize`). | `services`, `repositories`, `models` |
| `services` | Regras de negócio (limite de 3 rendimentos, status do pedido, posse do pedido). | `repositories`, `models` |
| `repositories` | Acesso a dados via Spring Data JPA. | `models` |
| `models` | Entidades persistentes mapeadas para as tabelas. | (nenhum) |
| `config` | Segurança: BCrypt, emissão e validação de JWT, CORS. | Spring Security |

Regra de dependência: as setas vão sempre de cima para baixo (`controllers` → `services` → `repositories` → `models`). Nenhuma camada inferior conhece a superior.

> Observação: `AutomovelController` e `AuthDtos` (no pacote `controllers`) acessam o repository e os DTOs diretamente. É aceitável para leitura simples, mas um `AutomovelService` seria o desenho mais fiel ao MVC.

## Pacotes do front-end (`frontend/src`)

| Pacote / arquivo | Responsabilidade |
|---|---|
| `pages` | Telas completas, uma por rota. |
| `components` | Peças reutilizáveis e guardas de rota (`ProtectedRoute`, `RotaPorPerfil`). |
| `auth` | Contexto de sessão (login, logout, perfil). |
| `api.js` | Único ponto de comunicação com o back-end; injeta o token e trata 401. |
| `fotos.js` | Monta a URL das fotos no Supabase Storage a partir da matrícula. |
| `perfil.js` | Funções `ehCliente` e `ehAgente`. |

## Fluxo de login e pedido (sequência)

```mermaid
sequenceDiagram
    actor C as Cliente
    participant F as Front-end (React)
    participant B as Back-end (Spring)
    participant D as Supabase (PostgreSQL)

    C->>F: usuário e senha
    F->>B: POST /api/auth/login
    B->>D: busca usuário por login
    D-->>B: usuário + senha_hash
    B->>B: BCrypt.matches e gera JWT (2h)
    B-->>F: token + perfil
    F->>F: guarda sessão

    C->>F: "Solicitar aluguel"
    F->>B: POST /api/pedidos (Bearer JWT)
    B->>B: valida JWT e perfil CLIENTE
    B->>D: insere pedido (status Pendente)
    D-->>B: pedido salvo
    B-->>F: 201 + pedido
    F-->>C: lista "Meus pedidos"
```
