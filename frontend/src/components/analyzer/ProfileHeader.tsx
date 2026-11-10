import React from 'react';
import { UserProfileInfo, AnalysisType } from '../../types';
import { Github, ExternalLink, Users, BookMarked, CheckCircle2 } from 'lucide-react';
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
    <div className="rounded-2xl bg-gradient-to-r from-[#0F172A] via-[#111C33] to-[#0F172A] border border-slate-800 p-6 shadow-xl relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* User Info / Target Info */}
        <div className="flex items-center space-x-4">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.username}
              className="w-16 h-16 rounded-2xl border-2 border-purple-500/40 object-cover shadow-lg"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-blue-600 flex items-center justify-center text-white shadow-lg">
              <Github className="w-8 h-8" />
            </div>
          )}

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {profile?.name || targetIdentifier}
              </h2>
              {isDemo ? (
                <Badge variant="demo" size="sm">
                  Demo Evaluation
                </Badge>
              ) : (
                <Badge variant="success" size="sm">
                  Live GitHub Verified
                </Badge>
              )}
            </div>

            <div className="flex items-center space-x-3 text-xs text-slate-400 font-mono">
              <span className="text-purple-300">@{profile?.username || targetIdentifier}</span>
              <span>•</span>
              <span className="capitalize">{targetType} target</span>
              {profile?.html_url && (
                <>
                  <span>•</span>
                  <a
                    href={profile.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
                  >
                    <span>View GitHub</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                </>
              )}
            </div>

            {profile?.bio && (
              <p className="text-xs text-slate-300 max-w-xl line-clamp-2 pt-1">
                {profile.bio}
              </p>
            )}
          </div>
        </div>

        {/* Stats counters */}
        <div className="flex items-center space-x-6 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6 shrink-0">
          <div className="text-center">
            <div className="text-xl font-extrabold text-white font-mono flex items-center justify-center gap-1.5">
              <BookMarked className="w-4 h-4 text-blue-400" />
              {totalRepos}
            </div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
              Public Repos
            </span>
          </div>

          <div className="text-center">
            <div className="text-xl font-extrabold text-emerald-400 font-mono flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {analyzedCount}
            </div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
              Evaluated Top 3
            </span>
          </div>

          {profile?.followers !== undefined && (
            <div className="text-center">
              <div className="text-xl font-extrabold text-purple-300 font-mono flex items-center justify-center gap-1.5">
                <Users className="w-4 h-4 text-purple-400" />
                {profile.followers}
              </div>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
                Followers
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

