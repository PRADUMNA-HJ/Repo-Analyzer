import React, { useState, useEffect } from 'react';
import { DetailedProjectAnalysis } from '../../types';
import { formatScore, getScoreColor } from '../../lib/utils';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  ExternalLink,
  Layers,
  Trophy,
  PieChart,
  ShieldAlert,
  Binary,
  FileCode,
} from 'lucide-react';

interface ProjectDetailModalProps {
  project: DetailedProjectAnalysis | null;
  onClose: () => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({ project, onClose }) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'evaluation' | 'architecture' | 'quality' | 'security' | 'evidence'
  >('overview');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!project) return null;

  const scoreColors = getScoreColor(project.overall_score);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 lg:p-8 animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-[#0D1322] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden max-h-[94vh] flex flex-col">
        {/* Modal Top Header */}
        <div className="px-6 py-4 bg-[#0B0F19] border-b border-slate-800 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center space-x-3">
            <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5" />
              Rank #{project.rank}
            </span>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                {project.display_name}
              </h2>
              <div className="flex items-center gap-2 text-xs font-mono text-purple-300">
                <span>{project.name}</span>
                <span>•</span>
                <span>{project.primary_language}</span>
                {project.confidence_label && (
                  <>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold">{project.confidence_label} Confidence</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div
              className={`flex items-baseline space-x-1 px-3 py-1.5 rounded-xl border ${scoreColors.bg} ${scoreColors.border}`}
            >
              <span className={`text-xl font-extrabold ${scoreColors.text}`}>
                {formatScore(project.overall_score)}
              </span>
              <span className="text-xs text-slate-400">/ 10</span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
              aria-label="Close project modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="px-6 bg-[#0E1527] border-b border-slate-800 flex space-x-1 shrink-0 overflow-x-auto">
          {[
            { id: 'overview', label: '1. Overview & Purpose' },
            { id: 'evaluation', label: '2. 8-Pillar Scoring' },
            { id: 'architecture', label: '3. Architecture & Tech' },
            { id: 'quality', label: '4. Code Quality & Complexity' },
            { id: 'security', label: '5. Security & Reliability' },
            { id: 'evidence', label: '6. Evidence & Recommendations' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-3.5 py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-300">
          {/* TAB 1: OVERVIEW & PURPOSE */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Executive Summary */}
              <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  Executive Technical Summary
                </span>
                <p className="text-sm leading-relaxed text-slate-200">
                  {project.summary}
                </p>
              </div>

              {/* Problem Solved */}
              <div className="space-y-2">
                <h4 className="text-xs uppercase font-semibold tracking-wider text-slate-400">
                  Problem Statement & Purpose
                </h4>
                <div className="p-4 rounded-xl bg-[#111827] border border-slate-800 text-sm text-slate-300 leading-relaxed">
                  {project.problem_solved}
                </div>
              </div>

              {/* Key Features */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase font-semibold tracking-wider text-slate-400">
                  Main Verified Features
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {project.key_features.map((feat, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-[#111827] border border-slate-800 text-xs sm:text-sm text-slate-300 flex items-start space-x-2.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ranking Rationale */}
              {project.ranking_rationale && (
                <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 text-xs text-purple-200 space-y-1">
                  <span className="font-semibold text-purple-300 block">Ranking Rationale:</span>
                  <p>{project.ranking_rationale}</p>
                </div>
              )}

              {/* Repository Link */}
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                <span>Repository URL: {project.repo_url}</span>
                <a
                  href={project.repo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-purple-400 hover:text-white"
                >
                  <span>Open GitHub</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {/* TAB 2: 8-PILLAR EVALUATION & SCORING */}
          {activeTab === 'evaluation' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Deterministic 8-Pillar Evaluation (Sum = 100%)</span>
                <span className="font-mono text-purple-400 font-bold">
                  Final Rating: {formatScore(project.overall_score)} / 10.0
                </span>
              </div>

              <div className="space-y-4">
                {project.criteria_breakdown.map((criterion, idx) => {
                  const critColor = getScoreColor(criterion.score);
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-[#111827] border border-slate-800 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-semibold text-white">
                            {criterion.name}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                            {criterion.weight}% Weight
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-slate-400 font-medium">
                            {criterion.rating_label}
                          </span>
                          <span
                            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${critColor.bg} ${critColor.text} border ${critColor.border}`}
                          >
                            {formatScore(criterion.score)} / 10
                          </span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          style={{ width: `${(criterion.score / 10) * 100}%` }}
                          className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                        />
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed">
                        {criterion.description}
                      </p>

                      {/* Findings list */}
                      {criterion.findings.length > 0 && (
                        <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                          {criterion.findings.map((f, fIdx) => (
                            <div key={fIdx} className="flex items-start space-x-2 text-xs text-slate-300">
                              <span className="text-purple-400 mt-0.5">•</span>
                              <span>{f}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: ARCHITECTURE & TECH STACK */}
          {activeTab === 'architecture' && (
            <div className="space-y-6">
              {/* Architecture Review */}
              <div className="p-5 rounded-xl bg-[#111827] border border-slate-800 space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-400" />
                  Software Architectural Design Notes
                </span>
                <p className="text-sm leading-relaxed text-slate-300">
                  {project.architecture_notes}
                </p>
              </div>

              {/* Language Distribution Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <PieChart className="w-4 h-4 text-indigo-400" />
                  Calculated Programming Language Distribution (GitHub API Bytes)
                </h4>
                <div className="h-4 w-full rounded-full bg-slate-800 overflow-hidden flex shadow-inner">
                  {project.language_breakdown.map((lang, idx) => (
                    <div
                      key={idx}
                      style={{ width: `${lang.percentage}%`, backgroundColor: lang.color }}
                      className="h-full transition-all"
                      title={`${lang.name}: ${lang.percentage}%`}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {project.language_breakdown.map((lang, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#111827] border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <span className="flex items-center gap-1.5 font-medium text-slate-300">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: lang.color }}
                        />
                        {lang.name}
                      </span>
                      <span className="font-mono text-slate-400">{lang.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grouped Technology Stack */}
              <div className="space-y-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Categorized Technology Stack
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.tech_stack.map((cat, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-[#111827] border border-slate-800 space-y-2.5"
                    >
                      <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        {cat.category}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {cat.items.map((item, iIdx) => (
                          <span
                            key={iIdx}
                            className="px-2.5 py-1 rounded-md text-xs bg-slate-900 border border-slate-700/80 text-purple-300 font-medium"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CODE QUALITY & COMPLEXITY */}
          {activeTab === 'quality' && (
            <div className="space-y-6">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Binary className="w-4 h-4 text-purple-400" />
                AST Complexity & Structural Metrics
              </h4>

              {project.complexity_metrics ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-[#111827] border border-slate-800">
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 block mb-1">
                      Cyclomatic Complexity (Avg)
                    </span>
                    <span className="text-2xl font-extrabold text-white font-mono">
                      {project.complexity_metrics.cyclomatic_complexity_avg ?? 'N/A'}
                    </span>
                    <span className="text-xs text-slate-500 block mt-1">
                      Target: &lt; 5.0 for clean code
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#111827] border border-slate-800">
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 block mb-1">
                      Maintainability Index
                    </span>
                    <span className="text-2xl font-extrabold text-emerald-400 font-mono">
                      {project.complexity_metrics.maintainability_index ?? 'N/A'}/100
                    </span>
                    <span className="text-xs text-slate-500 block mt-1">
                      Estimated code maintainability
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#111827] border border-slate-800">
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 block mb-1">
                      Functions &amp; Classes
                    </span>
                    <span className="text-xl font-bold text-slate-200 font-mono">
                      {project.complexity_metrics.total_functions} fn / {project.complexity_metrics.total_classes} cls
                    </span>
                    <span className="text-xs text-slate-500 block mt-1">
                      {project.complexity_metrics.high_complexity_functions_count} high complexity
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400">Complexity indicators unavailable for this repository.</p>
              )}

              {project.complexity_metrics?.notes && (
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400">
                  {project.complexity_metrics.notes}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: SECURITY & TESTING */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Security Findings */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  Static Security Scan Findings (Redacted)
                </h4>

                {project.security_findings && project.security_findings.length > 0 ? (
                  <div className="space-y-3">
                    {project.security_findings.map((finding, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-rose-300 uppercase tracking-wide">
                            [{finding.severity}] {finding.category}
                          </span>
                          <span className="font-mono text-slate-400">
                            {finding.file_path}:{finding.line_number ?? '1'}
                          </span>
                        </div>
                        <p className="text-slate-300">{finding.explanation}</p>
                        {finding.evidence_snippet && (
                          <div className="p-2 rounded bg-slate-950 font-mono text-[11px] text-amber-300 border border-slate-800">
                            Snippet: {finding.evidence_snippet}
                          </div>
                        )}
                        <p className="text-emerald-400 text-[11px]">
                          Fix: {finding.remediation}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>No hardcoded credentials, secret assignments, or dangerous execution calls detected.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: EVIDENCE & RECOMMENDATIONS */}
          {activeTab === 'evidence' && (
            <div className="space-y-6">
              {/* Strengths */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Engineering Strengths
                </h4>
                <div className="space-y-2">
                  {project.strengths.map((str, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-emerald-950/15 border border-emerald-500/20 text-xs text-emerald-200 flex items-start space-x-2"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{str}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weaknesses */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  Identified Areas for Improvement
                </h4>
                <div className="space-y-2">
                  {project.weaknesses.map((weak, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-rose-950/15 border border-rose-500/20 text-xs text-rose-200 flex items-start space-x-2"
                    >
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                      <span>{weak}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actionable Recommendations */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  Actionable Recommendations for Reviewers & Students
                </h4>
                <div className="space-y-2">
                  {project.recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-amber-950/15 border border-amber-500/20 text-xs text-amber-200 flex items-start space-x-2"
                    >
                      <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inspected Evidence Files */}
              {project.evidence_files && project.evidence_files.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <FileCode className="w-4 h-4 text-blue-400" />
                    Inspected Evidence File References ({project.evidence_files.length} files)
                  </h4>
                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                    {project.evidence_files.map((file, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono flex items-center justify-between text-slate-400"
                      >
                        <span className="text-slate-300">{file.path}</span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-purple-400 text-[10px] uppercase">
                          {file.category}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="px-6 py-4 bg-[#0B0F19] border-t border-slate-800 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>RepoScope Evidence-Based Project Evaluation</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
