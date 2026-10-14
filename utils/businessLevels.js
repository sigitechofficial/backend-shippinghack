// Business levels, Shipito style. A business earns a level from its shipments in a
// calendar month (UTC). The level applies straight away and is kept until a higher
// one is reached, or until the reset month (Admin > Business plan, February by
// default) of the year after it was earned.
//
// A shipment = an order of the business that is paid and not cancelled, placed on or
// after its membership started; it counts in the month the order was placed.
const { Op } = require("sequelize");
const { sequelize, booking, bookingStatus, businessLevel, businessSetting } = require("../models");
const { activeBusinessPlan } = require("./businessMembership");

// Used only when the levels table isn't set up yet (Shipito's numbers)
const DEFAULT_LEVELS = [
  { id: null, title: "Basic", minShipments: 0, processingFee: 2.25, discountPercent: 0, freeStorageDays: 45, sortOrder: 1 },
  { id: null, title: "Plus", minShipments: 10, processingFee: 1.25, discountPercent: 5, freeStorageDays: 45, sortOrder: 2 },
  { id: null, title: "Premium", minShipments: 30, processingFee: 0.75, discountPercent: 7, freeStorageDays: 60, sortOrder: 3 },
  { id: null, title: "Pro", minShipments: 50, processingFee: 0, discountPercent: 10, freeStorageDays: 90, sortOrder: 4 },
];

const plainLevel = (l) => ({
  id: l.id,
  title: l.title,
  minShipments: Number(l.minShipments),
  processingFee: Number(l.processingFee),
  discountPercent: Number(l.discountPercent),
  freeStorageDays: Number(l.freeStorageDays),
  sortOrder: Number(l.sortOrder),
});

async function businessLevels() {
  try {
    const rows = await businessLevel.findAll({ order: [["minShipments", "ASC"]] });
    if (rows.length) return rows.map(plainLevel);
  } catch (err) {
    console.error("business levels not readable, using defaults:", err && err.message);
  }
  return DEFAULT_LEVELS.map(plainLevel);
}

async function levelResetMonth() {
  try {
    const row = await businessSetting.findOne({ order: [["id", "ASC"]] });
    if (row) return Number(row.levelResetMonth);
  } catch (err) {
    console.error("business settings not readable, using February:", err && err.message);
  }
  return 2;
}

// highest level whose minimum the count reaches (levels sorted by minShipments)
function levelForCount(count, levels) {
  let found = levels[0];
  for (const l of levels) if (count >= l.minShipments) found = l;
  return found;
}

const monthKey = (year, month) => `${year}-${String(month).padStart(2, "0")}`;

// shipments per calendar month since `since`: { "2026-10": 12, ... }
async function shipmentsByMonth(userId, since) {
  const cancelled = await bookingStatus.findOne({ where: { title: "Cancelled" }, attributes: ["id"] });
  const where = {
    customerId: userId,
    paymentConfirmed: true,
    createdAt: { [Op.gte]: since },
  };
  if (cancelled) where.bookingStatusId = { [Op.or]: [{ [Op.ne]: cancelled.id }, { [Op.is]: null }] };
  const rows = await booking.findAll({
    where,
    attributes: [
      [sequelize.fn("YEAR", sequelize.col("createdAt")), "y"],
      [sequelize.fn("MONTH", sequelize.col("createdAt")), "m"],
      [sequelize.fn("COUNT", sequelize.col("id")), "n"],
    ],
    group: [sequelize.fn("YEAR", sequelize.col("createdAt")), sequelize.fn("MONTH", sequelize.col("createdAt"))],
    raw: true,
  });
  const out = {};
  rows.forEach((r) => {
    out[monthKey(Number(r.y), Number(r.m))] = Number(r.n);
  });
  return out;
}

// The level of a business user right now, or null when there is no active
// business membership.
async function businessLevelStatus(userId, now = new Date()) {
  const plan = await activeBusinessPlan(userId);
  if (!plan) return null;

  const levels = await businessLevels();
  const resetMonth = await levelResetMonth();

  // only orders since the membership started; at most the last 14 months matter
  const windowStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 13, 1));
  const memberSince = plan.buyDate ? new Date(plan.buyDate) : windowStart;
  const since = memberSince > windowStart ? memberSince : windowStart;
  const counts = await shipmentsByMonth(userId, since);

  // every month in the window: the level it earned and how long that level lasts
  let best = { level: levels[0], earnedIn: null, keptUntil: null };
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const year = d.getUTCFullYear();
    const month = d.getUTCMonth() + 1;
    const count = counts[monthKey(year, month)] || 0;
    if (!count) continue;
    const level = levelForCount(count, levels);
    const keptUntil = new Date(Date.UTC(year + 1, resetMonth - 1, 1));
    if (keptUntil <= now) continue;
    if (level.minShipments > best.level.minShipments) {
      best = { level, earnedIn: monthKey(year, month), keptUntil };
    }
  }

  const shipmentsThisMonth = counts[monthKey(now.getUTCFullYear(), now.getUTCMonth() + 1)] || 0;
  const nextLevel = levels.find((l) => l.minShipments > best.level.minShipments) || null;

  return {
    level: best.level,
    earnedIn: best.earnedIn, // null = the starting level
    keptUntil: best.keptUntil,
    shipmentsThisMonth,
    nextLevel,
    shipmentsToNextLevel: nextLevel ? Math.max(nextLevel.minShipments - shipmentsThisMonth, 0) : 0,
    levels,
  };
}

module.exports = { businessLevels, levelForCount, businessLevelStatus, DEFAULT_LEVELS };
