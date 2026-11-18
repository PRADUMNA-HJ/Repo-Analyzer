import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Layers, Menu, X, ArrowRight, User as UserIcon, LogOut, ShieldCheck, History, Sparkles } from 'lucide-react';
import { checkHealth } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { AuthModal } from '../auth/AuthModal';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let mounted = true;
    checkHealth()
      .then(() => {
        if (mounted) setApiStatus('online');
      })
      .catch(() => {
        if (mounted) setApiStatus('offline');
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleNavClick = (anchorId: string) => {
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate(`/#${anchorId}`);
      setTimeout(() => {
        const element = document.getElementById(anchorId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.getElementById(anchorId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#080B16]/85 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-black/40'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo & Brand */}
            <Link
              to="/"
              className="flex items-center space-x-3.5 group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded-xl p-1"
            >
              <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#8B5CF6] via-[#3B82F6] to-[#22D3EE] p-[2px] shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/50 transition-all duration-300 group-hover:scale-105">
                <div className="w-full h-full bg-[#080B16] rounded-[14px] flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Layers className="w-5 h-5 text-purple-400 group-hover:text-cyan-300 transition-colors" />
                </div>
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
                  <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                    RepoScope
                  </span>
                  <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1 shadow-sm">
                    <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                    v3.0
                  </span>
                </span>
                <span className="block text-[11px] font-medium bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent tracking-wide">
                  GitHub Project Intelligence
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5 p-1 rounded-2xl bg-[#101629]/70 border border-white/5 backdrop-blur-md">
              <Link
                to="/"
                className={`px-3.5 py-1.5 rounded-xl text-xs lg:text-sm font-semibold transition-all duration-200 ${
                  location.pathname === '/'
                    ? 'text-white bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                Home
              </Link>
              <Link
                to="/analyze"
                className={`px-3.5 py-1.5 rounded-xl text-xs lg:text-sm font-semibold transition-all duration-200 ${
                  location.pathname === '/analyze'
                    ? 'text-white bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                Analyzer
              </Link>
              <Link
                to="/history"
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs lg:text-sm font-semibold transition-all duration-200 ${
                  location.pathname === '/history'
                    ? 'text-white bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <History className="w-3.5 h-3.5 text-cyan-400" />
                <span>History</span>
              </Link>
              <button
                onClick={() => handleNavClick('features')}
                className="px-3.5 py-1.5 rounded-xl text-xs lg:text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                Features
              </button>
              <button
                onClick={() => handleNavClick('evaluation-criteria')}
                className="px-3.5 py-1.5 rounded-xl text-xs lg:text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                Rubric
              </button>
            </nav>

            {/* Right Action Buttons */}
            <div className="hidden md:flex items-center space-x-3">
              {/* API Status Indicator */}
              <div
                className="flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs bg-[#101629] border border-white/10 text-slate-300 shadow-inner"
                title={`Backend API: ${apiStatus}`}
              >
                <span className="relative flex h-2 w-2">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      apiStatus === 'online'
                        ? 'bg-emerald-400'
                        : apiStatus === 'offline'
                        ? 'bg-rose-400'
                        : 'bg-amber-400'
                    }`}
                  />
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${
                      apiStatus === 'online'
                        ? 'bg-emerald-500'
                        : apiStatus === 'offline'
                        ? 'bg-rose-500'
                        : 'bg-amber-500'
                    }`}
                  />
                </span>
                <span className="text-[11px] font-mono font-medium">
                  {apiStatus === 'online' ? 'API Online' : apiStatus === 'offline' ? 'API Offline' : 'Connecting...'}
                </span>
              </div>

              {/* Faculty Auth Pill */}
              {user ? (
                <div className="flex items-center gap-2 pl-2 border-l border-white/10">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#151D33] border border-purple-500/30 text-xs text-white shadow-md">
                    <UserIcon className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="font-semibold truncate max-w-[120px]">{user.full_name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-bold uppercase tracking-wider">
                      {user.role}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    title="Sign Out"
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-white bg-[#151D33] hover:bg-[#1E2942] border border-white/10 hover:border-purple-500/40 transition-all cursor-pointer shadow-md hover:shadow-purple-500/20"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  <span>Faculty Portal</span>
                </button>
              )}

              {/* Analyze CTA */}
              <Link
                to="/analyze"
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#8B5CF6] via-[#6366F1] to-[#3B82F6] hover:from-[#7C3AED] hover:to-[#2563EB] shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>Launch Analyzer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex md:hidden items-center space-x-2">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 rounded-xl text-slate-300 hover:text-white bg-[#101629] border border-white/10 transition-colors cursor-pointer"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#080B16]/95 border-b border-white/10 px-4 pt-3 pb-6 space-y-2 backdrop-blur-2xl">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:text-white hover:bg-white/5"
            >
              Home
            </Link>
            <Link
              to="/analyze"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:text-white hover:bg-white/5"
            >
              Analyzer
            </Link>
            <Link
              to="/history"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:text-white hover:bg-white/5"
            >
              Evaluation History
            </Link>
            <button
              onClick={() => handleNavClick('features')}
              className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:text-white hover:bg-white/5"
            >
              Features
            </button>
            <button
              onClick={() => handleNavClick('evaluation-criteria')}
              className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:text-white hover:bg-white/5"
            >
              Evaluation Rubric
            </button>
            <div className="pt-3 border-t border-white/10">
              {user ? (
                <div className="flex items-center justify-between text-xs text-slate-300 py-2">
                  <span>Signed in as <strong className="text-white">{user.full_name}</strong> ({user.role})</span>
                  <button onClick={logout} className="text-rose-400 hover:text-rose-300 font-semibold underline">Logout</button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setAuthModalOpen(true);
                  }}
                  className="w-full py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-blue-600 text-center shadow-md shadow-purple-600/30"
                >
                  Faculty Portal Sign In
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
};
