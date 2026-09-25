/**
 * Barcode regeneration.
 *
 * Barcodes are Code128 images of a booking's trackingId, originally written to
 * Public/Barcodes/<trackingId>.png at booking-creation time (see
 * controller/customer.js). Historic barcodes were never migrated to S3 and new
 * ones are only written to the instance's local disk, so on the S3-backed
 * staging/production stack these images are missing. Rather than migrate binary
 * blobs, we regenerate the barcode deterministically from the trackingId on
 * demand — the image is a pure function of that id.
 *
 * Uses the same libraries and options as the booking-creation code so the
 * regenerated image matches the original.
 */
const JsBarcode = require('jsbarcode');
const { DOMImplementation, XMLSerializer } = require('xmldom');
const svg2img = require('svg2img');

/**
 * Generate a PNG Buffer for the given trackingId.
 * @param {string} trackingId e.g. "TSH-7-140648"
 * @returns {Promise<Buffer>}
 */
function generateBarcodePng(trackingId) {
  return new Promise((resolve, reject) => {
    try {
      // A fresh DOM per call — the module-level svgNode used at booking time is
      // mutable shared state and unsafe under concurrent requests.
      const document = new DOMImplementation().createDocument(
        'http://www.w3.org/1999/xhtml',
        'html',
        null
      );
      const svgNode = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      JsBarcode(svgNode, trackingId, { xmlDocument: document });
      const svgText = new XMLSerializer().serializeToString(svgNode);
      svg2img(svgText, (error, buffer) => {
        if (error || !buffer) {
          return reject(error || new Error('Empty barcode buffer'));
        }
        resolve(buffer);
      });
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * Extract the trackingId from a Barcodes storage key, or null if not one.
 * "Public/Barcodes/TSH-7-140648.png" -> "TSH-7-140648"
 */
function trackingIdFromKey(key) {
  const m = /^Public\/Barcodes\/(.+)\.png$/i.exec(String(key || ''));
  return m ? m[1] : null;
}

module.exports = { generateBarcodePng, trackingIdFromKey };
