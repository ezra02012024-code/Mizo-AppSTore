import React, { useState } from 'react';
import {
  UploadCloud,
  PlusCircle,
  FileCode,
  Layers,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  BellRing,
  Smartphone,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import type { AppCategory, AppItem, NewAppFormData, UpdateAppFormData, UserSession } from '../types/appStore.ts';
import { APP_CATEGORIES } from '../data/initialApps.ts';
import { isValidPackageName, formatApkSize, formatDownloads } from '../utils/appStoreLogic.ts';

interface DeveloperConsoleProps {
  userSession: UserSession;
  apps: AppItem[];
  onUploadNewApp: (formData: NewAppFormData) => void;
  onUpdateAppRelease: (updateData: UpdateAppFormData) => void;
  onOpenFcmTester: (app: AppItem) => void;
  onOpenLogin: () => void;
}

export const DeveloperConsole: React.FC<DeveloperConsoleProps> = ({
  userSession,
  apps,
  onUploadNewApp,
  onUpdateAppRelease,
  onOpenFcmTester,
  onOpenLogin,
}) => {
  const [activeTab, setActiveTab] = useState<'my_apps' | 'upload_new' | 'update_existing'>('my_apps');
  
  // New App Form State
  const [newAppName, setNewAppName] = useState('');
  const [newPackageName, setNewPackageName] = useState('com.mizo.');
  const [newCategory, setNewCategory] = useState<AppCategory>('utility');
  const [newShortDesc, setNewShortDesc] = useState('');
  const [newFullDesc, setNewFullDesc] = useState('');
  const [newIconUrl, setNewIconUrl] = useState('/src/assets/images/icon_mizo_bible_1794879486645.jpg');
  const [newVersionName, setNewVersionName] = useState('1.0.0');
  const [newVersionCode, setNewVersionCode] = useState(1);
  const [newMinSdk, setNewMinSdk] = useState(24);
  const [newChangelog, setNewChangelog] = useState('First release for Mizo Android users.');
  const [newApkFileName, setNewApkFileName] = useState('app-release.apk');
  const [newApkSize, setNewApkSize] = useState(15700000);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');
  const [validationError, setValidationError] = useState('');

  // Update App Form State
  const [selectedAppForUpdate, setSelectedAppForUpdate] = useState<string>(apps[0]?.id || '');
  const [updateVersionName, setUpdateVersionName] = useState('2.5.0');
  const [updateVersionCode, setUpdateVersionCode] = useState(25);
  const [updateChangelog, setUpdateChangelog] = useState('Performance tih chak a ni a, bug tlem azawng siamthat a ni.');
  const [updateApkFileName, setUpdateApkFileName] = useState('app-update-v2.5.0.apk');
  const [updateApkSize, setUpdateApkSize] = useState(18200000);
  const [isCriticalUpdate, setIsCriticalUpdate] = useState(false);
  const [sendFcmNow, setSendFcmNow] = useState(true);
  const [updateSuccessMsg, setUpdateSuccessMsg] = useState('');

  // Filter apps owned or manageable by developer
  const developerApps = apps;

  const handleCreateNewApp = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    setUploadSuccessMsg('');

    if (!newAppName.trim()) {
      setValidationError('App hming dah ngei ngei a ngai e.');
      return;
    }

    if (!isValidPackageName(newPackageName)) {
      setValidationError('Package name hi a dik lo (Entirnan: com.mizo.appname)');
      return;
    }

    if (!newShortDesc.trim()) {
      setValidationError('App chanchin tawi (Short description) dah rawh.');
      return;
    }

    const formData: NewAppFormData = {
      name: newAppName.trim(),
      packageName: newPackageName.trim(),
      category: newCategory,
      shortDesc: newShortDesc.trim(),
      fullDesc: newFullDesc.trim() || newShortDesc.trim(),
      iconUrl: newIconUrl,
      versionName: newVersionName.trim(),
      versionCode: Number(newVersionCode) || 1,
      minSdkVersion: Number(newMinSdk) || 24,
      apkSize: newApkSize,
      apkFileName: newApkFileName,
      changelog: newChangelog.trim(),
      screenshots: [newIconUrl],
    };

    onUploadNewApp(formData);
    setUploadSuccessMsg(`"${newAppName}" chu Mizo AppStore-ah hlawhtling takin thehluh a ni ta e!`);
    
    // Reset fields
    setNewAppName('');
    setNewPackageName('com.mizo.');
    setNewShortDesc('');
    setNewFullDesc('');
    setTimeout(() => {
      setActiveTab('my_apps');
      setUploadSuccessMsg('');
    }, 1500);
  };

  const handleUpdateRelease = (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateSuccessMsg('');

    if (!selectedAppForUpdate) return;

    onUpdateAppRelease({
      appId: selectedAppForUpdate,
      versionName: updateVersionName.trim(),
      versionCode: Number(updateVersionCode) || 2,
      changelog: updateChangelog.trim(),
      apkSize: updateApkSize,
      apkFileName: updateApkFileName,
      isCriticalUpdate,
      sendFcmNotification: sendFcmNow,
    });

    setUpdateSuccessMsg('Version thar update hi thehluh a ni ta e! FCM Push Notification chu dispatch a ni nghal.');
    setTimeout(() => {
      setActiveTab('my_apps');
      setUpdateSuccessMsg('');
    }, 1800);
  };

  const handleSimulateApkFilePick = (isUpdate = false) => {
    // Generate randomized realistic APK stats
    const randomSize = Math.floor(12000000 + Math.random() * 20000000);
    if (isUpdate) {
      setUpdateApkSize(randomSize);
      setUpdateApkFileName(`mizo-app-v${updateVersionName}.apk`);
    } else {
      setNewApkSize(randomSize);
      setNewApkFileName(`${newPackageName.replace(/\./g, '_')}_v${newVersionName}.apk`);
    }
  };

  if (!userSession.isAuthenticated) {
    return (
      <div className="py-12 px-4 max-w-2xl mx-auto text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
          <UploadCloud className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Mizo Developer Hmunpui
        </h2>
        <p className="text-slate-300 text-sm leading-relaxed mb-6">
          I Android application siamte Mizo mipuite tana phochhuah nan leh version thar upload nan Google account hmangin lut rawh le.
        </p>
        <button
          onClick={onOpenLogin}
          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/20 inline-flex items-center gap-2"
        >
          Google Hmanga Luhna
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800 mb-6">
        <div className="flex items-center gap-4">
          <img
            src={userSession.user?.avatarUrl}
            alt={userSession.user?.name}
            className="w-12 h-12 rounded-xl border border-slate-700 object-cover bg-slate-800"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">
                {userSession.user?.name}
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                Verified Developer
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              {userSession.user?.email}
            </p>
          </div>
        </div>

        {/* Quick Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('my_apps')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
              activeTab === 'my_apps'
                ? 'bg-emerald-500 text-slate-950 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Ka App-te ({developerApps.length})
          </button>
          <button
            onClick={() => setActiveTab('upload_new')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-medium flex items-center gap-1.5 ${
              activeTab === 'upload_new'
                ? 'bg-emerald-500 text-slate-950 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            App Thar Thehluhna
          </button>
          <button
            onClick={() => setActiveTab('update_existing')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-medium flex items-center gap-1.5 ${
              activeTab === 'update_existing'
                ? 'bg-emerald-500 text-slate-950 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Update Siamna
          </button>
        </div>
      </div>

      {/* TAB 1: My Apps */}
      {activeTab === 'my_apps' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">
              I Android Application Phochhuah Tawhte
            </h3>
            <button
              onClick={() => setActiveTab('upload_new')}
              className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              App thar upload rawh
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {developerApps.map((app) => (
              <div
                key={app.id}
                className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-3.5 mb-3">
                    <img
                      src={app.iconUrl}
                      alt={app.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-700/80 bg-slate-800 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-white truncate">
                        {app.name}
                      </h4>
                      <p className="text-xs text-slate-400 font-mono truncate">
                        {app.packageName}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1 font-mono">
                        <span className="text-emerald-400 font-semibold">v{app.versionName}</span>
                        <span>·</span>
                        <span>{formatApkSize(app.apkSize)}</span>
                        <span>·</span>
                        <span>{formatDownloads(app.downloadsCount)} dls</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 mb-4 leading-relaxed">
                    {app.shortDesc}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400 font-mono">
                    Updated: {new Date(app.updatedAt).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedAppForUpdate(app.id);
                        setActiveTab('update_existing');
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1"
                    >
                      <Layers className="w-3.5 h-3.5 text-emerald-400" />
                      Update
                    </button>
                    <button
                      onClick={() => onOpenFcmTester(app)}
                      className="px-2.5 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 text-xs font-medium border border-teal-500/30 transition-colors flex items-center gap-1"
                    >
                      <BellRing className="w-3.5 h-3.5 text-teal-400" />
                      FCM Push
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Upload New App */}
      {activeTab === 'upload_new' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white mb-1">
              App Thar Thehluhna (Upload New Android App)
            </h3>
            <p className="text-xs text-slate-400">
              I APK siam chu Mizo AppStore mipuite tana phochhuah turin form hi kimchang takin chhu rawh le.
            </p>
          </div>

          {validationError && (
            <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {uploadSuccessMsg && (
            <div className="p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{uploadSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleCreateNewApp} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  App Hming: *
                </label>
                <input
                  type="text"
                  required
                  value={newAppName}
                  onChange={(e) => setNewAppName(e.target.value)}
                  placeholder="Entirnan: Mizo Chanchinbu Pro"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Package Name (Android Unique ID): *
                </label>
                <input
                  type="text"
                  required
                  value={newPackageName}
                  onChange={(e) => setNewPackageName(e.target.value)}
                  placeholder="com.mizo.appname"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-mono"
                />
                <p className="text-[11px] text-slate-400 mt-0.5">
                  FCM Topic tan he package name hi hman zui a ni ang.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Category (Chi hrang): *
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as AppCategory)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  {APP_CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nameMizo}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  App Icon Thlan tur:
                </label>
                <select
                  value={newIconUrl}
                  onChange={(e) => setNewIconUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="/src/assets/images/icon_mizo_bible_1794879486645.jpg">
                    Mizo Holy Bible & Book Icon
                  </option>
                  <option value="/src/assets/images/icon_mizo_news_1794879487090.jpg">
                    Mizo Daily News Icon
                  </option>
                  <option value="/src/assets/images/icon_mizo_dictionary_1794879487731.jpg">
                    Mizo English Dictionary Icon
                  </option>
                  <option value="/src/assets/images/icon_mizo_game_1794879488661.jpg">
                    Cheraw Jump Game Icon
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                App Chanchin Tawi (Short Description): *
              </label>
              <input
                type="text"
                required
                value={newShortDesc}
                onChange={(e) => setNewShortDesc(e.target.value)}
                placeholder="He app hian eng nge a tih theih tih tawi fel takin chhu rawh..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                App Chanchin Famkim (Full Description):
              </label>
              <textarea
                rows={3}
                value={newFullDesc}
                onChange={(e) => setNewFullDesc(e.target.value)}
                placeholder="He application hi eng tana siam nge, a features hrang hrang, offline support leh a hman dan kimchang..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Version & APK Upload Section */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Version Name:
                  </label>
                  <input
                    type="text"
                    value={newVersionName}
                    onChange={(e) => setNewVersionName(e.target.value)}
                    placeholder="1.0.0"
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Version Code:
                  </label>
                  <input
                    type="number"
                    value={newVersionCode}
                    onChange={(e) => setNewVersionCode(Number(e.target.value))}
                    placeholder="1"
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Min Android SDK:
                  </label>
                  <select
                    value={newMinSdk}
                    onChange={(e) => setNewMinSdk(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono"
                  >
                    <option value={24}>Android 7.0+ (API 24)</option>
                    <option value={26}>Android 8.0+ (API 26)</option>
                    <option value={29}>Android 10+ (API 29)</option>
                    <option value={33}>Android 13+ (API 33)</option>
                  </select>
                </div>
              </div>

              {/* APK File Selector Simulation */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Android APK File (.apk):
                </label>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-700 border-dashed">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-emerald-400" />
                    <div>
                      <span className="text-xs text-white font-mono block">
                        {newApkFileName}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {formatApkSize(newApkSize)}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSimulateApkFilePick(false)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white rounded-lg border border-slate-600 transition-colors"
                  >
                    APK File Thlak Rawh
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Changelog (Danglamna Tharte):
                </label>
                <input
                  type="text"
                  value={newChangelog}
                  onChange={(e) => setNewChangelog(e.target.value)}
                  placeholder="Release hmasaber a ni e."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                <UploadCloud className="w-4 h-4" />
                Mizo AppStore-ah Thehlut Rawh
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: Update Existing App Release */}
      {activeTab === 'update_existing' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white mb-1">
              Version Thar Update Siamna (Release New Version & FCM)
            </h3>
            <p className="text-xs text-slate-400">
              I app neisa update thar thehlut la, Firebase Cloud Messaging hmangin user zawng zawng phone-ah update alert thawn nghal rawh.
            </p>
          </div>

          {updateSuccessMsg && (
            <div className="p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{updateSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleUpdateRelease} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Update tur App thlang rawh: *
              </label>
              <select
                value={selectedAppForUpdate}
                onChange={(e) => setSelectedAppForUpdate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                {apps.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} (Current: v{a.versionName}, Code: {a.versionCode}) - {a.packageName}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Version Name Thar (Entirnan: 2.5.0): *
                </label>
                <input
                  type="text"
                  required
                  value={updateVersionName}
                  onChange={(e) => setUpdateVersionName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Version Code Thar (Entirnan: 25): *
                </label>
                <input
                  type="number"
                  required
                  value={updateVersionCode}
                  onChange={(e) => setUpdateVersionCode(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Danglamna Tharte (Changelog): *
              </label>
              <textarea
                rows={3}
                required
                value={updateChangelog}
                onChange={(e) => setUpdateChangelog(e.target.value)}
                placeholder="1. Dark mode theme thar telh a ni.\n2. Crash buaina siamthat a ni.\n3. Speed tihpun a ni."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* APK File picker */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
              <label className="block text-xs font-medium text-slate-300">
                APK File Thar Upload:
              </label>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-700 border-dashed">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-emerald-400" />
                  <div>
                    <span className="text-xs text-white font-mono block">
                      {updateApkFileName}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {formatApkSize(updateApkSize)}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleSimulateApkFilePick(true)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white rounded-lg border border-slate-600 transition-colors"
                >
                  APK File Thlak Rawh
                </button>
              </div>

              {/* Toggles */}
              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={isCriticalUpdate}
                    onChange={(e) => setIsCriticalUpdate(e.target.checked)}
                    className="w-4 h-4 text-amber-500 rounded border-slate-700"
                  />
                  <span className="text-slate-300 font-medium">
                    ⚠️ Tul bik / Emergency Force Update a ni em? (User-in an update loh chuan app an hmang thei lo ang)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={sendFcmNow}
                    onChange={(e) => setSendFcmNow(e.target.checked)}
                    className="w-4 h-4 text-emerald-500 rounded border-slate-700"
                  />
                  <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                    <BellRing className="w-3.5 h-3.5" />
                    Firebase Cloud Messaging (FCM) hmangin update notification thawn nghal rawh
                  </span>
                </label>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                <Layers className="w-4 h-4" />
                Update Release Thehlut & FCM Thawn Rawh
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
