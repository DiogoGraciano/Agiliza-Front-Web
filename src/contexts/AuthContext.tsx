import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import toast from 'react-hot-toast';
import apiService from '../services/api';
import type { Admin, LoginResponse } from '../types';

interface AuthContextType {
  admin: Admin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<Admin>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('auth_token');
      const adminData = localStorage.getItem('admin');
      
      if (token && adminData) {
        try {
          // Tentar carregar perfil atualizado do servidor
          const profileData = await apiService.getAdminProfile();
          setAdmin(profileData);
        } catch (error) {
          // Se falhar, usar dados locais se disponíveis
          setAdmin(JSON.parse(adminData));
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiService.adminLogin({ email, password });
      localStorage.setItem('auth_token', response.token);
      
      if (response.admin) {
        localStorage.setItem('admin', JSON.stringify(response.admin));
        setAdmin(response.admin);
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Tentar fazer logout no servidor
      await apiService.adminLogout();
    } catch (error) {
      // Continuar com logout local mesmo se o servidor falhar
      console.warn('Erro ao fazer logout no servidor:', error);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('admin');
      setAdmin(null);
    }
  };

  const updateProfile = async (data: Partial<Admin>) => {
    try {
      const updatedProfile = await apiService.updateAdminProfile(data);
      setAdmin(updatedProfile);
      localStorage.setItem('admin', JSON.stringify(updatedProfile));
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    admin,
    isAuthenticated: !!admin,
    isLoading,
    login,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
