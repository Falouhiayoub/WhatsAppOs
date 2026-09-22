'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Building2, PhoneCall, Bot, ArrowRight, Sparkles } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);

  // Form states
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('Commerce General');
  const [phone, setPhone] = useState('+212600000000');
  const [phoneNumberId, setPhoneNumberId] = useState('');

  // AI Configuration
  const [businessDescription, setBusinessDescription] = useState('');
  const [products, setProducts] = useState('');
  const [services, setServices] = useState('');
  const [faq, setFaq] = useState('');
  const [tone, setTone] = useState('FRIENDLY');
  const [defaultLanguage, setDefaultLanguage] = useState('fr');
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
          if (org.name) setBusinessName(org.name);
          if (org.industry) setIndustry(org.industry);
          if (org.businessDescription) setBusinessDescription(org.businessDescription);
          if (org.products) setProducts(org.products);
          if (org.services) setServices(org.services);
          if (org.faq) setFaq(org.faq);
          if (org.tone) setTone(org.tone);
          if (org.defaultLanguage) setDefaultLanguage(org.defaultLanguage);
          if (org.forbiddenClaims) setForbiddenClaims(org.forbiddenClaims);
          if (org.handoffRules) setHandoffRules(org.handoffRules);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchOrg();
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    const token = localStorage.getItem('auth_token');

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: businessName,
          industry,
          phoneNumber: phone,
          phoneNumberId,
          businessDescription,
          products,
          services,
          faq,
          tone,
          defaultLanguage,
          forbiddenClaims,
          handoffRules,
        }),
      });

      if (!res.ok) throw new Error('Échec de la sauvegarde');
      router.push('/dashboard/inbox');
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la configuration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-6">
          <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
            <span className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm">1</span>
            <span>Entreprise</span>
          </div>
          <div className="h-0.5 w-12 bg-slate-800" />
          <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
            <span className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm">2</span>
            <span>WhatsApp</span>
          </div>
          <div className="h-0.5 w-12 bg-slate-800" />
          <div className={`flex items-center space-x-2 ${step >= 3 ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
            <span className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm">3</span>
            <span>Profil IA</span>
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">1. Informations de l'Entreprise</h2>
              <p className="text-sm text-slate-400">Renseignez les détails de votre activité commercial au Maroc.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Nom de l'Entreprise</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Secteur d'Activité</label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Artisanal E-Commerce">E-Commerce & Artisanat</option>
                  <option value="Real Estate">Immobilier & Promoteur</option>
                  <option value="Clinic & Healthcare">Clinique & Santé</option>
                  <option value="Restaurant & Cafe">Restauration & Cafés</option>
                  <option value="Services & Agency">Agence & Services B2B</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl transition flex items-center justify-center space-x-2"
            >
              <span>Continuer (Connexion WhatsApp)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">2. Connecter WhatsApp Business Cloud API</h2>
              <p className="text-sm text-slate-400">Renseignez votre numéro WhatsApp Cloud API ou utilisez l'environnement de démo prédéfini.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Numéro de Téléphone WhatsApp</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Meta Phone Number ID</label>
                <input
                  type="text"
                  value={phoneNumberId}
                  onChange={(e) => setPhoneNumberId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span>Mode Sandbox activé: Vous pouvez tester l'envoi et la réception de messages immédiatement.</span>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setStep(1)}
                className="w-1/3 bg-slate-800 hover:bg-slate-700 font-semibold py-3.5 rounded-xl"
              >
                Retour
              </button>
              <button
                onClick={() => setStep(3)}
                className="w-2/3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl transition flex items-center justify-center space-x-2"
              >
                <span>Suivant (Configurer l'IA)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">3. Configuration du Profil IA Vendeur</h2>
              <p className="text-sm text-slate-400">Ces informations serviront de contexte exclusif à l'assistant IA pour générer vos réponses.</p>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Description Commerciale</label>
                <textarea
                  rows={2}
                  value={businessDescription}
                  onChange={(e) => setBusinessDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Produits Phares & Tarifs</label>
                <textarea
                  rows={2}
                  value={products}
                  onChange={(e) => setProducts(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Services & Délais de Livraison</label>
                <input
                  type="text"
                  value={services}
                  onChange={(e) => setServices(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Ton de l'IA</label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="FRIENDLY">Amical & Chaleureux (Recommandé WhatsApp)</option>
                    <option value="PROFESSIONAL">Professionnel & Formel</option>
                    <option value="SALES">Vente Directe & Incitatif</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Langue Principale</label>
                  <select
                    value={defaultLanguage}
                    onChange={(e) => setDefaultLanguage(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="fr">Français</option>
                    <option value="ar">Darija / Arabe</option>
                    <option value="en">Anglais</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Garde-Fous & Règles d'Escalade Humaine</label>
                <input
                  type="text"
                  value={handoffRules}
                  onChange={(e) => setHandoffRules(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                onClick={() => setStep(2)}
                className="w-1/3 bg-slate-800 hover:bg-slate-700 font-semibold py-3.5 rounded-xl"
              >
                Retour
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-2/3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl transition flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20"
              >
                {loading ? <span>Sauvegarde...</span> : <span>Lancer l'Inbox WhatsApp OS</span>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
