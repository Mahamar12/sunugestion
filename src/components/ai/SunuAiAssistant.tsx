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
  Compass,
  Trash2,
  PlusCircle,
  Receipt,
  Check,
  CheckCheck,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { Tenant, Property, Vendor, Owner, Payment, Expense } from '@/types/sunugestion';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
  lang?: 'fr' | 'wo';
  actions?: {
    type: 'NAVIGATE' | 'WHATSAPP' | 'PROPERTY' | 'TENANT' | 'VENDOR' | 'EXECUTE' | 'PRINT';
    label: string;
    variant?: 'primary' | 'danger' | 'success' | 'warning';
    url?: string;
    phone?: string;
    onClick?: () => void;
  }[];
}

export default function SunuAiAssistant() {
  const router = useRouter();
  const {
    properties,
    owners,
    units,
    tenants,
    leases,
    rentSchedules,
    arrears,
    payments,
    expenses,
    vendors,
    recordPayment,
    deletePayment,
    addExpense,
    deleteExpense,
    addTenant,
    deleteTenant,
    addOwner,
    deleteOwner,
    addProperty,
    deleteProperty,
    createMaintenanceTicket,
    sendRelance,
    setSelectedDocumentForPrint
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
      text: `👋 **Salamalekum ! Je suis Sunu IA, votre agent autonome.**

Je contrôle l'ensemble de votre application pour exécuter vos ordres en **Français** ou en **Wolof** :

✨ **Actions directes que je peux réaliser pour vous :**
• 💰 **Ajouter un encaissement** : *"Encaisse 200 000 FCFA pour Mamadou Diallo"*
• ❌ **Supprimer un encaissement** : *"Supprime le dernier paiement"*
• 💸 **Ajouter une dépense** : *"Ajoute une dépense de 45 000 FCFA pour plomberie"*
• 🗑️ **Supprimer une dépense** : *"Supprime la dépense de 45 000 FCFA"*
• 👤 **Ajouter un locataire** : *"Ajoute le locataire Moussa Sow loyer 250000"*
• 🚫 **Supprimer un locataire** : *"Supprime le locataire Moussa Sow"*
• 🤝 **Ajouter / Supprimer un bailleur** : *"Ajoute le bailleur Ousmane Diop"*
• 🚨 **Relances & Impayés** : *"Quels sont les locataires en retard ?"*

Donnez-moi simplement un ordre à l'écrit ou au micro !`,
      time: 'À l\'instant',
      lang: 'fr',
      actions: [
        { type: 'NAVIGATE', label: '📊 Tableau de Bord', url: '/app/dashboard' },
        { type: 'NAVIGATE', label: '🏛️ Situation Bailleurs', url: '/app/landlord-statements' },
        { type: 'NAVIGATE', label: '🚨 Gérer les Impayés', url: '/app/arrears' }
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

  // Helper extraction functions
  const extractAmount = (text: string): number | null => {
    const kMatch = text.match(/(\d+)\s*k\b/i);
    if (kMatch) return parseInt(kMatch[1], 10) * 1000;

    const clean = text.replace(/\s+/g, ' ').replace(/(\d+)[.,\s](\d{3})/g, '$1$2');
    const match = clean.match(/(\d{4,9})/);
    if (match) return parseInt(match[1], 10);

    const smallMatch = clean.match(/(\d{2,3})\s*(?:000|mille)/i);
    if (smallMatch) return parseInt(smallMatch[1], 10) * 1000;

    return null;
  };

  const findTenantInText = (text: string): Tenant | null => {
    const lower = text.toLowerCase();
    for (const t of tenants) {
      const fullName = `${t.firstName} ${t.lastName}`.toLowerCase();
      const reverseName = `${t.lastName} ${t.firstName}`.toLowerCase();
      const first = t.firstName.toLowerCase();
      const last = t.lastName.toLowerCase();
      if (lower.includes(fullName) || lower.includes(reverseName)) return t;
      if (first.length > 2 && lower.includes(first)) return t;
      if (last.length > 2 && lower.includes(last)) return t;
    }
    return null;
  };

  const findOwnerInText = (text: string): Owner | null => {
    const lower = text.toLowerCase();
    for (const o of owners) {
      const fullName = `${o.firstName} ${o.lastName}`.toLowerCase();
      const reverseName = `${o.lastName} ${o.firstName}`.toLowerCase();
      const first = o.firstName.toLowerCase();
      const last = o.lastName.toLowerCase();
      if (lower.includes(fullName) || lower.includes(reverseName)) return o;
      if (first.length > 2 && lower.includes(first)) return o;
      if (last.length > 2 && lower.includes(last)) return o;
    }
    return null;
  };

  const findPropertyInText = (text: string): Property | null => {
    const lower = text.toLowerCase();
    for (const p of properties) {
      const pName = p.name.toLowerCase();
      if (lower.includes(pName)) return p;
      if (pName.includes('zac') && (lower.includes('zac') || lower.includes('mbao'))) return p;
      if (pName.includes('alpha') && lower.includes('alpha')) return p;
      if (pName.includes('grand yoff') && (lower.includes('yoff') || lower.includes('grand yoff'))) return p;
    }
    return null;
  };

  // Traitement Intelligent et Exécution Autonome des Requêtes
  const processQuery = (rawQuery: string): { text: string; actions?: ChatMessage['actions'] } => {
    const q = rawQuery.toLowerCase().trim();

    // Détection Wolof
    const isWolofWords = [
      'nanga', 'naka', 'ban', 'ñoo', 'ñata', 'xaliss', 'fay', 'fayagul', 'luy', 'xew', 'am na', 'ana',
      'yokk', 'ubbi', 'demal', 'wutal', 'jerejef', 'waaw', 'déedéet', 'dafa', 'nekk', 'biens yi', 'mënë', 'dindi'
    ];
    const detectedWolof = isWolofWords.some(w => q.includes(w)) || preferredLang === 'WO';

    const isDeleteIntent =
      q.includes('supprim') ||
      q.includes('annul') ||
      q.includes('effac') ||
      q.includes('dindi') ||
      q.includes('retir') ||
      q.includes('enlev');

    // =========================================================================
    // 1. GESTION DES ENCAISSEMENTS (AJOUT OU SUPPRESSION)
    // =========================================================================
    if (
      q.includes('encaisse') ||
      q.includes('encaissement') ||
      q.includes('paiement') ||
      q.includes('payer') ||
      q.includes('fay') ||
      q.includes('versement') ||
      q.includes('quittance')
    ) {
      // 1.A : SUPPRIMER UN ENCAISSEMENT
      if (isDeleteIntent) {
        const amt = extractAmount(q);
        const tenant = findTenantInText(q);

        let targetPayment: Payment | undefined;
        if (amt && tenant) {
          targetPayment = payments.find(p => p.tenantId === tenant.id && p.amountFCFA === amt);
        } else if (tenant) {
          targetPayment = payments.find(p => p.tenantId === tenant.id);
        } else if (amt) {
          targetPayment = payments.find(p => p.amountFCFA === amt);
        } else if (payments.length > 0) {
          // Dernier paiement par défaut
          targetPayment = payments[0];
        }

        if (targetPayment) {
          const removedPay = targetPayment;
          deletePayment(removedPay.id);
          const payTenant = tenants.find(t => t.id === removedPay.tenantId);
          const tenantLabel = payTenant ? `${payTenant.firstName} ${payTenant.lastName}` : (removedPay.notes || 'Locataire');

          return {
            text: detectedWolof
              ? `🗑️ **Dindi nañu encaissement bi !**
Paiement bu **${removedPay.amountFCFA.toLocaleString('fr-FR')} FCFA** (${tenantLabel}) dindi nañu ko ci xaliss bi ak ci relevés yi.`
              : `🗑️ **L'encaissement a été supprimé avec succès !**
Le paiement de **${removedPay.amountFCFA.toLocaleString('fr-FR')} FCFA** pour **${tenantLabel}** a été annulé et retiré de l'historique comptable.`,
            actions: [
              { type: 'NAVIGATE', label: '💳 Historique des Paiements', url: '/app/payments' },
              { type: 'NAVIGATE', label: '🏛️ Situation Bailleurs', url: '/app/landlord-statements' }
            ]
          };
        } else {
          // Proposer les paiements récents à supprimer
          const recentActions = payments.slice(0, 3).map(p => {
            const payT = tenants.find(t => t.id === p.tenantId);
            const label = payT ? `${payT.firstName} ${payT.lastName}` : (p.periodMonthYear || 'Paiement');
            return {
              type: 'EXECUTE' as const,
              label: `Supprimer ${p.amountFCFA.toLocaleString('fr-FR')} CFA (${label})`,
              variant: 'danger' as const,
              onClick: () => {
                deletePayment(p.id);
                setMessages(prev => [
                  ...prev,
                  {
                    id: `ai-del-${Date.now()}`,
                    sender: 'ai',
                    text: `🗑️ Encaissement de ${p.amountFCFA.toLocaleString('fr-FR')} FCFA (${label}) supprimé avec succès !`,
                    time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                  }
                ]);
              }
            };
          });

          return {
            text: `Quel encaissement souhaitez-vous supprimer ? Cliquez directement sur l'un des paiements récents ci-dessous :`,
            actions: recentActions
          };
        }
      }

      // 1.B : AJOUTER UN ENCAISSEMENT
      const amt = extractAmount(q);
      const tenant = findTenantInText(q);

      if (amt && tenant) {
        // Enregistrement direct et immédiat
        const doc = recordPayment({
          tenantId: tenant.id,
          amountFCFA: amt,
          method: 'ESPECES',
          periodMonthYear: 'Septembre 2026',
          notes: 'Encaissé via Sunu IA Assistant'
        });

        return {
          text: detectedWolof
            ? `✅ **Waaw, encaissement bi bind nañu ko !**
• Locataire : **${tenant.firstName} ${tenant.lastName}**
• Montant : **${amt.toLocaleString('fr-FR')} FCFA**
• Wéer : **Septembre 2026**
• Reçu quittance généré na automatique !`
            : `✅ **L'encaissement a été validé et enregistré avec succès !**
• **Locataire** : ${tenant.firstName} ${tenant.lastName} (${tenant.propertyName || 'Bien'})
• **Montant encaissé** : **${amt.toLocaleString('fr-FR')} FCFA**
• **Période** : Septembre 2026
• **Quittance officielle** : Générée et disponible immédiatement.`,
          actions: [
            {
              type: 'PRINT',
              label: '🖨️ Voir & Imprimer la Quittance',
              onClick: () => { if (doc) setSelectedDocumentForPrint(doc); }
            },
            { type: 'NAVIGATE', label: '🏛️ Voir Relevé Bailleur', url: '/app/landlord-statements' },
            { type: 'NAVIGATE', label: '💳 Journal des Paiements', url: '/app/payments' }
          ]
        };
      }

      // Si locataire spécifié mais pas de montant -> utiliser son loyer
      if (tenant && !amt) {
        const rentAmount = tenant.rentFCFA || 200000;
        return {
          text: detectedWolof
            ? `Bëgg nga encaisso loyer bu **${tenant.firstName} ${tenant.lastName}** (${rentAmount.toLocaleString('fr-FR')} FCFA) ?`
            : `Souhaitez-vous enregistrer le loyer complet de **${tenant.firstName} ${tenant.lastName}** d'un montant de **${rentAmount.toLocaleString('fr-FR')} FCFA** ?`,
          actions: [
            {
              type: 'EXECUTE',
              label: `✅ Confirmer encaissement ${rentAmount.toLocaleString('fr-FR')} CFA`,
              variant: 'success',
              onClick: () => {
                const doc = recordPayment({
                  tenantId: tenant.id,
                  amountFCFA: rentAmount,
                  method: 'ESPECES',
                  periodMonthYear: 'Septembre 2026',
                  notes: 'Encaissé via Sunu IA Assistant'
                });
                setMessages(prev => [
                  ...prev,
                  {
                    id: `ai-enc-${Date.now()}`,
                    sender: 'ai',
                    text: `✅ Encaissement de ${rentAmount.toLocaleString('fr-FR')} FCFA pour ${tenant.firstName} ${tenant.lastName} enregistré avec succès !`,
                    time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                    actions: [
                      {
                        type: 'PRINT',
                        label: '🖨️ Imprimer la Quittance',
                        onClick: () => { if (doc) setSelectedDocumentForPrint(doc); }
                      }
                    ]
                  }
                ]);
              }
            },
            { type: 'NAVIGATE', label: '💰 Ouvrir Gestion Loyers', url: '/app/rents' }
          ]
        };
      }

      // Liste d'encaissements rapides en 1 clic
      const quickEncaissements = tenants.slice(0, 3).map(t => ({
        type: 'EXECUTE' as const,
        label: `Encaisser ${t.firstName} ${t.lastName} (${(t.rentFCFA || 200000).toLocaleString('fr-FR')} CFA)`,
        variant: 'primary' as const,
        onClick: () => {
          const doc = recordPayment({
            tenantId: t.id,
            amountFCFA: t.rentFCFA || 200000,
            method: 'ESPECES',
            periodMonthYear: 'Septembre 2026',
            notes: 'Encaissé via Sunu IA Assistant'
          });
          setMessages(prev => [
            ...prev,
            {
              id: `ai-enc-${Date.now()}`,
              sender: 'ai',
              text: `✅ Encaissement de ${(t.rentFCFA || 200000).toLocaleString('fr-FR')} FCFA pour ${t.firstName} ${t.lastName} validé !`,
              time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
              actions: [
                {
                  type: 'PRINT',
                  label: '🖨️ Voir Quittance',
                  onClick: () => { if (doc) setSelectedDocumentForPrint(doc); }
                }
              ]
            }
          ]);
        }
      }));

      return {
        text: detectedWolof
          ? `💰 **Ban locataire nga bëgg encaisse ?**
Mën nga ma wax par exemple : *"Encaisse 200000 pour ${tenants[0]?.firstName || 'Mamadou'}"*, walla nga cliquer directement ci boutons yi ci suuf :`
          : `💰 **Pour quel locataire souhaitez-vous enregistrer un encaissement ?**
Vous pouvez me dire : *"Encaisse 200 000 pour ${tenants[0]?.firstName || 'Mamadou'}"* ou choisir directement en 1 clic :`,
        actions: [
          ...quickEncaissements,
          { type: 'NAVIGATE', label: '➕ Formulaire Paiement', url: '/app/payments' }
        ]
      };
    }

    // =========================================================================
    // 2. GESTION DES DÉPENSES (AJOUT OU SUPPRESSION)
    // =========================================================================
    if (
      q.includes('dépense') ||
      q.includes('depense') ||
      q.includes('facture') ||
      q.includes('charge') ||
      q.includes('frais') ||
      q.includes('travaux')
    ) {
      // 2.A : SUPPRIMER UNE DÉPENSE
      if (isDeleteIntent) {
        const amt = extractAmount(q);
        let targetExpense: Expense | undefined;

        if (amt) {
          targetExpense = expenses.find(e => e.amountFCFA === amt);
        } else if (expenses.length > 0) {
          targetExpense = expenses[0];
        }

        if (targetExpense) {
          const removedExp = targetExpense;
          deleteExpense(removedExp.id);

          return {
            text: detectedWolof
              ? `🗑️ **Dindi nañu dépense bi !**
Dépense bu **${removedExp.amountFCFA.toLocaleString('fr-FR')} FCFA** (${removedExp.description}) dindi nañu ko ci comptabilité agence bi.`
              : `🗑️ **La dépense a été supprimée avec succès !**
La dépense de **${removedExp.amountFCFA.toLocaleString('fr-FR')} FCFA** (*${removedExp.description}*) a été annulée et déduite de l'état des dépenses.`,
            actions: [
              { type: 'NAVIGATE', label: '💸 Voir le journal des dépenses', url: '/app/expenses' },
              { type: 'NAVIGATE', label: '🏛️ Situation Bailleurs', url: '/app/landlord-statements' }
            ]
          };
        } else {
          const recentExpActions = expenses.slice(0, 3).map(e => ({
            type: 'EXECUTE' as const,
            label: `Supprimer ${e.amountFCFA.toLocaleString('fr-FR')} CFA (${e.description.slice(0, 20)})`,
            variant: 'danger' as const,
            onClick: () => {
              deleteExpense(e.id);
              setMessages(prev => [
                ...prev,
                {
                  id: `ai-exp-del-${Date.now()}`,
                  sender: 'ai',
                  text: `🗑️ Dépense de ${e.amountFCFA.toLocaleString('fr-FR')} FCFA supprimée avec succès !`,
                  time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                }
              ]);
            }
          }));

          return {
            text: `Quelle dépense souhaitez-vous supprimer ? Cliquez sur l'une des dépenses récentes ci-dessous :`,
            actions: recentExpActions
          };
        }
      }

      // 2.B : AJOUTER UNE DÉPENSE
      const amt = extractAmount(q);
      const matchedProp = findPropertyInText(q) || properties[0];

      let desc = 'Dépense / Entretien courant';
      if (q.includes('plomb') || q.includes('fuite')) desc = 'Réparation plomberie et robinetterie';
      else if (q.includes('electr') || q.includes('courant')) desc = 'Dépannage réseau électrique';
      else if (q.includes('clim') || q.includes('frigoriste')) desc = 'Maintenance climatiseurs';
      else if (q.includes('serrur') || q.includes('porte')) desc = 'Remplacement serrure';
      else if (q.includes('peint')) desc = 'Travaux de peinture';
      else if (q.includes('nettoy') || q.includes('menage')) desc = 'Entretien et nettoyage parties communes';

      if (amt) {
        addExpense({
          agencyId: 'org-1',
          propertyId: matchedProp?.id || 'prop-1',
          propertyName: matchedProp?.name || 'Immeuble Agence',
          category: 'ENTRETIEN',
          amountFCFA: amt,
          date: new Date().toISOString().split('T')[0],
          vendorName: 'Prestataire Agence',
          description: desc
        });

        return {
          text: detectedWolof
            ? `✅ **Dépense bi bind nañu ko !**
• Montant : **${amt.toLocaleString('fr-FR')} FCFA**
• Motif : **${desc}**
• Bien : **${matchedProp?.name || 'Immeuble'}**
Dafa wàññiku automatique ci relevé bu bailleur bi !`
            : `✅ **La dépense a été enregistrée avec succès !**
• **Montant** : **${amt.toLocaleString('fr-FR')} FCFA**
• **Désignation** : ${desc}
• **Immeuble affecté** : ${matchedProp?.name || 'Immeuble Agence'}
• **Date** : ${new Date().toLocaleDateString('fr-FR')}
La dépense est immédiatement déduite du reversement net du bailleur.`,
          actions: [
            { type: 'NAVIGATE', label: '🏛️ Situation des Bailleurs', url: '/app/landlord-statements' },
            { type: 'NAVIGATE', label: '💸 Journal des Dépenses', url: '/app/expenses' }
          ]
        };
      }

      // Proposer des modèles de dépenses rapides en 1 clic
      const quickExpenses = [
        { label: 'Réparation Plomberie (25 000 CFA)', amount: 25000, desc: 'Réparation plomberie / fuite' },
        { label: 'Dépannage Électricité (35 000 CFA)', amount: 35000, desc: 'Dépannage réseau électrique' },
        { label: 'Entretien & Nettoyage (40 000 CFA)', amount: 40000, desc: 'Nettoyage des parties communes' },
        { label: 'Remplacement Serrure (20 000 CFA)', amount: 20000, desc: 'Changement serrure et clés' }
      ].map(item => ({
        type: 'EXECUTE' as const,
        label: `+ ${item.label}`,
        variant: 'primary' as const,
        onClick: () => {
          addExpense({
            agencyId: 'org-1',
            propertyId: properties[0]?.id || 'prop-1',
            propertyName: properties[0]?.name || 'Bien Agence',
            category: 'ENTRETIEN',
            amountFCFA: item.amount,
            date: new Date().toISOString().split('T')[0],
            vendorName: 'Prestataire Agence',
            description: item.desc
          });
          setMessages(prev => [
            ...prev,
            {
              id: `ai-exp-add-${Date.now()}`,
              sender: 'ai',
              text: `✅ Dépense de ${item.amount.toLocaleString('fr-FR')} FCFA (${item.desc}) enregistrée avec succès !`,
              time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
            }
          ]);
        }
      }));

      return {
        text: detectedWolof
          ? `💸 **Ñata xaliss nga bëgg def ci dépense bi ?**
Mën nga ma wax par exemple : *"Ajoute une dépense de 45 000 FCFA pour plomberie"*, walla nga cliquer directement ci suuf :`
          : `💸 **Quel est le montant et le motif de votre dépense ?**
Vous pouvez me dire : *"Ajoute une dépense de 45 000 FCFA pour plomberie"* ou choisir une action rapide :`,
        actions: [
          ...quickExpenses,
          { type: 'NAVIGATE', label: '➕ Formulaire Dépense', url: '/app/expenses' }
        ]
      };
    }

    // =========================================================================
    // 3. GESTION DES LOCATAIRES (AJOUT OU SUPPRESSION)
    // =========================================================================
    if (q.includes('locataire') || q.includes('locataires')) {
      // 3.A : SUPPRIMER UN LOCATAIRE
      if (isDeleteIntent) {
        const tenant = findTenantInText(q);
        if (tenant) {
          deleteTenant(tenant.id);
          return {
            text: detectedWolof
              ? `🗑️ **Locataire bi dindi nañu ko !**
**${tenant.firstName} ${tenant.lastName}** dindi nañu ko ci agence bi, néeg bi libéré na.`
              : `🗑️ **Le locataire ${tenant.firstName} ${tenant.lastName} a été supprimé avec succès !**
Son dossier a été clôturé, son logement est marqué vacant et tous ses états sont archivés.`,
            actions: [
              { type: 'NAVIGATE', label: '👥 Voir la liste des locataires', url: '/app/tenants' },
              { type: 'NAVIGATE', label: '🏢 Voir l\'état des biens', url: '/app/properties' }
            ]
          };
        } else {
          const tenantDelActions = tenants.slice(0, 4).map(t => ({
            type: 'EXECUTE' as const,
            label: `Supprimer ${t.firstName} ${t.lastName}`,
            variant: 'danger' as const,
            onClick: () => {
              deleteTenant(t.id);
              setMessages(prev => [
                ...prev,
                {
                  id: `ai-ten-del-${Date.now()}`,
                  sender: 'ai',
                  text: `🗑️ Locataire ${t.firstName} ${t.lastName} supprimé avec succès !`,
                  time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                }
              ]);
            }
          }));

          return {
            text: `Quel locataire souhaitez-vous supprimer de l'agence ? Sélectionnez-le ci-dessous :`,
            actions: tenantDelActions
          };
        }
      }

      // 3.B : AJOUTER UN LOCATAIRE
      const amt = extractAmount(q);
      const matchedProp = findPropertyInText(q) || properties[0];

      // Extraction nom/prénom sommaire
      const cleanQ = q.replace(/ajoute|ajouter|créer|locataire|nouveau|loyer|fcfa|cfa|dans|immeuble|villa|appartement|mbao|yoff/gi, '').trim();
      const words = cleanQ.split(/\s+/).filter(w => w.length > 2);
      const firstName = words[0] ? words[0].charAt(0).toUpperCase() + words[0].slice(1) : 'Nouveau';
      const lastName = words[1] ? words[1].charAt(0).toUpperCase() + words[1].slice(1) : 'Locataire';

      if (words.length >= 2) {
        const rentValue = amt || 200000;
        addTenant({
          agencyId: 'org-1',
          firstName,
          lastName,
          phone: '+221 77 000 00 00',
          whatsapp: '+221 77 000 00 00',
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
          address: 'Dakar, Sénégal',
          profession: 'Salarié',
          identityDocType: 'CNI',
          identityDocNumber: `SN-${Date.now().toString().slice(-8)}`,
          emergencyContact: 'Contact Famille',
          emergencyPhone: '+221 77 000 00 00',
          unitId: `unit-${Date.now().toString().slice(-6)}`,
          unitNumber: 'Logement 1',
          propertyId: matchedProp?.id || 'prop-1',
          propertyName: matchedProp?.name || 'Immeuble Agence',
          rentFCFA: rentValue,
          entryDate: '2026-09-01',
          currentLeaseId: `lease-${Date.now().toString().slice(-6)}`,
          status: 'ACTIF'
        });

        return {
          text: detectedWolof
            ? `✅ **Locataire bu bees bi bind nañu ko !**
• Nom : **${firstName} ${lastName}**
• Loyer : **${rentValue.toLocaleString('fr-FR')} FCFA**
• Immeuble : **${matchedProp?.name || 'Agence'}**`
            : `✅ **Le locataire a été créé et enregistré avec succès !**
• **Identité** : ${firstName} ${lastName}
• **Loyer mensuel** : **${rentValue.toLocaleString('fr-FR')} FCFA**
• **Immeuble d'affectation** : ${matchedProp?.name || 'Immeuble Agence'}
• **Statut** : Actif (Bail en cours)`,
          actions: [
            { type: 'NAVIGATE', label: '👥 Voir la fiche locataire', url: '/app/tenants' },
            { type: 'NAVIGATE', label: '📄 Générer le Contrat de Bail', url: '/app/contracts' }
          ]
        };
      }

      return {
        text: detectedWolof
          ? `✍️ **Bëgg nga yokk benn locataire ?**
Mën nga ma wax par exemple : *"Ajoute le locataire Abdoulaye Ba loyer 250000"* walla nga ouvrir formulaire bi :`
          : `✍️ **Vous souhaitez enregistrer un nouveau locataire ?**
Vous pouvez me dicter : *"Ajoute le locataire Abdoulaye Ba avec loyer 250 000"* ou ouvrir le formulaire complet :`,
        actions: [
          { type: 'NAVIGATE', label: '➕ Ouvrir formulaire d\'ajout locataire', url: '/app/tenants' },
          { type: 'NAVIGATE', label: '🏢 Liste des Biens', url: '/app/properties' }
        ]
      };
    }

    // =========================================================================
    // 4. GESTION DES BAILLEURS / PROPRIÉTAIRES (AJOUT OU SUPPRESSION)
    // =========================================================================
    if (q.includes('bailleur') || q.includes('bailleurs') || q.includes('propriétaire') || q.includes('proprietaire')) {
      // 4.A : SUPPRIMER UN BAILLEUR
      if (isDeleteIntent) {
        const owner = findOwnerInText(q);
        if (owner) {
          deleteOwner(owner.id);
          return {
            text: detectedWolof
              ? `🗑️ **Bailleur bi dindi nañu ko !**
**${owner.firstName} ${owner.lastName}** dindi nañu ko ci liste bailleurs yi.`
              : `🗑️ **Le bailleur ${owner.firstName} ${owner.lastName} a été supprimé avec succès.**`,
            actions: [
              { type: 'NAVIGATE', label: '👥 Répertoire des Bailleurs', url: '/app/owners' }
            ]
          };
        } else {
          const ownerDelActions = owners.slice(0, 3).map(o => ({
            type: 'EXECUTE' as const,
            label: `Supprimer ${o.firstName} ${o.lastName}`,
            variant: 'danger' as const,
            onClick: () => {
              deleteOwner(o.id);
              setMessages(prev => [
                ...prev,
                {
                  id: `ai-own-del-${Date.now()}`,
                  sender: 'ai',
                  text: `🗑️ Propriétaire ${o.firstName} ${o.lastName} supprimé avec succès !`,
                  time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                }
              ]);
            }
          }));

          return {
            text: `Quel bailleur souhaitez-vous supprimer ?`,
            actions: ownerDelActions
          };
        }
      }

      // 4.B : AJOUTER UN BAILLEUR
      const cleanQ = q.replace(/ajoute|ajouter|créer|bailleur|propriétaire|proprietaire|nouveau|tel|telephone/gi, '').trim();
      const words = cleanQ.split(/\s+/).filter(w => w.length > 2);
      if (words.length >= 2 && !q.includes('situation')) {
        const firstName = words[0].charAt(0).toUpperCase() + words[0].slice(1);
        const lastName = words[1].charAt(0).toUpperCase() + words[1].slice(1);

        addOwner({
          agencyId: 'org-1',
          firstName,
          lastName,
          phone: '+221 77 100 20 30',
          whatsapp: '+221 77 100 20 30',
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
          address: 'Dakar, Sénégal',
          identityDocNumber: `SN-BAIL-${Date.now().toString().slice(-6)}`,
          bankAccount: 'CBAO-SN012-34567890',
          commissionRatePercent: 8,
          propertiesCount: 1,
          totalMonthlyRevenueFCFA: 0
        });

        return {
          text: detectedWolof
            ? `✅ **Bailleur bu bees bi bind nañu ko !**
**${firstName} ${lastName}** duggu na ci agence bi.`
            : `✅ **Le bailleur ${firstName} ${lastName} a été enregistré avec succès !**
Son compte de gérance a été ouvert et vous pouvez désormais lui affecter des immeubles.`,
          actions: [
            { type: 'NAVIGATE', label: '👥 Voir les Propriétaires', url: '/app/owners' },
            { type: 'NAVIGATE', label: '🏛️ Situation des Bailleurs', url: '/app/landlord-statements' }
          ]
        };
      }

      // 4.C : SITUATION FINANCIÈRE DES BAILLEURS
      const totalCol = payments.reduce((acc, p) => acc + (p.amountFCFA || 0), 0);
      const totalExp = expenses.reduce((acc, e) => acc + (e.amountFCFA || 0), 0);
      const totalComm = Math.round(totalCol * 0.08);
      const netPayout = Math.max(0, totalCol - totalExp - totalComm);

      return {
        text: detectedWolof
          ? `🏛️ **Situation bu Bailleurs yi (Compte de Gérance) :**
• **Encaissements** : +${totalCol.toLocaleString('fr-FR')} FCFA
• **Dépenses déductibles** : -${totalExp.toLocaleString('fr-FR')} FCFA
• **Commissions Agence (8%)** : -${totalComm.toLocaleString('fr-FR')} FCFA
━━━━━━━━━━━━━━━━━━━━
💎 **SOLDE NET A REVERSER** : **${netPayout.toLocaleString('fr-FR')} FCFA**`
          : `🏛️ **Situation Financière des Bailleurs (Compte de Gérance) :**
• **Total Encaissements perçus** : +${totalCol.toLocaleString('fr-FR')} FCFA
• **Total Dépenses déductibles** : -${totalExp.toLocaleString('fr-FR')} FCFA
• **Commissions d'agence (8%)** : -${totalComm.toLocaleString('fr-FR')} FCFA
━━━━━━━━━━━━━━━━━━━━
💎 **SOLDE NET A REVERSER AUX BAILLEURS** : **${netPayout.toLocaleString('fr-FR')} FCFA**`,
        actions: [
          { type: 'NAVIGATE', label: '🏛️ Ouvrir Relevé Situation Bailleurs', url: '/app/landlord-statements' },
          { type: 'NAVIGATE', label: '👥 Répertoire Bailleurs', url: '/app/owners' }
        ]
      };
    }

    // =========================================================================
    // 5. GESTION DES BIENS / IMMEUBLES
    // =========================================================================
    if (q.includes('immeuble') || q.includes('bien') || q.includes('maison') || q.includes('villa')) {
      if (isDeleteIntent) {
        const prop = findPropertyInText(q);
        if (prop) {
          deleteProperty(prop.id);
          return {
            text: `🗑️ L'immeuble **${prop.name}** a été supprimé du patrimoine de l'agence.`,
            actions: [{ type: 'NAVIGATE', label: '🏢 Liste des Biens', url: '/app/properties' }]
          };
        }
      }

      const matchedProperty = findPropertyInText(q);
      if (matchedProperty) {
        const propTenants = tenants.filter(
          t => t.propertyId === matchedProperty.id || (t.propertyName && t.propertyName.toLowerCase().includes(matchedProperty.name.toLowerCase()))
        );
        return {
          text: `🏢 **${matchedProperty.name}** (${matchedProperty.neighborhood}) :
• Locataires résidents : **${propTenants.length}**
• Propriétaire bailleur : **${matchedProperty.ownerName}**`,
          actions: [
            { type: 'NAVIGATE', label: `🏢 Voir ${matchedProperty.name}`, url: `/app/properties/${matchedProperty.id}` }
          ]
        };
      }
    }

    // =========================================================================
    // 6. IMPAYÉS & RELANCES (WHATSAPP AUTOMATIQUE)
    // =========================================================================
    if (q.includes('impayé') || q.includes('retard') || q.includes('fayagul') || q.includes('bor') || q.includes('relance')) {
      const lateTenants = tenants.filter(t => (t.arrearsFCFA && t.arrearsFCFA > 0) || t.status === 'EN_RETARD');
      const totalLateAmount = lateTenants.reduce((sum, t) => sum + (t.arrearsFCFA || t.rentFCFA || 0), 0);

      if (lateTenants.length === 0) {
        return {
          text: detectedWolof
            ? `🎉 **Amul bénn locataire bu am bor tay !** Ñépp fay nañu sen loyer bu baax.`
            : `🎉 **Excellente nouvelle !** Aucun locataire n'est en retard actuellement. Tous les loyers sont à jour.`
        };
      }

      const actions = lateTenants.slice(0, 3).map(t => {
        const cleanPhone = (t.whatsapp || t.phone).replace(/[^0-9]/g, '');
        const msg = detectedWolof
          ? `Salamalekum ${t.firstName} ${t.lastName}, ci agence SunuGestion lañu lay nuyoo. Ñi ngi lay fàttali ne sa loyer bi dafa jéggi. Gëna gaaw nga fay ko. Jerejef !`
          : `Bonjour ${t.firstName} ${t.lastName}, votre loyer de ${(t.arrearsFCFA || t.rentFCFA).toLocaleString('fr-FR')} FCFA pour ${t.propertyName} est en attente. Merci de procéder au règlement. Agence SunuGestion.`;

        return {
          type: 'WHATSAPP' as const,
          label: `📲 Relancer ${t.firstName} (WhatsApp)`,
          url: `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`
        };
      });

      return {
        text: detectedWolof
          ? `⚠️ **Am na ${lateTenants.length} locataires yu am ay impayés** (Total : **${totalLateAmount.toLocaleString('fr-FR')} FCFA**). Cliquez ci-dessous pour les relancer :`
          : `⚠️ **Il y a ${lateTenants.length} locataire(s) en retard** pour un montant total de **${totalLateAmount.toLocaleString('fr-FR')} FCFA** :`,
        actions: [
          ...actions,
          { type: 'NAVIGATE', label: '📄 Gérer les Impayés', url: '/app/arrears' }
        ]
      };
    }

    // =========================================================================
    // 7. PRESTATAIRES & ARTISANS (PLOMBIER, ÉLECTRICIEN, ETC.)
    // =========================================================================
    if (q.includes('artisan') || q.includes('prestataire') || q.includes('plombier') || q.includes('electricien') || q.includes('clim')) {
      let filteredVendors = vendors;
      if (q.includes('plombier')) filteredVendors = vendors.filter(v => v.trade === 'PLOMBIER');
      else if (q.includes('electricien')) filteredVendors = vendors.filter(v => v.trade === 'ELECTRICIEN');
      else if (q.includes('clim')) filteredVendors = vendors.filter(v => v.trade === 'FRIGORISTE');
      if (filteredVendors.length === 0) filteredVendors = vendors;

      const actions = filteredVendors.slice(0, 2).map(v => ({
        type: 'WHATSAPP' as const,
        label: `📲 Contacter ${v.name} (${v.trade})`,
        url: `https://wa.me/${v.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Bonjour, nous avons une intervention pour l\'agence SunuGestion. Êtes-vous disponible ?')}`
      }));

      return {
        text: `🔧 **Artisans recommandés disponibles :**
${filteredVendors.slice(0, 3).map(v => `• **${v.name}** (${v.trade}) - Tél: ${v.phone}`).join('\n')}`,
        actions: [
          ...actions,
          { type: 'NAVIGATE', label: '🛠️ Répertoire Artisans', url: '/app/vendors' }
        ]
      };
    }

    // =========================================================================
    // 8. TOTAL FINANCIER & RECETTES
    // =========================================================================
    if (q.includes('total') || q.includes('recette') || q.includes('chiffre') || q.includes('finance') || q.includes('bilan')) {
      const totalPaidFCFA = payments.reduce((acc, p) => acc + (Number(p.amountFCFA) || 0), 0);
      const totalExpensesFCFA = expenses.reduce((acc, e) => acc + (Number(e.amountFCFA) || 0), 0);
      const netBenefit = totalPaidFCFA - totalExpensesFCFA;

      return {
        text: `📊 **Synthèse Financière Globale :**
• **Total loyers encaissés** : **+${totalPaidFCFA.toLocaleString('fr-FR')} FCFA**
• **Total dépenses décaissées** : **-${totalExpensesFCFA.toLocaleString('fr-FR')} FCFA**
• **Bénéfice Net disponible** : **${netBenefit.toLocaleString('fr-FR')} FCFA**`,
        actions: [
          { type: 'NAVIGATE', label: '💰 Gestion Loyers', url: '/app/rents' },
          { type: 'NAVIGATE', label: '🏛️ Situation Bailleurs', url: '/app/landlord-statements' },
          { type: 'NAVIGATE', label: '📈 Rapports Détaillés', url: '/app/reports' }
        ]
      };
    }

    // =========================================================================
    // 9. SALUTATIONS / DEFAULT FALLBACK
    // =========================================================================
    if (q.includes('bonjour') || q.includes('salut') || q.includes('salam') || q.includes('nanga def')) {
      return {
        text: detectedWolof
          ? `Mangi fi rekk alhamdoulilah ! Man la sa assistant autonome **Sunu IA**.
Wax ma lula soxla ci gestion agence bi (encaissement, dépense, locataire, bailleur, artisan), ma réglél laci lu gaaw !`
          : `Bonjour ! Je suis **Sunu IA**, votre agent autonome. Je peux exécuter immédiatement vos ordres :
• Encaisser un loyer ou supprimer un encaissement
• Enregistrer une dépense ou la déduire
• Ajouter ou supprimer un locataire ou un bailleur
• Envoyer des relances WhatsApp et imprimer des quittances.`,
        actions: [
          { type: 'NAVIGATE', label: '🏛️ Situation Bailleurs', url: '/app/landlord-statements' },
          { type: 'NAVIGATE', label: '💰 Gestion Loyers', url: '/app/rents' }
        ]
      };
    }

    return {
      text: detectedWolof
        ? `J'ai bien compris votre demande : *"**${rawQuery}**"*.
Que souhaitez-vous que j'exécute pour vous ?`
        : `Demande reçue : *"**${rawQuery}**"*.
Je peux immédiatement effectuer pour vous :
1. **+ Encaissement** ou **Supprimer un encaissement**
2. **+ Dépense** ou **Supprimer une dépense**
3. **+ Locataire** ou **Supprimer un locataire**
4. **+ Bailleur** ou **Supprimer un bailleur**`,
      actions: [
        { type: 'NAVIGATE', label: '🏛️ Relevé Bailleurs', url: '/app/landlord-statements' },
        { type: 'NAVIGATE', label: '👥 Locataires', url: '/app/tenants' },
        { type: 'NAVIGATE', label: '💸 Dépenses', url: '/app/expenses' }
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
    }, 350);
  };

  const handleActionClick = (action: NonNullable<ChatMessage['actions']>[number]) => {
    if (action.onClick) {
      action.onClick();
      return;
    }
    if (action.url) {
      if (action.url.startsWith('http')) {
        window.open(action.url, '_blank');
      } else {
        router.push(action.url);
        if (typeof window !== 'undefined' && window.innerWidth < 640) {
          setIsOpen(false);
        }
      }
    }
  };

  const quickPrompts = [
    { label: '💰 + Encaissement', query: 'Ajouter un encaissement' },
    { label: '❌ Supprimer encaissement', query: 'Supprimer un encaissement' },
    { label: '💸 + Dépense', query: 'Ajoute une dépense de 45000 pour plomberie' },
    { label: '🗑️ Supprimer dépense', query: 'Supprimer une dépense' },
    { label: '👤 + Locataire', query: 'Ajouter un locataire' },
    { label: '🚫 Supprimer locataire', query: 'Supprimer un locataire' },
    { label: '🏛️ Situation Bailleurs', query: 'Situation des bailleurs' },
    { label: '🚨 Impayés de loyer', query: 'Quels sont les locataires en retard ?' }
  ];

  return (
    <>
      {/* Floating Action Trigger Button */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="group relative flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer border border-white/20"
          title="Ouvrir Sunu IA - Agent Vocal & Tâches Autonomes"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-900 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-900" />
          </div>

          <div className="flex flex-col text-left">
            <span className="text-xs font-black tracking-wide flex items-center gap-1.5">
              <span>Sunu IA</span>
              <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded-full font-bold">Agent Autonome</span>
            </span>
            <span className="text-[10px] text-blue-100 font-medium hidden sm:inline">
              Gère toutes les tâches (FR / Wolof)
            </span>
          </div>

          <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
        </button>
      </div>

      {/* Slide-out / Modal Drawer AI Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 w-[95vw] sm:w-[460px] h-[660px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200 z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 duration-300 font-sans">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 text-white">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black tracking-tight">Sunu IA • Agent Autonome</h3>
                  <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[9px] font-extrabold rounded-md border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Connecté
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 flex items-center gap-1">
                  <Languages className="w-3 h-3 text-blue-400" />
                  <span>Français & Wolof • Exécution de tâches directes</span>
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
              <span>Langue :</span>
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
                  className={`max-w-[88%] rounded-2xl p-3.5 space-y-2.5 shadow-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs'
                  }`}
                >
                  <div className="whitespace-pre-line font-medium text-xs">
                    {m.text}
                  </div>

                  {/* Actions / Direct Execution Buttons */}
                  {m.actions && m.actions.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                      {m.actions.map((act, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleActionClick(act)}
                          className={`text-[11px] font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                            act.variant === 'danger'
                              ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                              : act.variant === 'success'
                              ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                              : act.type === 'WHATSAPP'
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {act.variant === 'danger' && <Trash2 className="w-3 h-3 text-rose-600" />}
                          {act.variant === 'success' && <Check className="w-3 h-3 text-emerald-600" />}
                          {act.type === 'PRINT' && <Receipt className="w-3 h-3 text-blue-600" />}
                          <span>{act.label}</span>
                          {!act.variant && <ArrowRight className="w-3 h-3" />}
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
                  <span>Sunu IA exécute votre ordre en direct...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Order Pills */}
          <div className="p-2 bg-white border-t border-slate-100 overflow-x-auto flex gap-1.5 scrollbar-none">
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
                  : 'Donnez un ordre : encaissement, dépense, locataire, bailleur...'
              }
              className="flex-1 py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 text-white rounded-xl shadow-md shadow-blue-600/20 transition cursor-pointer shrink-0"
              title="Envoyer l'ordre à Sunu IA"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
