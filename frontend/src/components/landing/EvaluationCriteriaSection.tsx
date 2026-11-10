import React from 'react';
import {
  Code,
  Layers,
  Sparkles,
  Cpu,
  TestTube2,
  ShieldAlert,
  BookOpen,
  GitBranch,
  Info,
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface CriterionItem {
  name: string;
  weight: number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  barColor: string;
}

const criteria: CriterionItem[] = [
  {
    name: 'Code Quality & Maintainability',
    weight: 20,
    description: 'Clean coding conventions, type safety, modularity, and adherence to clean code idioms.',
    icon: Code,
    color: 'text-indigo-400',
    barColor: 'bg-indigo-500',
  },
  {
    name: 'Architecture & Structure',
    weight: 15,
    description: 'Logical layer decoupling, repository organization, scalability patterns, and dependency boundaries.',
    icon: Layers,
    color: 'text-purple-400',
    barColor: 'bg-purple-500',
  },
  {
    name: 'Functionality & Implementation',
    weight: 15,
    description: 'Feature depth, business domain coverage, edge-case robustness, and user workflow completeness.',
    icon: Sparkles,
    color: 'text-blue-400',
    barColor: 'bg-blue-500',
  },
  {
    name: 'Technology Usage',
    weight: 10,
    description: 'Appropriate modern tooling, idiomatic framework patterns, and library ecosystem fit.',
    icon: Cpu,
    color: 'text-cyan-400',
    barColor: 'bg-cyan-500',
  },
  {
    name: 'Testing & Reliability',
    weight: 10,
    description: 'Unit and integration tests, code coverage percentage, CI assertions, and fault recovery.',
    icon: TestTube2,
    color: 'text-emerald-400',
    barColor: 'bg-emerald-500',
  },
  {
    name: 'Security Practices',
    weight: 10,
    description: 'Authentication hygiene, secret sanitization, input validation, and vulnerability prevention.',
    icon: ShieldAlert,
    color: 'text-rose-400',
    barColor: 'bg-rose-500',
  },
  {
    name: 'Documentation',
    weight: 10,
    description: 'README onboarding clarity, architectural diagrams, API schemas, and deployment instructions.',
    icon: BookOpen,
    color: 'text-amber-400',
    barColor: 'bg-amber-500',
  },
  {
    name: 'Development Activity & Completeness',
    weight: 10,
    description: 'Commit cadence, meaningful commit messages, branch strategy, and repository maturity.',
    icon: GitBranch,
    color: 'text-teal-400',
    barColor: 'bg-teal-500',
  },
];

export const EvaluationCriteriaSection: React.FC = () => {
  return (
    <section id="evaluation-criteria" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <Badge variant="primary">Rigorous 8-Pillar Rubric</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Comprehensive Evaluation Criteria
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            RepoScope scores projects through an objective, weighted 100% distribution framework designed for Computer Science evaluations.
          </p>
        </div>

        {/* Informational Phase 2 Banner */}
        <div className="max-w-4xl mx-auto mb-12 p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 flex items-start space-x-3 text-sm text-purple-200">
          <Info className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-purple-300">Phase 1 Architecture Notice: </span>
            This 8-pillar matrix represents our verified grading rubric. In Phase 1, demo analysis data illustrates this structure. Real static code analysis and AST inspection will compute these weights in Phase 2.
          </div>
        </div>

        {/* Weights Visual Distribution Bar */}
        <div className="max-w-4xl mx-auto mb-14 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span>Cumulative Evaluation Weight Distribution</span>
            <span className="text-purple-400 font-mono">Total: 100%</span>
          </div>
          <div className="h-4 w-full rounded-full bg-slate-800 overflow-hidden flex shadow-inner">
            {criteria.map((item, idx) => (
              <div
                key={idx}
                style={{ width: `${item.weight}%` }}
                className={`${item.barColor} h-full transition-all duration-500 hover:opacity-90`}
                title={`${item.name}: ${item.weight}%`}
              />
            ))}
          </div>
          <div className="flex flex-wrap justify-between gap-2 text-[11px] text-slate-400 pt-1">
            <span>Quality (20%)</span>
            <span>Architecture (15%)</span>
            <span>Function (15%)</span>
            <span>Tech (10%)</span>
            <span>Testing (10%)</span>
            <span>Security (10%)</span>
            <span>Docs (10%)</span>
            <span>Activity (10%)</span>
          </div>
        </div>

        {/* 8 Criteria Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {criteria.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#0F172A]/70 border border-slate-800/80 hover:border-slate-700 hover:bg-[#151D30] transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800/90 flex items-center justify-center border border-slate-700/60">
                        <Icon className={`w-5 h-5 ${item.color}`} />
                      </div>
                      <h3 className="text-base font-semibold text-white">
                        {item.name}
                      </h3>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-slate-800 border border-slate-700 text-slate-200">
                      {item.weight}% Weight
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed mt-2">
                    {item.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
                  <span>Graded on scale 0.0 - 10.0</span>
                  <span className="font-medium text-slate-400">Pillar #{idx + 1}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

