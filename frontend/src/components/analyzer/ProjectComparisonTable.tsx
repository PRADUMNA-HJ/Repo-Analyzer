import React from 'react';
import { DetailedProjectAnalysis } from '../../types';
import { formatScore, getScoreColor } from '../../lib/utils';
import { Trophy, Star, GitFork, ArrowRight, Sparkles } from 'lucide-react';

interface ProjectComparisonTableProps {
  projects: DetailedProjectAnalysis[];
  onSelectProject: (project: DetailedProjectAnalysis) => void;
}

export const ProjectComparisonTable: React.FC<ProjectComparisonTableProps> = ({
  projects,
  onSelectProject,
}) => {
  if (!projects || projects.length < 2) return null;

  const categories = [
    { id: 'code-quality', label: 'Code Quality & Maintainability (20%)' },
    { id: 'architecture', label: 'Architecture & Modularity (15%)' },
    { id: 'functionality', label: 'Functionality & Domain Depth (15%)' },
    { id: 'technology', label: 'Technology Stack Fit (10%)' },
    { id: 'testing', label: 'Testing & QA Rigour (10%)' },
    { id: 'security', label: 'Security & Secret Hygiene (10%)' },
    { id: 'documentation', label: 'Documentation & Onboarding (10%)' },
    { id: 'activity', label: 'Development Discipline (10%)' },
  ];

  return (
    <div className="rounded-3xl bg-[#151D33]/90 border border-white/10 p-6 sm:p-8 shadow-2xl space-y-6 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <span>Top Projects Comparative Matrix</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            Side-by-side engineering breakdown across the 8-pillar academic rubric.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/5 bg-[#080B16]">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-[#101629] text-slate-400 uppercase tracking-wider text-[11px] font-mono">
              <th className="py-4 px-5 font-bold">Evaluation Pillar</th>
              {projects.map((p) => (
                <th key={p.id} className="py-4 px-5 font-bold">
                  <div className="flex items-center gap-1.5 text-white">
                    <Trophy className={`w-3.5 h-3.5 ${p.rank === 1 ? 'text-amber-400' : p.rank === 2 ? 'text-cyan-400' : 'text-purple-400'}`} />
                    <span className="text-sm font-black">#{p.rank} {p.name}</span>
                  </div>
                  <span className="text-[11px] text-purple-300 font-mono lowercase block font-normal mt-0.5">
                    {p.name} ({p.primary_language})
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-slate-300">
            {/* Overall Rating Row */}
            <tr className="bg-[#151D33]/80 font-bold">
              <td className="py-4 px-5 text-white font-mono text-sm">Overall Rating (out of 10)</td>
              {projects.map((p) => {
                const colors = getScoreColor(p.overall_score);
                return (
                  <td key={p.id} className="py-4 px-5">
                    <span
                      className={`inline-block px-3 py-1.5 rounded-xl font-mono text-sm font-black border ${colors.bg} ${colors.text} ${colors.border}`}
                    >
                      {formatScore(p.overall_score)} / 10.0
                    </span>
                  </td>
                );
              })}
            </tr>

            {/* 8 Pillars */}
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-3 px-5 font-semibold text-slate-300">{cat.label}</td>
                {projects.map((p) => {
                  const criterion = p.criteria_breakdown.find((c) => c.id === cat.id);
                  const score = criterion ? criterion.score : 0;
                  const colors = getScoreColor(score);
                  return (
                    <td key={p.id} className="py-3 px-5 font-mono">
                      <span className={`${colors.text} font-bold text-sm`}>
                        {formatScore(score)}
                      </span>
                      <span className="text-slate-500 text-[10px] ml-1.5">
                        ({criterion?.rating_label || 'Evaluated'})
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}

            {/* Stars & Forks */}
            <tr className="hover:bg-white/[0.02] transition-colors bg-[#101629]/50">
              <td className="py-3 px-5 font-semibold text-slate-300">GitHub Community Signals</td>
              {projects.map((p) => (
                <td key={p.id} className="py-3 px-5 font-mono text-slate-400">
                  <span className="inline-flex items-center gap-1 mr-3 text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {p.stars} stars
                  </span>
                  <span className="inline-flex items-center gap-1 text-slate-400">
                    <GitFork className="w-3.5 h-3.5" />
                    {p.forks} forks
                  </span>
                </td>
              ))}
            </tr>

            {/* Actions Row */}
            <tr className="bg-[#101629]">
              <td className="py-3 px-5 font-semibold text-slate-400">Deep Inspection</td>
              {projects.map((p) => (
                <td key={p.id} className="py-3 px-5">
                  <button
                    onClick={() => onSelectProject(p)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-purple-300 hover:text-white bg-purple-500/10 hover:bg-purple-500/30 border border-purple-500/20 transition-all cursor-pointer"
                  >
                    <span>Inspect Rubric</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
