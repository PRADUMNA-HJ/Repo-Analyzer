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
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  FolderGit2,
  ShieldCheck,
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
    if (score >= 9.0) return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-sm';
    if (score >= 8.0) return 'bg-blue-500/15 text-blue-300 border-blue-500/40 shadow-sm';
    if (score >= 7.0) return 'bg-purple-500/15 text-purple-300 border-purple-500/40 shadow-sm';
    if (score >= 5.0) return 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-sm';
    return 'bg-rose-500/15 text-rose-300 border-rose-500/40 shadow-sm';
  };

  return (
    <Layout>
      <div className="py-12 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 bg-[#080B16] min-h-screen">
        {/* Glow ambient background */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-r from-purple-600/15 via-blue-600/10 to-cyan-600/15 blur-[140px] pointer-events-none -z-10" />

        {/* Command Center Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#151D33] border border-white/10 text-xs text-slate-200 shadow-md">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold">Institutional Command Center</span>
            <span className="text-slate-600">|</span>
            <span className="text-purple-400 font-mono text-[11px]">Academic Registry & Archives</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Evaluation History & Dossiers
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-3xl leading-relaxed">
            Search, review, and download official university evaluation dossiers for analyzed student portfolios and software repositories.
          </p>
        </div>

        {/* Stats Summary Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-6 rounded-3xl bg-[#151D33]/90 border border-white/10 hover:border-purple-500/30 transition-all duration-300 hover:-translate-y-0.5 shadow-xl space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span className="uppercase font-bold tracking-wider">Total Evaluations</span>
                <FolderGit2 className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white font-mono">{stats.total_evaluations}</div>
              <div className="text-[11px] text-slate-400">Archived candidate dossiers</div>
            </div>

            <div className="p-6 rounded-3xl bg-[#151D33]/90 border border-white/10 hover:border-cyan-500/30 transition-all duration-300 hover:-translate-y-0.5 shadow-xl space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span className="uppercase font-bold tracking-wider">Average Rating</span>
                <TrendingUp className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-emerald-400 to-cyan-300 bg-clip-text text-transparent font-mono">
                {stats.average_score.toFixed(1)} <span className="text-sm text-slate-400 font-normal">/ 10</span>
              </div>
              <div className="text-[11px] text-slate-400">8-pillar calibrated mean</div>
            </div>

            <div className="p-6 rounded-3xl bg-[#151D33]/90 border border-white/10 hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-0.5 shadow-xl space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span className="uppercase font-bold tracking-wider">High Confidence</span>
                <Award className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono">{stats.high_confidence_count}</div>
              <div className="text-[11px] text-slate-400">Deep AST & tree coverage</div>
            </div>

            <div className="p-6 rounded-3xl bg-[#151D33]/90 border border-white/10 hover:border-pink-500/30 transition-all duration-300 hover:-translate-y-0.5 shadow-xl space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span className="uppercase font-bold tracking-wider">Top Languages</span>
                <FileText className="w-4 h-4 text-pink-400" />
              </div>
              <div className="text-base sm:text-lg font-bold text-white truncate font-mono pt-1">
                {stats.top_languages.slice(0, 2).map((l) => l.language).join(', ') || 'N/A'}
              </div>
              <div className="text-[11px] text-slate-400">
                {stats.recent_reviews_count} accredited faculty reviews
              </div>
            </div>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="p-4 sm:p-5 rounded-3xl bg-[#151D33]/90 border border-white/10 shadow-xl space-y-3">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-purple-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by GitHub username, repository, or project name..."
                className="w-full pl-11 pr-4 py-3 bg-[#080B16] border border-white/10 rounded-2xl text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-purple-500/80 transition-colors font-mono"
              />
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <div className="relative shrink-0">
                <Filter className="absolute left-3.5 top-3.5 w-3.5 h-3.5 text-slate-400" />
                <select
                  value={targetType}
                  onChange={(e) => {
                    setTargetType(e.target.value);
                    setPage(1);
                  }}
                  className="pl-9 pr-8 py-3 bg-[#080B16] border border-white/10 rounded-2xl text-white text-xs sm:text-sm focus:outline-none focus:border-purple-500/80 font-mono cursor-pointer"
                >
                  <option value="">All Targets</option>
                  <option value="profile">Profiles Only</option>
                  <option value="repository">Repositories Only</option>
                </select>
              </div>

              <button
                type="submit"
                className="px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-md shadow-purple-600/30 transition-all shrink-0 cursor-pointer"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Evaluations Table */}
        <div className="rounded-3xl bg-[#151D33]/90 border border-white/10 overflow-hidden shadow-2xl">
          <div className="p-5 border-b border-white/5 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="text-slate-300 font-semibold">Showing {evaluations.length} of {totalCount} Evaluations</span>
            <span>Page {page} of {totalPages || 1}</span>
          </div>

          {loading ? (
            <div className="p-20 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
              <span className="text-xs text-slate-400 font-mono">Loading evaluation archives...</span>
            </div>
          ) : evaluations.length === 0 ? (
            <div className="p-20 text-center space-y-2">
              <FileText className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="text-base font-bold text-white">No evaluations found.</p>
              <p className="text-xs text-slate-400">Run an analysis on the Analyzer page to generate and archive an evaluation.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-[#101629] border-b border-white/5 text-slate-400 font-mono uppercase tracking-wider text-[11px]">
                    <th className="p-4 sm:p-5">Target Candidate</th>
                    <th className="p-4 sm:p-5">Evaluation Date</th>
                    <th className="p-4 sm:p-5">Top Showcase Projects</th>
                    <th className="p-4 sm:p-5 text-center">Score</th>
                    <th className="p-4 sm:p-5 text-center">Accreditation</th>
                    <th className="p-4 sm:p-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {evaluations.map((ev) => (
                    <tr key={ev.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 sm:p-5">
                        <div className="font-mono font-bold text-white text-sm">
                          github.com/{ev.target_identifier}
                        </div>
                        <div className="text-[11px] text-slate-400 capitalize flex items-center gap-1.5 mt-1 font-mono">
                          <span className="text-purple-300">{ev.target_type}</span>
                          <span>•</span>
                          <span>v{ev.methodology_version}</span>
                          {ev.is_demo && (
                            <span className="text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full text-[10px] font-bold border border-amber-500/30">
                              Demo
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-4 sm:p-5 text-xs text-slate-400 font-mono">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Calendar className="w-3.5 h-3.5 text-purple-400" />
                          <span>{new Date(ev.evaluation_date).toLocaleDateString()}</span>
                        </div>
                        {ev.created_by_name && (
                          <div className="text-[11px] text-slate-500 mt-1">
                            By {ev.created_by_name}
                          </div>
                        )}
                      </td>

                      <td className="p-4 sm:p-5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {ev.top_projects.map((p) => (
                            <span
                              key={p.id}
                              className="text-[11px] px-2.5 py-1 rounded-lg bg-[#080B16] border border-white/5 font-mono text-slate-300"
                            >
                              {p.name} ({p.primary_language})
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="p-4 sm:p-5 text-center">
                        <span className={`inline-block px-3 py-1.5 rounded-xl font-mono font-black text-xs border ${getScoreBadgeColor(ev.overall_score)}`}>
                          {ev.overall_score.toFixed(1)} / 10
                        </span>
                      </td>

                      <td className="p-4 sm:p-5 text-center">
                        {ev.latest_verdict ? (
                          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 font-mono shadow-sm">
                            {ev.latest_verdict.replace('APPROVED_', '')}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-500 font-mono">
                            Unreviewed
                          </span>
                        )}
                      </td>

                      <td className="p-4 sm:p-5 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          <button
                            onClick={() => handleDownload(ev.id, ev.target_identifier)}
                            disabled={downloadingId === ev.id}
                            title="Download Official Academic PDF Dossier"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/40 text-cyan-300 text-xs font-bold transition-all cursor-pointer disabled:opacity-50 shadow-sm"
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
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#080B16] hover:bg-[#1A2440] border border-purple-500/30 text-purple-300 hover:text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
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
            <div className="p-5 border-t border-white/5 flex items-center justify-between text-xs text-slate-400 font-mono">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-4 py-2 rounded-xl bg-[#080B16] border border-white/10 disabled:opacity-40 flex items-center gap-1.5 cursor-pointer hover:bg-white/5 transition-colors font-semibold"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
              <span className="font-semibold text-slate-300">Page {page} of {totalPages}</span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="px-4 py-2 rounded-xl bg-[#080B16] border border-white/10 disabled:opacity-40 flex items-center gap-1.5 cursor-pointer hover:bg-white/5 transition-colors font-semibold"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
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
