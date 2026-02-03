const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000';

class ApiService {
  private getSessionId(): string {
    let sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const sessionId = this.getSessionId();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'X-Session-ID': sessionId,
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || error.message || 'Request failed');
    }

    return response.json();
  }

  // Alias endpoints
  async createAlias(type: 'email' | 'phone', expiryDuration: number) {
    return this.request<any>('/api/alias/create', {
      method: 'POST',
      body: JSON.stringify({ type, expiryDuration }),
    });
  }

  async getAliases() {
    return this.request<any[]>('/api/alias/');
  }

  async deleteAlias(id: string) {
    return this.request<{ success: boolean }>(`/api/alias/${id}`, {
      method: 'DELETE',
    });
  }

  async getAliasStats() {
    return this.request<{ totalCreated: number; activeCount: number; expiredCount: number }>('/api/alias/stats');
  }

  // OTP endpoints
  async getOTP(aliasId: string) {
    return this.request<any[]>(`/api/otp/${aliasId}`);
  }

  // Health check
  async healthCheck() {
    return this.request<{ status: string; uptime: number; mongo: string }>('/api/health');
  }
}

export const apiService = new ApiService();

