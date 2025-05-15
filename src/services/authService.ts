import { User, UserEdit } from '../types';
import { API_URL } from '../config/constants';

/**
 * Fetch the current user profile
 */
export const fetchUserProfile = async (): Promise<User> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const response = await fetch(`${API_URL}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to fetch user profile: ${response.status}`);
    } else {
      throw new Error(`Failed to fetch user profile: ${response.status} ${response.statusText}`);
    }
  }
  
  return await response.json();
};

/**
 * Update the user profile
 */
export const updateUserProfile = async (userData: UserEdit): Promise<User> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const response = await fetch(`${API_URL}/api/auth/update-profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });
  
  if (!response.ok) {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to update profile: ${response.status}`);
    } else {
      throw new Error(`Failed to update profile: ${response.status} ${response.statusText}`);
    }
  }
  
  return await response.json();
};