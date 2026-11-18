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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#151D33] border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors p-1.5 rounded-xl hover:bg-white/5"
          aria-label="Close review modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            <span>Faculty Accreditation</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Record Academic Review
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Submit formal evaluation remarks and accreditation status for <span className="font-mono text-purple-300 font-bold">{targetIdentifier}</span>.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 font-mono uppercase tracking-wider">
              Accreditation Verdict
            </label>
            <select
              value={verdict}
              onChange={(e) => setVerdict(e.target.value)}
              className="w-full px-4 py-3 bg-[#080B16] border border-white/10 rounded-2xl text-white text-xs sm:text-sm focus:outline-none focus:border-purple-500/80 font-sans cursor-pointer"
            >
              <option value="APPROVED_EXEMPLARY">Approved with High Distinction (Exemplary)</option>
              <option value="APPROVED_SATISFACTORY">Approved (Meets Engineering Standards)</option>
              <option value="CONDITIONAL_REVISION">Conditional (Requires Revision & Testing)</option>
              <option value="REJECTED">Needs Substantial Rework</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 font-mono uppercase tracking-wider">
              Score Override (Optional, 0.0 - 10.0)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="10"
              value={scoreOverride}
              onChange={(e) => setScoreOverride(e.target.value)}
              placeholder="Leave blank to maintain automated algorithmic score"
              className="w-full px-4 py-3 bg-[#080B16] border border-white/10 rounded-2xl text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-purple-500/80 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 font-mono uppercase tracking-wider">
              Faculty Comments & Observations
            </label>
            <textarea
              required
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Detail your academic review, code quality remarks, or interview notes..."
              className="w-full px-4 py-3 bg-[#080B16] border border-white/10 rounded-2xl text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-purple-500/80 leading-relaxed font-sans"
            />
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-[#080B16] hover:bg-white/5 border border-white/10 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-lg shadow-purple-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Confirm Accreditation</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
