import { useUserStore } from '../store/user-store';
import { jwtDecode } from 'jwt-decode';
import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DecodedToken {
  userId: string;
  username: string;
  email: string;
  role: string;
  exp: number;
  iat: number;
}

export const useAuth = () => {
  const { setUser, clearUser } = useUserStore();

  const decodeAndSetUser = useCallback(async (token: string) => {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      
      // Check if token is expired
      const currentTime = Date.now() / 1000;
      if (decoded.exp < currentTime) {
        throw new Error('Token expired');
      }
      
      // Store token using AsyncStorage (asynchronous)
      await AsyncStorage.setItem('token', token);

      setUser({
        userId: decoded.userId,
        username: decoded.username,
        email: decoded.email,
        role: decoded.role,
      });
      
      return decoded;
    } catch (error) {
      console.error('Failed to decode token:', error);
      // Remove token if invalid
      await AsyncStorage.removeItem('token').catch(err => 
        console.error('Error removing token:', err)
      );
      clearUser();
      return null;
    }
  }, [setUser, clearUser]);

  const removeToken = useCallback(async () => {
    try {
      await AsyncStorage.removeItem('token');
      clearUser();
    } catch (error) {
      console.error('Error removing token:', error);
    }
  }, [clearUser]);

  const isAuthenticated = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return false;
      
      const decoded = jwtDecode<DecodedToken>(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch (error) {
      console.error('Failed to check authentication status:', error);
      return false;
    }
  };

  // Synchronous version for quick checks (no async/await)
  // Useful in components that can't handle async directly
  const isAuthenticatedSync = () => {
    // This is not a true sync function as AsyncStorage is async-only
    // But it provides a simple way to check auth status for UI rendering
    return useUserStore.getState().user !== null;
  };

  return { 
    decodeAndSetUser, 
    removeToken, 
    isAuthenticated,
    isAuthenticatedSync
  };
};