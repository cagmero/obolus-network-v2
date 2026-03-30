/**
 * Obolus API Client
 * Handles communication with the MongoDB backend with EIP-712 auth support.
 */

const SERVER_BASE = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';
const SERVER_URL = `${SERVER_BASE.replace(/\/$/, '')}/api/v1`;

export interface ApiRequestOptions extends RequestInit {
  walletAddress?: string;
  signature?: string;
  nonce?: string;
}

export const api = {
  async request<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
    const { walletAddress, signature, nonce, ...fetchOptions } = options;
    
    const headers = new Headers(fetchOptions.headers || {});
    headers.set('Content-Type', 'application/json');
    
    if (walletAddress) headers.set('x-wallet-address', walletAddress);
    if (signature) headers.set('x-signature', signature);
    if (nonce) headers.set('x-nonce', nonce);

    const url = endpoint.startsWith('http') ? endpoint : `${SERVER_URL}${endpoint}`;
    
    console.log(`[OBOLUS:API] → ${fetchOptions.method || 'GET'} ${endpoint}`);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown Error' }));
        console.error(`[OBOLUS:API:ERROR] ← ${response.status} ${endpoint}`, error);
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`[OBOLUS:API] ← ${response.status} ${endpoint}`, { keys: Object.keys(data) });
      return data as T;
    } catch (e: any) {
      console.error(`[OBOLUS:API:FATAL] ${endpoint}`, e.message);
      throw e;
    }
  },

  get<T>(endpoint: string, options: ApiRequestOptions = {}) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  },

  post<T>(endpoint: string, body: any, options: ApiRequestOptions = {}) {
    return this.request<T>(endpoint, { 
      ...options, 
      method: 'POST', 
      body: JSON.stringify(body) 
    });
  },

  put<T>(endpoint: string, body: any, options: ApiRequestOptions = {}) {
    return this.request<T>(endpoint, { 
      ...options, 
      method: 'PUT', 
      body: JSON.stringify(body) 
    });
  },

  delete<T>(endpoint: string, options: ApiRequestOptions = {}) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  },
};
