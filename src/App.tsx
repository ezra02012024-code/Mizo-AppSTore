import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { HeroBanner } from './components/HeroBanner.tsx';
import { CategoryFilter } from './components/CategoryFilter.tsx';
import { AppCard } from './components/AppCard.tsx';
import { AppDetailModal } from './components/AppDetailModal.tsx';
import { GoogleAuthModal } from './components/GoogleAuthModal.tsx';
import { DeveloperConsole } from './components/DeveloperConsole.tsx';
import { FcmNotificationCenter } from './components/FcmNotificationCenter.tsx';
import { INITIAL_APPS } from './data/initialApps.ts';
import type { AppCategory, AppItem, NewAppFormData, UpdateAppFormData, UserSession } from './types/appStore.ts';
import { filterApps, createFcmUpdatePayload } from './utils/appStoreLogic.ts';
import { Smartphone, CheckCircle, Info, Heart, ShieldCheck, Download } from 'lucide-react';

export default function App() {
  // App store apps state with localStorage persistence
  const [apps, setApps] = useState<AppItem[]>(() => {
    try {
      const saved = localStorage.getItem('mizo_appstore_apps');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return INITIAL_APPS;
  });

  // User session state
  const [userSession, setUserSession] = useState<UserSession>(() => {
    try {
      const saved = localStorage.getItem('mizo_appstore_session');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return {
      isAuthenticated: true,
      user: {
        id: 'usr_ezra_dev',
        name: 'Ezra Lalhmingmawia',
        email: 'ezra02012024@gmail.com',
        avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=ezra02012024',
        isDeveloper: true,
      },
    };
  });

  // Navigation & Filtering
  const [currentView, setCurrentView] = useState<'explore' | 'developer' | 'fcm'>('explore');
  const [selectedCategory, setSelectedCategory] = useState<AppCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'latest' | 'rating'>('popular');

  // Modals & Selection
  const [selectedAppForDetail, setSelectedAppForDetail] = useState<AppItem | null>(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [fcmTargetApp, setFcmTargetApp] = useState<AppItem | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Save apps whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem('mizo_appstore_apps', JSON.stringify(apps));
    } catch {
      // Ignore
    }
  }, [apps]);

  // Save session whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem('mizo_appstore_session', JSON.stringify(userSession));
    } catch {
      // Ignore
    }
  }, [userSession]);

  // Handle uploading a new app
  const handleUploadNewApp = (formData: NewAppFormData) => {
    const newApp: AppItem = {
      id: `app_${Date.now()}`,
      name: formData.name,
      packageName: formData.packageName,
      category: formData.category,
      shortDesc: formData.shortDesc,
      fullDesc: formData.fullDesc,
      iconUrl: formData.iconUrl,
      screenshots: formData.screenshots,
      versionName: formData.versionName,
      versionCode: formData.versionCode,
      minSdkVersion: formData.minSdkVersion,
      apkSize: formData.apkSize,
      apkFileName: formData.apkFileName,
      apkDownloadUrl: `#download-${formData.packageName}`,
      downloadsCount: 1,
      rating: 5.0,
      ratingCount: 1,
      developer: {
        id: userSession.user?.id || 'dev_guest',
        name: userSession.user?.name || 'Mizo Developer',
        email: userSession.user?.email || 'developer@mizoappstore.org',
        verified: true,
      },
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      changelog: formData.changelog,
      versionHistory: [
        {
          versionName: formData.versionName,
          versionCode: formData.versionCode,
          releaseDate: new Date().toISOString().split('T')[0],
          changelog: formData.changelog,
          apkSize: formData.apkSize,
          isCriticalUpdate: false,
        },
      ],
    };

    setApps((prev) => [newApp, ...prev]);
    showToast(`"${formData.name}" chu Mizo AppStore-ah hlawhtling takin thehluh a ni!`);
  };

  // Handle updating an existing app
  const handleUpdateAppRelease = (updateData: UpdateAppFormData) => {
    setApps((prev) =>
      prev.map((app) => {
        if (app.id !== updateData.appId) return app;

        const newVersionRecord = {
          versionName: updateData.versionName,
          versionCode: updateData.versionCode,
          releaseDate: new Date().toISOString().split('T')[0],
          changelog: updateData.changelog,
          apkSize: updateData.apkSize,
          isCriticalUpdate: updateData.isCriticalUpdate,
        };

        const updatedApp: AppItem = {
          ...app,
          versionName: updateData.versionName,
          versionCode: updateData.versionCode,
          apkSize: updateData.apkSize,
          apkFileName: updateData.apkFileName,
          updatedAt: new Date().toISOString(),
          changelog: updateData.changelog,
          versionHistory: [newVersionRecord, ...app.versionHistory],
        };

        return updatedApp;
      })
    );

    const target = apps.find((a) => a.id === updateData.appId);
    showToast(`v${updateData.versionName} update hi thehluh a ni ta! FCM notification dispatch a ni e.`);
  };

  // Handle APK download action
  const handleDownloadApk = (app: AppItem) => {
    // Increment download count
    setApps((prev) =>
      prev.map((a) => (a.id === app.id ? { ...a, downloadsCount: a.downloadsCount + 1 } : a))
    );

    // Create a real downloadable dummy APK blob
    try {
      const dummyApkContent = `PK\x03\x04\x14\x00\x00\x00\x08\x00MizoAppStore Dummy APK file for ${app.name} (${app.packageName}) v${app.versionName}`;
      const blob = new Blob([dummyApkContent], { type: 'application/vnd.android.package-archive' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = app.apkFileName || `${app.packageName}_v${app.versionName}.apk`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Download fallback
    }

    showToast(`${app.name} (${app.apkFileName}) download tan a ni!`);
  };

  // Filter and sort apps
  const filteredApps = filterApps(apps, searchQuery, selectedCategory, sortBy);

  const handleOpenFcmForApp = (app: AppItem) => {
    setFcmTargetApp(app);
    setCurrentView('fcm');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <Header
        currentView={currentView}
        onSelectView={setCurrentView}
        userSession={userSession}
        onOpenLogin={() => setLoginModalOpen(true)}
        onLogout={() => {
          setUserSession({ isAuthenticated: false, user: null });
          showToast('Hlawhtling takin i chhuak ta e.');
        }}
        appsCount={apps.length}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* VIEW 1: Explore / Home */}
        {currentView === 'explore' && (
          <div>
            {/* Hero Section */}
            <HeroBanner
              onExploreClick={() => {
                const el = document.getElementById('apps-grid-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              onDeveloperClick={() => setCurrentView('developer')}
              totalApps={apps.length}
            />

            {/* Filter and Search Bar */}
            <div id="apps-grid-section">
              <CategoryFilter
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                sortBy={sortBy}
                onSortChange={setSortBy}
                filteredCount={filteredApps.length}
              />
            </div>

            {/* Apps Grid */}
            {filteredApps.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredApps.map((app) => (
                  <AppCard
                    key={app.id}
                    app={app}
                    onOpenDetails={(selected) => setSelectedAppForDetail(selected)}
                    onDownloadApk={handleDownloadApk}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 px-4 rounded-2xl bg-slate-900/40 border border-slate-800">
                <Smartphone className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white mb-1">
                  App hmuh a ni lo
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                  I zawnna "{searchQuery}" atana application mil a awm lo. Zawnna dang hmang la emaw category thlak rawh le.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold rounded-lg"
                >
                  App zawng zawng en rawh
                </button>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: Developer Console */}
        {currentView === 'developer' && (
          <DeveloperConsole
            userSession={userSession}
            apps={apps}
            onUploadNewApp={handleUploadNewApp}
            onUpdateAppRelease={handleUpdateAppRelease}
            onOpenFcmTester={handleOpenFcmForApp}
            onOpenLogin={() => setLoginModalOpen(true)}
          />
        )}

        {/* VIEW 3: FCM Notification & Android Code Hub */}
        {currentView === 'fcm' && (
          <FcmNotificationCenter
            apps={apps}
            preselectedApp={fcmTargetApp}
          />
        )}
      </main>

      {/* App Details Modal */}
      <AppDetailModal
        app={selectedAppForDetail}
        onClose={() => setSelectedAppForDetail(null)}
        onDownload={handleDownloadApk}
        onOpenUpdateModal={(app) => {
          setSelectedAppForDetail(null);
          setCurrentView('developer');
        }}
        onOpenFcmTester={(app) => {
          setSelectedAppForDetail(null);
          handleOpenFcmForApp(app);
        }}
        userSession={userSession}
      />

      {/* Google Login Modal */}
      <GoogleAuthModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSuccessLogin={(userData) => {
          setUserSession({
            isAuthenticated: true,
            user: userData,
          });
          showToast(`Chibai, ${userData.name}! Google hmangin i lut e.`);
        }}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-900 border border-emerald-500/40 text-emerald-300 shadow-2xl text-xs font-medium animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/80 py-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="font-semibold text-slate-200">Mizo AppStore</span>
            <span aria-hidden="true">·</span>
            <span>Mizo Android Developer-te Phochhuahna</span>
          </div>

          <p className="text-[11px] text-slate-400">
            Firebase Cloud Messaging (FCM) v1 enabled. Mizoram tan liau liau duan a ni e.
          </p>
        </div>
      </footer>
    </div>
  );
}
