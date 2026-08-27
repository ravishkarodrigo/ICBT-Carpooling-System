import { v4 as uuidv4 } from 'uuid';

/**
 * Simple in-memory datastore.
 * Supports create, getById, findOne, query, update, and delete.
 * Each collection is a Map<id, record>.
 */

function createCollection() {
  const store = new Map();

  return {
    async create(data) {
      const id = uuidv4();
      const record = { id, ...data, createdAt: new Date().toISOString() };
      store.set(id, record);
      return record;
    },

    async getById(id) {
      return store.get(id) || null;
    },

    async findOne(predicate) {
      for (const record of store.values()) {
        if (predicate(record)) return record;
      }
      return null;
    },

    async query(predicate) {
      const results = [];
      for (const record of store.values()) {
        if (predicate(record)) results.push(record);
      }
      return results;
    },

    async update(id, patch) {
      const existing = store.get(id);
      if (!existing) return null;
      const updated = { ...existing, ...patch, updatedAt: new Date().toISOString() };
      store.set(id, updated);
      return updated;
    },

    async delete(id) {
      return store.delete(id);
    },

    async clear() {
      store.clear();
    },

    size() {
      return store.size;
    },
  };
}

// Singleton collections — reset between test runs via reset()
const collections = {
  users: createCollection(),
  rides: createCollection(),
  rideRequests: createCollection(),
  notifications: createCollection(),
  messages: createCollection(),
};

// Accessor functions (match import style in service files)
export const Users = () => collections.users;
export const Rides = () => collections.rides;
export const RideRequests = () => collections.rideRequests;
export const Notifications = () => collections.notifications;
export const Messages = () => collections.messages;

/**
 * Wipe all collections. Call in test beforeEach to get a clean slate.
 */
export async function resetDatastore() {
  await Promise.all(Object.values(collections).map((c) => c.clear()));
}
