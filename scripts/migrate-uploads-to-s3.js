#!/usr/bin/env node
/**
 * One-time migration: copy existing ./Public uploads into the S3 bucket,
 * preserving the same relative keys (so database paths keep working).
 *
 * Sensitive keys (driver licences, signatures, restricted items) are uploaded
 * PRIVATE. Non-sensitive assets are uploaded public-read only if S3_PUBLIC_ACL
 * is "true"; otherwise they are private and served via signed URLs too.
 *
 * Usage:
 *   S3_BUCKET=... S3_REGION=... node scripts/migrate-uploads-to-s3.js --dry-run
 *   S3_BUCKET=... S3_REGION=... node scripts/migrate-uploads-to-s3.js
 *
 * Credentials come from the environment/instance role. No keys in code.
 * Safe to re-run: existing objects are skipped unless --overwrite is passed.
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const storage = require('../utils/storage');
const {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
} = require('@aws-sdk/client-s3');

const DRY_RUN = process.argv.includes('--dry-run');
const OVERWRITE = process.argv.includes('--overwrite');

const BUCKET = process.env.S3_BUCKET;
const REGION = process.env.S3_REGION || process.env.AWS_REGION || 'us-east-1';
const PUBLIC_ACL = process.env.S3_PUBLIC_ACL === 'true';

if (!BUCKET) {
  console.error('ERROR: S3_BUCKET env var is required.');
  process.exit(1);
}

const ROOT = path.join(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'Public');
const s3 = new S3Client({ region: REGION });

const CONTENT_TYPES = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf', '.csv': 'text/csv',
};

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else acc.push(full);
  }
  return acc;
}

async function exists(key) {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    return true;
  } catch {
    return false;
  }
}

(async () => {
  const files = walk(PUBLIC_DIR);
  console.log(`Found ${files.length} files under ./Public`);
  console.log(`Target: s3://${BUCKET} (${REGION})  dryRun=${DRY_RUN}  overwrite=${OVERWRITE}\n`);

  let uploaded = 0, skipped = 0, priv = 0, pub = 0;

  for (const full of files) {
    const key = storage.normalizeKey('Public/' + path.relative(PUBLIC_DIR, full));
    const sensitive = storage.isSensitiveKey(key);
    const ext = path.extname(full).toLowerCase();
    const contentType = CONTENT_TYPES[ext];
    const acl = sensitive ? undefined : (PUBLIC_ACL ? 'public-read' : undefined);

    if (!OVERWRITE && (await exists(key))) {
      skipped++;
      continue;
    }

    console.log(`${sensitive ? '[PRIVATE]' : '[public ]'} ${key}`);
    sensitive ? priv++ : pub++;

    if (!DRY_RUN) {
      await s3.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: fs.createReadStream(full),
        ContentType: contentType,
        ACL: acl,
      }));
    }
    uploaded++;
  }

  console.log(`\nDone. uploaded=${uploaded} skipped=${skipped} (private=${priv}, public=${pub})`);
  if (DRY_RUN) console.log('DRY RUN — nothing was actually uploaded.');
})().catch((e) => {
  console.error('Migration failed:', e.message);
  process.exit(1);
});
