'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Clock, MessageSquare, Users, KanbanSquare } from 'lucide-react';

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    async function loadMetrics() {
      const token = localStorage.getItem('auth_token');
      try {
        const res = await fetch('/api/analytics', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.metrics) setMetrics(data.metrics);
      } catch (err) {
        console.error(err);
      }
    }
    loadMetrics();
  }, []);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Rapports & Analytiques WhatsApp</h1>
        <p className="text-sm text-slate-400">Mesurez l'efficacité commerciale et les temps de réponse de votre équipe.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Taux de Conversion Lead</span>
          <div className="text-4xl font-black text-emerald-400">{metrics?.conversionRate || '50.0%'}</div>
          <p className="text-xs text-slate-400">Pourcentage des opportunités WhatsApp transformées en ventes gagnées.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Temps de Rémoire Moyen</span>
          <div className="text-4xl font-black text-cyan-400">{metrics?.avgResponseTimeMinutes || '4.2 min'}</div>
          <p className="text-xs text-slate-400">Délai moyen d'envoi d'une réponse après réception du message client.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Valeur du Pipeline Ventes</span>
          <div className="text-4xl font-black text-purple-400">
            {metrics?.totalPipelineValueMAD ? `${metrics.totalPipelineValueMAD.toLocaleString()} MAD` : '7,300 MAD'}
          </div>
          <p className="text-xs text-slate-400">Montant total des affaires enregistrées dans le CRM.</p>
        </div>
      </div>
    </div>
  );
}
