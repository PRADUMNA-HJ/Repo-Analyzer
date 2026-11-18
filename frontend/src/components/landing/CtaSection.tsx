import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Terminal, ShieldCheck } from 'lucide-react';

export const CtaSection: React.FC = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-[#080B16]">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-[#8B5CF6]/20 via-[#3B82F6]/20 to-[#22D3EE]/20 blur-[130px] pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl p-8 sm:p-14 bg-gradient-to-b from-[#151D33] to-[#101629] border border-purple-500/30 shadow-2xl shadow-purple-950/40 text-center space-y-6">
          {/* Subtle inner highlight */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 text-[11px] font-bold tracking-wider uppercase text-[#080B16] shadow-lg">
            INSTANT REPOSITORY INTELLIGENCE
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Interactive Analysis Workspace</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Ready to understand what&apos;s inside a repository?
          </h2>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Experience the RepoScope project intelligence workflow. Inspect architectural structures,
            detect dependencies, and evaluate engineering execution with full explainability.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/analyze"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-8 py-4 rounded-xl text-base font-bold text-white bg-gradient-to-r from-[#8B5CF6] via-[#6366F1] to-[#3B82F6] hover:from-[#7C3AED] hover:to-[#2563EB] shadow-xl shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Terminal className="w-4 h-4" />
              <span>Start Analyzing</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/history"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-7 py-4 rounded-xl text-base font-semibold text-slate-200 bg-[#151D33] hover:bg-[#1E2942] border border-white/10 hover:border-purple-500/40 hover:text-white transition-all shadow-md"
            >
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Faculty Evaluation Dossiers</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
