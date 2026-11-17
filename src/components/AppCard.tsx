import React, { useState } from 'react';
import { Download, Star, Check, Sparkles, Smartphone, ArrowRight } from 'lucide-react';
import type { AppItem } from '../types/appStore.ts';
import { formatApkSize, formatDownloads } from '../utils/appStoreLogic.ts';

interface AppCardProps {
  app: AppItem;
  onOpenDetails: (app: AppItem) => void;
  onDownloadApk: (app: AppItem) => void;
}

export const AppCard: React.FC<AppCardProps> = ({
  app,
  onOpenDetails,
  onDownloadApk,
}) => {
  const [imgError, setImgError] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      setDownloaded(true);
      onDownloadApk(app);
      setTimeout(() => setDownloaded(false), 2500);
    }, 800);
  };

  return (
    <div
      onClick={() => onOpenDetails(app)}
      className="group relative flex flex-col justify-between p-4 rounded-xl bg-slate-900/50 hover:bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
    >
      <div>
        {/* Top Header: App Icon + App Meta */}
        <div className="flex items-start gap-3.5 mb-3">
          {/* App Icon with zero-broken-image fallback */}
          <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-slate-700/60 bg-slate-800 shadow-md">
            {!imgError && app.iconUrl ? (
              <img
                src={app.iconUrl}
                alt={app.name}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white font-bold text-lg">
                {app.name.charAt(0)}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors truncate">
              {app.name}
            </h3>
            
            <p className="text-xs text-slate-400 truncate mt-0.5">
              {app.developer.name}
            </p>

            {/* Zero-Pill Unboxed Metadata with · separator */}
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1.5">
              <span className="flex items-center gap-0.5 text-amber-400 font-semibold font-mono tabular-nums">
                <Star className="w-3 h-3 fill-amber-400" />
                {app.rating.toFixed(1)}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{formatApkSize(app.apkSize)}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{formatDownloads(app.downloadsCount)}</span>
            </div>
          </div>
        </div>

        {/* Short Description */}
        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-4">
          {app.shortDesc}
        </p>
      </div>

      {/* Bottom Action Footer */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <span className="text-[11px] font-mono text-slate-400 truncate">
          v{app.versionName}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              downloaded
                ? 'bg-emerald-600 text-white'
                : downloading
                ? 'bg-slate-800 text-slate-300 animate-pulse'
                : 'bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/20'
            }`}
          >
            {downloaded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Downloaded</span>
              </>
            ) : downloading ? (
              <span>Downloading...</span>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>APK</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
