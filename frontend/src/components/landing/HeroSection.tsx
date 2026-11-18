import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Search,
  ShieldCheck,
  Terminal,
  Code2,
  CheckCircle2,
  Star,
  Cpu,
  Layers,
  KeyRound,
} from 'lucide-react';
import { Badge } from '../common/Badge';

export const HeroSection: React.FC = () => {
  const [heroInput, setHeroInput] = useState('');
  const navigate = useNavigate();

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroInput.trim()) {
      navigate(`/analyze?url=${encodeURIComponent(heroInput.trim())}`);
    } else {
      navigate('/analyze');
    }
  };

  return (
    <section className="relative pt-8 pb-20 md:pt-16 md:pb-28 overflow-hidden bg-[#080B16]">
      {/* Dynamic ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[550px] bg-gradient-to-tr from-[#8B5CF6]/20 via-[#3B82F6]/15 to-[#22D3EE]/20 blur-[140px] pointer-events-none -z-10" />
      <div className="absolute -top-24 right-5 w-96 h-96 bg-[#EC4899]/15 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-[#3B82F6]/15 blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headline, Description & Direct Input */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Version & Platform Badge */}
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#151D33]/90 border border-purple-500/30 text-xs text-slate-200 shadow-md shadow-purple-900/20 backdrop-blur-md"
            >
              <span className="flex h-2 w-2 rounded-full bg-[#22D3EE] animate-ping" />
              <span className="font-semibold text-white">RepoScope Platform Foundation</span>
              <span className="text-slate-600">|</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 font-mono text-[11px] font-bold">
                Academic Minor Project
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-3"
            >
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08]">
                Go Beyond{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] via-[#3B82F6] to-[#22D3EE]">
                  GitHub Repositories.
                </span>
              </h1>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-200 tracking-tight">
                Discover the engineering behind every project.
              </p>
            </motion.div>

            {/* Supporting Description */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed mx-auto lg:mx-0"
            >
              Automated source code inspection, AST complexity analysis, multi-language detection, and deterministic 8-pillar scoring designed for university faculty, evaluators, and technical recruiters.
            </motion.p>

            {/* Direct Input Card in Hero */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              onSubmit={handleHeroSubmit}
              className="p-2 sm:p-2.5 rounded-2xl bg-[#151D33]/80 border border-white/10 shadow-2xl backdrop-blur-xl max-w-2xl mx-auto lg:mx-0"
            >
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="relative flex-1 w-full">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-5 h-5 text-purple-400" />
                  </div>
                  <input
                    type="text"
                    value={heroInput}
                    onChange={(e) => setHeroInput(e.target.value)}
                    placeholder="Enter GitHub Profile or Repo (e.g. https://github.com/octocat)"
                    className="w-full pl-11 pr-4 py-3.5 bg-[#080B16] border border-white/5 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500/80 font-mono transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-7 py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#8B5CF6] via-[#6366F1] to-[#3B82F6] hover:from-[#7C3AED] hover:to-[#2563EB] shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shrink-0"
                >
                  <Search className="w-4 h-4" />
                  <span>Analyze a GitHub Profile</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Sample Shortcuts */}
              <div className="pt-2 px-2 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-slate-500 font-mono text-[11px]">Quick samples:</span>
                  <button
                    type="button"
                    onClick={() => setHeroInput('https://github.com/octocat')}
                    className="text-purple-400 hover:text-purple-300 underline font-mono text-[11px] cursor-pointer"
                  >
                    octocat
                  </button>
                  <span className="text-slate-600">•</span>
                  <button
                    type="button"
                    onClick={() => setHeroInput('https://github.com/fastapi/fastapi')}
                    className="text-cyan-400 hover:text-cyan-300 underline font-mono text-[11px] cursor-pointer"
                  >
                    fastapi/fastapi
                  </button>
                  <span className="text-slate-600">•</span>
                  <button
                    type="button"
                    onClick={() => setHeroInput('https://github.com/torvalds')}
                    className="text-pink-400 hover:text-pink-300 underline font-mono text-[11px] cursor-pointer"
                  >
                    torvalds
                  </button>
                </div>
                <Link
                  to="/analyze"
                  className="hidden sm:inline-block text-[11px] text-slate-400 hover:text-white font-medium underline"
                >
                  Advanced Options &rarr;
                </Link>
              </div>
            </motion.form>

            {/* Trust points */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-xs text-slate-300"
            >
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Evidence-based evaluation
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                8-pillar engineering rubric
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                Explainable scores out of 10
              </span>
            </motion.div>
          </div>

          {/* Right Column: High-Impact Animated SaaS Dashboard Visualizer */}
          <div className="lg:col-span-5 relative">
            {/* Ambient Background Glow behind visualizer */}
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/20 to-cyan-500/20 blur-3xl rounded-3xl -z-10" />

            {/* Floating Metric 1 (Top Left) */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="hidden sm:flex absolute -top-6 -left-6 z-20 items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#151D33]/90 border border-purple-500/30 shadow-xl backdrop-blur-md"
            >
              <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400 font-mono">AST Analysis</div>
                <div className="text-xs font-bold text-white flex items-center gap-1">
                  <span>9.3 Modularity</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
              </div>
            </motion.div>

            {/* Floating Metric 2 (Bottom Right) */}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="hidden sm:flex absolute -bottom-6 -right-6 z-20 items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#151D33]/90 border border-emerald-500/30 shadow-xl backdrop-blur-md"
            >
              <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400 font-mono">Security Scan</div>
                <div className="text-xs font-bold text-white flex items-center gap-1">
                  <span>0 Leaks Detected</span>
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                </div>
              </div>
            </motion.div>

            {/* Central Dashboard Mockup Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="rounded-3xl p-1 bg-gradient-to-b from-purple-500/30 via-blue-500/20 to-cyan-500/30 shadow-2xl shadow-purple-950/40 border border-white/10 backdrop-blur-xl relative"
            >
              <div className="bg-[#101629] rounded-[22px] overflow-hidden">
                {/* Terminal Window Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-[#080B16] border-b border-white/10">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
                    <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                    <div className="w-3 h-3 rounded-full bg-[#10B981]" />
                    <span className="ml-2 text-xs font-mono text-slate-400 flex items-center gap-1.5 truncate">
                      <Terminal className="w-3.5 h-3.5 text-purple-400" />
                      reposcope-engine ~ octocat/campus-event-mgmt
                    </span>
                  </div>
                  <Badge variant="demo" size="sm">
                    Interactive Preview
                  </Badge>
                </div>

                {/* Dashboard Body Content */}
                <div className="p-5 sm:p-6 space-y-5">
                  {/* Score & Rank Header Banner */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Score Ring / Block */}
                    <div className="p-4 rounded-2xl bg-[#151D33] border border-emerald-500/30 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono block">
                          Overall Engineering Score
                        </span>
                        <div className="flex items-baseline space-x-1.5 mt-1">
                          <span className="text-3xl font-black bg-gradient-to-r from-emerald-400 to-cyan-300 bg-clip-text text-transparent">
                            9.1
                          </span>
                          <span className="text-slate-500 text-xs font-mono">/ 10.0</span>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-semibold block mt-1">
                          Top 5% Collegiate Standard
                        </span>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-6 h-6 text-emerald-400" />
                      </div>
                    </div>

                    {/* Rank Block */}
                    <div className="p-4 rounded-2xl bg-[#151D33] border border-purple-500/30 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono block">
                          Showcase Standing
                        </span>
                        <div className="flex items-baseline space-x-1 mt-1">
                          <span className="text-2xl font-black text-amber-400">#1</span>
                          <span className="text-slate-400 text-xs font-mono">of 14 Repos</span>
                        </div>
                        <span className="text-[10px] text-purple-300 font-semibold block mt-1">
                          Primary Showcase Project
                        </span>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                        <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
                      </div>
                    </div>
                  </div>

                  {/* Architecture & Tech Badges */}
                  <div className="p-4 rounded-2xl bg-[#151D33] border border-white/5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-cyan-400" />
                        Detected Architecture & Toolchain
                      </span>
                      <span className="text-[11px] text-purple-400 font-mono">Full-Stack Monorepo</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="px-2.5 py-1 rounded-lg text-[11px] bg-[#3178C6]/15 text-[#60A5FA] border border-[#3178C6]/30 font-medium">
                        React 18 + TS
                      </span>
                      <span className="px-2.5 py-1 rounded-lg text-[11px] bg-[#3572A5]/15 text-purple-300 border border-[#8B5CF6]/30 font-medium">
                        FastAPI Python
                      </span>
                      <span className="px-2.5 py-1 rounded-lg text-[11px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-medium">
                        PostgreSQL
                      </span>
                      <span className="px-2.5 py-1 rounded-lg text-[11px] bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-medium">
                        Docker
                      </span>
                    </div>
                  </div>

                  {/* Language Distribution Bar */}
                  <div className="p-4 rounded-2xl bg-[#151D33] border border-white/5 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                        Multi-Language Distribution
                      </span>
                      <span className="text-cyan-400 font-bold">100% Verified</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-[#080B16] overflow-hidden flex shadow-inner">
                      <div style={{ width: '48.5%' }} className="bg-[#3178C6] h-full" title="TypeScript 48.5%" />
                      <div style={{ width: '36.5%' }} className="bg-[#3572A5] h-full" title="Python 36.5%" />
                      <div style={{ width: '9.0%' }} className="bg-[#E38C00] h-full" title="SQL 9.0%" />
                      <div style={{ width: '6.0%' }} className="bg-[#EC4899] h-full" title="CSS 6.0%" />
                    </div>
                    <div className="flex flex-wrap gap-3 text-[11px] text-slate-400 pt-1 font-mono">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#3178C6]" />
                        TypeScript 48.5%
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#3572A5]" />
                        Python 36.5%
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#E38C00]" />
                        SQL 9.0%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
