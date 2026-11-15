-- =====================================================================
-- Migração 03 · Créditos de vários bancos por pedido
-- Rode UMA vez no SQL Editor do Supabase, ANTES de reiniciar o backend.
--
-- Regra nova:
--   * o banco só concede crédito, em pedidos ainda Pendentes;
--   * vários bancos podem conceder crédito ao mesmo pedido (um contrato por banco);
--   * a empresa aprova ou reprova e, ao aprovar, escolhe quais créditos utilizar
--     (ou aprova diretamente, sem crédito).
-- =====================================================================

-- 1) Marca se o crédito foi utilizado pela empresa na aprovação.
alter table contratos_credito
  add column if not exists utilizado boolean not null default false;

-- 2) Contratos antigos foram concedidos a pedidos já aprovados: contam como utilizados.
update contratos_credito set utilizado = true;

-- 3) Antes: um contrato por pedido. Agora: um contrato por banco em cada pedido.
alter table contratos_credito
  drop constraint if exists contratos_credito_pedido_unico;

alter table contratos_credito
  drop constraint if exists contratos_credito_pedido_banco_unico;

alter table contratos_credito
  add constraint contratos_credito_pedido_banco_unico unique (pedido_id, banco_agente_id);

-- Conferência (opcional):
-- select pedido_id, banco_agente_id, utilizado, data_concessao from contratos_credito;
