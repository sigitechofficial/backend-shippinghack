// Units in one place.
//
// The database stores weight in lb, sizes in in (volume in in³) and distance in km: the
// base units. Each `units` row's conversionRate is how many base units one of that unit
// is (kg 2.2046, cm 0.3937, mi 1.6093), so value typed × rate = base and base ÷ rate =
// value shown. The admin picks the units everyone types and sees (Admin > Units, the
// active appUnits row); a booking keeps the units it was created with (booking.appUnitId).
const { appUnits, units } = require("../models");
const CustomException = require("../middleware/errorObject");

// Carrier limits, in base units
const MAX_PACKAGE_WEIGHT_LB = 150; // per package (international), and a Local order's total
const MAX_SIDE_IN = 119; // longest side
const MAX_LENGTH_PLUS_GIRTH_IN = 165; // longest side + 2 × the other two sides
// A Local order's weight must be at least 1 of the unit shown (1 lb or 1 kg)
const LOCAL_MIN_WEIGHT = 1;

const num = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};
const round = (value, dp = 2) => {
  const f = 10 ** dp;
  return Math.round((num(value) + Number.EPSILON) * f) / f;
};

const UNIT_INCLUDE = [
  { model: units, as: "weightUnit", attributes: ["symbol", "conversionRate"] },
  { model: units, as: "lengthUnit", attributes: ["symbol", "conversionRate"] },
  { model: units, as: "distanceUnit", attributes: ["symbol", "conversionRate"] },
  { model: units, as: "currencyUnit", attributes: ["symbol", "conversionRate"] },
];

function shape(row) {
  const rate = (u) => num(u?.conversionRate) || 1;
  return {
    appUnitId: row.id,
    symbol: {
      weight: row.weightUnit?.symbol || "lb",
      length: row.lengthUnit?.symbol || "in",
      distance: row.distanceUnit?.symbol || "km",
      currency: row.currencyUnit?.symbol || "$",
    },
    rate: {
      weight: rate(row.weightUnit),
      length: rate(row.lengthUnit),
      distance: rate(row.distanceUnit),
    },
  };
}

// Units the admin has chosen right now
async function currentUnits() {
  const row = await appUnits.findOne({
    where: { status: true, deleted: false },
    order: [["id", "DESC"]],
    include: UNIT_INCLUDE,
  });
  if (!row) throw new CustomException("Units are not set up", "Units are not set up");
  return shape(row);
}

// Units a booking was created with (falls back to the current ones)
async function unitsFor(appUnitId) {
  const row = appUnitId ? await appUnits.findByPk(appUnitId, { include: UNIT_INCLUDE }) : null;
  return row ? shape(row) : currentUnits();
}

const toBase = (value, rate) => round(num(value) * num(rate), 4);
const fromBase = (value, rate, dp = 2) => round(num(value) / (num(rate) || 1), dp);
const volumeFromBase = (value, lengthRate, dp = 2) => round(num(value) / (num(lengthRate) || 1) ** 3, dp);
const volumeToBase = (value, lengthRate) => round(num(value) * num(lengthRate) ** 3, 4);

// Size-weight divisor: stored as in³ per lb (139 for FedEx/UPS), shown in the chosen
// units (139 in³/lb is about 5022 cm³/kg).
const divisorFromBase = (divisor, u) => round((num(divisor) * u.rate.weight) / u.rate.length ** 3, 2);
const divisorToBase = (divisor, u) => round((num(divisor) * u.rate.length ** 3) / u.rate.weight, 4);
const divisorUnit = (u) => `${u.symbol.length}³/${u.symbol.weight}`;

// A booking's packages are stored in base units; the panels show them in the booking's
// units (rate = its conversion rates). Measured values keep the "0.00" text the panels
// check for.
function packagesInUnits(packages, rate) {
  const text = (v, r) => fromBase(v, r).toFixed(2);
  for (const p of packages) {
    p.weight = fromBase(p.weight, rate.weight);
    p.length = fromBase(p.length, rate.length);
    p.width = fromBase(p.width, rate.length);
    p.height = fromBase(p.height, rate.length);
    p.volume = volumeFromBase(p.volume, rate.length);
    if (p.actualWeight !== undefined) {
      p.actualWeight = text(p.actualWeight, rate.weight);
      p.actualLength = text(p.actualLength, rate.length);
      p.actualWidth = text(p.actualWidth, rate.length);
      p.actualHeight = text(p.actualHeight, rate.length);
      p.actualVolume = volumeFromBase(p.actualVolume, rate.length).toFixed(2);
    }
  }
}

// Limits in the units shown, for the apps' forms and the server checks
function limitsFor(u) {
  return {
    maxPackageWeight: fromBase(MAX_PACKAGE_WEIGHT_LB, u.rate.weight),
    maxSide: fromBase(MAX_SIDE_IN, u.rate.length),
    maxLengthPlusGirth: fromBase(MAX_LENGTH_PLUS_GIRTH_IN, u.rate.length),
    localMinWeight: LOCAL_MIN_WEIGHT,
    localMaxWeight: fromBase(MAX_PACKAGE_WEIGHT_LB, u.rate.weight),
  };
}

// What the apps get: the unit symbols and the limits in those units
function unitsPayload(u) {
  return { unit: { ...u.symbol }, limits: limitsFor(u) };
}

const fail = (message) => {
  throw new CustomException(message, message);
};

// Checks packages typed by a customer (values in the units shown). Local orders are
// priced by weight only, so only their weight is checked.
function checkPackages(packages, u, { local = false } = {}) {
  if (!Array.isArray(packages) || packages.length === 0) fail("Please add a package.");
  const lim = limitsFor(u);
  const w = u.symbol.weight;
  const l = u.symbol.length;
  let total = 0;
  for (const p of packages) {
    const weight = Number(p.weight);
    if (!Number.isFinite(weight) || weight <= 0) fail(`Please enter the weight in ${w}.`);
    if (local && weight < LOCAL_MIN_WEIGHT) fail(`Weight must be at least ${LOCAL_MIN_WEIGHT} ${w}.`);
    if (weight > lim.maxPackageWeight) fail(`Weight cannot be more than ${lim.maxPackageWeight} ${w}.`);
    total += weight;
    if (local) continue;
    const sides = [p.length, p.width, p.height].map(Number);
    if (sides.some((s) => !Number.isFinite(s) || s <= 0)) fail(`Please enter the length, width and height in ${l}.`);
    sides.sort((a, b) => b - a);
    if (sides[0] > lim.maxSide) fail(`The longest side cannot be more than ${lim.maxSide} ${l}.`);
    if (round(sides[0] + 2 * (sides[1] + sides[2])) > lim.maxLengthPlusGirth)
      fail(`Longest side + 2 × the other two sides cannot be more than ${lim.maxLengthPlusGirth} ${l}.`);
  }
  if (local && round(total) > lim.localMaxWeight) fail(`Total weight cannot be more than ${lim.localMaxWeight} ${w}.`);
}

module.exports = {
  MAX_PACKAGE_WEIGHT_LB,
  num,
  round,
  currentUnits,
  unitsFor,
  toBase,
  fromBase,
  volumeFromBase,
  volumeToBase,
  divisorFromBase,
  divisorToBase,
  divisorUnit,
  limitsFor,
  unitsPayload,
  packagesInUnits,
  checkPackages,
};
