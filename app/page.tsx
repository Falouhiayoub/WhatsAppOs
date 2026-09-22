import Link from 'next/link';
import { MessageSquare, Bot, BarChart3, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between">
      {/* Navbar */}
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center font-bold text-slate-950 text-xl shadow-lg shadow-emerald-500/20">
            WA
          </div>
          <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-emerald-400 bg-clip-text text-transparent">
            AI WhatsApp Business OS
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            href="/login"
            className="text-sm text-slate-300 hover:text-white font-medium px-4 py-2 rounded-lg hover:bg-slate-800 transition"
          >
            Se Connecter
          </Link>
          <Link
            href="/login?tab=register"
            className="text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-5 py-2.5 rounded-lg shadow-lg shadow-emerald-500/25 transition flex items-center space-x-2"
          >
            <span>Créer un Compte</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-6 py-20 text-center flex-1 flex flex-col justify-center items-center">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-8">
          <Sparkles className="w-4 h-4" />
          <span>Plateforme n°1 de Vente WhatsApp au Maroc</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-black tracking-tight max-w-4xl leading-tight mb-6">
          Transformez WhatsApp en le{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            Système d'Exploitation Commercial
          </span>{' '}
          de votre Entreprise.
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed">
          Gérez vos conversations client, qualifiez vos prospects, suivez vos ventes et accélérez vos réponses grâce aux suggestions IA intelligentes intégrées.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
          <Link
            href="/login?tab=register"
            className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-lg rounded-xl shadow-xl shadow-emerald-500/25 transition flex items-center justify-center space-x-3"
          >
            <span>Démarrer l'Essai Gratuit</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-lg rounded-xl border border-slate-700 transition"
          >
            Démo En Ligne
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 text-left w-full">
          <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-white">Inbox WhatsApp Multi-Agent</h3>
            <p className="text-sm text-slate-400">
              Boîte de réception d'équipe centralisée avec statut de lecture, assignation et historique client unifié.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-white">Copilote IA & Skills Sur-Mesure</h3>
            <p className="text-sm text-slate-400">
              Suggestions de réponses en 3 tons (Professionnel, Amical, Vente), qualification automatique des leads et détection de langue (Darija/Français).
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-white">CRM & Pipeline Kanban</h3>
            <p className="text-sm text-slate-400">
              Suivez l'avancement des prospects, déplacez vos opportunités par glisser-déposer et mesurez votre taux de conversion en temps réel.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 px-6 py-6 text-center text-xs text-slate-500">
        © 2026 AI WhatsApp Business OS. Conçu pour les entreprises au Maroc et à l'international.
      </footer>
    </div>
  );
}
