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
  color: string;
  borderHover: string;
}

const features: FeatureItem[] = [
  {
    icon: Compass,
    title: 'Intelligent Repository Discovery',
    description:
      'Automatically catalogs public repositories from any developer profile, filtering out empty repos, forks, and trivial assignments.',
    color: 'from-blue-500/20 to-cyan-500/10 text-blue-400',
    borderHover: 'group-hover:border-blue-500/40',
  },
  {
    icon: Trophy,
    title: 'Top 3 Project Identification',
    description:
      'Surfaces the three most sophisticated engineering accomplishments using commit longevity, architectural density, and feature depth.',
    color: 'from-purple-500/20 to-pink-500/10 text-purple-400',
    borderHover: 'group-hover:border-purple-500/40',
  },
  {
    icon: Cpu,
    title: 'Technology Stack Detection',
    description:
      'Detects frameworks, libraries, persistence engines, containerization, and toolchains directly from manifest and lockfiles.',
    color: 'from-indigo-500/20 to-blue-500/10 text-indigo-400',
    borderHover: 'group-hover:border-indigo-500/40',
  },
  {
    icon: FileCode2,
    title: 'Source Code Analysis',
    description:
      'Parses directory trees and code structures to assess architectural separation, modularity, and clean abstraction barriers.',
    color: 'from-emerald-500/20 to-teal-500/10 text-emerald-400',
    borderHover: 'group-hover:border-emerald-500/40',
  },
  {
    icon: CheckCircle,
    title: 'Code Quality Evaluation',
    description:
      'Evaluates linting discipline, typing rigour, automated test suites, error-handling conventions, and documentation hygiene.',
    color: 'from-amber-500/20 to-yellow-500/10 text-amber-400',
    borderHover: 'group-hover:border-amber-500/40',
  },
  {
    icon: Sparkles,
    title: 'AI-Assisted Project Insights',
    description:
      'Synthesizes explainable technical summaries highlighting specific algorithmic highlights, engineering trade-offs, and design patterns.',
    color: 'from-purple-500/20 to-violet-500/10 text-purple-400',
    borderHover: 'group-hover:border-purple-500/40',
  },
  {
    icon: FileText,
    title: 'Detailed Evaluation Reports',
    description:
      'Generates comprehensive rubrics, strengths, weaknesses, and concrete recommendations tailored for project reviews.',
    color: 'from-cyan-500/20 to-blue-500/10 text-cyan-400',
    borderHover: 'group-hover:border-cyan-500/40',
  },
  {
    icon: GraduationCap,
    title: 'Faculty-Friendly Assessment',
    description:
      'Purpose-built for computer science professors, academic evaluators, and project coordinators to conduct fast, objective grading.',
    color: 'from-rose-500/20 to-orange-500/10 text-rose-400',
    borderHover: 'group-hover:border-rose-500/40',
  },
];

export const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <Badge variant="primary">Planned Platform Capabilities</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
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
                className={`group relative p-6 rounded-2xl bg-[#0F172A]/70 border border-slate-800/80 hover:bg-[#151D30] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40 ${feature.borderHover}`}
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${feature.color} flex items-center justify-center mb-5 border border-slate-700/40`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-100 group-hover:text-white transition-colors mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

