-- El Río Suena · registro compartido de la junta vecinal (Supabase / Postgres).
-- Pegar entero en Supabase → SQL Editor → Run. Se puede correr más de una vez.
-- Las tablas NO se leen directo con la clave pública: RLS activado y sin políticas.
-- Todo pasa por funciones que validan los datos y piden la clave de la junta para ver o aprobar.

create extension if not exists pgcrypto;

create table if not exists rs_juntas (
  comunidad text primary key check (comunidad ~ '^[a-z0-9-]{3,40}$'),
  clave_hash text not null,
  creada timestamptz not null default now()
);

create table if not exists rs_personas (
  id uuid primary key,
  comunidad text not null references rs_juntas(comunidad) on delete cascade,
  nombre text not null check (length(nombre) between 1 and 60),
  edad int check (edad between 0 and 120),
  necesidad text not null check (length(necesidad) between 1 and 80),
  barrio text not null check (barrio in ('jorochito','eltorno','porongo','urubo','portachuelo')),
  cuadra text not null check (length(cuadra) between 1 and 40),
  guardian text not null check (length(guardian) between 1 and 60),
  tel text check (tel ~ '^\+?[0-9]{6,15}$'),
  idioma text not null default 'castellano' check (length(idioma) <= 20),
  aprobado boolean not null default false,
  alta timestamptz not null default now()
);
create index if not exists rs_personas_comunidad on rs_personas (comunidad);

alter table rs_juntas enable row level security;
alter table rs_personas enable row level security;
revoke all on rs_juntas, rs_personas from anon, authenticated;

-- Junta de demostración: comunidad «demo», clave «1312» (por el 13/12). Cambiarla para un piloto real.
insert into rs_juntas (comunidad, clave_hash) values ('demo', crypt('1312', gen_salt('bf')))
on conflict (comunidad) do nothing;

create or replace function rs_clave_ok(p_comunidad text, p_clave text) returns boolean
language sql stable security definer set search_path = public, extensions as $$
  select exists (select 1 from rs_juntas where comunidad = p_comunidad and clave_hash = crypt(coalesce(p_clave, ''), clave_hash));
$$;

-- Cualquiera con el enlace de la comunidad puede registrar; queda PENDIENTE hasta que la junta aprueba.
create or replace function rs_registrar(p_comunidad text, p jsonb) returns uuid
language plpgsql security definer set search_path = public, extensions as $$
declare v_id uuid := coalesce((p->>'id')::uuid, gen_random_uuid());
begin
  if not exists (select 1 from rs_juntas where comunidad = p_comunidad) then raise exception 'comunidad desconocida'; end if;
  -- freno simple contra spam: máximo 30 altas por comunidad cada 10 minutos
  if (select count(*) from rs_personas where comunidad = p_comunidad and alta > now() - interval '10 minutes') >= 30 then
    raise exception 'demasiados registros seguidos, espera unos minutos';
  end if;
  insert into rs_personas (id, comunidad, nombre, edad, necesidad, barrio, cuadra, guardian, tel, idioma, aprobado)
  values (v_id, p_comunidad, trim(p->>'nombre'), nullif(p->>'edad', '')::int, trim(p->>'necesidad'), p->>'barrio',
          trim(p->>'cuadra'), trim(p->>'guardian'), nullif(p->>'tel', ''), coalesce(nullif(p->>'idioma', ''), 'castellano'), false)
  on conflict (id) do nothing;
  return v_id;
end $$;

create or replace function rs_listar(p_comunidad text, p_clave text) returns setof rs_personas
language plpgsql stable security definer set search_path = public, extensions as $$
begin
  if not rs_clave_ok(p_comunidad, p_clave) then raise exception 'clave de la junta incorrecta'; end if;
  return query select * from rs_personas where comunidad = p_comunidad order by alta;
end $$;

create or replace function rs_aprobar(p_comunidad text, p_clave text, p_id uuid, p_aprobado boolean default true) returns void
language plpgsql security definer set search_path = public, extensions as $$
begin
  if not rs_clave_ok(p_comunidad, p_clave) then raise exception 'clave de la junta incorrecta'; end if;
  update rs_personas set aprobado = p_aprobado where id = p_id and comunidad = p_comunidad;
end $$;

create or replace function rs_quitar(p_comunidad text, p_clave text, p_id uuid) returns void
language plpgsql security definer set search_path = public, extensions as $$
begin
  if not rs_clave_ok(p_comunidad, p_clave) then raise exception 'clave de la junta incorrecta'; end if;
  delete from rs_personas where id = p_id and comunidad = p_comunidad;
end $$;

revoke all on function rs_clave_ok(text, text) from public, anon, authenticated;
grant execute on function rs_registrar(text, jsonb), rs_listar(text, text), rs_aprobar(text, text, uuid, boolean), rs_quitar(text, text, uuid) to anon, authenticated;

-- ============================================================================================
-- Lecturas del río (recolector en la PC del equipo, ver recolector/README.md).
-- Lectura PÚBLICA (la app las muestra sin clave). Escritura solo con la clave service_role,
-- que se salta RLS: no hay política de insert/update/delete para anon ni authenticated.
-- ============================================================================================
create table if not exists rs_lecturas (
  id bigint generated always as identity primary key,
  creado_en timestamptz not null default now(),
  ll6 real not null check (ll6 >= 0),          -- lluvia de las últimas 6 h (mm, peor punto de la cuenca alta)
  ll24 real not null check (ll24 >= 0),        -- últimas 24 h
  prox6 real not null check (prox6 >= 0),      -- pronóstico próximas 6 h
  prox24 real not null default 0 check (prox24 >= 0),
  caudal real not null check (caudal >= 0),    -- caudal GloFAS en La Angostura (pico próximos días, m³/s)
  indice int not null check (indice between 0 and 100),
  nivel text not null check (nivel in ('normal', 'vigilancia', 'alerta')),
  barrios jsonb not null default '[]'::jsonb,  -- [{id, nombre, km, minutos}]
  origen text not null default 'pc' check (length(origen) <= 40)
);
create index if not exists rs_lecturas_creado on rs_lecturas (creado_en desc);

alter table rs_lecturas enable row level security;
revoke all on rs_lecturas from anon, authenticated;
grant select on rs_lecturas to anon, authenticated;
drop policy if exists rs_lecturas_leer on rs_lecturas;
create policy rs_lecturas_leer on rs_lecturas for select to anon, authenticated using (true);
