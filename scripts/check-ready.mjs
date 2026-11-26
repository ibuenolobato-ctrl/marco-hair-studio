import { SALON_CONFIG } from '../src/config/salon.config.js';

function clean(value) {
  return typeof value === 'string' ? value.trim() : '';
}

const business = SALON_CONFIG?.business || {};
const site = SALON_CONFIG?.site || {};
const booking = SALON_CONFIG?.booking || {};
const hours = Array.isArray(SALON_CONFIG?.hours) ? SALON_CONFIG.hours : [];
const services = Array.isArray(SALON_CONFIG?.services) ? SALON_CONFIG.services : [];

const validServices = services.filter((s) => clean(s?.name));
const hasServiceBookingUrl = validServices.some((s) => clean(s?.bookingUrl));
const hasBookingChannel =
  Boolean(clean(booking.calEmbedUrl)) ||
  hasServiceBookingUrl ||
  Boolean(clean(business.whatsappNumber));

const missingRequired = [];

if (!clean(business.name)) {
  missingRequired.push('business.name (nombre del salón)');
}
if (!clean(business.address)) {
  missingRequired.push('business.address (dirección del salón)');
}
if (validServices.length === 0) {
  missingRequired.push('services (añade al menos 1 servicio con "name")');
}
if (!hasBookingChannel) {
  missingRequired.push(
    'booking.calEmbedUrl, algún service.bookingUrl o business.whatsappNumber (canal de reservas)'
  );
}

const recommendedWarnings = [];
if (!clean(site.domain)) {
  recommendedWarnings.push('site.domain (recomendado para canonical, og:url y JSON-LD)');
}
if (!clean(business.shortDescription)) {
  recommendedWarnings.push('business.shortDescription (recomendado para meta description)');
}
if (hours.filter((h) => clean(h?.days) && clean(h?.time)).length === 0) {
  recommendedWarnings.push('hours (recomendado para mostrar el horario en pie y SEO)');
}

console.log('=== Verificación pre-publicación (salon-booking-minimal) ===');

if (missingRequired.length > 0) {
  console.error('\nFaltan campos obligatorios en src/config/salon.config.js:');
  for (const item of missingRequired) {
    console.error(`  - ${item}`);
  }
  if (recommendedWarnings.length > 0) {
    console.warn('\nCampos recomendados aún vacíos:');
    for (const item of recommendedWarnings) {
      console.warn(`  - ${item}`);
    }
  }
  process.exit(1);
}

console.log('OK: Todos los campos obligatorios están configurados.');
if (recommendedWarnings.length > 0) {
  console.warn('\nAvisos recomendados (no bloqueantes):');
  for (const item of recommendedWarnings) {
    console.warn(`  - ${item}`);
  }
}
