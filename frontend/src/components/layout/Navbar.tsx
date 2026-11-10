import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Layers, Menu, X, ArrowRight, User as UserIcon, LogOut, ShieldCheck, History } from 'lucide-react';
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
      setIsScrolled(window.scrollY > 20);
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
            ? 'bg-[#0B0F19]/85 backdrop-blur-md border-b border-slate-800/80 shadow-lg shadow-black/20'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo & Brand */}
            <Link
              to="/"
              className="flex items-center space-x-3 group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded-lg p-1"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 p-0.5 shadow-md shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-shadow">
                <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center">
                  <Layers className="w-5 h-5 text-purple-400 group-hover:text-blue-400 transition-colors" />
                </div>
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  RepoScope
                  <span className="text-[10px] font-medium tracking-wide uppercase px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30">
                    v3.0
                  </span>
                </span>
                <span className="block text-[11px] text-slate-400 tracking-wider">
                  Academic Intelligence
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              <Link
                to="/"
                className={`px-3 py-2 rounded-lg text-xs lg:text-sm font-medium transition-colors ${
                  location.pathname === '/'
                    ? 'text-white bg-slate-800/50'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/30'
                }`}
              >
                Home
              </Link>
              <Link
                to="/analyze"
                className={`px-3 py-2 rounded-lg text-xs lg:text-sm font-medium transition-colors ${
                  location.pathname === '/analyze'
                    ? 'text-white bg-slate-800/50'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/30'
                }`}
              >
                Analyzer
              </Link>
              <Link
                to="/history"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs lg:text-sm font-medium transition-colors ${
                  location.pathname === '/history'
                    ? 'text-white bg-slate-800/50'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/30'
                }`}
              >
                <History className="w-3.5 h-3.5 text-indigo-400" />
                <span>History & Dossiers</span>
              </Link>
              <button
                onClick={() => handleNavClick('features')}
                className="px-3 py-2 rounded-lg text-xs lg:text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/30 transition-colors cursor-pointer"
              >
                Features
              </button>
              <button
                onClick={() => handleNavClick('evaluation-criteria')}
                className="px-3 py-2 rounded-lg text-xs lg:text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/30 transition-colors cursor-pointer"
              >
                Rubric
              </button>
            </nav>

            {/* Right Action Buttons */}
            <div className="hidden md:flex items-center space-x-3">
              {/* API Status Indicator */}
              <div
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs bg-slate-900/80 border border-slate-800 text-slate-400"
                title={`Backend API: ${apiStatus}`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    apiStatus === 'online'
                      ? 'bg-emerald-400 animate-pulse'
                      : apiStatus === 'offline'
                      ? 'bg-rose-400'
                      : 'bg-amber-400'
                  }`}
                />
                <span className="text-[11px] font-mono">
                  {apiStatus === 'online' ? 'Online' : 'Offline'}
                </span>
              </div>

              {/* Faculty Auth Pill */}
              {user ? (
                <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white">
                    <UserIcon className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="font-medium truncate max-w-[120px]">{user.full_name}</span>
                    <span className="text-[10px] px-1 py-0.2 rounded bg-purple-500/20 text-purple-300 font-semibold uppercase">
                      {user.role}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    title="Sign Out"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Faculty Portal</span>
                </button>
              )}

              {/* Analyze CTA */}
              <Link
                to="/analyze"
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-md shadow-indigo-600/25 transition-all"
              >
                <span>Analyze</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex md:hidden items-center space-x-2">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors cursor-pointer"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0B0F19]/95 border-b border-slate-800 px-4 pt-2 pb-6 space-y-2 backdrop-blur-xl">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/40"
            >
              Home
            </Link>
            <Link
              to="/analyze"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/40"
            >
              Analyzer
            </Link>
            <Link
              to="/history"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/40"
            >
              Evaluation History
            </Link>
            <div className="pt-2 border-t border-slate-800">
              {user ? (
                <div className="flex items-center justify-between text-xs text-slate-300 py-1">
                  <span>Signed in as {user.full_name} ({user.role})</span>
                  <button onClick={logout} className="text-rose-400 underline">Logout</button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setAuthModalOpen(true);
                  }}
                  className="w-full py-2 rounded-lg text-xs font-semibold text-white bg-slate-800 text-center"
                >
                  Faculty Sign In
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
