import React, { useState } from 'react';
import {
  X,
  Download,
  Star,
  ShieldCheck,
  Smartphone,
  Calendar,
  Layers,
  Check,
  Share2,
  BellRing,
  Send,
  Sparkles,
  Info,
} from 'lucide-react';
import type { AppItem, UserSession } from '../types/appStore.ts';
import { formatApkSize, formatDownloads } from '../utils/appStoreLogic.ts';

interface AppDetailModalProps {
  app: AppItem | null;
  onClose: () => void;
  onDownload: (app: AppItem) => void;
  onOpenUpdateModal?: (app: AppItem) => void;
  onOpenFcmTester?: (app: AppItem) => void;
  userSession: UserSession;
}

export const AppDetailModal: React.FC<AppDetailModalProps> = ({
  app,
  onClose,
  onDownload,
  onOpenUpdateModal,
  onOpenFcmTester,
  userSession,
}) => {
  if (!app) return null;

  const [activeTab, setActiveTab] = useState<'about' | 'changelog' | 'history' | 'reviews'>('about');
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewsList, setReviewsList] = useState<{ name: string; rating: number; comment: string; date: string }[]>([
    {
      name: 'Lalhmangaiha',
      rating: 5,
      comment: 'A tha hle mai, Mizo tawng tan a tangkai em em e.',
      date: '2026-11-12',
    },
    {
      name: 'Rohlupuii',
      rating: 5,
      comment: 'Update thar an rawn dah hi a chak hle mai. Push notification pawh a rawn lang nghal.',
      date: '2026-11-14',
    },
  ]);

  const handleStartDownload = () => {
    setDownloading(true);
    setDownloadProgress(10);
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setDownloading(false);
          onDownload(app);
          return 100;
        }
        return prev + 30;
      });
    }, 200);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    const newRev = {
      name: userSession.user?.name || 'Mizo User',
      rating: userRating,
      comment: reviewComment.trim(),
      date: 'Vawiin',
    };
    setReviewsList([newRev, ...reviewsList]);
    setReviewComment('');
  };

  const isDeveloperOwner = Boolean(
    userSession.isAuthenticated &&
      (userSession.user?.id === app.developer.id || userSession.user?.isDeveloper)
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>App Chanchin Famkim</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">{app.packageName}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Share link"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              aria-label="Kharna"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {/* Header Card: App Icon + Primary Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-800 shrink-0 shadow-lg">
              <img
                src={app.iconUrl}
                alt={app.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight truncate">
                  {app.name}
                </h2>
                {app.developer.verified && (
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" title="Verified Mizo Developer" />
                )}
              </div>

              <p className="text-xs text-slate-400 mt-0.5">
                Siamtu: <span className="text-slate-200 font-medium">{app.developer.name}</span>
                {app.developer.organization && ` (${app.developer.organization})`}
              </p>

              {/* Unboxed Metadata */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-2 font-mono">
                <span className="flex items-center gap-1 text-amber-400 font-bold tabular-nums">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {app.rating.toFixed(1)} ({app.ratingCount})
                </span>
                <span aria-hidden="true">·</span>
                <span className="text-slate-300 tabular-nums">Size: {formatApkSize(app.apkSize)}</span>
                <span aria-hidden="true">·</span>
                <span className="text-slate-300 tabular-nums">{formatDownloads(app.downloadsCount)} downloads</span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-400 font-semibold">v{app.versionName}</span>
              </div>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 mb-6 p-4 rounded-xl bg-slate-950/50 border border-slate-800">
            <button
              onClick={handleStartDownload}
              disabled={downloading}
              className="flex-1 min-w-[200px] py-2.5 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              {downloading ? `Downloading... ${downloadProgress}%` : `Download APK (${formatApkSize(app.apkSize)})`}
            </button>

            {isDeveloperOwner && (
              <>
                {onOpenUpdateModal && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenUpdateModal(app);
                    }}
                    className="py-2.5 px-3.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5"
                  >
                    <Layers className="w-3.5 h-3.5 text-emerald-400" />
                    Update Thehluh
                  </button>
                )}

                {onOpenFcmTester && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenFcmTester(app);
                    }}
                    className="py-2.5 px-3.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30 transition-colors flex items-center gap-1.5"
                  >
                    <BellRing className="w-3.5 h-3.5 text-teal-400" />
                    FCM Thawnna
                  </button>
                )}
              </>
            )}
          </div>

          {downloading && (
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-6">
              <div
                className="bg-emerald-400 h-full transition-all duration-200"
                style={{ width: `${downloadProgress}%` }}
              />
            </div>
          )}

          {/* Screenshot Showcase if available */}
          {app.screenshots && app.screenshots.length > 0 && (
            <div className="mb-6">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Thlalak & Interface
              </h4>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                {app.screenshots.map((s, idx) => (
                  <div
                    key={idx}
                    className="relative w-48 h-28 rounded-lg overflow-hidden border border-slate-800 shrink-0 bg-slate-800"
                  >
                    <img
                      src={s}
                      alt={`${app.name} preview`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-800 mb-4 pb-1">
            <button
              onClick={() => setActiveTab('about')}
              className={`px-3 py-1.5 text-xs font-medium rounded-t-lg transition-colors border-b-2 ${
                activeTab === 'about'
                  ? 'border-emerald-400 text-emerald-400 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Chanchin (About)
            </button>
            <button
              onClick={() => setActiveTab('changelog')}
              className={`px-3 py-1.5 text-xs font-medium rounded-t-lg transition-colors border-b-2 ${
                activeTab === 'changelog'
                  ? 'border-emerald-400 text-emerald-400 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Danglamna Tharte (What's New)
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 text-xs font-medium rounded-t-lg transition-colors border-b-2 ${
                activeTab === 'history'
                  ? 'border-emerald-400 text-emerald-400 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Version Hmasate
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-3 py-1.5 text-xs font-medium rounded-t-lg transition-colors border-b-2 ${
                activeTab === 'reviews'
                  ? 'border-emerald-400 text-emerald-400 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Endikna ({reviewsList.length})
            </button>
          </div>

          {/* Tab 1: About */}
          {activeTab === 'about' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {app.fullDesc || app.shortDesc}
              </p>

              <div className="pt-4 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-400">Package Name:</span>
                  <p className="font-mono text-slate-200 truncate mt-0.5">{app.packageName}</p>
                </div>
                <div>
                  <span className="text-slate-400">Android Version Phut:</span>
                  <p className="font-mono text-slate-200 mt-0.5">Android {app.minSdkVersion >= 26 ? '8.0+' : '7.0+'}</p>
                </div>
                <div>
                  <span className="text-slate-400">Version Code:</span>
                  <p className="font-mono text-slate-200 mt-0.5">{app.versionCode}</p>
                </div>
                <div>
                  <span className="text-slate-400">Update Ni:</span>
                  <p className="text-slate-200 mt-0.5 font-mono">{new Date(app.updatedAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-slate-400">Developer Email:</span>
                  <p className="text-slate-200 truncate mt-0.5">{app.developer.email}</p>
                </div>
                <div>
                  <span className="text-slate-400">APK File:</span>
                  <p className="font-mono text-slate-200 truncate mt-0.5">{app.apkFileName}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Changelog */}
          {activeTab === 'changelog' && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-semibold text-emerald-400">
                    Version v{app.versionName}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {new Date(app.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                  {app.changelog || 'Siamthat tharte leh hmasawnnate a awm e.'}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-teal-500/10 border border-teal-500/20 text-xs text-teal-300 flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  He app hmangtute hian FCM Push Notification hmangin he update hi an phone chhungah an dawng vek thei a ni.
                </span>
              </div>
            </div>
          )}

          {/* Tab 3: History */}
          {activeTab === 'history' && (
            <div className="space-y-2">
              {app.versionHistory && app.versionHistory.length > 0 ? (
                app.versionHistory.map((ver, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-slate-950/40 border border-slate-800/80 flex items-start justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-white font-mono">v{ver.versionName}</strong>
                        <span className="text-slate-400 font-mono">(Code: {ver.versionCode})</span>
                        {ver.isCriticalUpdate && (
                          <span className="text-[10px] text-amber-400 font-medium">Tul Bik Update</span>
                        )}
                      </div>
                      <p className="text-slate-300 mt-1">{ver.changelog}</p>
                    </div>
                    <div className="text-right text-slate-400 shrink-0 ml-4 font-mono">
                      <span>{ver.releaseDate}</span>
                      <p className="text-[11px] text-slate-400">{formatApkSize(ver.apkSize)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-4 text-center">Version history dang a la awm lo.</p>
              )}
            </div>
          )}

          {/* Tab 4: Reviews */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              {/* Add Review Form */}
              <form onSubmit={handleAddReview} className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">Endikna leh ngaihdan dah rawh:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((st) => (
                      <button
                        type="button"
                        key={st}
                        onClick={() => setUserRating(st)}
                        className="text-amber-400 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-4 h-4 ${st <= userRating ? 'fill-amber-400' : 'text-slate-600'}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="He app chungchang i ngaihdan ziak rawh..."
                    className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold rounded-lg flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Dah rawh
                  </button>
                </div>
              </form>

              {/* Reviews List */}
              <div className="space-y-2.5">
                {reviewsList.map((rev, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-950/30 border border-slate-800/80 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-200">{rev.name}</span>
                      <div className="flex items-center gap-1 text-amber-400">
                        <span className="font-mono">{rev.rating}</span>
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span className="text-slate-400 font-mono text-[11px] ml-1">{rev.date}</span>
                      </div>
                    </div>
                    <p className="text-slate-300 leading-normal">{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
