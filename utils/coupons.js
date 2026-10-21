// Promo codes (Admin > Coupons) on customer orders.
//
// A booking keeps its pre-promo price in total + couponDiscount; the promo is stored in
// couponId / couponCode / couponDiscount and taken off `total`, which is what every
// payment charges. Coupon `value` is a flat amount; a "conditional" coupon also needs the
// order to be at least `condAmount`. The total never goes below MIN_CHARGE (Stripe's
// smallest charge), so a big code on a small order leaves $0.50 to pay.
const { coupon, booking } = require("../models");
const CustomException = require("../middleware/errorObject");

const MIN_CHARGE = 0.5;
const cents = (n) => Math.round(Number(n) * 100) / 100;

const fail = (msg) => {
  throw new CustomException(msg, msg);
};

// Active and inside its dates
function couponLive(c) {
  if (!c || !c.status) return false;
  const now = Date.now();
  return now > new Date(c.from).getTime() && now < new Date(c.to).getTime();
}

// What the coupon takes off an order of `preCouponTotal`
function couponAmount(c, preCouponTotal) {
  const base = cents(preCouponTotal);
  const room = Math.max(cents(base - MIN_CHARGE), 0);
  return cents(Math.min(Number(c.value) || 0, room));
}

// The coupon for `code` if this customer may use it on an order of `preCouponTotal`,
// otherwise an error with a message the customer can read
async function usableCoupon(code, userId, preCouponTotal) {
  const clean = String(code || "").trim();
  if (!clean) fail("Please enter a promo code");
  const found = await coupon.findOne({ where: { code: clean, status: true } });
  if (!found) fail("This promo code isn't valid");
  if (!couponLive(found)) fail("This promo code has expired");
  const used = await booking.findOne({
    where: { couponId: found.id, customerId: userId, paymentConfirmed: true },
    attributes: ["id"],
  });
  if (used) fail("You have already used this promo code");
  if (found.type === "conditional" && Number(found.condAmount) > 0 &&
      cents(preCouponTotal) < Number(found.condAmount)) {
    fail("Your order total is too low for this promo code");
  }
  if (couponAmount(found, preCouponTotal) <= 0) fail("This promo code can't be used on this order");
  return found;
}

// The order's price before its promo
const preCouponTotal = (b) => cents(Number(b.total || 0) + Number(b.couponDiscount || 0));

// Put `c` on the booking for a pre-promo price of `preTotal` (not saved)
function setCoupon(b, c, preTotal) {
  const amount = couponAmount(c, preTotal);
  b.couponId = c.id;
  b.couponCode = c.code;
  b.couponDiscount = amount;
  b.total = cents(preTotal - amount);
}

// Take the promo off the booking (not saved)
function clearCoupon(b, preTotal) {
  b.couponId = null;
  b.couponCode = null;
  b.couponDiscount = 0;
  b.total = cents(preTotal);
}

// After the order is re-priced to `preTotal` (e.g. a new courier): keep its promo if the
// coupon is still live, otherwise drop it (not saved)
async function reapplyCoupon(b, preTotal) {
  if (!b.couponId) {
    b.couponDiscount = 0;
    b.total = cents(preTotal);
    return;
  }
  const c = await coupon.findByPk(b.couponId);
  const ok = c && couponLive(c) &&
    !(c.type === "conditional" && Number(c.condAmount) > 0 && cents(preTotal) < Number(c.condAmount));
  if (ok && couponAmount(c, preTotal) > 0) setCoupon(b, c, preTotal);
  else clearCoupon(b, preTotal);
}

module.exports = {
  MIN_CHARGE,
  couponAmount,
  usableCoupon,
  preCouponTotal,
  setCoupon,
  clearCoupon,
  reapplyCoupon,
};
