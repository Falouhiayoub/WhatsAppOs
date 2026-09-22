'use client';

import { useState, useEffect } from 'react';
import { Bot, Sparkles, ShieldAlert, Cpu, CheckCircle2, Save } from 'lucide-react';

export default function AISettingsPage() {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const [businessDescription, setBusinessDescription] = useState('');
  const [products, setProducts] = useState('');
  const [services, setServices] = useState('');
  const [faq, setFaq] = useState('');
  const [tone, setTone] = useState('FRIENDLY');
  const [forbiddenClaims, setForbiddenClaims] = useState('');
  const [handoffRules, setHandoffRules] = useState('');

  useEffect(() => {
    const fetchOrg = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) return;
      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.organization) {
          const org = data.organization;
          if (org.businessDescription !== undefined) setBusinessDescription(org.businessDescription || '');
          if (org.products !== undefined) setProducts(org.products || '');
          if (org.services !== undefined) setServices(org.services || '');
          if (org.faq !== undefined) setFaq(org.faq || '');
          if (org.tone !== undefined) setTone(org.tone || 'FRIENDLY');
          if (org.forbiddenClaims !== undefined) setForbiddenClaims(org.forbiddenClaims || '');
          if (org.handoffRules !== undefined) setHandoffRules(org.handoffRules || '');
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchOrg();
  }, []);

  const skills = [
    { key: 'understand-message', name: 'Understand Customer Message', desc: 'Classifie intention (prix, RDV, livraison), langue (Darija/FR) et sentiment', active: true },
    { key: 'generate-reply', name: 'Generate Smart Reply Options', desc: 'Génère 3 propositions de réponses (Professionnel, Amical, Vente)', active: true },
    { key: 'qualify-lead', name: 'Lead Qualification Skill', desc: 'Extrait budget (MAD), ville, délai et niveau d\'intention d\'achat', active: true },
    { key: 'summarize-conversation', name: 'Conversation Summarizer', desc: 'Synthétise la discussion en 1-2 phrases pour le conseiller', active: true },
    { key: 'detect-sentiment', name: 'Sentiment & Handoff Escalation', desc: 'Détecte les clients insatisfaits et bascule la discussion en HUMAIN REQUIS', active: true },
  ];

  const handleSave = async () => {
    setLoading(true);
    setSaved(false);
    const token = localStorage.getItem('auth_token');

    try {
      await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          businessDescription,
          products,
          services,
          faq,
          tone,
          forbiddenClaims,
          handoffRules,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Configuration du Copilote IA Commercial</h1>
          <p className="text-sm text-slate-400">Définissez le contexte entreprise, les règles de vente et les Skills IA actifs.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? 'Sauvegarde...' : saved ? 'Enregistré !' : 'Sauvegarder la Configuration'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Business Profile & Guardrails */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <Bot className="w-5 h-5 text-emerald-400" />
              <span>Fiche d'Information Entreprise (Contexte IA)</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Activité & Description</label>
                <textarea
                  rows={2}
                  value={businessDescription}
                  onChange={(e) => setBusinessDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Catalogue Produit / Services & Tarifs</label>
                <textarea
                  rows={2}
                  value={products}
                  onChange={(e) => setProducts(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">FAQ & Politiques de Livraison</label>
                <textarea
                  rows={2}
                  value={faq}
                  onChange={(e) => setFaq(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <span>Garde-Fous & Escalade Humaine</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Interdictions IA (Ne jamais inventer)</label>
                <input
                  type="text"
                  value={forbiddenClaims}
                  onChange={(e) => setForbiddenClaims(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Règles de Transfert à un Conseiller Humain</label>
                <input
                  type="text"
                  value={handoffRules}
                  onChange={(e) => setHandoffRules(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Active Modular Skills */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-base text-white flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-emerald-400" />
              <span>Modular AI Skills (5/5)</span>
            </h3>

            <div className="space-y-3">
              {skills.map((skill) => (
                <div key={skill.key} className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-white">{skill.name}</h4>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <p className="text-[11px] text-slate-400">{skill.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
