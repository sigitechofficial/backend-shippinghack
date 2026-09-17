const CustomException = require("../middleware/errorObject");

// Errors from payment providers (Stripe, Braintree) must never reach users as
// raw provider text ("Invalid API Key provided…", "Authentication Error").
// Card problems the customer can act on keep their message; infrastructure
// problems (keys, network, outages, rate limits) get a friendly message and
// the real error is logged for the team.

const FRIENDLY_MESSAGE =
  "Payments are temporarily unavailable. Please try again in a few minutes.";

// Stripe error types whose message is meant for the customer
const STRIPE_USER_FACING = new Set(["StripeCardError", "card_error"]);

function providerError(error, provider) {
  const type = error && (error.type || error.rawType || error.name);
  console.error(`[${provider}] provider error (${type}):`, error && error.message);

  if (provider === "stripe" && STRIPE_USER_FACING.has(type)) {
    return new CustomException(error.message, error.code);
  }
  return new CustomException(FRIENDLY_MESSAGE, FRIENDLY_MESSAGE);
}

module.exports = { providerError, FRIENDLY_MESSAGE };
