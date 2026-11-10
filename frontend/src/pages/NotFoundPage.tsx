import React from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <Layout>
      <div className="py-24 text-center space-y-6 max-w-md mx-auto px-4">
        <div className="text-7xl font-extrabold font-mono text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
          404
        </div>
        <h1 className="text-2xl font-bold text-white">
          Page Not Found
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          The requested path does not exist on RepoScope. Return home to inspect projects or evaluate repositories.
        </p>
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>
        </div>
      </div>
    </Layout>
  );
};
