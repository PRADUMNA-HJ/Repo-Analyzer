import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, ShieldCheck, Terminal, Code2, CheckCircle2, Star } from 'lucide-react';
import { Badge } from '../common/Badge';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
      {/* Background radial gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-purple-600/15 via-indigo-600/10 to-blue-600/15 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute -top-20 right-10 w-80 h-80 bg-blue-500/10 blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          {/* Phase 1 Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs text-slate-300 shadow-sm backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
            <span className="font-medium text-slate-200">RepoScope Platform Foundation</span>
            <span className="text-slate-500">|</span>
            <span className="text-purple-400 font-mono text-[11px]">Academic Minor Project</span>
          </div>

          {/* Main Heading */}
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
              Go Beyond{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-blue-400">
                GitHub Repositories.
              </span>
            </h1>
            <p className="text-2xl sm:text-3xl font-semibold text-slate-300 tracking-tight">
              Discover the engineering behind every project.
            </p>
          </div>

          {/* Description */}
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Analyze GitHub repositories, uncover the strongest projects, inspect technologies and code quality,
            and generate detailed engineering evaluation reports — all in one place.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/analyze"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-7 py-3.5 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-xl shadow-indigo-600/25 hover:shadow-indigo-600/40 transition-all transform hover:-translate-y-0.5"
            >
              <Search className="w-4 h-4" />
              <span>Analyze a GitHub Profile</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl text-base font-medium text-slate-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 hover:text-white transition-all"
            >
              <span>Explore How It Works</span>
            </a>
          </div>

          {/* Trust points */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Evidence-based evaluation
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-400" />
              8-pillar engineering rubric
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-purple-400" />
              Explainable scores out of 10
            </span>
          </div>
        </div>

        {/* Dashboard Preview Graphic */}
        <div className="mt-14 max-w-5xl mx-auto">
          <div className="relative rounded-2xl p-1 bg-gradient-to-b from-slate-700/60 via-slate-800/40 to-slate-900/80 shadow-2xl shadow-purple-950/20 border border-slate-700/50 backdrop-blur-xl">
            {/* Window Top Bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#0B0F19]/90 rounded-t-xl border-b border-slate-800/80">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs font-mono text-slate-400 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-slate-500" />
                  reposcope-engine ~ inspect octocat/campus-event-mgmt
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="demo" size="sm">
                  Interactive Preview
                </Badge>
              </div>
            </div>

            {/* Dashboard Mock Body */}
            <div className="bg-[#0D1322] p-5 sm:p-7 rounded-b-xl space-y-6">
              {/* Top row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Score Card */}
                <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-xs uppercase font-medium tracking-wider text-slate-400">
                      Overall Engineering Score
                    </span>
                    <div className="flex items-baseline space-x-2 mt-1">
                      <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300">
                        9.1
                      </span>
                      <span className="text-slate-500 text-sm">/ 10.0</span>
                    </div>
                    <span className="inline-block mt-2 text-xs text-emerald-400 font-medium">
                      Top 5% Collegiate Architecture
                    </span>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                    <ShieldCheck className="w-8 h-8 text-emerald-400" />
                  </div>
                </div>

                {/* Rank & Discovered Count */}
                <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-xs uppercase font-medium tracking-wider text-slate-400">
                      Project Standing
                    </span>
                    <div className="flex items-baseline space-x-2 mt-1">
                      <span className="text-3xl font-extrabold text-white">#1</span>
                      <span className="text-slate-400 text-sm">of 14 Repositories</span>
                    </div>
                    <span className="inline-block mt-2 text-xs text-purple-400 font-medium">
                      Primary Showcase Candidate
                    </span>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                    <Star className="w-8 h-8 text-purple-400" />
                  </div>
                </div>

                {/* Tech Highlights */}
                <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800/80 flex flex-col justify-between">
                  <div>
                    <span className="text-xs uppercase font-medium tracking-wider text-slate-400">
                      Detected Architecture
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className="px-2 py-0.5 rounded text-[11px] bg-blue-500/10 text-blue-400 border border-blue-500/30">
                        React 18
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] bg-purple-500/10 text-purple-400 border border-purple-500/30">
                        FastAPI
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        PostgreSQL
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                        Docker
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] bg-rose-500/10 text-rose-400 border border-rose-500/30">
                        Redis
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-2">
                    89% automated test suite coverage
                  </span>
                </div>
              </div>

              {/* Language Breakdown Bar */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/70 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-medium flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                    Language Distribution
                  </span>
                  <span>100% Calculated</span>
                </div>
                <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden flex">
                  <div style={{ width: '46.5%' }} className="bg-[#3178C6] h-full" title="TypeScript 46.5%" />
                  <div style={{ width: '38.2%' }} className="bg-[#3572A5] h-full" title="Python 38.2%" />
                  <div style={{ width: '8.5%' }} className="bg-[#E38C00] h-full" title="SQL 8.5%" />
                  <div style={{ width: '6.8%' }} className="bg-[#563D7C] h-full" title="CSS 6.8%" />
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-slate-400 pt-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#3178C6]" />
                    TypeScript 46.5%
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#3572A5]" />
                    Python 38.2%
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E38C00]" />
                    SQL 8.5%
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#563D7C]" />
                    CSS 6.8%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
