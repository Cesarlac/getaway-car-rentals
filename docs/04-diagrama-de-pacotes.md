# Diagrama de Pacotes (Visão Lógica)

O sistema tem dois subsistemas, como descrito no enunciado: **gestão de pedidos e contratos** (back-end) e **construção dinâmica das páginas web** (front-end).

## Visão geral

```mermaid
flowchart LR
    subgraph FE["Front-end · React + Vite · localhost:5173"]
        direction TB
        pages["pages<br/>Login, Cadastro, Inicio, Catalogo,<br/>CarroDetalhe, Alugar, MeusPedidos, Painel"]
        components["components<br/>Layout, Menu, Rodape, TelaAuth, Carrossel, CardCarro,<br/>CardPedido, Creditos, botões, guardas de rota,<br/>componentes do React Bits"]
        authfe["auth<br/>AuthContext, AuthProvider"]
        apijs["api.js<br/>fetch + token JWT"]
        fotosjs["fotos.js<br/>URL das fotos"]
        utilsjs["utils.js, useCarros.js, useTemaEscuro.js<br/>diária, datas, ficha, tema"]
        perfiljs["perfil.js"]

        pages --> components
        pages --> authfe
        pages --> apijs
        pages --> fotosjs
        pages --> utilsjs
        components --> authfe
        components --> perfiljs
        authfe --> apijs
    end

    subgraph BE["Back-end · Spring Boot 4 · localhost:8080"]
        direction TB
        controllers["controllers<br/>Auth, Cliente, Pedido, Automovel, Contrato"]
        services["services<br/>AuthService, ClienteService,<br/>PedidoService, ContratoService"]
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
        storage[("Storage<br/>buckets carros e public-assets")]
    end

    apijs -- "HTTP/JSON + Bearer JWT" --> controllers
    repositories -- "JDBC (Session Pooler)" --> db
    fotosjs -- "HTTPS (fotos PNG)" --> storage
    components -- "HTTPS (logo e vídeo)" --> storage
```

## Pacotes do back-end (`com.example.demo`)

| Pacote | Responsabilidade | Depende de |
|---|---|---|
| `controllers` | Endpoints REST e regras de acesso por perfil (`@PreAuthorize`). | `services`, `repositories`, `models` |
| `services` | Regras de negócio (limite de 3 rendimentos, status do pedido, posse do pedido, período e valor do aluguel, concessão de crédito só por banco, avaliação só por empresa e uso dos créditos). | `repositories`, `models` |
| `repositories` | Acesso a dados via Spring Data JPA. | `models` |
| `models` | Entidades persistentes mapeadas para as tabelas. | (nenhum) |
| `config` | Segurança: BCrypt, emissão e validação de JWT, CORS. | Spring Security |

Regra de dependência: as setas vão sempre de cima para baixo (`controllers` → `services` → `repositories` → `models`). Nenhuma camada inferior conhece a superior.

> Observação: `AutomovelController` e `AuthDtos` (no pacote `controllers`) acessam o repository e os DTOs diretamente. É aceitável para leitura simples, mas um `AutomovelService` seria o desenho mais fiel ao MVC.

## Pacotes do front-end (`frontend/src`)

| Pacote / arquivo | Responsabilidade |
|---|---|
| `pages` | Telas completas, uma por rota. |
| `components` | Peças reutilizáveis: estrutura (`Layout`, `Menu`, `Rodape`, `TelaAuth`), guardas de rota (`ProtectedRoute`, `RotaPorPerfil`), catálogo (`Carrossel`, `CardCarro`), pedidos (`CardPedido`, `Creditos`), botões padronizados e os componentes animados do React Bits. |
| `auth` | Contexto de sessão (login, logout, perfil). |
| `api.js` | Único ponto de comunicação com o back-end; injeta o token e trata 401. |
| `fotos.js` | Monta a URL das fotos no Supabase Storage a partir da matrícula. |
| `perfil.js` | Funções `ehCliente` e `ehAgente`. |
| `utils.js` | Diária (0,3% do valor), moeda, datas, ficha técnica e agrupamento dos créditos por pedido. |
| `useCarros.js` | Hook que carrega o catálogo. |
| `useTemaEscuro.js` | Hook que acompanha o tema claro/escuro. |

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
    F->>B: POST /api/pedidos {automovelId, dataInicio, dataFim} (Bearer JWT)
    B->>B: valida JWT e perfil CLIENTE
    B->>B: valida o período e calcula o total (diária 0,3% x dias)
    B->>D: insere pedido (status Pendente)
    D-->>B: pedido salvo
    B-->>F: 201 + pedido
    F-->>C: lista "Meus pedidos"
```

## Fluxo de crédito e avaliação (sequência)

```mermaid
sequenceDiagram
    actor Bk as Banco
    actor Em as Empresa
    participant F as Front-end (React)
    participant B as Back-end (Spring)
    participant D as Supabase (PostgreSQL)

    Bk->>F: desliza "Conceder crédito" no pedido pendente
    F->>B: POST /api/contratos {pedidoId} (Bearer JWT)
    B->>D: busca o agente do usuário
    B->>B: exige tipo Banco, pedido Pendente e um crédito por banco
    B->>D: insere contrato de crédito (utilizado = false)
    B-->>F: 201 + contrato

    Em->>F: abre o painel
    F->>B: GET /api/pedidos e GET /api/contratos
    B-->>F: pedidos + créditos concedidos
    Em->>F: marca os créditos que quer utilizar (ou nenhum) e desliza "Aprovar"
    F->>B: PUT /api/pedidos/{id}/avaliacao {status, creditosIds}
    B->>B: exige tipo Empresa e pedido Pendente
    B->>D: marca os créditos escolhidos como utilizados
    B->>D: atualiza o status para Aprovado
    B-->>F: 200 + pedido
    F-->>Em: pedido sai da lista de pendentes
```
