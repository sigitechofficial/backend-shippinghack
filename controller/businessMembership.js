// Business membership checkout on Stripe (website only). One membership, monthly
// or yearly, at the prices the admin sets in Admin > Business plan.
const { user } = require("../models");
const CustomException = require("../middleware/errorObject");
const { providerError } = require("../utils/providerErrors");
const {
  stripe,
  MEMBERSHIP_TYPE,
  BILLING,
  isStripeSubscriptionId,
  membershipSettings,
  ensureStripeCustomer,
  saveSubscription,
  activeBusinessPlan,
  membershipView,
} = require("../utils/businessMembership");

const returnFunction = (status, message, data, error) => ({ status, message, data, error });

const fail = (msg) => {
  throw new CustomException(msg, msg);
};

// A return URL from the website, only when it points at an allowed website origin
function safeReturnUrl(url, fallbackPath) {
  const fallback = `${process.env.FRONTEND_URL || "https://stageweb.theshippinghack.com"}${fallbackPath}`;
  if (!url) return fallback;
  let origin;
  try {
    origin = new URL(url).origin;
  } catch (e) {
    return fallback;
  }
  const allowed = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (allowed.length && !allowed.includes(origin)) return fallback;
  return url;
}

async function businessUser(userId) {
  const u = await user.findByPk(userId, { attributes: ["id", "userTypeId", "deletedAt", "status"] });
  if (!u || u.deletedAt) fail("Account not found");
  if (![1, 3].includes(Number(u.userTypeId))) fail("This account can't have a business membership");
  return u;
}

/*
        1. Membership prices + the user's membership
*/
async function getMembership(req, res) {
  const settings = await membershipSettings();
  const membership = await membershipView(req.user.id);
  const account = await user.findByPk(req.user.id, { attributes: ["businessName"] });
  const businessName = account ? account.businessName : null;
  return res.json(returnFunction("1", "Business membership", { settings, membership, businessName }, ""));
}

/*
        2. Start the Stripe checkout for the membership
*/
async function createMembershipCheckout(req, res) {
  const { billing, successUrl, cancelUrl } = req.body;
  const plan = BILLING[billing];
  if (!plan) fail("Choose monthly or yearly billing");
  await businessUser(req.user.id);
  if (await activeBusinessPlan(req.user.id)) fail("Your business membership is already active");

  const settings = await membershipSettings();
  const amount = Math.round(Number(settings[plan.priceField]) * 100);
  if (!(amount > 0)) fail("Membership price isn't set. Please contact support.");

  const customer = await ensureStripeCustomer(req.user.id);
  const metadata = { type: MEMBERSHIP_TYPE, userId: String(req.user.id), billing };
  const success = safeReturnUrl(successUrl, "/business-membership-success");
  let session;
  try {
    session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: amount,
            recurring: { interval: plan.interval },
            product_data: { name: `Business membership (${plan.label})` },
          },
        },
      ],
      metadata,
      subscription_data: { metadata },
      success_url: `${success}${success.includes("?") ? "&" : "?"}session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: safeReturnUrl(cancelUrl, "/select-package"),
    });
  } catch (err) {
    throw providerError(err, "stripe");
  }
  return res.json(returnFunction("1", "Checkout created", { url: session.url, sessionId: session.id }, ""));
}

/*
        3. Called by the success page: records the paid membership (also done by the
           webhook when it is configured; both are safe to run twice)
*/
async function confirmMembershipCheckout(req, res) {
  const { sessionId } = req.body;
  if (!sessionId) fail("Missing payment session");
  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["subscription"] });
  } catch (err) {
    fail("Unable to verify payment");
  }
  if (session.metadata?.type !== MEMBERSHIP_TYPE || String(session.metadata?.userId) !== String(req.user.id))
    fail("Payment does not match this account");
  if (session.status !== "complete" || !session.subscription)
    fail("Payment is still pending");

  const plan = await saveSubscription(req.user.id, session.subscription);
  if (plan.subscriptionStatus !== "Active")
    fail("Your payment didn't go through. Please try again.");
  const membership = await membershipView(req.user.id);
  return res.json(returnFunction("1", "Business membership active", { membership, userTypeId: "3" }, ""));
}

/*
        4. Cancel: the membership stays until the end of the paid period, then ends
*/
async function cancelMembership(req, res) {
  const plan = await activeBusinessPlan(req.user.id);
  if (!plan) fail("You don't have an active business membership");
  if (!isStripeSubscriptionId(plan.subscriptionPlanID))
    fail("This membership can't be cancelled online. Please contact support.");
  try {
    await stripe.subscriptions.update(plan.subscriptionPlanID, { cancel_at_period_end: true });
  } catch (err) {
    throw providerError(err, "stripe");
  }
  const membership = await membershipView(req.user.id);
  return res.json(returnFunction("1", "Your membership will end at the end of the paid period", { membership }, ""));
}

module.exports = {
  getMembership,
  createMembershipCheckout,
  confirmMembershipCheckout,
  cancelMembership,
};
