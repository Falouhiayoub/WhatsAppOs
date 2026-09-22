'use client';

import { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Search,
  Send,
  Sparkles,
  Bot,
  UserCheck,
  Tag,
  KanbanSquare,
  CheckCheck,
  Clock,
  ChevronRight,
  FileText,
  AlertTriangle,
  RefreshCw,
  Plus,
} from 'lucide-react';

export default function InboxPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConv, setSelectedConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // AI Suggestion State
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Templates Drawer
  const [showTemplates, setShowTemplates] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);

  // Create Contact Modal
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [creatingContact, setCreatingContact] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = async () => {
    const token = localStorage.getItem('auth_token');
    try {
      const res = await fetch(`/api/conversations?search=${encodeURIComponent(search)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.conversations) {
        setConversations(data.conversations);
        if (!selectedConv && data.conversations.length > 0) {
          setSelectedConv(data.conversations[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (convId: string) => {
    const token = localStorage.getItem('auth_token');
    try {
      const res = await fetch(`/api/conversations/${convId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error(err);
    }
  };

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
    }
  };

  useEffect(() => {
    fetchConversations();
    fetchTemplates();
  }, [search]);

  useEffect(() => {
    if (selectedConv) {
      fetchMessages(selectedConv.id);
      setAiSuggestions(null);
    }
  }, [selectedConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactPhone.trim() || creatingContact) return;
    setCreatingContact(true);
    const token = localStorage.getItem('auth_token');
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newContactName, phone: newContactPhone }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setShowAddContactModal(false);
        setNewContactName('');
        setNewContactPhone('');
        await fetchConversations();
        if (data.conversation) {
          setSelectedConv(data.conversation);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingContact(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !selectedConv || sending) return;

    setSending(true);
    const token = localStorage.getItem('auth_token');
    const textToSend = inputText;
    setInputText('');

    try {
      const res = await fetch(`/api/conversations/${selectedConv.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: textToSend }),
      });

      const data = await res.json();
      if (data.success && data.message) {
        setMessages((prev) => [...prev, data.message]);
        fetchConversations();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleGenerateAISuggestions = async () => {
    if (!selectedConv) return;
    setAiLoading(true);
    setAiError(null);
    const token = localStorage.getItem('auth_token');

    try {
      const res = await fetch('/api/ai/generate-reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ conversationId: selectedConv.id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Échec de la génération des réponses IA');

      if (data.suggestions) {
        setAiSuggestions(data);
      }
    } catch (err: any) {
      setAiError(err.message);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-0px)] bg-slate-950 overflow-hidden">
      {/* LEFT COLUMN: Conversation List */}
      <div className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0">
        {/* Search Header */}
        <div className="p-4 border-b border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base text-white">Inbox WhatsApp</h2>
            <button
              onClick={() => setShowAddContactModal(true)}
              className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg shadow-md shadow-emerald-500/20 transition flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nouveau</span>
            </button>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher nom, téléphone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Conversation Items */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
          {conversations.length === 0 && !loading && (
            <div className="p-6 text-center text-slate-400 space-y-3">
              <p className="text-xs">Aucune conversation trouvée.</p>
              <button
                onClick={() => setShowAddContactModal(true)}
                className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-lg text-xs font-bold transition inline-flex items-center space-x-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Créer un contact</span>
              </button>
            </div>
          )}
          {conversations.map((conv) => {
            const isSelected = selectedConv?.id === conv.id;
            return (
              <div
                key={conv.id}
                onClick={() => setSelectedConv(conv)}
                className={`p-3.5 flex items-start space-x-3 cursor-pointer transition ${
                  isSelected ? 'bg-emerald-500/10 border-l-4 border-emerald-500' : 'hover:bg-slate-800/50'
                }`}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-11 h-11 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-sm border border-emerald-500/30">
                    {(conv.contact?.name || 'Contact').substring(0, 2).toUpperCase()}
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 text-slate-950 rounded-full font-black text-[10px] flex items-center justify-center">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-xs text-white truncate">{conv.contact?.name || 'Contact'}</h4>
                    <span className="text-[10px] text-slate-500">
                      {new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 truncate mb-1.5">{conv.lastMessageText || 'Aucun message'}</p>

                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        conv.status === 'NEEDS_HUMAN'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {conv.status === 'NEEDS_HUMAN' ? '⚠️ HUMAIN REQUIS' : conv.leadStatus}
                    </span>
                    {conv.assignedUser && (
                      <span className="text-[10px] text-slate-400 flex items-center space-x-1">
                        <UserCheck className="w-3 h-3 text-emerald-400" />
                        <span className="truncate max-w-[80px]">{conv.assignedUser.name.split(' ')[0]}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CENTER COLUMN: Chat View & Message Stream */}
      <div className="flex-1 flex flex-col bg-slate-900 border-r border-slate-800">
        {selectedConv ? (
          <>
            {/* Chat Header */}
            <div className="px-6 py-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-sm border border-emerald-500/30">
                  {(selectedConv.contact?.name || 'Contact').substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">{selectedConv.contact?.name || 'Contact'}</h3>
                  <p className="text-xs text-slate-400">{selectedConv.contact?.phone || ''}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleGenerateAISuggestions}
                  disabled={aiLoading}
                  className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition flex items-center space-x-1.5 shadow-md shadow-emerald-500/20"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{aiLoading ? 'Analyse IA...' : 'Copilote IA (Générer)'}</span>
                </button>
              </div>
            </div>

            {/* AI Suggestion Banner Card */}
            {aiSuggestions && (
              <div className="p-4 bg-slate-950 border-b border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                    <Bot className="w-4 h-4" />
                    <span>Suggestions IA (Intention: {aiSuggestions.analysis.intent})</span>
                  </div>
                  <span className="text-slate-400 text-[11px]">Confiance: {(aiSuggestions.confidence * 100).toFixed(0)}%</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Option A: Professionnel */}
                  <div
                    onClick={() => setInputText(aiSuggestions.suggestions.professional)}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500 cursor-pointer transition space-y-1.5"
                  >
                    <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Option A: Professionnel</div>
                    <p className="text-xs text-slate-200 leading-snug line-clamp-3">{aiSuggestions.suggestions.professional}</p>
                    <span className="text-[10px] text-emerald-400 font-semibold inline-block pt-1">Insérer dans le message →</span>
                  </div>

                  {/* Option B: Amical */}
                  <div
                    onClick={() => setInputText(aiSuggestions.suggestions.friendly)}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500 cursor-pointer transition space-y-1.5"
                  >
                    <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Option B: Amical / WhatsApp</div>
                    <p className="text-xs text-slate-200 leading-snug line-clamp-3">{aiSuggestions.suggestions.friendly}</p>
                    <span className="text-[10px] text-cyan-400 font-semibold inline-block pt-1">Insérer dans le message →</span>
                  </div>

                  {/* Option C: Vente */}
                  <div
                    onClick={() => setInputText(aiSuggestions.suggestions.sales)}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500 cursor-pointer transition space-y-1.5"
                  >
                    <div className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Option C: Vente & Conversion</div>
                    <p className="text-xs text-slate-200 leading-snug line-clamp-3">{aiSuggestions.suggestions.sales}</p>
                    <span className="text-[10px] text-purple-400 font-semibold inline-block pt-1">Insérer dans le message →</span>
                  </div>
                </div>
              </div>
            )}

            {/* Messages Container with WhatsApp Wallpaper pattern */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 chat-bg-pattern">
              {messages.map((msg) => {
                const isOutbound = msg.direction === 'OUTBOUND';
                return (
                  <div key={msg.id} className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-md p-3.5 rounded-2xl shadow-sm text-sm space-y-1 ${
                        isOutbound
                          ? 'bg-emerald-700 text-white rounded-br-none'
                          : 'bg-slate-800 text-slate-100 border border-slate-700/60 rounded-bl-none'
                      }`}
                    >
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      <div className={`flex items-center justify-end space-x-1 text-[10px] ${isOutbound ? 'text-emerald-200' : 'text-slate-400'}`}>
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {isOutbound && <CheckCheck className="w-3 h-3 text-emerald-300" />}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Saved Templates Drawer */}
            {showTemplates && (
              <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center space-x-2 overflow-x-auto">
                <span className="text-xs text-slate-400 font-semibold flex-shrink-0">Modèles:</span>
                {templates.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => {
                      setInputText(tpl.content.replace('{{customer_name}}', selectedConv.contact?.name || 'Client'));
                      setShowTemplates(false);
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl flex-shrink-0 border border-slate-700"
                  >
                    {tpl.name}
                  </button>
                ))}
              </div>
            )}

            {/* Chat Reply Input Bar */}
            <form onSubmit={handleSendMessage} className="p-4 bg-slate-900 border-t border-slate-800 flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setShowTemplates(!showTemplates)}
                className="p-2.5 text-slate-400 hover:text-emerald-400 bg-slate-800 rounded-xl border border-slate-700 transition"
                title="Modèles de réponses"
              >
                <FileText className="w-5 h-5" />
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Rédigez votre réponse WhatsApp..."
                className="flex-1 bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />

              <button
                type="submit"
                disabled={sending || !inputText.trim()}
                className="p-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl transition shadow-md shadow-emerald-500/20"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-500">
            <MessageSquare className="w-12 h-12 mb-3 text-slate-700" />
            <h3 className="text-lg font-bold text-white">Sélectionnez une discussion</h3>
            <p className="text-xs text-slate-400">Choisissez un contact à gauche pour afficher l'historique et générer des réponses IA.</p>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Customer CRM Information & Lead Profile */}
      {selectedConv && (
        <div className="w-80 bg-slate-900 p-5 flex flex-col space-y-6 overflow-y-auto flex-shrink-0">
          <div>
            <h3 className="font-bold text-sm text-slate-400 uppercase tracking-wider mb-4">Profil Prospect CRM</h3>
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xl flex items-center justify-center mx-auto border border-emerald-500/30">
                {(selectedConv.contact?.name || 'Contact').substring(0, 2).toUpperCase()}
              </div>
              <h4 className="font-bold text-base text-white">{selectedConv.contact?.name || 'Contact'}</h4>
              <p className="text-xs text-slate-400">{selectedConv.contact?.phone || ''}</p>
              {selectedConv.contact?.email && <p className="text-xs text-emerald-400">{selectedConv.contact.email}</p>}
            </div>
          </div>

          {/* Lead Status Badge */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Statut Pipeline</label>
            <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-between text-xs font-bold text-emerald-400">
              <div className="flex items-center space-x-2">
                <KanbanSquare className="w-4 h-4" />
                <span>{selectedConv.leadStatus}</span>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tags Client</label>
            <div className="flex flex-wrap gap-1.5">
              {JSON.parse(selectedConv.contact?.tags || '[]').map((tag: string, i: number) => (
                <span key={i} className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-[11px] font-medium border border-slate-700">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Summary */}
          {selectedConv.summary && (
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Résumé IA</span>
              <p className="text-xs text-slate-300 leading-relaxed">{selectedConv.summary}</p>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Notes Internes</label>
            <p className="text-xs text-slate-300 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
              {selectedConv.contact?.notes || 'Aucune note enregistrée.'}
            </p>
          </div>
        </div>
      )}

      {/* Modal Add Contact from Inbox */}
      {showAddContactModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Nouveau Contact / Discussion</h3>
            <form onSubmit={handleCreateContact} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Nom complet *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Youssef Benjelloun"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Téléphone WhatsApp (+212...) *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: +212661234567"
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddContactModal(false)}
                  className="w-1/3 bg-slate-800 hover:bg-slate-700 font-semibold py-2.5 rounded-xl text-sm text-slate-300 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={creatingContact}
                  className="w-2/3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl text-sm transition"
                >
                  {creatingContact ? 'Création...' : 'Créer & Démarrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
