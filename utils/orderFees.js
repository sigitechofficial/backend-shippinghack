// Order fees (Shipito style), set by the admin in Pricing & charges:
//   processing fee     – per package, for normal customers (business users pay their
//                        level's processing fee instead)
//   consolidation fee  – per package, only on consolidated orders; one amount for normal
//                        customers and a lower one for business users
//   two switches       – fees on International orders (on) and on Local orders (off)
// Stored as general charges. Each order keeps the amounts it was charged.
const { generalCharges } = require("../models");
const CustomException = require("../middleware/errorObject");

const KEYS = {
  processingFee: "orderProcessingFee",
  consolidationFee: "orderConsolidationFee",
  businessConsolidationFee: "businessConsolidationFee",
  international: "orderFeesInternational",
  local: "orderFeesLocal",
};

// used until the admin saves (Shipito's free-account numbers)
const DEFAULTS = {
  processingFee: 3.25,
  consolidationFee: 5.5,
  businessConsolidationFee: 3.25,
  international: true,
  local: false,
};

const round2 = (n) => Math.round(Number(n) * 100) / 100;

async function orderFeeSettings() {
  const rows = await generalCharges.findAll({
    where: { key: Object.values(KEYS) },
    attributes: ["key", "value"],
  });
  const value = (name) => {
    const row = rows.find((r) => r.key === KEYS[name]);
    return row ? row.value : undefined;
  };
  const money = (name) => {
    const v = value(name);
    return v === undefined || v === null ? DEFAULTS[name] : Math.max(0, round2(v));
  };
  const flag = (name) => {
    const v = value(name);
    return v === undefined || v === null ? DEFAULTS[name] : Number(v) === 1;
  };
  return {
    processingFee: money("processingFee"),
    consolidationFee: money("consolidationFee"),
    businessConsolidationFee: money("businessConsolidationFee"),
    international: flag("international"),
    local: flag("local"),
  };
}

async function saveOrderFeeSettings(body) {
  const fail = (msg) => {
    throw new CustomException(msg, msg);
  };
  const money = (v, label) => {
    const n = Number(v === "" || v === undefined || v === null ? NaN : v);
    if (!Number.isFinite(n)) fail(`${label} is required`);
    if (n < 0) fail(`${label} can't be less than 0`);
    if (n > 1000) fail(`${label} looks too high`);
    return round2(n);
  };
  const values = {
    processingFee: money(body.processingFee, "Processing fee"),
    consolidationFee: money(body.consolidationFee, "Consolidation fee"),
    businessConsolidationFee: money(body.businessConsolidationFee, "Business consolidation fee"),
    international: body.international === true || body.international === 1 || body.international === "1",
    local: body.local === true || body.local === 1 || body.local === "1",
  };
  const info = {
    processingFee: "Orders: processing fee per package for normal customers ($)",
    consolidationFee: "Orders: consolidation fee per package for normal customers ($)",
    businessConsolidationFee: "Orders: consolidation fee per package for business users ($)",
    international: "Order fees on International orders: 0 = off, 1 = on",
    local: "Order fees on Local orders: 0 = off, 1 = on",
  };
  for (const name of Object.keys(KEYS)) {
    const value = typeof values[name] === "boolean" ? (values[name] ? 1 : 0) : values[name];
    const row = await generalCharges.findOne({ where: { key: KEYS[name] } });
    if (row) await row.update({ value });
    else await generalCharges.create({ title: "Order fees", key: KEYS[name], value, information: info[name] });
  }
  return orderFeeSettings();
}

module.exports = { orderFeeSettings, saveOrderFeeSettings, ORDER_FEE_KEYS: Object.values(KEYS) };
