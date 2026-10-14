const { businessLevel, businessSetting } = require("../models");
const CustomException = require("../middleware/errorObject");

const returnFunction = (status, message, data, error) => ({
  status,
  message,
  data,
  error,
});

const fail = (msg) => {
  throw new CustomException(msg, msg);
};

// a value from the request as a number, or an error naming the field
function toNumber(value, label, { min = 0, max = Infinity, integer = false } = {}) {
  if (value === undefined || value === null || String(value).trim() === "")
    fail(`${label} is required`);
  const n = Number(value);
  if (!Number.isFinite(n)) fail(`${label} must be a number`);
  if (integer && !Number.isInteger(n)) fail(`${label} must be a whole number`);
  if (n < min) fail(`${label} can't be less than ${min}`);
  if (n > max) fail(`${label} can't be more than ${max}`);
  return n;
}

async function currentSettings() {
  const row = await businessSetting.findOne({ order: [["id", "ASC"]] });
  return row || businessSetting.create({});
}

/*
            Business levels + membership settings (admin)
    _________________________________________________________
*/
async function getBusinessSettings(req, res) {
  const levels = await businessLevel.findAll({
    order: [["sortOrder", "ASC"], ["minShipments", "ASC"]],
  });
  const settings = await currentSettings();
  return res.json(returnFunction("1", "Business settings", { levels, settings }, ""));
}

async function updateBusinessLevel(req, res) {
  const { levelId } = req.body;
  const level = await businessLevel.findByPk(levelId);
  if (!level) fail("Level not found");

  const title = String(req.body.title || "").trim();
  if (!title) fail("Level name is required");
  if (title.length > 50) fail("Level name can't be longer than 50 characters");
  const minShipments = toNumber(req.body.minShipments, "Shipments per month", { integer: true });
  const processingFee = toNumber(req.body.processingFee, "Processing fee");
  const discountPercent = toNumber(req.body.discountPercent, "Shipping discount", { max: 100 });
  const freeStorageDays = toNumber(req.body.freeStorageDays, "Free storage days", { integer: true });

  // levels must stay in order: the first starts at 0 shipments, each next one needs more
  const levels = await businessLevel.findAll({
    order: [["sortOrder", "ASC"], ["minShipments", "ASC"]],
  });
  const index = levels.findIndex((l) => l.id === level.id);
  if (index === 0 && minShipments !== 0)
    fail("The first level must start at 0 shipments");
  const prev = levels[index - 1];
  const next = levels[index + 1];
  if (prev && minShipments <= prev.minShipments)
    fail(`Shipments per month must be more than ${prev.title} (${prev.minShipments})`);
  if (next && minShipments >= next.minShipments)
    fail(`Shipments per month must be less than ${next.title} (${next.minShipments})`);

  await level.update({ title, minShipments, processingFee, discountPercent, freeStorageDays });
  return res.json(returnFunction("1", "Level updated", level, ""));
}

async function updateBusinessSettings(req, res) {
  const settings = await currentSettings();
  const values = {
    monthlyPrice: toNumber(req.body.monthlyPrice, "Monthly price"),
    yearlyPrice: toNumber(req.body.yearlyPrice, "Yearly price"),
    levelResetMonth: toNumber(req.body.levelResetMonth, "Level reset month", { min: 1, max: 12, integer: true }),
    storageExtensionDays: toNumber(req.body.storageExtensionDays, "Days per extension", { min: 1, integer: true }),
    storageExtensionFee: toNumber(req.body.storageExtensionFee, "Extension fee"),
    storageExpiredDayFee: toNumber(req.body.storageExpiredDayFee, "Fee per expired day"),
    storageMaxExtensions: toNumber(req.body.storageMaxExtensions, "Maximum extensions", { integer: true }),
  };
  await settings.update(values);
  return res.json(returnFunction("1", "Settings updated", settings, ""));
}

module.exports = {
  getBusinessSettings,
  updateBusinessLevel,
  updateBusinessSettings,
};
