import React from 'react';
import { DetailedProjectAnalysis } from '../../types';
import { formatScore, getScoreColor } from '../../lib/utils';
import { Trophy } from 'lucide-react';

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
    { id: 'code-quality', label: 'Code Quality (20%)' },
    { id: 'architecture', label: 'Architecture (15%)' },
    { id: 'functionality', label: 'Functionality (15%)' },
    { id: 'technology', label: 'Technology (10%)' },
    { id: 'testing', label: 'Testing & QA (10%)' },
    { id: 'security', label: 'Security (10%)' },
    { id: 'documentation', label: 'Documentation (10%)' },
    { id: 'activity', label: 'Activity (10%)' },
  ];

  return (
    <div className="rounded-2xl bg-[#0F172A]/90 border border-slate-800 p-6 shadow-xl space-y-4 overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            Top Projects Comparative Matrix
          </h3>
          <p className="text-xs text-slate-400">
            Side-by-side engineering breakdown across the 8-pillar academic rubric.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4 font-semibold">Evaluation Metric</th>
              {projects.map((p) => (
                <th key={p.id} className="py-3 px-4 font-semibold">
                  <div className="flex items-center gap-1.5 text-white">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span>#{p.rank} {p.name}</span>
                  </div>
                  <span className="text-[10px] text-purple-300 font-mono lowercase block">
                    {p.primary_language}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {/* Overall Rating Row */}
            <tr className="bg-slate-900/50 font-bold">
              <td className="py-3 px-4 text-white">Overall Rating (out of 10)</td>
              {projects.map((p) => {
                const colors = getScoreColor(p.overall_score);
                return (
                  <td key={p.id} className="py-3 px-4">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-lg font-mono text-sm border ${colors.bg} ${colors.text} ${colors.border}`}
                    >
                      {formatScore(p.overall_score)} / 10.0
                    </span>
                  </td>
                );
              })}
            </tr>

            {/* 8 Pillars */}
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="py-2.5 px-4 font-medium text-slate-300">{cat.label}</td>
                {projects.map((p) => {
                  const criterion = p.criteria_breakdown.find((c) => c.id === cat.id);
                  const score = criterion ? criterion.score : 0;
                  const colors = getScoreColor(score);
                  return (
                    <td key={p.id} className="py-2.5 px-4 font-mono">
                      <span className={`${colors.text} font-semibold`}>
                        {formatScore(score)}
                      </span>
                      <span className="text-slate-500 text-[10px] ml-1">
                        ({criterion?.rating_label || 'Evaluated'})
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}

            {/* Stars & Forks */}
            <tr className="hover:bg-slate-800/30 transition-colors">
              <td className="py-2.5 px-4 font-medium text-slate-400">GitHub Stars / Forks</td>
              {projects.map((p) => (
                <td key={p.id} className="py-2.5 px-4 text-xs font-mono text-slate-400">
                  <span className="text-amber-400">★ {p.stars}</span> / {p.forks} forks
                </td>
              ))}
            </tr>

            {/* Inspect Link */}
            <tr>
              <td className="py-3 px-4 text-slate-500">Full Inspection</td>
              {projects.map((p) => (
                <td key={p.id} className="py-3 px-4">
                  <button
                    onClick={() => onSelectProject(p)}
                    className="text-purple-400 hover:text-purple-300 font-semibold underline text-xs cursor-pointer"
                  >
                    View Report →
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
