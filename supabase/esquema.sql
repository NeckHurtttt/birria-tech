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

-- ---------- Vigía central: una PC del equipo escanea la cuenca cada 10 min y sube la lectura ----------
-- La PC NO usa la service_role: usa un token propio (solo sirve para subir lecturas). Se guarda su hash.
-- Alta de una PC (correr aparte, con un token largo y secreto):
--   insert into rs_recolectores (nombre, token_hash) values ('pc-rodrigo', crypt('<TOKEN>', gen_salt('bf')))
--   on conflict (nombre) do update set token_hash = excluded.token_hash;
create table if not exists rs_recolectores (
  nombre text primary key check (nombre ~ '^[a-z0-9-]{3,40}$'),
  token_hash text not null,
  activo boolean not null default true,
  alta timestamptz not null default now()
);

create table if not exists rs_lecturas (
  id bigint generated always as identity primary key,
  creado_en timestamptz not null default now(),
  recolector text not null references rs_recolectores(nombre) on delete cascade,
  medido_en timestamptz not null,
  ll6 real not null check (ll6 between 0 and 1000),
  ll24 real not null check (ll24 between 0 and 2000),
  prox6 real not null check (prox6 between 0 and 1000),
  prox24 real not null default 0 check (prox24 between 0 and 2000),
  caudal real check (caudal between 0 and 100000),
  caudal_pico real check (caudal_pico between 0 and 100000),
  indice int not null check (indice between 0 and 100),
  estado text not null check (estado in ('normal','vigilancia','alerta')),
  puntos jsonb not null default '[]'::jsonb check (jsonb_typeof(puntos) = 'array' and length(puntos::text) <= 4000),
  vivo boolean not null default true
);
create index if not exists rs_lecturas_medido on rs_lecturas (medido_en desc);

alter table rs_recolectores enable row level security;
alter table rs_lecturas enable row level security;
revoke all on rs_recolectores, rs_lecturas from anon, authenticated;

create or replace function rs_subir_lectura(p_recolector text, p_token text, p jsonb) returns bigint
language plpgsql security definer set search_path = public, extensions as $$
declare v_id bigint;
begin
  if not exists (select 1 from rs_recolectores where nombre = p_recolector and activo
                 and token_hash = crypt(coalesce(p_token, ''), token_hash)) then
    raise exception 'recolector o token incorrecto';
  end if;
  -- freno: como mucho 1 lectura por minuto por PC
  if exists (select 1 from rs_lecturas where recolector = p_recolector and creado_en > now() - interval '1 minute') then
    raise exception 'demasiado seguido';
  end if;
  insert into rs_lecturas (recolector, medido_en, ll6, ll24, prox6, prox24, caudal, caudal_pico, indice, estado, puntos, vivo)
  values (p_recolector, coalesce((p->>'medido_en')::timestamptz, now()),
          (p->>'ll6')::real, (p->>'ll24')::real, (p->>'prox6')::real, coalesce((p->>'prox24')::real, 0),
          (p->>'caudal')::real, (p->>'caudal_pico')::real, (p->>'indice')::int, p->>'estado',
          coalesce(p->'puntos', '[]'::jsonb), coalesce((p->>'vivo')::boolean, true))
  returning id into v_id;
  -- guardar solo 30 días
  delete from rs_lecturas where creado_en < now() - interval '30 days';
  return v_id;
end $$;

-- Lectura pública: la última de cualquier PC (la app decide si está fresca).
create or replace function rs_ultima_lectura() returns jsonb
language sql stable security definer set search_path = public as $$
  select to_jsonb(l) - 'id' from rs_lecturas l where medido_en <= now() + interval '5 minutes' order by medido_en desc limit 1;
$$;

grant execute on function rs_subir_lectura(text, text, jsonb), rs_ultima_lectura() to anon, authenticated;

-- ---------- URL del servidor ntfy de la comunidad ----------
-- El túnel rápido de Cloudflare cambia de dirección en cada reinicio: la PC la anuncia aquí (con su token)
-- y la app la lee al abrir. Así no hay que tocar js/config.js cada vez.
alter table rs_recolectores add column if not exists ntfy_url text check (ntfy_url ~ '^https://[a-z0-9.-]{4,120}/?$');
alter table rs_recolectores add column if not exists ntfy_visto timestamptz;

create or replace function rs_anunciar_nodo(p_recolector text, p_token text, p_url text) returns void
language plpgsql security definer set search_path = public, extensions as $$
begin
  update rs_recolectores set ntfy_url = p_url, ntfy_visto = now()
   where nombre = p_recolector and activo and token_hash = crypt(coalesce(p_token, ''), token_hash);
  if not found then raise exception 'recolector o token incorrecto'; end if;
end $$;

-- Lectura pública: la URL anunciada más reciente, solo si se vio en los últimos 30 min (si no, la PC está apagada).
create or replace function rs_nodo_url() returns text
language sql stable security definer set search_path = public as $$
  select ntfy_url from rs_recolectores where activo and ntfy_url is not null and ntfy_visto > now() - interval '30 minutes'
   order by ntfy_visto desc limit 1;
$$;

grant execute on function rs_anunciar_nodo(text, text, text), rs_nodo_url() to anon, authenticated;
