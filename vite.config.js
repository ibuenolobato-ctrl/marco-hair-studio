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

function buildSeoHead(config) {
  const business = config?.business || {};
  const hours = Array.isArray(config?.hours) ? config.hours : [];

  const title = business.name ? business.name.trim() : 'Reservas';
  const tags = [`<title>${escapeAttr(title)}</title>`];

  if (business.shortDescription && business.shortDescription.trim()) {
    tags.push(
      `<meta name="description" content="${escapeAttr(business.shortDescription.trim())}">`
    );
  }

  if (business.name && business.name.trim()) {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'HairSalon',
      name: business.name.trim()
    };

    if (business.shortDescription?.trim()) {
      schema.description = business.shortDescription.trim();
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
