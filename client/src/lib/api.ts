import axios from 'axios';

const TOKEN_KEY = 'flownexus_token';

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? '/api', timeout: 15_000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(undefined, (error) => {
  if (error.response?.status === 401 && !String(error.config?.url).includes('/auth/login')) {
    localStorage.removeItem(TOKEN_KEY);
    window.dispatchEvent(new Event('flownexus:unauthorized'));
  }
  return Promise.reject(error);
});

export function getApiError(error: unknown): string {
  if (axios.isAxiosError(error)) return error.response?.data?.error?.message ?? 'Unable to reach FlowNexus. Please try again.';
  return error instanceof Error ? error.message : 'Something went wrong.';
}

export { TOKEN_KEY };
