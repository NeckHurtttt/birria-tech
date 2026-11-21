# Vigía central (PC del equipo)

Una PC del equipo escanea la cuenca alta del Piraí **cada 10 minutos** (lluvia en 5 puntos con Open-Meteo y caudal GloFAS en La Angostura, la misma lógica que la app), calcula el riesgo y **sube la lectura a Supabase**.
La app la usa si tiene menos de 20 min («vigía central (PC del equipo)»). Si la PC se apaga, la app sigue escaneando sola desde el navegador: **no es un punto único de falla**.

- No abre puertos ni recibe conexiones: solo envía.
- No usa la clave service_role: usa un **token propio** que solo sirve para subir lecturas.
- Sin internet: guarda en `pendientes.jsonl` y lo sube cuando vuelve la red.
- Alerta por ntfy (opcional) **una sola vez** al entrar en alerta, no cada 10 min.

## Instalar (Windows)

1. Instalar **Node.js 20 o más nuevo** (https://nodejs.org) y clonar el repo.
2. Copiar `recolector\.env.ejemplo` como `recolector\.env` y poner `RECOLECTOR` y `TOKEN` (los da el dueño del repo por privado).
3. Probar: `node recolector\recolector.mjs --una-vez` → debe decir `subida ok`.
4. PowerShell **como administrador**, en la carpeta del repo:
   `powershell -ExecutionPolicy Bypass -File recolector\instalar.ps1`
5. Energía: que la PC no se suspenda enchufada.

Ver qué hace: `recolector\registro.log`. Parar: `recolector\desinstalar.ps1`. Actualizar: `git pull` (la tarea usa el código nuevo sola).

## Alta de una PC en Supabase (dueño del repo)

En Supabase → SQL Editor, una vez (después de `supabase/esquema.sql`):

```sql
insert into rs_recolectores (nombre, token_hash) values ('pc-rodrigo', crypt('TOKEN-LARGO-Y-SECRETO', gen_salt('bf')))
on conflict (nombre) do update set token_hash = excluded.token_hash;
```

Desactivar una PC: `update rs_recolectores set activo = false where nombre = 'pc-rodrigo';`
