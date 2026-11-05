# Histórias de Usuário

Formato: **Como** [ator], **quero** [ação], **para** [benefício].
A coluna *Implementação* liga cada história ao código, para evidenciar o alinhamento entre modelo e sistema.

## Cliente

| ID | História | Critérios de aceite | Implementação |
|---|---|---|---|
| HU01 | Como **cliente**, quero me cadastrar informando meus dados e até 3 empregadores com rendimentos, para poder usar o sistema. | CPF, RG, nome, endereço e profissão obrigatórios; no máximo 3 empregadores; login único; senha com mínimo de 6 caracteres. | `POST /api/auth/registrar` · `AuthService.registrar` · `pages/Cadastro.jsx` |
| HU02 | Como **cliente**, quero fazer login com usuário e senha, para acessar minha área. | Credenciais corretas devolvem token JWT; incorretas devolvem erro 401; rotas protegidas redirecionam ao login. | `POST /api/auth/login` · `AuthService.login` · `pages/Login.jsx` · `ProtectedRoute` |
| HU03 | Como **cliente**, quero ver o catálogo de carros com foto, para escolher qual alugar. | Lista os 15 carros com foto de frente, marca, modelo e ano. | `GET /api/automoveis` · `pages/Catalogo.jsx` |
| HU04 | Como **cliente**, quero ver os detalhes e as 5 fotos de um carro, para conhecê-lo melhor. | Exibe ano, placa, proprietário e 5 ângulos (frente, traseira, lateral e duas diagonais). | `pages/CarroDetalhe.jsx` · Supabase Storage |
| HU05 | Como **cliente**, quero solicitar o aluguel de um carro, para iniciar a análise financeira. | Pedido nasce com status `Pendente` e data de criação. | `POST /api/pedidos` · `PedidoService.criar` |
| HU06 | Como **cliente**, quero consultar meus pedidos e o status de cada um, para acompanhar a análise. | Mostra apenas pedidos do próprio cliente, do mais recente ao mais antigo. | `GET /api/pedidos/meus` · `pages/MeusPedidos.jsx` |
| HU07 | Como **cliente**, quero trocar o carro de um pedido pendente, para corrigir minha escolha. | Só funciona com status `Pendente`; caso contrário retorna 409. | `PUT /api/pedidos/{id}` · `PedidoService.modificar` |
| HU08 | Como **cliente**, quero cancelar um pedido pendente, para desistir do aluguel. | Status vira `Cancelado`; pedido já avaliado não pode ser cancelado (409). | `PUT /api/pedidos/{id}/cancelar` · `PedidoService.cancelar` |

## Agente (banco ou empresa)

| ID | História | Critérios de aceite | Implementação |
|---|---|---|---|
| HU09 | Como **agente**, quero me cadastrar como banco ou empresa, para participar da avaliação. | Tipo aceito: `Banco` ou `Empresa`. | `POST /api/auth/registrar` · `pages/Cadastro.jsx` |
| HU10 | Como **agente**, quero listar os pedidos com dados do cliente, renda e carro, para analisar financeiramente. | Mostra CPF, RG, profissão, endereço, empregadores e renda total; permite filtrar por status. | `GET /api/pedidos` · `pages/Painel.jsx` |
| HU11 | Como **agente**, quero aprovar ou reprovar um pedido pendente, para dar andamento ao contrato. | Aceita apenas `Aprovado` ou `Reprovado`; pedido já avaliado retorna 409. | `PUT /api/pedidos/{id}/avaliacao` · `PedidoService.avaliar` |

## Transversais

| ID | História | Critérios de aceite | Implementação |
|---|---|---|---|
| HU12 | Como **usuário**, quero que cada perfil acesse só o que lhe cabe, para proteger os dados. | Cliente em rota de agente e vice-versa recebe 403; o front-end redireciona rotas indevidas. | `@PreAuthorize` · `RotaPorPerfil` |

## Pendente de implementação

| ID | História | Observação |
|---|---|---|
| HU13 | Como **banco agente**, quero registrar um contrato de crédito ao aprovar um pedido, para financiar o aluguel. | Entidade e tabela `contratos_credito` existem e estão modeladas; falta service, endpoint e tela. |
| HU14 | Como **agente**, quero modificar um pedido, conforme o enunciado ("agentes podem modificar e avaliar pedidos"). | Hoje o agente só avalia. Definir o que o agente pode alterar. |
