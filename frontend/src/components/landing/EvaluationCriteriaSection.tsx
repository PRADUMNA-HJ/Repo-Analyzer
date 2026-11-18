import React from 'react';
import {
  Code,
  Layers,
  Sparkles,
  Cpu,
  TestTube2,
  ShieldAlert,
  BookOpen,
  GitBranch,
  CheckCircle2,
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface CriterionItem {
  name: string;
  weight: number;
  weightLabel: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  gradient: string;
  borderGlow: string;
  metrics: string[];
}

const criteria: CriterionItem[] = [
  {
    name: 'Code Quality & Maintainability',
    weight: 20,
    weightLabel: '20% Weight',
    description: 'Clean coding idioms, cyclomatic complexity control, explicit type annotations, and linting discipline.',
    icon: Code,
    accentColor: 'text-[#8B5CF6]',
    gradient: 'from-[#8B5CF6] to-[#6366F1]',
    borderGlow: 'hover:border-[#8B5CF6]/50',
    metrics: ['Type Annotations', 'Cyclomatic Density', 'Code Duplication'],
  },
  {
    name: 'Architecture & Structure',
    weight: 15,
    weightLabel: '15% Weight',
    description: 'Modularity, logical decoupling, clean component/service layering, and minimal cyclic dependencies.',
    icon: Layers,
    accentColor: 'text-[#3B82F6]',
    gradient: 'from-[#3B82F6] to-[#22D3EE]',
    borderGlow: 'hover:border-[#3B82F6]/50',
    metrics: ['Directory Hierarchy', 'Package Decoupling', 'Separation of Concerns'],
  },
  {
    name: 'Functionality & Implementation',
    weight: 15,
    weightLabel: '15% Weight',
    description: 'Real-world problem depth, end-to-end user workflows, error handling resiliency, and business domain logic.',
    icon: Sparkles,
    accentColor: 'text-[#22D3EE]',
    gradient: 'from-[#22D3EE] to-[#10B981]',
    borderGlow: 'hover:border-[#22D3EE]/50',
    metrics: ['Feature Scope', 'Edge Case Guarding', 'Domain Depth'],
  },
  {
    name: 'Technology Usage',
    weight: 10,
    weightLabel: '10% Weight',
    description: 'Idiomatic framework adoption, modern libraries, package manifest hygiene, and containerization.',
    icon: Cpu,
    accentColor: 'text-[#EC4899]',
    gradient: 'from-[#EC4899] to-[#8B5CF6]',
    borderGlow: 'hover:border-[#EC4899]/50',
    metrics: ['Modern Toolchain', 'Dependency Freshness', 'Ecosystem Fit'],
  },
  {
    name: 'Testing & Reliability',
    weight: 10,
    weightLabel: '10% Weight',
    description: 'Unit and integration test suites, assertions density, test mocks, CI pipelines, and automated test runners.',
    icon: TestTube2,
    accentColor: 'text-[#10B981]',
    gradient: 'from-[#10B981] to-[#3B82F6]',
    borderGlow: 'hover:border-[#10B981]/50',
    metrics: ['Test Coverage', 'Assertion Density', 'CI Workflows'],
  },
  {
    name: 'Security Practices',
    weight: 10,
    weightLabel: '10% Weight',
    description: 'Secret sanitization (regex audit), SQL injection prevention, safe input validation, and credential redaction.',
    icon: ShieldAlert,
    accentColor: 'text-[#F59E0B]',
    gradient: 'from-[#F59E0B] to-[#EC4899]',
    borderGlow: 'hover:border-[#F59E0B]/50',
    metrics: ['Zero Secret Leaks', 'Input Sanitization', 'CORS & Auth Guarding'],
  },
  {
    name: 'Documentation',
    weight: 10,
    weightLabel: '10% Weight',
    description: 'README onboarding clarity, setup guides, architectural diagrams, API endpoints, and clean docstrings.',
    icon: BookOpen,
    accentColor: 'text-[#38BDF8]',
    gradient: 'from-[#38BDF8] to-[#8B5CF6]',
    borderGlow: 'hover:border-[#38BDF8]/50',
    metrics: ['Onboarding Setup', 'Architecture Diagrams', 'API Specifications'],
  },
  {
    name: 'Development Activity & Completeness',
    weight: 10,
    weightLabel: '10% Weight',
    description: 'Commit cadence, meaningful commit messages, branch hygiene, license compliance, and production readiness.',
    icon: GitBranch,
    accentColor: 'text-[#A78BFA]',
    gradient: 'from-[#A78BFA] to-[#F43F5E]',
    borderGlow: 'hover:border-[#A78BFA]/50',
    metrics: ['Commit Longevity', 'Branch Discipline', 'Project Hygiene'],
  },
];

export const EvaluationCriteriaSection: React.FC = () => {
  return (
    <section id="evaluation-criteria" className="py-24 relative overflow-hidden bg-[#080B16]">
      {/* Background radial glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-pink-600/10 blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <Badge variant="primary">Rigorous 8-Pillar Rubric</Badge>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Comprehensive Evaluation Criteria
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Eight deterministic engineering dimensions totaling 100% weight. Zero hallucinated ratings, every criterion is backed by inspected repository evidence.
          </p>
        </div>

        {/* 2x4 Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {criteria.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className={`relative group p-6 rounded-2xl bg-[#151D33]/80 border border-white/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-950/20 flex flex-col justify-between ${item.borderGlow}`}
              >
                <div>
                  {/* Top row: Icon & Weight Pill */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${item.gradient} p-0.5 shadow-md`}>
                      <div className="w-full h-full bg-[#151D33] rounded-[10px] flex items-center justify-center">
                        <Icon className={`w-6 h-6 ${item.accentColor}`} />
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#080B16] border border-white/10 text-white shadow-inner">
                      {item.weightLabel}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {item.description}
                  </p>
                </div>

                <div>
                  {/* Progress bar visual for weight */}
                  <div className="w-full bg-[#080B16] h-1.5 rounded-full overflow-hidden mb-4">
                    <div
                      style={{ width: `${item.weight * 5}%` }}
                      className={`h-full bg-gradient-to-r ${item.gradient} rounded-full`}
                    />
                  </div>

                  {/* Inspected Metric Tags */}
                  <div className="pt-3 border-t border-white/5 space-y-1.5">
                    {item.metrics.map((m, mIdx) => (
                      <div key={mIdx} className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span>{m}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
