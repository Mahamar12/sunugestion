'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useSunuGestion } from '@/context/SunuGestionContext';
import {
  User,
  Home,
  FileText,
  CreditCard,
  AlertTriangle,
  FileBox,
  Wrench,
  Clock,
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Printer,
  Trash2,
  X
} from 'lucide-react';

export default function TenantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params?.id as string;
  const { tenants, leases, payments, arrears, documents, maintenanceTickets, auditLogs, setSelectedDocumentForPrint, deleteTenant } = useSunuGestion();

  const tenant = tenants.find((t) => t.id === tenantId) || tenants[0];
  const [activeTab, setActiveTab] = useState<'INFO' | 'HOUSING' | 'CONTRACT' | 'PAYMENTS' | 'ARREARS' | 'DOCS' | 'TIMELINE'>('INFO');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const tenantLease = leases.find((l) => l.tenantId === tenant.id) || leases[0];
  const tenantPayments = payments.filter((p) => {
    if (p.tenantId && (p.tenantId === tenant.id || p.tenantId === tenant.currentLeaseId)) return true;
    if (p.tenantName) {
      const pName = p.tenantName.trim().toLowerCase();
      const tFullName = `${tenant.firstName} ${tenant.lastName}`.trim().toLowerCase();
      const tRevName = `${tenant.lastName} ${tenant.firstName}`.trim().toLowerCase();
      if (pName === tFullName || pName === tRevName) return true;
      if (pName.includes(tenant.lastName.trim().toLowerCase()) && pName.includes(tenant.firstName.trim().toLowerCase())) return true;
    }
    return false;
  });
  const totalPaidReal = tenantPayments.reduce((acc, p) => acc + (Number(p.amountFCFA) || 0), 0);
  const tenantArrears = arrears.filter((a) => a.tenantId === tenant.id);
  const tenantDocs = documents.filter((d) => d.tenantName?.includes(tenant.firstName));
  const tenantTickets = maintenanceTickets.filter((t) => t.tenantId === tenant.id);

  const tabs = [
    { id: 'INFO', label: '1. Informations Personnelles', icon: User },
    { id: 'HOUSING', label: '2. Logement', icon: Home },
    { id: 'CONTRACT', label: '3. Contrat de Bail', icon: FileText },
    { id: 'PAYMENTS', label: '4. Paiements', icon: CreditCard },
    { id: 'ARREARS', label: '5. Impayés', icon: AlertTriangle },
    { id: 'DOCS', label: '6. Documents', icon: FileBox },
    { id: 'TIMELINE', label: '7. Historique & Timeline', icon: Clock },
  ];

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link href="/app/tenants" className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600">
          <ArrowLeft className="w-4 h-4" />
          <span>Retour à la liste des locataires</span>
        </Link>

        {tenant && (
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 hover:border-rose-600 rounded-xl transition-all shadow-sm"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Supprimer ce locataire</span>
          </button>
        )}
      </div>

      {/* Tenant Card Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-blue-600/30">
            {tenant.firstName[0]}
            {tenant.lastName[0]}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900">{tenant.firstName} {tenant.lastName}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                tenant.status === 'ACTIF' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {tenant.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Logement: <strong className="text-slate-800">{tenant.unitNumber}</strong> — {tenant.propertyName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block font-medium">Loyer Mensuel</span>
            <strong className="text-emerald-700 text-base font-black">{tenant.rentFCFA.toLocaleString('fr-FR')} FCFA</strong>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block font-medium">Total Payé (Réel)</span>
            <strong className="text-emerald-700 text-base font-black">{totalPaidReal.toLocaleString('fr-FR')} FCFA</strong>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block font-medium">Solde Impayés</span>
            <strong className={`text-base font-black ${tenant.arrearsFCFA > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
              {tenant.arrearsFCFA.toLocaleString('fr-FR')} FCFA
            </strong>
          </div>
        </div>
      </div>

      {/* 8 Sub-tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 text-xs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-xs">
        {activeTab === 'INFO' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b pb-2">Informations Personnelles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><span className="text-slate-400 block">Prénom & Nom:</span> <strong>{tenant.firstName} {tenant.lastName}</strong></div>
              <div><span className="text-slate-400 block">Téléphone / WhatsApp:</span> <strong>{tenant.phone}</strong></div>
              <div><span className="text-slate-400 block">Email:</span> <strong>{tenant.email}</strong></div>
              <div><span className="text-slate-400 block">Profession:</span> <strong>{tenant.profession}</strong></div>
              <div><span className="text-slate-400 block">Type de Pièce:</span> <strong>{tenant.identityDocType} ({tenant.identityDocNumber})</strong></div>
              <div><span className="text-slate-400 block">Contact d'Urgence:</span> <strong>{tenant.emergencyContact} ({tenant.emergencyPhone})</strong></div>
            </div>
          </div>
        )}

        {activeTab === 'HOUSING' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b pb-2">Détails du Logement</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-slate-400 block">Immeuble:</span> <strong>{tenant.propertyName}</strong></div>
              <div><span className="text-slate-400 block">Numéro d'Unité:</span> <strong>{tenant.unitNumber}</strong></div>
              <div><span className="text-slate-400 block">Date d'Entrée:</span> <strong>{tenant.entryDate}</strong></div>
              <div><span className="text-slate-400 block">Loyer Mensuel:</span> <strong className="text-emerald-700">{tenant.rentFCFA.toLocaleString('fr-FR')} FCFA</strong></div>
            </div>
          </div>
        )}

        {activeTab === 'CONTRACT' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b pb-2">Contrat de Location</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-slate-400 block">Date Début:</span> <strong>{tenantLease?.startDate}</strong></div>
              <div><span className="text-slate-400 block">Date Fin:</span> <strong>{tenantLease?.endDate}</strong></div>
              <div><span className="text-slate-400 block">Dépôt de Garantie:</span> <strong>{tenantLease?.depositAmountFCFA?.toLocaleString('fr-FR')} FCFA</strong></div>
              <div><span className="text-slate-400 block">Jour d'échéance:</span> <strong>Le {tenantLease?.dueDayOfMonth || 5} de chaque mois</strong></div>
            </div>
          </div>
        )}

        {activeTab === 'PAYMENTS' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Historique des Paiements Effectués</h3>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg font-bold text-xs">
                  Total Encaissé Réel : {totalPaidReal.toLocaleString('fr-FR')} FCFA
                </span>
                <span className="text-slate-400 text-xs font-semibold">({tenantPayments.length} quittance{tenantPayments.length > 1 ? 's' : ''})</span>
              </div>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 font-semibold text-slate-500 border-b">
                  <th className="p-2">N° Quittance</th>
                  <th className="p-2">Date</th>
                  <th className="p-2">Montant</th>
                  <th className="p-2">Mode</th>
                  <th className="p-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tenantPayments.map((p) => (
                  <tr key={p.id}>
                    <td className="p-2 font-bold text-slate-900">{p.receiptNumber}</td>
                    <td className="p-2 text-slate-600">{p.date}</td>
                    <td className="p-2 font-bold text-emerald-700">{p.amountFCFA.toLocaleString('fr-FR')} FCFA</td>
                    <td className="p-2 text-slate-600">{p.method}</td>
                    <td className="p-2">
                      <button
                        onClick={() =>
                          setSelectedDocumentForPrint({
                            id: p.receiptNumber,
                            title: `Quittance ${p.receiptNumber} - ${p.tenantName}`,
                            category: 'QUITTANCE',
                            tenantName: p.tenantName,
                            propertyName: p.propertyName,
                            amountFCFA: p.amountFCFA,
                            date: p.date,
                          })
                        }
                        className="text-blue-600 font-bold hover:underline"
                      >
                        Imprimer Quittance
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'ARREARS' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b pb-2">Impayés & Retards</h3>
            {tenantArrears.length === 0 ? (
              <p className="text-emerald-600 font-bold">Aucun impayé enregistré pour ce locataire.</p>
            ) : (
              tenantArrears.map((a) => (
                <div key={a.id} className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                  <p className="font-bold text-rose-800">Montant en retard: {a.overdueAmountFCFA.toLocaleString('fr-FR')} FCFA</p>
                  <p className="text-slate-600">Nombre de jours de retard: {a.daysOverdue} jours</p>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'DOCS' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b pb-2">Documents Rattachés</h3>
            <ul className="space-y-2">
              {tenantDocs.map((d) => (
                <li key={d.id} className="p-3 bg-slate-50 rounded-lg flex justify-between items-center border">
                  <span>{d.title}</span>
                  <button
                    onClick={() => setSelectedDocumentForPrint(d)}
                    className="text-blue-600 font-bold hover:underline"
                  >
                    Visualiser / Imprimer
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'TIMELINE' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b pb-2">Timeline des Événements</h3>
            <div className="space-y-3 pl-4 border-l-2 border-blue-600">
              <div className="relative">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 absolute -left-[21px] top-1" />
                <p className="font-bold text-slate-800">Contrat créé & Clés remises</p>
                <span className="text-[10px] text-slate-400">{tenant.entryDate}</span>
              </div>
              <div className="relative">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 absolute -left-[21px] top-1" />
                <p className="font-bold text-slate-800">Dernier loyer encaissé</p>
                <span className="text-[10px] text-slate-400">Août 2026</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && tenant && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 text-base">Supprimer définitivement ce locataire ?</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Êtes-vous sûr de vouloir supprimer <strong className="text-slate-800">{tenant.firstName} {tenant.lastName}</strong> ?
                </p>
              </div>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200/60 text-xs text-amber-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Conséquences de la suppression :</p>
                <ul className="list-disc list-inside mt-1 text-[11px] text-amber-700 space-y-0.5">
                  <li>Le logement <strong className="font-semibold">{tenant.unitNumber} ({tenant.propertyName})</strong> sera libéré et repassera au statut <strong>Disponible</strong>.</li>
                  <li>Le profil et ses historiques associés seront supprimés.</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 text-xs">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={async () => {
                  await deleteTenant(tenant.id);
                  router.push('/app/tenants');
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-lg shadow-rose-600/25 transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Confirmer la suppression</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
