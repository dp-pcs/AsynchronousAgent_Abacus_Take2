
const API_BASE_URL = 'http://localhost:8001';

export interface Prediction {
  id: number;
  statement: string;
  category: string;
  confidence: number;
  due_at: string;
  status: 'open' | 'resolved';
  outcome?: number | null;
  created_at: string;
  updated_at: string;
  brier_score?: number | null;
}

export interface PredictionCreate {
  statement: string;
  category: string;
  confidence: number;
  due_at: string;
}

export interface PredictionResolve {
  outcome: number;
}

export interface LeaderboardStats {
  total_predictions: number;
  resolved_predictions: number;
  average_brier_score?: number | null;
  accuracy_rate?: number | null;
  categories: Record<string, number>;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response?.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        response.status,
        errorData?.detail || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error('Network error or server unavailable');
  }
}

export const api = {
  // Create a new prediction
  createPrediction: async (data: PredictionCreate): Promise<Prediction> => {
    return fetchApi<Prediction>('/predictions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get all predictions with optional filters
  getPredictions: async (status?: string, category?: string): Promise<Prediction[]> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (category) params.append('category', category);
    
    const query = params.toString();
    return fetchApi<Prediction[]>(`/predictions${query ? `?${query}` : ''}`);
  },

  // Resolve a prediction
  resolvePrediction: async (id: number, data: PredictionResolve): Promise<Prediction> => {
    return fetchApi<Prediction>(`/predictions/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get leaderboard statistics
  getLeaderboardStats: async (): Promise<LeaderboardStats> => {
    return fetchApi<LeaderboardStats>('/stats/leaderboard');
  },
};
