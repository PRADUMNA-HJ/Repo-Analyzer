import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, Github, Terminal, Sparkles, Shield, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-[#0B0F19] text-slate-400 relative overflow-hidden">
      {/* Background glow subtle effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-24 bg-purple-600/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-blue-500 p-0.5 shadow-md shadow-purple-500/20">
                <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center">
                  <Layers className="w-4 h-4 text-purple-400" />
                </div>
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                RepoScope
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Understand the code. Evaluate the engineering. Discover the best projects.
              An intelligence and project evaluation platform designed for technical reviewers, faculty, and engineering recruiters.
            </p>
            <div className="flex items-center space-x-3 text-xs text-slate-500 pt-2">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800">
                <Terminal className="w-3.5 h-3.5 text-blue-400" />
                FastAPI + React Monorepo
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                Phase 1 Foundation
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
              Platform
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-purple-400 transition-colors">
                  Overview
                </Link>
              </li>
              <li>
                <Link to="/analyze" className="hover:text-purple-400 transition-colors">
                  Project Analyzer
                </Link>
              </li>
              <li>
                <a href="#features" className="hover:text-purple-400 transition-colors">
                  Features & Capabilities
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-purple-400 transition-colors">
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
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
              Engineering & Minor Project
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-1.5 text-slate-400">
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
                  <span>GitHub Repository Placeholder</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>
            © {new Date().getFullYear()} RepoScope. All rights reserved. Built as a Computer Science Engineering minor project.
          </p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for clean code evaluation.
          </p>
        </div>
      </div>
    </footer>
  );
};

