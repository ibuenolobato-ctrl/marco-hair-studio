/**
 * Configuración única de Marco Hair Studio.
 * Rellena los campos pendientes tras confirmar los datos con Marco;
 * cualquier campo vacío ("") se oculta automáticamente en la web.
 */
export const SALON_CONFIG = {
  site: {
    // Dominio público final sin barra final (ej. "https://marcohairstudio.es"). Pendiente de dominio.
    domain: '',
    // Ruta o URL de imagen para compartir en redes (ej. "/og-image.jpg"). Opcional.
    ogImage: '',
    // Idioma/región Open Graph
    locale: 'es_ES'
  },

  business: {
    // Nombre comercial visible en cabecera, título de pestaña y SEO
    name: 'Marco Hair Studio',
    // Subtítulo breve bajo el nombre y meta description
    shortDescription: 'Servicios de peluquería',
    // [PENDIENTE DE CONFIRMAR CON MARCO] Dirección postal exacta del salón
    address: '',
    // [PENDIENTE DE CONFIRMAR CON MARCO] Enlace completo de Google Maps
    googleMapsUrl: '',
    // [PENDIENTE DE CONFIRMAR CON MARCO] Teléfono formateado visible (ej. "665 69 45 57")
    phoneDisplay: '',
    // [PENDIENTE DE CONFIRMAR CON MARCO] WhatsApp en formato internacional sin "+" (ej. "34665694557")
    whatsappNumber: '',
    // [PENDIENTE DE CONFIRMAR CON MARCO] URL completa de Instagram (ej. "https://instagram.com/...")
    instagramUrl: ''
  },

  // [PENDIENTE DE CONFIRMAR CON MARCO] Horario exacto de apertura (sustituir el texto cuando se confirme)
  hours: [
    { days: 'Lunes a Viernes', time: 'Horario pendiente de confirmar' }
  ],

  booking: {
    // Motor de reservas: "calcom" (embed oficial de Cal.com) o "external" (botón a enlace externo)
    provider: 'calcom',
    // [PENDIENTE DE CONFIRMAR CON MARCO] URL base de Cal.com / Cal.eu tras crear su cuenta (ej. "https://cal.com/marco-hair-studio")
    calEmbedUrl: '',
    // Texto opcional del botón si se usa proveedor "external"
    fallbackLabel: ''
  },

  // [PENDIENTE DE CONFIRMAR CON MARCO] Completar duración, precio y bookingUrl específico en Cal.com (o añadir más servicios)
  services: [
    {
      name: 'Corte',
      duration: '',
      price: '',
      description: 'Corte personalizado y acabado.',
      bookingUrl: ''
    }
  ]
};
