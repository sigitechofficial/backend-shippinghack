require('dotenv').config();
const express = require('express');
const app = express();
const db = require('./models');
const cors = require('cors');
const error = require('./middleware/error');
const server = require('http').createServer(app);
var bodyParser = require('body-parser')
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
});

// Trust proxy when behind Nginx/ALB
if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
  app.set('trust proxy', 1);
}

// Importing routes
const customerRouter = require('./routes/customer');
const businessRouter = require('./routes/business');
const adminRouter = require('./routes/admin');
const driverRouter = require('./routes/driver');
const merchnatRouter = require('./routes/merchant');
const warehouseRouter = require('./routes/warehouse');
const authRouter = require('./routes/auth');
const webhooks = require('./routes/webhooks');

// Stripe webhooks need raw body BEFORE json parsing
app.use('/webhooks', bodyParser.raw({ type: 'application/json' }), webhooks);

// CORS — environment-driven allowed origins
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.length === 0) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
};
app.use(cors(corsOptions));

app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(bodyParser.urlencoded({ extended: true }));

// Health check — unauthenticated, fast, no third-party calls
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Readiness check — lightweight DB + Redis ping
app.get('/ready', async (_req, res) => {
  try {
    await db.sequelize.authenticate();
    const redis_Client = require('./routes/redis_connect');
    await redis_Client.ping();
    res.status(200).json({ status: 'ready' });
  } catch (err) {
    res.status(503).json({ status: 'not ready', error: err.message });
  }
});

// Routes
app.use('/customer', customerRouter);
app.use('/admin', adminRouter);
app.use('/driver', driverRouter);
app.use('/warehouse', warehouseRouter);
app.use('/business', businessRouter);
app.use('/merchant', merchnatRouter);
app.use('/auth', authRouter);

// Static files
const storage = require('./utils/storage');

// Block direct public access to sensitive upload directories (driver licences,
// signatures, restricted items). Previously ALL of ./Public was served
// unauthenticated, which exposed identity documents to anyone with the URL.
// These are now reachable only via short-lived signed URLs (see /secure-file),
// or via S3 presigned URLs when STORAGE_DRIVER=s3.
const barcodeUtil = require('./utils/barcode');
const nodePath = require('path');

// Normalize messy asset paths stored in the DB before they hit the /Public
// route. Historic rows use inconsistent forms — a leading slash
// ("/Public/Categories/x.png" → the app builds "…//Public/…"), lowercase
// ("public/x.png"), or duplicate slashes — none of which match the
// case-sensitive "/Public" mount and so 404'd. Rewrite any request whose path
// begins with (optionally repeated) "/public" in any case to the canonical
// "/Public/…" with internal double slashes collapsed.
app.use((req, res, next) => {
  const m = req.url.match(/^\/+public(\/.*)$/i);
  if (m) {
    req.url = '/Public' + m[1].replace(/\/{2,}/g, '/');
  }
  next();
});

// True when a storage/read error means "object does not exist" (S3 NoSuchKey /
// 404 metadata, or local ENOENT) as opposed to a real failure.
function isNotFound(err) {
  if (!err) return false;
  if (err.code === 'ENOENT') return true;
  if (err.name === 'NoSuchKey' || err.name === 'NotFound') return true;
  const status = err.$metadata && err.$metadata.httpStatusCode;
  return status === 404;
}

// Regenerate a missing barcode PNG from its trackingId, cache it back to storage
// (best-effort), and stream it to the client. Barcodes are a pure function of
// the trackingId, so this self-heals historic bookings whose images were never
// migrated to S3 without needing any data migration.
async function serveRegeneratedBarcode(key, res) {
  const trackingId = barcodeUtil.trackingIdFromKey(key);
  if (!trackingId) return res.status(404).end();
  const buffer = await barcodeUtil.generateBarcodePng(trackingId);
  // Persist for next time; ignore failures (still serve the freshly rendered one).
  storage.putFile(buffer, key, 'image/png').catch(() => {});
  res.type('png');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  return res.send(buffer);
}

// A file uploaded through the admin panel (multer) is written to this server's own
// ./Public folder, but with STORAGE_DRIVER=s3 files are served from S3. When S3 doesn't
// have it, serve the server's copy and copy it into S3 so it is kept there.
// Returns true when it served the file.
const PUBLIC_DIR = nodePath.join(__dirname, 'Public');
async function serveLocalUploadIntoS3(key, res) {
  const fsMod = require('fs');
  const localPath = nodePath.join(__dirname, key);
  if (!localPath.startsWith(PUBLIC_DIR + nodePath.sep)) return false;
  let buffer;
  try {
    buffer = await fsMod.promises.readFile(localPath);
  } catch (e) {
    return false;
  }
  res.type(nodePath.extname(key) || 'application/octet-stream');
  const contentType = res.get('Content-Type');
  storage.putFile(buffer, key, contentType).catch((e) => {
    console.error('Could not copy upload to S3:', key, e && e.message);
  });
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send(buffer);
  return true;
}

app.use('/Public', async (req, res, next) => {
  const key = 'Public' + req.path;
  if (storage.isSensitiveKey(key)) {
    return res.status(403).json({ status: '0', message: 'Forbidden' });
  }
  const isBarcode = barcodeUtil.trackingIdFromKey(key) !== null;

  // With STORAGE_DRIVER=s3, uploaded files (barcodes, logos, profile images, …)
  // live in the private S3 bucket, not on this instance's local ./Public folder.
  // Stream them from S3 using the app's IAM credentials so <img>/download URLs
  // like /Public/Barcodes/TSH-7-140648.png keep working. Local driver falls
  // through to express.static below.
  if (storage.DRIVER === 's3') {
    try {
      const { stream, contentType } = await storage.getObjectStream(key);
      res.type(contentType || nodePath.extname(key) || 'application/octet-stream');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      stream.on('error', () => {
        if (!res.headersSent) res.status(404).end();
      });
      return stream.pipe(res);
    } catch (e) {
      // uploaded through the admin panel but not in S3 yet
      if (isNotFound(e) && (await serveLocalUploadIntoS3(key, res))) return;
      if (isBarcode && isNotFound(e)) {
        try {
          return await serveRegeneratedBarcode(key, res);
        } catch (regenErr) {
          console.error('Barcode regeneration failed:', key, regenErr && regenErr.message);
          return res.status(500).json({ status: '0', message: 'Error retrieving file' });
        }
      }
      const code = isNotFound(e) ? 404 : 500;
      return res.status(code).json({
        status: '0',
        message: code === 404 ? 'Not found' : 'Error retrieving file',
      });
    }
  }

  // local driver: regenerate on-the-fly if a barcode file is missing on disk.
  if (isBarcode) {
    const localPath = nodePath.join(__dirname, key);
    if (!require('fs').existsSync(localPath)) {
      try {
        return await serveRegeneratedBarcode(key, res);
      } catch (regenErr) {
        console.error('Barcode regeneration failed:', key, regenErr && regenErr.message);
        return res.status(500).json({ status: '0', message: 'Error retrieving file' });
      }
    }
  }
  next();
});
app.use('/Public', express.static('./Public'));

// Signed-URL access for stored files (local driver). The HMAC-signed, expiring
// link is issued by authenticated API handlers via storage.getSignedUrl(); this
// endpoint verifies it and streams the object. When STORAGE_DRIVER=s3, signed
// URLs point directly at S3 and this route is unused.
app.get('/secure-file', async (req, res) => {
  try {
    const key = storage.verifyLocalSignedUrl({
      key: req.query.key,
      exp: req.query.exp,
      sig: req.query.sig,
    });
    if (!key) {
      return res.status(403).json({ status: '0', message: 'Invalid or expired link' });
    }
    const { stream, contentType } = await storage.getObjectStream(key);
    if (contentType) res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'private, max-age=60');
    stream.on('error', () => {
      if (!res.headersSent) res.status(404).end();
    });
    stream.pipe(res);
  } catch (e) {
    const code = e && e.code === 'ENOENT' ? 404 : 500;
    return res.status(code).json({
      status: '0',
      message: code === 404 ? 'Not found' : 'Error retrieving file',
    });
  }
});

app.use(error);

// Start server
var server_port = process.env.PORT || 3000;
let syncDb = 0;
if (syncDb) {
  db.sequelize.sync({ alter: true })
    .then(() => {
      server.listen(server_port, '0.0.0.0', function (err) {
        if (err) throw err;
        console.log('Listening on port %d', server_port);
      });
    });
} else {
  server.listen(server_port, '0.0.0.0', function (err) {
    if (err) throw err;
    console.log('Listening on port %d', server_port);
  });
}

// Every 5 minutes: orders paid on Stripe whose confirmation never reached us (the
// customer closed the website tab or the app first) are recorded as paid.
if (process.env.DISABLE_PAYMENT_RECOVERY !== 'true') {
  require('node-cron').schedule('*/5 * * * *', () => {
    require('./controller/customer')
      .recoverRecentPayments()
      .catch((err) => console.error('Payment recovery job failed:', err && err.message));
  });
  // FedEx-pickup Local orders FedEx said were booked too early are booked again
  require('node-cron').schedule('17 * * * *', () => {
    require('./controller/customer')
      .bookWaitingPickups()
      .catch((err) => console.error('Waiting pickups job failed:', err && err.message));
  });
}

// Graceful shutdown
function gracefulShutdown(signal) {
  console.log(`${signal} received. Shutting down gracefully...`);
  server.close(async () => {
    console.log('HTTP server closed');
    try {
      await db.sequelize.close();
      console.log('Database connection closed');
    } catch (e) { /* ignore */ }
    try {
      const redis_Client = require('./routes/redis_connect');
      await redis_Client.quit();
      console.log('Redis connection closed');
    } catch (e) { /* ignore */ }
    process.exit(0);
  });
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
