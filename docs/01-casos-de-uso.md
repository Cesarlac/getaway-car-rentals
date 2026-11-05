# Diagrama de Casos de Uso

Sistema de Aluguel de Carros (Getaway Car Rentals).

## Atores

| Ator | Descrição |
|---|---|
| **Cliente** | Usuário individual que solicita, modifica, consulta e cancela pedidos de aluguel. |
| **Agente** | Banco ou empresa que analisa financeiramente e avalia os pedidos. |

## Diagrama

```mermaid
flowchart LR
    Cliente(["👤 Cliente"])
    Agente(["🏦 Agente<br/>(Banco ou Empresa)"])

    subgraph Sistema["Sistema de Aluguel de Carros"]
        UC1(["Cadastrar-se"])
        UC2(["Autenticar (login)"])
        UC3(["Consultar catálogo de carros"])
        UC4(["Ver detalhes e fotos do carro"])
        UC5(["Criar pedido de aluguel"])
        UC6(["Consultar meus pedidos e status"])
        UC7(["Modificar pedido (trocar carro)"])
        UC8(["Cancelar pedido"])
        UC9(["Listar pedidos de todos os clientes"])
        UC10(["Avaliar pedido (aprovar ou reprovar)"])
    end

    Cliente --- UC1
    Cliente --- UC2
    Cliente --- UC3
    Cliente --- UC4
    Cliente --- UC5
    Cliente --- UC6
    Cliente --- UC7
    Cliente --- UC8

    Agente --- UC1
    Agente --- UC2
    Agente --- UC9
    Agente --- UC10

    UC3 -. "«include»" .-> UC2
    UC5 -. "«include»" .-> UC2
    UC6 -. "«include»" .-> UC2
    UC7 -. "«include»" .-> UC2
    UC8 -. "«include»" .-> UC2
    UC9 -. "«include»" .-> UC2
    UC10 -. "«include»" .-> UC2
    UC4 -. "«extend»" .-> UC3
    UC5 -. "«extend»" .-> UC4
```

## Regras que o diagrama representa

- Todo caso de uso, exceto **Cadastrar-se** e **Autenticar**, exige login (`«include»` Autenticar).
- **Modificar** e **Cancelar** só são permitidos enquanto o pedido está `Pendente`.
- **Avaliar** só é permitido para pedidos `Pendente` e resulta em `Aprovado` ou `Reprovado`.
- O Cliente só enxerga os próprios pedidos; o Agente enxerga todos.
