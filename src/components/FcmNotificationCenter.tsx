import React, { useState } from 'react';
import {
  BellRing,
  Send,
  Code2,
  Copy,
  Check,
  Smartphone,
  Sparkles,
  Info,
  Terminal,
  FileCode,
  AlertTriangle,
  Play,
  RotateCcw,
  DownloadCloud,
} from 'lucide-react';
import type { AppItem, FcmNotificationPayload } from '../types/appStore.ts';
import {
  createFcmUpdatePayload,
  getFcmTopicForPackage,
  generateAndroidGradleSnippet,
  generateAndroidManifestSnippet,
  generateKotlinServiceSnippet,
  generateMainActivitySubscriptionSnippet,
  generateInAppUpdateManagerSnippet,
} from '../utils/appStoreLogic.ts';

interface FcmNotificationCenterProps {
  apps: AppItem[];
  preselectedApp?: AppItem | null;
}

export const FcmNotificationCenter: React.FC<FcmNotificationCenterProps> = ({
  apps,
  preselectedApp,
}) => {
  const [selectedAppId, setSelectedAppId] = useState<string>(
    preselectedApp?.id || apps[0]?.id || ''
  );

  const selectedApp = apps.find((a) => a.id === selectedAppId) || apps[0];

  // Notification customization state
  const [testVersionName, setTestVersionName] = useState('2.5.0');
  const [testVersionCode, setTestVersionCode] = useState(25);
  const [testChangelog, setTestChangelog] = useState('Solfa view tihchak leh dark mode rawng siamthat a ni.');
  const [testIsCritical, setTestIsCritical] = useState(false);

  // Active Code Tab
  const [codeTab, setCodeTab] = useState<
    'gradle' | 'manifest' | 'service' | 'dialog' | 'main' | 'backend'
  >('service');

  const [copiedCode, setCopiedCode] = useState(false);

  // Phone Simulator State
  const [simHeadsUpVisible, setSimHeadsUpVisible] = useState(false);
  const [simDialogOpen, setSimDialogOpen] = useState(false);
  const [simDownloadProgress, setSimDownloadProgress] = useState(0);
  const [simInstalledSuccess, setSimInstalledSuccess] = useState(false);
  const [dispatchedPayloads, setDispatchedPayloads] = useState<FcmNotificationPayload[]>([]);

  // Sound generator using Web Audio API
  const playNotificationChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880.00, audioCtx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch {
      // Audio fallback
    }
  };

  const handleDispatchTestNotification = () => {
    if (!selectedApp) return;

    const payload = createFcmUpdatePayload(selectedApp, {
      versionName: testVersionName,
      versionCode: testVersionCode,
      changelog: testChangelog,
      isCritical: testIsCritical,
    });

    setDispatchedPayloads((prev) => [payload, ...prev]);
    playNotificationChime();

    // Trigger Android simulator
    setSimDialogOpen(false);
    setSimInstalledSuccess(false);
    setSimDownloadProgress(0);
    setSimHeadsUpVisible(true);

    // Auto hide heads-up after 7s unless clicked
    setTimeout(() => {
      setSimHeadsUpVisible(false);
    }, 7000);
  };

  const handleSimNotificationClick = () => {
    setSimHeadsUpVisible(false);
    setSimDialogOpen(true);
  };

  const handleSimStartUpdate = () => {
    let p = 0;
    const interval = setInterval(() => {
      p += 25;
      setSimDownloadProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setSimInstalledSuccess(true);
      }
    }, 300);
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const getActiveCodeContent = (): string => {
    const pkg = selectedApp?.packageName || 'com.example.mizoapp';
    switch (codeTab) {
      case 'gradle':
        return generateAndroidGradleSnippet();
      case 'manifest':
        return generateAndroidManifestSnippet(pkg);
      case 'service':
        return generateKotlinServiceSnippet(pkg);
      case 'dialog':
        return generateInAppUpdateManagerSnippet();
      case 'main':
        return generateMainActivitySubscriptionSnippet(pkg);
      case 'backend':
        return `// FCM HTTP v1 REST API Request (Server Side / cURL)
// Endpoint: https://fcm.googleapis.com/v1/projects/{YOUR_FIREBASE_PROJECT_ID}/messages:send
// Headers:
//   Authorization: Bearer <GOOGLE_OAUTH2_ACCESS_TOKEN>
//   Content-Type: application/json

curl -X POST "https://fcm.googleapis.com/v1/projects/mizo-appstore/messages:send" \\
  -H "Authorization: Bearer YOUR_SERVER_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "message": {
      "topic": "${getFcmTopicForPackage(pkg)}",
      "notification": {
        "title": "✨ Update thar a awm e: ${selectedApp?.name || 'Mizo App'} v${testVersionName}",
        "body": "Danglamna: ${testChangelog}"
      },
      "data": {
        "appId": "${selectedApp?.id || 'app_1'}",
        "appName": "${selectedApp?.name || 'Mizo App'}",
        "packageName": "${pkg}",
        "versionCode": "${testVersionCode}",
        "versionName": "${testVersionName}",
        "changelog": "${testChangelog}",
        "apkUrl": "https://mizoappstore.org/download/${pkg}.apk",
        "isCritical": "${testIsCritical ? 'true' : 'false'}",
        "timestamp": "${new Date().toISOString()}"
      }
    }
  }'`;
      default:
        return '';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Title & Introduction */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
              <BellRing className="w-4 h-4" />
              <span>Firebase Cloud Messaging (FCM) Update Hub</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Android App Update Notification Siamna leh Code
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Mizo Android application chhungah version thar update a awmin user-te hnenah push notification inhrilhhriat dan leh code tul zawng zawng dahkhawm a ni e.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="text-xs text-slate-400 font-mono">Topic:</span>
            <span className="px-2.5 py-1 rounded bg-slate-950 border border-slate-700 text-emerald-400 text-xs font-mono font-semibold">
              /topics/{getFcmTopicForPackage(selectedApp?.packageName || 'com.mizo')}
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Left is FCM Tester & Simulator, Right is Android Integration Code */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (5 cols): Tester & Phone Simulator */}
        <div className="lg:col-span-5 space-y-6">
          {/* Dispatch Tester Card */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-400" />
                FCM Push Tester
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">Live Demo</span>
            </div>

            {/* App Selector */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                App thlang rawh:
              </label>
              <select
                value={selectedAppId}
                onChange={(e) => setSelectedAppId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {apps.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.packageName})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Version Name:
                </label>
                <input
                  type="text"
                  value={testVersionName}
                  onChange={(e) => setTestVersionName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Version Code:
                </label>
                <input
                  type="number"
                  value={testVersionCode}
                  onChange={(e) => setTestVersionCode(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Changelog (Danglamna Tharte):
              </label>
              <input
                type="text"
                value={testChangelog}
                onChange={(e) => setTestChangelog(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={testIsCritical}
                onChange={(e) => setTestIsCritical(e.target.checked)}
                className="w-4 h-4 text-amber-500 rounded border-slate-700"
              />
              <span className="text-slate-300">
                Tul bik / Force Update alert (Priority High)
              </span>
            </label>

            <button
              onClick={handleDispatchTestNotification}
              className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Notification Test Thawn Rawh (Phone-ah Enna)
            </button>
          </div>

          {/* Android Device Simulator */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                Android 14 Phone Simulator
              </span>
              <button
                onClick={() => {
                  setSimHeadsUpVisible(false);
                  setSimDialogOpen(false);
                  setSimInstalledSuccess(false);
                  setSimDownloadProgress(0);
                }}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Phone
              </button>
            </div>

            {/* Phone Screen Frame */}
            <div className="relative w-full max-w-[320px] mx-auto h-[440px] bg-slate-950 rounded-[32px] border-4 border-slate-700 shadow-2xl overflow-hidden flex flex-col justify-between">
              {/* Phone Status Bar */}
              <div className="px-5 pt-3 pb-2 flex items-center justify-between text-[10px] text-slate-300 font-mono z-30">
                <span>09:41</span>
                {/* Punch hole camera */}
                <div className="w-3.5 h-3.5 bg-black rounded-full border border-slate-800 -mr-2" />
                <div className="flex items-center gap-1.5">
                  <span>5G</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Heads-Up Notification Banner (Drops from top) */}
              {simHeadsUpVisible && (
                <div
                  onClick={handleSimNotificationClick}
                  className="mx-3 mt-1 p-3 rounded-2xl bg-slate-900/95 border border-emerald-500/40 shadow-xl backdrop-blur-md cursor-pointer hover:bg-slate-800 transition-all animate-bounce z-40"
                >
                  <div className="flex items-start gap-2.5">
                    <img
                      src={selectedApp?.iconUrl}
                      alt={selectedApp?.name}
                      className="w-8 h-8 rounded-lg object-cover border border-slate-700 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-white truncate">
                          {selectedApp?.name}
                        </span>
                        <span className="text-[9px] text-slate-400">now</span>
                      </div>
                      <p className="text-[10px] text-emerald-400 font-semibold truncate">
                        {testIsCritical ? '⚠️ Tul bik update!' : '✨ Update thar a awm e!'} v{testVersionName}
                      </p>
                      <p className="text-[10px] text-slate-300 line-clamp-1">
                        {testChangelog}
                      </p>
                    </div>
                  </div>

                  <div className="mt-2 pt-1.5 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[9px] text-slate-400 font-mono">Hmet la update rawh</span>
                    <span className="text-[10px] font-bold text-emerald-400">
                      UPDATE NGHAL RAWH &gt;
                    </span>
                  </div>
                </div>
              )}

              {/* In-App Update Dialog (Inside phone app) */}
              {simDialogOpen ? (
                <div className="m-3 p-4 rounded-2xl bg-slate-900 border border-slate-700 text-center space-y-3 z-30 shadow-2xl">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                    <DownloadCloud className="w-5 h-5" />
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white">
                      {testIsCritical ? 'Tul Bik Update (v' + testVersionName + ')' : 'Update Thar A Awm E (v' + testVersionName + ')'}
                    </h4>
                    <p className="text-[10px] text-slate-300 mt-1 leading-normal">
                      Danglamna tharte: <br />
                      <span className="text-white font-medium">{testChangelog}</span>
                    </p>
                  </div>

                  {simDownloadProgress > 0 && simDownloadProgress < 100 && (
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-400 h-full transition-all duration-300"
                        style={{ width: `${simDownloadProgress}%` }}
                      />
                    </div>
                  )}

                  {simInstalledSuccess ? (
                    <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-300 text-[11px] font-semibold flex items-center justify-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Update hlawhtling takin a zo e!</span>
                    </div>
                  ) : (
                    <div className="flex gap-2 pt-1">
                      {!testIsCritical && (
                        <button
                          onClick={() => setSimDialogOpen(false)}
                          className="flex-1 py-1.5 text-[10px] font-medium text-slate-400 hover:text-white bg-slate-800 rounded-lg"
                        >
                          Remchan hunah
                        </button>
                      )}
                      <button
                        onClick={handleSimStartUpdate}
                        disabled={simDownloadProgress > 0}
                        className="flex-1 py-1.5 text-[10px] font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow"
                      >
                        {simDownloadProgress > 0 ? `Downloading ${simDownloadProgress}%` : 'Update Nghal Rawh'}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Standby Wallpaper / App View */
                <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-700/80 mb-2 shadow-lg">
                    <img
                      src={selectedApp?.iconUrl}
                      alt={selectedApp?.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className="text-xs font-bold text-white">{selectedApp?.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Installed: v{selectedApp?.versionName}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-4 max-w-[200px]">
                    Notification test thawn la, a chungah hian heads-up banner a rawn lang ang.
                  </p>
                </div>
              )}

              {/* Phone Bottom Gesture Bar */}
              <div className="pb-3 flex justify-center z-30">
                <div className="w-28 h-1 bg-slate-600 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (7 cols): Full Android Code & Integration Guide */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-emerald-400" />
                  Android Code & Integration Guide
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  I Android Studio project-ah heng code te hi dah lut rawh le.
                </p>
              </div>

              <button
                onClick={() => handleCopyCode(getActiveCodeContent())}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/20 text-xs font-semibold transition-all flex items-center gap-1.5 self-start sm:self-auto"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copy a ni e!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Code Copy Rawh</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Selector Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-none text-xs">
              <button
                onClick={() => setCodeTab('service')}
                className={`px-3 py-1.5 rounded-lg font-mono transition-colors whitespace-nowrap ${
                  codeTab === 'service'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white bg-slate-950'
                }`}
              >
                AppUpdateMessagingService.kt
              </button>
              <button
                onClick={() => setCodeTab('dialog')}
                className={`px-3 py-1.5 rounded-lg font-mono transition-colors whitespace-nowrap ${
                  codeTab === 'dialog'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white bg-slate-950'
                }`}
              >
                AppUpdateHelper.kt
              </button>
              <button
                onClick={() => setCodeTab('main')}
                className={`px-3 py-1.5 rounded-lg font-mono transition-colors whitespace-nowrap ${
                  codeTab === 'main'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white bg-slate-950'
                }`}
              >
                MainActivity.kt
              </button>
              <button
                onClick={() => setCodeTab('gradle')}
                className={`px-3 py-1.5 rounded-lg font-mono transition-colors whitespace-nowrap ${
                  codeTab === 'gradle'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white bg-slate-950'
                }`}
              >
                build.gradle.kts
              </button>
              <button
                onClick={() => setCodeTab('manifest')}
                className={`px-3 py-1.5 rounded-lg font-mono transition-colors whitespace-nowrap ${
                  codeTab === 'manifest'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white bg-slate-950'
                }`}
              >
                AndroidManifest.xml
              </button>
              <button
                onClick={() => setCodeTab('backend')}
                className={`px-3 py-1.5 rounded-lg font-mono transition-colors whitespace-nowrap ${
                  codeTab === 'backend'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white bg-slate-950'
                }`}
              >
                FCM cURL / API
              </button>
            </div>

            {/* Code Content Box */}
            <div className="mt-3 relative rounded-xl bg-slate-950 p-4 border border-slate-800 overflow-x-auto max-h-[460px]">
              <pre className="text-xs font-mono text-slate-200 leading-relaxed">
                <code>{getActiveCodeContent()}</code>
              </pre>
            </div>

            {/* Mizo Implementation Steps Explanations */}
            <div className="mt-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2 text-xs">
              <h4 className="font-semibold text-white flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-emerald-400" />
                Hman Dan Tlangpui (Step-by-step):
              </h4>
              <ol className="list-decimal list-inside space-y-1 text-slate-300 leading-normal">
                <li>
                  <strong>build.gradle.kts:</strong> Firebase BoM leh <code className="text-emerald-400">firebase-messaging-ktx</code> dependencies dah lut rawh.
                </li>
                <li>
                  <strong>AndroidManifest.xml:</strong> <code className="text-emerald-400">POST_NOTIFICATIONS</code> permission leh Messaging Service register rawh.
                </li>
                <li>
                  <strong>AppUpdateMessagingService.kt:</strong> FCM notification lo thlenin version code a in-check ang a, heads-up notification leh APK link a hawng ang.
                </li>
                <li>
                  <strong>MainActivity.kt:</strong> User-in app an hawnin FCM Topic <code className="text-emerald-400">/topics/app_update_{selectedApp?.packageName.replace(/\./g, '_')}</code> ah an in-subscribe ang.
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
