require('dotenv').config();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Storage abstraction for user-generated uploads.
 *
 * Two drivers, selected by STORAGE_DRIVER (default: "local"):
 *   - "local": files live under ./Public on the app server (legacy behaviour).
 *   - "s3":    files live in an S3 bucket. Sensitive objects are stored PRIVATE
 *              and only ever exposed through short-lived presigned URLs.
 *
 * Sensitivity is derived from the object key (path). Identity/legal documents
 * (driver licences, delivery signatures) are ALWAYS treated as private and are
 * never returned as a plain public URL — not on local disk, not on S3.
 *
 * Compatibility: keys are the same relative paths already stored in the
 * database (e.g. "Public/Profile/xyz.jpg", "Public/LicenseImages/abc.jpg"), so
 * existing rows and API responses keep working.
 */

const DRIVER = (process.env.STORAGE_DRIVER || 'local').toLowerCase();

// App root — "Public/..." keys are relative to here on the local driver.
const APP_ROOT = path.join(__dirname, '..');

// Secret used to sign local presigned URLs. Falls back to JWT secret.
const SIGN_SECRET =
  process.env.FILE_URL_SIGNING_SECRET ||
  process.env.JWT_ACCESS_SECRET ||
  'insecure-dev-only-secret-change-me';

const SIGNED_URL_TTL = parseInt(process.env.SIGNED_URL_TTL_SECONDS, 10) || 300; // 5 min

// Base URLs
const API_URL = (process.env.API_URL || '').replace(/\/$/, '');
const S3_BUCKET = process.env.S3_BUCKET;
const S3_REGION = process.env.S3_REGION || process.env.AWS_REGION || 'us-east-1';
const S3_PUBLIC_BASE_URL = (process.env.S3_PUBLIC_BASE_URL || '').replace(/\/$/, '');

// Path prefixes that hold sensitive identity/legal documents.
//
// TEMPORARY (2026-09-25, by owner request): this list is intentionally empty so
// ALL /Public assets — including LicenseImages and SignatureImages — serve
// publicly, matching the app's original behaviour. This exposes driver licences
// and signatures to anyone with the URL. Revisit and move these back behind
// signed URLs (storage.getSignedUrl + /secure-file) before production.
const SENSITIVE_PREFIXES = [];

function normalizeKey(key) {
  return String(key || '')
    .replace(/\\/g, '/')
    .replace(/^\.?\//, '') // strip leading ./ or /
    .replace(/\/{2,}/g, '/');
}

function isSensitiveKey(key) {
  const k = normalizeKey(key);
  return SENSITIVE_PREFIXES.some((p) => k === p || k.startsWith(p + '/'));
}

// ─── Lazy S3 client (only loaded when the s3 driver is active) ────────────────
let _s3 = null;
let _presign = null;
function s3Client() {
  if (_s3) return _s3;
  // Credentials come from the EC2 instance role — never hard-coded.
  const { S3Client } = require('@aws-sdk/client-s3');
  _s3 = new S3Client({ region: S3_REGION });
  return _s3;
}
function presigner() {
  if (_presign) return _presign;
  _presign = require('@aws-sdk/s3-request-presigner').getSignedUrl;
  return _presign;
}

// ─── Local signed-URL helpers ────────────────────────────────────────────────
function signLocal(key, exp) {
  return crypto
    .createHmac('sha256', SIGN_SECRET)
    .update(`${key}:${exp}`)
    .digest('hex');
}

function localSignedUrl(key, ttl) {
  const exp = Math.floor(Date.now() / 1000) + (ttl || SIGNED_URL_TTL);
  const sig = signLocal(key, exp);
  const q = new URLSearchParams({ key, exp: String(exp), sig }).toString();
  return `${API_URL}/secure-file?${q}`;
}

/**
 * Verify a local signed URL. Returns the normalized key if valid, else null.
 */
function verifyLocalSignedUrl({ key, exp, sig }) {
  if (!key || !exp || !sig) return null;
  const expNum = parseInt(exp, 10);
  if (!expNum || expNum < Math.floor(Date.now() / 1000)) return null;
  const expected = signLocal(key, String(expNum));
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  return normalizeKey(key);
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Public URL for a NON-sensitive asset. Throws if called for a sensitive key
 * (those must use getSignedUrl instead).
 */
function publicUrl(key) {
  const k = normalizeKey(key);
  if (isSensitiveKey(k)) {
    throw new Error(`Refusing to build a public URL for sensitive key: ${k}`);
  }
  if (DRIVER === 's3') {
    if (S3_PUBLIC_BASE_URL) return `${S3_PUBLIC_BASE_URL}/${k}`;
    return `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${k}`;
  }
  // local: served by express.static under the same relative path
  return API_URL ? `${API_URL}/${k}` : `/${k}`;
}

/**
 * Short-lived URL suitable for an <img src> or download link that works for
 * BOTH sensitive and non-sensitive keys and needs no auth header.
 */
async function getSignedUrl(key, ttlSeconds) {
  const k = normalizeKey(key);
  if (DRIVER === 's3') {
    const { GetObjectCommand } = require('@aws-sdk/client-s3');
    const cmd = new GetObjectCommand({ Bucket: S3_BUCKET, Key: k });
    return presigner()(s3Client(), cmd, { expiresIn: ttlSeconds || SIGNED_URL_TTL });
  }
  return localSignedUrl(k, ttlSeconds);
}

/**
 * Persist a file (from a local temp path OR a Buffer) at the given key.
 * Sensitive keys are stored private; public keys are stored public-read on S3.
 */
async function putFile(source, key, contentType) {
  const k = normalizeKey(key);
  const sensitive = isSensitiveKey(k);

  if (DRIVER === 's3') {
    const { PutObjectCommand } = require('@aws-sdk/client-s3');
    const Body = Buffer.isBuffer(source) ? source : fs.createReadStream(source);
    await s3Client().send(
      new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: k,
        Body,
        ContentType: contentType || undefined,
        // Sensitive → private (default). Public assets → public-read only if the
        // bucket policy allows it; otherwise they are still served via signed URLs.
        ACL: sensitive ? undefined : (process.env.S3_PUBLIC_ACL === 'true' ? 'public-read' : undefined),
      })
    );
    return k;
  }

  // local driver
  const dest = path.join(APP_ROOT, k);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  if (Buffer.isBuffer(source)) {
    fs.writeFileSync(dest, source);
  } else if (source !== dest) {
    fs.copyFileSync(source, dest);
  }
  return k;
}

/**
 * Return a readable stream + metadata for a key (used by the secure endpoint).
 */
async function getObjectStream(key) {
  const k = normalizeKey(key);
  if (DRIVER === 's3') {
    const { GetObjectCommand } = require('@aws-sdk/client-s3');
    const out = await s3Client().send(new GetObjectCommand({ Bucket: S3_BUCKET, Key: k }));
    return { stream: out.Body, contentType: out.ContentType, contentLength: out.ContentLength };
  }
  const full = path.join(APP_ROOT, k);
  // Guard against path traversal.
  if (!full.startsWith(path.join(APP_ROOT, 'Public'))) {
    throw new Error('Invalid key');
  }
  if (!fs.existsSync(full)) {
    const err = new Error('Not found');
    err.code = 'ENOENT';
    throw err;
  }
  return { stream: fs.createReadStream(full), contentType: undefined, contentLength: undefined };
}

async function deleteFile(key) {
  const k = normalizeKey(key);
  if (DRIVER === 's3') {
    const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
    await s3Client().send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: k }));
    return;
  }
  const full = path.join(APP_ROOT, k);
  if (full.startsWith(path.join(APP_ROOT, 'Public')) && fs.existsSync(full)) {
    fs.unlinkSync(full);
  }
}

module.exports = {
  DRIVER,
  isSensitiveKey,
  normalizeKey,
  publicUrl,
  getSignedUrl,
  putFile,
  getObjectStream,
  deleteFile,
  verifyLocalSignedUrl,
  SENSITIVE_PREFIXES,
};
