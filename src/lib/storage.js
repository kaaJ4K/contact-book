import { createSeedContacts } from '../data/seed.js';
import { normalizeContact } from './contacts.js';

export const STORAGE_KEY = 'contact-atlas.book.v1';
export const STORAGE_VERSION = 1;

function safeParse(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function loadBook() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { contacts: createSeedContacts(), seeded: true };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { contacts: createSeedContacts(), seeded: true };
    }
    const parsed = safeParse(raw);
    if (!parsed || !Array.isArray(parsed.contacts)) {
      return { contacts: createSeedContacts(), seeded: true };
    }
    return {
      contacts: parsed.contacts.map((contact) => normalizeContact(contact)),
      seeded: false,
    };
  } catch {
    return { contacts: createSeedContacts(), seeded: true };
  }
}

export function saveBook(contacts) {
  if (typeof window === 'undefined' || !window.localStorage) return false;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: STORAGE_VERSION,
        savedAt: new Date().toISOString(),
        contacts,
      }),
    );
    return true;
  } catch {
    return false;
  }
}

export function hasStoredBook() {
  if (typeof window === 'undefined' || !window.localStorage) return false;
  try {
    return Boolean(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return false;
  }
}

export function resetBook() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return createSeedContacts();
  }
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage failures; the in-memory reset still works.
  }
  return createSeedContacts();
}
