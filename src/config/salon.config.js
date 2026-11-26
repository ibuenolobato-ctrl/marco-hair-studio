/**
 * Configuración única del salón.
 * Rellena únicamente los campos que quieras mostrar; cualquier campo vacío ("") o lista vacía ([]) se oculta automáticamente.
 */
export const SALON_CONFIG = {
  business: {
    // Nombre comercial visible en cabecera, título de pestaña y SEO
    name: '',
    // Subtítulo breve bajo el nombre y meta description (ej. "Peluquería unisex en el centro")
    shortDescription: '',
    // Dirección postal legible (ej. "Calle Mayor, 12, Sevilla")
    address: '',
    // Enlace completo a Google Maps (ej. "https://maps.google.com/?q=...")
    googleMapsUrl: '',
    // Teléfono formateado para mostrar y llamar (ej. "600 123 456")
    phoneDisplay: '',
    // Número internacional para WhatsApp sin "+" ni espacios (ej. "34600123456")
    whatsappNumber: '',
    // URL completa de Instagram (ej. "https://instagram.com/tu_salon")
    instagramUrl: ''
  },

  // Lista de horarios. Ejemplo:
  // [{ days: "Lunes a Viernes", time: "10:00 – 20:00" }, { days: "Sábados", time: "09:30 – 14:00" }]
  hours: [],

  booking: {
    // Motor de reservas: "calcom" (iframe embebido de Cal.com) o "external" (botón a enlace externo)
    provider: 'calcom',
    // URL base del calendario de Cal.com o enlace externo general (ej. "https://cal.com/tu-salon")
    calEmbedUrl: '',
    // Texto del botón o aviso cuando uses proveedor externo o falte configurar la URL
    fallbackLabel: ''
  },

  // Catálogo de servicios. Ejemplo:
  // [
  //   {
  //     name: "Corte & Peinado",
  //     duration: "45 min",
  //     price: "22 €",
  //     description: "Lavado, diagnóstico y secado.",
  //     bookingUrl: "https://cal.com/tu-salon/corte" // Opcional: si se deja vacío usa calEmbedUrl
  //   }
  // ]
  services: []
};
