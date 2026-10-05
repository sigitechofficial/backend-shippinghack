// Charged weight and delivery prices, used by the shipping calculator, the order's
// company list, choosing a company, and every screen that shows a charged weight.
//
// Weights here are in base units (lb, in³; a company's divisor is in in³ per lb). A
// quote is shown in the units u (see utils/units.js): the charged weight is rounded to
// 2 decimals in those units, the band and the price per unit are converted to them, and
// price = price per unit × charged weight, so the numbers the customer sees add up.
const { logisticCompany, logisticCompanyCharges, size, unit } = require("../models");
const CustomException = require("../middleware/errorObject");
const { num, round, fromBase, MAX_PACKAGE_WEIGHT_LB, MAX_SIDE_IN, MAX_LENGTH_PLUS_GIRTH_IN } = require("./units");

// Each package is charged on the larger of its weight and its size weight
// (volume ÷ divisor); the order's charged weight is the sum over its packages.
function calculateWeights(packages, divisor) {
  const d = num(divisor);
  let weight = 0;
  let dimensionalWeight = 0;
  let chargedWeight = 0;
  for (const p of packages || []) {
    const actual = num(p.actualWeight);
    const dim = d > 0 ? num(p.actualVolume) / d : 0;
    weight += actual;
    dimensionalWeight += dim;
    chargedWeight += Math.max(actual, dim);
  }
  return {
    weight: round(weight, 4),
    dimensionalWeight: round(dimensionalWeight, 4),
    chargedWeight: round(chargedWeight, 4),
  };
}

// Measured packages of a booking, in the shape calculateWeights reads. A consolidated
// booking is measured as one box (booking weight / volume).
function measuredPackages(bookingData) {
  if (bookingData.consolidation) {
    return [{ actualWeight: bookingData.weight, actualVolume: bookingData.volume }];
  }
  return bookingData.packages || [];
}

// Charged weight of a booking in base units (0 when it has no company yet)
function chargedWeightOf(bookingData, divisor) {
  const d = divisor ?? bookingData.logisticCompany?.divisor;
  if (!d) return 0;
  return calculateWeights(measuredPackages(bookingData), d).chargedWeight;
}

// The company that ships Local orders (createOrderLoc books them with company 1)
const LOCAL_COMPANY_ID = 1;

// Companies a customer can choose for a booking type ('International' or 'Local'):
// active and not deleted, each with its active, not deleted rate bands.
async function companiesWithRates(bookingType) {
  return logisticCompany.findAll({
    where: { status: true, deleted: false },
    include: {
      model: logisticCompanyCharges,
      where: { status: true, deleted: false, bookingType },
      required: true,
    },
    order: [
      ["id", "ASC"],
      [logisticCompanyCharges, "startValue", "ASC"],
    ],
  });
}

// A band covers charged weights above its From and up to its To (From < w <= To)
function bandFor(bands, chargedShown, u) {
  return (
    (bands || []).find(
      (b) =>
        chargedShown > fromBase(b.startValue, u.rate.weight, 4) &&
        chargedShown <= fromBase(b.endValue, u.rate.weight, 4)
    ) || null
  );
}

// One company's price for packages (base units), shown in units u. null when no band
// covers the charged weight.
function quoteCompany(company, packages, u) {
  const w = calculateWeights(packages, company.divisor);
  const charged = fromBase(w.chargedWeight, u.rate.weight);
  const band = bandFor(company.logisticCompanyCharges, charged, u);
  if (!band) return null;
  const rate = round(num(band.charges) * u.rate.weight, 4);
  return {
    id: company.id,
    name: company.title,
    logo: company.logo,
    Actualweight: String(fromBase(w.weight, u.rate.weight)),
    dimensionalWeight: String(fromBase(w.dimensionalWeight, u.rate.weight)),
    chargedWeight: String(charged),
    rate: String(rate),
    charges: round(rate * charged, 2).toFixed(2),
    ETA: band.ETA,
    flash: band.flash,
  };
}

// International prices of every company that has a rate for these packages
async function quoteInternational(packages, u) {
  const companies = await companiesWithRates("International");
  return companies.map((c) => quoteCompany(c, packages, u)).filter(Boolean);
}

// ─── Local orders ──────────────────────────────────────────────────────────────────
// A Local order is one box that the Local company (FedEx, company 1) picks up and
// delivers. The admin sets a flat price per band of charged weight (Admin > Logistic
// companies > FedEx > Rates > Local) and the box sizes customers choose from (Admin >
// Package sizes). The customer picks a weight band and a box size; the order is charged
// at the band holding the larger of the chosen weight (the top of its band) and the
// box's size weight (volume ÷ the company's divisor) — the way FedEx bills it.

// A package size's length unit → inches (sizes keep their own unit system)
const INCHES_PER = { in: 1, inch: 1, inches: 1, cm: 0.3937, mm: 0.03937, m: 39.37 };
const EPS = 1e-6;

const localFail = (message) => {
  throw new CustomException(message, message);
};

// A band covers charged weights above its From and up to its To (From < w <= To)
function localBandFor(bands, weightLb) {
  return (
    (bands || []).find((b) => weightLb > num(b.startValue) + EPS && weightLb <= num(b.endValue) + EPS) || null
  );
}

// An active package size in base units (in / in³). Sizes in a unit we can't convert, or
// larger than the carrier allows, are not offered.
function baseSize(row) {
  const symbol = String(row.lengthUnitS?.symbol || "in").trim().toLowerCase();
  const perUnit = INCHES_PER[symbol];
  if (!perUnit) return null;
  const length = round(num(row.length) * perUnit, 4);
  const width = round(num(row.width) * perUnit, 4);
  const height = round(num(row.height) * perUnit, 4);
  if (!(length > 0 && width > 0 && height > 0)) return null;
  const sides = [length, width, height].sort((a, b) => b - a);
  if (sides[0] > MAX_SIDE_IN + EPS) return null;
  if (sides[0] + 2 * (sides[1] + sides[2]) > MAX_LENGTH_PLUS_GIRTH_IN + EPS) return null;
  return { id: row.id, title: row.title || "", image: row.image || "", length, width, height, volume: length * width * height };
}

// The Local company, its active Local bands (lightest first) and the active box sizes
async function localSetup() {
  const company = await logisticCompany.findOne({
    where: { id: LOCAL_COMPANY_ID, status: true, deleted: false },
    attributes: ["id", "title", "logo", "divisor"],
  });
  const bands = company
    ? await logisticCompanyCharges.findAll({
        where: { logisticCompanyId: company.id, bookingType: "Local", status: true, deleted: false },
        order: [["startValue", "ASC"]],
      })
    : [];
  const rows = await size.findAll({
    where: { status: true },
    include: { model: unit, as: "lengthUnitS", attributes: ["symbol"] },
    order: [["id", "ASC"]],
  });
  const sizes = rows
    .map(baseSize)
    .filter(Boolean)
    .sort((a, b) => a.volume - b.volume);
  return { company, bands, sizes, divisor: num(company?.divisor) };
}

// Price of a box of weightLb (lb) and volumeIn3 (in³): the band holding the larger of
// the weight and the size weight. band/price are null when no band covers it.
function localQuoteFor(setup, weightLb, volumeIn3) {
  const sizeWeight = setup.divisor > 0 ? num(volumeIn3) / setup.divisor : 0;
  const charged = Math.max(num(weightLb), sizeWeight);
  const band = localBandFor(setup.bands, charged);
  return {
    weight: num(weightLb),
    sizeWeight,
    charged,
    bySize: sizeWeight > num(weightLb) + EPS,
    band,
    price: band ? round(num(band.charges), 2) : null,
  };
}

// The customer's choice: a weight band and a box size (ids). Throws the message to show
// when the choice is not available.
function localChoice(setup, bandId, sizeId) {
  const chosen = setup.bands.find((b) => b.id === Number(bandId));
  if (!chosen) localFail("Please choose the weight.");
  const box = setup.sizes.find((s) => s.id === Number(sizeId));
  if (!box) localFail("Please choose the box size.");
  const quote = localQuoteFor(setup, num(chosen.endValue), box.volume);
  if (!quote.band) {
    localFail(
      quote.bySize
        ? "This box is too big for Local delivery. Please choose a smaller box size."
        : "This weight is too heavy for Local delivery."
    );
  }
  return { ...quote, chosenBand: chosen, size: box };
}

// A band as customers see it, in the units u
function localBandShown(b, u) {
  const from = fromBase(b.startValue, u.rate.weight);
  const to = fromBase(b.endValue, u.rate.weight);
  const w = u.symbol.weight;
  return {
    id: b.id,
    from,
    to,
    price: round(num(b.charges), 2),
    label: from > 0 ? `${from} – ${to} ${w}` : `Up to ${to} ${w}`,
  };
}

// A box size as customers see it, in the units u
function localSizeShown(s, setup, u) {
  const length = fromBase(s.length, u.rate.length);
  const width = fromBase(s.width, u.rate.length);
  const height = fromBase(s.height, u.rate.length);
  return {
    id: s.id,
    title: s.title,
    image: s.image,
    length,
    width,
    height,
    label: `${length} × ${width} × ${height} ${u.symbol.length}`,
    sizeWeight: setup.divisor > 0 ? fromBase(s.volume / setup.divisor, u.rate.weight) : 0,
  };
}

// What the apps need for the Local package screen: the weight bands, the box sizes and
// the price of every band × size (worked out here, so the apps never compute a price).
async function localOptions(u) {
  const setup = await localSetup();
  const localQuotes = [];
  for (const b of setup.bands) {
    for (const s of setup.sizes) {
      const q = localQuoteFor(setup, num(b.endValue), s.volume);
      localQuotes.push({
        bandId: b.id,
        sizeId: s.id,
        available: !!q.band,
        price: q.price,
        chargedBandId: q.band ? q.band.id : null,
        chargedAs: q.band ? localBandShown(q.band, u).label : null,
        bySize: q.bySize,
      });
    }
  }
  return {
    localBands: setup.bands.map((b) => localBandShown(b, u)),
    localSizes: setup.sizes.map((s) => localSizeShown(s, setup, u)),
    localQuotes,
    localMaxWeight: fromBase(MAX_PACKAGE_WEIGHT_LB, u.rate.weight),
  };
}

// The Local price for packages typed in full (calculator, older apps), base units, in
// the same shape as a company quote. Empty when no band covers the charged weight.
async function quoteLocal(packages, u) {
  const setup = await localSetup();
  if (!setup.company) return [];
  let weight = 0;
  let sizeWeight = 0;
  let charged = 0;
  for (const p of packages || []) {
    const q = localQuoteFor(setup, num(p.actualWeight), num(p.actualVolume));
    weight += q.weight;
    sizeWeight += q.sizeWeight;
    charged += q.charged;
  }
  const band = localBandFor(setup.bands, charged);
  if (!band) return [];
  return [
    {
      id: setup.company.id,
      name: setup.company.title,
      logo: setup.company.logo,
      Actualweight: String(fromBase(weight, u.rate.weight)),
      dimensionalWeight: String(fromBase(sizeWeight, u.rate.weight)),
      chargedWeight: String(fromBase(charged, u.rate.weight)),
      rate: "",
      charges: round(num(band.charges), 2).toFixed(2),
      ETA: band.ETA,
      flash: false,
      flatPrice: true,
      chargedAs: localBandShown(band, u).label,
    },
  ];
}

module.exports = {
  calculateWeights,
  measuredPackages,
  chargedWeightOf,
  LOCAL_COMPANY_ID,
  companiesWithRates,
  quoteCompany,
  quoteInternational,
  quoteLocal,
  localSetup,
  localQuoteFor,
  localChoice,
  localBandShown,
  localSizeShown,
  localOptions,
};
