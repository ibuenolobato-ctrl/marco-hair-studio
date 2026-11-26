import './styles/main.css';
import { SALON_CONFIG } from './config/salon.config.js';

const WIREFRAME_DATA = {
  business: {
    name: '[Nombre del salón]',
    shortDescription: '[Subtítulo breve del salón]',
    address: '[Dirección del salón]',
    googleMapsUrl: '#ubicacion-wireframe',
    phoneDisplay: '[Teléfono]',
    whatsappNumber: '000000000',
    instagramUrl: '#instagram-wireframe'
  },
  hours: [
    { days: '[Lunes a Viernes]', time: '[Horario mañana · tarde]' },
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

function parseCalUrl(rawUrl) {
  const safe = sanitizeHref(rawUrl);
  if (!safe || safe.startsWith('#')) return null;
  try {
    const url = new URL(safe);
    if (url.protocol !== 'https:') return null;
    const host = url.hostname.toLowerCase();

    let calOrigin = '';
    if (host === 'cal.com' || host === 'app.cal.com' || host.endsWith('.cal.com')) {
      calOrigin = 'https://app.cal.com';
    } else if (host === 'cal.eu' || host === 'app.cal.eu' || host.endsWith('.cal.eu')) {
      calOrigin = 'https://app.cal.eu';
    } else {
      return null;
    }

    const calLink = url.pathname.replace(/^\/+|\/+$/g, '');
    if (!calLink) return null;

    return {
      origin: calOrigin,
      calLink,
      cleanUrl: url.toString()
    };
  } catch {
    return null;
  }
}

let lastMountedCalKey = '';
let calMountSeq = 0;

function ensureCalLoader(calOrigin) {
  if (typeof window.Cal === 'function') return;

  (function (C, A, L) {
    const p = function (a, ar) {
      a.q.push(ar);
    };
    const d = C.document;
    C.Cal =
      C.Cal ||
      function () {
        const cal = C.Cal;
        const ar = arguments;
        if (!cal.loaded) {
          cal.ns = {};
          cal.q = cal.q || [];
          const script = d.createElement('script');
          script.src = A;
          script.async = true;
          d.head.appendChild(script);
          cal.loaded = true;
        }
        if (ar[0] === L) {
          const api = function () {
            p(api, arguments);
          };
          const namespace = ar[1];
          api.q = api.q || [];
          if (typeof namespace === 'string') {
            cal.ns[namespace] = cal.ns[namespace] || api;
            p(cal.ns[namespace], ar);
            p(cal, ['initNamespace', namespace]);
          } else {
            p(cal, ar);
          }
          return;
        }
        p(cal, ar);
      };
  })(window, `${calOrigin}/embed/embed.js`, 'init');
}

function mountCalInlineEmbed(container, calInfo) {
  const calKey = `${calInfo.origin}|${calInfo.calLink}`;
  const existingMount = container.querySelector('#cal-embed-mount');
  const existingFallback = container.querySelector('#cal-fallback-link');

  if (existingMount && existingFallback && lastMountedCalKey === calKey) {
    existingFallback.href = calInfo.cleanUrl;
    return;
  }

  lastMountedCalKey = calKey;
  container.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'space-y-3';

  const mountEl = document.createElement('div');
  mountEl.id = 'cal-embed-mount';
  mountEl.className = 'cal-embed-mount';

  const fallbackRow = document.createElement('div');
  fallbackRow.className = 'flex justify-end';

  const fallbackLink = document.createElement('a');
  fallbackLink.id = 'cal-fallback-link';
  fallbackLink.href = calInfo.cleanUrl;
  fallbackLink.target = '_blank';
  fallbackLink.rel = 'noopener noreferrer';
  fallbackLink.className =
    'text-xs font-medium text-[var(--color-muted)] underline underline-offset-4 hover:text-[var(--color-ink)]';
  fallbackLink.textContent = '¿Problemas para ver el calendario? Abrir en nueva pestaña';

  fallbackRow.appendChild(fallbackLink);
  wrapper.appendChild(mountEl);
  wrapper.appendChild(fallbackRow);
  container.appendChild(wrapper);

  ensureCalLoader(calInfo.origin);
  const ns = `salon_${++calMountSeq}`;
  window.Cal('init', ns, { origin: calInfo.origin });
  window.Cal.ns[ns]('inline', {
    elementOrSelector: '#cal-embed-mount',
    calLink: calInfo.calLink,
    config: {
      layout: 'month_view',
      theme: 'light'
    }
  });
  window.Cal.ns[ns]('ui', {
    theme: 'light',
    hideEventTypeDetails: false,
    layout: 'month_view'
  });
}

function buildWhatsappHref(whatsappNumber, serviceName) {
  const digits = cleanText(whatsappNumber).replace(/\D+/g, '');
  if (!digits) return '';
  const text = serviceName
    ? `Hola, me gustaría pedir cita para: ${serviceName}`
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
      ? `<a href="${escapeHtml(mapsUrl)}" ${mapsUrl.startsWith('#') ? '' : 'target="_blank" rel="noopener noreferrer"'} class="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-accent)] hover:underline underline-offset-4">
          <svg class="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><circle cx="12" cy="11" r="3"/></svg>
          <span>${escapeHtml(address)}</span>
        </a>`
      : `<p class="text-xs font-medium text-[var(--color-muted)]">${escapeHtml(address)}</p>`
    : '';

  const actions = [];
  if (phoneDisplay && telDigits) {
    actions.push(
      `<a href="${isWireframe ? '#telefono-wireframe' : `tel:${escapeHtml(telDigits)}`}" class="btn-pill-secondary badge-pill tabular-nums">Llamar &middot; ${escapeHtml(phoneDisplay)}</a>`
    );
  }
  if (waHref) {
    actions.push(
      `<a href="${isWireframe ? '#whatsapp-wireframe' : escapeHtml(waHref)}" ${isWireframe ? '' : 'target="_blank" rel="noopener noreferrer"'} class="btn-pill-primary badge-pill">WhatsApp</a>`
    );
  }

  header.innerHTML = `
    <div class="ios-card p-5 space-y-4">
      <div class="flex items-center gap-3.5">
        <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-ink)] text-[var(--color-surface)]" aria-hidden="true">
          <svg class="h-6 w-6" viewBox="0 0 64 64" fill="none">
            <circle cx="23" cy="41" r="6.5" stroke="currentColor" stroke-width="4"/>
            <circle cx="41" cy="41" r="6.5" stroke="currentColor" stroke-width="4"/>
            <path d="M27.5 36.5L42 16" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
            <path d="M36.5 36.5L22 16" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="min-w-0 flex-1 space-y-0.5">
          ${name ? `<h1 class="text-xl font-bold tracking-tight text-[var(--color-ink)] sm:text-2xl">${escapeHtml(name)}</h1>` : ''}
          ${shortDesc ? `<p class="text-sm text-[var(--color-muted)]">${escapeHtml(shortDesc)}</p>` : ''}
        </div>
      </div>
      ${
        addressHtml || actions.length > 0
          ? `<div class="flex flex-col gap-3 border-t ios-divider pt-3.5 sm:flex-row sm:items-center sm:justify-between">
              ${addressHtml || '<span></span>'}
              ${actions.length > 0 ? `<div class="flex flex-wrap items-center gap-2">${actions.join('')}</div>` : ''}
            </div>`
          : ''
      }
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
    countEl.textContent = services.length > 0 ? `${services.length}` : '';
  }

  if (services.length === 0) {
    listEl.innerHTML = `
      <div class="ios-card p-5 text-sm text-[var(--color-muted)]">
        Servicios disponibles próximamente.
      </div>
    `;
    return;
  }

  const rowsHtml = services
    .map((srv, idx) => {
      const name = cleanText(srv.name);
      const duration = cleanText(srv.duration);
      const price = cleanText(srv.price);
      const desc = cleanText(srv.description);
      const meta = [duration, price].filter(Boolean).join(' · ');

      return `
        <article class="flex items-center justify-between gap-4 p-4 sm:px-5 sm:py-4">
          <div class="min-w-0 flex-1 space-y-0.5">
            <div class="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
              <h3 class="text-[15px] font-semibold tracking-tight text-[var(--color-ink)]">${escapeHtml(name)}</h3>
              ${meta ? `<span class="text-xs font-medium text-[var(--color-muted)] tabular-nums badge-pill">${escapeHtml(meta)}</span>` : ''}
            </div>
            ${desc ? `<p class="text-xs text-[var(--color-muted)] leading-relaxed">${escapeHtml(desc)}</p>` : ''}
          </div>
          <button type="button" data-service-index="${idx}" class="btn-pill-primary badge-pill text-xs sm:text-sm">
            Reservar
          </button>
        </article>
      `;
    })
    .join('');

  listEl.innerHTML = `<div class="ios-card divide-y ios-divider overflow-hidden">${rowsHtml}</div>`;

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
      : 'Elige fecha y hora o selecciona un servicio arriba.';
  }

  if (isWireframe) {
    lastMountedCalKey = '';
    container.innerHTML = `
      <div class="flex min-h-60 flex-col items-center justify-center rounded-2xl border border-dashed ios-divider p-6 text-center space-y-2">
        <span class="text-sm font-semibold">[Calendario de reservas embebido]</span>
        <p class="text-xs text-[var(--color-muted)] max-w-sm">
          ${selectedService ? `Cargando enlace para: ${escapeHtml(selectedService.name)}` : 'Aquí se cargará el embed oficial de Cal.com o enlace externo.'}
        </p>
      </div>
    `;
  } else if (!safeTargetUrl || safeTargetUrl.startsWith('#')) {
    lastMountedCalKey = '';
    container.innerHTML = `
      <div class="flex flex-col items-center py-6 px-3 text-center space-y-3">
        <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--color-accent)_10%,transparent)] text-[var(--color-accent)]" aria-hidden="true">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
            <rect x="3" y="4" width="18" height="17" rx="3"/>
            <path stroke-linecap="round" d="M8 2v4M16 2v4M3 10h18"/>
          </svg>
        </div>
        <div class="space-y-1">
          <p class="text-base font-semibold tracking-tight text-[var(--color-ink)]">Reserva online disponible muy pronto</p>
          <p class="text-xs text-[var(--color-muted)] max-w-xs mx-auto leading-relaxed">
            Estamos preparando nuestra agenda online para que puedas elegir día y hora directamente desde aquí.
          </p>
        </div>
      </div>
    `;
  } else {
    const calInfo = provider === 'calcom' ? parseCalUrl(safeTargetUrl) : null;
    if (calInfo) {
      mountCalInlineEmbed(container, calInfo);
    } else {
      lastMountedCalKey = '';
      container.innerHTML = `
        <div class="py-6 text-center space-y-4">
          <p class="text-sm text-[var(--color-muted)]">
            Pulsa el botón para elegir día y hora en nuestra agenda externa.
          </p>
          <a href="${escapeHtml(safeTargetUrl)}" target="_blank" rel="noopener noreferrer" class="btn-pill-primary badge-pill">
            ${escapeHtml(fallbackLabel)}
          </a>
        </div>
      `;
    }
  }

  if (secondaryActions) {
    const waHref = buildWhatsappHref(activeConfig.business?.whatsappNumber, selectedService?.name);
    if (waHref) {
      secondaryActions.innerHTML = `
        <a href="${isWireframe ? '#whatsapp-wireframe' : escapeHtml(waHref)}" ${isWireframe ? '' : 'target="_blank" rel="noopener noreferrer"'} class="btn-pill-secondary badge-pill">
          Pedir cita o consultar por WhatsApp
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

  const rows = [];

  hours.forEach((h) => {
    rows.push(`
      <div class="flex items-center justify-between gap-4 px-5 py-3.5 text-sm">
        <span class="text-[var(--color-muted)]">${escapeHtml(cleanText(h.days))}</span>
        <span class="font-medium text-[var(--color-ink)] tabular-nums text-right">${escapeHtml(cleanText(h.time))}</span>
      </div>
    `);
  });

  if (address) {
    rows.push(`
      <div class="flex items-center justify-between gap-4 px-5 py-3.5 text-sm">
        <span class="text-[var(--color-muted)]">Ubicación</span>
        ${
          mapsUrl
            ? `<a href="${escapeHtml(mapsUrl)}" ${mapsUrl.startsWith('#') ? '' : 'target="_blank" rel="noopener noreferrer"'} class="font-medium text-[var(--color-accent)] hover:underline underline-offset-4 text-right">${escapeHtml(address)}</a>`
            : `<span class="font-medium text-[var(--color-ink)] text-right">${escapeHtml(address)}</span>`
        }
      </div>
    `);
  }

  if (phoneDisplay && telDigits) {
    rows.push(`
      <div class="flex items-center justify-between gap-4 px-5 py-3.5 text-sm">
        <span class="text-[var(--color-muted)]">Teléfono</span>
        <a href="${isWireframe ? '#telefono-wireframe' : `tel:${escapeHtml(telDigits)}`}" class="font-medium text-[var(--color-ink)] tabular-nums hover:underline underline-offset-4">${escapeHtml(phoneDisplay)}</a>
      </div>
    `);
  }

  if (instagramUrl) {
    rows.push(`
      <div class="flex items-center justify-between gap-4 px-5 py-3.5 text-sm">
        <span class="text-[var(--color-muted)]">Instagram</span>
        <a href="${escapeHtml(instagramUrl)}" ${instagramUrl.startsWith('#') ? '' : 'target="_blank" rel="noopener noreferrer"'} class="font-medium text-[var(--color-accent)] hover:underline underline-offset-4">Ver perfil</a>
      </div>
    `);
  }

  footer.innerHTML = `
    <h2 class="ios-section-label">Información práctica</h2>
    <div class="ios-card divide-y ios-divider overflow-hidden">
      ${rows.join('')}
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
