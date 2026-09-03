'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('rem_auth_user');
      if (storedUser) setUser(JSON.parse(storedUser));
      const storedToken = localStorage.getItem('rem_auth_token');
      if (storedToken) setToken(storedToken);
    } catch {
      // Ignore
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (user) {
        localStorage.setItem('rem_auth_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('rem_auth_user');
      }

      if (token) {
        localStorage.setItem('rem_auth_token', token);
      } else {
        localStorage.removeItem('rem_auth_token');
      }
    }
  }, [user, token]);

  // Firebase Google Sign-In with popup
  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      const mockPayload = {
        googleId: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
        picture: firebaseUser.photoURL || ''
      };

      const res = await api.googleLogin(null, mockPayload);
      setUser(res.user);
      setToken(res.token);
      return res;
    } catch (err) {
      console.error('Firebase Google Sign-In Error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (credential, mockUser = null) => {
    setLoading(true);
    try {
      const res = await api.googleLogin(credential, mockUser);
      setUser(res.user);
      setToken(res.token);
      return res;
    } finally {
      setLoading(false);
    }
  };

  const loginWithKey = async (loginKey) => {
    setLoading(true);
    try {
      const res = await api.keyLogin(loginKey);
      setUser(res.user);
      setToken(res.token);
      return res;
    } finally {
      setLoading(false);
    }
  };

  const regenerateDeviceKey = async () => {
    if (!token) return;
    const res = await api.regenerateKey(token);
    if (res && res.loginKey) {
      setUser(prev => ({ ...prev, loginKey: res.loginKey }));
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch {
      // Ignore signOut error
    }
    setUser(null);
    setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('rem_auth_user');
      localStorage.removeItem('rem_auth_token');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user),
        loading,
        signInWithGoogle,
        loginWithGoogle,
        loginWithKey,
        regenerateDeviceKey,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
