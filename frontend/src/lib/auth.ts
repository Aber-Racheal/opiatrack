import { clearAuthToken } from './idb';

export function saveToken(token: string) {
  localStorage.setItem('token', token);
}

export function getToken(): string | null {
  return localStorage.getItem('token');
}

export function removeToken() {
  localStorage.removeItem('token');
}

export async function logoutUser() {
  removeToken();           // Clear from localStorage
  await clearAuthToken();  // Clear from IndexedDB
  localStorage.removeItem("offline_access_granted"); // Optional: clear offline access
  localStorage.removeItem("offline_passcode_hash");  // Optional: clear offline PIN
}
