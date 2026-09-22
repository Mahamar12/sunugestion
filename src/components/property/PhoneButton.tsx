'use client';

import React from 'react';
import { PhoneCall } from 'lucide-react';
import { generatePhoneLink } from '@/lib/utils';

interface PhoneButtonProps {
  phone: string;
  variant?: 'full' | 'compact';
}

export default function PhoneButton({ phone, variant = 'full' }: PhoneButtonProps) {
  const phoneUrl = generatePhoneLink(phone);

  if (variant === 'compact') {
    return (
      <a
        href={phoneUrl}
        className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white transition-all flex items-center justify-center"
        title="Appeler maintenant"
      >
        <PhoneCall className="w-4 h-4" />
      </a>
    );
  }

  return (
    <a
      href={phoneUrl}
      className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 flex items-center justify-center space-x-2 transition-all"
    >
      <PhoneCall className="w-4 h-4 text-brand-400" />
      <span>Appeler maintenant ({phone})</span>
    </a>
  );
}
