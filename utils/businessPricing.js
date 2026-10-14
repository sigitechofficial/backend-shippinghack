// Business order prices (Shipito style): the business's current level takes its
// shipping discount off the carrier's price and adds its processing fee for every
// package in the order.
const { businessLevelStatus } = require("./businessLevels");

const cents = (n) => Math.round(Number(n) * 100) / 100;

// null when the customer has no active business membership
async function businessOrderPrice(customerId, shippingCharges, packageCount) {
  const status = await businessLevelStatus(customerId);
  if (!status) return null;
  const level = status.level;
  const subTotal = cents(shippingCharges);
  const discount = cents((subTotal * level.discountPercent) / 100);
  const packages = Math.max(Number(packageCount) || 0, 1);
  const processingFee = cents(level.processingFee * packages);
  return {
    level: level.title,
    discountPercent: level.discountPercent,
    processingFeePerPackage: level.processingFee,
    packages,
    subTotal,
    discount,
    processingFee,
    total: cents(subTotal - discount + processingFee),
  };
}

module.exports = { businessOrderPrice };
