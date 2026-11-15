# Histórias de Usuário

Formato: **Como** [ator], **quero** [ação], **para** [benefício].
A coluna *Implementação* liga cada história ao código, para evidenciar o alinhamento entre modelo e sistema.

## Cliente

| ID | História | Critérios de aceite | Implementação |
|---|---|---|---|
| HU01 | Como **cliente**, quero me cadastrar informando meus dados e até 3 empregadores com rendimentos, para poder usar o sistema. | CPF, RG, nome, endereço e profissão obrigatórios; no máximo 3 empregadores; login único; senha com mínimo de 6 caracteres. | `POST /api/auth/registrar` · `AuthService.registrar` · `pages/Cadastro.jsx` |
| HU02 | Como **cliente**, quero fazer login com usuário e senha, para acessar minha área. | Credenciais corretas devolvem token JWT; incorretas devolvem erro 401; rotas protegidas redirecionam ao login. | `POST /api/auth/login` · `AuthService.login` · `pages/Login.jsx` · `ProtectedRoute` |
| HU03 | Como **cliente**, quero ver o catálogo de carros com foto, para escolher qual alugar. | Lista os 15 carros com foto, marca, modelo, motor e diária. | `GET /api/automoveis` · `pages/Catalogo.jsx` · `components/CardCarro.jsx` |
| HU04 | Como **cliente**, quero ver os detalhes e as fotos de um carro, para conhecê-lo melhor. | Exibe dados, ficha técnica, equipamentos e uma galeria com os 5 ângulos (frente, traseira, lateral e duas diagonais). | `pages/CarroDetalhe.jsx` · `components/DepthCarousel.jsx` · Supabase Storage |
| HU05 | Como **cliente**, quero solicitar o aluguel de um carro, para iniciar a análise financeira. | Pedido nasce `Pendente`, com período (retirada e devolução) e valor total calculado no servidor (diária = 0,3% do valor do carro). | `POST /api/pedidos` · `PedidoService.criar` · `pages/Alugar.jsx` |
| HU06 | Como **cliente**, quero consultar meus pedidos e o status de cada um, para acompanhar a análise. | Mostra apenas pedidos do próprio cliente, do mais recente ao mais antigo. | `GET /api/pedidos/meus` · `pages/MeusPedidos.jsx` |
| HU07 | Como **cliente**, quero alterar o carro e o período de um pedido pendente, para corrigir minha escolha. | Só funciona com status `Pendente` (senão 409); mostra a prévia do novo valor antes de salvar; os créditos já concedidos são apagados. | `PUT /api/pedidos/{id}` · `PedidoService.modificar` · `pages/MeusPedidos.jsx` |
| HU08 | Como **cliente**, quero cancelar um pedido pendente, para desistir do aluguel. | Status vira `Cancelado`; pedido já avaliado não pode ser cancelado (409); a confirmação é feita deslizando o botão. | `PUT /api/pedidos/{id}/cancelar` · `PedidoService.cancelar` · `components/BotaoDeslizar.jsx` |
| HU15 | Como **cliente**, quero escolher o período do aluguel e ver o valor total antes de confirmar, para decidir com clareza. | Retirada não pode estar no passado; devolução posterior à retirada; máximo de 365 dias; atalhos de 3, 7, 15 e 30 dias e campo para digitar a quantidade; total = diária × dias. | `pages/Alugar.jsx` · `PedidoService.aplicarPeriodo` |
| HU16 | Como **cliente**, quero ver carros em destaque, filtrar e ordenar a frota, para achar o carro certo rápido. | Carrossel com os carros marcados como destaque; filtros por busca, marca, tração e faixa de diária; ordenação por nome, diária, potência e aceleração. | `components/Carrossel.jsx` · `pages/Catalogo.jsx` |
| HU17 | Como **cliente**, quero consultar a ficha técnica do carro, para comparar opções. | Card com verso (ano, torque, 0 a 100, velocidade máxima) e página com ficha completa. | `components/CardCarro.jsx` · `pages/CarroDetalhe.jsx` |
| HU18 | Como **cliente**, quero ver os créditos do meu pedido, para saber quais bancos concederam e quais foram utilizados. | Pedido pendente mostra os créditos concedidos; pedido aprovado mostra os créditos utilizados ou "aprovado diretamente, sem crédito". | `GET /api/contratos/meus` · `components/Creditos.jsx` · `pages/MeusPedidos.jsx` |

## Agente (banco ou empresa)

| ID | História | Critérios de aceite | Implementação |
|---|---|---|---|
| HU09 | Como **agente**, quero me cadastrar como banco ou empresa, para participar da análise dos pedidos. | Tipo aceito: `Banco` ou `Empresa`. | `POST /api/auth/registrar` · `pages/Cadastro.jsx` |
| HU10 | Como **agente**, quero listar os pedidos com dados do cliente, renda e carro, para analisar financeiramente. | Mostra CPF, RG, profissão, endereço, empregadores e renda total; permite filtrar por status. | `GET /api/pedidos` · `pages/Painel.jsx` · `components/CardPedido.jsx` |

## Banco

| ID | História | Critérios de aceite | Implementação |
|---|---|---|---|
| HU13 | Como **banco**, quero conceder crédito a um pedido pendente, para financiar o aluguel do cliente. | Só `Banco` (empresa e cliente recebem 403); só pedido `Pendente` (senão 409); cada banco concede uma vez por pedido (409 se repetir); vários bancos podem conceder ao mesmo pedido. | `POST /api/contratos` · `ContratoService.conceder` · `pages/Painel.jsx` |
| HU19 | Como **banco**, quero ver apenas a ação de conceder crédito, para não confundir o meu papel com o da empresa. | O painel do banco não mostra "Aprovar" nem "Reprovar"; depois de conceder, o pedido informa que o crédito já foi concedido. | `GET /api/me` (`tipoAgente`, `agenteId`) · `pages/Painel.jsx` |

## Empresa

| ID | História | Critérios de aceite | Implementação |
|---|---|---|---|
| HU11 | Como **empresa**, quero aprovar ou reprovar um pedido pendente, para dar andamento ao contrato. | Só `Empresa` (banco recebe 403); aceita apenas `Aprovado` ou `Reprovado`; pedido já avaliado retorna 409. | `PUT /api/pedidos/{id}/avaliacao` · `PedidoService.avaliar` · `pages/Painel.jsx` |
| HU20 | Como **empresa**, quero ver os bancos que concederam crédito ao pedido e escolher quais utilizar, para decidir entre usar crédito ou aprovar diretamente. | Lista os créditos concedidos; a empresa marca um, vários ou nenhum; os marcados ficam como `utilizado`; crédito de outro pedido é recusado (400). | `PUT /api/pedidos/{id}/avaliacao` (`creditosIds`) · `PedidoService.avaliar` · `pages/Painel.jsx` |

## Transversais

| ID | História | Critérios de aceite | Implementação |
|---|---|---|---|
| HU12 | Como **usuário**, quero que cada perfil acesse só o que lhe cabe, para proteger os dados. | Cliente em rota de agente e vice-versa recebe 403; o front-end redireciona rotas indevidas; banco e empresa só veem as próprias ações. | `@PreAuthorize` · regras nos services · `RotaPorPerfil` |
| HU21 | Como **usuário**, quero usar o sistema no celular e escolher entre tema claro e escuro, para ter conforto em qualquer tela. | Layout responsivo sem rolagem lateral; botão de tema no menu; a escolha fica salva no navegador. | `index.css` · `components/Menu.jsx` · `useTemaEscuro.js` |

## Pendente de implementação

| ID | História | Observação |
|---|---|---|
| HU14 | Como **agente**, quero modificar um pedido, conforme o enunciado ("agentes podem modificar e avaliar pedidos"). | Hoje só o cliente altera o pedido. Falta definir o que o agente pode alterar. |
| HU22 | Como **agente**, quero uma tela para listar, editar e excluir clientes, para gerenciar os contratantes. | O CRUD existe na API (`/api/clientes`, `ClienteController`, `ClienteService`), mas o front-end só tem a tela de cadastro. |
