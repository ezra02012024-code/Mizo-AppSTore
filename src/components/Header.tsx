import React from 'react';
import { Smartphone, LogIn, LogOut, User, UploadCloud, BellRing, Sparkles } from 'lucide-react';
import type { UserSession } from '../types/appStore.ts';

interface HeaderProps {
  currentView: 'explore' | 'developer' | 'fcm';
  onSelectView: (view: 'explore' | 'developer' | 'fcm') => void;
  userSession: UserSession;
  onOpenLogin: () => void;
  onLogout: () => void;
  appsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onSelectView,
  userSession,
  onOpenLogin,
  onLogout,
  appsCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onSelectView('explore')}
              className="flex items-center gap-2.5 text-left group transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-lg p-1"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white group-hover:scale-105 transition-transform">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                    Mizo AppStore
                  </span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                    Android
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 -mt-0.5">
                  Mizo Apps Phochhuahna
                </p>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <button
              onClick={() => onSelectView('explore')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                currentView === 'explore'
                  ? 'border-emerald-400 text-white font-semibold'
                  : 'border-transparent text-slate-400'
              }`}
            >
              Kawtchhuah & App-te ({appsCount})
            </button>
            <button
              onClick={() => onSelectView('developer')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 flex items-center gap-1.5 ${
                currentView === 'developer'
                  ? 'border-emerald-400 text-white font-semibold'
                  : 'border-transparent text-slate-400'
              }`}
            >
              <UploadCloud className="w-4 h-4 text-emerald-400" />
              Developer Hmunpui
            </button>
            <button
              onClick={() => onSelectView('fcm')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 flex items-center gap-1.5 ${
                currentView === 'fcm'
                  ? 'border-emerald-400 text-white font-semibold'
                  : 'border-transparent text-slate-400'
              }`}
            >
              <BellRing className="w-4 h-4 text-emerald-400" />
              FCM Push & Code Hub
            </button>
          </nav>

          {/* Zone 3: Primary Action & Auth */}
          <div className="flex items-center gap-3 shrink-0">
            {userSession.isAuthenticated && userSession.user ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onSelectView('developer')}
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
                >
                  <img
                    src={userSession.user.avatarUrl}
                    alt={userSession.user.name}
                    className="w-5 h-5 rounded-full object-cover bg-slate-800"
                    referrerPolicy="no-referrer"
                  />
                  <span className="font-medium max-w-[120px] truncate">
                    {userSession.user.name}
                  </span>
                </button>

                <button
                  onClick={onLogout}
                  title="Inhuat/Chhuahna"
                  aria-label="Chhuak rawh"
                  className="px-3 py-2 text-xs font-medium text-slate-400 hover:text-rose-400 bg-slate-900/80 hover:bg-slate-900 border border-slate-800 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Chhuak</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 rounded-lg shadow-sm shadow-emerald-500/20 transition-all flex items-center gap-2 whitespace-nowrap shrink-0"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Google hmanga luhna
              </button>
            )}
          </div>
        </div>

        {/* Mobile secondary navigation */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-800 text-xs">
          <button
            onClick={() => onSelectView('explore')}
            className={`py-1 px-2 ${
              currentView === 'explore' ? 'text-emerald-400 font-semibold' : 'text-slate-400'
            }`}
          >
            Kawtchhuah
          </button>
          <button
            onClick={() => onSelectView('developer')}
            className={`py-1 px-2 flex items-center gap-1 ${
              currentView === 'developer' ? 'text-emerald-400 font-semibold' : 'text-slate-400'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            Developer
          </button>
          <button
            onClick={() => onSelectView('fcm')}
            className={`py-1 px-2 flex items-center gap-1 ${
              currentView === 'fcm' ? 'text-emerald-400 font-semibold' : 'text-slate-400'
            }`}
          >
            <BellRing className="w-3.5 h-3.5" />
            FCM Code
          </button>
        </div>
      </div>
    </header>
  );
};
