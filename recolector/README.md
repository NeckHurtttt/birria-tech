# Recolector (PC del equipo)

La PC del equipo lee la lluvia de la cuenca alta del Piraí (Open-Meteo, 5 puntos) y el caudal en La Angostura (GloFAS) **cada 10 minutos**, calcula el índice de riesgo y los minutos por barrio con la misma lógica de la app, y **sube una fila a Supabase** (`rs_lecturas`).

La PC es solo un **recolector**, no el centro del sistema. La app (GitHub Pages + Supabase) muestra la última lectura si tiene menos de 20 minutos, como «Vigía central (PC del equipo)». **Si la PC se apaga, la app sigue escaneando sola desde el navegador**, como siempre.

Si el índice pasa el umbral de alerta, el recolector publica **un solo aviso por evento** en el canal ntfy de la app. Sin internet, reintenta y guarda las lecturas en `pendientes.jsonl`; las sube cuando vuelve la red.

## Requisitos

- Windows 10/11 con **Node.js 20 o más nuevo** ([nodejs.org](https://nodejs.org), versión LTS).
- La tabla `rs_lecturas` creada en Supabase: la sección del final de `supabase/esquema.sql`, que corre el dueño del proyecto.

## 1. Poner la clave

1. Copiar `recolector\.env.ejemplo` a `recolector\.env`.
2. En Supabase → *Project Settings → API*, copiar la clave **service_role** en `SUPABASE_SERVICE_KEY=`.
3. En `NTFY_TEMA=` poner el tema de la central (el de `index.html?jurado&t=...`).

> La clave service_role puede escribir en toda la base: **nunca** se sube a git (`.env` está en `.gitignore`) ni se comparte por chat.

Probar a mano, sin instalar nada:

```powershell
node recolector\recolector.mjs --una-vez
```

## 2. Instalar (arranca solo con Windows)

En **PowerShell como administrador**, desde la carpeta del repositorio:

```powershell
powershell -ExecutionPolicy Bypass -File recolector\instalar.ps1
```

Crea la tarea programada **ElRioSuena-Recolector**:
- Corre cada 10 minutos y al iniciar Windows, **aunque no haya sesión iniciada**.
- No abre ninguna ventana.
- Sigue funcionando con la batería.

Se puede ver en el *Programador de tareas*.

**Recomendado:** *Configuración → Sistema → Energía* → que la PC **no se suspenda cuando está enchufada**. Si se suspende, no hay lecturas, pero la app sigue funcionando sola.

## Ver qué está haciendo

```powershell
Get-Content recolector\registro.log -Tail 20 -Wait
```

El registro rota solo al pasar los 5 MB (`registro.log.1`). Si hay lecturas esperando a subir, están en `recolector\pendientes.jsonl`.

## Parar

```powershell
powershell -ExecutionPolicy Bypass -File recolector\desinstalar.ps1
```

Para una pausa corta: *Programador de tareas* → **ElRioSuena-Recolector** → *Deshabilitar*.
