import React from 'react';
import { XCircle, CheckCircle2, ShieldCheck, Flame, GitCommit, FileCode2, Terminal, AlertTriangle } from 'lucide-react';

export const ProblemVsSolution: React.FC = () => {
  const problems = [
    {
      title: 'Superficial Star Counts',
      desc: 'Popularity contests and bought stars do not reflect architectural quality or engineering rigour.',
      icon: Flame,
    },
    {
      title: 'Unverified Forked Repositories',
      desc: 'Students often showcase cloned templates or homework boilerplates without meaningful personal contribution.',
      icon: AlertTriangle,
    },
    {
      title: 'Vanity Commit Streaks',
      desc: 'Green GitHub contribution graphs can be trivially inflated with automated scripts and single-line README commits.',
      icon: GitCommit,
    },
    {
      title: 'Arbitrary Hallucinated AI Scores',
      desc: 'Generic LLMs guess ratings without inspecting actual AST trees, cyclomatic complexity, or security leaks.',
      icon: XCircle,
    },
  ];

  const solutions = [
    {
      title: 'Deterministic 8-Pillar Scoring',
      desc: 'Rigorous 100% weighted evaluation across code quality, architecture, testing, and documentation.',
      icon: ShieldCheck,
    },
    {
      title: 'Automated Fork & Noise Filtering',
      desc: 'Filters out scratchpads, empty repositories, homework stubs, and unaltered template clones.',
      icon: CheckCircle2,
    },
    {
      title: 'Deep AST Static Analysis',
      desc: 'Inspects Python ASTs, TypeScript types, function sizes, modular separation, and dependency manifests.',
      icon: FileCode2,
    },
    {
      title: 'Secret Leak Auditing & Redaction',
      desc: 'Scans for hardcoded API keys, JWT tokens, and credentials with automatic regex pattern redaction.',
      icon: Terminal,
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden bg-[#080B16]">
      {/* Background radial gradients */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-rose-600/10 blur-[130px] pointer-events-none -z-10" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-emerald-600/10 blur-[130px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#151D33] border border-white/10 text-xs font-semibold text-purple-300">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>The Academic Evaluation Dilemma</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Traditional Vanity Metrics vs.{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              RepoScope Intelligence
            </span>
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Why evaluating computer science engineering candidates using basic GitHub profiles fails, and how RepoScope solves it.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Traditional Way (Problem Card) */}
          <div className="rounded-3xl p-8 sm:p-10 bg-[#101629]/90 border border-rose-500/20 shadow-2xl relative flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-rose-500/20">
                <div>
                  <span className="text-xs uppercase font-bold tracking-wider text-rose-400 font-mono">
                    The Flawed Baseline
                  </span>
                  <h3 className="text-2xl font-bold text-white mt-1">
                    Traditional GitHub Evaluation
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-rose-400" />
                </div>
              </div>

              <div className="space-y-5">
                {problems.map((prob, idx) => {
                  const Icon = prob.icon;
                  return (
                    <div key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-[#151D33]/60 border border-white/5">
                      <div className="p-2 rounded-lg bg-rose-500/10 shrink-0 text-rose-400 mt-0.5">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-rose-200">
                          {prob.title}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          {prob.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-rose-500/20 flex items-center gap-2 text-xs font-mono text-rose-300">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span>Result: Subjective impressions, unverified claims, and academic fraud risks.</span>
            </div>
          </div>

          {/* RepoScope Way (Solution Card) */}
          <div className="rounded-3xl p-8 sm:p-10 bg-[#151D33]/90 border border-emerald-500/30 shadow-2xl relative flex flex-col justify-between glow-border-cyan">
            {/* Top gradient badge */}
            <div className="absolute -top-3 right-8 px-4 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-xs font-bold text-[#080B16] shadow-lg">
              EVIDENCE-BASED STANDARD
            </div>

            <div>
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-emerald-500/20">
                <div>
                  <span className="text-xs uppercase font-bold tracking-wider text-emerald-400 font-mono">
                    The Modern Standard
                  </span>
                  <h3 className="text-2xl font-bold text-white mt-1">
                    RepoScope Project Intelligence
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
              </div>

              <div className="space-y-5">
                {solutions.map((sol, idx) => {
                  const Icon = sol.icon;
                  return (
                    <div key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-[#101629]/90 border border-emerald-500/20">
                      <div className="p-2 rounded-lg bg-emerald-500/10 shrink-0 text-emerald-400 mt-0.5">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-emerald-300">
                          {sol.title}
                        </h4>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                          {sol.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-emerald-500/20 flex items-center gap-2 text-xs font-mono text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Result: Objective, reproducible, faculty-grade evaluation dossiers with explainable scores out of 10.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
