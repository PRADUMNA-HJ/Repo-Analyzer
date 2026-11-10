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
import { Badge } from '../common/Badge';

interface ProjectCardProps {
  project: DetailedProjectAnalysis;
  onSelect: (project: DetailedProjectAnalysis) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelect }) => {
  const scoreColors = getScoreColor(project.overall_score);

  const rankBadges = {
    1: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    2: 'bg-slate-400/15 text-slate-300 border-slate-400/30',
    3: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  };

  return (
    <div className="group rounded-2xl bg-[#0F172A]/80 border border-slate-800 hover:border-slate-700/80 hover:bg-[#131D33] transition-all duration-300 shadow-xl flex flex-col justify-between overflow-hidden">
      {/* Top Header */}
      <div className="p-6 border-b border-slate-800/80">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <span
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border flex items-center gap-1 ${
                rankBadges[project.rank as 1 | 2 | 3] || 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              Rank #{project.rank}
            </span>

            {project.confidence_label && (
              <Badge variant="primary" size="sm">
                {Math.round((project.confidence_score || 0.9) * 100)}% Confidence
              </Badge>
            )}
          </div>

          {/* Overall Score Pill */}
          <div
            className={`flex items-baseline space-x-1 px-3 py-1.5 rounded-xl border ${scoreColors.bg} ${scoreColors.border}`}
          >
            <span className={`text-xl font-extrabold ${scoreColors.text}`}>
              {formatScore(project.overall_score)}
            </span>
            <span className="text-xs text-slate-400">/ 10</span>
          </div>
        </div>

        {/* Project Titles */}
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
            {project.display_name}
          </h3>
          <div className="flex items-center space-x-3 text-xs text-slate-400">
            <span className="font-mono text-purple-300">{project.name}</span>
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
            className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <span>{project.repo_url.replace("https://github.com/", "")}</span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </a>
        </div>
      </div>

      {/* Body: Tech Stack & Metric Highlights */}
      <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
        {/* Tech tags */}
        <div>
          <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block mb-2">
            Verified Technologies
          </span>
          <div className="flex flex-wrap gap-1.5">
            {project.tech_stack.flatMap((cat) => cat.items).slice(0, 5).map((tech, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md text-xs bg-slate-900 border border-slate-800 text-slate-300 font-medium"
              >
                {tech}
              </span>
            ))}
            {project.tech_stack.flatMap((cat) => cat.items).length > 5 && (
              <span className="px-2 py-0.5 rounded-md text-xs bg-slate-900 border border-slate-800 text-slate-500">
                +{project.tech_stack.flatMap((cat) => cat.items).length - 5} more
              </span>
            )}
          </div>
        </div>

        {/* Evaluation Summary */}
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Evaluation Summary
          </div>
          <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
            {project.summary}
          </p>
        </div>

        {/* Ranking Rationale */}
        {project.ranking_rationale && (
          <div className="p-2.5 rounded-lg bg-purple-950/20 border border-purple-500/20 text-[11px] text-purple-300 flex items-start gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
            <span>{project.ranking_rationale}</span>
          </div>
        )}

        {/* Repo Stats Bar */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
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
      <div className="p-4 bg-slate-900/60 border-t border-slate-800/80">
        <button
          onClick={() => onSelect(project)}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-slate-800 hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600 border border-slate-700/80 hover:border-transparent transition-all shadow-sm group-hover:shadow-indigo-950/40 cursor-pointer"
        >
          <span>View Detailed Report</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
};
