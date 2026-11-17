import React from 'react';
import { Download, Sparkles, UploadCloud, Bell, ShieldCheck } from 'lucide-react';

interface HeroBannerProps {
  onExploreClick: () => void;
  onDeveloperClick: () => void;
  totalApps: number;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onExploreClick,
  onDeveloperClick,
  totalApps,
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 mb-8">
      {/* Background glow and subtle mesh */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/40 via-slate-900/90 to-slate-950/90 z-10 pointer-events-none" />
      
      <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch min-h-[360px] relative z-20">
        {/* Left Column: Editorial Headline & Actions */}
        <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 mb-3">
              <Sparkles className="w-4 h-4" />
              <span>Mizoram Android App Ecosystem</span>
              <span aria-hidden="true">·</span>
              <span>FCM Push Notification Enabled</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight mb-4 max-w-xl">
              Mizo Android Application-te Hmunpui
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6 max-w-lg">
              Mizo developer-te kutchhuak app thar ber ber zawnna, direct APK download-na, leh app update thar notification awlsam taka inhrilhhriatna platform changtlung a ni e.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={onExploreClick}
                className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-semibold transition-all shadow-md shadow-emerald-500/20 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                App En Kual Rawh
              </button>

              <button
                onClick={onDeveloperClick}
                className="px-5 py-2.5 rounded-lg bg-slate-800/90 hover:bg-slate-800 text-white text-sm font-medium border border-slate-700/80 transition-all flex items-center gap-2"
              >
                <UploadCloud className="w-4 h-4 text-emerald-400" />
                Developer Pual (APK Thehluh)
              </button>
            </div>
          </div>

          {/* Adjacent Quantitative Proof Strip */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-4">
            <div>
              <p className="text-xl sm:text-2xl font-bold text-white font-mono tabular-nums">
                {totalApps}+
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Mizo App Awmte</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-emerald-400 font-mono tabular-nums">
                250K+
              </p>
              <p className="text-xs text-slate-400 mt-0.5">APK Download Zat</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-teal-300 font-mono tabular-nums">
                FCM v1
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Push Update Alert</p>
            </div>
          </div>
        </div>

        {/* Right Column: Hero Visual Showcase */}
        <div className="lg:col-span-5 relative hidden lg:block overflow-hidden">
          <img
            src="/src/assets/images/hero_mizo_appstore_1794879486076.jpg"
            alt="Mizo AppStore Smartphone Interface"
            className="w-full h-full object-cover object-center transform scale-105 hover:scale-100 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
          <div className="absolute bottom-4 right-4 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Mizo Developer Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
};
