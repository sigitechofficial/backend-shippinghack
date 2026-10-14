// Business membership on Stripe (Shipito style): one membership, billed monthly or
// yearly at the prices in businessSettings. The subscription lives on Stripe; the
// userPlans row mirrors it (status, period end) so orders can check it quickly.
const { STRIPE_SECRET_KEY } = process.env;
const stripe = require("stripe")(STRIPE_SECRET_KEY);
const { user, userPlan, businessSetting } = require("../models");
const Stripe = require("../controller/stripe");

const MEMBERSHIP_TYPE = "business_membership";
const BILLING = {
  monthly: { interval: "month", label: "Monthly", priceField: "monthlyPrice" },
  yearly: { interval: "year", label: "Yearly", priceField: "yearlyPrice" },
};

const isStripeSubscriptionId = (id) => typeof id === "string" && id.startsWith("sub_");

// Stripe subscription status -> userPlans.subscriptionStatus. Only "Active" lets a
// business create orders; a failed renewal Stripe is still retrying is "Unpaid".
function planStatus(stripeStatus) {
  if (stripeStatus === "active" || stripeStatus === "trialing") return "Active";
  if (stripeStatus === "past_due" || stripeStatus === "unpaid") return "Unpaid";
  if (stripeStatus === "incomplete") return "Incomplete";
  return "Canceled"; // canceled, incomplete_expired, paused
}

async function membershipSettings() {
  const row = await businessSetting.findOne({ order: [["id", "ASC"]] });
  return {
    monthlyPrice: Number(row ? row.monthlyPrice : 12),
    yearlyPrice: Number(row ? row.yearlyPrice : 99),
  };
}

async function ensureStripeCustomer(userId) {
  const u = await user.findByPk(userId, {
    attributes: ["id", "firstName", "lastName", "email", "stripeCustomerId"],
  });
  if (u.stripeCustomerId) return u.stripeCustomerId;
  const fullName = [u.firstName, u.lastName].filter(Boolean).join(" ");
  const customerId = await Stripe.addCustomer(fullName || u.email, u.email, u.id);
  await user.update({ stripeCustomerId: customerId }, { where: { id: u.id } });
  return customerId;
}

const toDate = (unixSeconds) => (unixSeconds ? new Date(unixSeconds * 1000) : null);

// Saves a Stripe subscription onto the user's userPlans row (created once per
// subscription) and makes the user a Business user while it is Active.
async function saveSubscription(userId, subscription) {
  const item = subscription.items && subscription.items.data && subscription.items.data[0];
  const interval = item && item.price && item.price.recurring && item.price.recurring.interval;
  const unitAmount = item && item.price ? item.price.unit_amount : null;
  const values = {
    userId,
    subscriptionPlanID: subscription.id,
    type: interval === "year" ? "Yearly" : "Monthly",
    price: unitAmount != null ? unitAmount / 100 : null,
    buyDate: toDate(subscription.start_date),
    expiryDate: toDate(subscription.current_period_end),
    subscriptionStatus: planStatus(subscription.status),
    shipLimit: 0, // no shipment cap: levels are earned from volume
  };
  let plan = await userPlan.findOne({
    where: { subscriptionPlanID: subscription.id },
    order: [["id", "ASC"]],
  });
  if (plan) await plan.update(values);
  else {
    plan = await userPlan.create(values);
    // the success page and the webhook can save the same subscription at once:
    // keep the first row only
    const rows = await userPlan.findAll({
      where: { subscriptionPlanID: subscription.id },
      order: [["id", "ASC"]],
    });
    if (rows.length > 1) {
      await userPlan.destroy({ where: { id: rows.slice(1).map((r) => r.id) } });
      plan = rows[0];
      await plan.update(values);
    }
  }
  if (values.subscriptionStatus === "Active") {
    await user.update({ userTypeId: 3 }, { where: { id: userId } });
  }
  return plan;
}

// Refreshes a Stripe-backed plan from Stripe; returns the plan (unchanged on errors).
async function syncPlan(plan) {
  if (!plan || !isStripeSubscriptionId(plan.subscriptionPlanID)) return plan;
  try {
    const subscription = await stripe.subscriptions.retrieve(plan.subscriptionPlanID);
    return await saveSubscription(plan.userId, subscription);
  } catch (err) {
    console.error(`business membership sync ${plan.subscriptionPlanID}:`, err && err.message);
    return plan;
  }
}

// The user's Active business plan, or null. A Stripe plan past its period end is
// re-checked first, so a renewal (or a cancellation) is picked up without webhooks.
// A Stripe plan whose renewal failed (Unpaid/Incomplete) is re-checked too: Stripe
// retries the card, and a later success makes it Active again.
async function activeBusinessPlan(userId) {
  let plan = await userPlan.findOne({
    where: { userId, subscriptionStatus: "Active" },
    order: [["id", "DESC"]],
  });
  if (plan && isStripeSubscriptionId(plan.subscriptionPlanID)) {
    const end = plan.expiryDate ? new Date(plan.expiryDate).getTime() : 0;
    if (end < Date.now()) plan = await syncPlan(plan);
  }
  if (!plan || plan.subscriptionStatus !== "Active") {
    const pending = await openStripePlan(userId);
    if (pending) plan = await syncPlan(pending);
  }
  return plan && plan.subscriptionStatus === "Active" ? plan : null;
}

// The user's latest Stripe plan whose payment is still being retried, or null
async function openStripePlan(userId) {
  const latest = await userPlan.findOne({
    where: { userId, subscriptionStatus: ["Unpaid", "Incomplete"] },
    order: [["id", "DESC"]],
  });
  return latest && isStripeSubscriptionId(latest.subscriptionPlanID) ? latest : null;
}

// What the website shows: the membership, with renewal / cancellation from Stripe.
async function membershipView(userId) {
  let plan = await userPlan.findOne({
    where: { userId },
    order: [["id", "DESC"]],
  });
  if (!plan) return null;
  let cancelAtPeriodEnd = false;
  if (isStripeSubscriptionId(plan.subscriptionPlanID)) {
    try {
      const subscription = await stripe.subscriptions.retrieve(plan.subscriptionPlanID);
      plan = await saveSubscription(userId, subscription);
      cancelAtPeriodEnd = !!subscription.cancel_at_period_end;
    } catch (err) {
      console.error(`business membership view ${plan.subscriptionPlanID}:`, err && err.message);
    }
  }
  return {
    subscriptionId: plan.subscriptionPlanID,
    status: plan.subscriptionStatus,
    billing: plan.type,
    price: plan.price,
    startedAt: plan.buyDate,
    currentPeriodEnd: plan.expiryDate,
    cancelAtPeriodEnd,
  };
}

module.exports = {
  stripe,
  MEMBERSHIP_TYPE,
  BILLING,
  isStripeSubscriptionId,
  membershipSettings,
  ensureStripeCustomer,
  saveSubscription,
  syncPlan,
  activeBusinessPlan,
  openStripePlan,
  membershipView,
};
