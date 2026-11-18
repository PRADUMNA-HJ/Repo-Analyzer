import React from 'react';
import {
  Compass,
  Trophy,
  Cpu,
  FileCode2,
  CheckCircle,
  Sparkles,
  FileText,
  GraduationCap,
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface FeatureItem {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  gradient: string;
  borderHover: string;
  badge: string;
}

const features: FeatureItem[] = [
  {
    icon: Compass,
    title: 'Intelligent Repository Discovery',
    description:
      'Automatically catalogs public repositories from any developer profile, filtering out empty repos, forks, and trivial assignments.',
    gradient: 'from-[#3B82F6] to-[#22D3EE]',
    borderHover: 'group-hover:border-blue-500/50',
    badge: 'Discovery Engine',
  },
  {
    icon: Trophy,
    title: 'Top 3 Project Identification',
    description:
      'Surfaces the three most sophisticated engineering accomplishments using commit longevity, architectural density, and feature depth.',
    gradient: 'from-[#F59E0B] to-[#EC4899]',
    borderHover: 'group-hover:border-pink-500/50',
    badge: 'Showcase Ranking',
  },
  {
    icon: Cpu,
    title: 'Technology Stack Detection',
    description:
      'Detects frameworks, libraries, persistence engines, containerization, and toolchains directly from manifest and lockfiles.',
    gradient: 'from-[#8B5CF6] to-[#3B82F6]',
    borderHover: 'group-hover:border-purple-500/50',
    badge: 'Manifest Inspection',
  },
  {
    icon: FileCode2,
    title: 'Source Code Analysis',
    description:
      'Parses directory trees and code structures to assess architectural separation, modularity, and clean abstraction barriers.',
    gradient: 'from-[#10B981] to-[#22D3EE]',
    borderHover: 'group-hover:border-emerald-500/50',
    badge: 'AST & Parsing',
  },
  {
    icon: CheckCircle,
    title: 'Code Quality Evaluation',
    description:
      'Evaluates linting discipline, typing rigour, automated test suites, error-handling conventions, and documentation hygiene.',
    gradient: 'from-[#EC4899] to-[#8B5CF6]',
    borderHover: 'group-hover:border-pink-500/50',
    badge: 'Static Analysis',
  },
  {
    icon: Sparkles,
    title: 'AI-Assisted Project Insights',
    description:
      'Synthesizes explainable technical summaries highlighting specific algorithmic highlights, engineering trade-offs, and design patterns.',
    gradient: 'from-[#22D3EE] to-[#3B82F6]',
    borderHover: 'group-hover:border-cyan-500/50',
    badge: 'Explainable AI',
  },
  {
    icon: FileText,
    title: 'Detailed Evaluation Reports',
    description:
      'Generates comprehensive rubrics, strengths, weaknesses, and concrete recommendations tailored for project reviews.',
    gradient: 'from-[#8B5CF6] to-[#EC4899]',
    borderHover: 'group-hover:border-purple-500/50',
    badge: 'Academic Dossiers',
  },
  {
    icon: GraduationCap,
    title: 'Faculty-Friendly Assessment',
    description:
      'Purpose-built for computer science professors, academic evaluators, and project coordinators to conduct fast, objective grading.',
    gradient: 'from-[#F59E0B] to-[#10B981]',
    borderHover: 'group-hover:border-amber-500/50',
    badge: 'Institutional Portal',
  },
];

export const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="py-24 relative overflow-hidden bg-[#080B16]">
      {/* Background ambient light */}
      <div className="absolute top-1/2 right-1/4 w-[600px] h-[400px] bg-gradient-to-r from-purple-600/10 to-blue-600/10 blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <Badge variant="primary">Planned Platform Capabilities</Badge>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Built for rigorous project evaluation
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Engineered to replace subjective impressions with structured, evidence-based code intelligence and transparent rubrics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className={`group p-6 rounded-2xl bg-[#151D33]/80 border border-white/5 hover:bg-[#1A2440] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-950/20 flex flex-col justify-between ${feature.borderHover}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${feature.gradient} p-0.5 shadow-md group-hover:scale-105 transition-transform`}>
                      <div className="w-full h-full bg-[#151D33] rounded-[10px] flex items-center justify-center">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#080B16] border border-white/5 text-slate-400">
                      {feature.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-white/5 flex items-center text-[11px] font-mono text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Inspected Evidence &rarr;</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
