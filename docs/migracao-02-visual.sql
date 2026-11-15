-- =====================================================================
-- MIGRACAO 02: ficha tecnica dos carros, periodo do aluguel e Silverado
-- Rodar no SQL Editor do Supabase ANTES de reiniciar o back-end.
-- =====================================================================

-- 1) Novas colunas em automoveis
alter table automoveis
  add column if not exists valor numeric(14,2),
  add column if not exists motor varchar,
  add column if not exists cv integer,
  add column if not exists torque varchar,
  add column if not exists transmissao varchar,
  add column if not exists tracao varchar,
  add column if not exists aceleracao varchar,
  add column if not exists velocidade_maxima varchar,
  add column if not exists equipamentos text,
  add column if not exists destaque boolean not null default false;

-- 2) Periodo e valor total nos pedidos
alter table pedidos_aluguel
  add column if not exists data_inicio date,
  add column if not exists data_fim date,
  add column if not exists valor_total numeric(14,2);

-- 3) F-150 Tremor (MAT-011) vira Silverado High Country.
--    ATENCAO: o "ano" e a placa continuam os da F-150. Ajuste o ano real abaixo.
update automoveis
   set marca = 'Chevrolet', modelo = 'SILVERADO HIGH COUNTRY'
 where matricula = 'MAT-011';
-- update automoveis set ano = '2025/2025' where matricula = 'MAT-011';

-- 4) Ficha tecnica e valor de cada carro
update automoveis a
   set valor = v.valor, motor = v.motor, cv = v.cv, torque = v.torque,
       transmissao = v.transmissao, tracao = v.tracao,
       aceleracao = v.aceleracao, velocidade_maxima = v.velocidade_maxima
  from (values
    ('MAT-001', 559000,  '3.0 V6 Turbo MHEV',               340, '51 kgfm',    'Automático de 8 velocidades',          'Integral',            '5,6 s', '210 km/h'),
    ('MAT-002', 470000,  '3.0 6 cilindros turbo',            410, '56,1 kgfm',  'Automático de 7 velocidades',          'Traseira',            '4,2 s', '280 km/h'),
    ('MAT-003', 1550000, '6.2 V8',                           426, '62,3 kgfm',  'Automático de 10 velocidades',         null,                  '6,3 s', '180 km/h'),
    ('MAT-004', 490000,  '6.2 V8',                           461, '62,9 kgfm',  'Automática de 10 velocidades',         'Traseira',            '4,2 s', '250 km/h'),
    ('MAT-005', 3150000, '3.9 V8 Biturbo',                   670, '77,5 kgfm',  'Automatizado DCT-F1 de 7 velocidades', 'Traseira',            '3 s',   '325 km/h'),
    ('MAT-006', 2790000, '3.0 V6 Biturbo + elétrico',        830, '75,4 kgfm',  'Automático F1 de 8 velocidades',       'Traseira',            '2,9 s', '330 km/h'),
    ('MAT-007', 1490000, '6.2 V8',                           807, '97,7 kgfm',  'Automática de 8 velocidades',          'Traseira',            '3,4 s', '326 km/h'),
    ('MAT-008', 3690000, '5.2 V10',                          640, '57,6 kgfm',  'Automatizada de 7 velocidades',        'Traseira',            '3,2 s', '325 km/h'),
    ('MAT-009', 990000,  '3.0 6 cilindros turbodiesel MHEV', 350, '71,4 kgfm',  'Automático de 8 velocidades',          'Integral',            '6,4 s', '191 km/h'),
    ('MAT-010', 3650000, '4.0 V8 Biturbo + elétrico',        800, '96,9 kgfm',  'Automático de 8 velocidades',          'Integral',            '3,4 s', '312 km/h'),
    ('MAT-011', 520000,  '5.3 V8',                           360, '52,9 kgfm',  'Automático de 10 velocidades',         'Integral sob demanda', null,   '180 km/h'),
    ('MAT-012', 2230000, '4.0 V8 Biturbo',                   585, '86,7 kgfm',  'Automático de 9 velocidades',          'Integral',            '4,5 s', '220 km/h'),
    ('MAT-013', 1790000, '4.0 V8 Biturbo + elétrico',        816, '144,8 kgfm', 'Automático de 9 velocidades',          'Integral',            '2,8 s', '320 km/h'),
    ('MAT-014', 1650000, '4.0 V8 Biturbo + elétrico',        802, '145,8 kgfm', 'Automático de 9 velocidades',          'Integral',            '3,3 s', '250 km/h'),
    ('MAT-015', 3100000, '4.0 6 cilindros boxer',            525, '47,9 kgfm',  'Automático de 7 velocidades',          'Traseira',            '3,2 s', '296 km/h')
  ) as v(matricula, valor, motor, cv, torque, transmissao, tracao, aceleracao, velocidade_maxima)
 where a.matricula = v.matricula;

-- 5) Carros do carrossel da pagina inicial (troque quando quiser)
update automoveis set destaque = false;
update automoveis set destaque = true
 where matricula in ('MAT-001','MAT-006','MAT-008','MAT-010','MAT-013','MAT-015');

-- 6) Pendencia: o Escalade veio com "Tracao: 426CV" (erro de digitacao). Corrija com:
-- update automoveis set tracao = 'Integral' where matricula = 'MAT-003';

-- 7) Conferencia
select matricula, marca, modelo, valor, cv, tracao, destaque
  from automoveis order by matricula;
