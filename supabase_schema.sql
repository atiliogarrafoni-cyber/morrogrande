-- Ligas (padrões de qualidade)
create table if not exists ligas (
  id uuid primary key default gen_random_uuid(),
  numero text not null unique,
  nome text not null,
  descricao text,
  imp_max numeric(5,2) not null,
  pva_max numeric(5,2) not null,
  preco_min numeric(10,2) not null,
  preco_max numeric(10,2) not null,
  created_at timestamptz default now()
);

-- Lotes de café cru
create table if not exists lotes (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  data_recebimento date not null,
  box text not null,
  origem text not null,
  sacas integer not null,
  impureza numeric(5,2) not null,
  pva numeric(5,2) not null,
  valor_saca numeric(10,2) not null,
  obs text,
  nota_bebida integer default 0,
  nota_acidez integer default 0,
  nota_corpo integer default 0,
  nota_docura integer default 0,
  nota_aroma integer default 0,
  nota_final integer default 0,
  obs_prova text,
  usado boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Blends aprovados
create table if not exists blends (
  id uuid primary key default gen_random_uuid(),
  data_aprovacao date not null,
  liga_id uuid references ligas(id),
  liga_numero text not null,
  liga_nome text not null,
  lotes_ids text[] not null,
  lotes_codigos text[] not null,
  imp_media numeric(5,2) not null,
  pva_media numeric(5,2) not null,
  preco_medio numeric(10,2) not null,
  nota_media numeric(3,1),
  status text not null default 'Aprovado',
  avisos text[],
  created_at timestamptz default now()
);

-- Trigger: atualiza updated_at nos lotes
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger lotes_updated_at
  before update on lotes
  for each row execute function update_updated_at();

-- Dados iniciais: ligas padrão
insert into ligas (numero, nome, descricao, imp_max, pva_max, preco_min, preco_max) values
  ('50350', 'MGT',      'Bebida mole, mercado interno',  1.0, 5.0,  800, 1200),
  ('50550', 'PIR',      'Pirâmide, exportação',          0.8, 4.0, 1000, 1500),
  ('50355', 'MGT EF',   'Estritamente fino',             1.2, 6.0,  700, 1100),
  ('50201', 'Espresso', 'Blend espresso premium',        0.5, 3.0, 1200, 1800)
on conflict (numero) do nothing;

-- RLS: acesso público (ajuste para produção com autenticação)
alter table ligas enable row level security;
alter table lotes enable row level security;
alter table blends enable row level security;

create policy "public_all_ligas" on ligas for all using (true) with check (true);
create policy "public_all_lotes" on lotes for all using (true) with check (true);
create policy "public_all_blends" on blends for all using (true) with check (true);
