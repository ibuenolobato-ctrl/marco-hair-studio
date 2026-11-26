# Cómo terminar de rellenar y publicar Marco Hair Studio

Todo el contenido visible y el SEO de la web se editan en un único archivo: `src/config/salon.config.js`.
Cualquier campo que quede como `""` se oculta automáticamente sin mostrar errores.

---

## 1. Datos pendientes de confirmar con Marco
Abre `src/config/salon.config.js` y completa estos puntos cuando hables con él:

- [ ] **Dirección y mapa (`business.address` y `business.googleMapsUrl`):** Calle exacta y enlace de Google Maps.
- [ ] **Teléfono y WhatsApp (`business.phoneDisplay` y `business.whatsappNumber`):** Teléfono visible (ej. `"665 69 45 57"`) y número internacional sin `+` ni espacios (ej. `"34665694557"`).
- [ ] **Instagram (`business.instagramUrl`):** Enlace completo al perfil (ej. `"https://instagram.com/..."`).
- [ ] **Horario exacto (`hours`):** Sustituye `"Horario pendiente de confirmar"` en `Lunes a Viernes` (y añade sábado si abre).
- [ ] **Servicio `Corte` y resto de servicios (`services`):** Añade `duration` (ej. `"40 min"`), `price` (ej. `"18 €"`) y añade más servicios si hace falta.
- [ ] **Enlace de reservas Cal.com (`booking.calEmbedUrl` y `bookingUrl`):** Una vez creada la cuenta de Cal.com / Cal.eu con el correo de Marco, pega aquí su URL pública.
- [ ] **Dominio público (`site.domain`):** Pon la URL final (ej. `"https://marcohairstudio.es"`) para activar `canonical`, `og:url` y `url` en JSON-LD.

---

## 2. Cómo conectar Cal.com (o agenda externa)
1. Copia el enlace público de Cal.com / Cal.eu (ej. `https://cal.com/marco-hair-studio` o `https://cal.eu/...`) y pégalo en `booking.calEmbedUrl`.
   - El sistema carga automáticamente el embed oficial inline en tema claro.
2. *(Opcional)* Si creas eventos distintos por servicio (ej. `https://cal.com/marco-hair-studio/corte`), pega el enlace concreto en `bookingUrl` dentro del servicio correspondiente.
3. Si en lugar de Cal.com decides usar otro enlace externo (Booksy, Fresha, Treatwell, etc.), cambia `booking.provider` a `'external'`, pon la URL en `booking.calEmbedUrl` y escribe el texto del botón en `booking.fallbackLabel`.

---

## 3. Vista wireframe y personalización visual
- **Vista de maqueta (solo desarrollo):** `http://localhost:5174/?preview=wireframe`
- **Colores de marca:** se ajustan desde las variables `:root` en `src/styles/main.css` (`--color-bg`, `--color-surface`, `--color-ink`, `--color-muted`, `--color-accent`).

---

## 4. Verificación previa y despliegue estático (Cloudflare Pages o Vercel)

Antes de publicar, ejecuta en la raíz del proyecto:

```bash
npm run check:ready
npm run build
```

- `npm run check:ready` valida que no falten los datos obligatorios (`business.name`, `business.address`, al menos 1 servicio y canal de reservas o WhatsApp).
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
