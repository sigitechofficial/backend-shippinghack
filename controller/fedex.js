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




module.exports={
    trackFedExPackage,
    validatePostalCode
}