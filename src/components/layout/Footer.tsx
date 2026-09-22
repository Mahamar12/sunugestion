import React from 'react';
import Link from 'next/link';
import { Building2, Phone, Mail, MapPin, ShieldCheck, Heart, ArrowUpRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800/80 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-16">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-400 flex items-center justify-center shadow-md">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-extrabold text-white tracking-tight">
                Immo<span className="text-brand-400">Sena</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              La plateforme SaaS immobilière de référence au Sénégal et en Afrique de l'Ouest. Simplifiez la recherche de logements et boostez la visibilité des agences immobilières grâce au contact WhatsApp direct et aux outils analytiques avancés.
            </p>
            <div className="pt-2 flex items-center space-x-4 text-slate-300 text-xs">
              <div className="flex items-center space-x-1.5">
                <MapPin className="w-4 h-4 text-brand-400" />
                <span>Dakar, Sénégal</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Phone className="w-4 h-4 text-brand-400" />
                <span>+221 33 800 00 00</span>
              </div>
            </div>
          </div>

          {/* Column 1: Navigation */}
          <div>
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Plateforme</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/" className="hover:text-white transition-colors">Accueil</Link></li>
              <li><Link href="/logements" className="hover:text-white transition-colors">Nos Logements</Link></li>
              <li><Link href="/recherche" className="hover:text-white transition-colors">Recherche Avancée</Link></li>
              <li><Link href="/tarifs" className="hover:text-white transition-colors">Offres SaaS Agences</Link></li>
              <li><Link href="/a-propos" className="hover:text-white transition-colors">À Propos de Nous</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Nous Contacter</Link></li>
            </ul>
          </div>

          {/* Column 2: Types & Quartiers */}
          <div>
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Villes & Quartiers</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/recherche?city=Dakar&neighborhood=Almadies" className="hover:text-white transition-colors">Almadies (Dakar)</Link></li>
              <li><Link href="/recherche?city=Dakar&neighborhood=Mermoz" className="hover:text-white transition-colors">Mermoz & Sacré-Cœur</Link></li>
              <li><Link href="/recherche?city=Dakar&neighborhood=Plateau" className="hover:text-white transition-colors">Dakar Plateau</Link></li>
              <li><Link href="/recherche?city=Saly" className="hover:text-white transition-colors">Saly Portudal</Link></li>
              <li><Link href="/recherche?city=Somone" className="hover:text-white transition-colors">La Somone & Ngaparou</Link></li>
              <li><Link href="/recherche?city=Thies" className="hover:text-white transition-colors">Thiès & Saint-Louis</Link></li>
            </ul>
          </div>

          {/* Column 3: Dashboards */}
          <div>
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Espaces Pro</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/dashboard/agence" className="flex items-center space-x-1 hover:text-white transition-colors">
                  <span>Tableau de bord Agence</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-brand-400" />
                </Link>
              </li>
              <li>
                <Link href="/dashboard/admin" className="flex items-center space-x-1 hover:text-white transition-colors">
                  <span>Administration SaaS</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-gold-400" />
                </Link>
              </li>
              <li><Link href="/connexion" className="hover:text-white transition-colors">Se Connecter</Link></li>
              <li><Link href="/inscription" className="hover:text-white transition-colors">Créer un Compte Agence</Link></li>
            </ul>

            <div className="mt-6 pt-4 border-t border-slate-800">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-2">Paiements Acceptés</span>
              <div className="flex flex-wrap gap-1.5 text-[11px] font-bold text-slate-300">
                <span className="px-2 py-1 bg-cyan-950/80 border border-cyan-800 text-cyan-300 rounded">Wave</span>
                <span className="px-2 py-1 bg-amber-950/80 border border-amber-800 text-amber-300 rounded">Orange Money</span>
                <span className="px-2 py-1 bg-blue-950/80 border border-blue-800 text-blue-300 rounded">Carte CB / Stripe</span>
                <span className="px-2 py-1 bg-indigo-950/80 border border-indigo-800 text-indigo-300 rounded">PayPal</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} SunuGestion SaaS. Tous droits réservés. Développé pour le marché africain.</p>
          <div className="flex items-center space-x-6">
            <Link href="/politique-de-confidentialite" className="hover:text-slate-400 transition-colors">Politique de confidentialité</Link>
            <Link href="/conditions-d-utilisation" className="hover:text-slate-400 transition-colors">Conditions d'utilisation</Link>
            <Link href="/not-found" className="hover:text-slate-400 transition-colors">Plan du site</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
