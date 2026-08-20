import React from 'react';
import { SystemStatus } from '../types';
import { 
  Zap, 
  RotateCw, 
  Store, 
  ShieldCheck, 
  AlertTriangle, 
  XCircle,
  UploadCloud
} from 'lucide-react';

interface HeaderProps {
  storeName?: string;
  systemStatus: SystemStatus;
  statusReason: string;
  onRefreshAudit: () => void;
  onOpenFileUpload?: () => void;
  onSelectPreset?: (index: number) => void;
  presets?: { label: string }[];
  isAuditing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  systemStatus,
  statusReason,
  onRefreshAudit,
  onOpenFileUpload,
  isAuditing
}) => {
  const getStatusBadge = () => {
    switch (systemStatus) {
      case 'GREEN_MOVE':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>جاهز للسكيل (GREEN_MOVE)</span>
          </div>
        );
      case 'YELLOW_WAIT':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-pulse"></span>
            <AlertTriangle className="w-4 h-4 text-amber-700" />
            <span>مراقبة واستنتظر (YELLOW_WAIT)</span>
          </div>
        );
      case 'RED_DONT_TOUCH':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-100 border border-rose-300 text-rose-900 text-xs font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse"></span>
            <XCircle className="w-4 h-4 text-rose-700" />
            <span>عالج التسريب أولاً (RED_DONT_TOUCH)</span>
          </div>
        );
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 lg:px-8 py-3.5 shadow-2xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left Side: Brand Logo & 3 LAYER SYSTEM Title */}
        <div className="flex flex-wrap items-center gap-3 md:gap-4">
          <div className="bg-indigo-600 text-white px-3 py-1 rounded-md text-[11px] font-bold font-mono tracking-wider shrink-0 shadow-2xs">
            v4.2
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 font-headline uppercase font-mono">
              3 LAYER SYSTEM
            </h1>
            <span className="hidden sm:inline-block text-xs font-bold text-slate-500 font-sans border-r border-slate-300 pr-2.5 mr-1">
              نظام تشخيص وتوجيه الحملات الإعلانية
            </span>
          </div>
        </div>

        {/* Right Side: Header Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div title={statusReason}>
            {getStatusBadge()}
          </div>

          <button
            onClick={onRefreshAudit}
            disabled={isAuditing}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 text-xs font-bold transition-all disabled:opacity-50 active:scale-95 cursor-pointer shadow-2xs"
          >
            <RotateCw className={`w-3.5 h-3.5 text-emerald-700 ${isAuditing ? 'animate-spin' : ''}`} />
            <span>{isAuditing ? 'جاري الفحص...' : 'إعادة الفحص والتدقيق'}</span>
          </button>

          {onOpenFileUpload && (
            <button
              onClick={onOpenFileUpload}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
            >
              <UploadCloud className="w-4 h-4 text-white" />
              <span>رفع شيت / صور</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};


