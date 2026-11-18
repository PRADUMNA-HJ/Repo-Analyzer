import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import {
  getEvaluations,
  getEvaluationStats,
  downloadDossierPdf,
} from '../services/api';
import { EvaluationSummary, EvaluationStats } from '../types';
import { ReviewModal } from '../components/analyzer/ReviewModal';
import {
  Search,
  FileText,
  Download,
  Award,
  Filter,
  Loader2,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  FolderGit2,
} from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const { isFaculty } = useAuth();
  const [evaluations, setEvaluations] = useState<EvaluationSummary[]>([]);
  const [stats, setStats] = useState<EvaluationStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [targetType, setTargetType] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Review Modal State
  const [reviewModalEval, setReviewModalEval] = useState<EvaluationSummary | null>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const [listData, statsData] = await Promise.all([
        getEvaluations({
          q: searchQuery || undefined,
          target_type: targetType || undefined,
          page,
          page_size: 10,
        }),
        getEvaluationStats(),
      ]);

      setEvaluations(listData.items);
      setTotalPages(listData.total_pages);
      setTotalCount(listData.total);
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching evaluation history:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, targetType, page]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchHistory();
  };

  const handleDownload = async (id: string, targetIdentifier: string) => {
    setDownloadingId(id);
    try {
      const safe = targetIdentifier.replace(/[/\\?%*:|"<>]/g, '_');
      await downloadDossierPdf(id, false, `RepoScope-Dossier-${safe}.pdf`);
    } catch (err) {
      console.error('PDF download error:', err);
      alert('Could not download PDF dossier. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 9.0) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    if (score >= 8.0) return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    if (score >= 7.0) return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
    if (score >= 5.0) return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
  };

  return (
    <Layout>
      <div className="py-12 md:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-xs text-indigo-300">
            <Layers className="w-3.5 h-3.5" />
            <span>Academic Registry & Archives</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Evaluation History & Dossiers
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-3xl">
            Search, review, and download official university evaluation dossiers for analyzed student portfolios and software repositories.
          </p>
        </div>

        {/* Stats Summary Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Total Evaluations</span>
                <FolderGit2 className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-bold text-white">{stats.total_evaluations}</div>
              <div className="text-[11px] text-slate-500">Archived candidate dossiers</div>
            </div>

            <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Average Rating</span>
                <TrendingUp className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-white">{stats.average_score.toFixed(1)} <span className="text-xs text-slate-400 font-normal">/ 10</span></div>
              <div className="text-[11px] text-slate-500">8-pillar calibrated mean</div>
            </div>

            <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>High Confidence</span>
                <Award className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-white">{stats.high_confidence_count}</div>
              <div className="text-[11px] text-slate-500">Deep AST & tree coverage</div>
            </div>

            <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Top Languages</span>
                <FileText className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-sm font-semibold text-white truncate">
                {stats.top_languages.slice(0, 2).map((l) => l.language).join(', ') || 'N/A'}
              </div>
              <div className="text-[11px] text-slate-500">
                {stats.recent_reviews_count} accredited reviews
              </div>
            </div>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-3">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by GitHub username, repository, or project name..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative shrink-0">
                <Filter className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-500" />
                <select
                  value={targetType}
                  onChange={(e) => {
                    setTargetType(e.target.value);
                    setPage(1);
                  }}
                  className="pl-8 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="">All Targets</option>
                  <option value="profile">Profiles Only</option>
                  <option value="repository">Repositories Only</option>
                </select>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shrink-0 cursor-pointer"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Evaluations Table */}
        <div className="rounded-2xl bg-[#0F172A] border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Showing {evaluations.length} of {totalCount} Evaluations</span>
            <span className="font-mono">Page {page} of {totalPages || 1}</span>
          </div>

          {loading ? (
            <div className="p-16 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
              <span className="text-xs text-slate-400">Loading evaluation archives...</span>
            </div>
          ) : evaluations.length === 0 ? (
            <div className="p-16 text-center space-y-2">
              <FileText className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-medium text-white">No evaluations found.</p>
              <p className="text-xs text-slate-500">Run an analysis on the Analyzer page to generate and archive an evaluation.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400 font-medium">
                    <th className="p-4">Target Candidate</th>
                    <th className="p-4">Evaluation Date</th>
                    <th className="p-4">Top Showcase Projects</th>
                    <th className="p-4 text-center">Score</th>
                    <th className="p-4 text-center">Accreditation</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {evaluations.map((ev) => (
                    <tr key={ev.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-4">
                        <div className="font-mono font-semibold text-white">
                          github.com/{ev.target_identifier}
                        </div>
                        <div className="text-[11px] text-slate-500 capitalize flex items-center gap-1.5 mt-0.5">
                          <span>{ev.target_type}</span>
                          <span>•</span>
                          <span>v{ev.methodology_version}</span>
                          {ev.is_demo && (
                            <span className="text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded text-[10px]">
                              Demo
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-4 text-xs text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>{new Date(ev.evaluation_date).toLocaleDateString()}</span>
                        </div>
                        {ev.created_by_name && (
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            By {ev.created_by_name}
                          </div>
                        )}
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {ev.top_projects.map((p) => (
                            <span
                              key={p.id}
                              className="text-[11px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-slate-300"
                            >
                              {p.name} ({p.primary_language})
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="p-4 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-lg font-mono font-bold text-xs border ${getScoreBadgeColor(ev.overall_score)}`}>
                          {ev.overall_score.toFixed(1)}
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        {ev.latest_verdict ? (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            {ev.latest_verdict.replace('APPROVED_', '')}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-500">
                            Unreviewed
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDownload(ev.id, ev.target_identifier)}
                            disabled={downloadingId === ev.id}
                            title="Download Official Academic PDF Dossier"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/40 text-indigo-300 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {downloadingId === ev.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Download className="w-3.5 h-3.5" />
                            )}
                            <span>PDF Dossier</span>
                          </button>

                          {isFaculty && (
                            <button
                              onClick={() => setReviewModalEval(ev)}
                              title="Leave Faculty Accreditation Review"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
                            >
                              <Award className="w-3.5 h-3.5 text-purple-400" />
                              <span>Review</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 rounded bg-slate-900 border border-slate-800 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>
              <span>Page {page} of {totalPages}</span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 rounded bg-slate-900 border border-slate-800 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {reviewModalEval && (
        <ReviewModal
          evaluationId={reviewModalEval.id}
          targetIdentifier={reviewModalEval.target_identifier}
          isOpen={true}
          onClose={() => setReviewModalEval(null)}
          onSuccess={() => fetchHistory()}
        />
      )}
    </Layout>
  );
};

