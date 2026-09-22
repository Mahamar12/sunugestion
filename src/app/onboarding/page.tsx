'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const steps = [
    { title: 'Étape 1: Nom de l\'agence', desc: 'Identité commerciale de votre agence' },
    { title: 'Étape 2: Logo & Slogan', desc: 'Personnalisation de vos documents' },
    { title: 'Étape 3: Estimation du Parc', desc: 'Combien de logements gérez-vous ?' },
    { title: 'Étape 4: Premier Bien', desc: 'Création de votre premier immeuble ou villa' },
    { title: 'Étape 5: Premier Locataire', desc: 'Fiche d\'identité de votre premier locataire' },
    { title: 'Étape 6: Contrat de Bail', desc: 'Formulation du premier contrat de location' },
    { title: 'Étape 7: Première Échéance', desc: 'Date d\'échéance du premier loyer' },
    { title: 'Étape 8: Validation', desc: 'Finalisation et accès à votre Dashboard' },
  ];

  const handleNext = () => {
    if (step < 8) {
      setStep(step + 1);
    } else {
      router.push('/app/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-slate-100 font-sans">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-lg w-full shadow-2xl space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-blue-400">{steps[step - 1].title}</span>
            <span className="text-slate-400">{step} / 8</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-600 to-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${(step / 8) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content Card */}
        <div className="p-6 bg-slate-950 rounded-xl border border-slate-800 space-y-4 text-xs">
          <h3 className="font-bold text-white text-base">{steps[step - 1].title}</h3>
          <p className="text-slate-400">{steps[step - 1].desc}</p>

          {step === 1 && (
            <div>
              <label className="block font-semibold mb-1">Nom de l'Agence</label>
              <input type="text" defaultValue="Sunu Gestionbilier Dakar" className="w-full p-3 bg-slate-900 border border-slate-800 rounded-lg text-white" />
            </div>
          )}

          {step === 2 && (
            <div>
              <label className="block font-semibold mb-1">Slogan de l'Agence</label>
              <input type="text" defaultValue="La gestion immobilière, simplement." className="w-full p-3 bg-slate-900 border border-slate-800 rounded-lg text-white" />
            </div>
          )}

          {step === 3 && (
            <div>
              <label className="block font-semibold mb-1">Nombre estimé de logements</label>
              <select className="w-full p-3 bg-slate-900 border border-slate-800 rounded-lg text-white">
                <option>1 à 10 logements</option>
                <option>11 à 50 logements</option>
                <option>51 à 150 logements</option>
                <option>Plus de 150 logements</option>
              </select>
            </div>
          )}

          {step >= 4 && step <= 7 && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg font-bold">
              Configuration de démonstration pré-chargée avec succès (Dakar & Almadies) !
            </div>
          )}

          {step === 8 && (
            <div className="text-center py-4 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h4 className="font-bold text-white text-sm">Félicitations !</h4>
              <p className="text-slate-400">Votre agence est prête à gérer ses biens et locataires.</p>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="py-3 px-4 bg-slate-800 text-slate-300 rounded-xl font-bold text-xs"
            >
              Retour
            </button>
          )}

          <button
            onClick={handleNext}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-xl shadow-lg text-xs flex items-center justify-center gap-2"
          >
            <span>{step === 8 ? 'Accéder au Dashboard' : 'Étape Suivante'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
