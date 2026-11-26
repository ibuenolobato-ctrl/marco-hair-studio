import './styles/main.css';
import { SALON_CONFIG } from './config/salon.config.js';

const WIREFRAME_DATA = {
  business: {
    name: '[Nombre del salón]',
    shortDescription: '[Descripción breve del salón y ubicación]',
    address: '[Dirección del salón]',
    googleMapsUrl: '#ubicacion-wireframe',
    phoneDisplay: '[Teléfono]',
    whatsappNumber: '000000000',
    instagramUrl: '#instagram-wireframe'
  },
  hours: [
    { days: '[Días laborables]', time: '[Horario mañana · tarde]' },
    { days: '[Sábados]', time: '[Horario mañana]' }
  ],
  booking: {
    provider: 'calcom',
    calEmbedUrl: '',
    fallbackLabel: '[Reservar cita]'
  },
  services: [
    {
      name: '[Servicio 01]',
      duration: '[Duración]',
      price: '[Precio]',
      description: '[Descripción opcional del servicio]',
      bookingUrl: ''
    },
    {
      name: '[Servicio 02]',
      duration: '[Duración]',
      price: '[Precio]',
      description: '',
      bookingUrl: ''
    },
    {
      name: '[Servicio 03]',
      duration: '[Duración]',
      price: '[Precio]',
      description: '',
      bookingUrl: ''
    }
  ]
};

const isWireframe =
  import.meta.env.DEV &&
  new URLSearchParams(window.location.search).get('preview') === 'wireframe';

const activeConfig = isWireframe ? WIREFRAME_DATA : SALON_CONFIG;
let selectedService = null;

function escapeHtml(value) {
  if (value === undefined || value === null) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function cleanText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function sanitizeHref(rawUrl) {
  const trimmed = cleanText(rawUrl);
  if (!trimmed) return '';
  if (trimmed.startsWith('#')) return trimmed;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
  } catch {
    return '';
  }
  return '';
}

function buildCalEmbedUrl(rawUrl) {
  const safe = sanitizeHref(rawUrl);
  if (!safe || safe.startsWith('#')) return '';
  try {
    const url = new URL(safe);
    if (!url.searchParams.has('embed')) {
      url.searchParams.set('embed', 'true');
    }
    if (!url.searchParams.has('layout')) {
      url.searchParams.set('layout', 'month_view');
    }
    return url.toString();
  } catch {
    return '';
  }
}

function buildWhatsappHref(whatsappNumber, serviceName) {
  const digits = cleanText(whatsappNumber).replace(/\D+/g, '');
  if (!digits) return '';
  const text = serviceName
    ? `Hola, me gustaría consultar cita para: ${serviceName}`
    : 'Hola, me gustaría pedir cita.';
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

function renderHeader() {
  const header = document.getElementById('salon-header');
  if (!header) return;

  const b = activeConfig.business || {};
  const name = cleanText(b.name);
  const shortDesc = cleanText(b.shortDescription);
  const address = cleanText(b.address);
  const mapsUrl = sanitizeHref(b.googleMapsUrl);
  const phoneDisplay = cleanText(b.phoneDisplay);
  const telDigits = phoneDisplay.replace(/[^\d+]/g, '');
  const waHref = buildWhatsappHref(b.whatsappNumber, '');

  const hasContent = name || shortDesc || address || phoneDisplay || waHref;
  if (!hasContent) {
    header.classList.add('hidden');
    return;
  }

  header.classList.remove('hidden');

  const addressHtml = address
    ? mapsUrl
      ? `<a href="${escapeHtml(mapsUrl)}" ${mapsUrl.startsWith('#') ? '' : 'target="_blank" rel="noopener noreferrer"'} class="inline-flex items-center gap-1.5 text-sm text-[var(--color-muted)] underline decoration-[color-mix(in_srgb,var(--color-ink)_25%,transparent)] underline-offset-4 hover:text-[var(--color-ink)]">${escapeHtml(address)}</a>`
      : `<p class="text-sm text-[var(--color-muted)]">${escapeHtml(address)}</p>`
    : '';

  const actions = [];
  if (phoneDisplay && telDigits) {
    actions.push(
      `<a href="${isWireframe ? '#telefono-wireframe' : `tel:${escapeHtml(telDigits)}`}" class="btn-secondary badge-pill">${escapeHtml(phoneDisplay)}</a>`
    );
  }
  if (waHref) {
    actions.push(
      `<a href="${isWireframe ? '#whatsapp-wireframe' : escapeHtml(waHref)}" ${isWireframe ? '' : 'target="_blank" rel="noopener noreferrer"'} class="btn-primary badge-pill">WhatsApp</a>`
    );
  }

  header.innerHTML = `
    <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div class="space-y-1.5">
        ${name ? `<h1 class="text-2xl font-bold tracking-tight sm:text-3xl">${escapeHtml(name)}</h1>` : ''}
        ${shortDesc ? `<p class="text-sm text-[var(--color-muted)]">${escapeHtml(shortDesc)}</p>` : ''}
        ${addressHtml}
      </div>
      ${actions.length > 0 ? `<div class="flex flex-wrap items-center gap-2 shrink-0">${actions.join('')}</div>` : ''}
    </div>
  `;
}

function renderServices() {
  const listEl = document.getElementById('services-list');
  const countEl = document.getElementById('services-count');
  if (!listEl) return;

  const services = Array.isArray(activeConfig.services)
    ? activeConfig.services.filter((s) => cleanText(s?.name))
    : [];

  if (countEl) {
    countEl.textContent = services.length > 0 ? `${services.length} disponibles` : '';
  }

  if (services.length === 0) {
    listEl.innerHTML = `
      <div class="surface-card p-5 text-sm text-[var(--color-muted)]">
        No hay servicios configurados todavía. Añádelos en <code class="font-mono text-xs text-[var(--color-ink)]">src/config/salon.config.js</code>.
      </div>
    `;
    return;
  }

  listEl.innerHTML = services
    .map((srv, idx) => {
      const name = cleanText(srv.name);
      const duration = cleanText(srv.duration);
      const price = cleanText(srv.price);
      const desc = cleanText(srv.description);
      const meta = [duration, price].filter(Boolean).join(' · ');

      return `
        <article class="surface-card p-4 sm:p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="space-y-1 min-w-0">
            <div class="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
              <h3 class="text-base font-semibold tracking-tight">${escapeHtml(name)}</h3>
              ${meta ? `<span class="text-xs font-medium text-[var(--color-muted)] badge-pill">${escapeHtml(meta)}</span>` : ''}
            </div>
            ${desc ? `<p class="text-sm text-[var(--color-muted)]">${escapeHtml(desc)}</p>` : ''}
          </div>
          <button type="button" data-service-index="${idx}" class="btn-primary badge-pill self-start sm:self-center">
            Reservar
          </button>
        </article>
      `;
    })
    .join('');

  listEl.querySelectorAll('[data-service-index]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.getAttribute('data-service-index'));
      const targetService = services[idx];
      if (!targetService) return;
      selectedService = targetService;
      renderBookingSection();
      const bookingSection = document.getElementById('reservar');
      if (bookingSection) bookingSection.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

function renderBookingSection() {
  const container = document.getElementById('booking-container');
  const activeLabel = document.getElementById('active-service-label');
  const secondaryActions = document.getElementById('booking-secondary-actions');
  if (!container) return;

  const booking = activeConfig.booking || {};
  const provider = booking.provider === 'external' ? 'external' : 'calcom';
  const rawTargetUrl = cleanText(selectedService?.bookingUrl) || cleanText(booking.calEmbedUrl);
  const safeTargetUrl = sanitizeHref(rawTargetUrl);
  const fallbackLabel = cleanText(booking.fallbackLabel) || 'Abrir calendario de reservas';

  if (activeLabel) {
    activeLabel.textContent = selectedService?.name
      ? `Servicio seleccionado: ${selectedService.name}${selectedService.duration ? ` (${selectedService.duration})` : ''}`
      : 'Elige fecha y hora en el calendario o selecciona un servicio arriba.';
  }

  if (isWireframe) {
    container.innerHTML = `
      <div class="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-[color-mix(in_srgb,var(--color-ink)_25%,transparent)] p-6 text-center space-y-2">
        <span class="text-sm font-semibold">[Calendario de reservas embebido]</span>
        <p class="text-xs text-[var(--color-muted)] max-w-sm">
          ${selectedService ? `Cargando enlace para: ${escapeHtml(selectedService.name)}` : 'Aquí se cargará el embed de Cal.com o enlace externo configurado.'}
        </p>
      </div>
    `;
  } else if (!safeTargetUrl || safeTargetUrl.startsWith('#')) {
    container.innerHTML = `
      <div class="py-8 px-4 text-center space-y-2">
        <p class="text-sm font-semibold">Falta configurar la URL de reservas</p>
        <p class="text-xs text-[var(--color-muted)] max-w-md mx-auto">
          Añade tu enlace de Cal.com en <code class="font-mono text-[var(--color-ink)]">booking.calEmbedUrl</code> o en cada servicio dentro de <code class="font-mono text-[var(--color-ink)]">src/config/salon.config.js</code>.
        </p>
      </div>
    `;
  } else if (provider === 'calcom') {
    const embedSrc = buildCalEmbedUrl(safeTargetUrl);
    if (embedSrc) {
      container.innerHTML = `
        <iframe
          src="${escapeHtml(embedSrc)}"
          title="Calendario de reservas"
          loading="lazy"
          class="cal-embed-frame"
        ></iframe>
        <div class="flex justify-end">
          <a href="${escapeHtml(safeTargetUrl)}" target="_blank" rel="noopener noreferrer" class="text-xs font-medium text-[var(--color-muted)] underline underline-offset-4 hover:text-[var(--color-ink)]">
            Abrir calendario en ventana nueva
          </a>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="py-6 text-center space-y-3">
          <p class="text-sm text-[var(--color-muted)]">La URL de reserva configurada no es válida.</p>
        </div>
      `;
    }
  } else {
    container.innerHTML = `
      <div class="py-6 text-center space-y-4">
        <p class="text-sm text-[var(--color-muted)]">
          Pulsa el botón para elegir día y hora en nuestra agenda externa.
        </p>
        <a href="${escapeHtml(safeTargetUrl)}" target="_blank" rel="noopener noreferrer" class="btn-primary badge-pill">
          ${escapeHtml(fallbackLabel)}
        </a>
      </div>
    `;
  }

  if (secondaryActions) {
    const waHref = buildWhatsappHref(activeConfig.business?.whatsappNumber, selectedService?.name);
    if (waHref) {
      secondaryActions.innerHTML = `
        <a href="${isWireframe ? '#whatsapp-wireframe' : escapeHtml(waHref)}" ${isWireframe ? '' : 'target="_blank" rel="noopener noreferrer"'} class="btn-secondary badge-pill">
          Consultar o pedir cita por WhatsApp
        </a>
      `;
    } else {
      secondaryActions.innerHTML = '';
    }
  }
}

function renderFooter() {
  const footer = document.getElementById('salon-footer');
  if (!footer) return;

  const b = activeConfig.business || {};
  const hours = Array.isArray(activeConfig.hours)
    ? activeConfig.hours.filter((h) => cleanText(h?.days) || cleanText(h?.time))
    : [];

  const address = cleanText(b.address);
  const mapsUrl = sanitizeHref(b.googleMapsUrl);
  const phoneDisplay = cleanText(b.phoneDisplay);
  const telDigits = phoneDisplay.replace(/[^\d+]/g, '');
  const instagramUrl = sanitizeHref(b.instagramUrl);

  if (hours.length === 0 && !address && !phoneDisplay && !instagramUrl) {
    footer.classList.add('hidden');
    return;
  }

  footer.classList.remove('hidden');

  const hoursHtml =
    hours.length > 0
      ? `
      <div class="space-y-1.5">
        <p class="font-semibold text-[var(--color-ink)]">Horario</p>
        <ul class="space-y-1">
          ${hours
            .map(
              (h) => `
            <li class="flex justify-between gap-4">
              <span>${escapeHtml(cleanText(h.days))}</span>
              <span class="font-medium text-[var(--color-ink)] tabular-nums">${escapeHtml(cleanText(h.time))}</span>
            </li>
          `
            )
            .join('')}
        </ul>
      </div>
    `
      : '';

  const infoItems = [];
  if (address) {
    infoItems.push(
      mapsUrl
        ? `<a href="${escapeHtml(mapsUrl)}" ${mapsUrl.startsWith('#') ? '' : 'target="_blank" rel="noopener noreferrer"'} class="underline underline-offset-4 hover:text-[var(--color-ink)]">${escapeHtml(address)}</a>`
        : `<span>${escapeHtml(address)}</span>`
    );
  }
  if (phoneDisplay && telDigits) {
    infoItems.push(
      `<a href="${isWireframe ? '#telefono-wireframe' : `tel:${escapeHtml(telDigits)}`}" class="hover:text-[var(--color-ink)]">${escapeHtml(phoneDisplay)}</a>`
    );
  }
  if (instagramUrl) {
    infoItems.push(
      `<a href="${escapeHtml(instagramUrl)}" ${instagramUrl.startsWith('#') ? '' : 'target="_blank" rel="noopener noreferrer"'} class="underline underline-offset-4 hover:text-[var(--color-ink)]">Instagram</a>`
    );
  }

  footer.innerHTML = `
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
      ${hoursHtml}
      ${
        infoItems.length > 0
          ? `<div class="space-y-1.5 ${hoursHtml ? 'sm:text-right' : ''}">
              <p class="font-semibold text-[var(--color-ink)]">Ubicación y contacto</p>
              <div class="flex flex-col gap-1 ${hoursHtml ? 'sm:items-end' : ''}">${infoItems.join('')}</div>
            </div>`
          : ''
      }
    </div>
  `;
}

function init() {
  if (isWireframe) {
    const banner = document.getElementById('wireframe-banner');
    if (banner) banner.classList.remove('hidden');
  }

  renderHeader();
  renderServices();
  renderBookingSection();
  renderFooter();
}

document.addEventListener('DOMContentLoaded', init);
