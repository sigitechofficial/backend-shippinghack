require('dotenv').config();
const admin = require('firebase-admin');

/**
 * Central Firebase Admin initialization.
 *
 * Credential source, in order of preference:
 *   1. FIREBASE_SERVICE_ACCOUNT  — the full service-account JSON as a string
 *      (production/staging: loaded from SSM Parameter Store SecureString into
 *      the environment; never committed to git).
 *   2. FIREBASE_SERVICE_ACCOUNT_BASE64 — the same JSON, base64-encoded, for
 *      environments where multi-line/quoted JSON in env is awkward.
 *   3. ../firebase.json          — local development fallback only. This file
 *      is git-ignored and must NOT be deployed.
 *
 * The credential value itself is never logged.
 */
function loadServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (raw && raw.trim()) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT is set but is not valid JSON.');
    }
  }

  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (b64 && b64.trim()) {
    try {
      return JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
    } catch (e) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_BASE64 is set but did not decode to valid JSON.');
    }
  }

  // Local-dev fallback only.
  try {
    return require('../firebase.json');
  } catch (e) {
    throw new Error(
      'No Firebase credentials found. Set FIREBASE_SERVICE_ACCOUNT (JSON from SSM) ' +
      'or provide firebase.json for local development.'
    );
  }
}

// Initialize exactly once, even if this module is required from several places.
if (!admin.apps.length) {
  const serviceAccount = loadServiceAccount();
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log('Firebase Admin initialized.');
}

module.exports = admin;
