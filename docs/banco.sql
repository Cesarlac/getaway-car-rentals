-- =====================================================================
-- Getaway Car Rentals · script completo do banco (Supabase / PostgreSQL)
-- Versao atual: ja inclui valor/ficha tecnica dos carros e periodo do aluguel.
--
-- Para um projeto Supabase NOVO: rode este arquivo inteiro no SQL Editor.
-- Se voce ja tem o banco da versao anterior, rode apenas migracao-02-visual.sql.
--
-- Observacao: este script foi reconstruido a partir do modelo do projeto
-- (docs/03-diagrama-de-classes.md). Confira com o seu Table Editor.
-- =====================================================================

-- ---------- Tabelas ----------

create table clientes (
  id uuid primary key default gen_random_uuid(),
  cpf varchar not null unique,
  rg varchar not null,
  nome varchar not null,
  endereco text not null,
  profissao varchar not null,
  empregadores_rendimentos jsonb not null default '[]'::jsonb  -- ate 3 itens, validado na API
);

create table agentes (
  id uuid primary key default gen_random_uuid(),
  nome varchar not null,
  tipo varchar not null check (tipo in ('Banco', 'Empresa'))
);

create table automoveis (
  id uuid primary key default gen_random_uuid(),
  matricula varchar not null unique,
  placa varchar not null unique,
  marca varchar not null,
  modelo varchar not null,
  ano varchar not null,
  tipo_proprietario varchar not null check (tipo_proprietario in ('Cliente', 'Empresa', 'Banco')),
  valor numeric(14,2),
  motor varchar,
  cv integer,
  torque varchar,
  transmissao varchar,
  tracao varchar,
  aceleracao varchar,
  velocidade_maxima varchar,
  equipamentos text,                          -- um item por linha (opcional)
  destaque boolean not null default false     -- aparece no carrossel da pagina inicial
);

create table pedidos_aluguel (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes(id),
  automovel_id uuid not null references automoveis(id),
  status_financeiro varchar not null default 'Pendente'
    check (status_financeiro in ('Pendente', 'Aprovado', 'Reprovado', 'Cancelado')),
  data_criacao timestamp not null default now(),
  data_inicio date,
  data_fim date,
  valor_total numeric(14,2),                  -- diaria (0,3% do valor do carro) x dias, calculado na API
  check (data_inicio is null or data_fim is null or data_fim > data_inicio)
);

create table contratos_credito (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references pedidos_aluguel(id) on delete cascade,
  banco_agente_id uuid not null references agentes(id),
  data_concessao timestamp not null default now(),
  utilizado boolean not null default false,          -- a empresa usou este credito ao aprovar
  constraint contratos_credito_pedido_banco_unico unique (pedido_id, banco_agente_id)   -- um contrato por banco em cada pedido
);

create table usuarios (
  id uuid primary key default gen_random_uuid(),
  login varchar not null unique,
  senha_hash varchar not null,                -- BCrypt, nunca a senha em texto
  perfil varchar not null check (perfil in ('Cliente', 'Agente')),
  cliente_id uuid references clientes(id) on delete cascade,
  agente_id uuid references agentes(id) on delete cascade
);

-- ---------- Seguranca ----------
-- RLS ligado e sem politicas: a API publica do Supabase nao le nada.
-- O Spring Boot conecta como "postgres" e continua funcionando normalmente.
alter table clientes enable row level security;
alter table agentes enable row level security;
alter table automoveis enable row level security;
alter table pedidos_aluguel enable row level security;
alter table contratos_credito enable row level security;
alter table usuarios enable row level security;

-- ---------- Carros do catalogo ----------
-- ATENCAO: as placas abaixo sao FICTICIAS (exemplo). Troque pelas reais se tiver.
-- O ano da Silverado esta como 'A definir'. O Escalade esta sem tracao (dado nao informado).
insert into automoveis
  (matricula, placa, marca, modelo, ano, tipo_proprietario,
   valor, motor, cv, torque, transmissao, tracao, aceleracao, velocidade_maxima, destaque)
values
  ('MAT-001', 'GTW-0001', 'Audi',          'Q8 SPORTBACK PERFORMANCE BLACK',                       '2025/2025', 'Empresa',
    559000,  '3.0 V6 Turbo MHEV',               340, '51 kgfm',    'Automático de 8 velocidades',          'Integral',             '5,6 s', '210 km/h', true),
  ('MAT-002', 'GTW-0002', 'BMW',           'M2 COMPETITION',                                       '2021/2021', 'Empresa',
    470000,  '3.0 6 cilindros turbo',            410, '56,1 kgfm',  'Automático de 7 velocidades',          'Traseira',             '4,2 s', '280 km/h', false),
  ('MAT-003', 'GTW-0003', 'Cadillac',      'ESCALADE ESV PREMIUM LUXURY',                          '2026/2026', 'Empresa',
    1550000, '6.2 V8',                           426, '62,3 kgfm',  'Automático de 10 velocidades',         null,                   '6,3 s', '180 km/h', false),
  ('MAT-004', 'GTW-0004', 'Chevrolet',     'CAMARO COLLECTION',                                    '2023/2024', 'Empresa',
    490000,  '6.2 V8',                           461, '62,9 kgfm',  'Automática de 10 velocidades',         'Traseira',             '4,2 s', '250 km/h', false),
  ('MAT-005', 'GTW-0005', 'Ferrari',       '488 SPIDER',                                           '2018/2018', 'Empresa',
    3150000, '3.9 V8 Biturbo',                   670, '77,5 kgfm',  'Automatizado DCT-F1 de 7 velocidades', 'Traseira',             '3 s',   '325 km/h', false),
  ('MAT-006', 'GTW-0006', 'Ferrari',       '296 GTB',                                              '2022/2023', 'Empresa',
    2790000, '3.0 V6 Biturbo + elétrico',        830, '75,4 kgfm',  'Automático F1 de 8 velocidades',       'Traseira',             '2,9 s', '330 km/h', true),
  ('MAT-007', 'GTW-0007', 'Dodge',         'CHALLENGER SRT HELLCAT REDEYE WIDEBODY LAST CALL',     '2023/2023', 'Empresa',
    1490000, '6.2 V8',                           807, '97,7 kgfm',  'Automática de 8 velocidades',          'Traseira',             '3,4 s', '326 km/h', false),
  ('MAT-008', 'GTW-0008', 'Lamborghini',   'HURACÁN TECNICA LP 640-2',                             '2024/2024', 'Empresa',
    3690000, '5.2 V10',                          640, '57,6 kgfm',  'Automatizada de 7 velocidades',        'Traseira',             '3,2 s', '325 km/h', true),
  ('MAT-009', 'GTW-0009', 'Land Rover',    'DEFENDER 110 X-DYNAMIC HSE URBAN WIDETRACK FULL SPEC', '2024/2025', 'Empresa',
    990000,  '3.0 6 cilindros turbodiesel MHEV', 350, '71,4 kgfm',  'Automático de 8 velocidades',          'Integral',             '6,4 s', '191 km/h', false),
  ('MAT-010', 'GTW-0010', 'Lamborghini',   'URUS SE',                                              '2025/2025', 'Empresa',
    3650000, '4.0 V8 Biturbo + elétrico',        800, '96,9 kgfm',  'Automático de 8 velocidades',          'Integral',             '3,4 s', '312 km/h', true),
  ('MAT-011', 'GTW-0011', 'Chevrolet',     'SILVERADO HIGH COUNTRY',                               'A definir', 'Empresa',
    520000,  '5.3 V8',                           360, '52,9 kgfm',  'Automático de 10 velocidades',         'Integral sob demanda', null,    '180 km/h', false),
  ('MAT-012', 'GTW-0012', 'Mercedes-AMG',  'AMG G 63',                                             '2024/2024', 'Empresa',
    2230000, '4.0 V8 Biturbo',                   585, '86,7 kgfm',  'Automático de 9 velocidades',          'Integral',             '4,5 s', '220 km/h', false),
  ('MAT-013', 'GTW-0013', 'Mercedes-AMG',  'AMG GT 63 S E-PERFORMANCE',                            '2025/2025', 'Empresa',
    1790000, '4.0 V8 Biturbo + elétrico',        816, '144,8 kgfm', 'Automático de 9 velocidades',          'Integral',             '2,8 s', '320 km/h', true),
  ('MAT-014', 'GTW-0014', 'Mercedes-AMG',  'AMG S 63 E-PERFORMANCE',                               '2024/2024', 'Empresa',
    1650000, '4.0 V8 Biturbo + elétrico',        802, '145,8 kgfm', 'Automático de 9 velocidades',          'Integral',             '3,3 s', '250 km/h', false),
  ('MAT-015', 'GTW-0015', 'Porsche',       '911 GT3 RS',                                           '2023/2024', 'Empresa',
    3100000, '4.0 6 cilindros boxer',            525, '47,9 kgfm',  'Automático de 7 velocidades',          'Traseira',             '3,2 s', '296 km/h', true);

-- ---------- Conferencia ----------
-- select matricula, marca, modelo, valor, cv, destaque from automoveis order by matricula;
