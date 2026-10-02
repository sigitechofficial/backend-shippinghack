// Charged weight and delivery prices, used by the shipping calculator, the order's
// company list, choosing a company, and every screen that shows a charged weight.
//
// Weights here are in base units (lb, in³; a company's divisor is in in³ per lb). A
// quote is shown in the units u (see utils/units.js): the charged weight is rounded to
// 2 decimals in those units, the band and the price per unit are converted to them, and
// price = price per unit × charged weight, so the numbers the customer sees add up.
const { logisticCompany, logisticCompanyCharges } = require("../models");
const { num, round, fromBase } = require("./units");

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

// Local orders (FedEx inside the USA) have a flat price by total weight in lb
function localPrice(weightLb) {
  const w = round(weightLb, 2);
  if (w > 0 && w < 20) return 12;
  if (w >= 20 && w <= 150) return 20;
  return 0;
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

// The Local price, in the same shape as a company quote
async function quoteLocal(packages, u) {
  const company = await logisticCompany.findByPk(LOCAL_COMPANY_ID, { attributes: ["id", "title", "logo"] });
  const weight = (packages || []).reduce((sum, p) => sum + num(p.actualWeight), 0);
  const price = localPrice(weight);
  if (!price) return [];
  const shown = fromBase(weight, u.rate.weight);
  return [
    {
      id: company?.id ?? LOCAL_COMPANY_ID,
      name: company?.title ?? "FedEx",
      logo: company?.logo ?? "",
      Actualweight: String(shown),
      // Local orders are priced by weight only
      dimensionalWeight: "0",
      chargedWeight: String(shown),
      rate: "",
      charges: price.toFixed(2),
      ETA: null,
      flash: false,
      flatPrice: true,
    },
  ];
}

module.exports = {
  calculateWeights,
  measuredPackages,
  chargedWeightOf,
  localPrice,
  LOCAL_COMPANY_ID,
  companiesWithRates,
  quoteCompany,
  quoteInternational,
  quoteLocal,
};
