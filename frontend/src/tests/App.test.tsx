import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';
import * as apiService from '../services/api';

describe('RepoScope Frontend Application', () => {
  beforeEach(() => {
    vi.spyOn(apiService, 'checkHealth').mockResolvedValue({
      status: 'healthy',
      application: 'RepoScope API',
      version: '1.0.0',
      environment: 'test',
      demo_mode: true,
    });
  });

  it('renders landing page with headline and hero elements', () => {
    render(<App />);
    expect(screen.getByText(/Go Beyond/i)).toBeInTheDocument();
    expect(screen.getByText(/GitHub Repositories\./i)).toBeInTheDocument();
    expect(screen.getByText(/Discover the engineering behind every project\./i)).toBeInTheDocument();
    expect(screen.getByText(/Analyze a GitHub Profile/i)).toBeInTheDocument();
  });

  it('renders platform features section', () => {
    render(<App />);
    expect(screen.getByText(/Intelligent Repository Discovery/i)).toBeInTheDocument();
    expect(screen.getByText(/Top 3 Project Identification/i)).toBeInTheDocument();
    expect(screen.getByText(/Technology Stack Detection/i)).toBeInTheDocument();
    expect(screen.getByText(/Faculty-Friendly Assessment/i)).toBeInTheDocument();
  });

  it('renders the 3-step how it works workflow', () => {
    render(<App />);
    expect(screen.getByText(/STEP 1 — Enter GitHub URL/i)).toBeInTheDocument();
    expect(screen.getByText(/STEP 2 — Analyze Projects/i)).toBeInTheDocument();
    expect(screen.getByText(/STEP 3 — Discover Project Insights/i)).toBeInTheDocument();
  });

  it('renders the 8 evaluation criteria with weights', () => {
    render(<App />);
    expect(screen.getByText(/Code Quality & Maintainability/i)).toBeInTheDocument();
    expect(screen.getByText(/Architecture & Structure/i)).toBeInTheDocument();
    expect(screen.getByText(/20% Weight/i)).toBeInTheDocument();
    const fifteenPercentWeights = screen.getAllByText(/15% Weight/i);
    expect(fifteenPercentWeights.length).toBe(2);
  });
});
