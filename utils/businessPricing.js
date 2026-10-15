// Order prices: the carrier's shipping price, then
//   business user  – the level's discount off shipping + the level's processing fee per
//                    package + the business consolidation fee per package (consolidated)
//   normal customer – the admin's processing fee per package + consolidation fee per
//                    package (consolidated)
// Fees only apply on the order types the admin switched on (International / Local).
const { businessLevelStatus } = require("./businessLevels");
const { orderFeeSettings } = require("./orderFees");

const cents = (n) => Math.round(Number(n) * 100) / 100;

const INTERNATIONAL = 1;
const LOCAL = 6;

// Packages that count for the fees: the ones that arrived (or will), at least 1
function feePackageCount(booking) {
  const n = (booking.packages || []).filter((p) => ["arrived", "pending"].includes(p.arrived)).length;
  return Math.max(n, 1);
}

// The price of an order. `isBusiness` = the customer is a business user (userTypeId 3).
// Returns null for a business user without an active membership.
async function orderPrice({ customerId, isBusiness, booking, shippingCharges }) {
  const settings = await orderFeeSettings();
  const type = Number(booking.bookingTypeId);
  const feesOn =
    (type === INTERNATIONAL && settings.international) || (type === LOCAL && settings.local);
  const subTotal = cents(shippingCharges);
  const packages = feePackageCount(booking);
  const consolidated = !!booking.consolidation;

  let level = null;
  let discount = 0;
  let processingPerPackage = settings.processingFee;
  let consolidationPerPackage = settings.consolidationFee;
  if (isBusiness) {
    const status = await businessLevelStatus(customerId);
    if (!status) return null;
    level = status.level;
    // business prices (level discount) are for International orders
    if (type === INTERNATIONAL) discount = cents((subTotal * level.discountPercent) / 100);
    processingPerPackage = level.processingFee;
    consolidationPerPackage = settings.businessConsolidationFee;
  }

  const processingFee = feesOn ? cents(processingPerPackage * packages) : 0;
  const consolidationFee = feesOn && consolidated ? cents(consolidationPerPackage * packages) : 0;
  return {
    level: level ? level.title : null,
    discountPercent: level ? level.discountPercent : 0,
    packages,
    subTotal,
    discount,
    processingFee,
    consolidationFee,
    total: cents(subTotal - discount + processingFee + consolidationFee),
  };
}

// A Local order's processing fee (one box): 0 unless the admin switched fees on for
// Local orders. Business users with an active membership pay their level's fee.
async function localProcessingFee(customerId, isBusiness) {
  const settings = await orderFeeSettings();
  if (!settings.local) return 0;
  if (isBusiness) {
    const status = await businessLevelStatus(customerId);
    if (status) return cents(status.level.processingFee);
  }
  return cents(settings.processingFee);
}

// kept for callers of the business-only version
async function businessOrderPrice(customerId, shippingCharges, packageCount) {
  return orderPrice({
    customerId,
    isBusiness: true,
    booking: { bookingTypeId: INTERNATIONAL, packages: Array.from({ length: packageCount || 1 }, () => ({ arrived: "arrived" })) },
    shippingCharges,
  });
}

module.exports = { orderPrice, businessOrderPrice, feePackageCount, localProcessingFee };
