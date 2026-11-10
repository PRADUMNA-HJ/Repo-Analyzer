import axios, { AxiosError } from 'axios';
import {
  AnalysisResponse,
  HealthResponse,
  AnalysisErrorResponse,
  AnalysisJobStatus,
  TokenResponse,
  User,
  EvaluationSummary,
  EvaluationStats,
  ReviewNote,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Attach JWT token to all outbound requests if authenticated
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('reposcope_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export class ApiError extends Error {
  code: string;
  hint?: string;
  statusCode?: number;

  constructor(message: string, code: string = 'UNKNOWN_ERROR', hint?: string, statusCode?: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.hint = hint;
    this.statusCode = statusCode;
  }
}

export const checkHealth = async (): Promise<HealthResponse> => {
  try {
    const response = await apiClient.get<HealthResponse>('/api/v1/health');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosErr = error as AxiosError<AnalysisErrorResponse>;
      const detail = axiosErr.response?.data?.detail || axiosErr.message || 'Health check failed';
      throw new ApiError(detail, 'HEALTH_CHECK_FAILED', undefined, axiosErr.response?.status);
    }
    throw new ApiError('Unable to connect to RepoScope backend service.');
  }
};

export const analyzeTarget = async (
  githubUrl: string,
  demoMode?: boolean,
  sync: boolean = false
): Promise<AnalysisResponse> => {
  try {
    const payload: { github_url: string; demo_mode?: boolean } = {
      github_url: githubUrl.trim(),
    };
    if (demoMode !== undefined) {
      payload.demo_mode = demoMode;
    }

    const response = await apiClient.post<AnalysisResponse>(
      `/api/v1/analysis?sync=${sync}`,
      payload
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosErr = error as AxiosError<AnalysisErrorResponse>;
      if (!axiosErr.response) {
        throw new ApiError(
          'Unable to reach RepoScope backend. Please ensure the Python FastAPI backend is running on ' + API_BASE_URL,
          'NETWORK_ERROR'
        );
      }
      const data = axiosErr.response.data;
      const detail = typeof data?.detail === 'string' ? data.detail : 'Analysis request failed';
      throw new ApiError(
        detail,
        data?.code || `HTTP_${axiosErr.response.status}`,
        data?.hint,
        axiosErr.response.status
      );
    }
    throw new ApiError('An unexpected client error occurred while analyzing target.');
  }
};

export const getAnalysisStatus = async (analysisId: string): Promise<AnalysisJobStatus> => {
  try {
    const response = await apiClient.get<AnalysisJobStatus>(`/api/v1/analysis/${analysisId}/status`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosErr = error as AxiosError<AnalysisErrorResponse>;
      const detail = axiosErr.response?.data?.detail || 'Failed to retrieve job status';
      throw new ApiError(detail, 'STATUS_CHECK_FAILED', undefined, axiosErr.response?.status);
    }
    throw new ApiError('Failed to retrieve job status.');
  }
};

export const getAnalysisResult = async (analysisId: string): Promise<AnalysisResponse> => {
  try {
    const response = await apiClient.get<AnalysisResponse>(`/api/v1/analysis/${analysisId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosErr = error as AxiosError<AnalysisErrorResponse>;
      const detail = axiosErr.response?.data?.detail || 'Failed to retrieve analysis result';
      throw new ApiError(detail, 'RESULT_FETCH_FAILED', undefined, axiosErr.response?.status);
    }
    throw new ApiError('Failed to retrieve analysis result.');
  }
};

export const pollAnalysisJob = async (
  analysisId: string,
  onProgress?: (status: AnalysisJobStatus) => void,
  maxAttempts: number = 60,
  intervalMs: number = 1000
): Promise<AnalysisResponse> => {
  let attempts = 0;

  while (attempts < maxAttempts) {
    const jobStatus = await getAnalysisStatus(analysisId);
    if (onProgress) {
      onProgress(jobStatus);
    }

    if (jobStatus.stage === 'COMPLETED') {
      return await getAnalysisResult(analysisId);
    }

    if (jobStatus.stage === 'FAILED') {
      throw new ApiError(jobStatus.error || 'Analysis job failed.', 'JOB_FAILED');
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
    attempts++;
  }

  throw new ApiError('Analysis timed out. Please try again or inspect smaller repositories.', 'TIMEOUT');
};

// ==========================================
// Authentication APIs (Phase 3)
// ==========================================

export const loginUser = async (email: string, password: string): Promise<TokenResponse> => {
  try {
    const response = await apiClient.post<TokenResponse>('/api/v1/auth/login', { email, password });
    localStorage.setItem('reposcope_token', response.data.access_token);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosErr = error as AxiosError<{ detail: string }>;
      throw new ApiError(axiosErr.response?.data?.detail || 'Login failed', 'AUTH_ERROR');
    }
    throw new ApiError('Authentication failed.');
  }
};

export const registerUser = async (
  email: string,
  password: string,
  fullName: string,
  department: string,
  role: string = 'FACULTY'
): Promise<TokenResponse> => {
  try {
    const response = await apiClient.post<TokenResponse>('/api/v1/auth/register', {
      email,
      password,
      full_name: fullName,
      department,
      role,
    });
    localStorage.setItem('reposcope_token', response.data.access_token);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosErr = error as AxiosError<{ detail: string }>;
      throw new ApiError(axiosErr.response?.data?.detail || 'Registration failed', 'AUTH_ERROR');
    }
    throw new ApiError('Registration failed.');
  }
};

export const getCurrentUser = async (): Promise<User> => {
  try {
    const response = await apiClient.get<User>('/api/v1/auth/me');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosErr = error as AxiosError<{ detail: string }>;
      throw new ApiError(axiosErr.response?.data?.detail || 'Session expired', 'UNAUTHORIZED');
    }
    throw new ApiError('Unable to fetch user profile.');
  }
};

export const logoutUser = (): void => {
  localStorage.removeItem('reposcope_token');
};

// ==========================================
// Evaluation History & PDF APIs (Phase 3)
// ==========================================

export interface EvaluationListParams {
  q?: string;
  target_type?: string;
  methodology_version?: string;
  min_score?: number;
  max_score?: number;
  page?: number;
  page_size?: number;
}

export interface EvaluationListResponse {
  items: EvaluationSummary[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export const getEvaluations = async (params: EvaluationListParams = {}): Promise<EvaluationListResponse> => {
  try {
    const response = await apiClient.get<EvaluationListResponse>('/api/v1/evaluations', { params });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosErr = error as AxiosError<{ detail: string }>;
      throw new ApiError(axiosErr.response?.data?.detail || 'Failed to fetch evaluation history', 'FETCH_ERROR');
    }
    throw new ApiError('Failed to fetch evaluation history.');
  }
};

export const getEvaluationStats = async (): Promise<EvaluationStats> => {
  try {
    const response = await apiClient.get<EvaluationStats>('/api/v1/evaluations/stats/summary');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosErr = error as AxiosError<{ detail: string }>;
      throw new ApiError(axiosErr.response?.data?.detail || 'Failed to fetch evaluation stats', 'FETCH_ERROR');
    }
    throw new ApiError('Failed to fetch evaluation stats.');
  }
};

export const getEvaluationDetail = async (id: string): Promise<Record<string, unknown>> => {
  try {
    const response = await apiClient.get<Record<string, unknown>>(`/api/v1/evaluations/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosErr = error as AxiosError<{ detail: string }>;
      throw new ApiError(axiosErr.response?.data?.detail || 'Evaluation not found', 'NOT_FOUND');
    }
    throw new ApiError('Evaluation not found.');
  }
};

export const addReviewNote = async (
  evaluationId: string,
  comment: string,
  verdict: string,
  scoreOverride?: number
): Promise<ReviewNote> => {
  try {
    const response = await apiClient.post<ReviewNote>(`/api/v1/evaluations/${evaluationId}/reviews`, {
      overall_comment: comment,
      accreditation_verdict: verdict,
      manual_score_override: scoreOverride,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosErr = error as AxiosError<{ detail: string }>;
      throw new ApiError(axiosErr.response?.data?.detail || 'Failed to submit review note', 'REVIEW_ERROR');
    }
    throw new ApiError('Failed to submit review note.');
  }
};

export const downloadDossierPdf = async (
  idOrAnalysisId: string,
  isDirectAnalysis: boolean = false,
  filename?: string
): Promise<void> => {
  try {
    const url = isDirectAnalysis
      ? `/api/v1/analysis/${idOrAnalysisId}/pdf`
      : `/api/v1/evaluations/${idOrAnalysisId}/pdf`;

    const response = await apiClient.get(url, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || `RepoScope-Dossier-${idOrAnalysisId.slice(0, 8)}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosErr = error as AxiosError<{ detail: string }>;
      throw new ApiError(axiosErr.response?.data?.detail || 'Failed to download academic PDF dossier', 'DOWNLOAD_ERROR');
    }
    throw new ApiError('Failed to download academic PDF dossier.');
  }
};
