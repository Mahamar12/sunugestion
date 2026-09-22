'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, MessageSquare, X, Send, Bot, User, ArrowRight, ExternalLink } from 'lucide-react';
import { INITIAL_PROPERTIES } from '@/lib/data';
import { formatPrice } from '@/lib/utils';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  suggestions?: { id: string; title: string; price: number; city: string; neighborhood: string }[];
  time: string;
}

export default function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Bonjour ! Je suis ImmoBot, votre assistant IA SunuGestion. Je peux vous guider pour trouver le bien idéal au Sénégal ou répondre à vos questions sur les démarches (bail, caution, frais d\'agence).',
      time: 'À l\'instant',
    }
  ]);

  const quickPrompts = [
    'Appartements meublés aux Almadies',
    'Quelle est la législation sur la caution au Sénégal ?',
    'Villas avec piscine à Saly',
    'Comment contacter directement une agence ?',
  ];

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');

    // Generate AI Smart Response
    setTimeout(() => {
      let aiText = '';
      let suggestions: ChatMessage['suggestions'] = undefined;

      const lower = query.toLowerCase();

      if (lower.includes('almadies') || lower.includes('appartement')) {
        const matches = INITIAL_PROPERTIES.filter(p => p.neighborhood.toLowerCase().includes('almadies') || p.type === 'appartement');
        aiText = `Voici une sélection de logements correspondant à votre recherche à Dakar :`;
        suggestions = matches.slice(0, 2).map(m => ({
          id: m.id,
          title: m.title,
          price: m.price,
          city: m.city,
          neighborhood: m.neighborhood,
        }));
      } else if (lower.includes('saly') || lower.includes('piscine') || lower.includes('villa')) {
        const matches = INITIAL_PROPERTIES.filter(p => p.has_pool || p.type === 'villa');
        aiText = `J'ai trouvé de superbes villas avec piscine sur la Petite Côte ou à Dakar :`;
        suggestions = matches.slice(0, 2).map(m => ({
          id: m.id,
          title: m.title,
          price: m.price,
          city: m.city,
          neighborhood: m.neighborhood,
        }));
      } else if (lower.includes('caution') || lower.includes('frais') || lower.includes('papier') || lower.includes('législation')) {
        aiText = `Au Sénégal, la réglementation fixe généralement la caution à maximum 2 mois de loyer hors charges. Les frais d'agence sont équivalents à 1 mois de loyer pour un contrat annuel. Vous aurez besoin d'une pièce d'identité (CNI ou Passeport) et de vos 3 derniers bulletins de salaire ou justificatifs d'activité.`;
      } else if (lower.includes('contacter') || lower.includes('whatsapp')) {
        aiText = `Sur SunuGestion, chaque fiche de logement comporte un bouton vert WhatsApp direct. Un message pré-rempli contenant la référence et le titre du bien est automatiquement généré pour vous !`;
      } else {
        aiText = `Merci pour votre demande. Je vous conseille de visiter notre page de recherche avancée où vous pouvez filtrer par ville (Dakar, Saly, Thiès), quartier, prix min/max et équipements (piscine, parking, climatisation).`;
      }

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiText,
        suggestions,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    }, 600);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center space-x-3 px-4 py-3.5 rounded-full bg-gradient-to-r from-brand-600 via-brand-500 to-cyan-500 text-white shadow-2xl hover:shadow-brand-500/50 hover:scale-105 transition-all duration-200 group"
        >
          <div className="relative">
            <Bot className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full" />
          </div>
          <span className="font-semibold text-sm">Assistant ImmoBot</span>
          <Sparkles className="w-4 h-4 text-cyan-200 group-hover:rotate-12 transition-transform" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[520px] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-slate-900 p-4 border-b border-slate-800 flex items-center justify-between text-white">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                <Bot className="w-5 h-5 text-brand-300" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                  ImmoBot AI <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                </h3>
                <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span> En ligne • Sénégal
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950/60">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-lg bg-brand-600/30 border border-brand-500/40 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-brand-300" />
                  </div>
                )}

                <div className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-brand-600 text-white rounded-br-none'
                    : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-bl-none'
                }`}>
                  <p>{msg.text}</p>

                  {/* Suggestions list */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-700/60 space-y-1.5">
                      {msg.suggestions.map((s) => (
                        <Link
                          key={s.id}
                          href={`/logements/detail/${s.id}`}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-900/90 hover:bg-brand-600/20 text-slate-200 hover:text-brand-300 border border-slate-800 transition-colors group"
                        >
                          <div className="truncate pr-2">
                            <p className="font-semibold truncate">{s.title}</p>
                            <p className="text-[10px] text-slate-400">{s.neighborhood}, {s.city}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-mono text-brand-400 font-bold text-[11px] block">{formatPrice(s.price)}</span>
                            <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform inline" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  <span className="text-[9px] text-slate-400 mt-1 block text-right">{msg.time}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-2 bg-slate-900 border-t border-slate-800 flex gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((qp, i) => (
              <button
                key={i}
                onClick={() => handleSend(qp)}
                className="shrink-0 px-2.5 py-1 rounded-full bg-slate-800 hover:bg-brand-600/30 text-slate-300 hover:text-white border border-slate-700 text-[10px] whitespace-nowrap transition-colors"
              >
                {qp}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-slate-900 border-t border-slate-800 flex items-center space-x-2"
          >
            <input
              type="text"
              placeholder="Posez votre question à ImmoBot..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
            <button
              type="submit"
              className="p-2 rounded-xl bg-brand-600 text-white hover:bg-brand-500 transition-colors shadow-md shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </div>
  );
}
