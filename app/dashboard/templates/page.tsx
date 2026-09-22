'use client';

import { useState, useEffect } from 'react';
import { FileText, Plus, Copy, Check, Sparkles } from 'lucide-react';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Ventes');
  const [content, setContent] = useState('');

  const fetchTemplates = async () => {
    const token = localStorage.getItem('auth_token');
    try {
      const res = await fetch('/api/templates', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.templates) setTemplates(data.templates);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('auth_token');
    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          category,
          content,
          variables: ['customer_name', 'business_name', 'agent_name'],
        }),
      });
      if (res.ok) {
        setShowModal(false);
        setName('');
        setContent('');
        fetchTemplates();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Réponses Enregistrées & Modèles WhatsApp</h1>
          <p className="text-sm text-slate-400">Modèles de messages réutilisables avec variables automatiques.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Modèle</span>
        </button>
      </div>

      {/* Variables Legend */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center space-x-3 text-xs text-slate-300">
        <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />
        <div>
          <span className="font-bold text-emerald-400">Variables Disponibles:</span> Utiliser{' '}
          <code className="bg-slate-800 text-emerald-300 px-1.5 py-0.5 rounded text-[11px] font-mono">{"{{customer_name}}"}</code>,{' '}
          <code className="bg-slate-800 text-emerald-300 px-1.5 py-0.5 rounded text-[11px] font-mono">{"{{business_name}}"}</code>,{' '}
          <code className="bg-slate-800 text-emerald-300 px-1.5 py-0.5 rounded text-[11px] font-mono">{"{{agent_name}}"}</code>.
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {templates.map((tpl) => (
          <div key={tpl.id} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 hover:border-slate-700 transition">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">{tpl.name}</h3>
              <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-slate-800 text-emerald-400 uppercase">
                {tpl.category}
              </span>
            </div>
            <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 leading-relaxed font-sans">
              {tpl.content}
            </p>
          </div>
        ))}
      </div>

      {/* Modal Create Template */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Créer un Modèle de Message</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Titre du Modèle *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  placeholder="Prix & Livraison Rabat"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Catégorie</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Ventes">Ventes</option>
                  <option value="Service">Service Client</option>
                  <option value="Relance">Relance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Contenu du Message *</label>
                <textarea
                  rows={4}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                  placeholder="Bonjour {{customer_name}}, merci de nous contacter chez {{business_name}}..."
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-1/3 bg-slate-800 hover:bg-slate-700 font-semibold py-2.5 rounded-xl text-sm"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="w-2/3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl text-sm"
                >
                  Sauvegarder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
