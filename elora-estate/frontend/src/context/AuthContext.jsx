import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as authApi from '../api/auth';
import { setAccessToken } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // On first load, there's no access token in memory (page refresh clears
  // JS state), but the httpOnly refresh cookie may still be valid — try a
  // silent refresh so the person isn't logged out just from reloading.
  useEffect(() => {
    (async () => {
      try {
        const { data } = await authApi.refreshSession();
        setAccessToken(data.accessToken);
        const me = await authApi.fetchMe();
        setUser(me.data.user);
      } catch {
        setAccessToken(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const applySession = useCallback((accessToken, userDoc) => {
    setAccessToken(accessToken);
    setUser(userDoc);
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, applySession, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
