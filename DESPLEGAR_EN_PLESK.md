# Cómo migrar la web de Kunecting de Emergent a tu servidor Plesk

Guía paso a paso para llevar esta landing (React + FastAPI + MongoDB + notificaciones por email) a un servidor gestionado con Plesk.

**Tiempo estimado:** 1–2 horas.
**Qué necesitas antes de empezar:**
- Tu dominio (p. ej. `kunecting.com`) apuntando a la IP de tu servidor Plesk (registro A en tu proveedor de DNS).
- Acceso a Plesk con permisos para crear sitios, tareas y configurar Apache/nginx.
- Una cuenta gratuita en [MongoDB Atlas](https://www.mongodb.com/atlas) (base de datos en la nube).
- Una cuenta en [Resend](https://resend.com) (para los emails de aviso del formulario).

---

## Paso 1 — Descargar el código desde Emergent

Opción A (recomendada): botón **Guardar → Save to GitHub** en la barra de chat de Emergent, y clona el repo en tu ordenador:

```bash
git clone <url-de-tu-repo>
```

Opción B: botón **Code** en la barra superior de Emergent y copia los archivos manualmente.

La estructura que necesitas es:

```
backend/    → API en Python (FastAPI)
frontend/   → Web en React
```

## Paso 2 — Base de datos: MongoDB Atlas

1. Crea una cuenta en [mongodb.com/atlas](https://www.mongodb.com/atlas) y un **clúster gratuito (M0)**.
2. En **Database Access**, crea un usuario con contraseña (guárdalos).
3. En **Network Access**, añade la IP de tu servidor Plesk (o `0.0.0.0/0` temporalmente).
4. En **Connect → Drivers**, copia la cadena de conexión, parecida a:
   `mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net`

## Paso 3 — Email: cuenta propia de Resend

La integración de email de Emergent solo funciona dentro de Emergent. En tu servidor usarás tu propia cuenta de Resend (el código ya está preparado para ambos modos):

1. Regístrate en [resend.com](https://resend.com).
2. En **Domains → Add Domain**, añade tu dominio (p. ej. `kunecting.com`).
3. Resend te dará unos registros DNS (SPF/DKIM). Añádelos en **Plesk → DNS Settings** de tu dominio.
4. Espera a que Resend verifique el dominio (unos minutos).
5. En **API Keys**, crea una clave (`re_xxxx...`) y guárdala.

> Nota: sin dominio verificado solo podrás enviar a tu propio email de registro usando el remitente `onboarding@resend.dev`. Para producción, verifica el dominio.

## Paso 4 — Subir el código al servidor

- **Con Git en Plesk:** Sitios web y dominios → tu dominio → **Git** → añade tu repositorio y despliega en, por ejemplo, `/app`.
- **Con FTP/SFTP:** sube las carpetas `backend/` y `frontend/` a `/var/www/vhosts/tudominio.com/app/`.

## Paso 5 — Backend (API)

Conéctate por SSH a tu servidor (o usa la terminal de Plesk si la tienes):

```bash
cd /var/www/vhosts/tudominio.com/app/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Crea el archivo `.env` (usa `.env.example` como plantilla) con TUS valores:

```
MONGO_URL="mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net"
DB_NAME="kunecting"
CORS_ORIGINS="https://tudominio.com,https://www.tudominio.com"
RESEND_API_KEY="re_xxxxxxxxxxxx"
RESEND_FROM_EMAIL="Kunecting Web <web@tudominio.com>"
EMAIL_FROM_NAME="Kunecting"
EMAIL_REPLY_TO="hey@kunecting.com"
OWNER_NOTIFY_EMAIL="hey@kunecting.com"
```

> Importante: `OWNER_NOTIFY_EMAIL` y `EMAIL_REPLY_TO` deben ser buzones **reales y activos**. Si tu dominio no tiene servicio de correo, usa un email que sí funcione (p. ej. tu Gmail) o configura primero el correo de tu dominio en Plesk.

Comprueba que arranca:

```bash
venv/bin/uvicorn server:app --host 127.0.0.1 --port 8001
```

Deberías responder en `http://127.0.0.1:8001/api/` → `{"message":"Kunecting API"}`. Pulsa Ctrl+C para parar.

### Mantener la API siempre encendida (systemd)

Crea `/etc/systemd/system/kunecting-api.service`:

```ini
[Unit]
Description=Kunecting API
After=network.target

[Service]
WorkingDirectory=/var/www/vhosts/tudominio.com/app/backend
ExecStart=/var/www/vhosts/tudominio.com/app/backend/venv/bin/uvicorn server:app --host 127.0.0.1 --port 8001
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Y actívalo:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now kunecting-api
sudo systemctl status kunecting-api
```

> Si tu Plesk no te da acceso a systemd, puedes usar la extensión **Docker** de Plesk o una **tarea programada (cron)** que arranque uvicorn tras cada reinicio.

## Paso 6 — Frontend (web estática)

En tu ordenador (o en el servidor si tiene Node.js):

```bash
cd frontend
echo 'REACT_APP_BACKEND_URL=https://tudominio.com' > .env.production
yarn install
yarn build
```

Esto genera la carpeta `build/`. Sube **el contenido** de `build/` al directorio web de tu dominio en Plesk (normalmente `httpdocs/`).

> El archivo `.htaccess` necesario para el enrutado ya está incluido en `frontend/public/` y se copia automáticamente al build.

## Paso 7 — Redirigir /api al backend

En Plesk → tu dominio → **Apache & nginx Settings** → **Additional nginx directives**:

```nginx
location /api/ {
    proxy_pass http://127.0.0.1:8001;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

Si no usas nginx, en **Additional directives for HTTPS** (Apache):

```apache
ProxyPass /api/ http://127.0.0.1:8001/api/
ProxyPassReverse /api/ http://127.0.0.1:8001/api/
```

## Paso 8 — SSL gratuito

Plesk → tu dominio → **SSL/TLS Certificates** → **Let's Encrypt** → emitir para el dominio y `www`. Activa la redirección permanente de HTTP a HTTPS.

## Paso 9 — Comprobaciones finales

1. Abre `https://tudominio.com` → debe cargar la landing (ES/EN según el navegador).
2. Abre `https://tudominio.com/api/` → debe responder `{"message":"Kunecting API"}`.
3. Envía el formulario de contacto → debe aparecer el toast de éxito, llegarte el email a `hey@kunecting.com` y quedar guardado en MongoDB Atlas (colección `contact_enquiries`).

## Solución de problemas

| Síntoma | Causa probable | Solución |
|---|---|---|
| El formulario da error | `/api` no llega al backend | Revisa el proxy del paso 7 y que el servicio systemd está activo |
| Error CORS en consola | Falta tu dominio en `CORS_ORIGINS` | Añádelo en `backend/.env` y reinicia el servicio |
| No llega el email | Dominio no verificado en Resend o clave incorrecta | Revisa el paso 3 y los logs: `sudo journalctl -u kunecting-api -f` |
| 404 al recargar una ruta | Falta el `.htaccess` | Asegúrate de subir todo el contenido de `build/`, incluido `.htaccess` |
| La web sale en inglés | Es lo esperado si tu navegador está en inglés | Usa el selector ES/EN del header |

## Notas

- El código funciona en **dos modos de email**: si existe `RESEND_API_KEY` usa tu cuenta de Resend (modo Plesk); si no, usa la integración gestionada de Emergent (modo Emergent). No tienes que tocar código.
- Las variables `EMERGENT_EMAIL_KEY` y similares de Emergent **no son necesarias** en tu servidor.
