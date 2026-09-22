'use client';

import { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, Zap } from 'lucide-react';

export default function BillingPage() {
  const [billing, setBilling] = useState<any>(null);

  useEffect(() => {
    async function loadBilling() {
      const token = localStorage.getItem('auth_token');
      try {
        const res = await fetch('/api/billing', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.subscription) setBilling(data);
      } catch (err) {
        console.error(err);
      }
    }
    loadBilling();
  }, []);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Gestion de l'Abonnement & Limites</h1>
        <p className="text-sm text-slate-400">Suivez votre consommation de messages et les fonctionnalités incluses.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold">Plan Actuel</span>
            <h2 className="text-2xl font-black text-emerald-400">{billing?.subscription?.plan || 'PRO'}</h2>
          </div>
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold rounded-full">
            ACTIF
          </span>
        </div>

        {/* Usage Progress */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-300">Messages WhatsApp Envoyés / Mois</span>
              <span className="text-emerald-400">{billing?.usage?.messagesUsed || 3} / {billing?.usage?.messageLimit || 5000}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '5%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-300">Générations Copilote IA</span>
              <span className="text-cyan-400">{billing?.usage?.aiUsed || 1} / {billing?.usage?.aiLimit || 2000}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-cyan-500 rounded-full" style={{ width: '2%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
