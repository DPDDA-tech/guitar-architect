-- Tabela global de concessões de recompensas
create table if not exists public.reward_grants (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  reward_id text not null,
  reason text,
  source text not null default 'admin-supabase',
  granted_by text, -- E-mail ou ID do admin que realizou a concessão
  granted_at timestamptz not null default now(),
  revoked_at timestamptz null, -- Se preenchido, a recompensa não é mais válida
  created_at timestamptz not null default now()
);

-- Índices para performance de busca e validação
create index if not exists idx_reward_grants_email on public.reward_grants(email);
create index if not exists idx_reward_grants_reward_id on public.reward_grants(reward_id);
create index if not exists idx_reward_grants_revoked_at on public.reward_grants(revoked_at);

-- Regra: Um usuário não pode ter o mesmo selo ativo duas vezes.
-- Permite duplicatas se um dos registros estiver revogado (histórico).
create unique index if not exists idx_active_reward_grants_unique_email_reward 
on public.reward_grants (email, reward_id) 
where (revoked_at is null);

-- Comentários de arquitetura
comment on table public.reward_grants is 'Armazena concessões manuais de selos premium para usuários.';
comment on column public.reward_grants.revoked_at is 'Soft-revoke: se não for nulo, a concessão é ignorada pelo sistema de elegibilidade.';
comment on column public.reward_grants.granted_by is 'Identifica qual administrador/desenvolvedor autorizou o selo.';