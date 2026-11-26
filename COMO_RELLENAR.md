# Cómo rellenar y publicar `salon-booking-minimal`

Esta plantilla está vacía a propósito. Todo el contenido del negocio se edita en un único archivo: `src/config/salon.config.js`.

---

## 1. Previsualizar la estructura antes de meter datos
Arranca el servidor local (`npm run dev`) y abre en desarrollo la vista wireframe:

```text
http://localhost:5174/?preview=wireframe
```

*(Solo funciona en modo desarrollo; en producción `npm run build` no se incluye ni se muestra).*

---

## 2. Rellenar los datos del salón (`src/config/salon.config.js`)
Cualquier campo que dejes como `""` o `[]` **se oculta automáticamente** en la web y en el SEO.

1. **`business`:**
   - `name`: Nombre del salón (también genera el `<title>` y el JSON-LD `HairSalon`).
   - `shortDescription`: Breve frase de una línea (también se usa en `<meta name="description">`).
   - `address` y `googleMapsUrl`: Dirección y enlace directo a Google Maps.
   - `phoneDisplay`: Teléfono visible con formato (ej. `"600 123 456"`).
   - `whatsappNumber`: Número internacional sin `+` ni espacios (ej. `"34600123456"`).
   - `instagramUrl`: Enlace completo al perfil de Instagram.
2. **`hours`:**
   - Lista de tramos horarios:
     ```js
     hours: [
       { days: 'Lunes a Viernes', time: '10:00 – 14:00 · 16:30 – 20:00' },
       { days: 'Sábados', time: '09:30 – 14:00' }
     ]
     ```
3. **`services`:**
   - Añade cada servicio con `name`, `duration`, `price`, `description` (opcional) y `bookingUrl` (opcional):
     ```js
     services: [
       {
         name: 'Corte & Peinado',
         duration: '45 min',
         price: '22 €',
         description: 'Lavado y secado natural.',
         bookingUrl: 'https://cal.com/tu-salon/corte'
       }
     ]
     ```

---

## 3. Cómo conectar Cal.com (o cualquier agenda externa)
1. En Cal.com, copia el enlace público de tu perfil (ej. `https://cal.com/tu-salon`) y pégalo en `booking.calEmbedUrl`.
   - La web añade automáticamente `?embed=true&layout=month_view` para mostrarlo integrado dentro de la página.
2. *(Opcional)* Si tienes un tipo de evento distinto por servicio (ej. Corte 45 min vs. Color 90 min), pega su enlace en `bookingUrl` dentro de ese servicio en `services`. Al pulsar **Reservar** en ese servicio, el calendario cambiará automáticamente a ese evento.
3. Si prefieres otra plataforma (Fresha, Treatwell, Booksy, Google Calendar, etc.) en lugar del iframe de Cal.com, cambia `booking.provider` a `'external'`, pon la URL en `booking.calEmbedUrl` (o en cada servicio) y personaliza `booking.fallbackLabel`.

---

## 4. Personalizar los colores (opcional)
En `src/styles/main.css` solo hay 4 variables de color en `:root`:

```css
:root {
  --color-bg: #FAFAF9;
  --color-surface: #FFFFFF;
  --color-ink: #111111;
  --color-muted: #57534E;
}
```

---

## 5. Verificación previa y despliegue estático (Cloudflare Pages o Vercel)

Antes de subir a producción, ejecuta en la raíz del proyecto:

```bash
npm run check:ready
npm run build
```

- `npm run check:ready` comprueba que no falten los datos mínimos (`business.name`, `business.address`, al menos 1 servicio y URL de reservas o WhatsApp).
- `npm run build` genera la carpeta estática `dist/`.

### Despliegue desde GitHub
1. **Cloudflare Pages:**
   - Conecta el repositorio de GitHub.
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Variables de entorno:** ninguna obligatoria.
   - Incluye soporte automático de cabeceras de seguridad mediante `public/_headers`.
2. **Vercel:**
   - Importa el repositorio desde GitHub (detectará Vite automáticamente).
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Environment Variables:** ninguna obligatoria.

