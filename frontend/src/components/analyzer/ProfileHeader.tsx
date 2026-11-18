import React from 'react';
import { UserProfileInfo, AnalysisType } from '../../types';
import { Github, ExternalLink, BookMarked, CheckCircle2, Sparkles } from 'lucide-react';
import { Badge } from '../common/Badge';

interface ProfileHeaderProps {
  profile?: UserProfileInfo;
  targetType: AnalysisType;
  targetIdentifier: string;
  totalRepos: number;
  isDemo: boolean;
  analyzedCount: number;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  targetType,
  targetIdentifier,
  totalRepos,
  isDemo,
  analyzedCount,
}) => {
  return (
    <div className="rounded-3xl bg-gradient-to-r from-[#151D33] via-[#1A2440] to-[#151D33] border border-white/10 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      {/* Dynamic ambient glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-purple-600/15 via-blue-600/10 to-transparent blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        {/* User Info / Target Info */}
        <div className="flex items-center space-x-5">
          {profile?.avatar_url ? (
            <div className="relative group shrink-0">
              <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 opacity-75 blur-sm group-hover:opacity-100 transition-opacity" />
              <img
                src={profile.avatar_url}
                alt={profile.username}
                className="relative w-20 h-20 rounded-2xl object-cover border border-white/20 shadow-xl"
              />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#8B5CF6] via-[#3B82F6] to-[#22D3EE] p-0.5 shadow-xl shrink-0">
              <div className="w-full h-full bg-[#080B16] rounded-[14px] flex items-center justify-center text-white">
                <Github className="w-10 h-10 text-cyan-300" />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {profile?.name || targetIdentifier}
              </h2>
              {isDemo ? (
                <Badge variant="demo" size="sm">
                  Demo Evaluation
                </Badge>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold tracking-wide shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live GitHub Verified
                </span>
              )}
            </div>

            <div className="flex items-center space-x-3 text-xs text-slate-300 font-mono flex-wrap">
              <span className="text-purple-300 font-semibold">@{profile?.username || targetIdentifier}</span>
              <span className="text-slate-600">•</span>
              <span className="capitalize px-2 py-0.5 rounded bg-[#080B16] border border-white/10 text-slate-300">
                {targetType} Target
              </span>
              {profile?.html_url && (
                <>
                  <span className="text-slate-600">•</span>
                  <a
                    href={profile.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 underline transition-colors"
                  >
                    <span>View GitHub Profile</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </>
              )}
            </div>

            {profile?.bio && (
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl line-clamp-2 pt-1 font-sans">
                {profile.bio}
              </p>
            )}
          </div>
        </div>

        {/* Stats counters */}
        <div className="flex items-center space-x-6 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-8 shrink-0">
          <div className="text-center px-2">
            <div className="text-2xl font-black text-white font-mono flex items-center justify-center gap-1.5">
              <BookMarked className="w-5 h-5 text-blue-400" />
              {totalRepos}
            </div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold font-mono">
              Public Repos
            </span>
          </div>

          <div className="text-center px-2">
            <div className="text-2xl font-black text-emerald-400 font-mono flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              {analyzedCount}
            </div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold font-mono">
              Qualified Projects
            </span>
          </div>

          <div className="text-center px-2">
            <div className="text-2xl font-black text-purple-400 font-mono flex items-center justify-center gap-1.5">
              <Sparkles className="w-5 h-5 text-purple-400" />
              8/8
            </div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold font-mono">
              Pillars Checked
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
