import { AgencyUser, User, UserRole } from '@/types/sunugestion';

export type { AgencyUser };

export const DEFAULT_AGENCY_USERS: AgencyUser[] = [
  {
    id: 'usr-admin-1',
    name: 'Mamadou Sy',
    email: 'm.sy@sunugestion.sn',
    username: 'm.sy',
    password: 'Passer123!',
    role: 'ADMIN_AGENCE',
    phone: '+221 77 654 32 10',
    status: 'ACTIF',
    createdAt: '2026-01-15',
  },
  {
    id: 'usr-gest-2',
    name: 'Fatou Ndiaye',
    email: 'f.ndiaye@sunugestion.sn',
    username: 'f.ndiaye',
    password: 'Sunu@Gestion1',
    role: 'GESTIONNAIRE',
    phone: '+221 78 123 45 67',
    status: 'ACTIF',
    createdAt: '2026-02-01',
  },
  {
    id: 'usr-compta-3',
    name: 'Oumar Diop',
    email: 'o.diop@sunugestion.sn',
    username: 'o.diop',
    password: 'Sunu@Compta2',
    role: 'COMPTABLE',
    phone: '+221 70 987 65 43',
    status: 'ACTIF',
    createdAt: '2026-02-15',
  },
];

const STORAGE_USERS_KEY = 'sunu_agency_users';
const STORAGE_SESSION_KEY = 'sunu_session_user';

export function getAgencyUsers(): AgencyUser[] {
  if (typeof window === 'undefined') return DEFAULT_AGENCY_USERS;
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    // Si vide ou premier démarrage, initialiser avec les comptes par défaut
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(DEFAULT_AGENCY_USERS));
    return DEFAULT_AGENCY_USERS;
  } catch (e) {
    console.warn('Erreur lecture agency users:', e);
    return DEFAULT_AGENCY_USERS;
  }
}

export function saveAgencyUsers(users: AgencyUser[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.warn('Erreur sauvegarde agency users:', e);
  }
}

export function generateUsername(fullName: string, existingUsers: AgencyUser[]): string {
  const clean = fullName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '');

  const parts = clean.split(/\s+/).filter(Boolean);
  let base = '';
  if (parts.length >= 2) {
    base = `${parts[0][0]}.${parts[parts.length - 1]}`;
  } else if (parts.length === 1) {
    base = parts[0];
  } else {
    base = 'user';
  }

  // Vérifier unicité
  let candidate = base;
  let counter = 1;
  const existingSet = new Set(existingUsers.map((u) => u.username.toLowerCase()));
  while (existingSet.has(candidate)) {
    counter++;
    candidate = `${base}${counter}`;
  }
  return candidate;
}

export function generatePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let rand = '';
  for (let i = 0; i < 4; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `Sunu@${digits}!`;
}

export function verifyCredentials(
  identifier: string,
  rawPassword: string
): { success: boolean; user?: User; error?: string } {
  const idTrim = identifier.trim().toLowerCase();
  const passTrim = rawPassword.trim();

  if (!idTrim || !passTrim) {
    return {
      success: false,
      error: 'Veuillez saisir votre identifiant (ou email) et votre mot de passe.',
    };
  }

  const users = getAgencyUsers();

  // Recherche dans les utilisateurs d'agence
  const matched = users.find(
    (u) =>
      u.username.toLowerCase() === idTrim ||
      u.email.toLowerCase() === idTrim
  );

  if (matched) {
    if (matched.status === 'SUSPENDU') {
      return {
        success: false,
        error: "Ce compte utilisateur est suspendu. Veuillez contacter l'administrateur de l'agence.",
      };
    }

    if (matched.password !== passTrim) {
      return {
        success: false,
        error: "Mot de passe incorrect pour cet identifiant. Vérifiez vos accès ou contactez l'agence.",
      };
    }

    const sessionUser: User = {
      id: matched.id,
      name: matched.name,
      email: matched.email,
      username: matched.username,
      phone: matched.phone,
      role: matched.role,
      agencyId: 'org-1',
      status: 'ACTIVE',
      createdAt: matched.createdAt || new Date().toISOString().split('T')[0],
    };

    setCurrentSession(sessionUser);
    return { success: true, user: sessionUser };
  }

  // Comptes de démonstration supplémentaires (Super Admin, Propriétaire, Locataire)
  const specialAccounts: { id: string; name: string; email: string; username: string; pass: string; role: UserRole }[] = [
    {
      id: 'usr-superadmin',
      name: 'Super Admin SaaS',
      email: 'admin@sunugestion.sn',
      username: 'admin',
      pass: 'Passer123!',
      role: 'SUPER_ADMIN',
    },
    {
      id: 'usr-owner',
      name: 'M. Ousmane Ndiaye',
      email: 'o.ndiaye@gmail.com',
      username: 'o.ndiaye',
      pass: 'Passer123!',
      role: 'PROPRIETAIRE',
    },
    {
      id: 'usr-tenant',
      name: 'Mamadou Diallo',
      email: 'm.diallo@sonatel.sn',
      username: 'm.diallo',
      pass: 'Passer123!',
      role: 'LOCATAIRE',
    },
  ];

  const matchedSpecial = specialAccounts.find(
    (s) => s.username.toLowerCase() === idTrim || s.email.toLowerCase() === idTrim
  );

  if (matchedSpecial) {
    if (matchedSpecial.pass !== passTrim) {
      return {
        success: false,
        error: "Mot de passe incorrect pour cet identifiant. Vérifiez vos accès ou contactez l'agence.",
      };
    }

    const sessionUser: User = {
      id: matchedSpecial.id,
      name: matchedSpecial.name,
      email: matchedSpecial.email,
      username: matchedSpecial.username,
      phone: '+221 77 000 00 00',
      role: matchedSpecial.role,
      agencyId: 'org-1',
      status: 'ACTIVE',
      createdAt: '2026-01-01',
    };

    setCurrentSession(sessionUser);
    return { success: true, user: sessionUser };
  }

  // Aucun compte trouvé
  return {
    success: false,
    error: "Identifiant introuvable. Sans un identifiant valide attribué par l'agence, vous ne pouvez pas vous connecter.",
  };
}

export function getCurrentSession(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

export function setCurrentSession(user: User): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(user));
  } catch (e) {}
}

export function clearCurrentSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_SESSION_KEY);
  } catch (e) {}
}
