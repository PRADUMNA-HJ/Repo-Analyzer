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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#0F172A] border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-medium mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Academic Portal</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
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
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name & Title</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Dr. Alistair Vance, Ph.D."
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Department</label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Department of Computer Science & Engineering"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="FACULTY">Faculty Evaluator</option>
                  <option value="ADMIN">Academic Board Administrator</option>
                  <option value="REVIEWER">External Technical Reviewer</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Institutional Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="faculty@university.edu"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>{isRegister ? 'Complete Registration' : 'Sign In'}</span>
            )}
          </button>
        </form>

        {/* Demo Fast Login */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={handleUseDemo}
            disabled={loading}
            className="text-xs text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
          >
            Quick Sign In with Default Faculty Demo (faculty@university.edu)
          </button>

          <div className="text-xs text-slate-500">
            {isRegister ? 'Already registered?' : "Don't have a faculty account?"}{' '}
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError(null);
              }}
              className="text-white hover:underline font-medium cursor-pointer"
            >
              {isRegister ? 'Sign In here' : 'Register here'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

