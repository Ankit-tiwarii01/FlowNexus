import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AuthResponse, LoginInput, RegisterInput, UserDto } from '@flownexus/shared';
import { api, TOKEN_KEY } from '../lib/api';

interface AuthContextValue {
  user: UserDto | null;
  loading: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  useEffect(() => {
    const restore = async () => {
      if (!localStorage.getItem(TOKEN_KEY)) return setLoading(false);
      try {
        const { data } = await api.get<{ user: UserDto }>('/auth/me');
        setUser(data.user);
      } catch { logout(); }
      finally { setLoading(false); }
    };
    void restore();
    window.addEventListener('flownexus:unauthorized', logout);
    return () => window.removeEventListener('flownexus:unauthorized', logout);
  }, [logout]);

  const authenticate = async (path: string, input: LoginInput | RegisterInput) => {
    const { data } = await api.post<AuthResponse>(path, input);
    localStorage.setItem(TOKEN_KEY, data.token);
    setUser(data.user);
  };

  const value = useMemo(() => ({
    user, loading,
    login: (input: LoginInput) => authenticate('/auth/login', input),
    register: (input: RegisterInput) => authenticate('/auth/register', input),
    logout,
  }), [user, loading, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
