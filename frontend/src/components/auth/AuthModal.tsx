import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Lock, Mail, User as UserIcon, Building, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [department, setDepartment] = useState<string>('Department of Computer Science & Engineering');
  const [role, setRole] = useState<string>('FACULTY');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isRegister) {
        await register(email, password, fullName, department, role);
      } else {
        await login(email, password);
      }
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUseDemo = async () => {
    setEmail('faculty@university.edu');
    setPassword('faculty123');
    setLoading(true);
    setError(null);
    try {
      await login('faculty@university.edu', 'faculty123');
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Could not login with default credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#151D33] border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors p-1.5 rounded-xl hover:bg-white/5"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Academic Portal</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            {isRegister ? 'Register Faculty Account' : 'Faculty & Reviewer Login'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            {isRegister
              ? 'Join the university evaluation board to review and accredit candidate portfolios.'
              : 'Sign in to access student evaluation dossiers, search archives, and leave reviews.'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 font-mono uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-3.5 w-4 h-4 text-purple-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Prof. Alan Turing"
                    className="w-full pl-10 pr-4 py-3 bg-[#080B16] border border-white/10 rounded-2xl text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-purple-500/80 font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 font-mono uppercase tracking-wider">
                  Department
                </label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-3.5 w-4 h-4 text-purple-400" />
                  <input
                    type="text"
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Department of Computer Science"
                    className="w-full pl-10 pr-4 py-3 bg-[#080B16] border border-white/10 rounded-2xl text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-purple-500/80 font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 font-mono uppercase tracking-wider">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-3 bg-[#080B16] border border-white/10 rounded-2xl text-white text-xs sm:text-sm focus:outline-none focus:border-purple-500/80 font-sans cursor-pointer"
                >
                  <option value="FACULTY">Faculty Member / Professor</option>
                  <option value="EVALUATOR">External Reviewer / Recruiter</option>
                  <option value="ADMIN">System Administrator</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 font-mono uppercase tracking-wider">
              Institutional Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-purple-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="faculty@university.edu"
                className="w-full pl-10 pr-4 py-3 bg-[#080B16] border border-white/10 rounded-2xl text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-purple-500/80 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 font-mono uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-purple-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-[#080B16] border border-white/10 rounded-2xl text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-purple-500/80 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <span>{isRegister ? 'Complete Registration' : 'Sign In'}</span>
            )}
          </button>
        </form>

        {/* Demo Fast Login (Development / Testing Only) */}
        {!isRegister && import.meta.env.DEV && (
          <div className="pt-2 border-t border-white/5 space-y-3">
            <button
              type="button"
              onClick={handleUseDemo}
              disabled={loading}
              className="w-full py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-[#080B16] hover:bg-white/5 border border-white/10 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Instant Fill Faculty Demo Credentials (Dev Mode)</span>
            </button>
          </div>
        )}

        {/* Toggle between Login and Register */}
        <div className="text-center text-xs text-slate-400 pt-1">
          {isRegister ? (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(false);
                  setError(null);
                }}
                className="text-cyan-400 hover:text-cyan-300 font-bold underline cursor-pointer"
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              Need a faculty account?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(true);
                  setError(null);
                }}
                className="text-cyan-400 hover:text-cyan-300 font-bold underline cursor-pointer"
              >
                Register Here
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
