'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Users,
  KanbanSquare,
  TrendingUp,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  Sparkles,
  Bot,
  Plus,
} from 'lucide-react';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      const token = localStorage.getItem('auth_token');
      try {
        const res = await fetch('/api/analytics', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.metrics) {
          setMetrics(data.metrics);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  const cards = [
    { label: 'Total Conversations', value: metrics?.totalConversations ?? 2, change: '+12%', icon: MessageSquare, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Conversations Ouvertes', value: metrics?.openConversations ?? 2, change: 'Actif', icon: CheckCircle2, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: 'Messages Non Lus', value: metrics?.unreadConversations ?? 1, change: 'Action requise', icon: MessageSquare, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Nouveaux Leads (CRM)', value: metrics?.totalLeads ?? 2, change: '+25%', icon: KanbanSquare, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Taux de Conversion', value: metrics?.conversionRate ?? '50.0%', change: 'Supérieur au marché', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Temps de Réponse Moyen', value: metrics?.avgResponseTimeMinutes ?? '4.2 min', change: 'IA copilot actif', icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Tableau de Bord Exécutif</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Vue d'Ensemble Commerciale WhatsApp</h1>
          <p className="text-sm text-slate-400">Performances en temps réel pour votre entreprise au Maroc.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            href="/dashboard/inbox"
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center space-x-2"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Ouvrir l'Inbox ({metrics?.unreadConversations ?? 0} Non lu{metrics?.unreadConversations > 1 ? 's' : ''})</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{card.label}</span>
                <div className={`p-2.5 rounded-xl ${card.bg} ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black text-white">{card.value}</span>
                <span className="text-xs font-medium text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full">{card.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid: Recent Conversations + Lead Pipeline Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Conversations Récentes */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-lg text-white">Conversations Prioritaires</h3>
              <p className="text-xs text-slate-400">Derniers messages WhatsApp reçus</p>
            </div>
            <Link href="/dashboard/inbox" className="text-xs text-emerald-400 font-semibold hover:underline flex items-center space-x-1">
              <span>Voir tout</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between hover:bg-slate-800/70 transition">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-sm">
                  YB
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Youssef Benjelloun (Rabat)</h4>
                  <p className="text-xs text-slate-400 truncate max-w-sm">Est-ce que la livraison est disponible sur Rabat demain?</p>
                </div>
              </div>
              <div className="text-right">
                <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">QUALIFIÉ</span>
                <p className="text-[11px] text-slate-500 mt-1">Il y a 15 min</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between hover:bg-slate-800/70 transition">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-sm">
                  SA
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Salma Alami (Casablanca)</h4>
                  <p className="text-xs text-slate-400 truncate max-w-sm">Merci pour le devis, je passe à votre atelier cet après-midi vers 16h.</p>
                </div>
              </div>
              <div className="text-right">
                <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400">PROPOSITION</span>
                <p className="text-[11px] text-slate-500 mt-1">Il y a 3h</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: AI Assistant Quick Action & Pipeline Value */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Copilote IA Vente</h3>
                <p className="text-xs text-slate-400">Suggestions actives</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              L'assistant IA est configuré avec vos informations d'entreprise. Des suggestions de réponses intelligentes sont prêtes.
            </p>
            <Link
              href="/dashboard/inbox"
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition flex items-center justify-center space-x-2"
            >
              <span>Tester la réponse IA</span>
              <Sparkles className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-400 uppercase tracking-wider">Valeur du Pipeline</h3>
            <div className="text-3xl font-black text-emerald-400">
              {metrics?.totalPipelineValueMAD ? `${metrics.totalPipelineValueMAD.toLocaleString()} MAD` : '7,300 MAD'}
            </div>
            <p className="text-xs text-slate-400">Valeur totale des opportunités en cours dans le CRM.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
