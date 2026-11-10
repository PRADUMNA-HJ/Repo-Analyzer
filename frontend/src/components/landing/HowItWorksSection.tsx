import React from 'react';
import { Search, Binary, BarChart3 } from 'lucide-react';
import { Badge } from '../common/Badge';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      number: '01',
      title: 'Enter GitHub URL',
      subtitle: 'STEP 1 — Enter GitHub URL',
      description: 'Provide a GitHub profile or repository URL.',
      details: 'Accepts both user profiles (e.g. github.com/username) and individual repositories for granular inspection.',
      icon: Search,
      accent: 'from-blue-500 to-indigo-500',
      badge: 'Input Phase',
    },
    {
      number: '02',
      title: 'Analyze Projects',
      subtitle: 'STEP 2 — Analyze Projects',
      description:
        'RepoScope examines repository structure, technologies, source code and engineering indicators.',
      details:
        'Analyzes directory modularity, language percentages, automated tests, security hygiene, and commit patterns.',
      icon: Binary,
      accent: 'from-purple-500 to-indigo-500',
      badge: 'Evaluation Engine',
    },
    {
      number: '03',
      title: 'Discover Project Insights',
      subtitle: 'STEP 3 — Discover Project Insights',
      description:
        'Review the strongest projects, detailed assessments and evidence-based scores.',
      details:
        'Receive an explainable score out of 10, strengths, weaknesses, and concrete recommendations.',
      icon: BarChart3,
      accent: 'from-emerald-500 to-teal-500',
      badge: 'Intelligence Report',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-[#0F172A]/40 border-y border-slate-800/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-20">
          <Badge variant="primary">Workflow Architecture</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            How RepoScope Works
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            A three-step analytical pipeline translating raw repository trees into actionable engineering intelligence.
          </p>
        </div>

        {/* Timeline Desktop & Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-1/2 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-emerald-500/30 -translate-y-8 pointer-events-none z-0" />

          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="relative z-10 flex flex-col p-8 rounded-2xl bg-[#0B0F19]/90 border border-slate-800 hover:border-slate-700 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-950/20 group"
              >
                {/* Step badge & number */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-mono font-bold tracking-wider uppercase px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400">
                    {step.badge}
                  </span>
                  <span className="text-4xl font-extrabold font-mono text-slate-800 group-hover:text-slate-700 transition-colors">
                    {step.number}
                  </span>
                </div>

                {/* Step icon */}
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${step.accent} p-0.5 mb-6 shadow-lg shadow-indigo-950/40`}
                >
                  <div className="w-full h-full bg-[#0B0F19] rounded-[14px] flex items-center justify-center">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                </div>

                {/* Subtitle & Title */}
                <h4 className="text-xs font-semibold uppercase tracking-wider text-purple-400 mb-1">
                  {step.subtitle}
                </h4>
                <h3 className="text-xl font-bold text-white mb-3">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-slate-300 font-medium text-sm leading-relaxed mb-2">
                  &ldquo;{step.description}&rdquo;
                </p>
                <p className="text-xs text-slate-400 leading-relaxed mt-auto pt-4 border-t border-slate-800/80">
                  {step.details}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
