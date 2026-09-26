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
  HelpCircle,
  Radio
} from 'lucide-react';
import { Tenant, Property, Vendor, Owner, Payment, Expense } from '@/types/sunugestion';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
  isVoice?: boolean;
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

interface PendingAction {
  type: 'ENCAISSEMENT' | 'DEPENSE' | 'LOCATAIRE' | 'BAILLEUR' | 'SUPPRESSION_LOCATAIRE';
  tenantId?: string;
  tenantName?: string;
  propertyId?: string;
  propertyName?: string;
  category?: string;
  amount?: number;
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
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [voiceOutputEnabled, setVoiceOutputEnabled] = useState(true);
  const [preferredLang, setPreferredLang] = useState<'AUTO' | 'FR' | 'WO'>('AUTO');
  const [isThinking, setIsThinking] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const voiceTranscriptRef = useRef<string>('');
  const timerRef = useRef<any>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: `👋 **Salamalekum ! Je suis Sunu IA, votre agent vocal autonome.**

Je contrôle l'ensemble de votre agence. Vous pouvez me parler à la voix ou à l'écrit, en **Français** ou en **Wolof** :

✨ **Exemples d'ordres directs que j'exécute immédiatement :**
• 🎙️ *"Encaisse 200 000 FCFA pour Mamadou Diallo"*
• 🎙️ *"Ajoute une dépense de 45 000 pour plomberie"*
• 🎙️ *"Supprime le dernier paiement"*
• 🎙️ *"Supprime le locataire Moussa Sow"*
• 🎙️ *"Ajoute le bailleur Ousmane Diop"*
• 🎙️ *"Quels sont les locataires en retard ?"*

👉 Cliquez sur le micro, donnez votre ordre, et je l'exécute directement. Si une information manque, je vous la demanderai !`,
      time: 'À l\'instant',
      lang: 'fr',
      actions: [
        { type: 'NAVIGATE', label: '📊 Tableau de Bord', url: '/app/dashboard' },
        { type: 'NAVIGATE', label: '🏛️ Situation Bailleurs', url: '/app/landlord-statements' },
        { type: 'NAVIGATE', label: '🚨 Gérer les Impayés', url: '/app/arrears' }
      ]
    }
  ]);

  // Voice recording timer
  useEffect(() => {
    if (isListening) {
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingSeconds(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isListening]);

  const formatRecordingTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Initialisation Web Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        setSpeechSupported(true);
        const recog = new SpeechRecognition();
        recog.continuous = true;
        recog.interimResults = true;
        recog.lang = preferredLang === 'WO' ? 'fr-SN' : 'fr-FR';

        recog.onresult = (event: any) => {
          let transcript = '';
          for (let i = 0; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript + ' ';
          }
          // Stocker en mémoire interne sans l'écrire dans la zone de saisie
          voiceTranscriptRef.current = transcript.trim();
        };

        recog.onerror = (e: any) => {
          console.warn('Speech recognition notice:', e);
        };

        recog.onend = () => {
          // Si l'écoute s'arrête naturellement et qu'on a du texte
          if (isListening) {
            setIsListening(false);
          }
        };

        recognitionRef.current = recog;
      }
    }
  }, [preferredLang, isListening]);

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
        .replace(/[•👉✨❌💸🗑️👤🚫🤝🚨]/g, '')
        .slice(0, 350);

      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = 'fr-FR';
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  };

  // Démarrer la capture vocale
  const startVoiceInput = () => {
    if (!speechSupported || !recognitionRef.current) {
      alert("La reconnaissance vocale n'est pas supportée par votre navigateur (utilisez Google Chrome ou Edge).");
      return;
    }

    voiceTranscriptRef.current = '';
    try {
      recognitionRef.current.lang = preferredLang === 'WO' ? 'fr-SN' : 'fr-FR';
      recognitionRef.current.start();
      setIsListening(true);
    } catch (err) {
      console.warn('Speech start error:', err);
    }
  };

  // Annuler l'enregistrement vocal
  const cancelVoiceInput = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    voiceTranscriptRef.current = '';
    setIsListening(false);
  };

  // Terminer et envoyer immédiatement la commande vocale
  const finishAndSendVoiceInput = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);

    // Laisser un court délai de 200ms pour s'assurer que le dernier mot prononcé est décodé
    setTimeout(() => {
      const captured = voiceTranscriptRef.current.trim();
      if (captured) {
        handleSend(captured, true);
        voiceTranscriptRef.current = '';
      } else {
        alert("Aucun son clair n'a été détecté. Veuillez parler dans votre microphone et réessayer.");
      }
    }, 250);
  };

  // Helper extraction functions
  const extractAmount = (text: string): number | null => {
    const lower = text.toLowerCase();

    // Spelled out French numbers
    if (lower.includes('deux cent mille') || lower.includes('deux cents mille')) return 200000;
    if (lower.includes('cent cinquante mille')) return 150000;
    if (lower.includes('trois cent mille') || lower.includes('trois cents mille')) return 300000;
    if (lower.includes('quatre cent mille') || lower.includes('quatre cents mille')) return 400000;
    if (lower.includes('cinq cent mille') || lower.includes('cinq cents mille')) return 500000;
    if (lower.includes('cent mille')) return 100000;
    if (lower.includes('cinquante mille')) return 50000;
    if (lower.includes('soixante mille')) return 60000;
    if (lower.includes('soixante-dix mille')) return 70000;
    if (lower.includes('quatre-vingt mille')) return 80000;
    if (lower.includes('quatre-vingt-dix mille')) return 90000;
    if (lower.includes('quarante mille')) return 40000;
    if (lower.includes('trente mille')) return 30000;
    if (lower.includes('vingt mille')) return 20000;
    if (lower.includes('dix mille')) return 10000;
    if (lower.includes('quinze mille')) return 15000;
    if (lower.includes('vingt-cinq mille')) return 25000;
    if (lower.includes('trente-cinq mille')) return 35000;
    if (lower.includes('quarante-cinq mille')) return 45000;

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

  // Traitement Intelligent et Exécution Autonome des Ordres
  const processQuery = (rawQuery: string): { text: string; actions?: ChatMessage['actions'] } => {
    const q = rawQuery.toLowerCase().trim();

    // Détection Wolof
    const isWolofWords = [
      'nanga', 'naka', 'ban', 'ñoo', 'ñata', 'xaliss', 'fay', 'fayagul', 'luy', 'xew', 'am na', 'ana',
      'yokk', 'ubbi', 'demal', 'wutal', 'jerejef', 'waaw', 'déedéet', 'dafa', 'nekk', 'biens yi', 'mënë', 'dindi'
    ];
    const detectedWolof = isWolofWords.some(w => q.includes(w)) || preferredLang === 'WO';

    // Annulation
    if (q === 'annuler' || q === 'stop' || q.includes('annule tout')) {
      setPendingAction(null);
      return {
        text: `D'accord, action annulée. Que souhaitez-vous faire ?`,
        actions: [
          { type: 'NAVIGATE', label: '📊 Tableau de bord', url: '/app/dashboard' },
          { type: 'NAVIGATE', label: '🏛️ Situation Bailleurs', url: '/app/landlord-statements' }
        ]
      };
    }

    // =========================================================================
    // ÉTAPE DE CONVERSATION EN COURS (SI L'IA AVAIT DEMANDÉ UNE PRÉCISION)
    // =========================================================================
    if (pendingAction) {
      // 1. Réponse à une question d'encaissement en attente de montant
      if (pendingAction.type === 'ENCAISSEMENT' && pendingAction.tenantId) {
        const amt = extractAmount(q) || (q.includes('complet') || q.includes('tout') ? (pendingAction.amount || 200000) : null);
        if (amt) {
          const doc = recordPayment({
            tenantId: pendingAction.tenantId,
            amountFCFA: amt,
            method: 'ESPECES',
            periodMonthYear: 'Septembre 2026',
            notes: 'Encaissé par commande vocale Sunu IA'
          });
          const targetName = pendingAction.tenantName;
          setPendingAction(null);

          return {
            text: detectedWolof
              ? `✅ **Encaissement bi bind nañu ko !**
• Locataire : **${targetName}**
• Montant : **${amt.toLocaleString('fr-FR')} FCFA**
• Quittance officielle bi généré na !`
              : `✅ **Parfait ! Encaissement exécuté avec succès.**
• **Locataire** : ${targetName}
• **Montant perçu** : **${amt.toLocaleString('fr-FR')} FCFA**
• **Période** : Septembre 2026
• La quittance officielle est disponible.`,
            actions: [
              {
                type: 'PRINT',
                label: '🖨️ Voir & Imprimer la Quittance',
                onClick: () => { if (doc) setSelectedDocumentForPrint(doc); }
              },
              { type: 'NAVIGATE', label: '🏛️ Relevé Bailleur', url: '/app/landlord-statements' }
            ]
          };
        }
      }

      // 2. Réponse à une question de dépense en attente de montant / motif
      if (pendingAction.type === 'DEPENSE') {
        const amt = extractAmount(q);
        if (amt) {
          const matchedProp = properties[0];
          let desc = 'Dépense / Entretien';
          if (q.includes('plomb') || q.includes('fuite')) desc = 'Réparation plomberie';
          else if (q.includes('electr')) desc = 'Dépannage électricité';
          else if (q.includes('clim')) desc = 'Entretien climatisation';
          else if (q.includes('serrur')) desc = 'Remplacement serrure';
          else if (q.includes('peint')) desc = 'Peinture';
          else if (q.includes('nettoy')) desc = 'Nettoyage';

          addExpense({
            agencyId: 'org-1',
            propertyId: matchedProp?.id || 'prop-1',
            propertyName: matchedProp?.name || 'Immeuble Agence',
            category: 'ENTRETIEN',
            amountFCFA: amt,
            date: new Date().toISOString().split('T')[0],
            vendorName: 'Prestataire',
            description: desc
          });
          setPendingAction(null);

          return {
            text: `✅ **Dépense enregistrée et déduite avec succès !**
• **Montant** : **${amt.toLocaleString('fr-FR')} FCFA**
• **Motif** : ${desc}
Le solde net à reverser au bailleur a été automatiquement recalculé.`,
            actions: [
              { type: 'NAVIGATE', label: '🏛️ Situation Bailleurs', url: '/app/landlord-statements' },
              { type: 'NAVIGATE', label: '💸 Journal des Dépenses', url: '/app/expenses' }
            ]
          };
        }
      }

      // 3. Réponse à une suppression de locataire
      if (pendingAction.type === 'SUPPRESSION_LOCATAIRE') {
        const t = findTenantInText(q);
        if (t) {
          deleteTenant(t.id);
          setPendingAction(null);
          return {
            text: `🗑️ **Le locataire ${t.firstName} ${t.lastName} a été supprimé de la base.** Le logement est libéré.`,
            actions: [
              { type: 'NAVIGATE', label: '👥 Voir les Locataires', url: '/app/tenants' }
            ]
          };
        }
      }
    }

    const isDeleteIntent =
      q.includes('supprim') ||
      q.includes('annul') ||
      q.includes('effac') ||
      q.includes('dindi') ||
      q.includes('retir') ||
      q.includes('enlev');

    // =========================================================================
    // 1. ENCAISSEMENTS (AJOUT OU SUPPRESSION)
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
Paiement bu **${removedPay.amountFCFA.toLocaleString('fr-FR')} FCFA** (${tenantLabel}) dindi nañu ko ci relevés yi.`
              : `🗑️ **L'encaissement a été supprimé avec succès !**
Le paiement de **${removedPay.amountFCFA.toLocaleString('fr-FR')} FCFA** pour **${tenantLabel}** a été annulé et retiré de la comptabilité.`,
            actions: [
              { type: 'NAVIGATE', label: '💳 Journal des Paiements', url: '/app/payments' },
              { type: 'NAVIGATE', label: '🏛️ Situation Bailleurs', url: '/app/landlord-statements' }
            ]
          };
        } else {
          return {
            text: `❓ **Quel encaissement souhaitez-vous supprimer ?**
Sélectionnez directement l'un des paiements récents ci-dessous :`,
            actions: payments.slice(0, 3).map(p => {
              const payT = tenants.find(t => t.id === p.tenantId);
              const label = payT ? `${payT.firstName} ${payT.lastName}` : 'Paiement';
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
                      text: `🗑️ Encaissement de ${p.amountFCFA.toLocaleString('fr-FR')} FCFA (${label}) supprimé !`,
                      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                    }
                  ]);
                }
              };
            })
          };
        }
      }

      // 1.B : AJOUTER UN ENCAISSEMENT
      const amt = extractAmount(q);
      const tenant = findTenantInText(q);

      // CAS PARFAIT : Locataire + Montant fournis -> EXÉCUTION IMMÉDIATE !
      if (amt && tenant) {
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
• Reçu quittance généré na automatique !`
            : `✅ **L'encaissement a été exécuté et validé avec succès !**
• **Locataire** : ${tenant.firstName} ${tenant.lastName} (${tenant.propertyName || 'Bien'})
• **Montant perçu** : **${amt.toLocaleString('fr-FR')} FCFA**
• **Période** : Septembre 2026
• **Quittance officielle** : Disponible immédiatement.`,
          actions: [
            {
              type: 'PRINT',
              label: '🖨️ Voir & Imprimer la Quittance',
              onClick: () => { if (doc) setSelectedDocumentForPrint(doc); }
            },
            { type: 'NAVIGATE', label: '🏛️ Situation Bailleurs', url: '/app/landlord-statements' },
            { type: 'NAVIGATE', label: '💳 Historique Paiements', url: '/app/payments' }
          ]
        };
      }

      // CAS OÙ LE LOCATAIRE EST FOURNI MAIS PAS LE MONTANT -> DEMANDE DIRECTE !
      if (tenant && !amt) {
        const expectedRent = tenant.rentFCFA || 200000;
        setPendingAction({
          type: 'ENCAISSEMENT',
          tenantId: tenant.id,
          tenantName: `${tenant.firstName} ${tenant.lastName}`,
          amount: expectedRent
        });

        return {
          text: `❓ **Quel montant souhaitez-vous encaisser pour ${tenant.firstName} ${tenant.lastName} ?**
Son loyer contractuel est de **${expectedRent.toLocaleString('fr-FR')} FCFA**.

Dites simplement le montant au micro (ex: *"200 000"* ou *"Loyer complet"*), ou cliquez directement ci-dessous :`,
          actions: [
            {
              type: 'EXECUTE',
              label: `✅ Encaisser ${expectedRent.toLocaleString('fr-FR')} CFA (Loyer complet)`,
              variant: 'success',
              onClick: () => {
                const doc = recordPayment({
                  tenantId: tenant.id,
                  amountFCFA: expectedRent,
                  method: 'ESPECES',
                  periodMonthYear: 'Septembre 2026',
                  notes: 'Encaissé via Sunu IA Assistant'
                });
                setPendingAction(null);
                setMessages(prev => [
                  ...prev,
                  {
                    id: `ai-enc-${Date.now()}`,
                    sender: 'ai',
                    text: `✅ Encaissement de ${expectedRent.toLocaleString('fr-FR')} FCFA pour ${tenant.firstName} ${tenant.lastName} validé !`,
                    time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                    actions: [
                      {
                        type: 'PRINT',
                        label: '🖨️ Imprimer Quittance',
                        onClick: () => { if (doc) setSelectedDocumentForPrint(doc); }
                      }
                    ]
                  }
                ]);
              }
            }
          ]
        };
      }

      // CAS OÙ AUCUN LOCATAIRE N'EST MENTIONNÉ -> L'IA DEMANDE DIRECTEMENT !
      setPendingAction({ type: 'ENCAISSEMENT' });
      return {
        text: `❓ **Pour quel locataire souhaitez-vous enregistrer cet encaissement ?**
Dites son nom au micro (ex: *"Mamadou Diallo"*) ou cliquez sur l'un des locataires suivants :`,
        actions: tenants.slice(0, 4).map(t => ({
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
            setPendingAction(null);
            setMessages(prev => [
              ...prev,
              {
                id: `ai-enc-${Date.now()}`,
                sender: 'ai',
                text: `✅ Encaissement de ${(t.rentFCFA || 200000).toLocaleString('fr-FR')} FCFA pour ${t.firstName} ${t.lastName} enregistré avec succès !`,
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
        }))
      };
    }

    // =========================================================================
    // 2. DÉPENSES (AJOUT OU SUPPRESSION)
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
        let targetExpense = amt ? expenses.find(e => e.amountFCFA === amt) : expenses[0];

        if (targetExpense) {
          const removedExp = targetExpense;
          deleteExpense(removedExp.id);
          return {
            text: `🗑️ **Dépense supprimée avec succès !**
La dépense de **${removedExp.amountFCFA.toLocaleString('fr-FR')} FCFA** (*${removedExp.description}*) a été supprimée des comptes.`,
            actions: [
              { type: 'NAVIGATE', label: '🏛️ Situation Bailleurs', url: '/app/landlord-statements' },
              { type: 'NAVIGATE', label: '💸 Journal des Dépenses', url: '/app/expenses' }
            ]
          };
        } else {
          return {
            text: `❓ **Quelle dépense souhaitez-vous supprimer ?**
Cliquez sur l'une des dépenses ci-dessous :`,
            actions: expenses.slice(0, 3).map(e => ({
              type: 'EXECUTE' as const,
              label: `Supprimer ${e.amountFCFA.toLocaleString('fr-FR')} CFA (${e.description.slice(0, 18)})`,
              variant: 'danger' as const,
              onClick: () => {
                deleteExpense(e.id);
                setMessages(prev => [
                  ...prev,
                  {
                    id: `ai-exp-del-${Date.now()}`,
                    sender: 'ai',
                    text: `🗑️ Dépense de ${e.amountFCFA.toLocaleString('fr-FR')} FCFA supprimée !`,
                    time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                  }
                ]);
              }
            }))
          };
        }
      }

      // 2.B : AJOUTER UNE DÉPENSE
      const amt = extractAmount(q);
      if (amt) {
        const matchedProp = properties[0];
        let desc = 'Dépense / Entretien courant';
        if (q.includes('plomb') || q.includes('fuite')) desc = 'Réparation plomberie et tuyauterie';
        else if (q.includes('electr')) desc = 'Dépannage électrique';
        else if (q.includes('clim')) desc = 'Entretien climatiseur';
        else if (q.includes('serrur')) desc = 'Remplacement serrure';
        else if (q.includes('peint')) desc = 'Travaux peinture';
        else if (q.includes('nettoy')) desc = 'Nettoyage des parties communes';

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
          text: `✅ **Dépense enregistrée et déduite avec succès !**
• **Montant** : **${amt.toLocaleString('fr-FR')} FCFA**
• **Motif** : ${desc}
• **Immeuble** : ${matchedProp?.name || 'Immeuble Agence'}
Le solde du bailleur a été automatiquement mis à jour.`,
          actions: [
            { type: 'NAVIGATE', label: '🏛️ Situation des Bailleurs', url: '/app/landlord-statements' },
            { type: 'NAVIGATE', label: '💸 Relevé des Dépenses', url: '/app/expenses' }
          ]
        };
      }

      // SI MONTANT MANQUANT -> DEMANDER PRÉCISION
      setPendingAction({ type: 'DEPENSE' });
      return {
        text: `❓ **Quel est le montant de la dépense et la nature des travaux ?**
Vous pouvez me dicter : *"45 000 FCFA pour plomberie"* ou choisir une action rapide :`,
        actions: [
          { label: 'Plomberie (25 000 CFA)', amount: 25000, desc: 'Réparation plomberie' },
          { label: 'Électricité (35 000 CFA)', amount: 35000, desc: 'Dépannage électricité' },
          { label: 'Nettoyage (40 000 CFA)', amount: 40000, desc: 'Nettoyage parties communes' },
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
            setPendingAction(null);
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
        }))
      };
    }

    // =========================================================================
    // 3. LOCATAIRES (AJOUT OU SUPPRESSION)
    // =========================================================================
    if (q.includes('locataire') || q.includes('locataires')) {
      // 3.A : SUPPRIMER UN LOCATAIRE
      if (isDeleteIntent) {
        const tenant = findTenantInText(q);
        if (tenant) {
          deleteTenant(tenant.id);
          return {
            text: `🗑️ **Le locataire ${tenant.firstName} ${tenant.lastName} a été supprimé.** Son logement est désormais vacant.`,
            actions: [
              { type: 'NAVIGATE', label: '👥 Répertoire Locataires', url: '/app/tenants' },
              { type: 'NAVIGATE', label: '🏢 Liste des Biens', url: '/app/properties' }
            ]
          };
        } else {
          setPendingAction({ type: 'SUPPRESSION_LOCATAIRE' });
          return {
            text: `❓ **Quel locataire souhaitez-vous supprimer ?**
Dites son nom ou cliquez directement sur le locataire concerné :`,
            actions: tenants.slice(0, 4).map(t => ({
              type: 'EXECUTE' as const,
              label: `Supprimer ${t.firstName} ${t.lastName}`,
              variant: 'danger' as const,
              onClick: () => {
                deleteTenant(t.id);
                setPendingAction(null);
                setMessages(prev => [
                  ...prev,
                  {
                    id: `ai-del-t-${Date.now()}`,
                    sender: 'ai',
                    text: `🗑️ Locataire ${t.firstName} ${t.lastName} supprimé avec succès !`,
                    time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                  }
                ]);
              }
            }))
          };
        }
      }

      // 3.B : AJOUTER UN LOCATAIRE
      const amt = extractAmount(q);
      const matchedProp = findPropertyInText(q) || properties[0];
      const cleanQ = q.replace(/ajoute|ajouter|créer|locataire|nouveau|loyer|fcfa|cfa|dans|immeuble|villa|appartement/gi, '').trim();
      const words = cleanQ.split(/\s+/).filter(w => w.length > 2);

      if (words.length >= 2) {
        const firstName = words[0].charAt(0).toUpperCase() + words[0].slice(1);
        const lastName = words[1].charAt(0).toUpperCase() + words[1].slice(1);
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
          text: `✅ **Le locataire ${firstName} ${lastName} a été créé avec succès !**
• **Loyer mensuel** : **${rentValue.toLocaleString('fr-FR')} FCFA**
• **Bien affecté** : ${matchedProp?.name || 'Immeuble Agence'}
Le bail est actif et son dossier est à jour.`,
          actions: [
            { type: 'NAVIGATE', label: '👥 Fiche Locataire', url: '/app/tenants' },
            { type: 'NAVIGATE', label: '📄 Contrat de Bail', url: '/app/contracts' }
          ]
        };
      }

      return {
        text: `❓ **Comment s'appelle le nouveau locataire et quel est son loyer ?**
(Exemple : *"Ajoute le locataire Abdoulaye Ba avec un loyer de 250 000"*).`,
        actions: [
          { type: 'NAVIGATE', label: '➕ Ouvrir formulaire locataire', url: '/app/tenants' }
        ]
      };
    }

    // =========================================================================
    // 4. BAILLEURS & PROPRIÉTAIRES (AJOUT, SUPPRESSION, SITUATION)
    // =========================================================================
    if (q.includes('bailleur') || q.includes('bailleurs') || q.includes('propriétaire') || q.includes('proprietaire')) {
      if (isDeleteIntent) {
        const owner = findOwnerInText(q);
        if (owner) {
          deleteOwner(owner.id);
          return {
            text: `🗑️ **Le bailleur ${owner.firstName} ${owner.lastName} a été supprimé.**`,
            actions: [{ type: 'NAVIGATE', label: '👥 Voir les Propriétaires', url: '/app/owners' }]
          };
        }
      }

      // Ajout bailleur
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
          text: `✅ **Le bailleur ${firstName} ${lastName} a été enregistré avec succès !**
Son compte de gérance est désormais actif.`,
          actions: [
            { type: 'NAVIGATE', label: '👥 Répertoire Bailleurs', url: '/app/owners' },
            { type: 'NAVIGATE', label: '🏛️ Situation Financière', url: '/app/landlord-statements' }
          ]
        };
      }

      // Situation Bailleurs
      const totalCol = payments.reduce((acc, p) => acc + (p.amountFCFA || 0), 0);
      const totalExp = expenses.reduce((acc, e) => acc + (e.amountFCFA || 0), 0);
      const totalComm = Math.round(totalCol * 0.08);
      const netPayout = Math.max(0, totalCol - totalExp - totalComm);

      return {
        text: `🏛️ **Situation Financière des Bailleurs (Compte de Gérance) :**
• **Encaissements loyers** : +${totalCol.toLocaleString('fr-FR')} FCFA
• **Dépenses déductibles** : -${totalExp.toLocaleString('fr-FR')} FCFA
• **Commissions d'agence (8%)** : -${totalComm.toLocaleString('fr-FR')} FCFA
━━━━━━━━━━━━━━━━━━━━
💎 **SOLDE NET A REVERSER** : **${netPayout.toLocaleString('fr-FR')} FCFA**`,
        actions: [
          { type: 'NAVIGATE', label: '🏛️ Ouvrir Situation des Bailleurs', url: '/app/landlord-statements' },
          { type: 'NAVIGATE', label: '👥 Voir les Propriétaires', url: '/app/owners' }
        ]
      };
    }

    // =========================================================================
    // 5. IMPAYÉS & RETARDS
    // =========================================================================
    if (q.includes('impayé') || q.includes('retard') || q.includes('fayagul') || q.includes('bor') || q.includes('relance')) {
      const lateTenants = tenants.filter(t => (t.arrearsFCFA && t.arrearsFCFA > 0) || t.status === 'EN_RETARD');
      const totalLateAmount = lateTenants.reduce((sum, t) => sum + (t.arrearsFCFA || t.rentFCFA || 0), 0);

      if (lateTenants.length === 0) {
        return {
          text: `🎉 **Excellente nouvelle ! Aucun locataire n'est en retard de paiement.** Tous les loyers sont à jour.`
        };
      }

      const actions = lateTenants.slice(0, 3).map(t => {
        const cleanPhone = (t.whatsapp || t.phone).replace(/[^0-9]/g, '');
        const msg = `Bonjour ${t.firstName} ${t.lastName}, votre loyer de ${(t.arrearsFCFA || t.rentFCFA).toLocaleString('fr-FR')} FCFA pour ${t.propertyName} est en attente. Merci de procéder au paiement. Agence SunuGestion.`;
        return {
          type: 'WHATSAPP' as const,
          label: `📲 Relancer ${t.firstName} (WhatsApp)`,
          url: `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`
        };
      });

      return {
        text: `⚠️ **Il y a ${lateTenants.length} locataire(s) en retard** (Total impayé : **${totalLateAmount.toLocaleString('fr-FR')} FCFA**). Cliquez pour les relancer en 1 clic :`,
        actions: [
          ...actions,
          { type: 'NAVIGATE', label: '📄 Voir Module Impayés', url: '/app/arrears' }
        ]
      };
    }

    // =========================================================================
    // 6. DEFAULT RESPONSIVE FALLBACK
    // =========================================================================
    return {
      text: `J'ai bien reçu votre demande : *"**${rawQuery}**"*.
Que souhaitez-vous exécuter ?
• **Encaisser un loyer** : *"Encaisse 200 000 pour [Nom]"*
• **Ajouter une dépense** : *"Ajoute une dépense de 45 000 pour plomberie"*
• **Gérer les locataires** : *"Ajoute le locataire [Nom]"* ou *"Supprime le locataire [Nom]"*`,
      actions: [
        { type: 'NAVIGATE', label: '🏛️ Situation Bailleurs', url: '/app/landlord-statements' },
        { type: 'NAVIGATE', label: '👥 Locataires', url: '/app/tenants' },
        { type: 'NAVIGATE', label: '💸 Dépenses', url: '/app/expenses' }
      ]
    };
  };

  const handleSend = (textToSend?: string, isVoice = false) => {
    const query = textToSend !== undefined ? textToSend : input;
    if (!query.trim()) return;

    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsListening(false);
    }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      isVoice,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsThinking(true);

    // Si l'utilisateur a parlé en vocal, on s'assure que la voix audio est activée pour lui répondre oralement
    if (isVoice && !voiceOutputEnabled) {
      setVoiceOutputEnabled(true);
    }

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
    }, 300);
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
    { label: '💸 + Dépense 45 000 CFA', query: 'Ajoute une dépense de 45 000 FCFA pour plomberie' },
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
              <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded-full font-bold">Agent Vocal</span>
            </span>
            <span className="text-[10px] text-blue-100 font-medium hidden sm:inline">
              Exécution directe (FR / Wolof)
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
                  <h3 className="text-sm font-black tracking-tight">Sunu IA • Agent Vocal Autonome</h3>
                  <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[9px] font-extrabold rounded-md border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    En direct
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 flex items-center gap-1">
                  <Languages className="w-3 h-3 text-blue-400" />
                  <span>Français & Wolof • Commandes vocales directes</span>
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
                  className={`max-w-[88%] rounded-2xl p-3.5 space-y-2 shadow-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs'
                  }`}
                >
                  {/* Badge Vocal pour les commandes vocales de l'utilisateur */}
                  {m.isVoice && m.sender === 'user' && (
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-100 pb-1 border-b border-white/20 mb-1">
                      <Mic className="w-3 h-3 text-rose-300 animate-pulse" />
                      <span>Commande Vocale Enregistrée</span>
                    </div>
                  )}

                  <div className="whitespace-pre-line font-medium text-xs">
                    {m.text}
                  </div>

                  {/* Boutons d'Action / Exécution Directe */}
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

          {/* ZONE DE SAISIE OU INTERFACE VOCALE DÉDIÉE */}
          {isListening ? (
            /* INTERFACE VOCALE ENREGISTREUR (Ne tape pas dans la zone de texte) */
            <div className="p-3 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border-t border-slate-800 flex items-center justify-between gap-3 text-white animate-in slide-in-from-bottom-2 duration-200">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500"></span>
                </span>
                <div className="flex flex-col">
                  <span className="text-xs font-black text-white flex items-center gap-1.5">
                    <Mic className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
                    <span>Enregistrement vocal ({formatRecordingTime(recordingSeconds)})</span>
                  </span>
                  <span className="text-[10px] text-slate-300">
                    Parlez librement, puis cliquez sur Envoyer
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={cancelVoiceInput}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-xl transition cursor-pointer"
                >
                  Annuler
                </button>

                <button
                  type="button"
                  onClick={finishAndSendVoiceInput}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl transition flex items-center gap-1.5 shadow-md shadow-emerald-600/30 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Envoyer</span>
                </button>
              </div>
            </div>
          ) : (
            /* BARRE DE SAISIE NORMALE */
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
            >
              {/* Microphone Trigger Button */}
              <button
                type="button"
                onClick={startVoiceInput}
                className="p-2.5 rounded-xl transition cursor-pointer flex items-center justify-center shrink-0 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-200 shadow-xs"
                title="Cliquer pour parler au micro"
              >
                <Mic className="w-4 h-4" />
              </button>

              {/* Text Input */}
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Parlez au micro ou écrivez un ordre direct..."
                className="flex-1 py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={!input.trim()}
                className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 text-white rounded-xl shadow-md shadow-blue-600/20 transition cursor-pointer shrink-0"
                title="Envoyer l'ordre"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      )}
    </>
  );
}
