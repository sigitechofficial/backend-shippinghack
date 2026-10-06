const axios = require('axios');
const CustomException = require("../middleware/errorObject");

const FEDEX_API_BASE = process.env.FEDEX_ENVIRONMENT === 'production'
  ? 'https://apis.fedex.com'
  : 'https://apis-sandbox.fedex.com';


async function trackFedExPackage(trackingNumber) {
  try {
    // Create the payload for tracking
    const payload = {
      trackingInfo: [
        {
          trackingNumberInfo: {
            trackingNumber: trackingNumber
          }
        }
      ],
      includeDetailedScans: true
    };

    // Get the OAuth token
    const token = await axios.post(
      `${FEDEX_API_BASE}/oauth/token`,
      {
        grant_type: "client_credentials",
        client_id: process.env.client_id_track,
        client_secret: process.env.client_secret_track,
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
 

    // Make the request to track the package
    const response = await axios.post(
      `${FEDEX_API_BASE}/track/v1/trackingnumbers`,
      payload,
      {
        headers: {
          authorization: `Bearer ${token.data.access_token}`,
          "X-locale": "en_US",
          "Content-Type": "application/json",
          "x-customer-transaction-id": `624deea6-b709-470c-8c39-4b5511281492`,
        }
      }
    );

    console.log(response.data.output.completeTrackResults[0].trackResults[0]);
    return response.data.output; // Return tracking details
  } catch (error) {
    console.error('Error tracking FedEx package:', error.response ? error.response.data : error.message);
    return null; // Handle errors appropriately
  }
}


async function validatePostalCode(addressData) {
  console.log("Validating Postal Code:", addressData.streetAddress);

  try {
      // Fetch the access token
      const tokenResponse = await axios.post(
          `${FEDEX_API_BASE}/oauth/token`,
          new URLSearchParams({
              grant_type: "client_credentials",
              client_id: process.env.client_id,
              client_secret: process.env.client_secret,
          }),
          {
              headers: {
                  "Content-Type": "application/x-www-form-urlencoded",
              },
          }
      );

      const accessToken = tokenResponse.data.access_token;

      // Prepare the payload for postal code validation
      const payload = {
        carrierCode: "FDXE",
        countryCode: "US",
        stateOrProvinceCode: "PR", // Hardcoded to California
        postalCode: "99999", // Intentionally incorrect postal code
        shipDate: "2024-11-21", // Hardcoded valid date
        checkForMismatch:true
    };
      // Make the POST request to validate the postal code
      const response = await axios.post(
          `${FEDEX_API_BASE}/country/v1/postal/validate`,
          payload,
          {
              headers: {
                  Authorization: `Bearer ${accessToken}`,
                  "X-locale": "en_US",
                  "Content-Type": "application/json",
                  "x-customer-transaction-id": "624deea6-b709-470c-8c39-4b5511281493",
              },
          }
      );


      console.log("Postal Code Validation Alerts:", response.data.output.alerts);


      // Log and return the response
      console.log("Postal Code Validation Response:", response.data);
      return response.data;

  } catch (error) {
      console.error("Postal Code Validation Error:", error.response ? error.response.data : error.message);
      throw new Error(`Request failed: ${error.message}`);
  }
}




// ─── Ship API helpers (same account and keys the labels are made with) ──────────────
const FEDEX_ACCOUNT = "510087640";

// A FedEx error as one line ("CODE: message"), from an axios error or an Error
function fedexErrorText(error) {
  const e = error?.response?.data?.errors?.[0];
  return e ? `${e.code}: ${e.message}` : (error?.message || "FedEx request failed");
}

async function shipToken() {
  const token = await axios.post(
    `${FEDEX_API_BASE}/oauth/token`,
    new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.client_id,
      client_secret: process.env.client_secret,
    }).toString(),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );
  return token.data.access_token;
}

function jsonHeaders(token) {
  return { authorization: `Bearer ${token}`, "Content-Type": "application/json", "X-locale": "en_US" };
}

// Cancels (voids) a shipment that hasn't been picked up yet. Throws with FedEx's
// message when FedEx refuses.
async function cancelFedexShipment(trackingNumber) {
  try {
    const token = await shipToken();
    const res = await axios.put(
      `${FEDEX_API_BASE}/ship/v1/shipments/cancel`,
      { accountNumber: { value: FEDEX_ACCOUNT }, trackingNumber: String(trackingNumber) },
      { headers: jsonHeaders(token) }
    );
    const out = res.data?.output || {};
    if (out.cancelledShipment === false) {
      throw new Error(out.message || out.successMessage || "FedEx did not cancel the shipment");
    }
    return out;
  } catch (error) {
    throw new Error(fedexErrorText(error));
  }
}

// ─── Pickup Request API (FedEx Express collects the box at the sender's address) ─────
// Times are local to the pickup address ("HH:MM:SS"); dates "YYYY-MM-DD".
function pickupAddressOf(a) {
  const lines = [a.streetAddress, [a.building, a.floor, a.apartment].filter(Boolean).join(" ")]
    .map((l) => String(l || "").trim())
    .filter(Boolean)
    .slice(0, 2);
  return {
    streetLines: lines.length ? lines : [String(a.city || "")],
    city: String(a.city || ""),
    stateOrProvinceCode: "PR",
    postalCode: String(a.postalCode || "").trim(),
    countryCode: "US",
  };
}

// The days FedEx can pick up at this address, from dispatchDate on (FedEx returns the
// next few business days): [{ date, available, cutOffTime, accessHours, readyTimes,
// latestTimes, sameDay }]
async function pickupAvailability(address, dispatchDate) {
  try {
    const token = await shipToken();
    const res = await axios.post(
      `${FEDEX_API_BASE}/pickup/v1/pickups/availabilities`,
      {
        pickupAddress: pickupAddressOf(address),
        pickupRequestType: ["SAME_DAY", "FUTURE_DAY"],
        dispatchDate,
        carriers: ["FDXE"],
        countryRelationship: "DOMESTIC",
      },
      { headers: jsonHeaders(token) }
    );
    return (res.data?.output?.options || []).map((o) => ({
      date: o.pickupDate,
      available: !!o.available,
      sameDay: o.scheduleDay === "SAME_DAY",
      cutOffTime: o.cutOffTime || null,
      accessHours: Number(o.accessTime?.hours || 0) + Number(o.accessTime?.minutes || 0) / 60,
      readyTimes: o.readyTimeOptions || [],
      latestTimes: o.latestTimeOptions || [],
    }));
  } catch (error) {
    throw new Error(fedexErrorText(error));
  }
}

// Books the pickup. Returns { code, location } (FedEx's confirmation number and the
// FedEx location that will come); throws "CODE: message" when FedEx refuses.
async function createPickup({ address, contact, date, readyTime, closeTime, sameDay, weightLb, packageCount, remarks }) {
  try {
    const token = await shipToken();
    const res = await axios.post(
      `${FEDEX_API_BASE}/pickup/v1/pickups`,
      {
        associatedAccountNumber: { value: FEDEX_ACCOUNT },
        originDetail: {
          pickupAddressType: "OTHER",
          pickupLocation: { contact, address: pickupAddressOf(address) },
          readyDateTimestamp: `${date}T${readyTime}Z`,
          customerCloseTime: closeTime,
          pickupDateType: sameDay ? "SAME_DAY" : "FUTURE_DAY",
        },
        carrierCode: "FDXE",
        totalWeight: { units: "LB", value: Math.max(1, Math.round(Number(weightLb) * 10) / 10) },
        packageCount: Math.max(1, Number(packageCount) || 1),
        countryRelationships: "DOMESTIC",
        ...(remarks ? { remarks: String(remarks).slice(0, 60) } : {}),
      },
      { headers: jsonHeaders(token) }
    );
    const out = res.data?.output || {};
    if (!out.pickupConfirmationCode) throw new Error("FedEx returned no pickup confirmation");
    return { code: String(out.pickupConfirmationCode), location: out.location ? String(out.location) : null };
  } catch (error) {
    throw new Error(fedexErrorText(error));
  }
}

// Cancels a booked pickup; throws "CODE: message" when FedEx refuses.
async function cancelPickup({ code, date, location, remarks }) {
  try {
    const token = await shipToken();
    const res = await axios.put(
      `${FEDEX_API_BASE}/pickup/v1/pickups/cancel`,
      {
        associatedAccountNumber: { value: FEDEX_ACCOUNT },
        pickupConfirmationCode: String(code),
        scheduledDate: date,
        ...(location ? { location } : {}),
        carrierCode: "FDXE",
        ...(remarks ? { remarks: String(remarks).slice(0, 60) } : {}),
      },
      { headers: jsonHeaders(token) }
    );
    return res.data?.output || {};
  } catch (error) {
    throw new Error(fedexErrorText(error));
  }
}

module.exports={
    trackFedExPackage,
    pickupAvailability,
    createPickup,
    cancelPickup,
    validatePostalCode,
    FEDEX_API_BASE,
    FEDEX_ACCOUNT,
    fedexErrorText,
    shipToken,
    jsonHeaders,
    cancelFedexShipment,
}