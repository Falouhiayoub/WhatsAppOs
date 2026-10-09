'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  KanbanSquare,
  FileText,
  Bot,
  BarChart3,
  CreditCard,
  Settings,
  LogOut,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [unreadBadge, setUnreadBadge] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) return;
      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.user?.name) setUserName(data.user.name);
        if (data.organization?.name) setOrgName(data.organization.name);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchUnreadCount = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) return;
      try {
        const res = await fetch('/api/conversations', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.conversations && Array.isArray(data.conversations)) {
          const totalUnread = data.conversations.reduce((acc: number, c: any) => acc + (c.unreadCount || 0), 0);
          setUnreadBadge(totalUnread > 0 ? String(totalUnread) : null);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchUser();
    fetchUnreadCount();
  }, [pathname]);

  const getInitials = (name: string) => {
    if (!name) return 'WA';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/inbox', label: 'Inbox WhatsApp', icon: MessageSquare, badge: unreadBadge ?? undefined },
    { href: '/dashboard/contacts', label: 'Contacts CRM', icon: Users },
    { href: '/dashboard/leads', label: 'Pipeline Leads', icon: KanbanSquare },
    { href: '/dashboard/templates', label: 'Réponses Enregistrées', icon: FileText },
    { href: '/dashboard/ai-settings', label: 'Copilote IA', icon: Bot },
    { href: '/dashboard/analytics', label: 'Analytiques', icon: BarChart3 },
    { href: '/dashboard/billing', label: 'Abonnement', icon: CreditCard },
    { href: '/dashboard/settings', label: 'Paramètres', icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between flex-shrink-0">
        <div>
          {/* Header Branding */}
          <div className="p-5 border-b border-slate-800 flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center font-black text-slate-950 text-lg shadow-md shadow-emerald-500/20">
              WA
            </div>
            <div>
              <h1 className="font-bold text-sm leading-tight text-white truncate max-w-[140px]">{orgName || 'Mon Entreprise'}</h1>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-emerald-400">WhatsApp OS</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-emerald-500 text-slate-950">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Footer */}
        <div className="p-3 border-t border-slate-800">
          <div className="p-3 rounded-xl bg-slate-800/50 flex items-center justify-between">
            <div className="flex items-center space-x-3 truncate">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold text-xs">
                {getInitials(userName || 'Utilisateur')}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">{userName || 'Utilisateur'}</p>
                <p className="text-[10px] text-slate-400 uppercase font-medium">Propriétaire</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-700/50 transition"
              title="Déconnexion"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto flex flex-col bg-slate-950">
        {children}
      </main>
    </div>
  );
}
