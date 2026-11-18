import React, { useState } from 'react';
import { addReviewNote } from '../../services/api';
import { X, Award, CheckCircle, Loader2, AlertCircle } from 'lucide-react';

interface ReviewModalProps {
  evaluationId: string;
  targetIdentifier: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  evaluationId,
  targetIdentifier,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [comment, setComment] = useState<string>('');
  const [verdict, setVerdict] = useState<string>('APPROVED_SATISFACTORY');
  const [scoreOverride, setScoreOverride] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const overrideNum = scoreOverride.trim() ? parseFloat(scoreOverride) : undefined;
    if (overrideNum !== undefined && (isNaN(overrideNum) || overrideNum < 0 || overrideNum > 10)) {
      setError('Score override must be a valid number between 0.0 and 10.0');
      setLoading(false);
      return;
    }

    try {
      await addReviewNote(evaluationId, comment, verdict, overrideNum);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to record review note.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#0F172A] border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-5">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
          aria-label="Close review modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
            <Award className="w-3.5 h-3.5" />
            <span>Faculty Accreditation</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Record Academic Review
          </h2>
          <p className="text-xs text-slate-400">
            Submit formal evaluation remarks and accreditation status for <span className="font-mono text-purple-300 font-semibold">{targetIdentifier}</span>.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Accreditation Verdict
            </label>
            <select
              value={verdict}
              onChange={(e) => setVerdict(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="APPROVED_EXEMPLARY">Approved with High Distinction (Exemplary)</option>
              <option value="APPROVED_SATISFACTORY">Approved (Meets Engineering Standards)</option>
              <option value="CONDITIONAL_REVISION">Conditional (Requires Revision & Testing)</option>
              <option value="REJECTED">Needs Substantial Rework</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Manual Score Override (Optional, 0.0 - 10.0)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="10"
              value={scoreOverride}
              onChange={(e) => setScoreOverride(e.target.value)}
              placeholder="Leave blank to maintain deterministic score"
              className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Qualitative Reviewer Remarks
            </label>
            <textarea
              required
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Provide constructive assessment of software modularity, test adequacy, and engineering practices..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Finalize Review</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

