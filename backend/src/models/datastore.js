import { randomUUID } from 'crypto';
import { config } from '../config/env.js';
import { initFirestore } from '../config/firebase.js';

/**
 * A tiny repository abstraction that exposes the same CRUD surface for both
 * Firestore and an in-memory Map. This keeps controllers/services free of
 * vendor-specific code and makes the whole API testable without credentials.
 */

// ---------- In-memory implementation ----------
class InMemoryCollection {
  constructor() {
    this.docs = new Map();
  }

  async create(data) {
    const id = data.id || randomUUID();
    const record = { ...data, id, createdAt: data.createdAt || new Date().toISOString() };
    this.docs.set(id, record);
    return record;
  }

  async getById(id) {
    return this.docs.get(id) || null;
  }

  async update(id, patch) {
    const existing = this.docs.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...patch, updatedAt: new Date().toISOString() };
    this.docs.set(id, updated);
    return updated;
  }

  async remove(id) {
    return this.docs.delete(id);
  }

  async query(predicate = () => true) {
    return [...this.docs.values()].filter(predicate);
  }

  async findOne(predicate) {
    return [...this.docs.values()].find(predicate) || null;
  }
}

// ---------- Firestore implementation ----------
class FirestoreCollection {
  constructor(db, name) {
    this.col = db.collection(name);
  }

  async create(data) {
    const id = data.id || this.col.doc().id;
    const record = { ...data, id, createdAt: data.createdAt || new Date().toISOString() };
    await this.col.doc(id).set(record);
    return record;
  }

  async getById(id) {
    const snap = await this.col.doc(id).get();
    return snap.exists ? snap.data() : null;
  }

  async update(id, patch) {
    const ref = this.col.doc(id);
    const snap = await ref.get();
    if (!snap.exists) return null;
    const updated = { ...snap.data(), ...patch, updatedAt: new Date().toISOString() };
    await ref.set(updated);
    return updated;
  }

  async remove(id) {
    await this.col.doc(id).delete();
    return true;
  }

  async query(predicate = () => true) {
    const snap = await this.col.get();
    return snap.docs.map((d) => d.data()).filter(predicate);
  }

  async findOne(predicate) {
    const all = await this.query(predicate);
    return all[0] || null;
  }
}

// ---------- Factory ----------
const collections = {};

export function getCollection(name) {
  if (collections[name]) return collections[name];

  const db = initFirestore();
  collections[name] =
    config.useInMemoryDb || !db
      ? new InMemoryCollection()
      : new FirestoreCollection(db, name);
  return collections[name];
}

// Convenience named accessors used across the app.
export const Users = () => getCollection('users');
export const Rides = () => getCollection('rides');
export const RideRequests = () => getCollection('rideRequests');
export const Messages = () => getCollection('messages');
export const Notifications = () => getCollection('notifications');

// Test helper: wipe all in-memory collections between test cases.
export function __resetInMemory() {
  Object.keys(collections).forEach((k) => delete collections[k]);
}
