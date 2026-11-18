import React from 'react';
import { ShieldCheck, Trophy, Cpu, Lock } from 'lucide-react';

export const PlatformStats: React.FC = () => {
  const stats = [
    {
      value: '8',
      unit: 'Pillars',
      label: 'Deterministic Rubric',
      detail: '100% weighted architectural and static AST criteria',
      icon: Cpu,
      gradient: 'from-[#8B5CF6] to-[#3B82F6]',
      glow: 'shadow-neon-purple',
      badge: 'Academic Standard',
    },
    {
      value: 'Top 3',
      unit: 'Showcase',
      label: 'Ranked Projects Selected',
      detail: 'Surfacing genuine engineering depth over vanity repos',
      icon: Trophy,
      gradient: 'from-[#F59E0B] to-[#EC4899]',
      glow: 'shadow-neon-pink',
      badge: 'Curated Excellence',
    },
    {
      value: '100%',
      unit: 'Evidence',
      label: 'Explainable Score Ratings',
      detail: 'Direct source-code findings, zero hallucinated ratings',
      icon: ShieldCheck,
      gradient: 'from-[#22D3EE] to-[#3B82F6]',
      glow: 'shadow-neon-cyan',
      badge: 'Audit Verified',
    },
    {
      value: '0',
      unit: 'Code Execution',
      label: 'Safe AST & Regex Auditing',
      detail: 'Zero arbitrary remote execution risk for university systems',
      icon: Lock,
      gradient: 'from-[#10B981] to-[#22D3EE]',
      glow: 'shadow-neon-blue',
      badge: 'Zero RCE Risk',
    },
  ];

  return (
    <section className="py-12 relative z-10 border-y border-white/5 bg-[#101629]/60 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="relative group p-6 rounded-2xl bg-[#151D33]/70 border border-white/5 hover:border-purple-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-900/20 flex flex-col justify-between"
              >
                {/* Ambient glow on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-[#080B16] border border-white/10 text-slate-400">
                      {item.badge}
                    </span>
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${item.gradient} p-0.5 shadow-md`}>
                      <div className="w-full h-full bg-[#151D33] rounded-[10px] flex items-center justify-center">
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-2 mb-1">
                    <span className={`text-3xl sm:text-4xl font-black bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent font-mono tracking-tight`}>
                      {item.value}
                    </span>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {item.unit}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white mb-1.5">
                    {item.label}
                  </h3>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed pt-3 border-t border-white/5">
                  {item.detail}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
