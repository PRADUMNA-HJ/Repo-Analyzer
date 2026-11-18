import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { analysisFormSchema, AnalysisFormInput } from '../schemas/analysisSchema';
import { analyzeTarget, pollAnalysisJob, downloadDossierPdf, ApiError } from '../services/api';
import { AnalysisResponse, DetailedProjectAnalysis, AnalysisStage, AnalysisJobStatus } from '../types';
import { DemoBanner } from '../components/analyzer/DemoBanner';
import { ProfileHeader } from '../components/analyzer/ProfileHeader';
import { ProjectCard } from '../components/analyzer/ProjectCard';
import { ProjectComparisonTable } from '../components/analyzer/ProjectComparisonTable';
import { ProjectDetailModal } from '../components/analyzer/ProjectDetailModal';
import {
  Github,
  Search,
  X,
  Loader2,
  AlertCircle,
  Terminal,
  Filter,
  ChevronDown,
  ChevronUp,
  Download,
  Trophy,
  BarChart2,
} from 'lucide-react';
import { formatScore, getScoreColor } from '../lib/utils';

export const AnalyzerPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState<boolean>(false);
  const [currentStage, setCurrentStage] = useState<AnalysisStage>('INITIALIZING');
  const [progressPercent, setProgressPercent] = useState<number>(10);
  const [stageMessage, setStageMessage] = useState<string>('Validating GitHub target...');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [errorHint, setErrorHint] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<DetailedProjectAnalysis | null>(null);
  const [demoMode, setDemoMode] = useState<boolean>(false);
  const [showExcluded, setShowExcluded] = useState<boolean>(false);
  const [downloadingPdf, setDownloadingPdf] = useState<boolean>(false);

  const isMountedRef = useRef<boolean>(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<AnalysisFormInput>({
    resolver: zodResolver(analysisFormSchema),
    defaultValues: {
      githubUrl: '',
    },
  });

  const watchedUrl = watch('githubUrl');

  // Pre-fill from URL param if available
  useEffect(() => {
    const urlParam = searchParams.get('url');
    if (urlParam) {
      setValue('githubUrl', urlParam, { shouldValidate: true });
    }
  }, [searchParams, setValue]);

  const stagesList: { id: AnalysisStage; label: string }[] = [
    { id: 'INITIALIZING', label: '1. Init' },
    { id: 'FETCHING_REPOSITORIES', label: '2. Fetch' },
    { id: 'FILTERING_REPOSITORIES', label: '3. Filter' },
    { id: 'INSPECTING_SOURCE', label: '4. Clone' },
    { id: 'ANALYZING_CODE', label: '5. AST Code' },
    { id: 'EVALUATING_PROJECTS', label: '6. 8-Pillars' },
    { id: 'RANKING_PROJECTS', label: '7. Rank' },
    { id: 'GENERATING_REPORT', label: '8. Report' },
    { id: 'COMPLETED', label: '9. Ready' },
  ];

  const stageDescriptions: Record<string, string> = {
    INITIALIZING: 'Connecting to GitHub API & validating target...',
    FETCHING_REPOSITORIES: 'Fetching user profile and public repositories...',
    FILTERING_REPOSITORIES: 'Filtering out forks, archives, and trivial scratchpads...',
    INSPECTING_SOURCE: 'Inspecting git trees, manifests, and core entrypoints...',
    ANALYZING_CODE: 'Running AST static analyzers and security scanners...',
    EVALUATING_PROJECTS: 'Calculating deterministic 8-pillar engineering scores...',
    RANKING_PROJECTS: 'Ranking Top 3 candidate showcase projects...',
    GENERATING_REPORT: 'Synthesizing evidence-backed evaluation reports...',
    COMPLETED: 'Analysis complete!',
    FAILED: 'Analysis failed.',
  };

  const onSubmit = async (data: AnalysisFormInput) => {
    if (loading) return; // Prevent duplicate requests

    setLoading(true);
    setServerError(null);
    setErrorHint(null);
    setAnalysisResult(null);
    setCurrentStage('INITIALIZING');
    setProgressPercent(10);
    setStageMessage('Initiating RepoScope analysis...');

    try {
      if (demoMode) {
        // Synchronous demo mode
        const result = await analyzeTarget(data.githubUrl, true);
        if (isMountedRef.current) {
          setAnalysisResult(result);
        }
      } else {
        // Real GitHub Analysis with asynchronous polling
        const initResponse = await analyzeTarget(data.githubUrl, false, false);

        if (initResponse.analysis_id) {
          const finalResult = await pollAnalysisJob(
            initResponse.analysis_id,
            (status: AnalysisJobStatus) => {
              if (isMountedRef.current) {
                setCurrentStage(status.stage);
                setProgressPercent(status.progress_percent);
                setStageMessage(stageDescriptions[status.stage] || status.message);
              }
            }
          );
          if (isMountedRef.current) {
            setAnalysisResult(finalResult);
          }
        } else {
          // Direct synchronous response
          if (isMountedRef.current) {
            setAnalysisResult(initResponse);
          }
        }
      }
    } catch (err: unknown) {
      if (!isMountedRef.current) return;
      if (err instanceof ApiError) {
        setServerError(err.message);
        setErrorHint(err.hint || null);
      } else if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError('An unexpected error occurred while communicating with the analysis server.');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const handleClear = () => {
    reset({ githubUrl: '' });
    setServerError(null);
    setErrorHint(null);
  };

  const handleSetSample = (url: string, asDemo: boolean = false) => {
    setValue('githubUrl', url, { shouldValidate: true });
    setDemoMode(asDemo);
    setServerError(null);
    setErrorHint(null);
  };

  const handleDownloadPdf = async () => {
    if (!analysisResult) return;
    setDownloadingPdf(true);
    try {
      const id = analysisResult.analysis_id || analysisResult.target_identifier;
      const safe = analysisResult.target_identifier.replace(/[/\\?%*:|"<>]/g, '_');
      await downloadDossierPdf(id, true, `RepoScope-Dossier-${safe}.pdf`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert('Failed to download academic PDF dossier.');
      }
    } finally {
      setDownloadingPdf(false);
    }
  };

  const topProject = analysisResult?.analyzed_projects?.[0];

  return (
    <Layout>
      <div className="py-12 md:py-20 relative bg-[#080B16] min-h-screen">
        {/* Glow ambient background */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-r from-purple-600/15 via-blue-600/15 to-cyan-600/15 blur-[140px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Page Heading */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#151D33] border border-white/10 text-xs text-slate-200 shadow-md">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-semibold">Phase 2 Live GitHub Intelligence Engine</span>
              <span className="text-slate-600">|</span>
              <span className="text-purple-400 font-mono text-[11px]">Static AST Inspection</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              GitHub Project Analyzer
            </h1>
            <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
              Discover, inspect and evaluate software projects from any public GitHub profile or repository.
            </p>
          </div>

          {/* Search / Input Area */}
          <div className="max-w-4xl mx-auto space-y-3">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="relative p-3 sm:p-4 rounded-3xl bg-[#151D33]/90 border border-white/10 shadow-2xl backdrop-blur-xl space-y-3"
            >
              <div className="relative flex flex-col sm:flex-row items-center gap-2.5">
                {/* Input with GitHub icon */}
                <div className="relative flex-1 w-full">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Github className="w-5 h-5 text-purple-400" />
                  </div>
                  <input
                    type="text"
                    {...register('githubUrl')}
                    disabled={loading}
                    placeholder="https://github.com/username or https://github.com/username/repository"
                    className="w-full pl-12 pr-10 py-4 bg-[#080B16] border border-white/10 rounded-2xl text-white placeholder-slate-500 text-sm sm:text-base focus:outline-none focus:border-purple-500/80 transition-all font-mono disabled:opacity-50"
                  />
                  {watchedUrl && (
                    <button
                      type="button"
                      onClick={handleClear}
                      disabled={loading}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition-colors"
                      aria-label="Clear URL input"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* Analyze CTA button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl text-sm sm:text-base font-bold text-white bg-gradient-to-r from-[#8B5CF6] via-[#6366F1] to-[#3B82F6] hover:from-[#7C3AED] hover:to-[#2563EB] shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2 shrink-0 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-white" />
                      <span>Inspecting...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Analyze</span>
                    </>
                  )}
                </button>
              </div>

              {/* Mode Toggle & Quick Test Chips */}
              <div className="px-2 pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400 border-t border-white/5 mt-2">
                {/* Live vs Demo Toggle */}
                <div className="flex items-center space-x-2">
                  <label className="flex items-center space-x-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={demoMode}
                      onChange={(e) => setDemoMode(e.target.checked)}
                      disabled={loading}
                      className="rounded border-slate-700 text-purple-600 focus:ring-purple-500 bg-[#080B16]"
                    />
                    <span className={demoMode ? 'text-purple-300 font-bold' : 'text-slate-400'}>
                      Demo Mode (Fictional Showcase)
                    </span>
                  </label>
                  {!demoMode && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold">
                      Live GitHub Crawler Active
                    </span>
                  )}
                </div>

                {/* Quick Sample Links */}
                <div className="flex items-center space-x-2 shrink-0 flex-wrap">
                  <span className="text-slate-500 font-mono text-[11px]">Quick tests:</span>
                  <button
                    type="button"
                    onClick={() => handleSetSample('https://github.com/octocat', false)}
                    className="text-purple-400 hover:text-purple-300 underline font-mono text-[11px] cursor-pointer"
                  >
                    octocat
                  </button>
                  <span className="text-slate-600">•</span>
                  <button
                    type="button"
                    onClick={() => handleSetSample('https://github.com/fastapi/fastapi', false)}
                    className="text-cyan-400 hover:text-cyan-300 underline font-mono text-[11px] cursor-pointer"
                  >
                    fastapi/fastapi
                  </button>
                  <span className="text-slate-600">•</span>
                  <button
                    type="button"
                    onClick={() => handleSetSample('https://github.com/octocat', true)}
                    className="text-amber-400 hover:text-amber-300 underline font-mono text-[11px] cursor-pointer"
                  >
                    demo data
                  </button>
                </div>
              </div>
            </form>

            {/* Validation Error Message */}
            {errors.githubUrl && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-start space-x-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errors.githubUrl.message}</span>
              </div>
            )}

            {/* Server Connection Error Alert */}
            {serverError && (
              <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-sm space-y-1.5 animate-fadeIn">
                <div className="flex items-center space-x-2 font-bold text-rose-300">
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  <span>Analysis or Connection Error</span>
                </div>
                <p className="pl-7 text-xs sm:text-sm text-slate-300">{serverError}</p>
                {errorHint && (
                  <p className="pl-7 text-xs text-amber-300 font-mono">
                    Hint: {errorHint}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Real-time Progress Interface */}
          {loading && (
            <div className="max-w-xl mx-auto p-8 rounded-3xl bg-[#151D33]/95 border border-purple-500/30 text-center space-y-6 shadow-2xl animate-fadeIn">
              {/* Circular Progress Ring */}
              <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="stroke-[#080B16]"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="stroke-purple-500 transition-all duration-300"
                    strokeWidth="8"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * progressPercent) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-black text-white font-mono">{progressPercent}%</span>
                  <span className="text-[9px] uppercase font-bold text-purple-400 font-mono">Progress</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs font-mono font-bold uppercase tracking-wider text-purple-300">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  <span>Stage: {currentStage}</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white pt-1">
                  {stageMessage}
                </h3>
              </div>

              {/* 9 Stage Dots Sequence Tracker */}
              <div className="pt-2 border-t border-white/5 grid grid-cols-3 sm:grid-cols-9 gap-1.5 text-center">
                {stagesList.map((st, sIdx) => {
                  const isCurrent = currentStage === st.id;
                  return (
                    <div
                      key={sIdx}
                      className={`p-1.5 rounded-lg text-[10px] font-mono transition-colors ${
                        isCurrent
                          ? 'bg-purple-500/20 text-cyan-300 border border-purple-500/40 font-bold'
                          : 'bg-[#080B16] text-slate-500 border border-white/5'
                      }`}
                    >
                      {st.label}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Results View */}
          {analysisResult && (
            <div className="space-y-8 animate-fadeIn">
              {/* Profile Header */}
              <ProfileHeader
                profile={analysisResult.user_profile}
                targetType={analysisResult.target_type}
                targetIdentifier={analysisResult.target_identifier}
                totalRepos={analysisResult.total_repositories_found}
                isDemo={analysisResult.is_demo}
                analyzedCount={analysisResult.analyzed_projects.length}
              />

              {/* Demo Mode Banner if active */}
              {analysisResult.is_demo && (
                <DemoBanner
                  disclaimer={analysisResult.disclaimer}
                  targetIdentifier={analysisResult.target_identifier}
                  targetType={analysisResult.target_type}
                  totalRepos={analysisResult.total_repositories_found}
                />
              )}

              {/* Top Project Executive Overview Card */}
              {topProject && (
                <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#151D33] via-[#1A2440] to-[#151D33] border border-white/10 shadow-2xl relative overflow-hidden">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    {/* Overall Rating & Champion Badge */}
                    <div className="lg:col-span-5 space-y-4">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold">
                        <Trophy className="w-3.5 h-3.5 text-amber-400" />
                        <span>Executive Academic Assessment</span>
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-2xl font-black text-white">
                          Candidate Engineering Profile
                        </h3>
                        <p className="text-xs text-purple-300 font-mono">
                          Primary Showcase Project: {topProject.name} • {topProject.primary_language}
                        </p>
                      </div>
                      <div className="flex items-baseline space-x-3">
                        <span className="text-5xl font-black bg-gradient-to-r from-emerald-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent font-mono">
                          {formatScore(topProject.overall_score)}
                        </span>
                        <span className="text-slate-400 font-mono text-base">/ 10.0 Overall</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        {topProject.summary}
                      </p>
                    </div>

                    {/* Pillar Quick Breakdown Matrix */}
                    <div className="lg:col-span-7 bg-[#080B16] p-5 sm:p-6 rounded-2xl border border-white/5 space-y-3">
                      <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-white/5 pb-2">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          <BarChart2 className="w-4 h-4 text-cyan-400" />
                          Top Project 8-Pillar Scoring Breakdown
                        </span>
                        <span className="text-purple-400">100% Deterministic</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        {topProject.criteria_breakdown.map((crit, idx) => {
                          const colors = getScoreColor(crit.score);
                          return (
                            <div key={idx} className="p-2.5 rounded-xl bg-[#151D33] border border-white/5 space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-medium text-slate-300 truncate max-w-[150px]">{crit.name}</span>
                                <span className={`font-mono font-bold ${colors.text}`}>{formatScore(crit.score)}</span>
                              </div>
                              <div className="w-full bg-[#080B16] h-1.5 rounded-full overflow-hidden">
                                <div
                                  style={{ width: `${(crit.score / 10) * 100}%` }}
                                  className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Excluded Repositories Drawer / Accordion */}
              {analysisResult.excluded_repositories && analysisResult.excluded_repositories.length > 0 && (
                <div className="rounded-2xl bg-[#151D33] border border-white/10 p-5 text-xs">
                  <button
                    onClick={() => setShowExcluded(!showExcluded)}
                    className="w-full flex items-center justify-between text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2 font-bold">
                      <Filter className="w-4 h-4 text-purple-400" />
                      {analysisResult.excluded_repositories.length} Repositories Filtered Out (Forks, Archives, or Trivial Scratchpads)
                    </span>
                    {showExcluded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {showExcluded && (
                    <div className="mt-4 pt-4 border-t border-white/5 space-y-2 max-h-52 overflow-y-auto pr-1">
                      {analysisResult.excluded_repositories.map((ex, idx) => (
                        <div key={idx} className="flex items-center justify-between py-1.5 border-b border-white/5 text-[11px] font-mono">
                          <span className="text-slate-300">{ex.name}</span>
                          <span className="text-slate-500">{ex.reason}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                    Top Evaluated Projects
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400">
                    Selected and ranked according to the 8-pillar evidence-based scoring rubric.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    disabled={downloadingPdf}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {downloadingPdf ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                    ) : (
                      <Download className="w-3.5 h-3.5 text-cyan-300" />
                    )}
                    <span>Download Academic PDF Dossier</span>
                  </button>
                  <div className="flex items-center space-x-1.5 pl-2 border-l border-white/10 font-mono">
                    <span>Evaluated:</span>
                    <span className="text-slate-300">
                      {analysisResult.evaluation_date
                        ? new Date(analysisResult.evaluation_date).toLocaleTimeString()
                        : 'Just now'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 3 Project Cards Grid */}
              {analysisResult.analyzed_projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {analysisResult.analyzed_projects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onSelect={(p) => setSelectedProject(p)}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-10 text-center bg-[#151D33] rounded-3xl border border-white/10 text-slate-400">
                  No qualifying software projects found for this target.
                </div>
              )}

              {/* Side-by-Side Comparison Matrix */}
              <ProjectComparisonTable
                projects={analysisResult.analyzed_projects}
                onSelectProject={(p) => setSelectedProject(p)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Detailed Project Report Modal */}
      <ProjectDetailModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </Layout>
  );
};
