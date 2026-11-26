import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { SALON_CONFIG } from './src/config/salon.config.js';

function escapeAttr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizeDomain(rawDomain) {
  const trimmed = typeof rawDomain === 'string' ? rawDomain.trim() : '';
  if (!trimmed) return '';
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return `${parsed.protocol}//${parsed.host}${parsed.pathname.replace(/\/+$/, '')}`;
    }
  } catch {
    return '';
  }
  return '';
}

function resolveOgImage(rawImage, normalizedDomain) {
  const trimmed = typeof rawImage === 'string' ? rawImage.trim() : '';
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('/') && normalizedDomain) {
    return `${normalizedDomain}${trimmed}`;
  }
  return trimmed.startsWith('/') ? trimmed : '';
}

function buildSeoHead(config) {
  const site = config?.site || {};
  const business = config?.business || {};
  const hours = Array.isArray(config?.hours) ? config.hours : [];

  const name = business.name?.trim() || '';
  const description = business.shortDescription?.trim() || '';
  const domain = normalizeDomain(site.domain);
  const canonicalUrl = domain ? `${domain}/` : '';
  const locale = site.locale?.trim() || 'es_ES';
  const ogImage = resolveOgImage(site.ogImage, domain);

  const title = name || 'Reservas';
  const tags = [`<title>${escapeAttr(title)}</title>`];

  if (description) {
    tags.push(`<meta name="description" content="${escapeAttr(description)}">`);
  }

  if (canonicalUrl) {
    tags.push(`<link rel="canonical" href="${escapeAttr(canonicalUrl)}">`);
  }

  // Open Graph & Twitter Card (solo campos no vacíos)
  if (name || description || canonicalUrl || ogImage) {
    tags.push('<meta property="og:type" content="website">');
    tags.push(`<meta property="og:locale" content="${escapeAttr(locale)}">`);
    if (name) {
      tags.push(`<meta property="og:title" content="${escapeAttr(name)}">`);
    }
    if (description) {
      tags.push(`<meta property="og:description" content="${escapeAttr(description)}">`);
    }
    if (canonicalUrl) {
      tags.push(`<meta property="og:url" content="${escapeAttr(canonicalUrl)}">`);
    }
    if (ogImage) {
      tags.push(`<meta property="og:image" content="${escapeAttr(ogImage)}">`);
    }
    tags.push(
      `<meta name="twitter:card" content="${ogImage ? 'summary_large_image' : 'summary'}">`
    );
  }

  if (name) {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'HairSalon',
      name
    };

    if (canonicalUrl) {
      schema.url = canonicalUrl;
    }
    if (description) {
      schema.description = description;
    }
    if (ogImage) {
      schema.image = ogImage;
    }
    if (business.phoneDisplay?.trim()) {
      schema.telephone = business.phoneDisplay.trim();
    }
    if (business.address?.trim()) {
      schema.address = {
        '@type': 'PostalAddress',
        streetAddress: business.address.trim()
      };
    }
    if (business.instagramUrl?.trim()) {
      schema.sameAs = [business.instagramUrl.trim()];
    }

    const cleanHours = hours
      .filter((h) => h?.days?.trim() && h?.time?.trim())
      .map((h) => `${h.days.trim()} ${h.time.trim()}`);
    if (cleanHours.length > 0) {
      schema.openingHours = cleanHours;
    }

    const safeJson = JSON.stringify(schema, null, 2).replace(/</g, '\\u003c');
    tags.push(`<script type="application/ld+json">\n${safeJson}\n  </script>`);
  }

  return tags.join('\n  ');
}

function salonSeoPlugin() {
  return {
    name: 'salon-seo-inject',
    transformIndexHtml(html) {
      return html.replace('<!--SALON_SEO-->', buildSeoHead(SALON_CONFIG));
    }
  };
}

export default defineConfig({
  plugins: [tailwindcss(), salonSeoPlugin()]
});
