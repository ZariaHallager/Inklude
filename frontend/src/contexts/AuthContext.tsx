import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { auth as authApi, setToken, clearToken } from '../lib/api';
import type { Account } from '../lib/types';

interface AuthState {
  user: Account | null;
  loading: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for token in URL params (OAuth callback)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      setToken(token);
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Fetch current user
  useEffect(() => {
    const token = localStorage.getItem('inklude_token');
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then((me: any) => {
        setUser({
          id: me.id,
          email: me.email,
          display_name: me.display_name,
          role: me.role,
          avatar_url: me.avatar_url ?? null,
          identity_id: me.identity_id ?? null,
        });
      })
      .catch(() => {
        clearToken();
      })
      .finally(() => setLoading(false));
  }, []);

  const login = () => {
    window.location.href = authApi.loginUrl();
  };

  const logout = () => {
    clearToken();
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
