// How a Local order's box reaches FedEx, switched by the admin (Pricing & charges):
//   'dropoff' – the customer takes the labelled box to any FedEx location (no date/time)
//   'pickup'  – FedEx Express collects it at the pickup address on the day and in the
//               window the customer chose; the admin's pickup fee is added to the price
// Stored as two general charges: localPickupMode (0 = drop-off, 1 = pickup) and
// localPickupFee ($). Each order keeps its own method, so switching never changes an
// order that already exists.
const { generalCharges } = require("../models");
const CustomException = require("../middleware/errorObject");
const fedex = require("../controller/fedex");

const MODE_KEY = "localPickupMode";
const FEE_KEY = "localPickupFee";

// FedEx refuses a Puerto Rico pickup whose close time is before 16:00
// (ORIGINDETAIL.COMPANYCLOSETIME.INVALIDFORPUERTORICO)
const PR_MIN_CLOSE = "16:00";

const round2 = (n) => Math.round(Number(n) * 100) / 100;

async function localPickupSettings() {
  const rows = await generalCharges.findAll({ where: { key: [MODE_KEY, FEE_KEY] }, attributes: ["key", "value"] });
  const value = (k) => rows.find((r) => r.key === k)?.value;
  const method = Number(value(MODE_KEY)) === 1 ? "pickup" : "dropoff";
  const fee = Math.max(0, round2(Number(value(FEE_KEY)) || 0));
  return { method, fee };
}

async function saveLocalPickupSettings({ method, fee }) {
  const fail = (msg) => {
    throw new CustomException(msg, msg);
  };
  if (method !== "dropoff" && method !== "pickup") fail("Choose drop-off or FedEx pickup.");
  const f = Number(fee === "" || fee === undefined || fee === null ? 0 : fee);
  if (!Number.isFinite(f) || f < 0) fail("The pickup fee must be 0 or more.");
  if (f > 1000) fail("The pickup fee looks too high.");
  const save = async (key, value, information) => {
    const row = await generalCharges.findOne({ where: { key } });
    if (row) await row.update({ value });
    else await generalCharges.create({ title: "Local pickup", key, value, information });
  };
  await save(MODE_KEY, method === "pickup" ? 1 : 0, "Local orders: 0 = drop-off at FedEx, 1 = FedEx pickup");
  await save(FEE_KEY, round2(f), "Local orders: FedEx pickup fee ($)");
  return localPickupSettings();
}

// Today and the time now in Puerto Rico (where every Local pickup is)
function prNow() {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Puerto_Rico",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(new Date())
      .map((p) => [p.type, p.value])
  );
  return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}` };
}

const hhmm = (t) => String(t || "").slice(0, 5);
const minutes = (t) => {
  const m = /^(\d{1,2}):(\d{2})/.exec(String(t || ""));
  return m ? Number(m[1]) * 60 + Number(m[2]) : NaN;
};
// "16:00" → "4:00 PM", for messages
const time12 = (t) => {
  const m = minutes(t);
  const h = Math.floor(m / 60);
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m % 60).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};
// "9:5" / "09:05" / "09:05:00" → "09:05:00"; null when it isn't a time
function normalTime(t) {
  const m = /^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/.exec(String(t || "").trim());
  if (!m || Number(m[1]) > 23 || Number(m[2]) > 59) return null;
  return `${m[1].padStart(2, "0")}:${m[2].padStart(2, "0")}:00`;
}

// The days and times the customer can choose, from FedEx's availability for this
// address: [{ date, readyTimes: ["08:00", …], untilTimes: ["16:00", …], minHours }].
// Only times FedEx can really do that day: the driver needs minHours (FedEx's access
// time) before the area's daily cut-off, so "ready from" ends minHours before it, and
// "available until" runs from 16:00 (FedEx's Puerto Rico rule) to the cut-off. Today:
// only times not past yet.
async function pickupDays(address) {
  const now = prNow();
  const options = await fedex.pickupAvailability(address, now.date);
  const days = [];
  for (const o of options) {
    if (!o.available || !o.date || o.date < now.date) continue;
    const minHours = o.accessHours > 0 ? o.accessHours : 2;
    const cutOff = o.cutOffTime ? minutes(o.cutOffTime) : NaN;
    const latest = Number.isNaN(cutOff) ? Infinity : Math.max(cutOff, minutes(PR_MIN_CLOSE));
    const until = o.latestTimes.map(hhmm).filter((t) => t >= PR_MIN_CLOSE && minutes(t) <= latest);
    if (!until.length) continue;
    const lastUntil = minutes(until[until.length - 1]);
    const ready = o.readyTimes
      .map(hhmm)
      .filter((t) => minutes(t) + minHours * 60 <= Math.min(lastUntil, Number.isNaN(cutOff) ? Infinity : cutOff))
      .filter((t) => o.date !== now.date || t >= now.time);
    if (!ready.length) continue;
    if (days.some((d) => d.date === o.date)) continue;
    days.push({ date: o.date, readyTimes: ready, untilTimes: until, minHours });
  }
  return days;
}

// Checks the customer's pickup day and window against FedEx (throws the message to
// show). Returns the values to store: { pickupDate, pickupStartTime, pickupEndTime }.
async function checkPickupChoice(address, pickupDate, pickupStartTime, pickupEndTime) {
  const fail = (msg) => {
    throw new CustomException(msg, msg);
  };
  const date = String(pickupDate || "").trim().slice(0, 10);
  const start = normalTime(pickupStartTime);
  const end = normalTime(pickupEndTime);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) fail("Please choose the pickup day.");
  if (!start || !end) fail("Please choose the pickup time.");
  let days;
  try {
    days = await pickupDays(address);
  } catch (err) {
    console.error("FedEx pickup availability failed:", err.message);
    fail("We couldn't check FedEx pickup times right now. Please try again in a moment.");
  }
  const day = days.find((d) => d.date === date);
  if (!day) fail("FedEx can't pick up at this address on that day. Please choose another day.");
  const s = minutes(start);
  const e = minutes(end);
  if (s < minutes(day.readyTimes[0]) || s > minutes(day.readyTimes[day.readyTimes.length - 1])) {
    fail(`On that day the pickup can start from ${time12(day.readyTimes[0])} to ${time12(day.readyTimes[day.readyTimes.length - 1])}. Please choose another time.`);
  }
  if (e < minutes(day.untilTimes[0]) || e > minutes(day.untilTimes[day.untilTimes.length - 1])) {
    fail(`The box must be available until ${time12(day.untilTimes[0])} or later. Please choose a later end time.`);
  }
  if (e - s < day.minHours * 60) {
    fail(`FedEx needs a window of at least ${day.minHours} hours. Please choose a later end time.`);
  }
  return { pickupDate: date, pickupStartTime: start, pickupEndTime: end };
}

// Before payment: can FedEx still come on the order's day and window? An order can be
// paid later (from the order history), when its time has passed. The driver needs the
// day's access time between the later of (ready time, now) and the earlier of (the
// customer's "until" time, the area's cut-off); a ready time a few minutes in the past
// is fine, so paying right after making the order always works.
// Returns null when FedEx can still come, otherwise the message to show.
const PICKUP_PASSED =
  "The pickup time you chose has passed. Please create the order again and choose a new pickup time.";
async function pickupProblem(address, pickupDate, pickupStartTime, pickupEndTime) {
  const date = String(pickupDate || "").slice(0, 10);
  const start = minutes(pickupStartTime);
  const end = minutes(pickupEndTime);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(start) || Number.isNaN(end)) return PICKUP_PASSED;
  const now = prNow();
  if (date < now.date) return PICKUP_PASSED;
  let options;
  try {
    options = await fedex.pickupAvailability(address, now.date);
  } catch (err) {
    console.error("FedEx pickup availability failed:", err.message);
    return "We couldn't check FedEx pickup times right now. Please try again in a moment.";
  }
  const day = options.find((o) => o.date === date && o.available);
  if (!day) return PICKUP_PASSED;
  const need = (day.accessHours > 0 ? day.accessHours : 2) * 60;
  const from = date === now.date ? Math.max(start, minutes(now.time)) : start;
  const cutOff = day.cutOffTime ? minutes(day.cutOffTime) : NaN;
  const latest = Number.isNaN(cutOff) ? end : Math.min(end, cutOff);
  return from + need <= latest ? null : PICKUP_PASSED;
}

module.exports = {
  localPickupSettings,
  pickupProblem,
  saveLocalPickupSettings,
  pickupDays,
  checkPickupChoice,
  normalTime,
  prNow,
  MODE_KEY,
  FEE_KEY,
};
