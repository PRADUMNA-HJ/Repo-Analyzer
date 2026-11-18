import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, Github, Terminal, Sparkles, Shield, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/5 bg-[#080B16] text-slate-400 relative overflow-hidden">
      {/* Background glow subtle effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-24 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-cyan-600/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#8B5CF6] via-[#3B82F6] to-[#22D3EE] p-[2px] shadow-md shadow-purple-500/25">
                <div className="w-full h-full bg-[#080B16] rounded-[10px] flex items-center justify-center">
                  <Layers className="w-5 h-5 text-purple-400 group-hover:text-cyan-300 transition-colors" />
                </div>
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                RepoScope
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Understand the code. Evaluate the engineering. Discover the best projects.
              An intelligence and project evaluation platform designed for technical reviewers, faculty, and engineering recruiters.
            </p>
            <div className="flex items-center space-x-3 text-xs text-slate-400 pt-2 flex-wrap gap-y-2">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#101629] border border-white/5 font-mono text-[11px]">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                FastAPI + React 18 Monorepo
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#101629] border border-white/5 font-mono text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                Phase 1 Modern SaaS Edition
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Platform Navigation
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-cyan-300 transition-colors">
                  Overview
                </Link>
              </li>
              <li>
                <Link to="/analyze" className="hover:text-purple-400 transition-colors">
                  Project Analyzer
                </Link>
              </li>
              <li>
                <Link to="/history" className="hover:text-cyan-300 transition-colors">
                  Evaluation History
                </Link>
              </li>
              <li>
                <a href="#features" className="hover:text-purple-400 transition-colors">
                  Features & Capabilities
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-cyan-300 transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#evaluation-criteria" className="hover:text-purple-400 transition-colors">
                  Evaluation Framework
                </a>
              </li>
            </ul>
          </div>

          {/* Architecture & Engineering Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Engineering & Minor Project
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-1.5 text-slate-300">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Evidence-based Scoring</span>
              </li>
              <li className="text-slate-400">
                Computer Science & Engineering
              </li>
              <li className="text-slate-400">
                Academic Minor Project
              </li>
              <li className="pt-2">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  <Github className="w-4 h-4" />
                  <span>GitHub Repository</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} RepoScope Intelligence Platform. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for academic excellence
          </p>
        </div>
      </div>
    </footer>
  );
};
