import React from 'react';
import { Search, Binary, BarChart3, ArrowRight, Sparkles } from 'lucide-react';
import { Badge } from '../common/Badge';
import { Link } from 'react-router-dom';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      number: '01',
      title: 'Enter GitHub URL',
      subtitle: 'STEP 1 — Enter GitHub URL',
      description: 'Provide a GitHub profile or repository URL.',
      details: 'Accepts both user profiles (e.g. github.com/username) to catalog all repositories or individual project repositories for deep single-repo inspection.',
      icon: Search,
      accent: 'from-[#8B5CF6] to-[#3B82F6]',
      borderHover: 'group-hover:border-purple-500/50',
      badge: 'Input Phase',
      pills: ['Profile Discovery', 'Direct Repo URL', 'Validation Gate'],
    },
    {
      number: '02',
      title: 'Analyze Projects',
      subtitle: 'STEP 2 — Analyze Projects',
      description: 'RepoScope examines repository structure, technologies, source code and engineering indicators.',
      details: 'Clones shallow git trees safely without remote code execution, parses Python ASTs, scans TypeScript definitions, and audits secret leaks with regex redactors.',
      icon: Binary,
      accent: 'from-[#3B82F6] to-[#22D3EE]',
      borderHover: 'group-hover:border-blue-500/50',
      badge: 'Evaluation Engine',
      pills: ['AST Parsing', 'Tech Manifests', 'Secret Redaction'],
    },
    {
      number: '03',
      title: 'Discover Project Insights',
      subtitle: 'STEP 3 — Discover Project Insights',
      description: 'Review the strongest projects, detailed assessments and evidence-based scores.',
      details: 'Selects the top 3 showcase projects, plots 8-pillar comparative charts, outputs explainable ratings out of 10, and generates academic PDF dossiers.',
      icon: BarChart3,
      accent: 'from-[#EC4899] to-[#8B5CF6]',
      borderHover: 'group-hover:border-pink-500/50',
      badge: 'Intelligence Report',
      pills: ['Top 3 Showcase', 'Radar Matrix', 'PDF Dossier'],
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-[#101629]/50 border-y border-white/5 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-cyan-600/10 blur-[130px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-20">
          <Badge variant="primary">Workflow Architecture</Badge>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            How RepoScope Works
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            A three-step analytical pipeline translating raw repository trees into actionable engineering intelligence.
          </p>
        </div>

        {/* Timeline Desktop & Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-1/3 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-purple-500/40 via-blue-500/40 to-pink-500/40 -translate-y-4 pointer-events-none z-0" />

          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className={`relative z-10 flex flex-col p-8 rounded-3xl bg-[#151D33]/90 border border-white/5 hover:bg-[#1A2440] transition-all duration-300 hover:shadow-2xl hover:shadow-purple-950/30 group ${step.borderHover}`}
              >
                {/* Step badge & number */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-mono font-bold tracking-wider uppercase px-3 py-1 rounded-full bg-[#080B16] border border-white/10 text-slate-300">
                    {step.badge}
                  </span>
                  <span className="text-4xl font-black font-mono bg-gradient-to-r from-slate-700 to-slate-500 group-hover:from-purple-400 group-hover:to-cyan-400 bg-clip-text text-transparent transition-all">
                    {step.number}
                  </span>
                </div>

                {/* Step icon */}
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${step.accent} p-0.5 mb-6 shadow-xl shadow-purple-950/50 group-hover:scale-105 transition-transform`}
                >
                  <div className="w-full h-full bg-[#080B16] rounded-[14px] flex items-center justify-center">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                </div>

                {/* Subtitle & Title */}
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-1 font-mono">
                  {step.subtitle}
                </h4>
                <h3 className="text-2xl font-black text-white mb-3">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-slate-200 font-medium text-sm leading-relaxed mb-3">
                  &ldquo;{step.description}&rdquo;
                </p>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                  {step.details}
                </p>

                {/* Feature Chips */}
                <div className="mt-auto pt-4 border-t border-white/5 flex flex-wrap gap-1.5">
                  {step.pills.map((pill, pIdx) => (
                    <span
                      key={pIdx}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold bg-[#080B16] border border-white/5 text-slate-300"
                    >
                      {pill}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA within How it works */}
        <div className="mt-14 text-center">
          <Link
            to="/analyze"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-[#151D33] hover:bg-[#1E2942] border border-purple-500/30 hover:border-purple-500/60 transition-all shadow-lg hover:shadow-purple-600/20"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Try The Analytical Pipeline Live</span>
            <ArrowRight className="w-4 h-4 text-purple-400" />
          </Link>
        </div>
      </div>
    </section>
  );
};
