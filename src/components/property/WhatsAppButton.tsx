'use client';

import React from 'react';
import { MessageSquare } from 'lucide-react';
import { generateWhatsAppLink } from '@/lib/utils';

interface WhatsAppButtonProps {
  phone: string;
  propertyRef: string;
  propertyTitle: string;
  variant?: 'floating' | 'full' | 'compact';
}

export default function WhatsAppButton({
  phone,
  propertyRef,
  propertyTitle,
  variant = 'full',
}: WhatsAppButtonProps) {
  const whatsappUrl = generateWhatsAppLink(phone, propertyRef, propertyTitle);

  if (variant === 'floating') {
    return (
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-24 right-6 z-40 flex items-center space-x-2 px-4 py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-2xl hover:scale-105 transition-all duration-200"
      >
        <MessageSquare className="w-5 h-5 fill-current" />
        <span className="text-sm">WhatsApp Agence</span>
      </a>
    );
  }

  if (variant === 'compact') {
    return (
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center"
        title="Contacter sur WhatsApp"
      >
        <MessageSquare className="w-4 h-4 fill-current" />
      </a>
    );
  }

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm flex items-center justify-center space-x-2 shadow-md shadow-emerald-600/20 hover:shadow-emerald-500/40 transition-all"
    >
      <MessageSquare className="w-5 h-5 fill-current" />
      <span>Contacter sur WhatsApp</span>
    </a>
  );
}
