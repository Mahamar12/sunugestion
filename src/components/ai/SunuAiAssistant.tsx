'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSunuGestion } from '@/context/SunuGestionContext';
import {
  Sparkles,
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Building2,
  Users,
  CreditCard,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Phone,
  CheckCircle2,
  Wrench,
  FileText,
  Languages,
  RotateCcw,
  Compass
} from 'lucide-react';
import { Tenant, Property, Vendor } from '@/types/sunugestion';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
  lang?: 'fr' | 'wo';
  actions?: {
    type: 'NAVIGATE' | 'WHATSAPP' | 'PROPERTY' | 'TENANT' | 'VENDOR';
    label: string;
    url?: string;
    phone?: string;
    onClick?: () => void;
  }[];
}

export default function SunuAiAssistant() {
  const router = useRouter();
  const {
    properties,
    tenants,
    units,
    leases,
    rentSchedules,
    arrears,
    payments,
    vendors,
    expenses
  } = useSunuGestion();

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [voiceOutputEnabled, setVoiceOutputEnabled] = useState(false);
  const [preferredLang, setPreferredLang] = useState<'AUTO' | 'FR' | 'WO'>('AUTO');
  const [isThinking, setIsThinking] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: `👋 **Salamalekum ! Bienvenue sur Sunu IA.**

Je suis votre assistant vocal et intelligent pour faciliter la gestion de votre agence. Vous pouvez me parler en **Français** ou en **Wolof** !

💡 *Exemples de ce que vous pouvez me demander :*
• *"Quels sont les locataires en retard ?"* / *"Ban locataires ñoo am ay impayés ?"*
• *"Combien de logements vacants à Zac Mbao ?"* / *"Dafa am luy xew si Zac Mbao ?"*
• *"Génère une relance pour Mamadou Diallo"* / *"Bindal ma lettre de relance si Wolof"*
• *"Donne-moi le numéro d'un plombier"* / *"Wutal ma benn artisan"*
• *"Ouvre la gestion des loyers"* / *"Ubbi ma wàllu xaliss bi"*`,
      time: 'À l\'instant',
      lang: 'fr',
      actions: [
        { type: 'NAVIGATE', label: '🚨 Voir les Impayés', url: '/app/arrears' },
        { type: 'NAVIGATE', label: '🏢 Voir les Biens', url: '/app/properties' },
        { type: 'NAVIGATE', label: '💰 Échéances Loyers', url: '/app/rents' },
      ]
    }
  ]);

  // Initialisation Web Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        setSpeechSupported(true);
        const recog = new SpeechRecognition();
        recog.continuous = false;
        recog.interimResults = true;
        recog.lang = preferredLang === 'WO' ? 'fr-SN' : 'fr-FR';

        recog.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setInput(transcript);
        };

        recog.onerror = (e: any) => {
          console.warn('Speech recognition notice:', e);
          setIsListening(false);
        };

        recog.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recog;
      }
    }
  }, [preferredLang]);

  // Listen for open-sunu-ai custom event from Header or Sidebar
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    if (typeof window !== 'undefined') {
      window.addEventListener('open-sunu-ai', handleOpen);
      return () => window.removeEventListener('open-sunu-ai', handleOpen);
    }
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Synthesize Speech Output
  const speakText = (text: string) => {
    if (!voiceOutputEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      // Clean markdown tags for vocal output
      const clean = text
        .replace(/[*_#`]/g, '')
        .replace(/https?:\/\/\S+/g, '')
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
        .slice(0, 300);

      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = 'fr-FR';
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  };

  const toggleVoiceInput = () => {
    if (!speechSupported || !recognitionRef.current) {
      alert("La reconnaissance vocale n'est pas supportée par votre navigateur (essayez Google Chrome ou Edge).");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setInput('');
      try {
        recognitionRef.current.lang = preferredLang === 'WO' ? 'fr-SN' : 'fr-FR';
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Speech start error:', err);
      }
    }
  };

  // Traitement Intelligent des Requêtes (NLP Client-Side + Data Context)
  const processQuery = (rawQuery: string) => {
    const q = rawQuery.toLowerCase().trim();

    // Détection de langue
    const isWolofWords = [
      'nanga', 'naka', 'ban', 'ñoo', 'ñata', 'xaliss', 'fay', 'fayagul', 'luy', 'xew', 'am na', 'ana',
      'yokk', 'ubbi', 'demal', 'wutal', 'jerejef', 'waaw', 'déedéet', 'dafa', 'nekk', 'biens yi', 'mënë'
    ];
    const detectedWolof = isWolofWords.some(w => q.includes(w)) || preferredLang === 'WO';

    // 1. GREETINGS / SALUTATIONS
    if (
      q.includes('nanga def') ||
      q.includes('naka suba') ||
      q.includes('naka ngoon') ||
      q.includes('jàmm') ||
      q.includes('salam') ||
      q.includes('bonjour') ||
      q.includes('salut')
    ) {
      if (detectedWolof) {
        return {
          text: `Mangi fi rekk alhamdoulilah ! Jàmm nga am ? Man la **Sunu IA**, sa assistant immobilier. 

Wax ma lula soxla ci gestion agence bi (impayés yi, locataires yi, immeuble yi, walla artisan yi), ma réglél laci lu gaaw !`,
          actions: [
            { type: 'NAVIGATE' as const, label: '🚨 Locataires en retard', url: '/app/arrears' },
            { type: 'NAVIGATE' as const, label: '🏢 Xool Immeuble yi', url: '/app/properties' }
          ]
        };
      }
      return {
        text: `Bonjour ! Je suis **Sunu IA**, votre assistant immobilier personnel. Je suis prêt à exécuter vos tâches en Français ou en Wolof. 

Que souhaitez-vous faire aujourd'hui ?`,
        actions: [
          { type: 'NAVIGATE' as const, label: '📊 Tableau de bord', url: '/app/dashboard' },
          { type: 'NAVIGATE' as const, label: '🚨 Vérifier les impayés', url: '/app/arrears' }
        ]
      };
    }

    // 2. IMPAYÉS & RETARDS (ARREARS)
    if (
      q.includes('impayé') ||
      q.includes('retard') ||
      q.includes('fayagul') ||
      q.includes('bor') ||
      q.includes('arriéré')
    ) {
      const lateTenants = tenants.filter(t => (t.arrearsFCFA && t.arrearsFCFA > 0) || t.status === 'EN_RETARD');
      const totalLateAmount = lateTenants.reduce((sum, t) => sum + (t.arrearsFCFA || t.rentFCFA || 0), 0);

      if (lateTenants.length === 0) {
        return {
          text: detectedWolof
            ? `🎉 **Amul bénn locataire bu am bor tay !** Ñépp fay nañu sen loyer bu baax.`
            : `🎉 **Excellente nouvelle !** Aucun locataire n'est en retard de paiement actuellement. Tous les loyers sont à jour.`
        };
      }

      const listText = lateTenants
        .slice(0, 5)
        .map(
          t =>
            `• **${t.firstName} ${t.lastName}** (${t.propertyName || 'Bien'}) : **${(t.arrearsFCFA || t.rentFCFA || 0).toLocaleString('fr-FR')} FCFA** en retard (Tél: ${t.phone})`
        )
        .join('\n');

      const actions = lateTenants.slice(0, 3).map(t => {
        const cleanPhone = (t.whatsapp || t.phone).replace(/[^0-9]/g, '');
        const msg = detectedWolof
          ? `Salamalekum ${t.firstName} ${t.lastName}, ci agence SunuGestion lañu lay nuyoo. Ñi ngi lay fàttali ne sa wéeru loyer bu Septembre bi jéggi na (${(t.arrearsFCFA || t.rentFCFA).toLocaleString('fr-FR')} FCFA). Gëna gaaw nga fay ko ci agence bi. Jerejef !`
          : `Bonjour ${t.firstName} ${t.lastName}, votre loyer de ${(t.arrearsFCFA || t.rentFCFA).toLocaleString('fr-FR')} FCFA pour ${t.propertyName} est en attente de régularisation. Merci de procéder au paiement dès que possible. Agence SunuGestion.`;

        return {
          type: 'WHATSAPP' as const,
          label: `📲 Relancer ${t.firstName} (WhatsApp)`,
          url: `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`
        };
      });

      return {
        text: detectedWolof
          ? `⚠️ **Am na ${lateTenants.length} locataires yu am ay impayés** ci wéer wi (Total : **${totalLateAmount.toLocaleString('fr-FR')} FCFA**).\n\n${listText}\n\n*Cliquez ci-dessous pour leur envoyer un rappel WhatsApp direct en Wolof :*`
          : `⚠️ **Il y a ${lateTenants.length} locataire(s) en retard de paiement** pour un montant total de **${totalLateAmount.toLocaleString('fr-FR')} FCFA**.\n\n${listText}\n\n*Vous pouvez leur envoyer une relance WhatsApp immédiate en 1 clic :*`,
        actions: [
          ...actions,
          { type: 'NAVIGATE' as const, label: '📄 Ouvrir le module Impayés', url: '/app/arrears' }
        ]
      };
    }

    // 3. RECHERCHE D'IMMEUBLE OU MAISON SPÉCIFIQUE (ZAC MBAO, ALPHA OUMAR, GRAND YOFF...)
    const matchedProperty = properties.find(p => {
      const pName = p.name.toLowerCase();
      const pNeighborhood = (p.neighborhood || '').toLowerCase();
      return (
        q.includes(pName) ||
        (q.includes('zac') && pName.includes('zack mbao')) ||
        (q.includes('mbao') && pName.includes('mbao')) ||
        (q.includes('alpha oumar') && pName.includes('alpha oumar')) ||
        (q.includes('grand yoff') && pName.includes('grand yoff')) ||
        (q.includes('medina') && pName.includes('medina')) ||
        (q.includes('niarry tally') && pName.includes('niarry tally')) ||
        (q.includes('almadies') && pName.includes('almadies')) ||
        (q.includes('plateau') && pName.includes('plateau'))
      );
    });

    if (matchedProperty) {
      const propTenants = tenants.filter(
        t =>
          t.propertyId === matchedProperty.id ||
          (t.propertyName && t.propertyName.trim().toLowerCase() === matchedProperty.name.trim().toLowerCase())
      );
      const propUnits = units.filter(
        u =>
          u.propertyId === matchedProperty.id ||
          (u.propertyName && u.propertyName.trim().toLowerCase() === matchedProperty.name.trim().toLowerCase())
      );

      const occCount = propTenants.length;
      const totalUnitsCount = Math.max(matchedProperty.totalUnits || 0, propUnits.length, occCount);
      const vacantCount = Math.max(0, totalUnitsCount - occCount);

      const tenantListSummary = propTenants.length > 0
        ? propTenants.slice(0, 5).map(t => `• **${t.firstName} ${t.lastName}** (${t.unitNumber || 'Logement'} - ${t.rentFCFA.toLocaleString('fr-FR')} FCFA)`).join('\n')
        : (detectedWolof ? '• *Amul bénn locataire bu fa dëkk actuellement.*' : '• *Aucun locataire n\'y réside actuellement.*');

      return {
        text: detectedWolof
          ? `🏢 **${matchedProperty.name}** (${matchedProperty.neighborhood}, ${matchedProperty.type}) :
• **${occCount}** locataires ñoo fa nekk
• **${vacantCount}** néeg ñoo disponible (vide)
• Propriétaire bi : **${matchedProperty.ownerName}**

Locataires yi fa nekk :
${tenantListSummary}`
          : `🏢 **Informations sur : ${matchedProperty.name}**
• **Type** : ${matchedProperty.type} à ${matchedProperty.neighborhood}
• **Occupation** : **${occCount}** locataire(s) résident(s) / **${totalUnitsCount}** logements
• **Disponibles (vacants)** : **${vacantCount}** logement(s)
• **Bailleur / Propriétaire** : ${matchedProperty.ownerName}

**Locataires attribués à ce bien :**
${tenantListSummary}`,
        actions: [
          { type: 'NAVIGATE' as const, label: `🏢 Voir ${matchedProperty.name}`, url: `/app/properties/${matchedProperty.id}` },
          { type: 'NAVIGATE' as const, label: `➕ Ajouter locataire dans ce bien`, url: `/app/tenants?propertyId=${matchedProperty.id}` }
        ]
      };
    }

    // 4. PRESTATAIRES & ARTISANS (PLOMBIER, ÉLECTRICIEN, CLIMATISATION...)
    if (
      q.includes('artisan') ||
      q.includes('prestataire') ||
      q.includes('plombier') ||
      q.includes('electricien') ||
      q.includes('frigoriste') ||
      q.includes('serrurier') ||
      q.includes('peintre') ||
      q.includes('fuite') ||
      q.includes('panne') ||
      q.includes('réparation')
    ) {
      let filteredVendors = vendors;
      if (q.includes('plombier') || q.includes('fuite')) {
        filteredVendors = vendors.filter(v => v.trade === 'PLOMBIER');
      } else if (q.includes('electricien') || q.includes('panne')) {
        filteredVendors = vendors.filter(v => v.trade === 'ELECTRICIEN');
      } else if (q.includes('frigoriste') || q.includes('clim')) {
        filteredVendors = vendors.filter(v => v.trade === 'FRIGORISTE');
      }

      if (filteredVendors.length === 0) filteredVendors = vendors;

      const vendorList = filteredVendors
        .slice(0, 4)
        .map(v => `• **${v.name}** (${v.trade}) — Tél: **${v.phone}** (Zone: ${v.zone})`)
        .join('\n');

      const actions = filteredVendors.slice(0, 2).map(v => ({
        type: 'WHATSAPP' as const,
        label: `📲 Écrire à ${v.name} (WhatsApp)`,
        url: `https://wa.me/${v.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
          detectedWolof
            ? 'Salamalekum, am nañu panne/chantier ci agence SunuGestion. Mën nga ñëw tay ?'
            : 'Bonjour, nous avons une intervention pour un logement via l\'agence SunuGestion. Êtes-vous disponible ?'
        )}`
      }));

      return {
        text: detectedWolof
          ? `🔧 **Am nañu ay artisans yu disponiblé pour dépaner :**\n\n${vendorList}`
          : `🔧 **Voici les prestataires & artisans recommandés disponibles :**\n\n${vendorList}`,
        actions: [
          ...actions,
          { type: 'NAVIGATE' as const, label: '🛠️ Voir le répertoire des artisans', url: '/app/vendors' }
        ]
      };
    }

    // 5. AJOUT D'UN NOUVEAU LOCATAIRE (CREATION / ATTRIBUTION)
    if (q.includes('ajoute') || q.includes('créer') || q.includes('nouveau locataire') || q.includes('yokk')) {
      return {
        text: detectedWolof
          ? `✍️ **Bëgg nga yokk benn locataire bu bees ?**\n\nCliquez ci-dessous pour ouvrir le formulaire d'ajout. Vous pourrez sélectionner l'immeuble exact (Zac Mbao, Alpha Oumar, Grand Yoff...) pour qu'il y soit strictement attribué !`
          : `✍️ **Vous souhaitez enregistrer un nouveau locataire ?**\n\nCliquez ci-dessous pour ouvrir le formulaire. Vous pourrez directement choisir son immeuble ou maison d'affectation pour qu'il soit attribué à 100% à ce bien.`,
        actions: [
          { type: 'NAVIGATE' as const, label: '➕ Ouvrir formulaire d\'ajout locataire', url: '/app/tenants' },
          { type: 'NAVIGATE' as const, label: '🏢 Choisir depuis les biens', url: '/app/properties' }
        ]
      };
    }

    // 5.b SITUATION DES BAILLEURS (ENCAISSEMENTS - DÉPENSES = SOLDE NET)
    if (
      q.includes('situation') ||
      q.includes('bailleur') ||
      q.includes('gérance') ||
      q.includes('reversement') ||
      q.includes('payout') ||
      (q.includes('encaissement') && (q.includes('dépense') || q.includes('depense')))
    ) {
      const totalCol = payments.reduce((acc, p) => acc + (p.amountFCFA || 0), 0);
      const totalExp = expenses.reduce((acc, e) => acc + (e.amountFCFA || 0), 0);
      const totalComm = Math.round(totalCol * 0.08);
      const netPayout = Math.max(0, totalCol - totalExp - totalComm);

      return {
        text: detectedWolof
          ? `🏛️ **Situation bu Bailleurs yi (Compte de Gérance) :**\n• **Encaissements (Loyers encaissés)** : +${totalCol.toLocaleString('fr-FR')} FCFA\n• **Dépenses (Charges & Travaux déductibles)** : -${totalExp.toLocaleString('fr-FR')} FCFA\n• **Commissions Agence (8%)** : -${totalComm.toLocaleString('fr-FR')} FCFA\n━━━━━━━━━━━━━━━━━━━━\n💎 **SOLDE NET A REVERSER** : **${netPayout.toLocaleString('fr-FR')} FCFA**\n\nMën nga xool situation bu chaque bailleur, imprimer relevé PDF wala envoyer ko ci WhatsApp !`
          : `🏛️ **Situation Financière des Bailleurs (Compte de Gérance) :**\n• **1. Total Encaissements (Loyers perçus)** : +${totalCol.toLocaleString('fr-FR')} FCFA\n• **2. Total Dépenses déductibles (Charges & Travaux)** : -${totalExp.toLocaleString('fr-FR')} FCFA\n• **3. Commissions d'agence (8%)** : -${totalComm.toLocaleString('fr-FR')} FCFA\n━━━━━━━━━━━━━━━━━━━━\n💎 **SOLDE NET A REVERSER AUX BAILLEURS** : **${netPayout.toLocaleString('fr-FR')} FCFA**\n\nVous pouvez consulter la ventilation complète par bailleur, télécharger les relevés officiels PDF et enregistrer les reversements.`,
        actions: [
          { type: 'NAVIGATE' as const, label: '🏛️ Ouvrir Situation des Bailleurs', url: '/app/landlord-statements' },
          { type: 'NAVIGATE' as const, label: '👥 Voir les Propriétaires', url: '/app/owners' }
        ]
      };
    }

    // 6. TOTAL LOYERS & FINANCES (GLOBAL SUMMARY)
    if (
      q.includes('total') ||
      q.includes('recette') ||
      q.includes('loyer') ||
      q.includes('finance') ||
      q.includes('chiffre') ||
      q.includes('xaliss')
    ) {
      const totalRentsFCFA = rentSchedules.reduce((acc, s) => acc + (s.totalDueFCFA || s.rentFCFA || 0), 0);
      const totalPaidFCFA = payments.reduce((acc, p) => acc + (Number(p.amountFCFA) || 0), 0);
      const totalExpensesFCFA = expenses.reduce((acc, e) => acc + (Number(e.amountFCFA) || 0), 0);
      const netBenefit = totalPaidFCFA - totalExpensesFCFA;

      return {
        text: detectedWolof
          ? `📊 **Bilan financier bu Agence bi :**
• **Total loyers attendus** : **${totalRentsFCFA.toLocaleString('fr-FR')} FCFA**
• **Loyers encaissés** : **${totalPaidFCFA.toLocaleString('fr-FR')} FCFA**
• **Dépenses effectuées** : **${totalExpensesFCFA.toLocaleString('fr-FR')} FCFA**
• **Solde Net Agence** : **${netBenefit.toLocaleString('fr-FR')} FCFA**`
          : `📊 **Synthèse financière globale de l'agence :**
• **Total loyers appelés** : **${totalRentsFCFA.toLocaleString('fr-FR')} FCFA**
• **Total loyers réellement encaissés** : **${totalPaidFCFA.toLocaleString('fr-FR')} FCFA**
• **Total charges & dépenses décaissées** : **${totalExpensesFCFA.toLocaleString('fr-FR')} FCFA**
• **Bénéfice Net disponible** : **${netBenefit.toLocaleString('fr-FR')} FCFA**`,
        actions: [
          { type: 'NAVIGATE' as const, label: '💰 Gestion des Loyers', url: '/app/rents' },
          { type: 'NAVIGATE' as const, label: '💳 Historique des Paiements', url: '/app/payments' },
          { type: 'NAVIGATE' as const, label: '📈 Rapports Financiers', url: '/app/reports' }
        ]
      };
    }

    // 7. NAVIGATION DIRECTE
    if (q.includes('contrat') || q.includes('bail')) {
      router.push('/app/contracts');
      return {
        text: detectedWolof
          ? `📄 **Mangi lay yóbb ci page Contrat yi !** Foofu nga mënë guiss baux yepp ak quittances.`
          : `📄 **Je vous ouvre la page des Contrats & Baux.** Vous pouvez y télécharger et générer tous les baux conformes.`,
        actions: [{ type: 'NAVIGATE' as const, label: 'Ouvrir Contrats', url: '/app/contracts' }]
      };
    }

    if (q.includes('propriétaire') || q.includes('bailleur')) {
      router.push('/app/owners');
      return {
        text: detectedWolof
          ? `🤝 **Mangi lay yóbb ci page Propriétaires yi !**`
          : `🤝 **Je vous ouvre le répertoire des Propriétaires Bailleurs.**`,
        actions: [{ type: 'NAVIGATE' as const, label: 'Ouvrir Propriétaires', url: '/app/owners' }]
      };
    }

    // 8. DEFAULT FALLBACK WITH HELPFUL ASSISTANCE
    return {
      text: detectedWolof
        ? `Dégg na sa laathie : *"**${rawQuery}**"*. 

Man Sunu IA mën na la dimbalé ci :
1. **Impayés yi** : xam ban locataire mo am bor ak relancé ko ci WhatsApp
2. **Immeuble yi** : Zac Mbao, Alpha Oumar, Grand Yoff, Niarry Tally...
3. **Locataires yi** : créer locataire bu bees walla modifier ko
4. **Artisans yi** : plombier, électricien, frigoriste
5. **Xaliss bi** : loyers yi, paiements yi ak dépenses yi`
        : `J'ai bien reçu votre demande : *"**${rawQuery}**"*.

En tant qu'assistant de votre agence, je peux immédiatement vous aider à :
1. **Traiter les impayés** et envoyer des relances WhatsApp automatiques
2. **Vérifier l'état de n'importe quel immeuble** (Zac Mbao, Alpha Oumar, Grand Yoff...)
3. **Enregistrer ou attribuer un locataire** à sa maison sans risque d'erreur
4. **Trouver un artisan qualifié** (plomberie, électricité, clim) avec contact direct
5. **Afficher le bilan financier** et le recouvrement des loyers`,
      actions: [
        { type: 'NAVIGATE' as const, label: '🚨 Voir les Impayés', url: '/app/arrears' },
        { type: 'NAVIGATE' as const, label: '🏢 Liste des Biens', url: '/app/properties' },
        { type: 'NAVIGATE' as const, label: '👥 Répertoire Locataires', url: '/app/tenants' }
      ]
    };
  };

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsThinking(true);

    setTimeout(() => {
      const response = processQuery(query);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: response.text,
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        actions: response.actions
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsThinking(false);
      speakText(response.text);
    }, 450);
  };

  const handleActionClick = (action: NonNullable<ChatMessage['actions']>[number]) => {
    if (action.url) {
      if (action.url.startsWith('http')) {
        window.open(action.url, '_blank');
      } else {
        router.push(action.url);
        // Sur mobile, refermer pour voir la page
        if (typeof window !== 'undefined' && window.innerWidth < 640) {
          setIsOpen(false);
        }
      }
    } else if (action.onClick) {
      action.onClick();
    }
  };

  const quickPrompts = [
    { label: '🚨 Impayés de loyer', query: 'Quels sont les locataires en retard ?' },
    { label: '🇸🇳 Ban locataires ñoo am bor ?', query: 'Ban locataires ñoo am ay impayés ?' },
    { label: '🏢 Logements Zac Mbao', query: 'Combien de logements vacants à Zac Mbao ?' },
    { label: '🇸🇳 Xaliss bi (Loyers)', query: 'Ñata xaliss lañu dajale wéer wi ?' },
    { label: '🔧 Trouver un plombier', query: 'Donne-moi le contact d\'un plombier disponible' },
    { label: '➕ Ajouter locataire', query: 'Je veux ajouter un nouveau locataire' },
  ];

  return (
    <>
      {/* Floating Action Trigger Button (Bottom Right) */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="group relative flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer border border-white/20"
          title="Ouvrir Sunu IA - Assistant Vocal en Français & Wolof"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-900 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-900" />
          </div>

          <div className="flex flex-col text-left">
            <span className="text-xs font-black tracking-wide flex items-center gap-1.5">
              <span>Sunu IA</span>
              <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded-full font-bold">Vocal FR / Wolof</span>
            </span>
            <span className="text-[10px] text-blue-100 font-medium hidden sm:inline">
              Assistant Tâches & Vocal
            </span>
          </div>

          <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
        </button>
      </div>

      {/* Slide-out / Modal Drawer AI Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 w-[95vw] sm:w-[440px] h-[640px] max-h-[82vh] bg-white rounded-3xl shadow-2xl border border-slate-200 z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 duration-300 font-sans">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 text-white">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black tracking-tight">Sunu IA Assistant</h3>
                  <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[9px] font-extrabold rounded-md border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    En direct
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 flex items-center gap-1">
                  <Languages className="w-3 h-3 text-blue-400" />
                  <span>Français & Wolof • Reconnaissance vocale</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Voice Output Speaker Toggle */}
              <button
                type="button"
                onClick={() => setVoiceOutputEnabled(!voiceOutputEnabled)}
                className={`p-2 rounded-xl text-xs transition cursor-pointer ${
                  voiceOutputEnabled
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
                title={voiceOutputEnabled ? 'Désactiver la voix audio' : 'Activer la réponse vocale (Audio)'}
              >
                {voiceOutputEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
                title="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Language Selector Ribbon */}
          <div className="px-4 py-2 bg-slate-100 border-b border-slate-200/80 flex items-center justify-between text-xs">
            <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
              <span>Langue parlée :</span>
            </span>
            <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setPreferredLang('AUTO')}
                className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold transition cursor-pointer ${
                  preferredLang === 'AUTO' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Auto (FR/WO)
              </button>
              <button
                type="button"
                onClick={() => setPreferredLang('FR')}
                className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold transition cursor-pointer ${
                  preferredLang === 'FR' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🇫🇷 Français
              </button>
              <button
                type="button"
                onClick={() => setPreferredLang('WO')}
                className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold transition cursor-pointer ${
                  preferredLang === 'WO' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🇸🇳 Wolof
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/70 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 space-y-2.5 shadow-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs'
                  }`}
                >
                  <div className="whitespace-pre-line font-medium text-xs">
                    {m.text}
                  </div>

                  {/* Actions generated by AI */}
                  {m.actions && m.actions.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                      {m.actions.map((act, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleActionClick(act)}
                          className={`text-[11px] font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                            act.type === 'WHATSAPP'
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
                          }`}
                        >
                          <span>{act.label}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                  )}

                  <div
                    className={`text-[9px] text-right ${
                      m.sender === 'user' ? 'text-blue-100' : 'text-slate-400'
                    }`}
                  >
                    {m.time}
                  </div>
                </div>

                {m.sender === 'user' && (
                  <div className="w-7 h-7 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isThinking && (
              <div className="flex gap-2.5 items-center text-slate-500 text-xs italic">
                <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 animate-bounce" />
                </div>
                <div className="bg-white border border-slate-200 px-3 py-2 rounded-2xl flex items-center gap-1.5 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
                  <span>Sunu IA réfléchit et analyse vos données...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions Pills */}
          <div className="p-2.5 bg-white border-t border-slate-100 overflow-x-auto flex gap-1.5 scrollbar-none">
            {quickPrompts.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(item.query)}
                className="shrink-0 text-[10px] font-bold px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-lg transition border border-slate-200/80 cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Listening Audio Waves Indicator */}
          {isListening && (
            <div className="px-4 py-2 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white text-xs font-bold flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 animate-bounce" />
                <span>Microphone actif : Parlez en Français ou Wolof...</span>
              </div>
              <button
                type="button"
                onClick={toggleVoiceInput}
                className="text-[10px] bg-white/20 px-2 py-0.5 rounded-md hover:bg-white/30 cursor-pointer"
              >
                Arrêter
              </button>
            </div>
          )}

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            {/* Microphone Button */}
            <button
              type="button"
              onClick={toggleVoiceInput}
              className={`p-2.5 rounded-xl transition cursor-pointer flex items-center justify-center shrink-0 ${
                isListening
                  ? 'bg-rose-600 text-white animate-pulse shadow-md shadow-rose-600/30 ring-2 ring-rose-400'
                  : 'bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-600'
              }`}
              title="Parler au micro en Français ou Wolof"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                isListening
                  ? 'Écoute vocale en cours...'
                  : 'Posez une question ou donnez un ordre (Français / Wolof)...'
              }
              className="flex-1 py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 text-white rounded-xl shadow-md shadow-blue-600/20 transition cursor-pointer shrink-0"
              title="Envoyer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
