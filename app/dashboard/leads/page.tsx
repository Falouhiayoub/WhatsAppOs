'use client';

import { useState, useEffect } from 'react';
import { KanbanSquare, Plus, ArrowRight, DollarSign, MapPin, Calendar, Clock, UserCheck } from 'lucide-react';

export default function LeadsPipelinePage() {
  const [pipeline, setPipeline] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchPipeline = async () => {
    const token = localStorage.getItem('auth_token');
    try {
      const res = await fetch('/api/leads', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.pipeline) setPipeline(data.pipeline);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPipeline();
  }, []);

  const moveLeadStage = async (leadId: string, stageId: string, stageKey: string) => {
    const token = localStorage.getItem('auth_token');
    try {
      await fetch('/api/leads', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ leadId, stageId, stageKey }),
      });
      fetchPipeline();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-full mx-auto w-full overflow-hidden flex flex-col h-[calc(100vh-0px)]">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Pipeline des Ventes (Kanban)</h1>
          <p className="text-sm text-slate-400">Suivez l'avancement de vos opportunités commerciales WhatsApp.</p>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="flex-1 overflow-x-auto flex space-x-4 pb-4">
        {pipeline?.stages?.map((stage: any) => (
          <div key={stage.id} className="w-80 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col flex-shrink-0">
            {/* Stage Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color }} />
                <h3 className="font-bold text-sm text-white">{stage.name}</h3>
              </div>
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-slate-800 text-slate-400">
                {stage.leads?.length || 0}
              </span>
            </div>

            {/* Stage Cards */}
            <div className="p-3 flex-1 overflow-y-auto space-y-3">
              {stage.leads?.map((lead: any) => (
                <div key={lead.id} className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-3 hover:border-emerald-500/50 transition shadow-sm">
                  <div className="flex items-start justify-between">
                    <h4 className="font-bold text-xs text-white leading-snug">{lead.title}</h4>
                  </div>

                  <p className="text-xs font-bold text-emerald-400">{lead.value.toLocaleString()} MAD</p>

                  <div className="text-[11px] text-slate-400 space-y-1">
                    <p className="flex items-center space-x-1">
                      <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                      <span>{lead.contact?.name} ({lead.contact?.phone})</span>
                    </p>
                    {lead.location && (
                      <p className="flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>{lead.location}</span>
                      </p>
                    )}
                  </div>

                  {/* Stage Shift Buttons */}
                  <div className="pt-2 border-t border-slate-700/40 flex items-center justify-between text-[10px]">
                    <span className="font-bold text-slate-500 uppercase">{lead.buyingIntent} INTENTION</span>
                    <div className="flex space-x-1">
                      {pipeline.stages.map((st: any) => {
                        if (st.id === stage.id) return null;
                        return (
                          <button
                            key={st.id}
                            onClick={() => moveLeadStage(lead.id, st.id, st.stageKey)}
                            className="px-1.5 py-0.5 bg-slate-700 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 rounded font-semibold transition"
                            title={`Déplacer vers ${st.name}`}
                          >
                            → {st.name.substring(0, 3)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
