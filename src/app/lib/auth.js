// lib/auth.js
/**
 * Authentication helpers for server components
 * Provides utility functions for authentication checks
 */
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * Gets the current server session
 * @returns {Promise<Object|null>} - Session object or null if not authenticated
 */
export async function getAuthSession() {
  return await getServerSession(authOptions);
}

/**
 * Requires authentication for server components
 * @param {string[]} allowedRoles - Optional array of allowed roles
 * @returns {Promise<Object>} - Session object
 * @throws {Error} - If authentication fails or user doesn't have required role
 */
export async function requireAuth(allowedRoles = null) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    throw new Error('Authentication required');
  }
  
  if (allowedRoles && !allowedRoles.includes(session.user.role)) {
    throw new Error('Insufficient permissions');
  }
  
  return session;
}