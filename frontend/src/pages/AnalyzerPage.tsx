import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
} from 'lucide-react';

export const AnalyzerPage: React.FC = () => {
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

  const stageDescriptions: Record<string, string> = {
    INITIALIZING: 'Connecting to GitHub API...',
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

  return (
    <Layout>
      <div className="py-12 md:py-20 relative">
        {/* Glow ambient background */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-purple-600/10 via-indigo-600/10 to-blue-600/10 blur-[130px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Page Heading */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <Terminal className="w-3.5 h-3.5 text-blue-400" />
              <span>Phase 2 Live GitHub Intelligence Engine</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
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
              className="relative p-2 sm:p-3 rounded-2xl bg-[#0F172A]/90 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-3"
            >
              <div className="relative flex flex-col sm:flex-row items-center gap-2">
                {/* Input with GitHub icon */}
                <div className="relative flex-1 w-full">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Github className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    {...register('githubUrl')}
                    disabled={loading}
                    placeholder="https://github.com/username or https://github.com/username/repository"
                    className="w-full pl-12 pr-10 py-4 bg-[#0B0F19] border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all font-mono disabled:opacity-50"
                  />
                  {watchedUrl && (
                    <button
                      type="button"
                      onClick={handleClear}
                      disabled={loading}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
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
                  className="w-full sm:w-auto px-8 py-4 rounded-xl text-sm sm:text-base font-semibold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all flex items-center justify-center space-x-2 shrink-0 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
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
              <div className="px-2 pt-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400 border-t border-slate-800/80 mt-2">
                {/* Live vs Demo Toggle */}
                <div className="flex items-center space-x-2">
                  <label className="flex items-center space-x-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={demoMode}
                      onChange={(e) => setDemoMode(e.target.checked)}
                      disabled={loading}
                      className="rounded border-slate-700 text-purple-600 focus:ring-purple-500 bg-slate-900"
                    />
                    <span className={demoMode ? 'text-purple-300 font-semibold' : 'text-slate-400'}>
                      Demo Mode (Fictional Showcase)
                    </span>
                  </label>
                  {!demoMode && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      Live GitHub Crawler Active
                    </span>
                  )}
                </div>

                {/* Quick Sample Links */}
                <div className="flex items-center space-x-2 shrink-0 flex-wrap">
                  <span className="text-slate-500">Quick tests:</span>
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
                    className="text-blue-400 hover:text-blue-300 underline font-mono text-[11px] cursor-pointer"
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
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-start space-x-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errors.githubUrl.message}</span>
              </div>
            )}

            {/* Server Connection Error Alert */}
            {serverError && (
              <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-sm space-y-1.5 animate-fadeIn">
                <div className="flex items-center space-x-2 font-semibold text-rose-300">
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
            <div className="max-w-md mx-auto p-8 rounded-2xl bg-[#0F172A]/90 border border-slate-800 text-center space-y-5 shadow-2xl animate-fadeIn">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-500/20 to-blue-500/20 border border-purple-500/40 flex items-center justify-center mx-auto">
                <Loader2 className="w-7 h-7 text-purple-400 animate-spin" />
              </div>
              <div className="space-y-1.5">
                <div className="text-xs font-mono uppercase tracking-wider text-purple-400">
                  Stage: {currentStage}
                </div>
                <h3 className="text-base font-semibold text-white">
                  {stageMessage}
                </h3>
              </div>
              <div className="space-y-1">
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${progressPercent}%` }}
                    className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 transition-all duration-300 rounded-full"
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                  <span>Executing Pipeline</span>
                  <span>{progressPercent}%</span>
                </div>
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

              {/* Excluded Repositories Drawer / Accordion */}
              {analysisResult.excluded_repositories && analysisResult.excluded_repositories.length > 0 && (
                <div className="rounded-xl bg-[#0F172A] border border-slate-800 p-4 text-xs">
                  <button
                    onClick={() => setShowExcluded(!showExcluded)}
                    className="w-full flex items-center justify-between text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <Filter className="w-4 h-4 text-purple-400" />
                      {analysisResult.excluded_repositories.length} Repositories Filtered Out (Forks, Archives, or Trivial)
                    </span>
                    {showExcluded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {showExcluded && (
                    <div className="mt-3 pt-3 border-t border-slate-800 space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {analysisResult.excluded_repositories.map((ex, idx) => (
                        <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-800/40 text-[11px]">
                          <span className="font-mono text-slate-300">{ex.name}</span>
                          <span className="text-slate-500">{ex.reason}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
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
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/50 shadow-md shadow-indigo-500/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {downloadingPdf ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                    ) : (
                      <Download className="w-3.5 h-3.5 text-indigo-400" />
                    )}
                    <span>Download Academic PDF Dossier</span>
                  </button>
                  <div className="flex items-center space-x-1.5 pl-2 border-l border-slate-800">
                    <span>Evaluated:</span>
                    <span className="font-mono text-slate-300">
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
                <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400">
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
