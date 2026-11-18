import React from 'react';
import { DetailedProjectAnalysis } from '../../types';
import { formatScore, getScoreColor } from '../../lib/utils';
import {
  ExternalLink,
  Star,
  GitFork,
  ArrowRight,
  ShieldCheck,
  Code2,
  Trophy,
  Sparkles,
} from 'lucide-react';

interface ProjectCardProps {
  project: DetailedProjectAnalysis;
  onSelect: (project: DetailedProjectAnalysis) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelect }) => {
  const scoreColors = getScoreColor(project.overall_score);

  // Distinct luxury styling for 1st, 2nd, and 3rd rank
  const rankThemes = {
    1: {
      badge: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/40',
      label: '1st Rank Showcase • Champion Project',
      borderGlow: 'border-amber-500/30 hover:border-amber-400/60 shadow-lg shadow-amber-950/20 hover:shadow-amber-500/10',
      topGradient: 'from-amber-500/15 via-transparent to-transparent',
      trophyColor: 'text-amber-400',
    },
    2: {
      badge: 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/40',
      label: '2nd Rank Showcase • High Commendation',
      borderGlow: 'border-cyan-500/30 hover:border-cyan-400/60 shadow-lg shadow-cyan-950/20 hover:shadow-cyan-500/10',
      topGradient: 'from-cyan-500/15 via-transparent to-transparent',
      trophyColor: 'text-cyan-400',
    },
    3: {
      badge: 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/40',
      label: '3rd Rank Showcase • Honorable Mention',
      borderGlow: 'border-purple-500/30 hover:border-purple-400/60 shadow-lg shadow-purple-950/20 hover:shadow-purple-500/10',
      topGradient: 'from-purple-500/15 via-transparent to-transparent',
      trophyColor: 'text-purple-400',
    },
  };

  const currentTheme = rankThemes[project.rank as 1 | 2 | 3] || {
    badge: 'bg-slate-800 text-slate-300 border-slate-700',
    label: `Rank #${project.rank}`,
    borderGlow: 'border-white/10 hover:border-purple-500/40',
    topGradient: 'from-purple-500/10 via-transparent to-transparent',
    trophyColor: 'text-slate-400',
  };

  return (
    <div
      className={`group rounded-3xl bg-[#151D33]/90 border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between overflow-hidden relative ${currentTheme.borderGlow}`}
    >
      {/* Top subtle rank glow gradient */}
      <div className={`absolute top-0 inset-x-0 h-32 bg-gradient-to-b ${currentTheme.topGradient} pointer-events-none`} />

      {/* Top Header */}
      <div className="p-6 border-b border-white/5 relative z-10">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex flex-col gap-1.5">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border shadow-sm ${currentTheme.badge}`}
            >
              <Trophy className={`w-3.5 h-3.5 ${currentTheme.trophyColor}`} />
              <span>{currentTheme.label}</span>
            </span>

            {project.confidence_label && (
              <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1 pl-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                {Math.round((project.confidence_score || 0.9) * 100)}% Confidence Model
              </span>
            )}
          </div>

          {/* Overall Score Pill */}
          <div
            className={`flex items-baseline space-x-1 px-3.5 py-1.5 rounded-2xl border backdrop-blur-md shadow-md ${scoreColors.bg} ${scoreColors.border}`}
          >
            <span className={`text-2xl font-black font-mono ${scoreColors.text}`}>
              {formatScore(project.overall_score)}
            </span>
            <span className="text-xs text-slate-400 font-mono">/ 10</span>
          </div>
        </div>

        {/* Project Titles */}
        <div className="space-y-1 mt-2">
          <h3 className="text-xl font-black text-white group-hover:text-cyan-300 transition-colors tracking-tight">
            {project.display_name}
          </h3>
          <div className="flex items-center space-x-3 text-xs text-slate-400 font-mono">
            <span className="text-purple-300 font-semibold">{project.name}</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-300">
              <Code2 className="w-3.5 h-3.5 text-blue-400" />
              {project.primary_language}
            </span>
            {project.default_branch && (
              <>
                <span>•</span>
                <span className="text-slate-500 font-mono text-[11px]">{project.default_branch}</span>
              </>
            )}
          </div>
        </div>

        {/* Short Description */}
        <p className="text-sm text-slate-300 mt-3 leading-relaxed line-clamp-2">
          {project.description}
        </p>

        {/* Repo Link */}
        <div className="mt-3">
          <a
            href={project.repo_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center space-x-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-mono"
          >
            <span>{project.repo_url.replace("https://github.com/", "")}</span>
            <ExternalLink className="w-3 h-3 text-cyan-400" />
          </a>
        </div>
      </div>

      {/* Body: Tech Stack & Metric Highlights */}
      <div className="p-6 space-y-4 flex-1 flex flex-col justify-between relative z-10">
        {/* Tech tags */}
        <div>
          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-2 font-mono">
            Verified Technologies
          </span>
          <div className="flex flex-wrap gap-1.5">
            {project.tech_stack.flatMap((cat) => cat.items).slice(0, 5).map((tech, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg text-xs bg-[#080B16] border border-white/10 text-slate-200 font-medium"
              >
                {tech}
              </span>
            ))}
            {project.tech_stack.flatMap((cat) => cat.items).length > 5 && (
              <span className="px-2 py-1 rounded-lg text-xs bg-[#080B16] border border-white/10 text-slate-400 font-mono">
                +{project.tech_stack.flatMap((cat) => cat.items).length - 5}
              </span>
            )}
          </div>
        </div>

        {/* Evaluation Summary */}
        <div className="p-4 rounded-2xl bg-[#080B16]/80 border border-white/5 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Evaluation Summary</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
            {project.summary}
          </p>
        </div>

        {/* Ranking Rationale */}
        {project.ranking_rationale && (
          <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/20 text-xs text-purple-300 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{project.ranking_rationale}</span>
          </div>
        )}

        {/* Repo Stats Bar */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-white/5 font-mono">
          <div className="flex items-center space-x-3">
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              {project.stars}
            </span>
            <span className="flex items-center gap-1">
              <GitFork className="w-3.5 h-3.5 text-slate-400" />
              {project.forks}
            </span>
          </div>
          <span className="text-[11px] text-slate-500">
            Updated {new Date(project.updated_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Card Action Button */}
      <div className="p-4 bg-[#101629] border-t border-white/5 relative z-10">
        <button
          onClick={() => onSelect(project)}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-md shadow-purple-900/30 transition-all cursor-pointer group-hover:shadow-purple-600/40"
        >
          <span>View Detailed Report</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
};
