import { getCookie, deleteCookie } from './cookie';

export const isTokenExpired = (token: string): boolean => {
  try {
    // JWT token has 3 parts separated by dots
    const parts = token.split('.');
    if (parts.length !== 3) {
      return true;
    }

    // Decode the payload (second part)
    const payload = JSON.parse(atob(parts[1]));
    
    // Check if token has expiration
    if (!payload.exp) {
      return false; // No expiration set
    }

    // Check if token is expired (exp is in seconds, Date.now() is in milliseconds)
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true; // If we can't parse the token, consider it expired
  }
};

export const checkAndCleanExpiredToken = (): boolean => {
  const token = getCookie('accessToken');
  
  if (!token) {
    return false; // No token
  }

  if (isTokenExpired(token)) {
    console.log('Token is expired, removing it');
    deleteCookie('accessToken');
    return true; // Token was expired and removed
  }

  return false; // Token is valid
};

export const getTokenExpirationTime = (token: string): Date | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) {
      return null;
    }

    // Convert from seconds to milliseconds
    return new Date(payload.exp * 1000);
  } catch (error) {
    console.error('Error getting token expiration:', error);
    return null;
  }
};
