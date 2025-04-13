/**
 * Checks if a token is present in local storage
 */
export const hasToken = (): boolean => {
  return !!localStorage.getItem('token');
};

/**
 * Parses a JWT token to extract the payload
 */
export const parseJwt = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

/**
 * Checks if a JWT token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  const decoded = parseJwt(token);
  if (!decoded) return true;
  
  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
};

/**
 * Validates that the form contains a valid email address
 */
export const validateEmail = (email: string): boolean => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

/**
 * Helper functions for authentication
 */

const isTokenValid = (token: string): boolean => {
  if (!token) return false;
  
  try {
    // Simple check - in a real app you'd parse and verify the JWT
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTimestamp = payload.exp * 1000; // Convert to milliseconds
    return Date.now() < expirationTimestamp;
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
};

const getAuthHeader = (): Record<string, string> => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default {
  isTokenValid,
  getAuthHeader
};
