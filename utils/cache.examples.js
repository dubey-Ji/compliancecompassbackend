/**
 * Cache Service Usage Examples
 * 
 * This file demonstrates how to use the extensible cache service
 * for various caching scenarios.
 */

import cache from './cache.js';

// Example 1: Basic caching with TTL
export async function basicCachingExample() {
  const namespace = 'user';
  const key = 'user:123';
  const userData = { id: 123, name: 'John Doe', email: 'john@example.com' };
  
  // Set with 1 hour TTL (3600 seconds)
  await cache.set(namespace, key, userData, 3600);
  
  // Get cached value
  const cached = await cache.get(namespace, key);
  
  // Delete when done
  await cache.del(namespace, key);
}

// Example 2: Caching API responses
export async function apiResponseCachingExample() {
  const namespace = 'api';
  const endpoint = '/api/users';
  
  // Check if cached
  const cached = await cache.get(namespace, endpoint);
  if (cached) {
    return cached;
  }
  
  // Fetch from API
  const response = await fetch('https://api.example.com/users');
  const data = await response.json();
  
  // Cache for 5 minutes (300 seconds)
  await cache.set(namespace, endpoint, data, 300);
  
  return data;
}

// Example 3: Rate limiting / counter
export async function rateLimitingExample(userId) {
  const namespace = 'ratelimit';
  const key = `user:${userId}`;
  
  // Increment counter
  const count = await cache.increment(namespace, key);
  
  // Set expiration on first increment
  if (count === 1) {
    await cache.set(namespace, key, 1, 60); // 1 minute window
  }
  
  // Check if limit exceeded
  if (count > 10) {
    throw new Error('Rate limit exceeded');
  }
  
  return count;
}

// Example 4: Session storage
export async function sessionStorageExample(sessionId, sessionData) {
  const namespace = 'session';
  
  // Store session with 24 hour TTL
  await cache.set(namespace, sessionId, sessionData, 86400);
  
  // Retrieve session
  const session = await cache.get(namespace, sessionId);
  
  return session;
}

// Example 5: Cache invalidation by namespace
export async function cacheInvalidationExample() {
  const namespace = 'catalog';
  
  // Clear all catalog-related cache
  const deleted = await cache.clearNamespace(namespace);
  console.log(`Cleared ${deleted} keys from ${namespace} namespace`);
}

// Example 6: Batch operations
export async function batchOperationsExample() {
  const namespace = 'products';
  const products = {
    'product:1': { id: 1, name: 'Product 1' },
    'product:2': { id: 2, name: 'Product 2' },
    'product:3': { id: 3, name: 'Product 3' },
  };
  
  // Set multiple keys at once with 1 hour TTL
  await cache.mset(namespace, products, 3600);
}

// Example 7: Check cache status
export async function cacheStatusExample(key) {
  const namespace = 'data';
  
  // Check if key exists
  const exists = await cache.exists(namespace, key);
  
  if (exists) {
    // Get remaining TTL
    const ttl = await cache.getTTL(namespace, key);
    console.log(`Key exists with ${ttl} seconds remaining`);
  }
}

// Example 8: Different namespaces for different data types
export async function multipleNamespacesExample() {
  // User data cache
  await cache.set('user', '123', { name: 'John' }, 3600);
  
  // Product catalog cache
  await cache.set('catalog', 'products', [{ id: 1 }], 7200);
  
  // API response cache
  await cache.set('api', '/endpoint', { data: 'value' }, 300);
  
  // Session cache
  await cache.set('session', 'sess123', { userId: 123 }, 86400);
}

