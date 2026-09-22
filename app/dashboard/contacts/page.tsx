'use client';

import { useState, useEffect } from 'react';
import { Users, Search, Plus, Phone, Mail, Building, Calendar, Tag, ChevronRight } from 'lucide-react';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // New Contact form
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [notes, setNotes] = useState('');

  const fetchContacts = async () => {
    const token = localStorage.getItem('auth_token');
    try {
      const res = await fetch(`/api/contacts?search=${encodeURIComponent(search)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.contacts) setContacts(data.contacts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [search]);

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('auth_token');
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, phone, email, company, notes }),
      });
      if (res.ok) {
        setShowModal(false);
        setName('');
        setPhone('');
        setEmail('');
        setCompany('');
        setNotes('');
        fetchContacts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Répertoire Contacts CRM</h1>
          <p className="text-sm text-slate-400">Gérez vos prospects et clients WhatsApp centralisés.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Contact</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="Rechercher par nom, téléphone, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Contacts Table / Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Nom Client</th>
                <th className="px-6 py-4">Téléphone</th>
                <th className="px-6 py-4">Société / Ville</th>
                <th className="px-6 py-4">Statut Lead</th>
                <th className="px-6 py-4">Tags</th>
                <th className="px-6 py-4 text-right">Dernière Interaction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {contacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-slate-800/40 transition">
                  <td className="px-6 py-4 font-bold text-white flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center border border-emerald-500/30">
                      {contact.name.substring(0, 2).toUpperCase()}
                    </div>
                    <span>{contact.name}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-300 font-mono text-xs">{contact.phone}</td>
                  <td className="px-6 py-4 text-slate-400">{contact.company || contact.email || '—'}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                      {contact.leadStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {JSON.parse(contact.tags || '[]').map((tag: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-xs text-slate-500">
                    {new Date(contact.lastInteractionAt || contact.updatedAt).toLocaleDateString('fr-FR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Contact */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Ajouter un Contact CRM</h3>
            <form onSubmit={handleCreateContact} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Nom complet *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Téléphone WhatsApp (+212...) *</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Société / Ville</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
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
                  Enregistrer Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
