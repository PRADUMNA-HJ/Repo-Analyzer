import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface DemoBannerProps {
  disclaimer?: string;
  targetIdentifier?: string;
  targetType?: string;
  totalRepos?: number;
}

export const DemoBanner: React.FC<DemoBannerProps> = ({
  disclaimer,
  targetIdentifier,
  targetType,
  totalRepos,
}) => {
  return (
    <div className="rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-blue-950/40 border border-purple-500/40 p-5 shadow-xl relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-purple-500/10 blur-2xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5 text-purple-400" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40 tracking-wider">
                DEMO DATA ACTIVE
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Phase 1 Product Foundation
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
              {disclaimer ||
                'Phase 1 provides realistic demonstration evaluations to validate full-stack integration, schemas, and UI components. Live GitHub repository crawler and AST analyzer will be connected in Phase 2.'}
            </p>
          </div>
        </div>

        {targetIdentifier && (
          <div className="shrink-0 flex items-center md:flex-col md:items-end justify-between border-t md:border-t-0 md:border-l border-purple-500/20 pt-3 md:pt-0 md:pl-5 text-xs">
            <span className="text-slate-400 uppercase tracking-wider text-[10px]">
              Inspected Target ({targetType || 'profile'})
            </span>
            <span className="font-mono font-semibold text-purple-300">
              {targetIdentifier}
            </span>
            {totalRepos !== undefined && (
              <span className="text-slate-400 text-[11px] mt-0.5">
                {totalRepos} public {totalRepos === 1 ? 'repository' : 'repositories'} cataloged
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
