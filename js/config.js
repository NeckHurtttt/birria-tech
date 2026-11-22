// Supabase del registro compartido. La clave es la PÚBLICA («publishable»): se puede subir.
// Nunca poner aquí la service_role. Si se dejan vacías, el registro queda solo en este celular.
export const SUPABASE_URL = 'https://ikvweublhkuijdcublhd.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_FxqUDsBEnXtP0pQNrMOYEw_uLl_ktNX';

// ntfy del nodo comunitario (la PC de la junta o del COED, publicada con un túnel https). Vacío = solo ntfy.sh.
// También se puede pasar en la URL: ?ntfy=https://mi-servidor. Ver nodo/README.md.
export const NTFY_PROPIO = 'https://principal-acceptable-assist-prescribed.trycloudflare.com'; // túnel rápido de la PC de Reynaldo (22/11): cambia si se reinicia
