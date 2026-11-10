import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AnalyzerPage } from '../pages/AnalyzerPage';
import { AuthProvider } from '../context/AuthContext';
import * as apiService from '../services/api';
import { AnalysisResponse } from '../types';

const mockResponse: AnalysisResponse = {
  is_demo: true,
  target_type: 'profile',
  target_identifier: 'octocat',
  total_repositories_found: 14,
  evaluation_date: '2026-11-09T12:00:00Z',
  disclaimer: 'DEMO DATA: Phase 1 provides structured demonstration data.',
  user_profile: {
    username: 'octocat',
    name: 'The Octocat',
    avatar_url: 'https://avatars.githubusercontent.com/u/583231',
    public_repos_count: 14,
    followers: 9000,
    html_url: 'https://github.com/octocat',
  },
  analyzed_projects: [
    {
      id: 'campus-event-management-system',
      name: 'campus-event-mgmt',
      display_name: 'Campus Event Management System',
      description: 'Enterprise student engagement platform featuring real-time ticketing.',
      repo_url: 'https://github.com/fictional-demo-org/campus-event-mgmt',
      overall_score: 9.1,
      rank: 1,
      summary: 'Exceptional full-stack architecture demonstrating production-grade separation.',
      stars: 142,
      forks: 38,
      primary_language: 'TypeScript',
      updated_at: '2026-10-18T14:30:00Z',
      problem_solved: 'Eliminates fragmented spreadsheets in collegiate scheduling.',
      key_features: ['Dynamic QR code generation', 'Batch notifications'],
      architecture_notes: 'Layered architecture with microservices.',
      tech_stack: [
        { category: 'Frontend', items: ['React 18', 'TypeScript'] },
        { category: 'Backend API', items: ['FastAPI', 'Python'] },
      ],
      language_breakdown: [
        { name: 'TypeScript', percentage: 55.0, color: '#3178C6' },
        { name: 'Python', percentage: 45.0, color: '#3572A5' },
      ],
      criteria_breakdown: [
        {
          id: 'code-quality',
          name: 'Code Quality & Maintainability',
          weight: 20,
          score: 9.3,
          max_score: 10.0,
          rating_label: 'Exceptional',
          description: 'Type safety and linting discipline.',
          findings: ['Strict TypeScript typing'],
        },
      ],
      strengths: ['Exemplary architecture'],
      weaknesses: ['Missing leaky bucket rate limits'],
      recommendations: ['Implement Redis rate limiting'],
      confidence_label: 'High',
      confidence_score: 0.9,
    },
    {
      id: 'smart-disaster-response-platform',
      name: 'disaster-response-coord',
      display_name: 'Smart Disaster Response Platform',
      description: 'Geospatial emergency coordination platform.',
      repo_url: 'https://github.com/fictional-demo-org/disaster-response-coord',
      overall_score: 8.6,
      rank: 2,
      summary: 'Strong geospatial architecture with offline PWA caching.',
      stars: 98,
      forks: 24,
      primary_language: 'Python',
      updated_at: '2026-09-24T11:15:00Z',
      problem_solved: 'Coordinates emergency responders in power outages.',
      key_features: ['PostGIS heat mapping'],
      architecture_notes: 'Event-driven architecture.',
      tech_stack: [{ category: 'Backend API', items: ['FastAPI'] }],
      language_breakdown: [{ name: 'Python', percentage: 100.0, color: '#3572A5' }],
      criteria_breakdown: [
        {
          id: 'code-quality',
          name: 'Code Quality & Maintainability',
          weight: 20,
          score: 8.5,
          max_score: 10.0,
          rating_label: 'Very Strong',
          description: 'Clean coding discipline.',
          findings: ['Modular GIS packages'],
        },
      ],
      strengths: ['High resilience'],
      weaknesses: [],
      recommendations: [],
      confidence_label: 'High',
      confidence_score: 0.85,
    },
  ],
};

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>{ui}</AuthProvider>
    </BrowserRouter>
  );
};

describe('Analyzer Page Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(apiService, 'checkHealth').mockResolvedValue({
      status: 'healthy',
      application: 'RepoScope API',
      version: '3.0.0',
      environment: 'test',
      demo_mode: true,
      github_auth_configured: false,
    });
  });

  it('renders analyzer page title and input elements', () => {
    renderWithProviders(<AnalyzerPage />);

    expect(screen.getByText(/GitHub Project Analyzer/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/https:\/\/github\.com\/username/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /analyze/i })).toBeInTheDocument();
  });

  it('shows validation error for invalid non-github url', async () => {
    renderWithProviders(<AnalyzerPage />);

    const input = screen.getByPlaceholderText(/https:\/\/github\.com\/username/i);
    const analyzeBtn = screen.getByRole('button', { name: /analyze/i });

    await userEvent.type(input, 'https://gitlab.com/invalid/user');
    fireEvent.click(analyzeBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/Only public GitHub URLs \(github\.com\) are accepted/i)
      ).toBeInTheDocument();
    });
  });

  it('submits valid GitHub URL and displays response from API', async () => {
    vi.spyOn(apiService, 'analyzeTarget').mockResolvedValue(mockResponse);

    renderWithProviders(<AnalyzerPage />);

    const input = screen.getByPlaceholderText(/https:\/\/github\.com\/username/i);
    const analyzeBtn = screen.getByRole('button', { name: /analyze/i });

    await userEvent.type(input, 'https://github.com/octocat');
    fireEvent.click(analyzeBtn);

    await waitFor(() => {
      expect(screen.getAllByText(/Campus Event Management System/i)[0]).toBeInTheDocument();
      expect(screen.getAllByText(/Smart Disaster Response Platform/i)[0]).toBeInTheDocument();
    });
  });

  it('handles asynchronous polling flow for real GitHub analysis', async () => {
    const asyncInitResponse: AnalysisResponse = {
      is_demo: false,
      target_type: 'profile',
      target_identifier: 'octocat',
      total_repositories_found: 0,
      analyzed_projects: [],
      evaluation_date: '',
      disclaimer: '',
      analysis_id: 'job-test-uuid-1234',
      status: 'INITIALIZING',
    };

    vi.spyOn(apiService, 'analyzeTarget').mockResolvedValue(asyncInitResponse);

    vi.spyOn(apiService, 'pollAnalysisJob').mockImplementation(async (_id, onProgress) => {
      if (onProgress) {
        onProgress({
          analysis_id: 'job-test-uuid-1234',
          stage: 'ANALYZING_CODE',
          progress_percent: 65,
          message: 'Running AST static analyzers...',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
      return {
        ...mockResponse,
        is_demo: false,
        disclaimer: 'REAL GITHUB ANALYSIS',
      };
    });

    renderWithProviders(<AnalyzerPage />);

    const input = screen.getByPlaceholderText(/https:\/\/github\.com\/username/i);
    const analyzeBtn = screen.getByRole('button', { name: /analyze/i });

    await userEvent.type(input, 'https://github.com/octocat');
    fireEvent.click(analyzeBtn);

    await waitFor(() => {
      expect(screen.getByText(/Live GitHub Verified/i)).toBeInTheDocument();
      expect(screen.getByText(/Campus Event Management System/i)).toBeInTheDocument();
      expect(screen.getByText(/Top Projects Comparative Matrix/i)).toBeInTheDocument();
    });
  });

  it('opens detailed analysis modal when project card is selected', async () => {
    vi.spyOn(apiService, 'analyzeTarget').mockResolvedValue(mockResponse);

    renderWithProviders(<AnalyzerPage />);

    const input = screen.getByPlaceholderText(/https:\/\/github\.com\/username/i);
    const analyzeBtn = screen.getByRole('button', { name: /analyze/i });

    await userEvent.type(input, 'https://github.com/octocat');
    fireEvent.click(analyzeBtn);

    await waitFor(() => {
      expect(screen.getAllByText(/Campus Event Management System/i)[0]).toBeInTheDocument();
    });

    const viewReportBtns = screen.getAllByRole('button', { name: /View Detailed Report/i });
    fireEvent.click(viewReportBtns[0]);

    await waitFor(() => {
      expect(screen.getByText(/Executive Technical Summary/i)).toBeInTheDocument();
      expect(screen.getByText(/Main Verified Features/i)).toBeInTheDocument();
      expect(screen.getByText(/Dynamic QR code generation/i)).toBeInTheDocument();
    });
  });

  it('displays connection error if API fails', async () => {
    vi.spyOn(apiService, 'analyzeTarget').mockRejectedValue(
      new apiService.ApiError('Unable to connect to RepoScope backend service.', 'NETWORK_ERROR')
    );

    renderWithProviders(<AnalyzerPage />);

    const input = screen.getByPlaceholderText(/https:\/\/github\.com\/username/i);
    const analyzeBtn = screen.getByRole('button', { name: /analyze/i });

    await userEvent.type(input, 'https://github.com/octocat');
    fireEvent.click(analyzeBtn);

    await waitFor(() => {
      expect(screen.getByText(/Analysis or Connection Error/i)).toBeInTheDocument();
      expect(screen.getByText(/Unable to connect to RepoScope backend service\./i)).toBeInTheDocument();
    });
  });
});
