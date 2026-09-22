'use client';

import { useState, useEffect } from 'react';
import { Settings, Users, ShieldCheck, Key, Building2 } from 'lucide-react';

export default function SettingsPage() {
  const [orgName, setOrgName] = useState('');
  const [phone, setPhone] = useState('+212600000000');

  useEffect(() => {
    const fetchOrg = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) return;
      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.organization?.name) setOrgName(data.organization.name);
      } catch (err) {
        console.error(err);
      }
    };
    fetchOrg();
  }, []);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Paramètres de l'Organisation</h1>
        <p className="text-sm text-slate-400">Gérez l'accès multi-tenant, les membres de l'équipe et les clés d'intégration.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        <h3 className="font-bold text-lg text-white border-b border-slate-800 pb-3">Profil de l'Espace Entreprise</h3>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Nom de l'Espace</label>
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Numéro WhatsApp Officiel</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
