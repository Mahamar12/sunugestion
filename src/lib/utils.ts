import { Property, SearchFilters, SubscriptionPlan } from './types';

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(amount) + ' FCFA';
}

export function formatPriceEUR(amountFcfa: number): string {
  const eur = Math.round(amountFcfa / 655.957);
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(eur);
}

export function generateWhatsAppLink(phone: string, propertyRef: string, propertyTitle: string): string {
  // Clean phone number (remove spaces, plus, dashes)
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const formattedPhone = cleanPhone.startsWith('221') ? cleanPhone : `221${cleanPhone}`;
  
  const text = `Bonjour,\n\nJe suis intéressé par ce logement sur SunuGestion.\n\nRéférence : ${propertyRef}\nNom du bien : ${propertyTitle}\n\nPouvez-vous me donner plus d'informations et organiser une visite ?`;
  
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;
}

export function generatePhoneLink(phone: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const formattedPhone = cleanPhone.startsWith('221') ? cleanPhone : `221${cleanPhone}`;
  return `tel:+${formattedPhone}`;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'gratuit',
    name: 'Gratuit',
    price: 0,
    price_eur: 0,
    max_properties: 3,
    max_photos: 5,
    support: 'Standard (Email)',
    stats: 'Vues de base',
    featured_badge: false,
    ai_assistant: false,
    features: [
      'Jusqu\'à 3 annonces actives',
      '5 photos par annonce',
      'Boutons WhatsApp & Téléphone',
      'Tableau de bord basique',
      'Support par e-mail'
    ]
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 25000,
    price_eur: 38,
    max_properties: 15,
    max_photos: 12,
    support: 'Prioritaire (WhatsApp)',
    stats: 'Vues & Clics WhatsApp',
    featured_badge: true,
    ai_assistant: true,
    popular: true,
    features: [
      'Jusqu\'à 15 annonces actives',
      '12 photos par annonce + vidéo HD',
      'Badge Agence Vérifiée',
      '2 annonces en vedette / mois',
      'Statistiques des clics WhatsApp & Appels',
      'Support réactif WhatsApp & Mail'
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 65000,
    price_eur: 99,
    max_properties: 50,
    max_photos: 25,
    support: 'Dédié 7j/7',
    stats: 'Analytique avancée & Rapports',
    featured_badge: true,
    ai_assistant: true,
    features: [
      'Jusqu\'à 50 annonces actives',
      '25 photos par annonce + visites 360°',
      '10 annonces sponsorisées en tête de recherche',
      'Statistiques détaillées & prédictives',
      'Exportation des demandes clients',
      'Gestionnaire de compte dédié'
    ]
  },
  {
    id: 'entreprise',
    name: 'Entreprise',
    price: 150000,
    price_eur: 228,
    max_properties: 'Illimité',
    max_photos: 'Illimité',
    support: 'VIP 24/7 & Ligne directe',
    stats: 'BI & API Access',
    featured_badge: true,
    ai_assistant: true,
    features: [
      'Annonces & photos illimitées',
      'Mise en avant prioritaire maximale',
      'Comptes multi-agents & permissions',
      'Intégration API & synchronisation de stock',
      'Assistant IA configuré sur-mesure pour votre agence',
      'Support technique et commercial VIP 24/7'
    ]
  }
];

export function filterProperties(properties: Property[], filters: SearchFilters): Property[] {
  return properties.filter((p) => {
    if (filters.query) {
      const q = filters.query.toLowerCase();
      const matchQuery =
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.neighborhood.toLowerCase().includes(q) ||
        p.ref.toLowerCase().includes(q);
      if (!matchQuery) return false;
    }

    if (filters.city && p.city.toLowerCase() !== filters.city.toLowerCase()) {
      return false;
    }

    if (filters.neighborhood && !p.neighborhood.toLowerCase().includes(filters.neighborhood.toLowerCase())) {
      return false;
    }

    if (filters.type && p.type !== filters.type) {
      return false;
    }

    if (filters.listing_type && p.listing_type !== filters.listing_type) {
      return false;
    }

    if (filters.min_price !== undefined && p.price < filters.min_price) {
      return false;
    }

    if (filters.max_price !== undefined && filters.max_price > 0 && p.price > filters.max_price) {
      return false;
    }

    if (filters.min_bedrooms !== undefined && p.bedrooms < filters.min_bedrooms) {
      return false;
    }

    if (filters.min_bathrooms !== undefined && p.bathrooms < filters.min_bathrooms) {
      return false;
    }

    if (filters.min_surface !== undefined && p.surface < filters.min_surface) {
      return false;
    }

    if (filters.furnished && p.furnished !== filters.furnished) {
      return false;
    }

    if (filters.available_now && p.status !== 'disponible') {
      return false;
    }

    if (filters.has_pool && !p.has_pool) return false;
    if (filters.has_parking && !p.has_parking) return false;
    if (filters.has_ac && !p.has_ac) return false;
    if (filters.has_internet && !p.has_internet) return false;
    if (filters.featured && !p.featured) return false;

    return true;
  }).sort((a, b) => {
    if (filters.sort_by === 'price_asc') return a.price - b.price;
    if (filters.sort_by === 'price_desc') return b.price - a.price;
    if (filters.sort_by === 'surface_desc') return b.surface - a.surface;
    // Default 'recent'
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

export function numberToWordsFR(num: number): string {
  if (!num || isNaN(num) || num <= 0) return 'Zéro Franc CFA';

  const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
  const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
  const tens = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt'];

  function convertHundreds(n: number): string {
    let result = '';
    const h = Math.floor(n / 100);
    const rest = n % 100;

    if (h > 0) {
      if (h === 1) {
        result += 'cent';
      } else {
        result += units[h] + ' cent';
        if (rest === 0) result += 's';
      }
      if (rest > 0) result += ' ';
    }

    if (rest > 0) {
      if (rest < 10) {
        result += units[rest];
      } else if (rest < 20) {
        result += teens[rest - 10];
      } else {
        const t = Math.floor(rest / 10);
        const u = rest % 10;
        if (t === 7) {
          result += 'soixante-' + (u === 1 ? 'et-onze' : teens[u]);
        } else if (t === 9) {
          result += 'quatre-vingt-' + teens[u];
        } else {
          result += tens[t];
          if (u === 1) {
            result += ' et un';
          } else if (u > 1) {
            result += '-' + units[u];
          } else if (t === 8 && u === 0) {
            result += 's';
          }
        }
      }
    }

    return result.trim();
  }

  const millions = Math.floor(num / 1000000);
  const thousands = Math.floor((num % 1000000) / 1000);
  const remainder = Math.floor(num % 1000);

  let parts: string[] = [];

  if (millions > 0) {
    if (millions === 1) {
      parts.push('un million');
    } else {
      parts.push(convertHundreds(millions) + ' millions');
    }
  }

  if (thousands > 0) {
    if (thousands === 1) {
      parts.push('mille');
    } else {
      parts.push(convertHundreds(thousands) + ' mille');
    }
  }

  if (remainder > 0) {
    parts.push(convertHundreds(remainder));
  }

  const text = parts.join(' ').trim();
  if (!text) return 'Zéro Franc CFA';
  const capitalized = text.charAt(0).toUpperCase() + text.slice(1);
  return `${capitalized} Francs CFA`;
}

