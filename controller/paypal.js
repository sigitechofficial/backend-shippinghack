const CustomException = require("../middleware/errorObject");
const paypal = require("@paypal/checkout-server-sdk");
const axios = require("axios");
const { head } = require("../routes/business");

function environment() {
  let clientId = process.env.paypalClientId;
  let clientSecret = process.env.paypalClientSecret;
  return new paypal.core.SandboxEnvironment(clientId, clientSecret);
}

function createClient() {
  return new paypal.core.PayPalHttpClient(environment());
}

//--------------Create Paypal Products--------------//

async function createPaypalProduct(planData) {
  const { token } = await createPaypalToken();

  const productData = {
    name: planData.title,
    description: `Subscription service for ${planData.title}. Offers ${planData.freeStorage} of free storage, ${planData.processing} processing fee, and up to ${planData.shippingDiscount}% shipping discount.`,
    type: "SERVICE",
  };

  try {
    const response = await axios.post(
      "https://api-m.sandbox.paypal.com/v1/catalogs/products",
      productData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(
      `Product created for ${response.data}. ID: ${response.data.id}`
    );
    return response.data.id;
  } catch (error) {
    // console.error(`Failed to create product for ${planData.title}:`, error);
    throw error;
  }
}

//-----------------Create Paypal Plans------------------//

async function createPlans(prod_id, planData, billingType) {
const { token } = await createPaypalToken();
const url = "https://api-m.sandbox.paypal.com/v1/billing/plans";

const config = {
    headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json",
    },
};

let nfrequency;
let price;
if (billingType === "MONTHLY" || billingType === "Monthly") {
    nfrequency = {
    interval_unit: "MONTH",
    interval_count: 1,
    };
    price = planData.monthly_price - planData.shippingDiscount; 
} else if (billingType === "YEARLY" || billingType === "Yearly") {
    nfrequency = {
    interval_unit: "YEAR",
    interval_count: 1,
    };
    price = planData.annual_price - planData.shippingDiscount; 
}

const data = {
    product_id: prod_id,
    name: planData.title,
    description: `Subscription service for ${planData.title}. Offers ${planData.freeStorage} of free storage, ${planData.processing} processing fee, and up to ${planData.shippingDiscount}% shipping discount.`,
    status: "ACTIVE",
    billing_cycles: [
    {
        frequency: nfrequency,
        tenure_type: "REGULAR",
        sequence: 1,
        total_cycles: 0,
        pricing_scheme: {
        fixed_price: {
            value: price,
            currency_code: "USD",
        } ,
        },
    },
    ],
    payment_preferences: {
    auto_bill_outstanding: true,
    setup_fee: {
        value: "0",
        currency_code: "USD",
    },
    setup_fee_failure_action: "CONTINUE",
    },
};


try {
    const response = await axios.post(url, data, config);
    console.log("Response DATA : ", response.data);
    return response.data;
} catch (error) {
    console.error(
    "Error creating PayPal plan:",
    error.response ? error.response.data : error.message
    );
    return error.response ? error.response.data : error.message;
}
}

async function DeactivatePlan(plan_id) {
  const { token } = await createPaypalToken();

  console.log("Token ", token);

  const url =
    "https://api-m.sandbox.paypal.com/v1/billing/plans/P-7GL4271244454362WXNWU5NQ/deactivate";
  // return token;

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      //'PayPal-Request-Id': 'PLAN-18062019-789',
      //'Prefer': 'return=representation'
    },
  };

  try {
    const response = await axios.post(url, config);

    return response.data;
  } catch (error) {
    console.error(
      "Error in Deactivating the Plan:",
      error.response ? error.response.data : error.message
    );
    return error.response ? error.response.data : error.message;
  }
}

//--------------Create Paypal Creadit Card Info Store-------------------//

async function creditCardInfo(cardDetails) {
  const { token } = await createPaypalToken();

  const url = "https://api.sandbox.paypal.com/v1/vault/credit-cards";

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  };

  const response = await axios.post(url, cardDetails, config);
  console.log("Card Response Data: ", response.data);

  return { cardData: response.data, payerId: response.data.payer_id };
}

//--------------------------Subscriptions Create -------------------------//

async function SubscriptionCreatePayPal(plan_id, subscriberDetails, cardId) {
  const { token } = await createPaypalToken();

  console.log("Subscriber Details: ", subscriberDetails);

  console.log("Card ID: ", cardId);

  let futureDate = new Date();
  futureDate.setHours(futureDate.getMinutes() + 10);

  const url = "https://api-m.sandbox.paypal.com/v1/billing/subscriptions";

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  };

  const subscriptionData = {
    plan_id: plan_id,
    start_time: futureDate.toISOString(),
    subscriber: {
      name: {
        given_name: subscriberDetails.firstName,
        surname: subscriberDetails.lastName,
      },
      email_address: subscriberDetails.email,
      shipping_address: {
        name: {
          full_name:
            subscriberDetails.firstName + " " + subscriberDetails.lastName,
        },
        address: {
          address_line_1: "2211 N First Street",
          address_line_2: "Building 17",
          admin_area_2: "San Jose",
          admin_area_1: "CA",
          postal_code: "95131",
          country_code: "US",
        },
      },
    },
    application_context: {
      user_action: "SUBSCRIBE_NOW",
      locale: "en-US",
      payment_method:{
          payer_selected: "PAYPAL",
          payee_preferred: "IMMEDIATE_PAYMENT_REQUIRED"
      },
      return_url: "",
      cancel_url: "",
    },
    payment_source: {
      card: {
        id: cardId,
      },
    },
  };

  try {
    const response = await axios.post(url, subscriptionData, config);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error creating Subscription ",
      error.response ? error.response.data : error.message
    );
    return error.response ? error.response.data : error.message;
  }
}


//---------------- fetch All Products--------------------//
async function fetchPayPalProducts() {
  const { token } = await createPaypalToken();

  const url =
    "https://api-m.sandbox.paypal.com/v1/catalogs/products?page_size=45&page=1&total_required=true"; // Set the Pages Size to fetch products

  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  };

  try {
    const response = await axios.get(url, config);

    console.log("response of DATA: ", response.data);

    return response.data;
  } catch (error) {
    console.error(
      "Error In Fetching Products:",
      error.response ? error.response.data : error.message
    );
    return error.response ? error.response.data : error.message;
  }
}

//------------------fetch All Plans--------------------------------//
async function GetALLPlans() {
  const { token } = await createPaypalToken();

  const url =
    "https://api-m.sandbox.paypal.com/v1/billing/plans?sort_by=create_time&sort_order=desc";

  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  };

  try {
    const response = await axios.get(url, config);

    return response.data;
  } catch (error) {
    console.error(
      "Error in Fetching Plans :",
      error.response ? error.response.data : error.message
    );
    return error.response ? error.response.data : error.message;
  }
}

//-----------------Fetch Subscription Details--------------------//

async function getAllSubscriptions(subscriptionId) {
  const { token } = await createPaypalToken();

  console.log("Subscription ID: ", subscriptionId);

  const url = `https://api-m.sandbox.paypal.com/v1/billing/subscriptions/${subscriptionId}`;

  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  };

  try {
    const response = await axios.get(url, config);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error in Fetching Plans :",
      error.response ? error.response.data : error.message
    );
    return error.response ? error.response.data : error.message;
  }
}

//-----------------Get Plan By ID-----------------------//

async function planById(planId) {
  const { token } = await createPaypalToken();

  console.log("My Plan ID: ", planId);

  const url = `https://api-m.sandbox.paypal.com/v1/billing/plans/${planId}`;

  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  };

  const response = await axios.get(url, config);

  return response.data;
}


//----------------Get a Card Details-----------------//

async function getcardDetails(cardId){

    const {token}=await createPaypalToken();

    const url=`https://api.sandbox.paypal.com/v1/vault/credit-cards/${cardId}`

    const config={
        headers:{
            "Content-Type":"application/json",
            Authorization:`Bearer ${token}`,
            Accept:"application/json",
        }
    }


    try {

        const response=await axios.get(url,config)

        return response.data;
        
    } catch (error) {

        return error.response ? error.response.data : error.message;
        
    }


   
}







///-------------------------------Recurring function--------------------------///

async function createPaypalToken() {
  let output = false;
  let token = "";
  var details = {
    grant_type: "client_credentials",
  };
  var formBody = [];
  for (var property in details) {
    var encodedKey = encodeURIComponent(property);
    var encodedValue = encodeURIComponent(details[property]);
    formBody.push(encodedKey + "=" + encodedValue);
  }
  formBody = formBody.join("&");
  let login = process.env.paypalClientId;
  let password = process.env.paypalClientSecret;
  let encodedToken = Buffer.from(`${login}:${password}`).toString("base64");
  await axios({
    method: "post",
    url: "https://api-m.sandbox.paypal.com/v1/oauth2/token",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + encodedToken,
    },
    data: formBody,
  })
    .then(function (response) {
      output = true;
      token = response.data.access_token;
    })
    .catch(function (error) {
      console.log("Error obtaining PayPal token:", error);
    });
  return output ? { status: true, token } : { status: false, token };
}

module.exports = {
  createPaypalProduct,
  createPlans,
  fetchPayPalProducts,
  GetALLPlans,
  DeactivatePlan,
  SubscriptionCreatePayPal,
  getAllSubscriptions,
  planById,
  creditCardInfo,
  getcardDetails
};
