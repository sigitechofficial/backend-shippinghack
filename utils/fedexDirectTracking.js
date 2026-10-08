// International direct delivery by FedEx: the order follows FedEx tracking by itself.
//
// An International order the warehouse shipped direct (status 14 "shipped") with FedEx
// as its company is checked regularly with FedEx's Track API (the FedEx tracking numbers
// of its packages, from the label made at payment). FedEx's latest status is kept on the
// order (bookings.carrierTracking) for the app, website and panels; the customer gets a
// push notification when it moves to a new stage (in English or Spanish); and when FedEx
// says delivered (every package), the order is completed exactly like the warehouse's
// "Mark delivered" (status Delivered, admin earning, "delivered" email).
// Other companies (e.g. TCS) are not touched: they stay "Mark delivered" by hand.
const { Op } = require("sequelize");
const { booking, package, logisticCompany, user, deviceToken } = require("../models");
const fedex = require("../controller/fedex");
const admin = require("../helper/firebaseAdmin");

const SHIPPED = 14;

// FedEx status codes → our stage. Anything not listed while moving is "in_transit".
const STAGE_OF_CODE = {
  OC: "label", // shipment information sent to FedEx (label made, not picked up yet)
  IN: "label",
  PU: "picked_up",
  OD: "out_for_delivery",
  DL: "delivered",
  DE: "exception",
  SE: "exception",
  CD: "exception", // clearance delay
  RS: "exception", // return to shipper
  DY: "exception", // delay
  HL: "ready_for_pickup", // held at a FedEx location for the recipient
  HP: "ready_for_pickup",
  CA: "cancelled",
};
const ORDER = ["label", "picked_up", "in_transit", "out_for_delivery", "delivered"];
const PROBLEM = ["exception", "ready_for_pickup", "cancelled"];

function stageOf(code) {
  if (!code) return null;
  return STAGE_OF_CODE[code] || "in_transit";
}

// The customer's notification for a new stage, in their language ('es' = Spanish)
const TEXT = {
  picked_up: {
    en: ["FedEx picked up your order", "Order @tid is on its way to the delivery address."],
    es: ["FedEx recogió tu pedido", "El pedido @tid va en camino a la dirección de entrega."],
  },
  in_transit: {
    en: ["Your order is on the way", "Order @tid is moving with FedEx@place."],
    es: ["Tu pedido va en camino", "El pedido @tid avanza con FedEx@place."],
  },
  out_for_delivery: {
    en: ["Out for delivery today", "FedEx will deliver order @tid today."],
    es: ["En reparto hoy", "FedEx entregará el pedido @tid hoy."],
  },
  delivered: {
    en: ["Order delivered", "FedEx delivered order @tid."],
    es: ["Pedido entregado", "FedEx entregó el pedido @tid."],
  },
  exception: {
    en: ["Delivery problem", "FedEx reported a problem delivering order @tid. We are checking it."],
    es: ["Problema con la entrega", "FedEx reportó un problema al entregar el pedido @tid. Lo estamos revisando."],
  },
  ready_for_pickup: {
    en: ["Waiting at FedEx", "Order @tid is waiting at a FedEx location for pickup@place."],
    es: ["Esperando en FedEx", "El pedido @tid está esperando en una ubicación de FedEx para ser recogido@place."],
  },
  cancelled: {
    en: ["FedEx shipment cancelled", "The FedEx shipment of order @tid was cancelled. We are checking it."],
    es: ["Envío de FedEx cancelado", "El envío de FedEx del pedido @tid fue cancelado. Lo estamos revisando."],
  },
};

// The JSON columns come back as text on some databases
function readJson(value) {
  if (typeof value !== "string") return value || null;
  try {
    return JSON.parse(value);
  } catch (e) {
    return null;
  }
}

const isFedex = (company) => String(company?.title || "").toLowerCase().replace(/[^a-z]/g, "") === "fedex";

// The order's FedEx tracking numbers: one per package (else the order's list)
function trackingNumbersOf(b) {
  const clean = (t) => String(t || "").replace(/["\s]/g, "");
  const fromPackages = (b.packages || []).map((p) => clean(p.logisticCompanyTrackingNum)).filter(Boolean);
  if (fromPackages.length) return [...new Set(fromPackages)];
  const list = readJson(b.logisticCompanyTrackingNum);
  if (Array.isArray(list)) return [...new Set(list.map((x) => clean(x?.trackingNumber || x)).filter(Boolean))];
  const one = clean(list);
  return one ? [one] : [];
}

// FedEx's latest status of one tracking number: { trackingNumber, code, stage, description,
// city, state, country, at } (null when FedEx doesn't know it)
async function latestOf(trackingNumber) {
  const r = await fedex.trackFedExPackage(trackingNumber);
  const t = r?.completeTrackResults?.[0]?.trackResults?.[0];
  const latest = t?.latestStatusDetail;
  if (!t || t.error || !latest?.code) return null;
  const loc = latest.scanLocation || t.scanEvents?.[0]?.scanLocation || {};
  return {
    trackingNumber,
    code: latest.code,
    stage: stageOf(latest.code),
    description: latest.description || latest.statusByLocale || "",
    city: loc.city || "",
    state: loc.stateOrProvinceCode || "",
    country: loc.countryCode || "",
    at: t.scanEvents?.[0]?.date || null,
  };
}

// The order's status from all its packages: a problem on any package wins; otherwise
// the package that is furthest behind (the order is delivered when every package is).
function combine(results) {
  const problem = results.find((r) => PROBLEM.includes(r.stage));
  if (problem) return problem;
  return results.reduce((a, b) => (ORDER.indexOf(b.stage) < ORDER.indexOf(a.stage) ? b : a));
}

// Push notification to the order's customer in their language (no machine translation)
async function notifyCustomer(b, stage, status) {
  const texts = TEXT[stage];
  if (!texts || !b.customerId) return;
  const [customer, tokens] = await Promise.all([
    user.findByPk(b.customerId, { attributes: ["languageCheck"] }),
    deviceToken.findAll({ where: { userId: b.customerId }, attributes: ["tokenId"] }),
  ]);
  const to = [...new Set(tokens.map((t) => t.tokenId).filter(Boolean))];
  if (!to.length) return;
  const lang = String(customer?.languageCheck || "en").toLowerCase().startsWith("es") ? "es" : "en";
  const place = status.city ? ` (${[status.city, status.state].filter(Boolean).join(", ")})` : "";
  const fill = (s) => s.replace("@tid", b.trackingId || `#${b.id}`).replace("@place", place);
  try {
    const res = await admin.messaging().sendEachForMulticast({
      tokens: to,
      notification: { title: fill(texts[lang][0]), body: fill(texts[lang][1]) },
      // the app opens the order (id) and picks the screen by bookingStatusId
      data: { id: String(b.id), bookingStatusId: String(stage === "delivered" ? 18 : SHIPPED) },
    });
    console.log(`FedEx tracking: order ${b.id} ${stage} notification sent ${res.successCount}/${to.length}`);
  } catch (err) {
    console.error(`FedEx tracking: order ${b.id} notification failed:`, err.message);
  }
}

// Checks one order with FedEx; saves the status, notifies on a new stage and completes
// the order when every package is delivered. Returns the saved status (or null).
async function checkOrder(b) {
  const numbers = trackingNumbersOf(b);
  if (!numbers.length) return null;
  const results = [];
  for (const n of numbers) {
    const r = await latestOf(n).catch((err) => {
      console.error(`FedEx tracking ${n} (order ${b.id}) failed: ${err.message}`);
      return null;
    });
    if (!r) return null; // FedEx doesn't know one of them yet: try again next time
    results.push(r);
  }
  const now = combine(results);
  const before = readJson(b.carrierTracking) || {};
  const status = {
    carrier: "FedEx",
    trackingNumbers: numbers,
    stage: now.stage,
    code: now.code,
    description: now.description,
    city: now.city,
    state: now.state,
    country: now.country,
    at: now.at,
    checkedAt: new Date().toISOString(),
    problem: PROBLEM.includes(now.stage),
  };
  if (status.stage === "delivered") {
    // the same as the warehouse's "Mark delivered" (the order is no longer "shipped"
    // afterwards, so this runs once)
    const { completeDelivery } = require("../controller/warehouse");
    const done = await completeDelivery(b.id);
    if (!done.ok) {
      // kept as not completed: the next check tries again (and notifies then)
      console.error(`FedEx tracking: order ${b.id} delivered but not completed: ${done.error}`);
      await booking.update({ carrierTracking: { ...status, pendingCompletion: true } }, { where: { id: b.id } });
      return status;
    }
  }
  await booking.update({ carrierTracking: status }, { where: { id: b.id } });
  const beforeStage = before.pendingCompletion ? null : before.stage;
  if (status.stage !== beforeStage) await notifyCustomer(b, status.stage, status);
  return status;
}

// The job: every International order shipped direct with FedEx
async function checkDirectFedexOrders({ bookingIds } = {}) {
  const orders = await booking.findAll({
    where: {
      bookingTypeId: 1,
      bookingStatusId: SHIPPED,
      ...(bookingIds ? { id: bookingIds } : {}),
    },
    include: [
      { model: logisticCompany, attributes: ["id", "title"] },
      { model: package, attributes: ["id", "logisticCompanyTrackingNum"] },
    ],
    attributes: ["id", "trackingId", "customerId", "logisticCompanyTrackingNum", "carrierTracking"],
    limit: 200,
  });
  const checked = [];
  for (const b of orders) {
    if (!isFedex(b.logisticCompany)) continue;
    try {
      const status = await checkOrder(b);
      if (status) checked.push({ id: b.id, stage: status.stage });
    } catch (err) {
      console.error(`FedEx tracking: order ${b.id} failed:`, err.message);
    }
  }
  return checked;
}

module.exports = { checkDirectFedexOrders, stageOf, readJson };
