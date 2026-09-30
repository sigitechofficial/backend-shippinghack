require("dotenv").config();
//importing Models
const {
  user,
  otpVerification,
  deviceToken,
  banner,
  bookingType,
  shipmentType,
  category,
  size,
  userPlan,
  addressDBS,
  coupon,
  booking,
  bookingStatus,
  bookingHistory,
  userType,
  cancelledBooking,
  userAddress,
  mblAppDynamic,
  unit,
  unitClass,
  structureType,
  province,
  district,
  corregimiento,
  distanceCharges,
  weightCharges,
  volumetricWeightCharges,
  generalCharges,
  billingDetails,
  links,
  support,
  warehouse,
  rating,
  estimatedBookingDays,
  driverPaymentSystem,
  driverDetail,
  vehicleType,
  FAQs,
  wallet,
  genAppSetting,
  defaultUnit,
  structQuestion,
  webUser,
  ecommerceCompany,
  appUnits,
  units,
  package,
  logisticCompany,
  restrictedItems,
  reason,
  logisticCompanyCharges,
} = require("../models");
const Shopify = require("shopify-api-node");
//! Shopify Instance
const shopify = new Shopify({
  shopName: process.env.SHOP_NAME,
  apiKey: process.env.SHOPIFY_API_KEY,
  password: process.env.SHOPIFY_APP_PASSWORD,
  apiVersion: "2024-04",
});
const getDistance = require("../utils/distanceCalculator");
const {
  pickupDelivery,
  accountCreated,
  orderPlaced,
  emailOTP,
  socialMediaLinks,
  emailButton,
  scheduleDelivery,
} = require("../helper/emailsHtml");
const socialLinks = socialMediaLinks();
const { attachment } = require("../helper/attactments");
const attach = attachment();
const { STRIPE_PUBLISHABLE_KEY, STRIPE_SECRET_KEY } = process.env;
const stripe = require("stripe")(STRIPE_SECRET_KEY);
const stripeFunction = require("./stripe");
//Brain tree
const Braintree = require("./braintree");
const {
  BtsubscriptionCreateMail,
  BtsubscriptionCancelMail,
  subscriptionExpireFun,
} = require("../helper/brainTreemails");

// Importing Custom exception
const CustomException = require("../middleware/errorObject");
//importing redis
const redis_Client = require("../routes/redis_connect");
const { sign } = require("jsonwebtoken");
const Stripe = require("./stripe");
// OTP generator
const otpGenerator = require("otp-generator");
//const sendNotification = require('../helper/throwNotification');
//const stripe = require('stripe')(process.env.STRIPE_KEY);
const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");
const { v4: uuidv4 } = require("uuid");
const fedex = require("./fedex");
// Calling mailer
const nodemailer = require("nodemailer");
const { attachments } = require("../helper/attachment");
const attachmentss = attachments();
const sequelize = require("sequelize");
// Barcode generator
var JsBarcode = require("jsbarcode");
var fs = require("fs");
var path = require("path");
const PDFDocument = require("pdfkit");
//var { createCanvas } = require("canvas");
var CryptoJS = require("crypto-js");

const { getDateAndTime } = require("../utils/helperFuncCompany");
const { recordAdminEarning } = require("../utils/ledger");
const { anyVehicleCovers } = require("../utils/distanceBands");
// Defining the account for sending email
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  //secure: true, // use TLS
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});
const translate = require("translate-google");
var Yappy = require("eprezto-yappy");
var yappy = new Yappy.Client({
  secretToken: process.env.SECRET_KEY,
  merchantId: process.env.MERCHANT_ID,
  successUrl: "https://pps507.com/signin",
  failUrl: "https://www.google.com.pk/",
  domainUrl: "https://www.pps507.com",
});
const axios = require("axios");
var randomstring = require("randomstring");
const {
  registerUserEmail,
  createBooking,
  forgetUserEmail,
} = require("../helper/emailsHtml");
const { DOMImplementation, XMLSerializer } = require("xmldom");
const xmlSerializer = new XMLSerializer();
const document = new DOMImplementation().createDocument(
  "http://www.w3.org/1999/xhtml",
  "html",
  null
);
const svgNode = document.createElementNS("http://www.w3.org/2000/svg", "svg");
const svg2img = require("svg2img");
const {
  currentAppUnitsId,
  unitsConversion,
  unitsSymbolsAndRates,
} = require("../utils/unitsManagement");
const { type } = require("os");
const moment = require("moment");
// const { height, width } = require("pdfkit/js/page");

function dateFormatDMY(dateStr) {
  // Split the string into year, month, and day
  const [year, month, day] = dateStr.split("-");
  // Format the date as "dd/mm/yyyy"
  const formattedDate = `${day}/${month}/${year}`;
  return formattedDate;
}
//! function to create FedEx Local shipment and schedule pickup

// async function createFedexShipmentLoc(bookingData) {

//   try{
//     const packageDetail = bookingData.packages.map((package, index) => ({
//       groupPackageCount: index + 1,
//       weight: {
//         value: parseInt(package.weight),
//         units: "LB",

//       },
//     }));

//     const currentDate = new Date();

//     const year = currentDate.getFullYear();
//     const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Adding 1 to month because it's zero-based
//     const date = String(currentDate.getDate()).padStart(2, "0");

//     const formattedDate = `${year}-${month}-${date}`;

//     const token = await axios.post(
//       "https://apis-sandbox.fedex.com/oauth/token",
//       {
//         grant_type: "client_credentials",
//         client_id: process.env.client_id,
//         client_secret: process.env.client_secret,
//       },
//       {
//         headers: {
//           "Content-Type": "application/x-www-form-urlencoded",
//         },
//       }
//     );

//     let newPayload = {
//       labelResponseOptions: "URL_ONLY",
//       requestedShipment: {
//           shipper: {
//               contact: {
//                   personName:bookingData.senderName.toUpperCase(),
//                   phoneNumber: Number(bookingData.senderPhone.replace(/\D/g, "")),
//                   companyName: "The Shipping Hack"
//               },
//               address: {
//                   streetLines: [bookingData.pickupAddress.streetAddress],
//                   city: bookingData.pickupAddress.city,
//                   stateOrProvinceCode: "PR",
//                   postalCode: bookingData.pickupAddress.postalCode,
//                   countryCode: "US"
//               }
//           },
//           recipients: [
//               {
//                   contact: {
//                       personName: bookingData.senderName.toUpperCase(),
//                       phoneNumber:  Number(bookingData.senderPhone.replace(/\D/g, "")),
//                       companyName: "The Shipping Hack"
//                   },
//                   address: {
//                       streetLines: [
//                         bookingData.dropoffAddress.streetAddress,
//                         bookingData.dropoffAddress.streetAddress,
//                       ],
//                       city: bookingData.dropoffAddress.city,
//                       stateOrProvinceCode:"PR",
//                       postalCode:bookingData.dropoffAddress.postalCode,
//                       countryCode: "US"
//                   }
//               }
//           ],
//           shipDatestamp:formattedDate ,
//           serviceType: "STANDARD_OVERNIGHT",
//           packagingType: "FEDEX_PAK",
//           pickupType: "USE_SCHEDULED_PICKUP",
//           blockInsightVisibility: false,
//           shippingChargesPayment: {
//               paymentType: "THIRD_PARTY",

//           },
//           labelSpecification: {
//               imageType: "PDF",
//               labelStockType: "PAPER_85X11_TOP_HALF_LABEL"
//           },
//           "requestedPackageLineItems": packageDetail,
//       },
//       accountNumber: {
//         value: "510087640",
//       }

//   }

//  console.log("PayLOAD",JSON.stringify(payload))

//     const response = await axios.post(
//       "https://apis-sandbox.fedex.com/ship/v1/shipments",
//       payload,
//       {
//         headers: {
//           authorization: `Bearer ${token.data.access_token}`,
//           "X-locale": "en_US",
//           "Content-Type": "application/json",
//           "x-customer-transaction-id": "624deea6-b709-470c-8c39-4b5511281492",
//         },
//       }
//     );
//     return response;
//   }
//   catch(error){
//        console.log("*************ERROR*****************",error?.response?.data.errors);
//       throw CustomException(`${error?.response?.data.errors[0].code}:${error?.response?.data.errors[0].message}`)
//   }

// }
async function createFedexShipmentLoc(bookingData) {


  try {
    const packageDetail = bookingData.packages.map((package, index) => ({
      groupPackageCount: index + 1,
      weight: {
        value: parseInt(package.weight),
        units: "LB",

      },
    }));
    const currentDate = new Date();

    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const date = String(currentDate.getDate()).padStart(2, "0");

    const formattedDate = `${year}-${month}-${date}`;

    const token = await axios.post(
      "https://apis-sandbox.fedex.com/oauth/token",
      {
        grant_type: "client_credentials",
        client_id: process.env.client_id,
        client_secret: process.env.client_secret,
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );


    console.log("Payload checking ------------------->")


    // const newPayload = {
    //   labelResponseOptions: "URL_ONLY",
    //   requestedShipment: {
    //     shipDatestamp: formattedDate, 
    //     serviceType: "INTERNATIONAL_ECONOMY", 
    //     packagingType: "YOUR_PACKAGING",
    //     pickupType: "USE_SCHEDULED_PICKUP",
    //     blockInsightVisibility: false,
    //     shipper: {
    //       contact: {
    //         personName: bookingData.senderName.toUpperCase(),
    //         phoneNumber: Number(bookingData.senderPhone.replace(/\D/g, "")),
    //         companyName: "The Shipping Hack",
    //       },
    //       address: {
    //                 streetLines: [bookingData.pickupAddress.streetAddress],
    //                 city: bookingData.pickupAddress.city,
    //                 stateOrProvinceCode: "PR",
    //                 postalCode:bookingData.pickupAddress.postalCode,
    //                 countryCode: "US",
    //               }
    //     },
    //     recipients: [
    //       {
    //         contact: {
    //           personName: bookingData.receiverName.toUpperCase(),
    //           phoneNumber: Number(bookingData.receiverPhone.replace(/\D/g, "")),
    //           companyName: "The Shipping Hack",
    //         },
    //       address: {
    //                 streetLines: [bookingData.dropoffAddress.streetAddress],
    //                 city:bookingData.dropoffAddress.city,
    //                 stateOrProvinceCode: "PR",
    //                 postalCode:bookingData.dropoffAddress.postalCode,
    //                 countryCode: "US",
    //               }
    //       }
    //     ],
    //     shippingChargesPayment: {
    //       paymentType: "THIRD_PARTY",
    //       payor: {
    //         responsibleParty: {
    //           accountNumber: {
    //             value: "510087640",
    //           }
    //         }
    //       }
    //     },
    //     labelSpecification: {
    //             imageType: "PDF",
    //             labelStockType: "PAPER_85X11_TOP_HALF_LABEL",
    //     },
    //     requestedPackageLineItems:packageDetail,
    //   },
    //   accountNumber: {
    //     value: "510087640",
    //   }
    // };

    const adjustedDynamicPayload = {
      labelResponseOptions: "URL_ONLY",
      requestedShipment: {
        shipDatestamp: formattedDate,
        serviceType: "INTERNATIONAL_PRIORITY",
        packagingType: "YOUR_PACKAGING",
        pickupType: "USE_SCHEDULED_PICKUP",
        totalWeight: bookingData.packages.reduce(
          (sum, pkg) => sum + parseFloat(pkg.weight || 0),
          0
        ),
        blockInsightVisibility: false,
        shipper: {
          contact: {
            personName: bookingData.senderName.toUpperCase(),
            phoneNumber: parseInt(bookingData.senderPhone.replace(/\D/g, "")),
            companyName: "The Shipping Hack",
          },
          address: {
            streetLines: [bookingData.pickupAddress.streetAddress],
            city: bookingData.pickupAddress.city,
            stateOrProvinceCode: "PR",
            postalCode: bookingData.pickupAddress.postalCode,
            countryCode: "US",
          },
        },
        recipients: [
          {
            contact: {
              personName: bookingData.receiverName.toUpperCase(),
              phoneNumber: parseInt(bookingData.receiverPhone.replace(/\D/g, "")),
              companyName: "The Shipping Hack",
            },
            address: {
              streetLines: [bookingData.dropoffAddress.streetAddress],
              city: bookingData.dropoffAddress.city,
              stateOrProvinceCode: "PR",
              postalCode: bookingData.dropoffAddress.postalCode,
              countryCode: "US",
            },
          },
        ],
        shippingChargesPayment: {
          paymentType: "THIRD_PARTY",
          payor: {
            responsibleParty: {
              accountNumber: {
                value: "510087640",
              },
            },
          },
        },
        labelSpecification: {
          imageType: "PDF",
          labelStockType: "PAPER_85X11_TOP_HALF_LABEL",
        },
        customsClearanceDetail: {
          dutiesPayment: {
            paymentType: "THIRD_PARTY",
            payor: {
              responsibleParty: {
                accountNumber: {
                  value: "510087640",
                },
              },
            },
          },
          isDocumentOnly: false,
          commodities: bookingData.packages.map((pkg) => ({
            description: pkg.note || "Commodity Description for International shipment",
            countryOfManufacture: "US",
            quantity: pkg.quantity || 1,
            quantityUnits: "PCS",
            unitPrice: {
              amount: pkg.unitPrice || 1.00,
              currency: "USD",
            },
            weight: {
              units: "LB",
              value: parseFloat(pkg.weight) || 1,
            },
          })),
        },
        requestedPackageLineItems: bookingData.packages.map((pkg, index) => ({
          customerReferences: [
            {
              customerReferenceType: "CUSTOMER_REFERENCE",
              value: pkg.reference || "Order Number or REFERENCE",
            },
          ],
          groupPackageCount: index + 1,
          weight: {
            units: "LB",
            value: parseFloat(pkg.weight) || 1,
          },
        })),
      },
      accountNumber: {
        value: "510087640",
      },
    };



    // const demo_Payload={
    // 	"labelResponseOptions": "URL_ONLY",
    // 	"requestedShipment": {
    // 		"shipper": {
    // 			"contact": {
    // 				"personName": "JOHN DOW",
    // 				"phoneNumber": 1212121221,
    // 				"companyName": "The Shipping Hack"
    // 			},
    // 			"address": {
    // 				"streetLines": [
    // 					"500 Ave Josa de Diego"
    // 				],
    // 				"city": "Bayamon",
    // 				"stateOrProvinceCode": "PR",
    // 				"postalCode": "00961",
    // 				"countryCode": "US"
    // 			}
    // 		},
    // 		"recipients": [
    // 			{
    // 				"contact": {
    // 					"personName": "Juan Del Pueblo",
    // 					"phoneNumber": 1010101010,
    // 					"companyName": ""
    // 				},
    // 				"address": {
    // 					"streetLines": [
    // 						"151 Calle de San Francisco"
    // 					],
    // 					"city": "SAN JUAN",
    // 					"stateOrProvinceCode": "PR",
    // 					"postalCode": "00901",
    // 					"countryCode": "US"
    // 				}
    // 			}
    // 		],
    // 		"shipDatestamp": "2024-11-20",
    // 		"serviceType": "INTERNATIONAL_PRIORITY",
    // 		"packagingType": "YOUR_PACKAGING",
    // 		"pickupType": "USE_SCHEDULED_PICKUP",
    // 		"totalWeight": 18,
    // 		"blockInsightVisibility": false,
    // 		"shippingChargesPayment": {
    // 			"paymentType": "THIRD_PARTY",
    // 			"payor": {
    //          	"responsibleParty": {
    //             	"accountNumber": {
    //               		"value": "510087640"
    // 					}			
    // 				}
    // 			}
    // 		},
    // 		"labelSpecification": {
    // 			"imageType": "PDF",
    // 			"labelStockType": "PAPER_85X11_TOP_HALF_LABEL"
    // 		},

    // 		"customsClearanceDetail": {
    // 			"dutiesPayment": {
    // 				"paymentType": "THIRD_PARTY",
    // 				"payor": {
    //          		"responsibleParty": {
    // 						"accountNumber": {
    //               			"value": "510087640"
    // 						}			
    // 					}
    // 				}				
    // 			},
    // 			"isDocumentOnly": false,
    // 			"commodities": [
    // 				{
    // 					"description": "Commodity Description for International shipment",
    // 					"countryOfManufacture": "US",
    // 					"quantity": 1,
    // 					"quantityUnits": "PCS",
    // 					"unitPrice": {
    // 						"amount": 1.00,
    // 						"currency": "USD"
    // 					},
    // 					"weight": {
    // 						"units": "LB",
    // 						"value": 1
    // 					}
    // 				}

    // 			]
    // 		},
    // 		"requestedPackageLineItems": [
    // 			{
    // 				 "customerReferences": [
    //              {
    //              "customerReferenceType": "CUSTOMER_REFERENCE",
    //                  "value": "Order Number or REFERENCE"
    //                 }
    // 					],				
    // 				"groupPackageCount":1,
    // 				"weight": {
    // 					"units": "LB",
    // 					"value": 5
    // 				}
    // 			}
    // 		]
    // 	},
    // 	"accountNumber": {
    // 		"value": "510087640"
    // 	}
    // }



    const validateResponse = await axios.post(
      "https://apis-sandbox.fedex.com/ship/v1/shipments/packages/validate",
      adjustedDynamicPayload,
      {
        headers: {
          authorization: `Bearer ${token.data.access_token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Validation response for package:", validateResponse);


    if (validateResponse.status === 200) {
      const response = await axios.post(
        "https://apis-sandbox.fedex.com/ship/v1/shipments",
        adjustedDynamicPayload,
        {
          headers: {
            authorization: `Bearer ${token.data.access_token}`,
            "X-locale": "en_US",
            "Content-Type": "application/json",
            "x-customer-transaction-id": "624deea6-b709-470c-8c39-4b5511281492",
          },
        }
      );
      return response;
    } else {
      throw new Error("Shipment validation failed");
    }



  } catch (error) {
    if (error?.response) {
      console.log("*************ERROR*****************", error?.response?.data.errors);
      throw new CustomException(`${error?.response?.data.errors[0].code}:${error?.response?.data.errors[0].message}`);
    } else {
      throw new CustomException(`${error?.message}`)
    }

  }


}
//! function to create FedEx International shipment and schedule pickup
// async function createFedexShipmentInt(bookingData) {

//      console.log("createFedexShipmentInt function =====================>",bookingData.packages)

//   try {
//     let packageDetail = bookingData.packages.map((package, index) => ({
//       weight: {
//         units: "LB",
//         value: parseFloat(package.actualWeight),
//       },
//     }));
//     const currentDate = new Date();

//     const year = currentDate.getFullYear();
//     const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Adding 1 to month because it's zero-based
//     const date = String(currentDate.getDate()).padStart(2, "0");

//     const formattedDate = `${year}-${month}-${date}`;

//   console.log("Before Payload----------->");
//   const currDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format for today

//   const payload = {
//     "labelResponseOptions": "URL_ONLY",
//     "requestedShipment": {
//       "shipDatestamp": currDate, // Set to the current date in the correct format
//       "serviceType": "INTERNATIONAL_ECONOMY",
//       "packagingType": "YOUR_PACKAGING",
//       "pickupType": "USE_SCHEDULED_PICKUP",
//       "blockInsightVisibility": false,
//       "shipper": {
//         "contact": {
//           "personName": "ARSHAD NADEEM",
//           "phoneNumber": "9233284499", // Removed '+' from the phone number
//           "companyName": "The Shipping Hack"
//         },
//         "address": {
//           "streetLines": ["655 South Hope Street 901"],
//           "city": "Los Angeles",
//           "stateOrProvinceCode": "CA",
//           "postalCode": "90017",
//           "countryCode": "US"
//         }
//       },
//       "recipients": [
//         {
//           "contact": {
//             "personName": "SIGI TECHNOLOGIES",
//             "phoneNumber": "3254687449", // Removed '+' from the phone number
//             "companyName": "The Shipping Hack"
//           },
//           "address": {
//             "streetLines": ["Sigi Technologies, Ali Town"],
//             "city": "San Juan", // Correct city for postal code 00732
//             "stateOrProvinceCode": "PR", // Puerto Rico state code
//             "postalCode": "00918", // Correct postal code for San Juan
//             "countryCode": "US" // Puerto Rico uses US as country code
//           }
//         }
//       ],
//       "shippingChargesPayment": {
//         "paymentType": "THIRD_PARTY",
//         "payor": {
//           "responsibleParty": {
//             "accountNumber": {
//               "value": "510087640"
//             }
//           }
//         }
//       },
//       "customsClearanceDetail": {
//         "dutiesPayment": {
//           "paymentType": "THIRD_PARTY",
//           "payor": {
//             "responsibleParty": {
//               "accountNumber": {
//                 "value": "510087640"
//               }
//             }
//           }
//         },
//         "commodities": [
//           {
//             "description": "General Goods",
//             "quantity": 2,
//             "quantityUnits": "EA",
//             "weight": {
//               "units": "LB",
//               "value": 10
//             },
//             "customsValue": {
//               "amount": 100,
//               "currency": "USD"
//             },
//             "countryOfManufacture": "US",
//             "unitPrice": {
//               "amount": 50,
//               "currency": "USD"
//             }
//           }
//         ],
//         "totalCustomsValue": {
//           "amount": 100,
//           "currency": "USD"
//         }
//       },
//       "labelSpecification": {
//         "imageType": "PDF",
//         "labelStockType": "PAPER_85X11_TOP_HALF_LABEL"
//       },
//       "requestedPackageLineItems": [
//         {
//           "weight": {
//             "units": "LB",
//             "value": 10
//           }
//         }
//       ]
//     },
//     "accountNumber": {
//       "value": "510087640"
//     }
//   };

//   const payload = {
//   labelResponseOptions: "URL_ONLY",
//   requestedShipment: {
//     shipDatestamp: currDate, // You can dynamically set this if needed
//     serviceType: "INTERNATIONAL_ECONOMY", // Adjust this based on the destination and availability
//     packagingType: "YOUR_PACKAGING",
//     pickupType: "USE_SCHEDULED_PICKUP",
//     blockInsightVisibility: false,
//     shipper: {
//       contact: {
//         personName: bookingData.senderName.toUpperCase(),
//         phoneNumber: Number(bookingData.senderPhone.replace(/\D/g, "")),
//         companyName: "The Shipping Hack",
//       },
//       address: {
//         streetLines: [bookingData.pickupAddress.streetAddress],
//         city: bookingData.pickupAddress.city,
//         stateOrProvinceCode: "CA", // Ensure this is in a valid format like "CA"
//         postalCode: "90017",
//         countryCode: "US",
//       }
//     },
//     recipients: [
//       {
//         contact: {
//           personName: bookingData.receiverName.toUpperCase(),
//           phoneNumber: Number(bookingData.receiverPhone.replace(/\D/g, "")),
//           companyName: "The Shipping Hack",
//         },
//         address: {
//           streetLines: [bookingData.dropoffAddress.dataValues.streetAddress],
//           city: bookingData.dropoffAddress.city,
//           stateOrProvinceCode: "PR", // Ensure this is in a valid format
//           postalCode: "00918",
//           countryCode: "US",
//         }
//       }
//     ],
//     shippingChargesPayment: {
//       paymentType: "THIRD_PARTY",
//       payor: {
//         responsibleParty: {
//           accountNumber: {
//             value: "740561073",
//           }
//         }
//       }
//     },
//     customsClearanceDetail: {
//       dutiesPayment: {
//         paymentType: "THIRD_PARTY",
//         payor: {
//           responsibleParty: {
//             accountNumber: {
//               value: "740561073",
//             }
//           }
//         }
//       },
//       commodities: bookingData.packages.map(pkg => ({
//         description: "General Goods",
//         quantity: 1, // Assuming 1 item per package; adjust if needed
//         quantityUnits: "EA",
//         weight: {
//           units: "LB",
//           value: Number(pkg.weight), // Adjust based on actual package weight
//         },
//         customsValue: {
//           amount: Number(bookingData.subTotal), // Adjust if each package has a different value
//           currency: "USD",
//         },
//         countryOfManufacture: "US", // Adjust based on actual origin
//         unitPrice: {
//           amount: Number(pkg.value), // Adjust if each package has a different value
//           currency: "USD",
//         }
//       })),
//       totalCustomsValue: {
//         amount: Number(bookingData.subTotal), // Sum of all customs values
//         currency: "USD",
//       }
//     },
//     labelSpecification: {
//       imageType: "PDF",
//       labelStockType: "PAPER_85X11_TOP_HALF_LABEL",
//     },
//     requestedPackageLineItems: bookingData.packages.map(pkg => ({
//       weight: {
//         units: "LB",
//         value: Number(pkg.weight),
//       },
//       dimensions: {
//         length: Number(pkg.length), // Ensure length is set for each package
//         width: Number(pkg.width),   // Ensure width is set for each package
//         height: Number(pkg.height), // Ensure height is set for each package
//         units: "IN",                // Set the unit for the dimensions
//       }
//     }))
//   },
//   accountNumber: {
//     value: "740561073",
//   }
// };

// bookingData.packages.forEach(pkg => {
//   const payload = {
//     labelResponseOptions: "URL_ONLY",
//     requestedShipment: {
//       shipDatestamp: currDate,
//       serviceType: "INTERNATIONAL_ECONOMY",
//       packagingType: "YOUR_PACKAGING",
//       pickupType: "USE_SCHEDULED_PICKUP",
//       blockInsightVisibility: false,
//       shipper: {
//         contact: {
//           personName: bookingData.senderName.toUpperCase(),
//           phoneNumber: Number(bookingData.senderPhone.replace(/\D/g, "")),
//           companyName: "The Shipping Hack",
//         },
//         address: {
//           streetLines: [bookingData.pickupAddress.streetAddress],
//           city: bookingData.pickupAddress.city,
//           stateOrProvinceCode: "CA",
//           postalCode: "90017",
//           countryCode: "US",
//         }
//       },
//       recipients: [
//         {
//           contact: {
//             personName: bookingData.receiverName.toUpperCase(),
//             phoneNumber: Number(bookingData.receiverPhone.replace(/\D/g, "")),
//             companyName: "The Shipping Hack",
//           },
//           address: {
//             streetLines: [bookingData.dropoffAddress.dataValues.streetAddress],
//             city: bookingData.dropoffAddress.city,
//             stateOrProvinceCode: "PR",
//             postalCode: "00918",
//             countryCode: "US",
//           }
//         }
//       ],
//       shippingChargesPayment: {
//         paymentType: "THIRD_PARTY",
//         payor: {
//           responsibleParty: {
//             accountNumber: {
//               value: "740561073",
//             }
//           }
//         }
//       },
//       customsClearanceDetail: {
//         dutiesPayment: {
//           paymentType: "THIRD_PARTY",
//           payor: {
//             responsibleParty: {
//               accountNumber: {
//                 value: "740561073",
//               }
//             }
//           }
//         },
//         commodities: [
//           {
//             description: "General Goods",
//             quantity: 1,
//             quantityUnits: "EA",
//             weight: {
//               units: "LB",
//               value: Number(pkg.weight),
//             },
//             customsValue: {
//               amount: Number(bookingData.subTotal),
//               currency: "USD",
//             },
//             countryOfManufacture: "US",
//             unitPrice: {
//               amount: Number(pkg.value),
//               currency: "USD",
//             }
//           }
//         ],
//         totalCustomsValue: {
//           amount: Number(bookingData.subTotal),
//           currency: "USD",
//         }
//       },
//       labelSpecification: {
//         imageType: "PDF",
//         labelStockType: "PAPER_85X11_TOP_HALF_LABEL",
//       },
//       requestedPackageLineItems: [
//         {
//           weight: {
//             units: "LB",
//             value: Number(pkg.weight),
//           }
//         }
//       ]
//     },
//     accountNumber: {
//       value: "740561073",
//     }
//   };

// Call the FedEx API with this payload (one package per request)
// });

//   const payload = {
//      labelResponseOptions: "URL_ONLY",
//      requestedShipment: {
//       shipDatestamp: currDate, // You can dynamically set this if needed
//       serviceType: "INTERNATIONAL_ECONOMY",  // Adjust this based on the destination and availability
//       packagingType: "YOUR_PACKAGING",
//       pickupType: "USE_SCHEDULED_PICKUP",
//       blockInsightVisibility: false,
//       shipper: {
//          contact: {
//           personName: bookingData.senderName.toUpperCase(),
//           phoneNumber: Number(bookingData.senderPhone.replace(/\D/g, "")),
//           companyName: "The Shipping Hack",
//          },
//          address: {
//           streetLines: [bookingData.pickupAddress.streetAddress],
//           city: bookingData.pickupAddress.city,
//           stateOrProvinceCode: "CA", // Ensure this is in a valid format like "CA"
//           postalCode: "90017",
//           countryCode: "US",
//          }
//       },
//       recipients: [
//          {
//           contact: {
//              personName: bookingData.receiverName.toUpperCase(),
//              phoneNumber: Number(bookingData.receiverPhone.replace(/\D/g, "")),
//              companyName: "The Shipping Hack",
//           },
//           address: {
//              streetLines: [bookingData.dropoffAddress.dataValues.streetAddress],
//              city: bookingData.dropoffAddress.city,
//              stateOrProvinceCode: "PR", // Ensure this is in a valid format
//              postalCode: "00918",
//              countryCode:"US",
//           }
//          }
//       ],
//       shippingChargesPayment: {
//          paymentType: "THIRD_PARTY",
//          payor: {
//           responsibleParty: {
//              accountNumber: {
//               value: "740561073",
//              }
//           }
//          }
//       },
//       customsClearanceDetail: {
//          dutiesPayment: {
//           paymentType: "THIRD_PARTY",
//           payor: {
//              responsibleParty: {
//               accountNumber: {
//                  value: "740561073",
//               }
//              }
//           }
//          },
//          commodities: bookingData.packages.map(pkg => ({
//           description: "General Goods",
//           quantity: 1, // Assuming 1 item per package; adjust if needed
//           quantityUnits: "EA",
//           weight: {
//              units: "LB",
//              value: Number(pkg.weight), // Adjust based on actual package weight
//           },
//           customsValue: {
//              amount: Number(bookingData.subTotal), // Adjust if each package has a different value
//              currency: "USD",
//           },
//           countryOfManufacture: "US", // Adjust based on actual origin
//           unitPrice: {
//              amount: Number(pkg.value), // Adjust if each package has a different value
//              currency: "USD",
//           }
//          })),
//          totalCustomsValue: {
//           amount: Number(bookingData.subTotal), // Sum of all customs values
//           currency: "USD",
//          }
//       },
//       labelSpecification: {
//          imageType: "PDF",
//          labelStockType: "PAPER_85X11_TOP_HALF_LABEL",
//       },
//       requestedPackageLineItems: bookingData.packages.map(pkg => ({
//          weight: {
//           units: "LB",
//           value: Number(pkg.weight),
//          }
//       }))
//      },
//      accountNumber: {
//       value: "740561073",
//      }
//   };

//   const validationPayload={
//     "labelResponseOptions": "URL_ONLY",
//     "requestedShipment": {
//       "shipDatestamp": currDate, // Set to the current date in the correct format
//       "serviceType": "INTERNATIONAL_ECONOMY",
//       "packagingType": "YOUR_PACKAGING",
//       "pickupType": "USE_SCHEDULED_PICKUP",
//       "blockInsightVisibility": false,
//       "shipper": {
//         "contact": {
//           "personName": "ARSHAD NADEEM",
//           "phoneNumber": "9233284499", // Removed '+' from the phone number
//           "companyName": "The Shipping Hack"
//         },
//         "address": {
//           "streetLines": ["655 South Hope Street 901"],
//           "city": "Los Angeles",
//           "stateOrProvinceCode": "CA",
//           "postalCode": "90017",
//           "countryCode": "US"
//         }
//       },
//       "recipients": [
//         {
//           "contact": {
//             "personName": "SIGI TECHNOLOGIES",
//             "phoneNumber": "3254687449", // Removed '+' from the phone number
//             "companyName": "The Shipping Hack"
//           },
//           "address": {
//             "streetLines": ["Sigi Technologies, Ali Town"],
//             "city": "San Juan", // Correct city for postal code 00732
//             "stateOrProvinceCode": "PR", // Puerto Rico state code
//             "postalCode": "00918", // Correct postal code for San Juan
//             "countryCode": "US" // Puerto Rico uses US as country code
//           }
//         }
//       ],
//       "shippingChargesPayment": {
//         "paymentType": "THIRD_PARTY",
//         "payor": {
//           "responsibleParty": {
//             "accountNumber": {
//               "value": "740561073"
//             }
//           }
//         }
//       },
//       "customsClearanceDetail": {
//         "dutiesPayment": {
//           "paymentType": "THIRD_PARTY",
//           "payor": {
//             "responsibleParty": {
//               "accountNumber": {
//                 "value": "740561073"
//               }
//             }
//           }
//         },
//         "commodities": [
//           {
//             "description": "General Goods",
//             "quantity": 2,
//             "quantityUnits": "EA",
//             "weight": {
//               "units": "LB",
//               "value": 10
//             },
//             "customsValue": {
//               "amount": 100,
//               "currency": "USD"
//             },
//             "countryOfManufacture": "US",
//             "unitPrice": {
//               "amount": 50,
//               "currency": "USD"
//             }
//           }
//         ],
//         "totalCustomsValue": {
//           "amount": 100,
//           "currency": "USD"
//         }
//       },
//       "labelSpecification": {
//         "imageType": "PDF",
//         "labelStockType": "PAPER_85X11_TOP_HALF_LABEL"
//       },
//       "requestedPackageLineItems": [
//         {
//           "weight": {
//             "units": "LB",
//             "value": 10
//           }
//         }
//       ]
//     },
//     "accountNumber": {
//       "value": "740561073"
//     }
//   };

//   console.log("After Payload----------->");

//     // return payload;

//      console.log("PayLOAD",JSON.stringify(payload))

//   //  console.log("PayLOAD))))",dataNEW)
//     const token = await axios.post(
//       "https://apis-sandbox.fedex.com/oauth/token",
//       {
//         grant_type: "client_credentials",
//         client_id: process.env.client_id,
//         client_secret: process.env.client_secret,
//       },
//       {
//         headers: {
//           "Content-Type": "application/x-www-form-urlencoded",
//         },
//       }
//     );

//     console.log("Tpken of fedex================>",token)

//     const validateResponse = await axios.post(
//         "https://apis-sandbox.fedex.com/ship/v1/shipments/packages/validate",
//         payload,
//         {
//           headers: {
//             authorization: `Bearer ${token.data.access_token}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );
//       console.log("Validation Api crosses--------------->",validateResponse.data.output)
// if (validateResponse.status==200) {

//     console,log(".....................................========================================>Going into success condition")
//   console.log("Shipment validated successfully");

//   // Proceed to shipment creation if validation succeeds
//   const response = await axios.post(
//     "https://apis-sandbox.fedex.com/ship/v1/shipments",
//     payload,
//     {
//       headers: {
//         authorization: `Bearer ${token.data.access_token}`,
//         "X-locale": "en_US",
//         "Content-Type": "application/json",
//         "x-customer-transaction-id": "624deea6-b709-470c-8c39-4b5511281493",
//       },
//     }
//   );

//   return response;
// } else {
//   throw new Error("Shipment validation failed");
// }
//     const response = await axios.post(
//       "https://apis-sandbox.fedex.com/ship/v1/shipments",
//       payload,
//       {
//         headers: {
//           authorization: `Bearer ${token.data.access_token}`,
//           "X-locale": "en_US",
//           "Content-Type": "application/json",
//           "x-customer-transaction-id": "624deea6-b709-470c-8c39-4b5511281493",
//         },
//       }
//     );
//     return response;

//   } catch (error) {

//       console.log("*************ERROR*****************",error?.response?.data.errors);
//         throw new CustomException(`${error?.response?.data.errors[0].code}:${error?.response?.data.errors[0].message}`)

//   }

//   }

async function createFedexShipmentInt(bookingData) {
  console.log(
    "createFedexShipmentInt function =====================>",
    bookingData
  );

  try {
    const currentDate = new Date();
    const currDate = currentDate.toISOString().split("T")[0];

    // Get FedEx token
    const token = await axios.post(
      "https://apis-sandbox.fedex.com/oauth/token",
      {
        grant_type: "client_credentials",
        client_id: process.env.client_id,
        client_secret: process.env.client_secret,
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const responses = [];
    for (const pkg of bookingData.packages) {
      const payload = {
        labelResponseOptions: "URL_ONLY",
        requestedShipment: {
          shipDatestamp: currDate,
          serviceType: "INTERNATIONAL_ECONOMY",
          packagingType: "YOUR_PACKAGING",
          pickupType: "USE_SCHEDULED_PICKUP",
          blockInsightVisibility: false,
          shipper: {
            contact: {
              personName: bookingData.senderName.toUpperCase(),
              phoneNumber: Number(bookingData.senderPhone.replace(/\D/g, "")),
              companyName: "The Shipping Hack",
            },
            address: {
              streetLines: [bookingData.pickupAddress.streetAddress],
              city: bookingData.pickupAddress.city,
              stateOrProvinceCode: "CA",
              postalCode: bookingData.pickupAddress.postalCode,
              countryCode: "US",
            },
          },
          recipients: [
            {
              contact: {
                personName: bookingData.receiverName.toUpperCase(),
                phoneNumber: Number(
                  bookingData.receiverPhone.replace(/\D/g, "")
                ),
                companyName: "The Shipping Hack",
              },
              address: {
                streetLines: [bookingData.dropoffAddress.streetAddress],
                city: bookingData.dropoffAddress.city,
                stateOrProvinceCode: "PR",
                postalCode: bookingData.dropoffAddress.postalCode,
                countryCode: "US",
              },
            },
          ],
          shippingChargesPayment: {
            paymentType: "THIRD_PARTY",
            payor: {
              responsibleParty: {
                accountNumber: {
                  value: "510087640",
                },
              },
            },
          },
          customsClearanceDetail: {
            dutiesPayment: {
              paymentType: "THIRD_PARTY",
              payor: {
                responsibleParty: {
                  accountNumber: {
                    value: "510087640",
                  },
                },
              },
            },
            commodities: [
              {
                description: pkg.note,
                quantity: 1,
                quantityUnits: "EA",
                weight: {
                  units: "LB",
                  value: Number(pkg.weight), // Use actual package weight
                },
                customsValue: {
                  amount: Number(pkg.value), // Adjust as needed
                  currency: "USD",
                },
                countryOfManufacture: "US",
                unitPrice: {
                  amount: Number(pkg.value), // Use actual package value
                  currency: "USD",
                },
              },
            ],
            totalCustomsValue: {
              amount: Number(bookingData.subTotal), // Total customs value for all packages
              currency: "USD",
            },
          },
          labelSpecification: {
            imageType: "PDF",
            labelStockType: "PAPER_85X11_TOP_HALF_LABEL",
          },
          requestedPackageLineItems: [
            {
              weight: {
                units: "LB",
                value: Number(pkg.weight), // Use actual package weight
              },
              dimensions: {
                length: Number(pkg.length), // Ensure length is set
                width: Number(pkg.width), // Ensure width is set
                height: Number(pkg.height), // Ensure height is set
                units: "IN", // Set the unit for dimensions
              },
            },
          ],
        },
        accountNumber: {
          value: "510087640",
        },
      };

      // Validate the payload for each package
      const validateResponse = await axios.post(
        "https://apis-sandbox.fedex.com/ship/v1/shipments/packages/validate",
        payload,
        {
          headers: {
            authorization: `Bearer ${token.data.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(
        "Validation response for package:",
        validateResponse.data.output
      );

      // Proceed to shipment creation if validation succeeds
      if (validateResponse.status === 200) {
        const shipmentResponse = await axios.post(
          "https://apis-sandbox.fedex.com/ship/v1/shipments",
          payload,
          {
            headers: {
              authorization: `Bearer ${token.data.access_token}`,
              "X-locale": "en_US",
              "Content-Type": "application/json",
              "x-customer-transaction-id":
                "624deea6-b709-470c-8c39-4b5511281493",
            },
          }
        );
        responses.push(shipmentResponse.data);
      } else {
        throw new Error("Shipment validation failed");
      }
    }

    return responses; // Return all shipment responses
  } catch (error) {
    if (error?.response) {
      console.log("*************ERROR*****************", error?.response?.data.errors);
      throw new CustomException(`${error?.response?.data.errors[0].code}:${error?.response?.data.errors[0].message}`);
    } else {
      throw new CustomException(`${error?.message}`)
    }

  }
}


// ! Module 1 : Auth - Customer On Boarding
// ! _________________________________________________________________________________________________________________________________
/*
            1. Send OTP for registration
    ________________________________________
*/

async function sendOTP(req, res) {
  const { email, password, signedBy, dvToken, languageCheck } = req.body;
  const userExist = await user.findOne({
    where: { email: email, deletedAt: { [Op.is]: null } },
    include: { model: otpVerification },
  });
  if (userExist && userExist.userTypeId == 2) {
    throw new CustomException(
      "Trying to login?",
      "A Driver with the follwoing email exists"
    );
  }
  if (userExist) {
    if (userExist.verifiedAt !== null)
      throw new CustomException(
        "Trying to login?",
        "A user with the follwoing email exists already"
      );
    let OTP = otpGenerator.generate(4, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });
    //return res.json(OTP)
    let emailData = {
      name: ``,
      OTP,
    };
    let html = registerUserEmail(emailData);
    transporter.sendMail(
      {
        from: process.env.EMAIL_USERNAME, // sender address
        to: [email, "sigidevelopers@gmail.com"], // list of receivers
        subject: `Verification code for The Shipping Hack is`, // Subject line
        //text: `Your OTP is ${OTP}`, // plain text body
        html,
        attachments: [
          {
            filename: "logo.png",
            path: __dirname + "/logo.png",
            cid: "logoImage", //same cid value as in the html img src
          },
        ],
      },
      function (err, info) {
        if (err) {
          console.log("******************************");
          console.log(err);
        }
        let DT = new Date();
        if (!userExist.otpVerification) {
          otpVerification
            .create({
              OTP: OTP,
              reqAt: DT,
              userId: userExist.id,
            })
            .then((otpData) =>
              res.json(
                returnFunction(
                  "1",
                  "OTP sent successfully",
                  { otpId: otpData.id, userId: userExist.id },
                  ""
                )
              )
            )
            .catch((err) =>
              res.json(returnFunction("0", "Error sending OTP", {}, `${err}`))
            );
        } else {
          otpVerification
            .update(
              {
                OTP: OTP,
                reqAt: DT,
              },
              { where: { userId: userExist.id } }
            )
            .then((otp) => {
              otpVerification
                .findOne({ where: { userId: userExist.id } })
                .then((otpData) =>
                  res.json(
                    returnFunction(
                      "1",
                      "OTP sent successfully",
                      { otpId: otpData.id, userId: userExist.id },
                      ""
                    )
                  )
                )
                .catch((err) =>
                  res.json(
                    returnFunction("0", "Error sending OTP", {}, `${err}`)
                  )
                );
            })
            .catch((err) =>
              res.json(returnFunction("0", "Error sending OTP", {}, `${err}`))
            );
        }
      }
    );
  } else {
    let userTypeId = 1;
    let hashedPassword = await bcrypt.hash(password, 10);
    let newUser = await user.create({
      email,
      password: hashedPassword,
      userTypeId,
      languageCheck,
    });

    // generating OTP
    let OTP = otpGenerator.generate(4, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });
    //return res.json(OTP)
    let emailData = {
      name: `email`,
      OTP,
    };
    let html = registerUserEmail(emailData);
    transporter.sendMail(
      {
        from: process.env.EMAIL_USERNAME, // sender address
        to: [email, "sigidevelopers@gmail.com"], // list of receivers
        subject: `Verification code for The Shipping Hack is`, // Subject line
        //text: `Your OTP is ${OTP}`, // plain text body
        html,
        attachments: [
          {
            filename: "logo.png",
            path: __dirname + "/logo.png",
            cid: "logoImage", //same cid value as in the html img src
          },
        ],
      },
      function (err, info) {
        if (err) console.log(err);
        let DT = new Date();
        otpVerification
          .create({
            // TODO update OTP
            OTP,
            reqAt: DT,
            userId: newUser.id,
          })
          .then((otpData) =>
            res.json(
              returnFunction(
                "1",
                "OTP sent successfully",
                { otpId: otpData.id, userId: newUser.id },
                ""
              )
            )
          )
          .catch((err) =>
            res.json(returnFunction("0", "Error sending OTP", {}, `${err}`))
          );
      }
    );
  }
  //return res.json(userExist);
}
/*
            2. Verify OTP for sign-up
*/
async function verifyOTPforSignUp(req, res) {
  const { otpId, OTP, userId } = req.body;

  if (OTP == "1234") {
    // Sign-up never waits on Stripe: the Stripe customer is created the first
    // time the user needs payments (see ensureStripeCustomerId).
    const u = await user.update(
      { verifiedAt: new Date() },
      { where: { id: userId } }
    );
    return res.json(returnFunction("1", "OTP verified", { userId }, ""));
  } else {
    const otpData = await otpVerification.findByPk(otpId, {
      attributes: ["id", "OTP", "verifiedInForgetCase", "userId"],
    });
    if (!otpData)
      throw new CustomException(
        "Sorry, we could not fetch the data",
        "Please rensend OTP to continue"
      );
    if (OTP != otpData.OTP) {
      throw new CustomException(
        "You entered incorrect OTP",
        "Please enter correct OTP to continue"
      );
    }

    // Sign-up never waits on Stripe: the Stripe customer is created the first
    // time the user needs payments (see ensureStripeCustomerId).
    const u = await user.update(
      { verifiedAt: new Date() },
      { where: { id: userId } }
    );
    return res.json(returnFunction("1", "OTP verified", { userId }, ""));
  }
}
/*
            2. Signup user     
    ________________________________________

*/

// async function registerUser(req, res) {
//   const { firstName, lastName, userId, countryCode, phoneNum, dvToken } =
//     req.body;

//   // checking if image is uploaded
//   // if (!req.file)
//   //   throw CustomException(
//   //     "Profile picture is required",
//   //     "Please add profile image"
//   //   );
//   let profileImage = null;
//   if (req.file) {
//     let tmpprofileImage = req.file.path;
//     profileImage = tmpprofileImage.replace(/\\/g, "/");
//   }

//   // Verifying OTP;
//   const userExist = await user.findOne({
//     where: { id: userId },
//     include: [
//       { model: otpVerification, required: false, attributes: ["OTP"] },
//       { model: deviceToken, required: false, attributes: ["tokenId"] },
//     ],
//     attributes: [
//       "id",
//       "firstName",
//       "lastName",
//       "email",
//       "countryCode",
//       "phoneNum",
//       "verifiedAt",
//       [
//         sequelize.fn("date_format", sequelize.col("user.createdAt"), "%Y"),
//         "joinedOn",
//       ],
//     ],
//   });
//   //return res.json(userExist)
//   //Checking if signUp is custom or by google
//   // check if user is verified
//   //  then only allow to create
//   //   otherwise redirect to verify otp
//   if (userExist.verifiedAt === null)
//     return res.json(
//       returnFunction("2", "Please verify your OTP first", {}, "")
//     );

//   const virtualBoxNumber = await generateUniqueVirtualBoxNumber();

//   //Updating user entry in Database
//   const selfPickUp = await warehouse.findOne({
//     where: { located: "usa" },
//     include: {
//       model: addressDBS,
//       attributes: {
//         exclude: [
//           "postalCode",
//           "lat",
//           "lng",
//           "type",
//           "deleted",
//           "status",
//           "createdAt",
//           "updatedAt",
//           "structureTypeId",
//           "userId",
//           "warehouseId",
//         ],
//       },
//     },
//     attributes: ["id"],
//   });

//   const confirmNumber=isPhoneNumberInRange(phoneNum)
//   if(!confirmNumber){
//     throw CustomException("Phone number is not within the range of 10 Digits.")

//   }

//   user
//     .update(
//       {
//         firstName,
//         lastName,
//         status: true,
//         countryCode,
//         phoneNum,
//         image: profileImage,
//         virtualBox: virtualBoxNumber, // Assign the generated virtual box number here
//       },
//       { where: { id: userExist.id } }
//     )
//     .then((updatedUser) => {
//       // add device Token if not found
//       const found = userExist.deviceTokens.find(
//         (ele) => ele.tokenId === dvToken
//       );
//       if (!found)
//         deviceToken.create({
//           tokenId: dvToken,
//           status: true,
//           userId: userExist.id,
//         });
//       // creating accessToken
//       const accessToken = sign(
//         { id: userExist.id, email: userExist.email, dvToken: dvToken },
//         process.env.JWT_ACCESS_SECRET
//       );
//       //Adding the online clients to reddis DB for validation process
//       redis_Client.hSet(`tsh${userExist.id}`, dvToken, accessToken);
//       userExist.dataValues.firstName = firstName;
//       userExist.dataValues.lastName = lastName;

//       let output = loginData(userExist, accessToken, false);

//       output.data.warehouseAddress = `${selfPickUp.addressDB.streetAddress}, ${selfPickUp.addressDB.city}, ${selfPickUp.addressDB.province}, ${selfPickUp.addressDB.postalCode} ${selfPickUp.addressDB.country}`;
//       output.data.virtualBoxNumber = virtualBoxNumber;

//       return res.json(output);
//     })
//     .catch((err) => {
//       return res.json(
//         returnFunction(
//           "0",
//           "Error in registration. Please try again",
//           {},
//           `${err}`
//         )
//       );
//     });
// }

async function registerUser(req, res, next) {
  const {
    firstName,
    lastName,
    userId,
    countryCode,
    phoneNum,
    dvToken,
    languageCheck,
  } = req.body;

  // checking if image is uploaded
  //   if (!req.file)
  //      throw CustomException(
  //       "Profile picture is required",
  //       "Please add profile image"
  //      );

  console.log("Request --------------------> ", req.body);
  let profileImage = null;
  if (req.file) {
    let tmpprofileImage = req.file.path;
    profileImage = tmpprofileImage.replace(/\\/g, "/");
  }

  // Verifying OTP;
  const userExist = await user.findOne({
    where: { id: userId },
    include: [
      { model: otpVerification, required: false, attributes: ["OTP"] },
      { model: deviceToken, required: false, attributes: ["tokenId"] },
    ],
    attributes: [
      "id",
      "firstName",
      "lastName",
      "email",
      "countryCode",
      "phoneNum",
      "userTypeId",
      "verifiedAt",
      "languageCheck",
      [
        sequelize.fn("date_format", sequelize.col("user.createdAt"), "%Y"),
        "joinedOn",
      ],
    ],
  });
  //return res.json(userExist)
  //Checking if signUp is custom or by google
  // check if user is verified
  //  then only allow to create
  //   otherwise redirect to verify otp
  if (userExist.verifiedAt === null)
    return res.json(
      returnFunction("2", "Please verify your OTP first", {}, "")
    );

  const virtualBoxNumber = await generateUniqueVirtualBoxNumber();

  //Updating user entry in Database
  const selfPickUp = await warehouse.findOne({
    where: { located: "usa" },
    include: {
      model: addressDBS,
      attributes: {
        exclude: [
          "postalCode",
          "lat",
          "lng",
          "type",
          "deleted",
          "status",
          "createdAt",
          "updatedAt",
          "structureTypeId",
          "userId",
          "warehouseId",
        ],
      },
    },
    attributes: ["id"],
  });
  const confirmNumber = isPhoneNumberInRange(phoneNum);
  if (!confirmNumber) {
    throw new CustomException(
      "Phone number is not within the range of 10 Digits."
    );
  }

  await user.update(
    {
      firstName,
      lastName,
      status: true,
      countryCode,
      phoneNum,
      image: profileImage,
      virtualBox: virtualBoxNumber, // Assign the generated virtual box number here
      languageCheck,
    },
    { where: { id: userExist.id } }
  );

  // add device Token if not found
  const found = userExist.deviceTokens.find((ele) => ele.tokenId === dvToken);
  if (!found)
    deviceToken.create({
      tokenId: dvToken,
      status: true,
      userId: userExist.id,
    });
  // creating accessToken
  const accessToken = sign(
    {
      id: userExist.id,
      email: userExist.email,
      dvToken: dvToken,
      language: userExist.languageCheck,
    },
    process.env.JWT_ACCESS_SECRET
  );

  const userlanguage = userExist.languageCheck;
  //Adding the online clients to reddis DB for validation process
  redis_Client.hSet(
    `tsh${userExist.id}`,
    dvToken,
    accessToken,
    "language",
    userlanguage
  );
  userExist.dataValues.firstName = firstName;
  userExist.dataValues.lastName = lastName;
  userExist.dataValues.countryCode = countryCode;
  userExist.dataValues.phoneNum = phoneNum;

  let output = loginData(userExist, accessToken, false);

  output.data.warehouseAddress = `${selfPickUp.addressDB.streetAddress}, ${selfPickUp.addressDB.city}, ${selfPickUp.addressDB.province}, ${selfPickUp.addressDB.postalCode} ${selfPickUp.addressDB.country}`;
  output.data.virtualBoxNumber = virtualBoxNumber;

  return res.json(returnFunction("1", "User Register Sucessfully", output));
}

async function registerUserMobile(req, res, next) {
  const { firstName, lastName, userId, countryCode, phoneNum, dvToken } =
    req.body;

  // checking if image is uploaded
  //   if (!req.file)
  //      throw CustomException(
  //       "Profile picture is required",
  //       "Please add profile image"
  //      );

  console.log("Request --------------------> ", req.body);
  let profileImage = null;
  if (req.file) {
    let tmpprofileImage = req.file.path;
    profileImage = tmpprofileImage.replace(/\\/g, "/");
  }

  // Verifying OTP;
  const userExist = await user.findOne({
    where: { id: userId },
    include: [
      { model: otpVerification, required: false, attributes: ["OTP"] },
      { model: deviceToken, required: false, attributes: ["tokenId"] },
    ],
    attributes: [
      "id",
      "firstName",
      "lastName",
      "email",
      "countryCode",
      "phoneNum",
      "userTypeId",
      "verifiedAt",
      "languageCheck",
      [
        sequelize.fn("date_format", sequelize.col("user.createdAt"), "%Y"),
        "joinedOn",
      ],
    ],
  });
  //return res.json(userExist)
  //Checking if signUp is custom or by google
  // check if user is verified
  //  then only allow to create
  //   otherwise redirect to verify otp
  if (userExist.verifiedAt === null)
    return res.json(
      returnFunction("2", "Please verify your OTP first", {}, "")
    );

  const virtualBoxNumber = await generateUniqueVirtualBoxNumber();

  //Updating user entry in Database
  const selfPickUp = await warehouse.findOne({
    where: { located: "usa" },
    include: {
      model: addressDBS,
      attributes: {
        exclude: [
          "postalCode",
          "lat",
          "lng",
          "type",
          "deleted",
          "status",
          "createdAt",
          "updatedAt",
          "structureTypeId",
          "userId",
          "warehouseId",
        ],
      },
    },
    attributes: ["id"],
  });
  const confirmNumber = isPhoneNumberInRange(phoneNum);
  if (!confirmNumber) {
    throw new CustomException(
      "Phone number is not within the range of 10 Digits."
    );
  }

  await user.update(
    {
      firstName,
      lastName,
      status: true,
      countryCode,
      phoneNum,
      image: profileImage,
      virtualBox: virtualBoxNumber, // Assign the generated virtual box number here
    },
    { where: { id: userExist.id } }
  );

  // add device Token if not found
  const found = userExist.deviceTokens.find((ele) => ele.tokenId === dvToken);
  if (!found)
    deviceToken.create({
      tokenId: dvToken,
      status: true,
      userId: userExist.id,
    });
  // creating accessToken
  const accessToken = sign(
    {
      id: userExist.id,
      email: userExist.email,
      dvToken: dvToken,
      language: userExist.languageCheck,
    },
    process.env.JWT_ACCESS_SECRET
  );
  const userlanguage = userExist.languageCheck;
  //Adding the online clients to reddis DB for validation process
  redis_Client.hSet(
    `tsh${userExist.id}`,
    dvToken,
    accessToken,
    "language",
    userlanguage
  );
  userExist.dataValues.firstName = firstName;
  userExist.dataValues.lastName = lastName;
  userExist.dataValues.countryCode = countryCode;
  userExist.dataValues.phoneNum = phoneNum;

  let output = registerData(userExist, accessToken, false);

  output.data.warehouseAddress = `${selfPickUp.addressDB.streetAddress}, ${selfPickUp.addressDB.city}, ${selfPickUp.addressDB.province}, ${selfPickUp.addressDB.postalCode} ${selfPickUp.addressDB.country}`;
  output.data.virtualBoxNumber = virtualBoxNumber;

  return res.json(output);
}
// Generate a unique virtual box number
async function generateUniqueVirtualBoxNumber() {
  let unique = false;
  let virtualBoxNumber;

  while (!unique) {
    // Generate a 6-digit numeric string
    const randomPart = Math.floor(100000 + Math.random() * 900000); // Ensures a number between 100000 and 999999
    virtualBoxNumber = `VBN-${randomPart}`;

    const count = await user.count({
      where: { virtualBox: virtualBoxNumber },
    });

    unique = count === 0;
  }

  return virtualBoxNumber;
}

// Return the user's Stripe customer id, creating and saving it if missing
async function ensureStripeCustomerId(userData) {
  if (userData.stripeCustomerId) return userData.stripeCustomerId;
  // callers sometimes load only a few columns; make sure name/email are present
  let details = userData;
  if (!details.email) {
    details = await user.findByPk(userData.id, {
      attributes: ["id", "firstName", "lastName", "email"],
    });
  }
  const fullName = [details.firstName, details.lastName].filter(Boolean).join(" ");
  const customerId = await Stripe.addCustomer(
    fullName || details.email,
    details.email,
    userData.id
  );
  await user.update(
    { stripeCustomerId: customerId },
    { where: { id: userData.id } }
  );
  userData.stripeCustomerId = customerId;
  return customerId;
}

/*
            3. Sign In user
    _________________________________________
*/
async function signInUser(req, res) {
  const { email, password, dvToken, signedBy } = req.body;
  const userData = await user.findOne({
    where: {
      email,
      deletedAt: { [Op.is]: null },
      userTypeId: { [Op.or]: [1, 3] },
    },
    include: { model: deviceToken, attributes: ["tokenId"] },
    attributes: [
      "id",
      "firstName",
      "lastName",
      "email",
      "password",
      "status",
      "userTypeId",
      "verifiedAt",
      "countryCode",
      "phoneNum",
      "languageCheck",
      [
        sequelize.fn("date_format", sequelize.col("createdAt"), "%Y"),
        "joinedOn",
      ],
    ],
  });
  // if user not found and signedBy (google or apple) then create new account
  if (
    (!userData && signedBy === "google") ||
    (!userData && signedBy === "apple") ||
    (!userData && signedBy === "facebook")
  ) {
    // Create the account first; the Stripe customer is created the first
    // time the user needs payments (see ensureStripeCustomerId).
    const userData = await user.create({
      email,
      userTypeId: 1,
      signedFrom: signedBy,
      verifiedAt: new Date(),
      // Add other necessary fields for social sign-up
    });
    const userId = userData.id;
    //  to return a response indicating successful social sign-up
    return res.json(
      returnFunction("3", `Sign-up by ${signedBy}`, { userId }, "")
    );
  }

  if (
    userData &&
    ["google", "apple", "facebook"].includes(userData.signedFrom) &&
    !signedBy
  ) {
    return res.json(
      returnFunction(
        "4",
        "Social Login Required",
        {},
        `You have previously signed up using ${userData.signedFrom}. Please log in using ${userData.signedFrom}.`
      )
    );
  }
  // if  user trying to login without getting registered
  else if (!userData && signedBy === "")
    throw new CustomException(
      "User not found",
      "No user exists against this email"
    );
  //  if user registed but not update their details firstName ,phone,profilePic
  if (!(signedBy === "") && userData.firstName === "") {
    return res.json(
      returnFunction(
        3,
        "Details Missing",
        { userId: userData.id },
        "Please Add  your Details to continue"
      )
    );
  }
  // if user registered and add his details(firstName,phone,profilePic) then throw him towards home screen
  if (
    signedBy === "google" ||
    signedBy === "apple" ||
    signedBy === "facebook"
  ) {
    console.log(
      "Going into This function=========================================>"
    );
    const userData = await user.findOne({
      where: {
        email,
        deletedAt: { [Op.is]: null },
        userTypeId: { [Op.or]: [1, 3] },
      },
      include: { model: deviceToken, attributes: ["tokenId"] },
      attributes: [
        "id",
        "firstName",
        "lastName",
        "email",
        "password",
        "status",
        "userTypeId",
        "verifiedAt",
        "countryCode",
        "phoneNum",
        "languageCheck",
        [
          sequelize.fn("date_format", sequelize.col("createdAt"), "%Y"),
          "joinedOn",
        ],
      ],
    });
    //  checking the status
    if (!userData.status)
      throw new CustomException(
        "Blocked by admin",
        "Please contact admin to continue"
      );

    // add device Token if not found
    const found = userData.deviceTokens.find((ele) => ele.tokenId === dvToken);
    if (!found)
      await deviceToken.create({
        tokenId: dvToken,
        status: true,
        userId: userData.id,
      });
    // creating accessToken
    const accessToken = sign(
      {
        id: userData.id,
        email: userData.email,
        dvToken: dvToken,
        language: userData.languageCheck,
      },
      process.env.JWT_ACCESS_SECRET
    );

    const userlanguage = userData.languageCheck;
    //Adding the online clients to reddis DB for validation process
    redis_Client.hSet(
      `tsh${userData.id}`,
      dvToken,
      accessToken,
      "language",
      userlanguage
    );
    let output = loginData(userData, accessToken, false);
    return res.json(output);
  }
  // else user is login by email and password
  let otpId = 0;
  //  checking the status
  if (!userData.status)
    throw new CustomException(
      "Blocked by admin",
      "Please contact admin to continue"
    );
  else {
    // get otp id of user
    const otpData = await otpVerification.findOne(
      { where: { userId: userData.id } },
      { attributes: ["id", "OTP", "verifiedInForgetCase", "userId"] }
    );
    if (!otpData)
      throw new CustomException("User Not Verifed", "user not verifeid by otp");
    otpId = otpData.id;
  }
  // Checking the email verification
  if (!userData.verifiedAt)
    return res.json(
      returnFunction(
        2,
        "Pending email verification",
        { userId: userData.id, otpId, email: userData.email },
        "Please verify your email to continue"
      )
    );
  // checking step 2 of sihn up process
  if (userData.userTypeId === 1) {
    if (userData.firstName === null || !userData.countryCode)
      return res.json(
        returnFunction(
          3,
          "Pending User Data",
          { userId: userData.id },
          "Your first Name or Country Code is Missing"
        )
      );
  }
  if (userData.userTypeId === 3) {
    if (userData.firstName === null) {
      return res.json(
        returnFunction(
          3,
          "Pending User Data",
          { userId: userData.id },
          "Your first Name is Missing"
        )
      );
    }
  }

  if (userData.userTypeId === 3) {
    const checkusersubscriptionStatus = await userPlan.findOne({
      where: {
        userId: userData.id,
        subscriptionStatus: "Active",
      },
      attributes: ["expiryDate", "subscriptionPlanID"],
    });

    console.log(
      "checkusersubscriptionStatus--------->",
      checkusersubscriptionStatus
    );

    if (checkusersubscriptionStatus) {
      const subscriptionDetails = await Braintree.getSubscriptionDetails(
        checkusersubscriptionStatus.subscriptionPlanID
      );
      const subscriptionId = subscriptionDetails.subscription.id;

      let userName =
        subscriptionDetails.subscription.transactions[0].customer.firstName;

      let StartDate = subscriptionDetails.subscription.firstBillingDate;

      const planId = subscriptionDetails.subscription.transactions[0].planId;

      let pname = await Braintree.planBYId(planId);

      let PlanName = pname.name;

      let BillingCycle = subscriptionDetails.subscription.numberOfBillingCycles;

      if (BillingCycle === 1) {
        BillingCycle = "Yearly";
      } else {
        BillingCycle = "Monthly";
      }

      let ExpiryDate = subscriptionDetails.subscription.billingPeriodEndDate;

      let Amount = subscriptionDetails.subscription.price;

      let data = {
        userName,
        PlanName,
        subscriptionId,
        StartDate,
        BillingCycle,
        ExpiryDate,
        Amount,
      };

      const expiryDate = moment(checkusersubscriptionStatus.expiryDate).startOf(
        "day"
      );
      console.log("New Expiry-------------?/?", expiryDate);
      const currentDay = moment().startOf("day");
      console.log("Current Days----->", currentDay);

      // Calculate the difference in hours
      const hoursUntilExpiry = expiryDate.diff(currentDay, "hours");

      console.log("Hours until Expiry--------------> ", hoursUntilExpiry);

      // Convert hours to days, rounding up to ensure partial days count
      const daysUntilExpiry = Math.ceil(hoursUntilExpiry / 24);

      console.log("Rounded Days until Expiry--------------> ", daysUntilExpiry);

      if (daysUntilExpiry === 2) {
        console.log("Mail Send--------------->");
        transporter.sendMail({
          from: process.env.EMAIL_USERNAME,
          to: [email, "sigidevelopers@gmail.com"],
          subject: "Your subscription is about to expire",
          html,
          attachment: attachmentss.subscribe,
        });
      } else if (daysUntilExpiry === 1) {
        console.log("Mail Send--------------->");
        transporter.sendMail({
          from: process.env.EMAIL_USERNAME,
          to: [email, "sigidevelopers@gmail.com"],
          html,
          attachment: attachmentss.subscribe,
        });
      }
    }
  }
  // Checking the password
  let match = await bcrypt.compare(password, userData.password);
  if (!match)
    throw new CustomException(
      "Bad credentials",
      "Please enter correct password to continue"
    );
  // add device Token if not found
  const found = userData.deviceTokens.find((ele) => ele.tokenId === dvToken);
  if (!found)
    await deviceToken.create({
      tokenId: dvToken,
      status: true,
      userId: userData.id,
    });
  // creating accessToken
  const accessToken = sign(
    {
      id: userData.id,
      email: userData.email,
      dvToken: dvToken,
      language: userData.languageCheck,
    },
    process.env.JWT_ACCESS_SECRET
  );

  const userlanguage = userData.languageCheck;
  console.log("🚀 ~ signInUser ~ userlanguage:", userlanguage);
  //Adding the online clients to reddis DB for validation process
  redis_Client.hSet(
    `tsh${userData.id}`,
    dvToken,
    accessToken,
    "language",
    userlanguage
  );
  let output = loginData(userData, accessToken, false);
  return res.json(output);
}
/*
            4. OTP request for changing password
*/
async function forgetPasswordRequest(req, res) {
  const { email } = req.body;
  const userData = await user.findOne({
    where: {
      email,
      deletedAt: { [Op.is]: null },
      userTypeId: { [Op.or]: [1, 3] },
    },
    include: { model: otpVerification, attributes: ["id"] },
    attributes: ["id"],
  });

  // user not found
  if (!userData)
    throw new CustomException(
      "Invalid information",
      "No user exists against this email"
    );
  let OTP = otpGenerator.generate(4, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
  //return res.json(OTP)

  let emailData = {
    name: `email`,
    OTP,
  };
  let html = forgetUserEmail(emailData);
  transporter.sendMail(
    {
      from: process.env.EMAIL_USERNAME, // sender address
      to: [email, "sigidevelopers@gmail.com"], // list of receivers
      subject: `Verification code for The Shipping Hack is`, // Subject line
      //text: `Your OTP is ${OTP}`, // plain text body
      html,
      attachments: [
        {
          filename: "logo.png",
          path: __dirname + "/logo.png",
          cid: "logoImage", //same cid value as in the html img src
        },
      ],
    },
    function (err, info) {
      //if(err) throw new CustomException('Error sending email',`${err}`)

      let DT = new Date();
      if (userData.otpVerification != null) {
        otpVerification
          .update(
            {
              // TODO update otp
              OTP: OTP,
              reqAt: DT,
            },
            { where: { userId: userData.id } }
          )
          .then((otpData) =>
            res.json(
              returnFunction(
                "1",
                "OTP updated successfully",
                { otpId: userData.otpVerification.id, userId: userData.id },
                ""
              )
            )
          )
          .catch((err) =>
            res.json(returnFunction("0", "Error updating OTP", {}, `${err}`))
          );
      } else {
        otpVerification
          .create({
            // TODO update otp
            OTP: OTP,
            reqAt: DT,
            userId: userData.id,
          })
          .then((otpData) =>
            res.json(
              returnFunction(
                "1",
                "OTP sent successfully",
                { otpId: otpData.id, userId: userData.id },
                ""
              )
            )
          )
          .catch((err) =>
            res.json(returnFunction("0", "Error sending OTP", {}, `${err}`))
          );
      }
    }
  );
}
/*
            5. Verify OTP for changing password
*/
async function verifyOTPforPassword(req, res) {
  const { otpId, OTP } = req.body;
  const otpData = await otpVerification.findByPk(otpId, {
    attributes: ["id", "OTP", "verifiedInForgetCase", "userId"],
  });
  if (!otpData)
    throw new CustomException(
      "Sorry, we could not fetch the data",
      "Please rensend OTP to continue"
    );

  if (OTP != otpData.OTP) {
    throw new CustomException(
      "You entered incorrect OTP Please enter correct OTP to continue"
    );
  }
  otpData.verifiedInForgetCase = true;
  await otpData.save();
  return res.json(
    returnFunction("1", "OTP verified", { otpId, userId: otpData.userId }, "")
  );
}
/*
            6. Change password in response to OTP
*/
async function changePasswordOTP(req, res) {
  const { userId, otpId, password } = req.body;
  const otpData = await otpVerification.findByPk(otpId, {
    attributes: ["id", "OTP", "verifiedInForgetCase"],
  });
  const userData = await user.findByPk(userId, {
    attributes: ["id", "password"],
  });
  if (!otpData)
    throw new CustomException(
      "Sorry, we could not fetch the data",
      "Please rensend OTP to continue"
    );
  if (otpData.verifiedInForgetCase === false)
    throw new CustomException(
      "OTP not verified yet",
      "Please verify OTP first"
    );
  let hashedPassword = await bcrypt.hash(password, 10);
  userData.password = hashedPassword;
  await userData.save();
  // reset the OTP Id
  otpData.verifiedInForgetCase = false;
  await otpData.save();
  return res.json(
    returnFunction(
      "1",
      "Password updated successfully. Please login to continue",
      {},
      ""
    )
  );
}
/*
            7. Check session
*/
async function session(req, res) {
  const userId = req.user.id;
  const { guestUser } = req.body;
  if (guestUser) throw new CustomException("Login failed", "");
  const userData = await user.findByPk(userId, {
    attributes: [
      "id",
      "firstName",
      "lastName",
      "email",
      "status",
      "countryCode",
      "phoneNum",
    ],
  });
  if (!userData) {
    throw new CustomException(
      "Sorry no user found!",
      "Please contact support for more information"
    );
  }
  if (!userData?.status)
    throw new CustomException(
      "You are blocked by Admin",
      "Please contact support for more information"
    );
  let output = loginData(userData, "", guestUser);
  return res.json(output);
}

/*
|||| change Lanuage Api
*/
async function changeLanguageApi(req, res) {
  const userId = req.user.id;

  const { language } = req.body;

  const lanuageUpdate = await user.update(
    { languageCheck: language },
    { where: { id: userId } }
  );

  return res.json(returnFunction("1", "Language Updated", lanuageUpdate));
}

/*
            8. Log out  
    ________________________________________
*/
async function logout(req, res) {
  //return res.json(req.user);
  // removing the device token from DB
  deviceToken.destroy({
    where: { tokenId: req.user.dvToken, userId: req.user.id },
  });
  // removing from redis
  redis_Client
    .hDel(`tsh${req.user.id}`, req.user.dvToken)
    .then((upData) => {
      return res.json({
        status: "1",
        message: "Log-out successfully",
        data: {},
        error: "",
      });
    })
    .catch((err) => {
      return res.json({
        status: "0",
        message: "Internal server error",
        data: {},
        error: "There is some error logging out. Please try again",
      });
    });
}
/*
            9. Delete User  
    ________________________________________
*/
async function deleteUser(req, res) {
  const userId = req.user.id;
  const deliverybookings = await booking.findAll({
    where: {
      [Op.and]: [
        {
          bookingStatusId: {
            [Op.or]: [
              1, // Accepted(pickup)
              7, // Reached Warehouse
              8, // Picked(pickup)
              10, // Accepted(delivery)
              11, // Pickedup(delivery)
              12, // Ongoing(delivery)
              13, // Reached (Pickup)
              15, // Reached at Delivery Point(pickup)
              16, // Pickedup From warehouse(pickup)
              17, // ongoing start Ride (Delivery)
              20, // Awaiting self Pickup
            ],
          },
        },
        { customerId: userId },
      ],
    },
  });
  if (deliverybookings.length > 0) {
    return res.json({
      status: "0",
      message: "Customer has Bookings",
      data: {},
      error: "",
    });
  } else {
    user
      .update(
        { status: false, deletedAt: Date.now() },
        { where: { id: userId } }
      )
      .then((dat) => {
        return res.json({
          status: "1",
          message: "User deleted successfully",
          data: {},
          error: "",
        });
      });
  }
}
/*
            10. Guest User  
    ________________________________________
*/
async function guestUser(req, res) {
  const { dvToken } = req.body;
  const userData = await user.findOne({
    where: { email: "guestuser@gmail.com" },
  });
  const accessToken = sign(
    { id: userData.id, email: userData.email, dvToken, expiresIn: "2h" },
    process.env.JWT_ACCESS_SECRET
  );
  //Adding the online clients to reddis DB for validation process
  redis_Client.hSet(`tsh${userData.id}`, dvToken, accessToken);
  let output = {
    status: "1",
    message: "Guest Login",
    data: {
      userId: `${userData.id}`,
      accessToken: `${accessToken}`,
      isGuest: true,
    },
    error: "",
  };
  return res.json(output);
}

async function resendOTP(req, res) {
  const { userId } = req.body;
  const userExist = await user.findByPk(userId);
  if (!userExist)
    throw new CustomException(
      "Sorry, we could not fetch the associated data",
      "Please try sending again"
    );
  let otpData = await otpVerification.findOne({ where: { userId } });
  let OTP = otpGenerator.generate(4, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
  //return res.json(OTP)
  let emailData = {
    name: ``,
    OTP,
  };
  let html = registerUserEmail(emailData);
  transporter.sendMail(
    {
      from: process.env.EMAIL_USERNAME, // sender address
      to: [userExist.email, "sigidevelopers@gmail.com"], // list of receivers
      subject: `Verification code for The Shipping Hack is`, // Subject line
      //text: `Your OTP is ${OTP}`, // plain text body
      html,
      attachments: [
        {
          filename: "logo.png",
          path: __dirname + "/logo.png",
          cid: "logoImage", //same cid value as in the html img src
        },
      ],
    },
    function (err, info) {
      if (err) console.log(err);
      let DT = new Date();
      if (!otpData) {
        otpVerification
          .create({
            OTP,
            reqAt: DT,
            verifiedInForgetCase: false,
            userId,
          })
          .then((otpData) =>
            res.json(
              returnFunction(
                "1",
                `OTP sent successfully`,
                { otpId: otpData.id },
                ""
              )
            )
          )
          .catch((err) =>
            res.json(returnFunction("0", "Error sending OTP", {}, `${err}`))
          );
      } else {
        otpVerification
          .update(
            {
              OTP,
              reqAt: DT,
              verifiedInForgetCase: false,
            },
            { where: { userId } }
          )
          .then((otpdata) =>
            res.json(
              returnFunction(
                "1",
                `OTP sent successfully`,
                { otpId: otpData.id },
                ""
              )
            )
          )
          .catch((err) =>
            res.json(returnFunction("0", "Error sending OTP", {}, `${err}`))
          );
      }
    }
  );
}
// ! Module 2 : Home & Send Parcel
// ! _________________________________________________________________________________________________________________________________

/*
            1. Home Page API
    ________________________________________
*/
async function homepage(req, res) {
  const userId = req.user.id;
  const bannersData = await banner.findAll({
    where: { status: true },
    attributes: ["image", "description"],
  });
  const bookingTypeData = await bookingType.findAll({
    where: { status: true },
    attributes: ["id", "title", "description", "image"],
  });

  const selectPackageType = await bookingType.findAll({
    where: { status: 2 },
    attributes: ["id", "title", "description", "image"],
  });

  const selfPickUp = await warehouse.findOne({
    where: { located: "rico" },
    include: {
      model: addressDBS,
      attributes: {
        exclude: [
          "lat",
          "lng",
          "type",
          "deleted",
          "status",
          "createdAt",
          "updatedAt",
          "structureTypeId",
          "userId",
          "warehouseId",
        ],
      },
    },
    attributes: ["id"],
  });

  // dont show completed or cancelled bookings --> bookingStatusId = 14 and 15

  // If any booking has rating pending, send trur for calling rating api
  // TODO update booking status Id
  const ratingData = await booking.findOne({
    where: { bookingStatusId: 14, rated: "pending", customerId: userId },
    attributes: ["id"],
  });
  let callRatingApi = false;
  if (ratingData) callRatingApi = true;
  return res.json(
    returnFunction(
      "1",
      "Homepage Data",
      {
        banners: bannersData,
        callRatingApi,
        bookingTypeData,
        selectPackageType,
        selfPickUp,
      },
      ""
    )
  );
}

//! function for calculating Total Weight, Total Dimenssional Weight and charged weight
async function calculateWeights(packages, divisor) {
  console.log("Packages===========>Consolidate", packages);
  console.log("divisor===========>divisor", divisor);

  let weight = 0;
  let dimensionalWeight = 0;
  let chargedWeight = 0;

  for (let index = 0; index < packages.length; index++) {
    let package = packages[index];
    let Weightcharges = 0;
    let billableWeight = 0;

    weight += package.actualWeight;
    const testWeight = package.actualVolume / divisor;
    dimensionalWeight += testWeight;

    // billable = larger of actual and dimensional weight (equal values used to give 0).
    // As before, only the dimensional weight is rounded; actual weight is billed as measured
    // (rounding it would bill a 6.4 lb parcel as 6 lb).
    const actual = Number(package.actualWeight) || 0;
    const dim = testWeight || 0;
    billableWeight = actual >= dim ? actual : Math.round(dim) || dim;

    chargedWeight += billableWeight;
    console.log("🚀 ~ calculateWeights ~ chargedWeight:", chargedWeight)
  }
  return { weight, dimensionalWeight, chargedWeight };
}
/*
            . shipping Calculater
    ________________________________________
*/
async function calculateWeight(packages, divisor) {
  let weight = 0;
  let dimensionalWeight = 0;
  let chargedWeight = 0;

  for (let index = 0; index < packages.length; index++) {
    let package = packages[index];
    let Weightcharges = 0;
    let billableWeight;

    weight += parseFloat(package.weight);
    dimensionalWeight += package.volume / divisor;

    // billable = larger of actual and dimensional weight (equal values used to give NaN/0).
    // Only the dimensional weight is rounded; actual weight is billed as entered.
    const actual = parseFloat(package.weight) || 0;
    const dim = package.volume / divisor || 0;
    billableWeight = actual >= dim ? actual : Math.round(dim) || dim;

    chargedWeight += parseFloat(billableWeight);
  }
  return { weight, dimensionalWeight, chargedWeight };
}
///////
async function shippingCalculater(req, res) {
  const { origin, destination, packages, bookingType } = req.body;

  const appUnitData = await appUnits.findOne({
    where: { status: true, deleted: false },
    include: [
      { model: units, as: "weightUnit", attributes: ["conversionRate"] },
      { model: units, as: "lengthUnit", attributes: ["conversionRate"] },
      { model: units, as: "distanceUnit", attributes: ["conversionRate"] },
    ],
    attributes: ["id"],
  });

  const logisticCompanyData = await logisticCompany.findAll({
    where: {
      status: true,
    },
    include: {
      model: logisticCompanyCharges,
      where: {
        status: true,
        bookingType: bookingType,
      },
    },
  });

  packages.map((data) => {
    // Making conversions
    data.length = unitConversions(
      data.length,
      appUnitData.lengthUnit.conversionRate
    );
    data.width = unitConversions(
      data.width,
      appUnitData.lengthUnit.conversionRate
    );
    data.height = unitConversions(
      data.height,
      appUnitData.lengthUnit.conversionRate
    );
    data.weight = unitConversions(
      data.weight,
      appUnitData.weightUnit.conversionRate
    );
    // Calculating volume
    data.volume = data.length * data.width * data.height;
  });

  let arryofCompanies = [];
  let companySet = new Set(); // To track unique company IDs

  for (let company of logisticCompanyData) {
    if (companySet.has(company.id)) {
      continue; // Skip if company already added
    }

    let weightsData = await calculateWeight(packages, company.divisor);
    let comp = {
      id: company.id,
      name: company.title,
      logo: company.logo,
      Actualweight: String(weightsData.weight),
      dimensionalWeight: String(Math.round(weightsData.dimensionalWeight)),
      chargedWeight: String(weightsData.chargedWeight),
    };

    for (let charge of company.logisticCompanyCharges) {
      if (
        weightsData.chargedWeight >= charge.startValue &&
        weightsData.chargedWeight < charge.endValue
      ) {
        comp.charges = parseFloat(charge.charges * weightsData.chargedWeight).toFixed(2);
        comp.ETA = charge.ETA;
        comp.flash = charge.flash;

        arryofCompanies.push(comp);
        companySet.add(company.id); // Mark company as added
        break; // No need to check further charges for the same company
      }
    }
  }

  if (arryofCompanies.length === 0) {
    return res.json(
      returnFunction("1", "Weight Range is higher", { arryofCompanies }, "")
    );
  }

  return res.json(
    returnFunction("1", "Total Charges", { arryofCompanies }, "")
  );
}

/*
            2. All related Ids
    ________________________________________
*/
async function idsForBooking(req, res) {
  const userId = req.user.id;
  const userInfo = await user.findByPk(userId, {
    attributes: ["email", "countryCode", "phoneNum"],
  });
  let userData = {
    email: userInfo.email,
    countryCode: userInfo.countryCode,
    phoneNum: userInfo.phoneNum,
    //address: userInfo.userAddresses.length === 0? {id: "", postalCode: "",secondPostalCode: "" }: {id: `${userInfo.userAddresses[0].addressDB.id}`, postalCode: userInfo.userAddresses[0].addressDB.postalCode, secondPostalCode: userInfo.userAddresses[0].addressDB.secondPostalCode }
  };
  const appUnitId = await currentAppUnitsId();
  // getting Conversion Rates and Symbols
  const unit = await unitsSymbolsAndRates(appUnitId);
  let outObj = await idsFunction(userId);
  outObj.userInfo = userData;
  outObj.unit = unit.symbol;
  return res.json(returnFunction("1", "All related Ids", outObj, ""));
}

//  All Restricted Items
async function fetchRestrictedItems(req, res) {
  const itemsList = await restrictedItems.findAll({
    where: { status: true, deleted: false },
    attributes: ["title", "image"],
  });
  return res.json(
    returnFunction("1", "List of restricted items", { itemsList }, "")
  );
}

/*
            3. Get charges
    ________________________________________
*/
async function getcharges(req, res) {
  const retObj = await chargeCalculation(req.body);
  return res.json(returnFunction("1", "All Charges", retObj, ""));
}
/*
            4. Create Order (For international orders)
    _________________________________________
*/
async function createOrderInt(req, res) {
  const { packages, consolidate, ecommerceCompanyId } = req.body;
  const userId = req.user.id;
  let language = await findLanguage(userId);
  const businessUser = await user.findByPk(userId);
  if (businessUser.userTypeId === 3) {
    let subscriptionId = await userPlan.findOne({
      where: {
        userId: userId,
        subscriptionStatus: "Active",
      },
      attributes: ["subscriptionPlanID", "shipLimit"],
    });

    if (!subscriptionId) {
      throw new CustomException(
        "Currently, you don't have a subscription. As a business user, please purchase a subscription to continue creating orders.If you wish to switch to a normal user, please go to your profile and update your status."
      );
    }
    // Enforce the plan's monthly shipment limit
    const bookingCount = await checkBookingLimit(userId);
    const shipLimit = parseInt(subscriptionId.shipLimit, 10);
    if (
      typeof bookingCount === "number" &&
      shipLimit > 0 &&
      bookingCount >= shipLimit
    ) {
      throw new CustomException(
        "You have reached your monthly shipment limit for your plan"
      );
    }
  }
  const [userData, receivingWarehouse, appUnitData, weightThreshold] =
    await Promise.all([
      user.findByPk(userId, {
        attributes: [
          "firstName",
          "lastName",
          "email",
          "countryCode",
          "phoneNum",
        ],
      }),
      warehouse.findOne({
        where: { located: "usa" },
        attributes: ["id", "addressDBId"],
      }),
      appUnits.findOne({
        where: { status: true, deleted: false },
        include: [
          { model: units, as: "weightUnit", attributes: ["conversionRate"] },
          { model: units, as: "lengthUnit", attributes: ["conversionRate"] },
          { model: units, as: "distanceUnit", attributes: ["conversionRate"] },
        ],
        attributes: ["id"],
      }),
      generalCharges.findOne({
        where: { key: "weight_threshold" },
        attributes: ["value"],
      }),
    ]);

  if (!receivingWarehouse)
    throw new CustomException(
      "Sorry, we could not find a warehouse near to you",
      "Please try again later"
    );
  let receivingWarehouseId = receivingWarehouse.id;
  console.log("Ware House ID: ", receivingWarehouseId);

  let rated = "NR";
  // let totalWeight = packages.reduce((sum, val) => {
  //   return (sum += parseFloat(val.weight));
  // }, 0);
  // converting the weight (from app units to base units)

  // let convertedTotalWeight = unitConversions(
  //   totalWeight,
  //   appUnitData.weightUnit.conversionRate
  // );
  //let deliveryWarehouseId=0;
  // deliveryWarehouseId = deliveryWarehouse.id ? deliveryWarehouse.id : 0;
  rated = "pending";

  // let deliveryTypeId='';

  const pickupAddress = await addressDBS.findOne({
    where: { id: 36 },
  });

  const bookingData = await booking.create({
    // TODO update the following
    senderName: `${userData.firstName} ${userData.lastName}`,
    senderEmail: userData.email,
    senderPhone: `${userData.phoneNum}`,
    subTotal: 0,
    discount: 0,
    total: 0,
    distance: 0,
    status: true,
    paymentConfirmed: false,
    // weight: convertedTotalWeight,
    rated,
    consolidation: consolidate,
    appUnitId: appUnitData.id,
    bookingTypeId: 1,
    bookingStatusId: 1,
    logisticCompanyId: 1,
    customerId: userId,
    pickupAddressId: pickupAddress.id,
    receivingWarehouseId,
    //deliveryWarehouseId,
    // deliveryTypeId
  });

  // updatng the booking to create a unique tracking ID
  let trackingId = otpGenerator.generate(6, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
  trackingId = `TSH-${bookingData.id}-${trackingId}`;
  // E2E-B13: save the tracking ID right away (no placeholder window)
  await booking.update(
    {
      trackingId,
      barcode: `Public/Barcodes/${trackingId}.png`,
    },
    { where: { id: bookingData.id } }
  );
  // Creating barcode
  JsBarcode(svgNode, trackingId, {
    xmlDocument: document,
  });
  const svgText = xmlSerializer.serializeToString(svgNode);
  // svg2img renders synchronously for SVG strings: defer it so it does not
  // hold up this request, and never let a render error crash the process
  setImmediate(() => {
    try {
      svg2img(svgText, function (error, buffer) {
        //returns a Buffer
        if (error || !buffer) {
          console.error("Barcode render failed:", trackingId, error?.message);
          return;
        }
        // svg2img invokes this from inside an async function: a synchronous
        // throw here (e.g. writeFileSync ENOENT/ENOSPC) would become an
        // unhandled rejection and crash Node 20, so write asynchronously
        fs.writeFile(`Public/Barcodes/${trackingId}.png`, buffer, (writeError) => {
          if (writeError) {
            console.error("Barcode save failed:", trackingId, writeError.message);
          }
        });
      });
    } catch (error) {
      console.error("Barcode render failed:", trackingId, error?.message);
    }
  });
  // creating Booking History
  let dt = Date.now();
  let DT = new Date(dt);
  let currentDate = `${DT.getFullYear()}-${("0" + (DT.getMonth() + 1)).slice(
    -2
  )}-${("0" + DT.getDate()).slice(-2)}`;
  let currentTime = `${DT.getHours()}:${DT.getMinutes()}:${DT.getSeconds()}`;
  await bookingHistory.create({
    date: currentDate,
    time: currentTime,
    bookingId: bookingData.id,
    bookingStatusId: 1,
  });

  packages.map((data) => {
    // making conversions
    data.length = unitConversions(
      data.length,
      appUnitData.lengthUnit.conversionRate
    );
    data.width = unitConversions(
      data.width,
      appUnitData.lengthUnit.conversionRate
    );
    data.height = unitConversions(
      data.height,
      appUnitData.lengthUnit.conversionRate
    );
    data.weight = unitConversions(
      data.weight,
      appUnitData.weightUnit.conversionRate
    );
    // calculating volume
    data.volume = data.length * data.width * data.height;
    //Add Estimated Arrival time
    data.ETA = data.eta;
    // adding status
    data.status = true;
    data.categoryId = data.categoryId;
    data.bookingId = bookingData.id;
    data.ecommerceCompanyId = data.ecommerceCompanyId || ecommerceCompanyId;
  });
  await package.bulkCreate(packages);

  // TODO Later
  // Creating billing details
  //    billingDetails.create({subTotal,discount, total, distanceCharge, weightCharge, categoryCharge,
  //     shipmentTypeCharge, packingCharge, serviceCharge, gstCharge, bookingId: bookingData.id});

  return res.json(
    returnFunction(
      "1",
      "Your Package has been added sucessfully",
      { Order: bookingData.id, trackingId },
      ""
    )
  );
}

// Home delivery is only offered where a driver can be paid: at least one active vehicle
// type needs a distance band covering the delivery warehouse → address distance.
// Addresses without coordinates can't be priced, so they count as not covered.
async function homeDeliveryCovered(deliveryWarehouse, newAddress, dropoffAddressId) {
  const from = deliveryWarehouse?.addressDBId
    ? await addressDBS.findByPk(deliveryWarehouse.addressDBId, { attributes: ["lat", "lng"] })
    : null;
  const to =
    newAddress ||
    (dropoffAddressId
      ? await addressDBS.findByPk(dropoffAddressId, { attributes: ["lat", "lng"] })
      : null);
  if (!from?.lat || !from?.lng || !to?.lat || !to?.lng) {
    console.warn("homeDeliveryCovered: warehouse or drop-off address has no coordinates");
    return false;
  }
  const distance = await getDistance(from.lat, from.lng, to.lat, to.lng);
  return anyVehicleCovers(distance);
}

async function dropOfAddress(req, res) {
  let {
    bookingId,
    dropOffAddress,
    dropoffAddressId,
    reciverdetails,
    addNewAddress,
    selfPickup,
  } = req.body;
  const userId = req.user.id;
  const deliveryWarehouse = await warehouse.findOne({
    where: { located: "rico" },
    attributes: ["id", "addressDBId"],
  });

  if (!selfPickup) {
    const covered = await homeDeliveryCovered(
      deliveryWarehouse,
      addNewAddress ? dropOffAddress : null,
      dropoffAddressId
    );
    if (!covered) {
      return res.json(
        returnFunction("0", "", {}, "Sorry, we don't deliver to this address yet.")
      );
    }
  }

  if (addNewAddress) {
    const dropOffAddressData = await addressDBS.create(dropOffAddress);
    dropoffAddressId = dropOffAddressData.id;
    if (dropOffAddress.save) {
      await userAddress.create({
        addressDBId: dropOffAddressData.id,
        userId,
        type: "dropoff",
      });
    }
  }

  let deliveryWarehouseId = deliveryWarehouse.id;
  if (selfPickup) {
    await booking.update(
      {
        receiverName: reciverdetails.reciverName,
        receiverEmail: reciverdetails.reciverEmail,
        receiverPhone: reciverdetails.reciverPhone,
        deliveryWarehouseId,
        dropoffAddressId: 42,
        deliveryTypeId: 2,
        // bookingStatusId: 10,
      },
      { where: { id: bookingId } }
    );

    return res.json(
      returnFunction("1", "Address has been added sucessfully", {}, "")
    );
  }
  await booking.update(
    {
      receiverName: reciverdetails.reciverName,
      receiverEmail: reciverdetails.reciverEmail,
      receiverPhone: reciverdetails.reciverPhone,
      deliveryTypeId: 1,
      deliveryWarehouseId,
      dropoffAddressId,
      // bookingStatusId: 10,
    },
    { where: { id: bookingId } }
  );

  return res.json(
    returnFunction("1", "Address has been added sucessfully", {}, "")
  );
}
/*
            5. Create Order (For Local)
    _________________________________________
*/
async function createOrderLoc(req, res) {
  let {
    addNewPickup,
    pickupAddress,
    pickupAddressId,
    addNewDropoff,
    dropoffAddress,
    dropoffAddressId,
    packages,
    pickupDate,
    pickupStartTime,
    pickupEndTime,
    receiverName,
    receiverEmail,
    receiverPhone,
    vehicleTypeId,
  } = req.body;
  let userId = req.user.id;
  let language = req.user.language;
  console.log("🚀 ~ createOrderLoc ~ language:", language);
  // const businessUser = await user.findByPk(userId);
  // if (businessUser.userTypeId === 3) {
  //   await checkBookingLimit(userId);
  // }
  let [pickupAddressIdDB, dropoffAddressIdDB, appUnitData] = await Promise.all([
    addressAdder(
      addNewPickup,
      pickupAddress,
      "pickup",
      userId,
      pickupAddressId
    ),
    addressAdder(
      addNewDropoff,
      dropoffAddress,
      "dropoff",
      userId,
      dropoffAddressId
    ),
    appUnits.findOne({
      where: { status: true, deleted: false },
      include: [
        { model: units, as: "weightUnit", attributes: ["conversionRate"] },
        { model: units, as: "lengthUnit", attributes: ["conversionRate"] },
        { model: units, as: "distanceUnit", attributes: ["conversionRate"] },
      ],
      attributes: ["id"],
    }),
  ]);

  let [pickupAddressData, dropoffAddressData, userData] = await Promise.all([
    addressDBS.findByPk(pickupAddressIdDB, {
      attributes: {
        exclude: [
          "createdAt",
          "updatedAt",
          "status",
          "deleted",
          "structureTypeId",
          "warehouseId",
        ],
      },
    }),
    addressDBS.findByPk(dropoffAddressIdDB, {
      attributes: {
        exclude: [
          "createdAt",
          "updatedAt",
          "status",
          "deleted",
          "structureTypeId",
          "warehouseId",
        ],
      },
    }),
    user.findByPk(userId, {
      attributes: [
        "firstName",
        "lastName",
        "email",
        "countryCode",
        "phoneNum",
        "languageCheck",
      ],
    }),
  ]);

  let bookingDistance = await getDistance(
    pickupAddressData.lat,
    pickupAddressData.lng,
    dropoffAddressData.lat,
    dropoffAddressData.lng
  );

  // let totalWeight = packages.reduce((sum, val) => {
  //   return (sum += parseFloat(val.weight));
  // }, 0);
  // converting the weight (from app units to base units)

  let weight = 0,
    length = 0,
    width = 0,
    volume = 0,
    height = 0;
  console.log("appUnitData-------------->", appUnitData.dataValues);
  packages.forEach((sum) => {
    weight += unitConversions(
      sum.weight,
      appUnitData.weightUnit.conversionRate
    );
    length += unitConversions(
      sum.length,
      appUnitData.lengthUnit.conversionRate
    );
    width += unitConversions(sum.width, appUnitData.lengthUnit.conversionRate);
    height += unitConversions(
      sum.height,
      appUnitData.lengthUnit.conversionRate
    );
    volume += unitConversions(
      sum.length * sum.width * sum.height,
      appUnitData.lengthUnit.conversionRate
    ); // Assuming volumeUnit is the correct conversion rate
  });

  let dimensions = { weight, height, length, volume, width };
  console.log(dimensions); // For debugging or verification

  // let convertedTotalWeight = unitConversions(
  //   dimensions.weight,
  //   appUnitData.weightUnit.conversionRate
  // );
  const bookingData = await booking.create({
    // receiver is the person creating the order
    pickupDate,
    pickupStartTime,
    pickupEndTime,
    receiverName,
    receiverEmail,
    receiverPhone,
    senderName: userData.firstName,
    senderEmail: userData.email,
    senderPhone: `${userData.phoneNum}`,
    vehicleTypeId,
    // TODO update the following
    discount: 0,
    logisticCompanyId: 1,
    distance: bookingDistance,
    status: true,
    paymentConfirmed: false,
    weight: dimensions.weight,
    height: dimensions.height,
    length: dimensions.length,
    width: dimensions.width,
    volume: dimensions.volume,
    rated: "pending",
    pickupAddressId: pickupAddressIdDB,
    dropoffAddressId: dropoffAddressIdDB,
    appUnitId: appUnitData.id,
    bookingStatusId: 1,
    bookingTypeId: 6,
    customerId: userId,
    consolidation: false,
  });
  // updatng the booking to create a unique tracking ID
  let trackingId = otpGenerator.generate(6, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: true,
    specialChars: false,
  });
  trackingId = `TSH-${bookingData.id}-${trackingId}`;
  // Creating barcode
  // JsBarcode(svgNode, trackingId, {
  //   xmlDocument: document,
  // });
  // const svgText = xmlSerializer.serializeToString(svgNode);
  // svg2img(svgText, function (error, buffer) {
  //   //returns a Buffer
  //   fs.writeFileSync(`Public/Barcodes/${trackingId}.png`, buffer);
  // });
  let charge = 0.0;
  if (dimensions.weight > 0 && dimensions.weight < 20) {
    charge = 12.0;
  } else if (dimensions.weight >= 20 && dimensions.weight <= 150) {
    charge = 20.0;
  }
  await booking.update(
    {
      trackingId,
      subtotal: charge,
      total: charge,
      barcode: `Public/Barcodes/${trackingId}.png`,
    },
    { where: { id: bookingData.id } }
  );
  // creating Booking History
  let dt = Date.now();
  let DT = new Date(dt);
  let currentDate = `${DT.getFullYear()}-${("0" + (DT.getMonth() + 1)).slice(
    -2
  )}-${("0" + DT.getDate()).slice(-2)}`;
  let currentTime = `${DT.getHours()}:${DT.getMinutes()}:${DT.getSeconds()}`;
  await bookingHistory.create({
    date: currentDate,
    time: currentTime,
    bookingId: bookingData.id,
    bookingStatusId: 1,
  });

  // adding packages to table
  // manipulating packages

  let convertedPackages = packages.map((data) => {
    // making conversions
    data.actualLength = unitConversions(
      data.length,
      appUnitData.lengthUnit.conversionRate
    );
    data.actualWidth = unitConversions(
      data.width,
      appUnitData.lengthUnit.conversionRate
    );
    data.actualHeight = unitConversions(
      data.height,
      appUnitData.lengthUnit.conversionRate
    );
    data.actualWeight = unitConversions(
      data.weight,
      appUnitData.weightUnit.conversionRate
    );
    // calculating volume
    data.actualVolume = data.length * data.width * data.height;
    // adding status
    data.status = true;
    data.bookingId = bookingData.id;
    return data;
  });
  await package.bulkCreate(convertedPackages);

  // TODO Later
  // Creating billing details
  //    billingDetails.create({subTotal,discount, total, distanceCharge, weightCharge, categoryCharge,
  //     shipmentTypeCharge, packingCharge, serviceCharge, gstCharge, bookingId: bookingData.id});
  let outObj = {
    bookingId: bookingData.id,
    trackingId,
    total: charge,
    senderData: {
      senderName: bookingData.senderName,
      senderEmail: bookingData.senderEmail,
      senderPhone: bookingData.senderPhone,
      pickupAddress: pickupAddressData,
    },
    receiverData: {
      receiverName,
      receiverEmail,
      receiverPhone,
      dropoffAddress: dropoffAddressData,
    },
    packages,
    pickupDate: `${pickupDate}`,
    pickupStartTime: `${pickupStartTime}`,
    pickupEndTime: `${pickupEndTime}`,
    barCode: `Public/Barcodes/${trackingId}.png`,
  };
  return res.json(returnFunction("1", "Booking created", outObj, ""));
}
/*
            6. Cancel booking
    _________________________________________
*/
async function cancelBooking(req, res) {
  let { bookingId, reasonId, reasonText } = req.body;

  const bookingData = await booking.findOne({
    where: {
      id: bookingId,
      customerId: req.user.id,
    },
    include: [
      {
        model: package,
        attributes: ['id', 'arrived'],
      },
    ],
    attributes: ["bookingStatusId", "total", "id", "customerId", "paymentConfirmed"],
  });
  if (!bookingData) {
    return res.json(returnFunction("0", "", {}, "Order not found"));
  }
  // Paid orders can't be cancelled (refunds are handled separately).
  if (bookingData.paymentConfirmed) {
    return res.json(
      returnFunction("0", "", {}, "This order has been paid and can no longer be cancelled.")
    );
  }

  console.log("🚀 ~ cancelBooking ~ bookingData:", bookingData.packages);

  const packageArrived = bookingData.packages.some(pkg => pkg.arrived === 'arrived');

  let packagesToUpdate = bookingData.packages.filter(pkg => pkg.arrived === 'pending');
  console.log("packagesToUpdate=============>", packagesToUpdate);

  if (packageArrived) {
    const message = "Your package is received. Now you cannot cancel the booking.";
    throw new CustomException(message, message);
  }

  // Update the 'arrived' key value to 'cancelled' for packagesToUpdate
  for (const pkg of packagesToUpdate) {
    await package.update(
      { arrived: 'cancelled' },
      { where: { id: pkg.id } }
    );
  }

  await cancelledBooking.create({
    bookingId,
    userId: bookingData.customerId,
    reasonId,
    reasontext: reasonText,
  });

  await booking.update(
    { status: true, bookingStatusId: 19 },
    { where: { id: bookingId } }
  );

  let dt = Date.now();
  let DT = new Date(dt);
  let currentDate = `${DT.getFullYear()}-${DT.getMonth() + 1
    }-${DT.getDate()}`;
  let currentTime = `${DT.getHours()}:${DT.getMinutes()}:${DT.getSeconds()}`;

  await bookingHistory.create({
    date: currentDate,
    time: currentTime,
    bookingId: bookingId,
    bookingStatusId: 19,
  });

  return res.json(returnFunction("1", "Booking Cancelled", {}, ""));
}
//
async function cancelbookingReacons(req, res) {
  const reasons = await reason.findAll();
  return res.json(returnFunction("1", "Booking Cancelled", { reasons }, ""));
}
/*
            7. expected Packages
    _________________________________________
*/
async function expectedPackages(req, res) {
  const userId = req.user.id;
  const bookingData = await booking.findAll({
    where: {
      customerId: userId,
      bookingStatusId: {
        [Op.lte]: 6,
        [Op.gte]: 1, // Less than or equal to
      },
      bookingTypeId: {
        [Op.not]: 6,
      },
    },
    order: [["id", "DESC"]],
    include: [
      { model: bookingStatus, attributes: ["title"] },
      {
        model: package,
        attributes: ["id"],
        include: { model: ecommerceCompany, attributes: ["title"] },
      },
      {
        model: bookingHistory,
        attributes: [
          "id",
          [
            sequelize.fn("date_format", sequelize.col("date"), "%m-%d-%Y"),
            "date",
          ],
          [sequelize.fn("date_format", sequelize.col("time"), "%r"), "time"],
        ],
        include: { model: bookingStatus, attributes: ["id", "title"] },
      },
    ],

    attributes: [
      "id",
      "trackingId", // cards show the same order number as the detail view
      [
        sequelize.literal(
          'DATE_FORMAT(booking.createdAt, "%d-%m-%y %h:%i:%s %p")'
        ),
        "createdAt",
      ],
    ],
  });

  //bookingData.sort((a, b) => { return b.createdAt - a.createdAt });

  return res.json(
    returnFunction("1", "All Ecpected Packages", { bookingData }, "")
  );
}
/*
            8. expected Packages
    _________________________________________
*/
async function packagesInWarehouse(req, res) {
  const userId = req.user.id;
  const bookingData = await booking.findAll({
    where: {
      customerId: userId,
      bookingStatusId: {
        [Op.lte]: 10,
        [Op.gte]: 7, // Less than or equal to
      }, //bookingStatusId:7||8||9||10,
      bookingTypeId: {
        [Op.not]: 6,
      },
    },
    order: [["id", "DESC"]],
    include: [
      { model: bookingStatus, attributes: ["id", "title"] },
      {
        model: package,
        attributes: ["id"],
        include: { model: ecommerceCompany, attributes: ["title"] },
      },
      {
        model: bookingHistory,
        attributes: [
          "id",
          [
            sequelize.fn("date_format", sequelize.col("date"), "%m-%d-%Y"),
            "date",
          ],
          [sequelize.fn("date_format", sequelize.col("time"), "%r"), "time"],
        ],
        include: { model: bookingStatus, attributes: ["id", "title"] },
      },
    ],
    attributes: [
      "id",
      "trackingId", // cards show the same order number as the detail view
      [
        sequelize.literal(
          'DATE_FORMAT(booking.createdAt, "%d-%m-%y %h:%i:%s %p")'
        ),
        "createdAt",
      ],
    ],
  });

  return res.json(
    returnFunction("1", "Packages in Warehouse", { bookingData }, "")
  );
}
/*
            9. Sent Packages
    _________________________________________
*/
async function sentPackages(req, res) {
  const userId = req.user.id;
  const bookingData = await booking.findAll({
    where: {
      customerId: userId,
      // 11-18 = in transit ... delivered; 20/21 = self pickup (awaiting / handed over). 19 (cancelled) excluded.
      bookingStatusId: {
        [Op.in]: [11, 12, 13, 14, 15, 16, 17, 18, 20, 21],
      },
      bookingTypeId: {
        [Op.not]: 6,
      },
    },
    order: [["id", "DESC"]],
    include: [
      { model: bookingStatus, attributes: ["title"] },
      {
        model: package,
        attributes: ["id"],
        include: { model: ecommerceCompany, attributes: ["title"] },
      },
    ],
    attributes: [
      "id",
      "trackingId", // cards show the same order number as the detail view
      [
        sequelize.literal(
          'DATE_FORMAT(booking.createdAt, "%d-%m-%y %h:%i:%s %p")'
        ),
        "createdAt",
      ],
    ],
  });

  return res.json(returnFunction("1", "Sent Packages", { bookingData }, ""));
}
// * Redundant code
/*
            3.  Logistic Companies
    ________________________________________
*/
async function logisticCompanies(req, res) {
  const { bookingId } = req.body;
  const bookingData = await booking.findByPk(bookingId, {
    include: { model: package },
  });
  console.log("Booking Data from Logistic Companies---------------->", bookingData);

  const appUnitData = await appUnits.findOne({
    where: { status: true, deleted: false },
    include: [
      { model: units, as: "weightUnit", attributes: ["conversionRate"] },
      { model: units, as: "lengthUnit", attributes: ["conversionRate"] },
      { model: units, as: "distanceUnit", attributes: ["conversionRate"] },
    ],
    attributes: ["id"],
  });

  bookingData.packages.map((data) => {
    // making conversions
    data.actualLength = unitConversions(data.actualLength, appUnitData.lengthUnit.conversionRate);
    data.actualWidth = unitConversions(data.actualWidth, appUnitData.lengthUnit.conversionRate);
    data.actualHeight = unitConversions(data.actualHeight, appUnitData.lengthUnit.conversionRate);
    data.actualWeight = unitConversions(data.actualWeight, appUnitData.weightUnit.conversionRate);

    // calculating volume
    data.actualVolume = data.actualLength * data.actualWidth * data.actualHeight;
  });

  let arryofCompanies = [];

  if (bookingData.bookingTypeId === 6) {
    console.log("Local==============>>>>>>>>");
    const logisticCompanyData = await logisticCompany.findAll({
      include: {
        model: logisticCompanyCharges,
        where: { bookingType: "local" },
      },
    });
    for (let company of logisticCompanyData) {
      let weightsData = await calculateWeight(bookingData.packages, company.divisor);
      console.log(weightsData);
      let comp = {
        id: company.id,
        name: company.title,
        logo: company.logo,
        Actualweight: weightsData.weight,
        dimensionalWeight: Math.round(weightsData.dimensionalWeight),
        chargedWeight: weightsData.chargedWeight,
      };


      let companyAdded = false;
      for (let charge of company.logisticCompanyCharges) {
        if (weightsData.chargedWeight >= charge.startValue && weightsData.chargedWeight < charge.endValue) {
          comp.charges = (charge.charges * weightsData.chargedWeight).toFixed(2);
          comp.ETA = charge.ETA;
          comp.flash = charge.flash;
          if (!companyAdded) {  // Add company only once
            arryofCompanies.push(comp);
            companyAdded = true;
          }
          break; // Avoid duplicates by stopping at the first match
        }
      }
    }

    if (arryofCompanies.length === 0) {
      return res.json(returnFunction("1", "Weight Range is higher", { arryofCompanies }, ""));
    }
    return res.json(returnFunction("1", "Total Charges", { arryofCompanies }, ""));
  } else {
    console.log("going into else Condition============>");
    const logisticCompanyData = await logisticCompany.findAll({
      include: {
        model: logisticCompanyCharges,
        where: { bookingType: 'International' },
        order: [["charges", "ASC"]],
      },
    });

    console.log("logisticCompanyData============>", logisticCompanyData);

    for (let company of logisticCompanyData) {
      let weightsData = bookingData.consolidation
        ? await calculateWeights([{ actualWeight: bookingData.weight, actualVolume: bookingData.volume }], company.divisor)
        : await calculateWeights(bookingData.packages, company.divisor);

      let comp = {
        id: company.id,
        name: company.title,
        logo: company.logo,
        Actualweight: weightsData.weight,
        dimensionalWeight: Math.round(weightsData.dimensionalWeight),
        chargedWeight: weightsData.chargedWeight,
      };

      let companyAdded = false; // Flag to track if the company has been added
      for (let charge of company.logisticCompanyCharges) {
        if (weightsData.chargedWeight >= charge.startValue && weightsData.chargedWeight < charge.endValue) {
          comp.charges = (charge.charges * weightsData.chargedWeight).toFixed(2);
          comp.ETA = charge.ETA;
          comp.flash = charge.flash;

          if (!companyAdded) {  // Add company only once
            arryofCompanies.push(comp);
            companyAdded = true;
          }
          break; // Exit loop once a match is found to avoid duplicates
        }
      }
    }

    if (arryofCompanies.length === 0) {
      return res.json(returnFunction("1", "Weight Range is higher", { arryofCompanies }, ""));
    }

    arryofCompanies.sort((a, b) => a.id - b.id);
    return res.json(returnFunction("1", "Total Charges", { arryofCompanies }, ""));
  }
}

/*
            3.  Search Addresses - DBS (redundant)
    ________________________________________
*/
async function searchAddress(req, res) {
  const { text } = req.body;
  let addresses = await textSearchAddress(text);
  return res.json(returnFunction("1", "Filtered Addresses", { addresses }, ""));
}

/*
            4. Check coupon validity(redundant)
    ________________________________________
*/
async function checkCouponValidity(req, res) {
  const { code } = req.body;
  const userId = req.user.id;
  let data = await couponCheck(code, userId);
  return res.json(returnFunction("1", "Coupon Applied", data, ""));
}

/*
            8. Reschedule pickup date & time (reduntant)
    _________________________________________
*/
async function reschedulePickup(req, res) {
  const { pickupDate, pickupStartTime, pickupEndTime, bookingId } = req.body;
  const bookingData = await booking.findByPk(bookingId, {
    attributes: [
      "bookingStatusId",
      "pickupAddressId",
      "dropoffAddressId",
      "shipmentTypeId",
    ],
  });
  const pickupAddress = await addressDBS.findByPk(bookingData.pickupAddressId, {
    attributes: ["lat", "lng"],
  });
  const dropOffAddress = await addressDBS.findByPk(
    bookingData.dropoffAddressId,
    { attributes: ["lat", "lng"] }
  );
  let bookingDistance = await getDistance(
    pickupAddress.lat,
    pickupAddress.lng,
    dropOffAddress.lat,
    dropOffAddress.lng
  );
  let etaData = await estimatedBookingDays.findOne({
    where: {
      startValue: { [Op.lte]: bookingDistance },
      endValue: { [Op.gte]: [bookingDistance] },
      shipmentTypeId: bookingData.shipmentTypeId,
    },
    attributes: ["numOfDays"],
  });
  let ETA = "1990-01-01";
  if (!etaData) {
    let nowDate = Date.now();
    let cDT = new Date(pickupDate);
    cDT.setDate(cDT.getDate() + 5);
    ETA = `${cDT.getFullYear()}-${("0" + (cDT.getMonth() + 1)).slice(-2)}-${(
      "0" + cDT.getDate()
    ).slice(-2)}`;
  } else {
    let nowDate = Date.now();
    let cDT = new Date(pickupDate);
    cDT.setDate(cDT.getDate() + etaData.numOfDays);
    ETA = `${cDT.getFullYear()}-${cDT.getMonth() + 1}-${cDT.getDate()}`;
  }
  if (bookingData.bookingStatusId > 2)
    throw new CustomException(
      "Booking schedule cannot be updated",
      "Our delivery guy is on its way to pickup your parcel"
    );
  await booking.update(
    { pickupDate, pickupStartTime, pickupEndTime, ETA },
    { where: { id: bookingId } }
  );
  return res.json(returnFunction("1", "Pickup Schedule updated", {}, ""));
}

/*
            9. Schedule Dropoff (reduntant)
*/
async function scheduleDropoff(req, res) {
  const { dropoffDate, dropoffStartTime, dropoffEndTime, bookingId } = req.body;
  booking
    .update(
      { dropoffDate, dropoffStartTime, dropoffEndTime, bookingStatusId: 9 },
      { where: { id: bookingId } }
    )
    .then((data) => {
      return res.json(
        returnFunction("1", "Dropoff time scheduled successfully", {}, "")
      );
    })
    .catch((err) => {
      return res.json(
        returnFunction("0", "Internal Sever Error", {}, `${err}`)
      );
    });
}
/*
            10. Schedule Dropoff Web (reduntant)
*/
async function scheduleDropoffByWeb(req, res) {
  const { dropoffDate, dropoffStartTime, dropoffEndTime } = req.body;
  let key = req.query.key;
  key = key.replace("xMl3Jk", "+").replace("Por21Ld", "/").replace("Ml32", "=");
  //const key = 'U2FsdGVkX1+dJt5khadD5tgAFDhYq7SaEpFLDSOfgq8CLzSNBhvjXAOmYYaskdG6';

  // Decrypting the key
  var bytes = CryptoJS.AES.decrypt(key, process.env.JWT_ACCESS_SECRET);
  var originalText = bytes.toString(CryptoJS.enc.Utf8);
  const dataArr = originalText.split("-");

  const bookingData = await booking.findByPk(dataArr[0], {
    attributes: [
      "dropoffDate",
      "dropoffStartTime",
      "dropoffEndTime",
      "receiverEmail",
      "bookingStatusId",
      "scheduleSetBy",
      "senderEmail",
    ],
  });
  //return res.json(bookingData)
  if (!bookingData)
    throw new CustomException(
      "You are not authorized to perform this step",
      "Please contact support"
    );
  // check if schedule already set and status changed
  if (bookingData.bookingStatusId > 9)
    throw new CustomException(
      "Our rider has picked your parcel",
      "Booking cant be scheduled at this stage"
    );
  // match receiver email
  if (bookingData.scheduleSetBy === "sender") {
    if (bookingData.senderEmail != dataArr[1])
      throw new CustomException(
        "You are not authorized to perform this step",
        "Please contact support"
      );
  } else {
    if (bookingData.receiverEmail != dataArr[1])
      throw new CustomException(
        "You are not authorized to perform this step",
        "Please contact support"
      );
  }
  booking
    .update(
      { dropoffDate, dropoffStartTime, dropoffEndTime, bookingStatusId: 9 },
      { where: { id: dataArr[0] } }
    )
    .then((data) => {
      return res.json(
        returnFunction("1", "Dropoff time scheduled successfully", {}, "")
      );
    })
    .catch((err) => {
      return res.json(
        returnFunction("0", "Internal Sever Error", {}, `${err}`)
      );
    });
}

// ! Module 4 : Drawer
// ! _________________________________________________________________________________________________________________________________
/*
            1. Get profile
    ____________________________________________________
*/
async function getProfile(req, res) {
  const userId = req.user.id;

  const userData = await user.findByPk(userId, {
    attributes: [
      "id",
      "firstName",
      "lastName",
      "email",
      "countryCode",
      "phoneNum",
      "image",
      "virtualBox",
      "userTypeId",
      "stripeCustomerId",
      [
        sequelize.fn("date_format", sequelize.col("createdAt"), "%Y"),
        "joinedOn",
      ],
    ],
  });
  console.log("User Data------------>", userData);

  const selfPickUp = await warehouse.findOne({
    where: { located: "usa" },
    include: {
      model: addressDBS,
      attributes: {
        exclude: [
          "lat",
          "lng",
          "type",
          "deleted",
          "status",
          "createdAt",
          "updatedAt",
          "structureTypeId",
          "userId",
          "warehouseId",
        ],
      },
    },
    attributes: ["id"],
  });

  // const userType=userData.userTypeId===3?"Bussiness User":"Customer";
  let outObj = {
    userData,
    warehouseAddress: `${selfPickUp.addressDB.streetAddress}, ${selfPickUp.addressDB.city}, ${selfPickUp.addressDB.province}, ${selfPickUp.addressDB.postalCode} ${selfPickUp.addressDB.country}`,
    virtualBoxNumber: userData.virtualBox ? userData.virtualBox : "",
  };
  return res.json(returnFunction("1", "User Profile Data", outObj, ""));
}
/*
            2. update profile
    _______________________________________________________
*/
// async function updateProfile(req, res) {
//   const userId = req.user.id;
//   const {
//     firstName,
//     lastName,
//     isProfileChanged,
//     email,
//     phoneNum,
//     countryCode,
//     userTypeId,
//   } = req.body;
//   let tmpprofileImage = "";
//   let profileImage = "";
//   const userfind=await user.findByPk(userId,{
//     attributes:['userTypeId']
//   });
//   if (isProfileChanged === "true") {
//     console.log("If condition-----------> ",isProfileChanged)
//     // Only profile has been changed
//     if (!req.file)
//       throw new CustomException(
//         "Profile picture is required",
//         "Please add profile image"
//       );
//     tmpprofileImage = req.file.path;
//     profileImage = tmpprofileImage.replace(/\\/g, "/");
//     const userData=await user.update(
//       {
//         firstName,
//         lastName,
//         image: profileImage,
//         email,
//         phoneNum,
//         countryCode,
//       },
//       { where: { id: userId } }
//     );
//     if(userfind.userTypeId===3){
//       const checkSubscription=await userPlan.findAll({
//         where:{
//           userId:userId,
//           subscriptionStatus:"Active"
//         }
//       })
//       if(checkSubscription){
//         throw new CustomException("First cancel your Subscription")
//       }
//       const newUserTypeId=userTypeId===3?1:3
//       await user.update({
//         userTypeId:newUserTypeId,
//       },{
//         where:{
//           id:userId
//         }
//       })
//     }
//     return res.json(
//       returnFunction("1", "Profile updated successfully", userData, "")
//     );
//   } else {
//     // Neither password nor profile has been changed
//     await user.update(
//       { firstName, lastName, email, phoneNum, countryCode },
//       { where: { id: userId } }
//     );
//     if(userfind.userTypeId===3){
//       const checkSubscription=await userPlan.findAll({
//         where:{
//           userId:userId,
//           subscriptionStatus:"Active"
//         }
//       })
//       if(checkSubscription){
//         throw new CustomException("First cancel your Subscription")
//       }
//       const newUserTypeId=userTypeId===3?1:3
//       await user.update({
//         userTypeId:newUserTypeId,
//       },{
//         where:{
//           id:userId
//         }
//       })
//     }
//     return res.json(
//       returnFunction("1", "Profile updated successfully", {}, "")
//     );
//   }
// }
async function updateProfile(req, res) {
  const userId = req.user.id;
  const {
    firstName,
    lastName,
    isProfileChanged,
    email,
    phoneNum,
    countryCode,
    userTypeId,
  } = req.body;

  let tmpprofileImage = "";
  let profileImage = "";

  const userfind = await user.findByPk(userId, {
    attributes: ["userTypeId"],
  });

  if (isProfileChanged === "true") {
    if (!req.file) {
      throw new CustomException(
        "Profile picture is required",
        "Please add profile image"
      );
    }
    tmpprofileImage = req.file.path;
    profileImage = tmpprofileImage.replace(/\\/g, "/");
  }

  const userNew = await user.update(
    {
      firstName,
      lastName,
      image: isProfileChanged === "true" ? profileImage : undefined, // Only include image if profile is changed
      email,
      phoneNum,
      countryCode,
    },
    { where: { id: userId } }
  );

  const numericUserTypeId = Number(userTypeId);

  if (numericUserTypeId === 1 && userfind.userTypeId === 3) {
    // console.log("If condition IN===================================>")
    // console.log("userTypeId in function ===========>",userTypeId)
    const checkSubscription = await userPlan.findAll({
      where: {
        userId: userId,
        subscriptionStatus: "Active",
      },
    });

    if (checkSubscription.length > 0) {
      throw new CustomException("First cancel your Subscription");
    }

    const newUserTypeId = userTypeId === 1 ? 1 : 1;
    console.log("newUserTypeId-------------->", newUserTypeId);
    if (newUserTypeId === 1) {
      await Braintree.deleteCustomer(userId);
    }
    const updatedUser = await user.update(
      { userTypeId: newUserTypeId },
      { where: { id: userId } }
    );

    return res.json(
      returnFunction("1", "Profile updated successfully", {}, "")
    );
  }

  return res.json(returnFunction("1", "Profile updated successfully", {}, ""));
}

/*
            3.Saved addresses of user
    _________________________________________________________
*/
async function savedAddressesOfUser(req, res) {
  const userId = req.user.id;
  const addressData = await userAddress.findAll({
    where: { userId },
    include: {
      model: addressDBS,
      attributes: {
        exclude: [
          "status",
          "deleted",
          "createdAt",
          "updatedAt",
          "structureTypeId",
          "userId",
          "warehouseId",
        ],
      },
    },
    attributes: ["addressDBId", "type"],
  });
  return res.json(
    returnFunction(
      "1",
      `Attached addresses to user # ${userId}`,
      { addressData },
      ""
    )
  );
}

// Save New Address
async function addAddress(req, res) {
  const { type, addressData } = req.body;
  const data = addressData;
  // return res.json(returnFunction('1', 'Address Saved', addressData, ''));
  if (type === "pickup" || type === "dropoff") {
    const userId = req.user.id;
    addressData.userId = userId;
    const newAddress = await addressDBS.create(data);
    console.log("🚀 ~ addAddress ~ newAddress:", newAddress)
    //return res.json(newAddress)
    //const checkPostalAddress =await fedex.validatePostalCode(newAddress)
    isValidPostalCodeRange(newAddress.postalCode, newAddress.country)
    await userAddress.create({ addressDBId: newAddress.id, userId, type });
    return res.json(
      returnFunction("1", "Address Saved", { newAddress: newAddress.id }, "")
    );
  } else {
    throw new CustomException("Type not selected", "");
  }
}

/*
            4. Attach address to user
    _________________________________________________________
*/

async function attachAddressToUser(req, res) {
  const { addressData } = req.body;
  const userId = req.user.id;
  addressData.userId = userId;
  const addressDBSID = await addressAdder(
    true,
    addressData,
    "dropoff",
    userId,
    ""
  );
  return res.json(returnFunction("1", "Address attached", {}, ""));
}
/*
            5. Un attach an address
*/
async function unattachAddressToUser(req, res) {
  const { attchedAddressId } = req.body;
  const userId = req.user.id;
  const addressData = await userAddress.findByPk(attchedAddressId);
  // if deleted address is default, set the default value to last added address
  // if(addressData.default){
  //     const addressData = await userAddress.findAll({
  //         where: {userId},
  //         attributes: ['id', 'default']
  //     })
  //     let lastIndex = addressData.length -1;
  //     userAddress.update({default: true}, {where: {id: addressData[lastIndex].id}})
  // }
  await userAddress.destroy({ where: { addressDBId: attchedAddressId } });
  return res.json(
    returnFunction("1", "Address unattached suucessfully", {}, "")
  );
}

/*
            . Set to default address (R)
*/
async function changeDefaultAddress(req, res) {
  const { attchedAddressId } = req.body;
  const userId = req.user.id;
  // changing all previous to not default
  const updatedData = await userAddress.update(
    { default: false },
    { where: { userId } }
  );
  await userAddress.update(
    { default: true },
    { where: { id: attchedAddressId } }
  );
  return res.json(returnFunction("1", "Default address changed", {}, ""));
}

//
async function updateAddress(req, res) {
  const { building, floor, apartment, id } = req.user.id;
  const addressExist = await addressDBS.findAll({
    where: { id },
  });
  if (!addressExist) throw new CustomException("user address not Exist!");
  const updatedData = await addressDBS.update(
    { building, floor, apartment },
    { where: { id } }
  );
  // userAddress.update({default: true}, {where: {id: attchedAddressId}});
  return res.json(returnFunction("1", "Address updated successfully", {}, ""));
}

/*
            6. My orders (ongoing & completed + cancelled)
    _________________________________________________________
    
*/
async function myOrders(req, res) {
  const userId = req.user.id;
  const [internationalOrders, localOrders] = await Promise.all([
    booking.findAll({
      // TODO add payment:true
      // no `status` filter: status=false marks a completed booking (selfPickupDelivered / markDeliver / driver delivery), which must stay in Order History
      where: { bookingTypeId: 1, customerId: userId },
      attributes: [
        "id",
        "trackingId",
        "total",
        "logisticCompanyId",
        "createdAt",
        "paymentConfirmed",
      ],
      include: [
        {
          model: logisticCompany,
        },
        {
          model: addressDBS,
          as: "dropoffAddress",
          attributes: [
            "streetAddress",
            "building",
            "floor",
            "apartment",
            "district",
            "city",
            "province",
            "country",
            "postalCode",
          ],
        },
        { model: bookingStatus, attributes: ["id", "title"] },
        {
          model: appUnits,
          include: { model: units, as: "currencyUnit", attributes: ["symbol"] },
          attributes: ["id"],
        },
        {
            model: package,
            include:{
                model:ecommerceCompany,
                attributes:['title']
            }
        }
      ],
      order: [["createdAt", "DESC"]],
    }),
    booking.findAll({
      // TODO add payment:true
      // no `status` filter: status=false marks a completed booking (selfPickupDelivered / markDeliver / driver delivery), which must stay in Order History
      where: { bookingTypeId: 6, customerId: userId },
      attributes: ["id", "trackingId", "total", "createdAt", "paymentConfirmed"],
      include: [
        {
          model: addressDBS,
          as: "dropoffAddress",
          attributes: [
            "streetAddress",
            "building",
            "floor",
            "apartment",
            "district",
            "city",
            "province",
            "country",
            "postalCode",
          ],
        },
        {
          model: addressDBS,
          as: "pickupAddress",
          attributes: [
            "streetAddress",
            "building",
            "floor",
            "apartment",
            "district",
            "city",
            "province",
            "country",
            "postalCode",
          ],
        },
        { model: bookingStatus, attributes: ["id", "title"] },
        {
          model: appUnits,
          include: { model: units, as: "currencyUnit", attributes: ["symbol"] },
          attributes: ["id"],
        },
        {
            model: package,
            include:{
                model:ecommerceCompany,
                attributes:['title']
            }
        }
      ],
      order: [["createdAt", "DESC"]],
    }),
  ]);
  return res.json(
    returnFunction("1", "My Orders", { internationalOrders, localOrders }, "")
  );
}


/*
            7. choose Logistic Company
    _________________________________________________________
*/
async function chooseLogisticCompany(req, res) {
  const { bookingId, logisticCompanyId, charges } = req.body;
  let bookingData = await booking.findByPk(bookingId);
  bookingData.logisticCompanyId = logisticCompanyId;
  let customerId = bookingData.customerId;
  console.log("Customer ID------------>", customerId);
  const customer = await user.findByPk(customerId);
  console.log("Customer Data----------->: ", customer);

  if (customer.userTypeId === 3 && bookingData.bookingTypeId === 1) {
    console.log("Business User Logistic Choose------------>");
    let subscriptionId = await userPlan.findOne({
      where: {
        userId: customerId,
        subscriptionStatus: "Active",
      },
      attributes: ["subscriptionPlanID"],
    });

    if (!subscriptionId) {
      throw new CustomException(
        "Invalid Subscription Id or You don't have any Subscription"
      );
    }
    const subscriptionPlanID = subscriptionId.dataValues.subscriptionPlanID;
    // E2E-B14: the local plan row is Active here, so a Braintree outage
    // falls back to discount 0 instead of blocking the booking
    const discountAmount = await discountget(subscriptionPlanID, true);
    const realDiscount = applyPercentagediscount(charges, discountAmount);
    const totalCharges = realDiscount;
    bookingData.subTotal = charges;
    bookingData.discount = discountAmount;
    bookingData.total = totalCharges;
    await bookingData.save();
  } else {
    bookingData.subTotal = charges;
    bookingData.total = charges;
    await bookingData.save();
  }

  await billingDetails.create({
    subTotal: bookingData.subTotal,
    discount: bookingData.discount,
    total: bookingData.total,
    bookingId: bookingData.id,
  });

  return res.json(
    returnFunction("1", "Logistic Company Added Successfully", {}, "")
  );
}


/*
            7. Get order details
    _________________________________________________________
*/
async function orderDetails(req, res) {
  const { bookingId } = req.body;
  let bookingData = await booking.findByPk(bookingId, {
    include: [
      { model: logisticCompany },
      {
        model: user,
        as: "customer",
        attributes: ["virtualBox", "firstName", 'lastName', 'email', 'countryCode', 'phoneNum']
      },
      {
        model: addressDBS,
        as: "pickupAddress",
        attributes: [
          "streetAddress",
          "building",
          "floor",
          "apartment",
          "district",
          "city",
          "province",
          "country",
          "postalCode",
        ],
      },
      {
        model: addressDBS,
        as: "dropoffAddress",
        attributes: [
          "streetAddress",
          "building",
          "floor",
          "apartment",
          "district",
          "city",
          "province",
          "country",
          "postalCode",
        ],
      },
      {
        model: appUnits,
        include: [
          {
            model: units,
            as: "currencyUnit",
            attributes: ["symbol", "conversionRate"],
          },
          {
            model: units,
            as: "lengthUnit",
            attributes: ["symbol", "conversionRate"],
          },
          {
            model: units,
            as: "weightUnit",
            attributes: ["symbol", "conversionRate"],
          },
          {
            model: units,
            as: "distanceUnit",
            attributes: ["symbol", "conversionRate"],
          },
        ],
        attributes: ["id"],
      },
      { model: bookingStatus, attributes: ["id", "title"] },
      { model: bookingType, attributes: ["id", "title"] },
      {
        model: package,
        attributes: {
          exclude: [
            "barcode",
            "total",
            "status",
            "createdAt",
            "updatedAt",
            "bookingId",
            "categoryId",
          ],
        },
        include: [
          { model: ecommerceCompany, attributes: ["title"] },
          { model: category, attributes: ["title"] },
        ],
      },
      {
        model: bookingHistory,
        attributes: [
          "id",
          [
            sequelize.fn("date_format", sequelize.col("date"), "%m-%d-%Y"),
            "date",
          ],
          [sequelize.fn("date_format", sequelize.col("time"), "%r"), "time"],
        ],
        include: { model: bookingStatus, attributes: ["id", "title"] },
      },
      // { model: rating, attributes: ["value", "comment"] },
    ],
    attributes: [
      "id",
      "trackingId",
      "instruction",
      "receiverEmail",
      "receiverPhone",
      "receiverName",
      "senderEmail",
      "senderPhone",
      "senderName",
      "subTotal",
      "discount",
      "total",
      "barcode",
      "distance",
      "consolidation",
      "paymentConfirmed",
      "length",
      "width",
      "height",
      "weight",
      "volume",
      "logisticCompanyId",
      "bookingStatusId",
      "deliveryTypeId",
      "logisticCompanyTrackingNum",
      "bookingTypeId",
    ],
  });
  // return res.json(bookingData)
  let weightData = null;
  if (bookingData.consolidation) {
    console.log(
      "🚀 ~ orderDetails ~ bookingData.consolidation:",
      bookingData.consolidation
    );

    weightData = await calculateWeights(
      [
        {
          actualWeight: bookingData.weight,
          actualVolume: bookingData.volume,
        },
      ],
      bookingData.logisticCompany.divisor
    );
  } else if (bookingData.logisticCompany) {
    weightData = await calculateWeights(
      bookingData.packages,
      bookingData.logisticCompany.divisor
    )
  }

  let chargedWeight = weightData?.chargedWeight;
  if (typeof chargedWeight === 'string') {
    console.log("String==========================>")
    chargedWeight = chargedWeight.trim().replace(/^0+/, ''); // Remove leading zeros
  }

  bookingData.dataValues.billableWeight = parseFloat(chargedWeight).toFixed(2);

  console.log("bookingData.dataValues.billableWeight==================>>>>>", bookingData.dataValues.billableWeight);
  // return res.json(returnFunction('1', `Booking Details ${bookingId}`, bookingData, ''))
  const bookingStatuses = await bookingStatus.findAll({
    where:
      bookingData.deliveryTypeId === 2
        ? {
          id: {
            [Op.notIn]: [13, 14, 15, 16, 17, 18],
          },
        }
        : {
          id: {
            [Op.notIn]: [9, 14, 15, 20, 21, 22],
          },
        },
    attributes: ["id", "title", "description"],
  });
  let cancelledData = {
    cancelledBy: "",
    name: "",
  };
  // Cnacelled booking status id = 19
  if (bookingData.bookingStatus.id === 19) {
    let cancelData = await cancelledBooking.findOne({
      where: { bookingId },
      include: {
        model: user,
        include: { model: userType, attributes: ["name"] },
        attributes: ["firstName", "lastName"],
      },
    });
    if (cancelData) {
      cancelledData.cancelledBy = cancelData.user.userType.name;
      cancelledData.name = `${cancelData.user.firstName} ${cancelData.user.lastName}`;
    }
  }

  bookingData.dataValues.cancelData = cancelledData;
  if (bookingData.rating === null)
    bookingData.dataValues.rating = { value: "", comment: "" };

  let historyArray = [];
  bookingStatuses.map((ele) => {
    let found = bookingData.bookingHistories.filter(
      (element) => element.bookingStatus.id === ele.id
    );
    if (found.length > 0) {
      found.forEach((data) => {
        let outObj = {
          bookingStatusId: data.bookingStatus.id,
          statusText: data.bookingStatus.title,
          statusDesc: ele.description,
          date: dateFormatDMY(data.date),
          time: data.time,
          status: true,
        };
        historyArray.push(outObj);
      });
    } else {
      if (
        bookingData.deliveryTypeId === 2 &&
        bookingData.bookingStatusId > 12 &&
        bookingData.bookingStatusId < 19
      ) {
      } else {
        let outObj = {
          bookingStatusId: ele.id,
          statusText: ele.title,
          statusDesc: ele.description,
          date: "",
          time: "",
          status: false,
        };
        historyArray.push(outObj);
      }
    }
  });
  //handling cancel case
  if (bookingData.bookingStatusId === 19) {
    // remove all whose status is false
    historyArray = historyArray.filter((ele) => ele.status === true);
  } else {
    historyArray.pop();
  }
  bookingData.dataValues.bookingHistory = historyArray;
  delete bookingData.dataValues.bookingHistories;
  //   bookingData.dataValues.bookingHistory = historyArray;

  // applying conversion
  let convertedPackages = bookingData.packages.map((data) => {
    if (bookingData.bookingTypeId == 6) {
      let clength = unitConversionsR(
        data.length,
        bookingData.appUnit.lengthUnit.conversionRate
      ).toFixed(2);
      let cwidth = unitConversionsR(
        data.width,
        bookingData.appUnit.lengthUnit.conversionRate
      ).toFixed(2);
      let cheight = unitConversionsR(
        data.height,
        bookingData.appUnit.lengthUnit.conversionRate
      ).toFixed(2);
      let cweight = unitConversionsR(
        data.weight,
        bookingData.appUnit.weightUnit.conversionRate
      ).toFixed(2);
      // calculating volume

      let cvolume = clength * cwidth * cheight;

      return {
        id: data.id,
        trackingNum: data.trackingNum,
        name: data.name,
        email: data.email,
        phone: data.phone,
        weight: cweight,
        length: clength,
        width: cwidth,
        height: cheight,
        volume: cvolume,
        ETA: data.ETA,
        note: data.note,
        logisticCompanyTrackingNum: data.logisticCompanyTrackingNum,
        fedexLabel: data.fedexLabel,
        //arrived: data.arrived,
        category:
          data.category.title.toLowerCase() === "other"
            ? `${data.category.title}(${data.catText})`
            : `${data.category.title}`,
        ecommerceCompany:
          !data.ecommerceCompanyId || data.ecommerceCompanyId == null
            ? ""
            : data.ecommerceCompany.title,
      };
    }

    if (bookingData.bookingStatusId < 8) {
      let clength = unitConversionsR(
        data.length,
        bookingData.appUnit.lengthUnit.conversionRate
      ).toFixed(2);
      let cwidth = unitConversionsR(
        data.width,
        bookingData.appUnit.lengthUnit.conversionRate
      ).toFixed(2);
      let cheight = unitConversionsR(
        data.height,
        bookingData.appUnit.lengthUnit.conversionRate
      ).toFixed(2);
      let cweight = unitConversionsR(
        data.weight,
        bookingData.appUnit.weightUnit.conversionRate
      ).toFixed(2);
      // calculating volume
      let cvolume = clength * cwidth * cheight;
      return {
        id: data.id,
        trackingNum: data.trackingNum,
        name: data.name,
        email: data.email,
        phone: data.phone,
        weight: cweight,
        length: clength,
        width: cwidth,
        height: cheight,
        volume: cvolume,
        ETA: data.ETA,
        note: data.note,
        arrived: data.arrived,
        fedexLabel: data.fedexLabel,
        category:
          data.category.title.toLowerCase() === "other"
            ? `${data.category.title}(${data.catText})`
            : `${data.category.title}`,
        ecommerceCompany:
          !data.ecommerceCompanyId || data.ecommerceCompanyId == null
            ? ""
            : data.ecommerceCompany.title,
      };
    } else {
      let clength = unitConversionsR(
        bookingData?.consolidation ? data.length : data.actualLength,
        bookingData.appUnit.lengthUnit.conversionRate
      ).toFixed(2);
      let cwidth = unitConversionsR(
        bookingData?.consolidation ? data.width : data.actualWidth,
        bookingData.appUnit.lengthUnit.conversionRate
      ).toFixed(2);
      let cheight = unitConversionsR(
        bookingData?.consolidation ? data.height : data.actualHeight,
        bookingData.appUnit.lengthUnit.conversionRate
      ).toFixed(2);
      let cweight = unitConversionsR(
        bookingData?.consolidation ? data.weight : data.actualWeight,
        bookingData.appUnit.weightUnit.conversionRate
      ).toFixed(2);
      // calculating volume
      let cvolume = clength * cwidth * cheight;
      return {
        id: data.id,
        trackingNum: data.trackingNum,
        name: data.name,
        email: data.email,
        phone: data.phone,
        weight: cweight,
        length: clength,
        width: cwidth,
        height: cheight,
        volume: cvolume,
        ETA: data.ETA,
        note: data.note,
        arrived: data.arrived,
        logisticCompanyTrackingNum: data.logisticCompanyTrackingNum,
        fedexLabel: data.fedexLabel,
        category:
          data.category.title.toLowerCase() === "other"
            ? `${data.category.title}(${data.catText})`
            : `${data.category.title}`,
        ecommerceCompany:
          !data.ecommerceCompany || data.ecommerceCompany == null
            ? ""
            : data.ecommerceCompany.title,
      };
    }
  });
  delete bookingData.dataValues.packages;
  // converting distance
  bookingData.dataValues.distance = unitConversionsR(
    bookingData.dataValues.distance,
    bookingData.appUnit.distanceUnit.conversionRate
  ).toFixed(2);

  let outObj = { ...bookingData.dataValues, packages: convertedPackages };
  // console.log("OBJ---------------------------------->>>>>>",outObj)
  return res.json(returnFunction("1", `Booking Details`, outObj, ""));
}

/*
            8. Support & Privacy
*/
async function supportData(req, res) {
  const linksData = await links.findAll({
    where: { key: { [Op.or]: ["privacyPolicy"] }, status: true },
    attributes: ["key", "link"],
  });
  //return res.json(linksData)
  const supportData = await support.findAll({
    where: {
      key: { [Op.or]: ["support_phone", "support_email"] },
      status: true,
    },
    attributes: ["key", "value"],
  });
  const FAQ = await FAQs.findAll({
    where: { status: true },
    attributes: ["id", "title", "answer"],
  });
  //let FAQ = linksData.filter(ele=> ele.key === 'FAQ');
  //return res.json(FAQ)
  let privacyPolicy = linksData.filter((ele) => ele.key === "privacyPolicy");
  let number = supportData.filter((ele) => ele.key === "support_phone");
  let email = supportData.filter((ele) => ele.key === "support_email");
  let retObj = {
    email: email[0].value,
    number: number[0].value,
    FAQ,
    privacyPolicy: privacyPolicy[0].link,
  };
  return res.json(returnFunction("1", "Links", retObj, ""));
}
/*
            9. Update password
    _________________________________________________________
*/
async function updatePassword(req, res) {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.id;
  // getting the user
  const userData = await user.findByPk(userId, {
    attributes: ["id", "password"],
  });
  if (!userData)
    throw new CustomException("User not found", "Please try again later");
  const matched = await bcrypt.compare(oldPassword, userData.password);
  if (!matched)
    throw new CustomException("Incorrect password", "Please try again later");
  let hashedPassword = await bcrypt.hash(newPassword, 10);
  userData.password = hashedPassword;
  await userData.save();
  return res.json(returnFunction("1", "Password updated successfully", {}, ""));
}
/*
            . Download PDF
*/
async function downloadPDF(req, res) {
  let bookingId = req.query.id;
  //return res.json(bookingId);
  const bookingData = await booking.findByPk(bookingId, {
    include: [
      // {model: category, attributes: ['title']},
      //{model: bookingStatus, attributes: ['id', 'title']},
      {
        model: addressDBS,
        as: "pickupAddress",
        attributes: ["id", "postalCode"],
      }, //'secondPostalCode'
      {
        model: addressDBS,
        as: "dropoffAddress",
        attributes: ["id", "postalCode"],
      }, //'secondPostalCode'
      { model: shipmentType, attributes: ["title"] },
      //{model: bookingHistory, attributes: ['id',  [sequelize.fn('date_format', sequelize.col('date'), '%m-%d-%Y'), 'date'],[sequelize.fn('date_format', sequelize.col('time'), '%r'), 'time']], include: {model: bookingStatus, attributes: ['id', 'title']}},
      // {model: size, attributes: ['title']},
      // {model: unit, as: 'lengthUnitB', attributes: ['symbol']},
      // {model: unit, as: 'weightUnitB', attributes: ['symbol']},
    ],
  });
  let imagePath = "";
  if (bookingData.barcode === "" || bookingData.barcode === null)
    imagePath = `Public/Barcodes/NA.png`;
  else imagePath = bookingData.barcode;

  // Create a document
  //const doc = new PDFDocument();
  const doc = new PDFDocument({
    bufferPages: true,
    size: "A8",
    margins: {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    },
  });
  // // Saving the pdf file in root directory.
  //doc.pipe(fs.createWriteStream(`Images/OrderPDFs/invoice-Order#${bookId}.pdf`));
  //doc.pipe(res);
  let buffers = [];
  doc.on("data", buffers.push.bind(buffers));
  doc.on("end", () => {
    let pdfData = Buffer.concat(buffers);
    res
      .writeHead(200, {
        "Content-Length": Buffer.byteLength(pdfData),
        "Content-Type": "application/pdf",
        "Content-disposition": `attachment;filename=invoice-Order#${bookingData.trackingId}.pdf`,
      })
      .end(pdfData);
  });

  // 1st Row
  doc
    .font("Times-Roman")
    .fontSize(10)
    .text("Parcel Receipt", 5, 5, { align: "left", bold: true });

  doc
    .font("Times-Roman")
    .fontSize(8)
    .text(`Tracking Id:`, 5, 18, { align: "left" })
    .text(`${bookingData.trackingId}`, 48, 18, { lineBreak: false });

  doc.opacity("1").image("logo.png", 120, 3, { fit: [15, 30] });

  // HORIZONTAL LINE
  doc.moveTo(5, 28).lineTo(140, 28).stroke();

  // SENDER
  doc.font("Times-Roman").fontSize(10).text("Sender", 5, 30, { bold: true });

  doc
    .font("Times-Roman")
    .fontSize(8)
    .text("Name", 5, 38, { align: "left" })
    .text(`${bookingData.senderName}`, 60, 38, { width: 80, align: "right" })
    .text("Email", 5, 46, { align: "left" })
    .text(`${bookingData.senderEmail}`, 40, 46, { width: 100, align: "right" })
    .text("Phone No", 5, 54, { align: "left" })
    .text(`${bookingData.senderPhone}`, 60, 54, { width: 80, align: "right" })
    .text("DBS", 5, 62, { align: "left" })
    .text(`${bookingData.pickupAddress.postalCode} `, 60, 62, {
      width: 80,
      align: "right",
    }); //${bookingData.pickupAddress.secondPostalCode}
  // HORIZONTAL LINE
  doc.moveTo(5, 70).lineTo(140, 70).stroke();

  // RECEIVER
  doc.font("Times-Roman").fontSize(10).text("Receiver", 5, 72, { bold: true });

  doc
    .font("Times-Roman")
    .fontSize(8)
    .text("Name", 5, 80, { align: "left" })
    .text(`${bookingData.receiverName}`, 60, 80, { width: 80, align: "right" })
    .text("Email", 5, 88, { align: "left" })
    .text(`${bookingData.receiverEmail}`, 40, 88, {
      width: 100,
      align: "right",
    })
    .text("Phone no", 5, 96, { align: "left" })
    .text(`${bookingData.receiverPhone}`, 60, 96, { width: 80, align: "right" })
    .text("DBS", 5, 104, { align: "left" })
    .text(`${bookingData.dropoffAddress.postalCode} `, 60, 104, {
      width: 80,
      align: "right",
    }); //${bookingData.dropoffAddress.secondPostalCode}
  // HORIZONTAL LINE
  doc.moveTo(5, 112).lineTo(140, 112).stroke();

  // RECEIVER
  doc
    .font("Times-Roman")
    .fontSize(10)
    .text("Parcel Details", 5, 114, { bold: true });

  doc
    .font("Times-Roman")
    .fontSize(8)
    // .text('Size', 5, 122, { align : 'left' } )
    // .text(`${bookingData.size.title}`, 60, 122, { width: 80, align : 'right' })
    // .text('Category', 5, 130, { align : 'left' } )
    // .text(`${bookingData.category.title}`, 60, 130, { width: 80, align : 'right' })
    .text("Shipment Type", 5, 138, { align: "left" })
    .text(`${bookingData.shipmentType.title}`, 60, 138, {
      width: 80,
      align: "right",
    })
    .text("Price", 5, 146, { align: "left" })
    .text(`$${bookingData.total}`, 60, 146, { width: 80, align: "right" });
  // .text('Price', 5, 154, { align : 'left' } )
  // .text(`$50`, 60, 154, {width: 80, align : 'right' });
  //      // HORIZONTAL LINE
  doc.moveTo(5, 154).lineTo(140, 154).stroke();
  //     doc
  //         .fontSize(14)
  //         .text('Shipment Code', 5, 395 ,{ bold : true });
  doc.opacity("1").image(`${imagePath}`, 25, 156, { fit: [100, 800] });

  doc
    .fillColor("#000000")
    .opacity("0.25")
    .fontSize(6)
    .text("POWERED BY SIGI TECHNOLOGIES", 20, 200, { bold: "true" });

  doc.end();
}

// ! Module 6 : Rating
// ! _________________________________________________________________________________________________________________________________
/*
            1. Add/Skip rating 
*/
async function addSkipRating(req, res) {
  const userId = req.user.id;
  const { value, comment, bookingId, addRating } = req.body;
  if (addRating) {
    const exist = await rating.findOne({ where: { bookingId } });
    if (exist)
      throw new CustomException(
        "Rating already added",
        "You have already rated us. Thank you for your feedback"
      );
    rating
      .create({ value, comment, userId, bookingId, at: Date.now() })
      .then((data) => {
        booking.update({ rated: "added" }, { where: { id: bookingId } });
        return res.json(
          returnFunction(
            "1",
            "Thank-you for the feedback. We highly appreciate it",
            {},
            ""
          )
        );
      })
      .catch((err) => {
        return res.json(
          returnFunction(
            "0",
            "Internal Server Error",
            {},
            `Error adding rating: ${err}`
          )
        );
      });
  } else {
    await booking.update({ rated: "skipped" }, { where: { id: bookingId } });
    return res.json(
      returnFunction(
        "1",
        "Rating skipped but we highly recommend to provide feedback so we can serve you better",
        {},
        ""
      )
    );
  }
}
/*
            2. Bookings with pending ratings
*/
async function unRatedBookings(req, res) {
  const userId = req.user.id;
  const bookingData = await booking.findAll({
    // TODO update booking status for completed booking
    where: { bookingStatusId: 14, rated: "pending", customerId: userId },
    // include: [
    //     {model: category, attributes: ['title']},
    //     {model: shipmentType, attributes: ['title']},
    //     {model: size, attributes: ['title']},
    //     {model: unit, as: 'weightUnitB', attributes: ['symbol']},
    //     {model: unit, as: 'lengthUnitB', attributes: ['symbol']},
    // ],
    attributes: ["id", "trackingId"],
  });
  return res.json(
    returnFunction(
      "1",
      "Bookings (pending rating)",
      { unRatedBookings: bookingData },
      ""
    )
  );
}
//!
async function addCard(req, res) {
  let { cardName, cardExpYear, cardExpMonth, cardNumber, cardCVC } = req.body;
  const userData = await user.findByPk(req.user.id);
  const customer_id = await ensureStripeCustomerId(userData);
  const paymentMethod = await stripe.paymentMethods.create({
    type: "card",
    billing_details: { name: cardName },
    // customer: customer_id,// Not Tried Butt can also Use Attact to Customer Api
    card: {
      number: cardNumber,
      exp_month: cardExpMonth,
      exp_year: cardExpYear,
      cvc: cardCVC,
    },
  });

  //   Attact payment Method to Customer
  const attachToCustomer = await stripe.paymentMethods.attach(
    paymentMethod.id,
    { customer: customer_id }
  );
  return res.json(
    returnFunction("1", "Card Added Successfully", { attachToCustomer }, "")
  );
}
// ! Module 7: Payment Gateway
async function GetCustomercards(req, res) {
  const { id } = req.user;
  const userData = await user.findOne({ where: { id: req.user.id } });

  await ensureStripeCustomerId(userData);
  const Cards = await Stripe.cards(userData.stripeCustomerId);
  return res.json(returnFunction("1", "User Cards", { cards: Cards.data }, ""));
}
////! Card Detach
async function deletecards(req, res) {
  const { paymentMethodId } = req.body;
  const Cards = await Stripe.cardDetach(paymentMethodId);
  return res.json(returnFunction("1", "Card Detached", {}, ""));
}
////! create PaymentIntend

// Card payments from the website's /payment-method page. The payment is taken
// straight away (no hold) and recorded through finalizeAppPayment, like the app.
async function cardPaymentBooking(bookingId, userId) {
  return booking.findOne({
    where: { id: bookingId, customerId: userId },
    attributes: ["id", "total", "paymentConfirmed"],
  });
}

async function respondToCardPayment(res, bookingData, intent) {
  if (intent.status !== "succeeded") {
    return res.json(
      returnFunction("0", "Payment could not be completed", {}, "Payment could not be completed")
    );
  }
  const labels = await finalizeAppPayment(bookingData.id, intent, bookingData.total);
  const updated = await booking.findByPk(bookingData.id, {
    attributes: ["logisticCompanyTrackingNum"],
  });
  return res.json(
    returnFunction("1", "Payment successfully Done", {
      logisticCompanyTrackingNum: decodeJsonColumn(updated.logisticCompanyTrackingNum),
      label: labels[0]?.label || null,
      labels,
    }, "")
  );
}

async function makepaymentBySavedCard(req, res) {
  const UserId = req.user.id;
  let { pmId, amount, bookingId } = req.body;

  const userData = await user.findOne({ where: { id: UserId } });
  await ensureStripeCustomerId(userData);

  const userType = userData.userTypeId;
  if (userType === 3) {
    console.log("Bussiness User --------------->");
    let subscriptionId = await userPlan.findOne({
      where: {
        userId: UserId,
        subscriptionStatus: "Active",
      },
      attributes: ["subscriptionPlanID"],
    });

    if (!subscriptionId) {
      throw new CustomException(
        "Invalid Subscription Id or You don't have any Subscription"
      );
    }
  }

  const bookingData = await cardPaymentBooking(bookingId, UserId);
  if (!bookingData) {
    return res.json(returnFunction("0", "Order not found", {}, "Order not found"));
  }
  if (bookingData.paymentConfirmed) {
    return res.json(
      returnFunction("0", "This order has already been paid.", {}, "This order has already been paid.")
    );
  }

  let intent;
  try {
    intent = await stripe.paymentIntents.create({
      amount: convertToCents(amount), // send in cents
      currency: "usd",
      payment_method_types: ["card"],
      customer: `${userData.stripeCustomerId}`,
      payment_method: pmId,
      confirm: true,
      metadata: { bookingId: String(bookingData.id), customerId: String(UserId) },
    });
  } catch (err) {
    return res.json(returnFunction("0", err.message, {}, err.message));
  }
  return respondToCardPayment(res, bookingData, intent);
}

///
async function makepaymentbynewcard(req, res) {
  let {
    cardName,
    cardExpYear,
    cardExpMonth,
    cardNumber,
    cardCVC,
    saveStatus,
    amount,
    bookingId,
  } = req.body;

  const userData = await user.findOne({ where: { id: req.user.id } });
  await ensureStripeCustomerId(userData);

  const bookingData = await cardPaymentBooking(bookingId, req.user.id);
  if (!bookingData) {
    return res.json(returnFunction("0", "Order not found", {}, "Order not found"));
  }
  if (bookingData.paymentConfirmed) {
    return res.json(
      returnFunction("0", "This order has already been paid.", {}, "This order has already been paid.")
    );
  }

  let intent;
  try {
    const method = await stripe.paymentMethods.create({
      type: "card",
      billing_details: { name: cardName },
      card: {
        number: cardNumber,
        exp_month: cardExpMonth,
        exp_year: cardExpYear,
        cvc: cardCVC,
      },
    });
    if (saveStatus) {
      await stripe.paymentMethods.attach(method.id, {
        customer: userData.stripeCustomerId,
      });
    }
    intent = await stripe.paymentIntents.create({
      amount: convertToCents(amount),
      currency: "usd",
      payment_method_types: ["card"],
      customer: `${userData.stripeCustomerId}`,
      payment_method: method.id,
      confirm: true,
      metadata: { bookingId: String(bookingData.id), customerId: String(req.user.id) },
    });
  } catch (err) {
    return res.json(returnFunction("0", err.message, {}, err.message));
  }
  return respondToCardPayment(res, bookingData, intent);
}

// ! _________________________________________________________________________________________________________________________________
/*
            1. Initaite Payment
*/
async function initatePayment(req, res) {
  const { bookingId, paymentBy } = req.body;
  const bookingData = await booking.findByPk(bookingId, {
    attributes: [
      "trackingId",
      "subTotal",
      "discount",
      "total",
      "senderEmail",
      "senderName",
    ],
  });
  //return res.json(bookingData);
  if (paymentBy === "yappy") {
    var paymentData = {
      orderId: bookingData.trackingId,
      total: parseFloat(bookingData.total),
      subTotal: parseFloat(bookingData.total),
      taxes: 0,
    };
    yappy
      .generate_payment_link(paymentData)
      .then(function (response) {
        if (response.status) {
          let retData = {
            redirectUrl: response.redirectUrl,
          };
          return res.json(
            returnFunction("1", "Please continue to pay", retData, "")
          );
        } else {
          return res.json(
            returnFunction(
              "0",
              "Payment unsuccessful through yappy. Please try again",
              response,
              `Yappy error`
            )
          );
        }
      })
      .catch((err) => {
        return res.json(
          returnFunction(
            "0",
            "Payment unsuccessful through yappy. Please try again",
            {},
            `${err}`
          )
        );
      });
  } else if (paymentBy === "paypal") {
    // Getting accessToken from paypal
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
    let accTok = "";
    axios({
      method: "post",
      url: "https://api-m.sandbox.paypal.com/v1/oauth2/token",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + encodedToken,
      },
      data: formBody,
    })
      .then(function (response) {
        accTok = response.data.access_token;

        var data = JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            {
              items: [
                {
                  name: `${bookingData.trackingId}`,
                  description: "PPS Logistica Courier Charge",
                  quantity: "1",
                  unit_amount: {
                    currency_code: "USD",
                    value: `${bookingData.total}`,
                  },
                },
              ],
              amount: {
                currency_code: "USD",
                value: `${bookingData.total}`,
                breakdown: {
                  item_total: {
                    currency_code: "USD",
                    value: `${bookingData.total}`,
                  },
                },
              },
            },
          ],
          payment_source: {
            paypal: {
              email_address: `${bookingData.senderEmail}`,
              name: {
                given_name: `${bookingData.senderName}`,
                surname: " ",
              },
              experience_context: {
                brand_name: "PPS Logistica",
                landing_page: "LOGIN",
                user_action: "CONTINUE",
                return_url: process.env.successURL,
                cancel_url: process.env.cancelURL,
              },
            },
          },
        });
        const requestId = randomstring.generate();
        var config = {
          method: "post",
          maxBodyLength: Infinity,
          url: "https://api-m.sandbox.paypal.com/v2/checkout/orders",
          headers: {
            "Content-Type": "application/json",
            Prefer: "return=representation",
            "PayPal-Request-Id": `${requestId}`,
            Authorization: `Bearer ${accTok}`,
            Cookie:
              "cookie_check=yes; d_id=8c47d608419c4e5dabc1436aeeba93dd1676894129864; enforce_policy=ccpa; ts=vreXpYrS%3D1771588529%26vteXpYrS%3D1676895929%26vr%3D6eadcca81860a6022c4955b0ee28ed1d%26vt%3D6eadcca81860a6022c4955b0ee28ed1c%26vtyp%3Dnew; ts_c=vr%3D6eadcca81860a6022c4955b0ee28ed1d%26vt%3D6eadcca81860a6022c4955b0ee28ed1c; tsrce=unifiedloginnodeweb; x-cdn=fastly:FJR; x-pp-s=eyJ0IjoiMTY3Njg5NDEyOTkzNSIsImwiOiIwIiwibSI6IjAifQ",
          },
          data: data,
        };
        axios(config)
          .then(function (response) {
            //save Order Id in the database
            booking.update(
              { paypalOrderId: response.data.id },
              { where: { id: bookingId } }
            );
            let retData = {
              redirectUrl: response.data.links[1].href,
            };
            return res.json(
              returnFunction("1", "Please continue to pay", retData, "")
            );
          })
          .catch(function (error) {
            return res.json(
              returnFunction(
                "0",
                "Payment unsuccessful. Please try again",
                {},
                `${error.response.data.message}`
              )
            );
            //return res.json(error.response.data)
          });
      })
      .catch(function (error) {
        return res.json(
          returnFunction(
            "0",
            "Payment unsuccessful. Please try again",
            {},
            `${error.response.data}`
          )
        );
        //return res.json(error.response.data)
      });
  } else {
    return res.json(
      returnFunction(
        "0",
        "Payment unsuccessful. Please try again",
        {},
        `Please choose a valid payment method`
      )
    );
  }
}
/*
            2. Capture Payment
*/
async function capturePayment(req, res) {
  const { bookingId, paymentBy, cardData } = req.body;
  const bookingData = await booking.findByPk(bookingId, {
    include: [
      { model: category, attributes: ["title"] },
      {
        model: addressDBS,
        as: "pickupAddress",
        attributes: ["id", "postalCode", "secondPostalCode"],
      },
      {
        model: addressDBS,
        as: "dropoffAddress",
        attributes: ["id", "postalCode", "secondPostalCode"],
      },
      { model: shipmentType, attributes: ["title"] },
      //{model: bookingHistory, attributes: ['id',  [sequelize.fn('date_format', sequelize.col('date'), '%m-%d-%Y'), 'date'],[sequelize.fn('date_format', sequelize.col('time'), '%r'), 'time']], include: {model: bookingStatus, attributes: ['id', 'title']}},
      { model: size, attributes: ["title"] },
      { model: unit, as: "lengthUnitB", attributes: ["symbol"] },
      { model: unit, as: "weightUnitB", attributes: ["symbol"] },
      { model: bookingType, attributes: ["title"] },
    ],
    attributes: [
      "id",
      "trackingId",
      "paypalOrderId",
      "subTotal",
      "discount",
      "total",
      "senderEmail",
      "senderName",
      "senderPhone",
      "receiverEmail",
      "receiverName",
      "receiverPhone",
      "weight",
      "length",
      "width",
      "height",
      "barcode",
      "ETA",
      "customerId",
      "catText",
    ],
  });
  const defaultCurrencyUnit = await defaultUnit.findOne({
    where: { type: "currency", status: true },
    attributes: ["symbol"],
  });
  bookingData.dataValues.currencyUnit = defaultCurrencyUnit.symbol;
  let parcelDetails = {
    trackingId: bookingData.trackingId,
    shipmentType: bookingData.shipmentType.title,
    bookingType: bookingData.bookingType.title,
    sizeType: bookingData.size.title,
    category: bookingData.category.title,
    ETA: bookingData.ETA,
    total: `$${bookingData.total}`,
  };
  let html = createBooking(`${bookingData.senderName}`, parcelDetails);
  //return res.json(bookingData)
  if (paymentBy === "yappy") {
    await booking.update(
      { status: true, paymentConfirmed: true, paymentBy: "yappy" },
      { where: { id: bookingId } }
    );
    await wallet.create({
      amount: bookingData.total,
      bookingId: bookingData.id,
      userId: bookingData.customerId,
      description: "User Paid",
    });
    transporter.sendMail(
      {
        from: process.env.EMAIL_USERNAME, // sender address
        to: ["asadali.9841@gmail.com", bookingData.senderEmail], // list of receivers
        subject: `Order ${bookingData.trackingId}: Order Placed`, // Subject line
        //text: `Your OTP is ${OTP}`, // plain text body
        html,
        attachments: [
          {
            filename: "logo.png",
            path: __dirname + "/logo.png",
            cid: "logoImage", //same cid value as in the html img src
          },
        ],
      },
      function (err, info) {
        if (err) console.log(err);
      }
    );
    return res.json(returnFunction("1", "Payment successful", bookingData, ""));
  } else if (paymentBy === "paypal") {
    const bearerToken = await createPaypalToken();
    //return res.json(bearerToken)
    if (!bearerToken.status)
      return res.json(
        returnFunction(
          "0",
          "Paypal Token creation error",
          {},
          "Please try again later"
        )
      );
    let data = "";
    const requestId = randomstring.generate();
    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `https://api-m.sandbox.paypal.com/v2/checkout/orders/${bookingData.paypalOrderId}/capture`,
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=representation",
        "PayPal-Request-Id": requestId,
        Authorization: `Bearer ${bearerToken.token}`,
        //'Cookie': 'cookie_check=yes; d_id=8c47d608419c4e5dabc1436aeeba93dd1676894129864; enforce_policy=ccpa; ts=vreXpYrS%3D1771588529%26vteXpYrS%3D1676895929%26vr%3D6eadcca81860a6022c4955b0ee28ed1d%26vt%3D6eadcca81860a6022c4955b0ee28ed1c%26vtyp%3Dnew; ts_c=vr%3D6eadcca81860a6022c4955b0ee28ed1d%26vt%3D6eadcca81860a6022c4955b0ee28ed1c; tsrce=unifiedloginnodeweb; x-cdn=fastly:FJR; x-pp-s=eyJ0IjoiMTY3Njg5NDEyOTkzNSIsImwiOiIwIiwibSI6IjAifQ'
      },
      //data : data
    };
    axios(config)
      .then(function (response) {
        if (response.data.status === "COMPLETED") {
          booking.update(
            {
              status: true,
              paymentConfirmed: true,
              paymentBy: "paypal",
              captureId:
                response.data.purchase_units[0].payments.captures[0].id,
            },
            { where: { id: bookingId } }
          );

          wallet.create({
            amount: bookingData.total,
            bookingId: bookingData.id,
            userId: bookingData.customerId,
            description: "User Paid",
          });
          transporter.sendMail(
            {
              from: process.env.EMAIL_USERNAME, // sender address
              to: ["asadali.9841@gmail.com", bookingData.senderEmail], // list of receivers
              subject: `Order ${bookingData.trackingId}: Order Placed`, // Subject line
              //text: `Your OTP is ${OTP}`, // plain text body
              html,
              attachments: [
                {
                  filename: "logo.png",
                  path: __dirname + "/logo.png",
                  cid: "logoImage", //same cid value as in the html img src
                },
              ],
            },
            function (err, info) {
              if (err) console.log(err);
            }
          );
          return res.json(
            returnFunction("1", "Payment successful", bookingData, "")
          );
        } else {
          return res.json(
            returnFunction(
              "0",
              "Payment unsuccessful. Please try again",
              {},
              `${error.response.status}`
            )
          );
        }
      })
      .catch(function (error) {
        return res.json(
          returnFunction(
            "0",
            "Payment unsuccessful. Please try again",
            {},
            `${error.response.data.message}`
          )
        );
      });
  } else if (paymentBy === "card") {
    const bearerToken = await createPaypalToken();
    //return res.json(bearerToken)
    if (!bearerToken.status)
      return res.json(
        returnFunction(
          "0",
          "Paypal Token creation error",
          {},
          "Please try again later"
        )
      );
    let data = JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          items: [
            {
              name: `${bookingData.trackingId}`,
              description: "PPS Logistica Courier Charge",
              quantity: "1",
              unit_amount: {
                currency_code: "USD",
                value: `${bookingData.total}`,
              },
            },
          ],
          amount: {
            currency_code: "USD",
            value: `${bookingData.total}`,
            breakdown: {
              item_total: {
                currency_code: "USD",
                value: `${bookingData.total}`,
              },
            },
          },
        },
      ],
      payment_source: {
        card: cardData,
      },
    });
    const requestId = randomstring.generate();
    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://api-m.sandbox.paypal.com/v2/checkout/orders",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=representation",
        "PayPal-Request-Id": requestId,
        Authorization: `Bearer ${bearerToken.token}`,
        Cookie:
          "cookie_check=yes; d_id=8c47d608419c4e5dabc1436aeeba93dd1676894129864; enforce_policy=ccpa; ts=vreXpYrS%3D1771588529%26vteXpYrS%3D1676895929%26vr%3D6eadcca81860a6022c4955b0ee28ed1d%26vt%3D6eadcca81860a6022c4955b0ee28ed1c%26vtyp%3Dnew; ts_c=vr%3D6eadcca81860a6022c4955b0ee28ed1d%26vt%3D6eadcca81860a6022c4955b0ee28ed1c; tsrce=unifiedloginnodeweb; x-cdn=fastly:FJR; x-pp-s=eyJ0IjoiMTY3Njg5NDEyOTkzNSIsImwiOiIwIiwibSI6IjAifQ",
      },
      data: data,
    };

    axios(config)
      .then(function (response) {
        if (response.data.status === "COMPLETED") {
          booking.update(
            {
              status: true,
              paymentConfirmed: true,
              paymentBy: "paypal",
              captureId:
                response.data.purchase_units[0].payments.captures[0].id,
            },
            { where: { id: bookingId } }
          );

          wallet.create({
            amount: bookingData.total,
            bookingId: bookingData.id,
            userId: bookingData.customerId,
            description: "User Paid",
          });
          transporter.sendMail(
            {
              from: process.env.EMAIL_USERNAME, // sender address
              to: ["asadali.9841@gmail.com", bookingData.senderEmail], // list of receivers
              subject: `Order ${bookingData.trackingId}: Order Placed`, // Subject line
              //text: `Your OTP is ${OTP}`, // plain text body
              html,
              attachments: [
                {
                  filename: "logo.png",
                  path: __dirname + "/logo.png",
                  cid: "logoImage", //same cid value as in the html img src
                },
              ],
            },
            function (err, info) {
              if (err) console.log(err);
            }
          );
          return res.json(
            returnFunction("1", "Payment successfull", bookingData, "")
          );
        } else {
          return res.json(
            returnFunction(
              "0",
              "Payment unsuccessful. Please try again",
              {},
              `${error.response.status}`
            )
          );
        }
      })
      .catch(function (error) {
        return res.json(
          returnFunction(
            "0",
            "Payment unsuccessful. Please try again",
            {},
            `${error.response.data.message}`
          )
        );
      });
  } else {
    return res.json(
      returnFunction(
        "0",
        "Payment unsuccessful. Please try again",
        {},
        `Please choose a valid payment method`
      )
    );
  }
}

// TODO Homepage pending screen design
// ! Module 7: Tracking
// ! _________________________________________________________________________________________________________________________________

/*
        1. Get booking details by tracking Id
*/
async function bookingDetailsByTracking(req, res) {
  const { trackingId } = req.body;
  // const defaultDistanceUnit = await defaultUnit.findOne({
  //   where: { type: "distance", status: true },
  //   attributes: ["symbol"],
  // });
  // const defaultCurrencyUnit = await defaultUnit.findOne({
  //   where: { type: "currency", status: true },
  //   attributes: ["symbol"],
  // });
  const bookingData = await booking.findOne({
    where: { trackingId },
    include: [
      {
        model: user,
        as: "customer",
        attributes: [
          "firstName",
          "lastName",
          "email",
          "countryCode",
          "phoneNum",
          [
            sequelize.fn(
              "date_format",
              sequelize.col("customer.createdAt"),
              "%Y"
            ),
            "joinedOn",
          ],
        ],
      },
      {
        model: user,
        as: "receivingDriver",
        attributes: [
          "firstName",
          "lastName",
          "email",
          "countryCode",
          "phoneNum",
          "image",
          [
            sequelize.fn(
              "date_format",
              sequelize.col("receivingDriver.createdAt"),
              "%Y"
            ),
            "joinedOn",
          ],
        ],
      },
      {
        model: user,
        as: "deliveryDriver",
        attributes: [
          "firstName",
          "lastName",
          "email",
          "countryCode",
          "phoneNum",
          "image",
          [
            sequelize.fn(
              "date_format",
              sequelize.col("deliveryDriver.createdAt"),
              "%Y"
            ),
            "joinedOn",
          ],
        ],
      },
      {
        model: user,
        as: "transporter",
        attributes: [
          "firstName",
          "lastName",
          "email",
          "countryCode",
          "phoneNum",
          "image",
          [
            sequelize.fn(
              "date_format",
              sequelize.col("transporter.createdAt"),
              "%Y"
            ),
            "joinedOn",
          ],
        ],
      },
      //{ model: size, attributes: ["title"] },
      { model: shipmentType, attributes: ["title"] },
      // { model: unit, as: "weightUnitB", attributes: ["symbol"] },
      // { model: unit, as: "lengthUnitB", attributes: ["symbol"] },
      { model: bookingStatus, attributes: ["title"] },
      {
        model: addressDBS,
        as: "pickupAddress",
        // include: [
        //   { model: corregimiento, attributes: ["title"] },
        //   { model: province, attributes: ["title"] },
        //   { model: district, attributes: ["title"] },
        // ],
        attributes: [
          "id",
          "postalCode",
          //"secondPostalCode",
          "lat",
          "lng",
          //"buildingName",
        ],
      },
      {
        model: addressDBS,
        as: "dropoffAddress",
        // include: [
        //   { model: corregimiento, attributes: ["title"] },
        //   { model: province, attributes: ["title"] },
        //   { model: district, attributes: ["title"] },
        // ],
        attributes: [
          "id",
          "postalCode",
          //"secondPostalCode",
          "lat",
          "lng",
          //"buildingName",
        ],
      },
      // { model: category, attributes: ["title"] },
      {
        model: bookingHistory,
        attributes: [
          "id",
          [
            sequelize.fn("date_format", sequelize.col("date"), "%m-%d-%Y"),
            "date",
          ],
          [sequelize.fn("date_format", sequelize.col("time"), "%r"), "time"],
        ],
        include: { model: bookingStatus, attributes: ["id", "title"] },
      },
    ],
    attributes: [
      "id",
      "trackingId",
      "pickupDate",
      "pickupEndTime",
      "instruction",
      "receiverEmail",
      "receiverPhone",
      "receiverName",
      "total",
      "subTotal",
      "discount",
      "ETA",
      "weight",
      "length",
      "width",
      "height",
      "senderName",
      "senderEmail",
      "senderPhone",
      "barcode",
      "distance",
    ],
  });
  //return res.json(bookingData)
  if (!bookingData)
    throw new CustomException(
      "The information you are trying to get is unavailable",
      "Please enter correct tracking number"
    );
  // Histories --> setting up the format
  const bookingStatuses = await bookingStatus.findAll({
    attributes: ["id", "title"],
  });
  let historyArray = [];
  bookingStatuses.map((ele) => {
    let found = bookingData.bookingHistories.filter(
      (element) => element.bookingStatus.id === ele.id
    );
    if (found.length > 0) {
      let outObj = {
        bookingStatusId: found[0].bookingStatus.id,
        statusText: found[0].bookingStatus.title,
        date: found[0].date,
        time: found[0].time,
        status: true,
      };
      historyArray.push(outObj);
    } else {
      let outObj = {
        bookingStatusId: ele.id,
        statusText: ele.title,
        date: "",
        time: "",
        status: false,
      };
      historyArray.push(outObj);
    }
  });
  //return res.json(bookingData.customer)
  // removing spaces and commas
  let pickupAddressArray = [
    //bookingData.pickupAddress.buildingName,
    //bookingData.pickupAddress.floorNumber,
    //bookingData.pickupAddress.towerInfo,
    bookingData.pickupAddress?.corregimiento?.title,
    bookingData.pickupAddress?.district?.title,
    bookingData.pickupAddress?.province?.title,
  ];
  let filteredPickupAddressArray = pickupAddressArray.filter(Boolean);
  let pickupAddress = filteredPickupAddressArray.join(", ");
  //let pickupAddress = `${bookingData.pickupAddress.buildingName}, ${bookingData.pickupAddress.floorNumber}, ${bookingData.pickupAddress.towerInfo}, ${bookingData.pickupAddress.corregimiento.title}, ${bookingData.pickupAddress.district.title}, ${bookingData.pickupAddress.province.title}`;
  //let dropoffAddress = `${bookingData.dropoffAddress.buildingName}, ${bookingData.dropoffAddress.floorNumber}, ${bookingData.dropoffAddress.towerInfo}, ${bookingData.dropoffAddress.corregimiento.title}, ${bookingData.dropoffAddress.district.title}, ${bookingData.dropoffAddress.province.title}`;
  let dropoffAddressArray = [
    bookingData.dropoffAddress?.buildingName,
    //bookingData.dropoffAddress.floorNumber,
    //bookingData.dropoffAddress.towerInfo,
    bookingData.dropoffAddress?.corregimiento?.title,
    bookingData.dropoffAddress?.district?.title,
    bookingData.dropoffAddress?.province?.title,
  ];
  let filteredDropoffAddressArray = dropoffAddressArray.filter(Boolean);
  let dropoffAddress = filteredDropoffAddressArray.join(", ");
  let outObj = {
    id: bookingData.id,
    trackingId: bookingData.trackingId,
    instructions: `${bookingData.instruction}`,
    barcode: bookingData.barcode,
    senderDetails: {
      name: `${bookingData.senderName} `,
      email: `${bookingData.senderEmail}`,
      phone: `${bookingData.senderPhone}`,
      memberSince: bookingData.customer
        ? `${bookingData.customer.dataValues.joinedOn}`
        : "",
    },
    recipientDetails: {
      name: `${bookingData.receiverName}`,
      email: `${bookingData.receiverEmail}`,
      phone: `${bookingData.receiverPhone}`,
    },
    deliveryDetails: {
      pickupCode: `${bookingData.pickupAddress.postalCode}`, //${bookingData.pickupAddress.secondPostalCode}`,
      pickupAddress,
      dropoffCode: `${bookingData.dropoffAddress.postalCode}`, // ${bookingData.dropoffAddress.secondPostalCode}`,
      dropoffAddress,
      pickupTime: `${bookingData.pickupEndTime}`,
    },
    parcelDetails: {
      shipmentType:
        bookingData.shipmentType === null
          ? {}
          : {
            shipmentType: `${bookingData.shipmentType.title}`,
            category: `${bookingData.category.title}`,
            size: `${bookingData.length}x${bookingData.width}x${bookingData.height} ${bookingData.lengthUnitB.symbol}<sup>3</sup> (${bookingData.size.title})`,
            weight: `${bookingData.weight} ${bookingData.weightUnitB.symbol}`,
            distance: `${bookingData.distance} ${defaultDistanceUnit.symbol}`,
            pickupDate: `${bookingData.pickupDate}`,
            ETA: `${bookingData.ETA}`,
            subTotal: `${defaultCurrencyUnit.symbol}${bookingData.subTotal}`,
            discount: `${defaultCurrencyUnit.symbol}${bookingData.discount}`,
            orderTotal: `${defaultCurrencyUnit.symbol}${bookingData.total}`,
          },
    },
    receivingDriver:
      bookingData.receivingDriver === null
        ? {}
        : {
          name: `${bookingData.receivingDriver.firstName} ${bookingData.receivingDriver.lastName}`,
          email: `${bookingData.receivingDriver.email}`,
          phone: `${bookingData.receivingDriver.countryCode} ${bookingData.receivingDriver.phoneNum}`,
          memberSince: `${bookingData.receivingDriver.dataValues.joinedOn}`,
          image: `${bookingData.receivingDriver.image}`,
        },
    transporterGuy:
      bookingData.transporter === null
        ? {}
        : {
          name: `${bookingData.transporter.firstName} ${bookingData.transporter.lastName}`,
          email: `${bookingData.transporter.email}`,
          phone: `${bookingData.transporter.countryCode} ${bookingData.transporter.phoneNum}`,
          memberSince: `${bookingData.transporter.dataValues.joinedOn}`,
          image: `${bookingData.transporter.image}`,
        },
    deliveryDriver:
      bookingData.deliveryDriver === null
        ? {}
        : {
          name: `${bookingData.deliveryDriver.firstName} ${bookingData.deliveryDriver.lastName}`,
          email: `${bookingData.deliveryDriver.email}`,
          phone: `${bookingData.deliveryDriver.countryCode} ${bookingData.deliveryDriver.phoneNum}`,
          memberSince: `${bookingData.deliveryDriver.dataValues.joinedOn}`,
          image: `${bookingData.deliveryDriver.image}`,
        },
    bookingHistory: historyArray,
  };
  return res.json(returnFunction("1", "Booking details", outObj, ""));
}

/*
!_____________________________________________________________________________________________________________________________________
*/
// ! RECURRING FUNCTIONS

let returnFunction = (status, message, data, error) => {
  return {
    status: `${status}`,
    message: `${message}`,
    data: data,
    error: `${error}`,
  };
};

let loginData = (userData, accessToken, isGuest) => {
  return {
    status: "1",
    message: "Login successful",
    data: {
      userId: `${userData.id}`,
      firstName: `${userData.firstName}`,
      lastName: `${userData.lastName}`,
      email: `${userData.email}`,
      accessToken: `${accessToken}`,
      userTypeId: `${userData.userTypeId}`,
      isGuest,
      joinedOn: userData.dataValues.joinedOn
        ? userData.dataValues.joinedOn
        : "2023",
      phoneNum: `${userData.countryCode} ${userData.phoneNum}`,
    },
    error: "",
  };
};

let registerData = (userData, accessToken, isGuest) => {
  return {
    status: "1",
    message: "User Register successful",
    data: {
      userId: `${userData.id}`,
      firstName: `${userData.firstName}`,
      lastName: `${userData.lastName}`,
      email: `${userData.email}`,
      accessToken: `${accessToken}`,
      userTypeId: `${userData.userTypeId}`,
      isGuest,
      joinedOn: userData.dataValues.joinedOn
        ? userData.dataValues.joinedOn
        : "2023",
      phoneNum: `${userData.countryCode} ${userData.phoneNum}`,
    },
    error: "",
  };
};

async function idsFunction(userId) {
  //const bookingTypeData = await bookingType.findAll({attributes: ['id', 'title', 'description']});
  const e_comCompanyData = await ecommerceCompany.findAll({
    where: { status: true, deleted: false },
    attributes: ["id", "title", "description"],
  });
  const logisticCompanyData = await logisticCompany.findAll({
    where: { status: true, deleted: false },
    attributes: ["id", "title", "logo", "standardCharges"],
  });
  const categoryData = await category.findAll({
    where: { status: true },
    attributes: ["id", "title", "image"],
  });
  const vehicleData = await vehicleType.findAll({
    where: { status: true },
    attributes: ["id", "title", "image"],
  });
  const attachedAddress = await userAddress.findAll({
    where: { status: true, deleted: false, userId },
    include: {
      model: addressDBS,
      attributes: {
        exclude: [
          "status",
          "deleted",
          "createdAt",
          "updatedAt",
          "structureTypeId",
          "userId",
          "warehouseId",
        ],
      },
    },
    attributes: ["type"],
  });
  // filtering and arraning address;
  const Addresses = attachedAddress.reduce(
    (acc, obj) => {
      if (obj.type === "dropoff") {
        acc.dropoffAddresses.push(obj.addressDB);
      } else {
        acc.pickupAddresses.push(obj.addressDB);
      }
      return acc;
    },
    { pickupAddresses: [], dropoffAddresses: [] }
  );

  // Access the pickupAddresses and dropoffAddresses arrays
  const { pickupAddresses, dropoffAddresses } = Addresses;
  // TODO add appUnits

  //const shipmentTypeData = await shipmentType.findAll({attributes: ['id', 'title', 'description']});
  //const sizeData = await size.findAll({
  //     where:{ status: true},
  //     include: [
  //         {model: unit, as: 'weightUnitS', attributes: ['symbol']},
  //         {model: unit, as: 'lengthUnitS', attributes: ['symbol']}
  //     ],
  //     attributes: ['id', 'title', 'weight', 'length', 'width', 'height', 'image']
  // });
  //const displayAppSettings = await mblAppDynamic.findAll({attributes: ['systemType','value', 'default']});
  //let dimSystemType = displayAppSettings[0].value === 'box'? 'showBoxes': 'manualInputs';
  //let unitSystemType = displayAppSettings[0].value === 'box'? 'autoFetch' :displayAppSettings[0].value? 'userDefinedUnits': 'defaultUnits';
  let outObj = {
    categoryIds: categoryData,
    ecommerceCompanies: e_comCompanyData,
    vehicleTypes: vehicleData,
    pickupAddresses,
    dropoffAddresses,
    logisticCompanies: logisticCompanyData,
    //bookingTypeIds: bookingTypeData,
    //shipmentTypeIds: shipmentTypeData,
    //sizeIds: sizeData,
    // dimSystemType,
    // unitSystemType,
  };
  return outObj;
}

async function textSearchAddress(text) {
  const addressData = await addressDBS.findAll({
    where: {
      [Op.or]: {
        postalCode: { [Op.like]: `%${text}%` },
        secondPostalCode: { [Op.like]: `%${text}%` },
      },
      verified: true,
      removed: false,
    },
    include: [
      { model: structureType, attributes: ["icon", "title"] },
      { model: province, attributes: ["title"] },
      { model: district, attributes: ["title"] },
      { model: corregimiento, attributes: ["title"] },
    ],
    attributes: ["id", "postalCode", "secondPostalCode", "lat", "lng"],
  });
  return addressData;
}

async function couponCheck(code, userId) {
  const existCoupon = await coupon.findOne({
    where: { code: code, status: true },
  });
  //Check is the Coupon with the given code exists or not
  if (!existCoupon)
    throw new CustomException("Invalid Coupon-code", "Please try a valid code");
  // checking the expiry of token
  //return res.json(existCoupon);
  const cDate = Date.now();
  const cDT = new Date(cDate);
  const startDT = new Date(existCoupon.from);
  const endDT = new Date(existCoupon.to);
  if (
    !(
      Date.parse(cDT) > Date.parse(startDT) &&
      Date.parse(cDT) < Date.parse(endDT)
    )
  )
    throw new CustomException("Coupon-code expired", "Please try a valid code");
  //check if the Coupon is already applied by same user
  const alreadyAppliedByUser = await booking.findOne({
    where: {
      couponId: existCoupon.id,
      paymentConfirmed: true,
      customerId: userId,
    },
  });
  if (alreadyAppliedByUser)
    throw new CustomException(
      "Coupon already availed",
      "Please try a valid one"
    );
  // If type of coupon change to conditional, check that condition as well
  // if(existCoupon.type === 'conditional'){
  //     if(subTotal < existCoupon.condAmount) throw new CustomException('Coupon cannot be availed as your billing amount is less the applicable condition', 'Please try a valid one');
  // }
  let data = {
    couponId: existCoupon.id,
    discount: existCoupon.value,
  };
  return data;
}

async function chargeCalculation(idData, orderBy, warehouseId) {
  let retObj = {
    distanceCharge: `1.00`,
    weightCharge: `1.00`,
    categoryCharge: `1.00`,
    shipmentTypeCharge: `1.00`,
    packingCharge: `1.00`,
    serviceCharge: `1.00`,
    gstCharge: `1.00`,
    subTotal: `1.00`,
    currencyUnit: `$`,
  };
  return retObj;
}

async function findNearestWarehouse(addressId) {
  const addressData = await addressDBS.findByPk(addressId, {
    attributes: ["lat", "lng"],
  });
  const warehouseData = await warehouse.findAll({
    where: { classifiedAId: 3, status: true },
    include: { model: addressDBS, attributes: ["id", "lat", "lng"] },
    attributes: ["id"],
  });
  let minDist = 3959;
  let retWarehouseId = null;
  await Promise.all(
    warehouseData.map(async (ele) => {
      let distance = await getDistance(
        ele.addressDB.lat,
        ele.addressDB.lng,
        addressData.lat,
        addressData.lng
      );
      if (distance < minDist) {
        minDist = distance;
        retWarehouseId = ele.id;
      }
    })
  );
  return retWarehouseId;
}

function unitConversions(value, rate) {
  return parseFloat(value) * parseFloat(rate);
}
function unitConversionsR(value, rate) {
  return (parseFloat(value) * 1) / parseFloat(rate);
}

async function addressAdder(addNew, address, type, userId, addressId) {
  if (addNew) {
    // adding address to DB and getting dropoff address Id
    const dropOffAddressData = await addressDBS.create(address);
    // attaching address to user if save is true
    if (address.save)
      await userAddress.create({
        addressDBId: dropOffAddressData.id,
        userId,
        type,
      });
    return dropOffAddressData.id;
  } else return addressId;
}

// create paypal accessToken
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
      console.log(error);
    });
  return output ? { status: true, token } : { status: false, token };
}

// type --> pickup, dropoff
async function getDriverEarning(bookingId, driverId, type) {
  let earning = "0.00";
  const bookingData = await booking.findByPk(bookingId, {
    include: [
      { model: addressDBS, as: "pickupAddress", attributes: ["lat", "lng"] },
      { model: addressDBS, as: "dropoffAddress", attributes: ["lat", "lng"] },
      {
        model: warehouse,
        as: "receivingWarehouse",
        include: { model: addressDBS, attributes: ["lat", "lng"] },
        attributes: ["name"],
      },
      {
        model: warehouse,
        as: "deliveryWarehouse",
        include: { model: addressDBS, attributes: ["lat", "lng"] },
        attributes: ["name"],
      },
    ],
    attributes: ["trackingId"],
  });
  const vehicleData = await driverDetail.findOne({
    where: { userId: driverId },
    include: {
      model: vehicleType,
      attributes: ["baseRate", "perUnitRate", "perRideCharge"],
    },
    attributes: ["id"],
  });
  const systemForCal = await driverPaymentSystem.findOne({
    where: { status: true },
    attributes: ["id", "key"],
  });
  // system type ==> distance_based
  if (systemForCal.key === "distance_based") {
    const baseDistance = await generalCharges.findOne({
      where: { key: "baseDistance" },
      attributes: ["value"],
    });
    if (type === "pickup") {
      let distance = await getDistance(
        bookingData.pickupAddress.lat,
        bookingData.pickupAddress.lng,
        bookingData.receivingWarehouse.addressDB.lat,
        bookingData.receivingWarehouse.addressDB.lng
      );
      if (distance < baseDistance.value)
        earning = vehicleData.vehicleType.baseRate;
      else {
        let extraMiles = distance - baseDistance.value;
        earning =
          vehicleData.vehicleType.baseRate +
          extraMiles * vehicleData.vehicleType.perUnitRate;
      }
    } else {
      let distance = await getDistance(
        bookingData.deliveryWarehouse.addressDB.lat,
        bookingData.deliveryWarehouse.addressDB.lng,
        bookingData.dropoffAddress.lat,
        bookingData.dropoffAddress.lng
      );
      if (distance < baseDistance.value)
        earning = vehicleData.vehicleType.baseRate;
      else {
        let extraMiles = distance - baseDistance.value;
        earning =
          vehicleData.vehicleType.baseRate +
          extraMiles * vehicleData.vehicleType.perUnitRate;
      }
    }
  }
  // per ride based
  else {
    earning = vehicleData.vehicleType.perRideCharge;
  }
  return earning;
}

function getNextPostalCode(previousCode) {
  let letter = previousCode[0];
  let number = parseInt(previousCode.substring(1), 10);
  number++;
  if (number > 999) {
    number = 1;
    if (letter === "9") letter = String.fromCharCode(65);
    else letter = String.fromCharCode(letter.charCodeAt(0) + 1);
    if (letter > "Z") {
      return null; // We've reached the end of the sequence
    }
  }
  return letter + number.toString().padStart(3, "0");
}

async function payment(req, res) {
  const { cardHolderName, cardNo, expiryDate, cvv, bookingId, amount } =
    req.body;
  const found = await booking.findOne({ where: { id: bookingId } });
  if (!found) throw new CustomException("Booking not found", "");
  await booking.update(
    { paymentConfirmed: true, bookingStatusId: 10 },
    { where: { id: bookingId } }
  );

  let dt = Date.now();
  let DT = new Date(dt);
  let currentDate = `${DT.getMonth() + 1}-${DT.getDate()}-${DT.getFullYear()}`;
  let currentTime = `${DT.getHours()}:${DT.getMinutes()}:${DT.getSeconds()}`;
  bookingHistory.create({
    date: currentDate,
    time: currentTime,
    bookingId,
    bookingStatusId: 10,
  });

  return res.json(returnFunction("1", "Payment Confirmed", found.id, ""));
}

//Fetch Shopify Orders
async function downloadLabel(req, res) {
  const { bookingId } = req.body;
  if (!bookingId) {
    return res.json(returnFunction("0", "", {}, "Order not found"));
  }
  const orders = await booking.findOne({
    where: { id: bookingId, customerId: req.user.id },
    attributes: ["id", "label"],
  });
  if (!orders) {
    return res.json(returnFunction("0", "", {}, "Order not found"));
  }
  // Url keeps the stored shape (the customer app reads it as a string for local
  // orders); labels is always an array of { label }, empty until the label exists.
  return res.json(
    returnFunction(
      "1",
      "Booking Label",
      { Url: decodeJsonColumn(orders.label), labels: normalizeLabels(orders.label) },
      ""
    )
  );
}
//! Shopify API's Controllers
// Fetch shopify products
async function allProducts(req, res) {
  const products = await shopify.product.list();
  console.log("Shopify products------------->", products);
  // Respond with the fetched products
  return res.json(returnFunction("1", "All Products", { products }, ""));
}

//Fetch Shopify Orders
async function Orders(req, res) {
  const orders = await shopify.order.list();
  console.log("Order*********************$$$$$", orders);
  // Respond with the fetched Orders
  return res.json(returnFunction("1", "All Orders", { orders }, ""));
}
//Fetch Shopify Order Detail
async function shopifyOrderDetails(req, res) {
  const orders = await shopify.order.get(req.body.orderId);
  // Respond with the fetched Orders
  return res.json(returnFunction("1", "Order Details", { orders }, ""));
}
async function shopifyOrder(req, res) {
  const orderId = req.body;
  console.log("Order ID----------------->", orderId);
  const orderDetails = await shopify.order.get(orderId.order_id);
  console.log("Order Details----------------->", orderDetails);
  const locationDetails = await shopify.location.get(orderId.location_id);
  console.log("Location Details------------------------->", locationDetails);
  const extractedData = extractOrderData(orderDetails);

  let [dropoffAddress, pickupAddress, appUnitData] = await Promise.all([
    addressDBS.findOne({
      where: {
        streetAddress: extractedData.dropoffAddress.streetAddress,
        city: extractedData.dropoffAddress.city,
        province: extractedData.dropoffAddress.province,
        country: extractedData.dropoffAddress.country,
        postalCode: extractedData.dropoffAddress.postalCode,
        type: "dropoff",
      },
    }),
    addressDBS.findOne({
      where: {
        streetAddress: locationDetails.address1,
        city: locationDetails.city,
        province: locationDetails.province,
        country: locationDetails.country_name,
        postalCode: locationDetails.zip,
        type: "pickup",
      },
    }),
    appUnits.findOne({
      where: { status: true, deleted: false },
      include: [
        { model: units, as: "weightUnit", attributes: ["conversionRate"] },
        { model: units, as: "lengthUnit", attributes: ["conversionRate"] },
        { model: units, as: "distanceUnit", attributes: ["conversionRate"] },
      ],
      attributes: ["id"],
    }),
  ]);
  if (pickupAddress === null) {
    pickupAddress = await addressDBS.create({
      streetAddress: locationDetails.address1,
      city: locationDetails.city,
      province: locationDetails.province,
      country: locationDetails.country_name,
      postalCode: locationDetails.zip,
      type: "pickup",
    });
  }

  if (dropoffAddress === null) {
    dropoffAddress = await addressDBS.create({
      streetAddress: extractedData.dropoffAddress.streetAddress,
      city: extractedData.dropoffAddress.city,
      province: extractedData.dropoffAddress.province,
      country: extractedData.dropoffAddress.country,
      postalCode: extractedData.dropoffAddress.postalCode,
      type: "dropoff",
      lat: extractedData.dropoffAddress.lat,
      lng: extractedData.dropoffAddress.lng,
    });
  }
  let totalWeight = extractedData.packages.reduce((sum, val) => {
    return (sum += parseFloat(val.weight));
  }, 0);
  // converting the weight (from app units to base units)

  let convertedTotalWeight = unitConversions(
    totalWeight,
    appUnitData.weightUnit.conversionRate
  );
  const bookingData = await booking.create({
    // receiver is the person creating the order
    receiverName: extractedData.receiverName,
    receiverEmail: extractedData.receiverEmail,
    receiverPhone: extractedData.receiverPhone,
    senderName: extractedData.receiverName,
    senderEmail: extractedData.receiverEmail,
    senderPhone: extractedData.receiverPhone,
    // TODO update the following
    discount: 0,
    logisticCompanyId: 8,
    status: true,
    weight: convertedTotalWeight,
    rated: "pending",
    dropoffAddressId: dropoffAddress.id,
    pickupAddressId: pickupAddress.id,
    appUnitId: appUnitData.id,
    bookingStatusId: 1,
    bookingTypeId: 1,
  });
  // updatng the booking to create a unique tracking ID
  let trackingId = otpGenerator.generate(6, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: true,
    specialChars: false,
  });
  trackingId = `TSH-${bookingData.id}-${trackingId}`;

  let charge = 0.0;
  if (convertedTotalWeight > 0 && convertedTotalWeight < 20) {
    charge = 12.0;
  } else if (convertedTotalWeight >= 20 && convertedTotalWeight <= 150) {
    charge = 20.0;
  }
  await booking.update(
    {
      trackingId,
      subtotal: charge,
      total: charge,
      barcode: `Public/Barcodes/${trackingId}.png`,
    },
    { where: { id: bookingData.id } }
  );
  // creating Booking History
  let dt = Date.now();
  let DT = new Date(dt);
  let currentDate = `${DT.getFullYear()}-${("0" + (DT.getMonth() + 1)).slice(
    -2
  )}-${("0" + DT.getDate()).slice(-2)}`;
  let currentTime = `${DT.getHours()}:${DT.getMinutes()}:${DT.getSeconds()}`;
  await bookingHistory.create({
    date: currentDate,
    time: currentTime,
    bookingId: bookingData.id,
    bookingStatusId: 1,
  });

  // adding packages to table
  // manipulating packages

  let convertedPackages = extractedData.packages.map((data) => {
    // making conversions
    // data.length = unitConversions(
    //   data.length,
    //   appUnitData.lengthUnit.conversionRate
    // );
    // data.width = unitConversions(
    //   data.width,
    //   appUnitData.lengthUnit.conversionRate
    // );
    // data.height = unitConversions(
    //   data.height,
    //   appUnitData.lengthUnit.conversionRate
    // );
    data.weight = unitConversions(
      data.weight,
      appUnitData.weightUnit.conversionRate
    );
    // calculating volume
    // data.volume = data.length * data.width * data.height;
    // adding status
    data.status = true;
    data.bookingId = bookingData.id;
    return data;
  });
  package.bulkCreate(convertedPackages);

  return res.json(returnFunction("1", "Order Created", {}, ""));
}

function extractOrderData(order) {
  const extractedData = {
    receiverName: order.customer.first_name + " " + order.customer.last_name,
    receiverEmail: order.contact_email,
    receiverPhone: order.customer.phone || order.shipping_address.phone,
    packages: order.line_items.map((item) => ({
      weight: item.grams * 0.00220462, // Assuming grams to LB conversion
    })),
    dropoffAddress: {
      streetAddress: order.shipping_address.address1,
      city: order.shipping_address.city,
      province: order.shipping_address.province,
      country: order.shipping_address.country,
      postalCode: order.shipping_address.zip,
      lat: order.shipping_address.latitude,
      lng: order.shipping_address.longitude,
    },
  };

  return extractedData;
}

async function checkBookingLimit(userId, res) {
  try {
    // Use the active plan (a user may have older canceled/expired rows)
    const bookingLimit = await userPlan.findOne({
      where: { userId: userId, subscriptionStatus: "Active" },
      order: [["id", "DESC"]],
    });

    if (!bookingLimit) {
      throw new CustomException("User doesn't have any subscription");
    }

    const buyDateRecord = bookingLimit;

    if (!buyDateRecord || !buyDateRecord.buyDate) {
      throw new CustomException("Subscription purchase date not found");
    }

    // Convert buyDate to a JavaScript Date object
    const buyDate = new Date(buyDateRecord.buyDate);

    // Current monthly period: the latest monthly anniversary of the
    // purchase date up to now, until one month after it
    const now = new Date();
    const startDate = new Date(buyDate);
    startDate.setUTCHours(0, 0, 0, 0);
    let months = 0;
    while (true) {
      const next = new Date(startDate);
      next.setUTCMonth(startDate.getUTCMonth() + months + 1);
      if (next > now) break;
      months++;
    }
    startDate.setUTCMonth(startDate.getUTCMonth() + months);

    const endDate = new Date(startDate);
    endDate.setUTCMonth(startDate.getUTCMonth() + 1);
    endDate.setUTCMilliseconds(-1); // End of the period

    const formattedStartDate = startDate.toISOString();
    const formattedEndDate = endDate.toISOString();

    const limit = bookingLimit.shipLimit;
    console.log("Limit ------>:", limit);

    const bookingCount = await booking.count({
      where: {
        customerId: userId,
        createdAt: {
          [sequelize.Op.between]: [formattedStartDate, formattedEndDate],
        },
      },
    });

    console.log("Start Date: ", formattedStartDate);
    console.log("End Date: ", formattedEndDate);
    console.log("Booking Count: ", bookingCount);

    if (bookingCount < limit) {
      console.log("Still not Completed Minimum  Booking");
      return bookingCount;
    } else {
      return bookingCount;
    }
  } catch (error) {
    return error;
  }
}

async function discountget(subscriptionId, localPlanActive = false) {
  //console.log("Subscription ID in function : ",subscriptionId);

  console.log("Subscription Id in function Discount Get-------------->");

  let subscription;
  try {
    subscription = await Braintree.getSubscriptionDetails(subscriptionId);
  } catch (error) {
    // E2E-B14: Braintree unreachable/failed. Only continue (no discount)
    // when the caller confirmed an Active local userPlan row.
    if (!localPlanActive) throw error;
    console.error(
      "Braintree getSubscriptionDetails failed, using discount 0:",
      error?.message
    );
    return 0;
  }
  console.log("Subscription Data in function --------------->: ", subscription);
  if (subscription.subscription.status === "Active") {
    // Plans without a Braintree discount have an empty discounts array
    const discounts = subscription.subscription.discounts || [];
    const discount = discounts.length > 0 ? discounts[0].amount : 0;
    return discount;
  } else {
    throw new CustomException("Your Subscription is Canceled or Expired");
  }
}
// Check Phone Number length
function isPhoneNumberInRange(phoneNumber) {
  const num = parseInt(phoneNumber, 10);

  // Check if the number is between 100 and 999
  if (phoneNumber.length === 10) {
    return true; // The number is within the range
  } else {
    return false; // The number is not within the range
  }
}

function applyPercentagediscount(originalPrice, discountAmount) {
  originalPrice = parseFloat(originalPrice);
  discountAmount = parseFloat(discountAmount);
  if (
    originalPrice <= 0 ||
    discountAmount < 0 ||
    discountAmount > originalPrice
  ) {
    throw new CustomException("Invalid Values");
  }

  const discountPercent = (discountAmount / 100) * originalPrice;

  console.log("Discount Amount Percent-------->", discountPercent);

  const finalPrice = originalPrice - discountPercent;

  console.log("Discount Amount Percent-------->", finalPrice);

  return finalPrice;
}

function convertToCents(amount) {
  return Math.round(amount * 100);
}

async function findLanguage(userId) {
  const findLanguage = await user.findOne({
    where: {
      id: userId,
    },
    attributes: ["languageCheck"],
  });
  console.log("🚀 ~ findLanguage ~ findLanguage:", findLanguage.languageCheck);

  return findLanguage.languageCheck;
}


function convertToDollars(cents) {
  return (cents / 100).toFixed(2);
}

//===========checkout Sessions=================//
async function checkoutSessionsCheck(req, res) {
  const { amount, bookingType, bookingId,successUrl,cancelUrl} = req.body;
  console.log("req.body in ==============================>", req.body);
  const UserId = req.user.id;

  const userData = await user.findOne({ where: { id: UserId } });
  await ensureStripeCustomerId(userData);
  let ammount = convertToCents(amount);

  const session = await stripeFunction.checkoutSessions(
    ammount,
    userData.stripeCustomerId,
    bookingType,
    bookingId,
    successUrl,
    cancelUrl
  );

  return res.json(returnFunction("1", "Session Created", session));
}

//========================Paid booking finalisation (webhook + confirmCheckout)========================//
// On staging (RDS) the JSON `label` column comes back as its raw JSON text, e.g.
// "\"https://...\"" or "[{\"label\":...}]", instead of the parsed value.
function decodeJsonColumn(value) {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!/^["[{]/.test(trimmed)) return value;
  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
}

// booking.label is a plain URL string for local (type 6) bookings, an array of
// { label } for international (type 1), and null until the FedEx shipment exists.
function normalizeLabels(label) {
  const value = decodeJsonColumn(label);
  if (!value) return [];
  if (typeof value === "string") return [{ label: value }];
  if (Array.isArray(value)) return value.filter((entry) => entry && entry.label);
  return [];
}

// What FedEx charged for the shipment(s), for information only (it doesn't change the
// business share). null when the Ship API response has no rating details.
function fedexShippingCost(responses) {
  let total = 0;
  let found = false;
  for (const response of responses || []) {
    for (const shipment of response?.output?.transactionShipments || []) {
      const rate = shipment?.completedShipmentDetail?.shipmentRating?.shipmentRateDetails?.[0];
      let charge = rate?.totalNetCharge;
      if (charge && typeof charge === "object") charge = charge.amount;
      if (charge == null) {
        const pieces = (shipment.pieceResponses || [])
          .map((piece) => piece.netChargeAmount)
          .filter((value) => value != null);
        if (pieces.length) charge = pieces.reduce((sum, value) => sum + Number(value), 0);
      }
      if (charge != null && !Number.isNaN(Number(charge))) {
        total += Number(charge);
        found = true;
      }
    }
  }
  return found ? Math.round(total * 100) / 100 : null;
}

// Records the payment and creates the FedEx shipment/label for a paid booking.
// Safe to call more than once (Stripe retries, webhook + success page both firing):
// an existing label is returned as-is and payment rows are only written once.
// The payment is recorded before the FedEx call, so if FedEx fails the booking is
// still paid and "Ready to Ship" and a later call only retries the shipment.
async function finalizePaidBooking(bookingID, amount) {
  const bookingData = await booking.findOne({
    where: { id: bookingID },
    include: [
      {
        model: addressDBS,
        as: "pickupAddress",
        attributes: [
          "streetAddress",
          "building",
          "floor",
          "apartment",
          "district",
          "city",
          "province",
          "country",
          "postalCode",
        ],
      },
      {
        model: addressDBS,
        as: "dropoffAddress",
        attributes: [
          "streetAddress",
          "building",
          "floor",
          "apartment",
          "district",
          "city",
          "province",
          "country",
          "postalCode",
        ],
      },
      {
        model: package,
        attributes: {
          exclude: [
            "barcode",
            "total",
            "status",
            "createdAt",
            "updatedAt",
            "bookingId",
            "ecommerceCompanyId",
            "categoryId",
          ],
        },
      },
    ],
  });
  if (!bookingData) throw new CustomException("Booking not found");

  const existingLabels = normalizeLabels(bookingData.label);
  if (existingLabels.length > 0) return existingLabels;

  const status = await bookingStatus.findOne({
    where: {
      title: "Ready to Ship",
    },
  });

  if (!bookingData.paymentConfirmed) {
    bookingData.paymentConfirmed = true;
    bookingData.bookingStatusId = status.id;
    await bookingData.save();
  }

  const historyExists = await bookingHistory.findOne({
    where: { bookingId: bookingID, bookingStatusId: status.id },
  });
  if (!historyExists) {
    let dt = Date.now();
    let DT = new Date(dt);
    let currentDate = `${DT.getFullYear()}-${DT.getMonth() + 1
      }-${DT.getDate()}`;
    let currentTime = `${DT.getHours()}:${DT.getMinutes()}:${DT.getSeconds()}`;
    await bookingHistory.create({
      date: currentDate,
      time: currentTime,
      bookingId: bookingID,
      bookingStatusId: status.id,
    });
  }

  const walletExists = await wallet.findOne({
    where: { bookingId: bookingID, description: "User Paid" },
  });
  if (!walletExists) {
    await wallet.create({
      amount: amount,
      bookingId: bookingID,
      userId: bookingData.customerId,
      description: "User Paid",
    });
  }

  // Local orders are delivered by FedEx (no driver and no "delivered" event), so the
  // business share — the full amount paid — is recorded when the payment is.
  if (bookingData.bookingTypeId == 6) {
    await recordAdminEarning(bookingID);
  }

  // Call function to create FedEx shipment and schedule pickup
  if (bookingData.bookingTypeId == 6) {
    const fedexShipment = await createFedexShipmentLoc(bookingData);
    const trackingNumber = fedexShipment.data.output.transactionShipments[0].pieceResponses[0].trackingNumber;
    const label = fedexShipment.data.output.transactionShipments[0].pieceResponses[0].packageDocuments[0].url;

    bookingData.logisticCompanyTrackingNum = trackingNumber;
    bookingData.label = label;
    bookingData.subTotal = amount;
    bookingData.total = amount;
    const shippingCost = fedexShippingCost([fedexShipment.data]);
    if (shippingCost !== null) bookingData.shippingCost = shippingCost;
    await bookingData.save();

    for (let i = 0; i < bookingData.packages.length; i++) {
      const pkg = bookingData.packages[i];
      await pkg.update({
        logisticCompanyTrackingNum: trackingNumber,
        fedexLabel: label
      })
    }
    return normalizeLabels(label);
  }

  if (bookingData.bookingTypeId == 1) {
    const fedexShipment = await createFedexShipmentInt(bookingData);
    if (!Array.isArray(fedexShipment) || fedexShipment.length === 0) {
      throw new CustomException("FedEx shipment could not be created");
    }
    const extractedShipments = fedexShipment.map((shipment) => {
      const transactionShipment = shipment.output.transactionShipments[0];
      return {
        trackingNumber:
          transactionShipment.pieceResponses[0].trackingNumber,
        label:
          transactionShipment.pieceResponses[0].packageDocuments[0].url,
      };
    });

    bookingData.logisticCompanyTrackingNum =
      extractedShipments.map((track) => ({
        trackingNumber: track.trackingNumber
      }));
    bookingData.label = extractedShipments.map((shipment) => ({
      label: shipment.label
    }));
    const shippingCost = fedexShippingCost(fedexShipment);
    if (shippingCost !== null) bookingData.shippingCost = shippingCost;
    await bookingData.save();

    for (let i = 0; i < bookingData.packages.length; i++) {
      const pkg = bookingData.packages[i];
      await pkg.update({
        logisticCompanyTrackingNum: extractedShipments[i].trackingNumber,
        fedexLabel: extractedShipments[i].label
      })
    }
    return normalizeLabels(bookingData.label);
  }

  return [];
}

//========================Stripe Webhooks for Session Completed========================//
async function stripeWebhook(req, res) {
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!endpointSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured');
    return res.status(500).send('Webhook secret not configured');
  }
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.log(`Error deconstructing event: ${err.message}`);
    return res.status(400).send(`Error deconstructing event: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    try {
      await finalizePaidBooking(
        session.metadata.bookingId,
        convertToDollars(session.metadata.real_amount)
      );
    } catch (err) {
      // Non-2xx makes Stripe retry; finalizePaidBooking is idempotent.
      console.error(`stripeWebhook: booking ${session.metadata.bookingId} not finalised: ${err.message}`);
      return res.status(500).send('Booking could not be finalised');
    }
  }

  return res.json({ received: true });
}

// Called by the payment-success page so the label doesn't depend on the webhook arriving.
async function confirmCheckout(req, res) {
  const { sessionId, bookingId } = req.body;
  if (!sessionId || !bookingId) {
    return res.json(returnFunction("0", "", {}, "Missing payment session"));
  }

  const found = await booking.findOne({
    where: { id: bookingId, customerId: req.user.id },
    attributes: ["id"],
  });
  if (!found) {
    return res.json(returnFunction("0", "", {}, "Order not found"));
  }

  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (err) {
    return res.json(returnFunction("0", "", {}, "Unable to verify payment"));
  }
  if (String(session?.metadata?.bookingId) !== String(bookingId)) {
    return res.json(returnFunction("0", "", {}, "Payment does not match this order"));
  }
  if (session.payment_status !== "paid") {
    return res.json(returnFunction("0", "", {}, "Payment is still pending"));
  }

  const labels = await finalizePaidBooking(
    bookingId,
    convertToDollars(session.metadata.real_amount)
  );
  return res.json(returnFunction("1", "Booking Label", { labels }, ""));
}


//===========Get Sesion=====================>

async function retrieveSession(req, res) {
  const sessionId = req.query.sessionId;
  console.log("🚀 ~ retrieveSession ~ sessionId:", sessionId)
  const bookingId = req.query.bookingId;
  console.log("req.query.bookingId=================>", req.query.bookingId)
  const amount = req.query.amount;

  const sesionFind = await stripeFunction.retrieveCheckoutSession(sessionId);
  console.log("🚀 ~ retrieveSession ~ sesionFind:", sesionFind);

  if (sesionFind === "paid") {
    const bookingData = await booking.findOne({
      where: { id: bookingId },
      include: [
        {
          model: addressDBS,
          as: "pickupAddress",
          attributes: [
            "streetAddress",
            "building",
            "floor",
            "apartment",
            "district",
            "city",
            "province",
            "country",
            "postalCode",
          ],
        },
        {
          model: addressDBS,
          as: "dropoffAddress",
          attributes: [
            "streetAddress",
            "building",
            "floor",
            "apartment",
            "district",
            "city",
            "province",
            "country",
            "postalCode",
          ],
        },
        {
          model: package,
          attributes: {
            exclude: [
              "barcode",
              "total",
              "status",
              "createdAt",
              "updatedAt",
              "bookingId",
              "ecommerceCompanyId",
              "categoryId",
            ],
          },
        },
      ],
    });
    const status = await bookingStatus.findOne({
      where: {
        title: "Ready to Ship",
      },
    });
    let dt = Date.now();
    let DT = new Date(dt);
    let currentDate = `${DT.getFullYear()}-${DT.getMonth() + 1
      }-${DT.getDate()}`;
    let currentTime = `${DT.getHours()}:${DT.getMinutes()}:${DT.getSeconds()}`;
    await bookingHistory.create({
      date: currentDate,
      time: currentTime,
      bookingId,
      bookingStatusId: status.id,
    });
    // Call function to create FedEx shipment and schedule pickup
    console.log(" Fedex local function Call------------>");

    if (bookingData.bookingTypeId == 6) {
      const fedexShipment = await createFedexShipmentLoc(bookingData);
      const trackingNumber = fedexShipment.data.output.transactionShipments[0].pieceResponses[0].trackingNumber;
      const label = fedexShipment.data.output.transactionShipments[0].pieceResponses[0].packageDocuments[0].url;



      bookingData.logisticCompanyTrackingNum = trackingNumber;
      bookingData.label = label
      bookingData.subTotal = amount;
      bookingData.total = amount;
      bookingData.paymentConfirmed = true;
      bookingData.bookingStatusId = status.id;
      bookingData.save();

      for (let i = 0; i < bookingData.packages.length; i++) {
        const pkg = bookingData.packages[i];
        await pkg.update({
          logisticCompanyTrackingNum: trackingNumber,
          fedexLabel: label
        })
      }


      const outObj = {
        logisticCompanyTrackingNum: [
          { trackingNumber: trackingNumber }
        ],
        label: [
          { label: label }
        ]
      };


      const response = returnFunction(
        "1",
        "Payment successfully Done",
        outObj,
        ""
      );
      return res.json(response);
    } else if (bookingData.bookingTypeId == 1) {
      const fedexShipment = await createFedexShipmentInt(bookingData);

      console.log("FEDEX SHIPMENT DATA:-------> ", fedexShipment);

      if (Array.isArray(fedexShipment) && fedexShipment.length > 0) {
        const extractedShipments = fedexShipment.map((shipment) => {
          const transactionShipment = shipment.output.transactionShipments[0];
          return {
            trackingNumber:
              transactionShipment.pieceResponses[0].trackingNumber,
            label:
              transactionShipment.pieceResponses[0].packageDocuments[0].url,
          };
        });
        console.log("extractedShipments===========================>", extractedShipments)

        // If bookingData needs to store only the first shipment
        bookingData.logisticCompanyTrackingNum =
          extractedShipments.map((track) => ({
            trackingNumber: track.trackingNumber
          }));
        bookingData.label = extractedShipments.map((shipment) => ({
          label: shipment.label
        }));
        bookingData.paymentConfirmed = true;
        bookingData.bookingStatusId = status.id;
        await bookingData.save();


        for (let i = 0; i < bookingData.packages.length; i++) {
          const pkg = bookingData.packages[i];
          await pkg.update({
            logisticCompanyTrackingNum: extractedShipments[i].trackingNumber,
            fedexLabel: extractedShipments[i].label
          })
        }

        let outObj = {
          logisticCompanyTrackingNum: extractedShipments.map((track) => ({
            trackingNumber: track.trackingNumber
          })),
          label: extractedShipments.map((shipment) => ({
            label: shipment.label
          })),
          //allShipments: extractedShipments, // Optionally return all extracted shipments
        };

        const response = returnFunction(
          "1",
          "Payment successfully Done",
          outObj,
          ""
        );
        return res.json(response);
      }
    }
  } else {

    throw new CustomException("Session retrived But Payment Pending")

  }
}

//========================App payment (Stripe PaymentSheet)========================//
// Creates the PaymentIntent the customer app confirms with the PaymentSheet. The
// amount is the booking total and the booking id is kept in the metadata, so
// intentGet can check the payment really belongs to the order it finalises.
async function createPaymentIntent(req, res) {
  const { bookingId } = req.body;
  if (!bookingId) {
    return res.json(returnFunction("0", "", {}, "Missing order"));
  }

  const bookingData = await booking.findOne({
    where: { id: bookingId, customerId: req.user.id },
    attributes: ["id", "total", "paymentConfirmed"],
  });
  if (!bookingData) {
    return res.json(returnFunction("0", "", {}, "Order not found"));
  }
  if (bookingData.paymentConfirmed) {
    return res.json(
      returnFunction("0", "", {}, "This order has already been paid.")
    );
  }
  const amount = convertToCents(bookingData.total);
  if (!(amount > 0)) {
    return res.json(
      returnFunction("0", "", {}, "This order has no price yet.")
    );
  }

  const intent = await stripe.paymentIntents.create({
    amount,
    currency: "usd",
    payment_method_types: ["card"],
    metadata: { bookingId: String(bookingData.id), customerId: String(req.user.id) },
  });

  return res.json(
    returnFunction("1", "Payment intent created", {
      id: intent.id,
      client_secret: intent.client_secret,
      amount: convertToDollars(intent.amount),
    }, "")
  );
}

// Called by the customer app after the PaymentSheet succeeds. The paid amount is
// taken from Stripe, never from the request, and finalizePaidBooking is idempotent,
// so the app's retries can't create a second payment row or FedEx shipment.
async function intentGet(req, res) {
  const intentId = req.query.intentId;
  const { bookingId } = req.body;
  if (!intentId || !bookingId) {
    return res.json(returnFunction("0", "", {}, "Missing payment details"));
  }

  const found = await booking.findOne({
    where: { id: bookingId, customerId: req.user.id },
    attributes: ["id", "total"],
  });
  if (!found) {
    return res.json(returnFunction("0", "", {}, "Order not found"));
  }

  let intent;
  try {
    intent = await stripe.paymentIntents.retrieve(intentId);
  } catch (err) {
    return res.json(returnFunction("0", "", {}, "Unable to verify payment"));
  }
  if (String(intent?.metadata?.bookingId) !== String(bookingId)) {
    return res.json(
      returnFunction("0", "", {}, "Payment does not match this order")
    );
  }
  if (intent.status !== "succeeded") {
    return res.json(returnFunction("0", "", {}, "Payment is still pending"));
  }

  const labels = await finalizeAppPayment(bookingId, intent, found.total);
  return res.json(returnFunction("1", "Payment successfully Done", { labels }, ""));
}

// Records a succeeded card payment (app PaymentSheet or saved/new card) on its booking:
// the paid amount comes from Stripe, the intent id is kept for refunds, and
// finalizePaidBooking does the rest. A FedEx-only failure still counts as paid (the
// payment is recorded before the FedEx call); the next call retries the label.
async function finalizeAppPayment(bookingId, intent, bookingTotal) {
  const paidAmount = convertToDollars(intent.amount_received);
  if (paidAmount !== convertToDollars(convertToCents(bookingTotal))) {
    console.warn(
      `booking ${bookingId} total ${bookingTotal} differs from paid ${paidAmount} (${intent.id})`
    );
  }

  await booking.update({ captureId: intent.id }, { where: { id: bookingId } });

  try {
    return await finalizePaidBooking(bookingId, paidAmount);
  } catch (err) {
    const paid = await booking.findOne({
      where: { id: bookingId },
      attributes: ["paymentConfirmed"],
    });
    if (!paid?.paymentConfirmed) throw err;
    console.error(`booking ${bookingId} paid but FedEx shipment failed: ${err.message}`);
    return [];
  }
}

//==================================Track Fedex Order===========================================================//
async function trackFedexOrder(req, res) {
  const { trackingNumber } = req.body;
  const fedexShipment = await fedex.trackFedExPackage(trackingNumber);
  console.log("��� ~ trackFedexOrder ~ fedexShipment:", fedexShipment)
  return res.json(returnFunction("1", "Fedex Order Details", fedexShipment));
}



function isValidPostalCodeRange(postalCode, country) {
  let isValid = false;
  if (country === "USA" || country === "United States") {
    const zip = parseInt(postalCode, 10);
    isValid = zip >= 501 && zip <= 99950; // USA range
  } else if (country === "Puerto Rico" || country === "PR") {
    const zip = parseInt(postalCode, 10);
    isValid = zip >= 601 && zip <= 988; // Puerto Rico range
  } else {
    throw new CustomException("Invalid postal code")
  }
  return isValid;
}


//---------------------------------------------------------------//
module.exports = {
  // userFunctions
  idsFunction,
  generateUniqueVirtualBoxNumber,
  textSearchAddress,
  couponCheck,
  chargeCalculation,
  findNearestWarehouse,
  getNextPostalCode,
  //AUTH
  sendOTP,
  resendOTP,
  verifyOTPforSignUp,
  registerUser,
  signInUser,
  forgetPasswordRequest,
  verifyOTPforPassword,
  changePasswordOTP,
  session,
  logout,
  deleteUser,
  guestUser,
  // Homepage
  homepage,
  shippingCalculater,
  idsForBooking,
  logisticCompanies,
  searchAddress,
  checkCouponValidity,
  fetchRestrictedItems,
  getcharges,
  createOrderInt,
  dropOfAddress,
  createOrderLoc,
  reschedulePickup,
  cancelBooking,
  cancelbookingReacons,
  expectedPackages,
  packagesInWarehouse,
  sentPackages,
  scheduleDropoff,
  scheduleDropoffByWeb,
  // Drawer

  getProfile,
  updateProfile,
  myOrders,
  chooseLogisticCompany,
  orderDetails,
  attachAddressToUser,
  addAddress,
  savedAddressesOfUser,
  changeDefaultAddress,
  unattachAddressToUser,
  supportData,
  downloadPDF,
  updatePassword,

  // Rating
  addSkipRating,
  unRatedBookings,

  // shopify
  allProducts,
  Orders,
  shopifyOrderDetails,
  shopifyOrder,
  // Payment Gateway
  initatePayment,
  capturePayment,
  GetCustomercards,
  deletecards,
  makepaymentBySavedCard,
  makepaymentbynewcard,
  addCard,
  // TrackingId
  downloadLabel,
  bookingDetailsByTracking,
  payment,
  //downloadLabelDEMO
  checkoutSessionsCheck,
  registerUserMobile,
  changeLanguageApi,
  retrieveSession,
  createPaymentIntent,
  intentGet,
  stripeWebhook,
  confirmCheckout,
  trackFedexOrder
};


// sdfdsfsdfsdf