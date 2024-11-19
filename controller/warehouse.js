require("dotenv").config();
//importing Models
const {
  onGoingOrder,
  warehouse,
  booking,
  size,
  inWarehouseLocation,
  shipmentType,
  unit,
  merchantOrder,
  bookingStatus,
  deliveryType,
  addressDBS,
  warehouseZones,
  productOrder,
  merchantOrderStatuses,
  warehouseinventories,
  merchantcustomerorders,
  user,
  role,
  permission,
  feature,
  products,
  category,
  bookingHistory,
  deviceToken,
  coupon,
  mblAppDynamic,
  billingDetails,
  estimatedBookingDays,
  wallet,
  vehicleType,
  vehicleImage,
  driverDetail,
  inTransitGroups,
  bookingType,
  corregimiento,
  province,
  district,
  defaultUnit,
  otpVerification,
  appUnits,
  units,
  ecommerceCompany,
  package,
  driverType,
  logisticCompany,
} = require("../models");
//!GET DISTANCE
const getDistance = require("../utils/distanceCalculator");
///! Emails
const arriveUsaMail = require("../helper/arrivedAtLocalHub");
const toTransitMail = require("../helper/inTransit");
const arrivedOrderMail = require("../helper/arrived");
const selfPickupMail = require("../helper/selfPickup");
const dispatchMail = require("../helper/dispatch");
const deliveredMail = require("../helper/orderDelivery");
const handOverToCustomerMail = require("../helper/handOverToCustomer");
const remeasurementMail = require("../helper/remeasurements");
// Importing Custom exception
const CustomException = require("../middleware/errorObject");
//importing redis
const redis_Client = require("../routes/redis_connect");
const { sign } = require("jsonwebtoken");
// OTP generator
const otpGenerator = require("otp-generator");
const sendNotification = require("../helper/throwNotification");
//const stripe = require('stripe')(process.env.STRIPE_KEY);
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
// Calling mailer
const nodemailer = require("nodemailer");
const sequelize = require("sequelize");
// user defined functions
const {
  idsFunction,
  textSearchAddress,
  chargeCalculation,
  findNearestWarehouse,
} = require("../controller/customer");
// Barcode generator
var JsBarcode = require("jsbarcode");
var fs = require("fs");
var path = require("path");
var CryptoJS = require("crypto-js");
//var { createCanvas } = require("canvas");
// Defining the account for sending email

const { DOMImplementation, XMLSerializer } = require("xmldom");
const xmlSerializer = new XMLSerializer();
const document = new DOMImplementation().createDocument(
  "http://www.w3.org/1999/xhtml",
  "html",
  null
);
const svgNode = document.createElementNS("http://www.w3.org/2000/svg", "svg");
const svg2img = require("svg2img");
const { getDriverEarning, disableVehicImage } = require("./driver");
const { registerUserEmail, createBooking } = require("../helper/emailsHtml");
const axios = require("axios");
const e = require("cors");
const {
  currentAppUnitsId,
  unitsConversion,
  unitsSymbolsAndRates,
  convertToBaseUnits,
} = require("../utils/unitsManagement");
const {
  adminEarning,
  couponCheck,
  returnFunction,
  replaceEmptyStringsWithNull,
  customBarcodeGenerator,
  customMultipleInvoicesGenerator,
  customInvoiceOutputGenerator,
  adminPercentage,
  getDateAndTime,
  calculateWeights,
  journeyTrack, calculateTotalValues
} = require("../utils/helperFuncCompany");
const { type } = require("os");
const { create } = require("domain");
const transporter = require("../helper/transporter");
const fedex = require('../controller/fedex');
const arrived = require("../helper/arrived");


// ! Module 1: AUTH______________________________________________________________________________________


async function distanceCalculator(req, res) {
  //TODO Created At Format in pickupDelivery and scheduleDelivery
  //TODO (Create a Function) Change every undefined and null to ''
  const { startLocation, endLocation } = req.body;
  const start = startLocation.split(",");
  const end = endLocation.split(",");
  const distance = await getDistance(start[0], start[1], end[0], end[1]);
  return res.json(distance);
}

async function emailTesting(req, res) {

  const bookingData = await booking.findOne({
    where: { id: 293 },
    attributes: [
      "id",
      "trackingId",
      "scheduleSetBy",
      "receiverEmail",
      "bookingTypeId",
      "deliveryTypeId",
      "bookingStatusId",
      "consolidation",
      "createdAt"
    ],
    include: [
      { model: package },
      { model: logisticCompany, attributes: ['title'] },
      {
        model: user,
        as: "customer",
        include: { model: deviceToken, attributes: ["tokenId"] },
        attributes: ["id", "email", "firstName"],
      },
    ],
  });

  const weightData = calculateWeights(bookingData.packages)
  const timestamp = bookingData.createdAt;
  const datePortion = String(timestamp).substring(4, 15);
  const consolidation = bookingData.consolidation ? 'Yes' : 'No';

  //  var arrived = bookingData.packages.filter((ele) => ele.arrived == "arrived");
  //  const totalWeight = calculateWeights(arrived);
  //  const to  = ['sigidevelopers@gmail.com'];  
  //  let name = bookingData.receiverName
  //  if(bookingData.customer){
  //     to.push(bookingData.customer.email)
  //     name = bookingData.customer.firstName
  //  }else{
  //   to.push(bookingData.receiverEmail)
  //  }
  // const consolidation  = bookingData.consolidation?'Yes':'No';
  //  const createdAt = String(bookingData.createdAt).substring(4, 15);





  arrivedOrderMail(
    [bookingData.customer.email, 'sigidevelopers@gmail.com'],
    bookingData.customer.firstName,
    String(bookingData.trackingId),
    String(bookingData.packages.length).padStart(2, 0),
    String(weightData.chargedWeight),
    bookingData.logisticCompany.title,
    datePortion,
    consolidation
  )











  //  deliveredMail(to,name,bookingData.trackingId,arrived.length,bookingData.logisticCompany.title,consolidation,totalWeight.chargedWeight,bookingData.total,bookingData.dropoffAddress)
  //  (email,name,orderNumber,packeges,consolidation,billableWeight)
  return res.json({ bookingData })

  // let pack = await package.findByPk(345, {
  //   include: [{
  //     model: booking,

  //     include: [{
  //       model: user,
  //       as: "customer",
  //       include: { model: deviceToken, attributes: ["tokenId"] },
  //     },{model:logisticCompany,attributes:['title']}],
  //   },{model:ecommerceCompany,attributes:['title']}],
  // });
  // const consolidation = pack.booking.consolidation == true ?'yes':'no' ;
  // arriveUsaMail([pack.booking.customer.email,'sigidevelopers@gmail.com'],
  //   pack.booking.customer.firstName,
  //   188,
  //   '3/4',
  //   '1',
  //   consolidation,
  //   'company','createdat','supportEmail','supportNumber') 


  // const bookingData = await booking.findAll({
  //   where: { id: 188},
  //   attributes: [
  //     "id",
  //     "trackingId",
  //     "scheduleSetBy",
  //     "receiverEmail",
  //     "bookingTypeId",
  //     "deliveryTypeId"
  //   ],
  //   include: [
  //     {model: package},
  //     {model: logisticCompany,attributes:['title']},
  //     {
  //     model: user,
  //     as: "customer",
  //     include: { model: deviceToken, attributes: ["tokenId"] },
  //     attributes: ["id", "email","firstName"],
  //   },
  // ],
  // });
  // bookingData.map(async(ele) => {
  //   const  weightData = calculateWeights(ele.packages)
  //   const timestamp = bookingData.createdAt;
  //   const datePortion = String(timestamp).substring(4, 15);
  // arrivedOrderMail(
  //   ele.customer.email,
  //   ele.customer.firstName,
  //   String(ele.trackingId),
  //   String(ele.packages.length).padStart(2, 0),
  //   String(weightData.chargedWeight),
  //   ele.logisticCompany.title,
  //   datePortion
  // )
  // })

}

/*
 *  1. SignUp Step 1 ___________________
 */
async function notficationsTesting(req, res) {


  console.log("Notification Working------------------>")
  let notification = {
    title: `Booking needs to be scheduled`,
    body: 'testig notification',
  };
  const to = ['eJTK_StazypbwcUyMn_AeA:APA91bF7bZUiVCezJDGc5hpciB7Atq1oIAD6xt76rmf8NzCQem4YMnSltbztb9B8b2g_KtDCE-mFRx-Jc3MjVNX2GcAbvbgH3OBeiZzpt2Te3QptmUsIWmC7yYh-EJd1Ur9SdyXTrYWQ']
  console.log("ðŸš€ ~ file: warehouse.js:117 ~ notficationsTesting ~ notification.req.body.token:", req.body.token)
  const a = await sendNotification(to, notification, { id: 208, bookingStatusId: 10 });
  return res.json(returnFunction("1", "Sucess", { a }, ""));
}

async function registerWarehouse(req, res) {
  const { email, password } = req.body;
  if (email === null || password === null) {
    throw CustomException("Empty", "Email or Password not Entered");
  }
  classifiedAs = 3; // Warehouse
  const entity = await warehouse.findOne({
    where: { email, classifiedAId: classifiedAs },
  }); //TODO deleted - missing in dB
  if (entity) {
    throw CustomException(
      "Already Exist",
      "Email already Exist try Another Eamil"
    );
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const company = await warehouse.create({
    email,
    password: hashedPassword,
    classifiedAId: classifiedAs,
    status: true,
  });
  const output = {
    id: company.id,
    email: company.email,
  };
  return res.json(returnFunction("1", "Success", output, ""));
}

/*
 *  2. SignUp Step 2   ____________________
 */

async function provideInfo(req, res) {
  const {
    id,
    companyName,
    companyEmail,
    countryCode,
    phoneNum,
    postalCode,
    country,
    province,
    district,
    city,
    completeAddress,
  } = req.body;
  const entity = await addressDBS.findOne({
    where: {
      warehouseId: id,
      country,
      province,
      district,
      city,
      streetAddress: completeAddress,
    },
  });
  if (entity) {
    throw CustomException(
      "Already Exist",
      "You have already saved this Address"
    );
  }
  const companyAddress = await addressDBS.create({
    country,
    province,
    district,
    city,
    streetAddress: completeAddress,
    postalCode,
    warehouseId: id,
  });
  const companyInfo = await warehouse.update(
    {
      addressDBId: companyAddress.id,
      companyName,
      companyEmail,
      countryCode,
      phoneNum,
    },
    { where: { id: id } }
  );

  const output = {
    id: id,
    companyName: companyName,
  };

  return res.json(returnFunction("1", "Success", output, ""));
}

/*
 *  3. SignIn   __________________________
 */

async function signIn(req, res) {
  const { email, password, dvToken } = req.body;
  const companyData = await warehouse.findOne({
    where: {
      email, classifiedAId: {
        [Op.in]: [3, 5]
      }
    },
    include: {
      model: addressDBS,
      attributes: [
        "country",
        "province",
        "city",
        "district",
        "streetAddress",
        "lat",
        "lng",
      ],
    },
  });
  if (!companyData)
    throw new CustomException(
      "The email you are using to login is not available",
      "Please try again with a valid email"
    );
  // Checking the password
  const match = await bcrypt.compare(password, companyData.password);
  if (!match)
    throw new CustomException(
      "Bad credentials",
      "Please enter correct password to continue"
    );
  if (!companyData.phoneNum) {
    const output = {
      id: companyData.id,
      email: companyData.email,
    };
    return res.json(
      returnFunction("2", "Login Failed Company Info incomplete", output, "")
    );
  }
  // Checking the status
  if (!companyData.status)
    throw new CustomException(
      "Blocked by admin",
      "Please contact admin to continue"
    );
  await warehouse.update({ dvToken }, { where: { id: companyData.id } });
  // creating accessToken
  const accessToken = sign(
    { id: companyData.id, email: companyData.email, dvToken: dvToken },
    process.env.JWT_ACCESS_SECRET
  );
  //Adding the online clients to reddis DB for validation process
  redis_Client.hSet(`tsh${companyData.id}`, dvToken, accessToken);

  const output = {
    id: companyData.id,
    email: companyData.email,
    name: companyData.name,
    companyName: companyData.companyName,
    companyEmail: companyData.companyEmail,
    classifiedAId: companyData.classifiedAId,
    accessToken: accessToken,
    address: companyData.addressDB,
  };
  return res.json(returnFunction("1", "Login Successful", output, ""));
}

/*
 *  4. Sent OTP   _________________
 */

async function sendOTP(req, res) {
  const { email } = req.body;
  classifiedAId = 3;

  const warehouseExist = await warehouse.findOne({
    where: { email, classifiedAId, status: 1 },
    include: { model: otpVerification },
  });
  //   console.log("CHECK WAHRE HOUSE OBJECT",warehouseExist);
  if (!warehouseExist) {
    throw CustomException(
      "Not Found",
      "User with the following email does not exist."
    );
  }

  const OTP = otpGenerator.generate(6, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
  const OTPreqAt = Date.now();
  const OTPexpiryAt = OTPreqAt + 60000 * 30;

  await transporter.sendMail({
    from: process.env.EMAIL_USERNAME,
    to: email,
    subject: "Verification code for Truck Express",
    html: registerUserEmail({ name: email, OTP }),
    attachments: [
      {
        filename: "logo.png",
        path: `${__dirname}/logo.png`,
        cid: "logoImage",
      },
    ],
  });

  // console.log(warehouseExist.otpVerificationPanel);

  if (!warehouseExist.otpVerification) {
    const otpData = await otpVerification.create({
      OTP,
      reqAt: OTPreqAt,
      expiryAt: OTPexpiryAt,
      warehouseId: warehouseExist.id,
    });

    return res.json(
      returnFunction(
        "1",
        "OTP sent successfully",
        { otpId: otpData.id, warehouseId: warehouseExist.id },
        ""
      )
    );
  } else {
    await otpVerification.update(
      { OTP, reqAt: OTPreqAt, expiryAt: OTPexpiryAt, verifiedInForgetCase: 0 },
      { where: { warehouseId: warehouseExist.id } }
    );
    const otpData = await otpVerification.findOne({
      where: { warehouseId: warehouseExist.id },
    });

    return res.json(
      returnFunction(
        "1",
        "OTP sent successfully",
        { otpId: otpData.id, warehouseId: warehouseExist.id },
        ""
      )
    );
  }
}

/*
 *  5. verifyOTP  ___________________________________
 */

async function verifyOTP(req, res) {
  const { OTP, warehouseId } = req.body;
  const otpExist = await otpVerification.findOne({
    where: { OTP, warehouseId },
  });
  const DT = Date.now();
  if (!otpExist) {
    throw CustomException("Not Found", "WORNG OTP");
  }
  if (otpExist.expiryAt < DT) {
    throw CustomException("Expired", "OTP is Expired");
  }

  await otpVerification.update(
    { verifiedInForgetCase: 1 },
    { where: { warehouseId } }
  );

  return res.json(
    returnFunction(
      "1",
      "OTP Verified",
      { otpId: otpExist.id, warehouseId: otpExist.warehouseId },
      ""
    )
  );
}

/*
 *  6. PASSWORD RESET ___________________________________
 */

async function resetPassword(req, res) {
  const { password, id } = req.body;
  const otpExist = await otpVerification.findOne({
    where: { warehouseId: id, verifiedInForgetCase: 0 },
  });
  if (otpExist) {
    throw CustomException("OTP Not Verified", "Verify your OTP First!");
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  await warehouse.update({ password: hashedPassword }, { where: { id: id } });
  const output = {
    warehouseId: id,
  };
  return res.json(returnFunction("1", "Success", output, ""));
}

/*
        2. Profile 
*/
async function profileData(req, res) {
  const warehouseId = req.user.id;
  const warehouseData = await warehouse.findByPk(warehouseId, {
    include: {
      model: addressDBS,
      attributes: ["postalCode", "secondPostalCode", "lat", "lng"],
    },
    attributes: ["id", "name", "email", "countryCode", "phoneNum"],
  });
  return res.json(returnFunction("1", "Warehouse data", warehouseData, ""));
}

// ! Module 2: DashBoard
/*
            1. General Data
*/
async function generalDashboard(req, res) {
  const warehouseId = req.user.id;
  const bookingData = await booking.findAll({
    where: {
      [Op.or]: [
        { receivingWarehouseId: warehouseId },
        { deliveryWarehouseId: warehouseId },
      ],
      paymentConfirmed: true,
    },
  });
  let incoming = bookingData.filter(
    (ele) =>
      ele.receivingWarehouseId === warehouseId &&
      (ele.bookingStatusId === 1 ||
        ele.bookingStatusId === 2 ||
        ele.bookingStatusId === 3 ||
        ele.bookingStatusId === 4)
  );
  let outgoing = bookingData.filter(
    (ele) =>
      ele.deliveryWarehouseId === warehouseId &&
      (ele.bookingStatusId > 5 || ele.bookingStatusId !== 16)
  );
  let created = bookingData.filter(
    (ele) => ele.receivingWarehouseId === warehouseId && ele.customerId === null
  );
  let delivered = bookingData.filter(
    (ele) =>
      ele.deliveryWarehouseId === warehouseId && ele.bookingStatusId === 14
  );
  let cancelled = bookingData.filter(
    (ele) =>
      (ele.deliveryWarehouseId === warehouseId ||
        ele.receivingWarehouseId === warehouseId) &&
      ele.bookingStatusId === 15
  );
  let inTransit = bookingData.filter(
    (ele) =>
      (ele.deliveryWarehouseId === warehouseId ||
        ele.receivingWarehouseId === warehouseId) &&
      ele.bookingStatusId === 6
  );

  let retObj = {
    incoming: incoming.length,
    outgoing: outgoing.length,
    created: created.length,
    delivered: delivered.length,
    cancelled: cancelled.length,
    inTransit: inTransit.length,
  };
  return res.json(returnFunction("1", "Dashboard generic data", retObj, ""));
}
/*
            2. Recent Data
*/
async function getRecentActivity(req, res) {
  const warehouseId = req.user.id;
  //const defaultDistanceUnit = await defaultUnit.findOne({where: {type: 'distance', status: true}, attributes: ['symbol']})
  const defaultCurrencyUnit = await defaultUnit.findOne({
    where: { type: "currency", status: true },
    attributes: ["symbol"],
  });
  const recentOrders = await booking.findAll({
    where: { receivingWarehouseId: warehouseId, paymentConfirmed: true },
    order: [["createdAt", "DESC"]],
    limit: 3,
    include: {
      model: addressDBS,
      as: "pickupAddress",
      attributes: ["postalCode", "secondPostalCode"],
    },
    attributes: [
      "id",
      "trackingId",
      "pickupDate",
      "total",
      [
        sequelize.fn(
          "date_format",
          sequelize.col("booking.createdAt"),
          "%Y-%m-%d"
        ),
        "createdAt",
      ],
    ],
  });
  recentOrders.map((ele) => {
    ele.dataValues.currencyUnit = defaultCurrencyUnit.symbol;
  });
  return res.json(returnFunction("1", "Recent Data", recentOrders, ""));
}
// ! Module 3: Incoming Packages
//All Bookings.
async function getAllbookings(req, res) {
  if (req.query.bookingStatus)
    var statusIds = req.query.bookingStatus.split(",");
  let cond = {
    // status: 1,
    [Op.not]: [{ appUnitId: null }],
    bookingTypeId: null,
    consolidation: null,
  };

  if (req.query.deliveryType) cond.deliveryTypeId = req.query.deliveryType;
  req.query.bookingType
    ? (cond.bookingTypeId = req.query.bookingType * 1)
    : delete cond.bookingTypeId;
  req.query.consolidation
    ? (cond.consolidation = 1 * req.query.consolidation)
    : delete cond.consolidation;
  // console.log(cond);
  let statusCheck = { id: { [Op.lte]: 11 } }
  if (req.query.bookingStatus) statusCheck.id = statusIds;

  if (req.query.transitId) {
    const bookings = await inTransitGroups.findByPk(req.query.transitId, { attributes: ['bookingIds'] });
    let ids = bookings.bookingIds.split(",").map(Number);
    cond.id = ids;
    statusCheck = {};
    console.log(`condition is ${cond.id}  ids is  ${ids}`);
  }

  if (req.query.virtualBox) {
    const customer = await user.findOne({
      where: { virtualBox: req.query.virtualBox, userTypeId: 1 },
      attributes: [],
      include: { model: booking, as: 'customer', attributes: ['id'] }
    });
    if (!customer) {
      throw CustomException(
        "Customer Not Found",
        "Invalid Virtual Box Number"
      );
    }
    const ids = customer.customer.map(customer => customer.id);
    cond.id = ids;
    statusCheck = {};
  }

  let bookingData = await booking.findAll({
    where: {
      [Op.and]: [
        cond,
        req.query.bookingType
          ? {

            [Op.not]: [{ appUnitId: null }],
            bookingTypeId: req.query.bookingType,
          }
          : { [Op.not]: [{ appUnitId: null }] },
        {
          [Op.or]: [
            {
              "$receivingWarehouse.located$": req.query.located || {
                [Op.ne]: null,
              },
            },
            {
              "$deliveryWarehouse.located$": req.query.located || {
                [Op.ne]: null,
              },
            },
          ],
        },
      ],
    },
    include: [
      {
        model: bookingStatus,
        where: statusCheck,// status Check
        attributes: ["id", "title"],
      },
      {
        model: deliveryType,
        attributes: ["id", "title"],
      },
      {
        model: addressDBS,
        as: "dropoffAddress",
        attributes: ["id", "streetAddress", "district", "city", "province"],
      },
      // include:{ model: addressDBS, attributes: ['lat', 'lng'] }
      {
        model: warehouse,
        as: "receivingWarehouse",
        attributes: ["companyName", "located"],
      },
      {
        model: warehouse,
        as: "deliveryWarehouse",
        attributes: ["companyName", "located"],
      },
      {
        model: package,
        attributes: ["id", "arrived", "actualWeight", "actualVolume"],
      },
      {
        model: shipmentType,
        attributes: ["id", "title"],
      },
      {
        model: logisticCompany,
        attributes: ["id", "title", 'divisor'],
      },
      {
        model: user,
        as: "customer",
        attributes: ["virtualBox", "firstName", 'lastName', 'email', 'countryCode', 'phoneNum', 'image']
      },
      {
        model: appUnits,
        attributes: ["id"],
        include: [
          {
            model: units,
            as: "weightUnit",
            attributes: ["symbol", "conversionRate"],
          },
          {
            model: units,
            as: "lengthUnit",
            attributes: ["symbol", "conversionRate"],
          },
          {
            model: units,
            as: "distanceUnit",
            attributes: ["symbol", "conversionRate"],
          },
          {
            model: units,
            as: "currencyUnit",
            attributes: ["symbol", "conversionRate"],
          },
        ],
      },
    ],
    attributes: [
      "id",
      "trackingId",
      "weight",
      "volume",
      "height",
      "width",
      "length",
      "distance",
      "total",
      "createdAt",
      "appUnitId",
      "consolidation",
      'deliveryTypeId',
    ], // TODO  , 'totalWeight'
  });
  //   return res.json({count:bookingData.length,cond , statusIds , statusCheck})
  // return res.json({r:bookingData[0].receivingWarehouse.companyName,d:bookingData[0].deliveryWarehouse.companyName})
  let output = [];
  let outobj = {};
  for (let obj of bookingData) {
    var arrived = obj.packages.filter((ele) => ele.arrived == "arrived");
    var neverArrived = obj.packages.filter(
      (ele) => ele.arrived == "neverArrived"
    );
    var pending = obj.packages.filter((ele) => ele.arrived == "pending");
    let chargedWeight = 0;
    if (obj.consolidation == true) {
      const weight = calculateWeights([{ actualVolume: obj.volume, actualWeight: obj.weight }], obj.logisticCompany?.divisor)
      chargedWeight = weight.chargedWeight;
    } else {
      const weight = calculateWeights(obj.packages, obj.logisticCompany?.divisor)
      chargedWeight = weight.chargedWeight;
    }

    console.log(chargedWeight)
    outobj = {
      bookingData: {
        id: obj.id,
        trackingId: obj.trackingId,
        consolidation: obj.consolidation ? "Yes" : "No",
        virtualBoxNumber: obj.customer ? obj.customer.virtualBox : "",
        date: obj.createdAt,
        deliveryWarehouse: obj.deliveryWarehouse
          ? obj.deliveryWarehouse.companyName
          : "",
        receivingWarehouse: obj.receivingWarehouse
          ? obj.receivingWarehouse.companyName
          : "",
        distance: unitsConversion(
          obj.distance,
          obj.appUnit.distanceUnit.conversionRate
        ),
        total: obj.total,
        totalWeight: unitsConversion(
          obj.weight,
          obj.appUnit.weightUnit.conversionRate
        ),
      },
      packages: {
        total: obj.packages.length,
        arrived: arrived.length,
        neverArrived: neverArrived.length,
        pending: pending.length,
      },
      bookingStatus: obj.bookingStatus.title,
      bookingDeliveryType: {
        id: obj.deliveryType && obj.deliveryType.id,
        title: obj.deliveryType && obj.deliveryType.title,
      },
      dropoffAddress: obj.dropoffAddress
        ? {
          id: obj.dropoffAddress.id,
          streetAddress: obj.dropoffAddress.streetAddress,
          district: obj.dropoffAddress.district,
          city: obj.dropoffAddress.city,
          province: obj.dropoffAddress.province,
        }
        : {},
      shipmentType: obj.shipmentType
        ? {
          id: obj.shipmentType.id,
          title: obj.shipmentType.title,
        }
        : {},
      logisticCompany: obj.logisticCompany
        ? {
          id: obj.logisticCompany.id,
          title: obj.logisticCompany.title,
        }
        : {},
      chargedWeight,
      deliveryStatus: chargedWeight < 1000 && obj.deliveryTypeId == 1 ? 'Direct Delivery' : 'By Warehouse Delivery',
      unit: {
        weight: obj.appUnit.weightUnit.symbol,
        length: obj.appUnit.lengthUnit.symbol,
        distance: obj.appUnit.distanceUnit.symbol,
        currency: obj.appUnit.currencyUnit.symbol,
      },
    };
    output.push(outobj);
  }

  if (req.query.deliveryStatus) {
    let status = req.query.deliveryStatus;

    if (status == 'byWarehouse') output = output.filter(e => e.deliveryStatus == 'By Warehouse Delivery');
    if (status == 'direct') output = output.filter(e => e.deliveryStatus == 'Direct Delivery');

  }

  if (req.query.virtualBox) {
    output = { customer: bookingData[0].customer ? bookingData[0].customer : {}, bookings: output }
  }

  return res.json(returnFunction("1", "All Bookings", output, ""));
}
/*
//*  3. Get booking detail by booking id  ___________________________________
*/



async function checktrackingNumber(req, res) {

  const  trackNumber  = req.params.trackNumber
  console.log("REQ.PARAMS==================>",req.params)

  const findTracknumber = await booking.findOne({
    where: {
      trackingId: trackNumber,
    }
  })
  console.log("findTracknumber============================>",findTracknumber)

  if (!findTracknumber) {
    return res.json(returnFunction("1", "tracking Number not found", false))
  }

  return res.json(returnFunction("1", "Tacking number found",true))

}

async function bookingDetailsById(req, res) {
  try {
    let condition = { id: req.query.id }
    if (req.query.s) {
      condition = { trackingId: `${req.query.s}` }
    }
    console.log("condition===============================>",condition)
    // const warehouseId = req.user.id;
    let bookingData = await booking.findOne({
      where: condition,
      include: [
        { model: addressDBS, as: 'dropoffAddress', attributes: ['title', 'streetAddress', 'building', 'floor', 'apartment', 'district', 'city', 'province', 'country', 'postalCode', 'lat', 'lng'] },

        { model: warehouse, as: 'receivingWarehouse', attributes: ['id'], include: { model: addressDBS, attributes: ['title', 'streetAddress', 'building', 'floor', 'apartment', 'district', 'city', 'province', 'country', 'postalCode', 'lat', 'lng'] } },
        { model: warehouse, as: 'deliveryWarehouse', attributes: ['id'], include: { model: addressDBS, attributes: ['title', 'streetAddress', 'building', 'floor', 'apartment', 'district', 'city', 'province', 'country', 'postalCode', 'lat', 'lng'] } },

        {
          model: bookingHistory,
          include: { model: bookingStatus, attributes: ["id", "title"] },
          attributes: ["date", "time", "bookingStatusId"],
        },
        {
          model: user,
          as: "customer",
          attributes: ["virtualBox", "firstName", 'lastName', 'email', 'countryCode', 'phoneNum']
        },
        {
          model: deliveryType,
          attributes: ['title']
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
        { model: bookingStatus, attributes: ["id", "title"] },
        { model: bookingType, attributes: ["title"] },
        { model: logisticCompany, attributes: ["title", "logo", 'divisor'] },
        { model: shipmentType, attributes: ["title"] },
        { model: vehicleType, attributes: ["title"] },
        // {model: billingDetails, where :{[Op.not] : [{pickupDriverEarning :null}]} ,attributes: ['pickupDriverEarning']},//TODO
        {
          model: package,
          where: {
            arrived: {
              [Op.in]: ['arrived', 'pending']
            }
          },
          attributes: [
            "id",
            "trackingNum",
            "name",
            "email",
            "phone",
            "arrived",
            "ETA",
            "note",
            "weight",
            "length",
            "width",
            "height",
            "volume",
            "actualWeight",
            "actualLength",
            "actualWidth",
            "actualHeight",
            "actualVolume",
            'logisticCompanyTrackingNum',
          ],
          include: [
            { model: category, attributes: ["title"] },
            { model: ecommerceCompany, attributes: ["title", "description"] },
          ],
        },
        // {model: warehouse, as: 'receivingWarehouse', attributes: ['id']}
      ],
    });
       console.log("=============bookingData=============================",bookingData)
    //  return res.json(bookingData);
   
    const bookingId = bookingData.id;
    const units = await unitsSymbolsAndRates(bookingData.appUnitId);

    for (obj of bookingData.packages) {
      obj.weight = unitsConversion(obj.weight, units.conversionRate.weight);
      obj.length = unitsConversion(obj.length, units.conversionRate.length);
      obj.width = unitsConversion(obj.width, units.conversionRate.length);
      obj.height = unitsConversion(obj.height, units.conversionRate.length);
      obj.volume = unitsConversion(obj.volume, units.conversionRate.length);
      //TODO pending for actual weight and lenghts
    }

    let dType = 'selfPickup';
    if (bookingData.deliveryTypeId == 1) {
      const totalWeight = calculateWeights(bookingData.packages, bookingData.logisticCompany.divisor);

      if (totalWeight.chargedWeight < 1000) {
        dType = 'direct';
      } else if (bookingData.deliveryTypeId == 2 && bookingData.customerId == null) {
        dType = 'warehouseSelf'; // if created from warehouse and type is selfpickup
      } else {
        dType = 'byWarehouse';
      }
    }
    // ^  generating a array contain all booking statuses according to their state
    let statuses = journeyTrack(dType);
    console.log("ðŸš€ ~~ bookingDetailsById ~ journeytype:", dType)

    let historyArray = [];
    statuses.map((ele) => {
      //console.log(ele.id)
      let found = bookingData.bookingHistories.filter(
        (element) => element.bookingStatusId === ele.id
      );
      if (found.length > 0) {
        //console.log(found[0].dataValues.bookingStatus)
        let outObj = {
          bookingStatusId: found[0].bookingStatus.id,
          statusText: found[0].bookingStatus.title,
          description: ele.description,
          date: found[0].date,
          time: found[0].time,
          status: true,
        };
        historyArray.push(outObj);
      } else {
        let outObj = {
          bookingStatusId: ele.id,
          statusText: ele.title,
          description: ele.description,
          date: "",
          time: "",
          status: false,
        };
        historyArray.push(outObj);
      }
    });

    // return res.json({dType,historyArray,statuses:statuses,bookingData})
    //^ Gettings Units Symbols and conversion Rates Of this booking For output and conversions
    const systemUnits = await unitsSymbolsAndRates(bookingData.appUnitId);
    //   Convert packege dimensions according to appUnits
    // for (let obj of bookingData.packages) {
    //   obj.weight = unitsConversion(
    //     obj.weight,
    //     systemUnits.conversionRate.weight
    //   );
    //   obj.length = unitsConversion(
    //     obj.length,
    //     systemUnits.conversionRate.length
    //   );
    //   obj.width = unitsConversion(obj.width, systemUnits.conversionRate.length);
    //   obj.height = unitsConversion(
    //     obj.height,
    //     systemUnits.conversionRate.length
    //   );
    //   obj.volume = unitsConversion(
    //     obj.volume,
    //     systemUnits.conversionRate.length
    //   );
    // }

    // TODO Update cancel charges
    let cancelCharges = bookingData.total * 0.25;
    //  'pickupStartTime', 'pickupEndTime', 'dropoffDate', 'dropoffStartTime', 'dropoffEndTime'
    // generating response
    let outObj = {
      bookingId,
      trackingId: bookingData.trackingId,
      consolidation: bookingData.consolidation,
      logisticCompanyTrackingNum: bookingData.logisticCompanyTrackingNum,
      total: bookingData.total,
      bookingStatus: bookingData.bookingStatus,
      //   vehicleType: `${bookingData.vehicleType.title}`,
      //^ updated
      distance: unitsConversion(
        bookingData.distance,
        systemUnits.conversionRate.distance
      ), //^ updated
      // TODO Update currency
      // driverEarning: `${bookingData.billingDetail.pickupDriverEarning}`,//TODO
      // TODO Update currency
      cancelCharges: `${cancelCharges}`,
      bookingType: bookingData.bookingType.title,
      logisticCompany: bookingData.logisticCompany,
      shipmentType: booking.shipmentType ? bookingData.shipmentType.title : "",
      pickup: bookingData.receivingWarehouse ? {
        address: `${bookingData.receivingWarehouse.addressDB.streetAddress} ${bookingData.receivingWarehouse.addressDB.district} ${bookingData.receivingWarehouse.addressDB.city} ${bookingData.receivingWarehouse.addressDB.province} ${bookingData.receivingWarehouse.addressDB.country} ${bookingData.receivingWarehouse.addressDB.postalCode} `,
        lat: bookingData.receivingWarehouse.addressDB.lat,
        lng: bookingData.receivingWarehouse.addressDB.lng,
      } : {},
      dropoff: bookingData.deliveryTypeId === 1 && bookingData.dropoffAddress ? {
        date: bookingData.dropoffDate || "",
        startTime: bookingData.dropoffStartTime || "",
        endTime: bookingData.dropoffEndTime || "",
        address: `${bookingData.dropoffAddress.streetAddress} ${bookingData.dropoffAddress.district} ${bookingData.dropoffAddress.city} ${bookingData.dropoffAddress.province} ${bookingData.dropoffAddress.country} ${bookingData.dropoffAddress.postalCode} `,
        lat: bookingData.dropoffAddress.lat,
        lng: bookingData.dropoffAddress.lng,
      } : bookingData.deliveryTypeId === 2 ? {

        address: `${bookingData.deliveryWarehouse.addressDB.streetAddress} ${bookingData.deliveryWarehouse.addressDB.district} ${bookingData.deliveryWarehouse.addressDB.city} ${bookingData.deliveryWarehouse.addressDB.province} ${bookingData.deliveryWarehouse.addressDB.country} ${bookingData.deliveryWarehouse.addressDB.postalCode} `,
        lat: bookingData.deliveryWarehouse.addressDB.lat,
        lng: bookingData.deliveryWarehouse.addressDB.lng,
      } : {},

      // delivery type
      deliveryType: bookingData.deliveryType ? bookingData.deliveryType : "",
      // packages
      packages: bookingData.packages,
      // submitted offer
      // TODO Update currency
      // counterOffer : bookingData.counterOffers.length === 0? '0.00': bookingData.counterOffers,
      // pickup page data
      instructions: `${bookingData.instruction}`,
      //   vehicleType: `${bookingData.vehicleType.title}`,
      // shipperCommodity: {
      //     // weight: await unitsConversion(bookingData.totalWeight, bookingData.appUnitId, 'wei'),//& upadted
      // },
      senderDetails: bookingData.customer ? {
        number: `${bookingData.customer.countryCode}${bookingData.customer.phoneNum}`,
        name: `${bookingData.customer.firstName} ${bookingData.customer.lastName}`,
        email: `${bookingData.customer.email}`,
        virtualBoxNumber: `${bookingData.customer.virtualBox}`
      } : {
        number: `${bookingData.senderPhone}`,
        name: `${bookingData.senderName}`,
        email: `${bookingData.senderEmail}`,
        virtualBoxNumber: ''
      },
      // // delivery page data
      // receiverCommodity: {
      //     vehicleType: `${bookingData.vehicleType.title}`,
      //     // weight:await unitsConversion(bookingData.totalWeight, bookingData.appUnitId, 'wei'),//^updated
      // },
      receiverDetails: {
        number: `${bookingData.receiverPhone}`,
        name: `${bookingData.receiverName}`,
        email: `${bookingData.receiverEmail}`,
      },
      shipperAmenities:
        bookingData.amenitiesPickup === null ? {} : bookingData.amenitiesPickup,
      receiverAmenities:
        bookingData.amenitiesDropoff === null
          ? {}
          : bookingData.amenitiesDropOff,
      unit: systemUnits.symbol,
      deliveryDriver: bookingData.deliveryDriver || {},
      history: historyArray,
    };

    if (bookingData.consolidation == true) {
      outObj.measurements = {
        weight: unitsConversion(
          bookingData.weight,
          systemUnits.conversionRate.weight
        ),
        length: unitsConversion(
          bookingData.length,
          systemUnits.conversionRate.length
        ),
        width: unitsConversion(
          bookingData.width,
          systemUnits.conversionRate.length
        ),
        height: unitsConversion(
          bookingData.height,
          systemUnits.conversionRate.length
        ),
        volume: unitsConversion(
          bookingData.volume,
          systemUnits.conversionRate.length
        ),
      }
      const weight = calculateWeights([{ actualWeight: bookingData.weight, actualVolume: bookingData.volume }], bookingData.logisticCompany.divisor)
      outObj.chargedWeight = weight.chargedWeight;
    } else {
      const weight = calculateWeights(bookingData.packages, bookingData.logisticCompany.divisor)
      outObj.chargedWeight = weight.chargedWeight;
    }

    if (bookingData.deliveryTypeId === 1 && outObj.chargedWeight > 1000) {
      outObj.ricoAddress = {
        address: `${bookingData.deliveryWarehouse.addressDB.streetAddress} ${bookingData.deliveryWarehouse.addressDB.district} ${bookingData.deliveryWarehouse.addressDB.city} ${bookingData.deliveryWarehouse.addressDB.province} ${bookingData.deliveryWarehouse.addressDB.country} ${bookingData.deliveryWarehouse.addressDB.postalCode} `,
        lat: bookingData.deliveryWarehouse.addressDB.lat,
        lng: bookingData.deliveryWarehouse.addressDB.lng,
      }
    }



    // console.log("Ã°Å¸Å¡â‚¬ ~ file: warehouse.js:985 ~ bookingDetailsById ~ outObj:", bookingData)
    return res.json(returnFunction("1", "Booking Details", outObj, ""));
  } catch (error) {
    console.log(
      "Ã°Å¸Å¡â‚¬ ~ file: warehouse.js:869 ~ bookingDetailsById ~ error:",
      error
    );
    return res.json({
      status: "1",
      message: error.message,
      error: "",
    });
  }
}


async function bookingDetailsCancelled(req, res) {
  try {
    let condition = { id: req.query.id }
    if (req.query.s) {
      condition = { trackingId: `${req.query.s}` }
    }
    console.log("condition===============================>",condition)
    // const warehouseId = req.user.id;
    let bookingData = await booking.findOne({
      where: condition,
      include: [
        { model: addressDBS, as: 'dropoffAddress', attributes: ['title', 'streetAddress', 'building', 'floor', 'apartment', 'district', 'city', 'province', 'country', 'postalCode', 'lat', 'lng'] },

        { model: warehouse, as: 'receivingWarehouse', attributes: ['id'], include: { model: addressDBS, attributes: ['title', 'streetAddress', 'building', 'floor', 'apartment', 'district', 'city', 'province', 'country', 'postalCode', 'lat', 'lng'] } },
        { model: warehouse, as: 'deliveryWarehouse', attributes: ['id'], include: { model: addressDBS, attributes: ['title', 'streetAddress', 'building', 'floor', 'apartment', 'district', 'city', 'province', 'country', 'postalCode', 'lat', 'lng'] } },

        {
          model: bookingHistory,
          include: { model: bookingStatus, attributes: ["id", "title"] },
          attributes: ["date", "time", "bookingStatusId"],
        },
        {
          model: user,
          as: "customer",
          attributes: ["virtualBox", "firstName", 'lastName', 'email', 'countryCode', 'phoneNum']
        },
        {
          model: deliveryType,
          attributes: ['title']
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
        { model: bookingStatus, attributes: ["id", "title"] },
        { model: bookingType, attributes: ["title"] },
        { model: logisticCompany, attributes: ["title", "logo", 'divisor'] },
        { model: shipmentType, attributes: ["title"] },
        { model: vehicleType, attributes: ["title"] },
        // {model: billingDetails, where :{[Op.not] : [{pickupDriverEarning :null}]} ,attributes: ['pickupDriverEarning']},//TODO
        {
          model: package,
        //   where: {
        //     arrived: {
        //       [Op.in]: ['arrived', 'pending','neverArrived']
        //     }
        //   },
          attributes: [
            "id",
            "trackingNum",
            "name",
            "email",
            "phone",
            "arrived",
            "ETA",
            "note",
            "weight",
            "length",
            "width",
            "height",
            "volume",
            "actualWeight",
            "actualLength",
            "actualWidth",
            "actualHeight",
            "actualVolume",
            'logisticCompanyTrackingNum',
          ],
          include: [
            { model: category, attributes: ["title"] },
            { model: ecommerceCompany, attributes: ["title", "description"] },
          ],
        },
        // {model: warehouse, as: 'receivingWarehouse', attributes: ['id']}
      ],
    });
       console.log("=============bookingData=============================",bookingData)
    //  return res.json(bookingData);
   
    const bookingId = bookingData.id;
    const units = await unitsSymbolsAndRates(bookingData.appUnitId);

    for (obj of bookingData.packages) {
      obj.weight = unitsConversion(obj.weight, units.conversionRate.weight);
      obj.length = unitsConversion(obj.length, units.conversionRate.length);
      obj.width = unitsConversion(obj.width, units.conversionRate.length);
      obj.height = unitsConversion(obj.height, units.conversionRate.length);
      obj.volume = unitsConversion(obj.volume, units.conversionRate.length);
      //TODO pending for actual weight and lenghts
    }

    let dType = 'selfPickup';
    if (bookingData.deliveryTypeId == 1) {
      const totalWeight = calculateWeights(bookingData.packages, bookingData.logisticCompany.divisor);

      if (totalWeight.chargedWeight < 1000) {
        dType = 'direct';
      } else if (bookingData.deliveryTypeId == 2 && bookingData.customerId == null) {
        dType = 'warehouseSelf'; // if created from warehouse and type is selfpickup
      } else {
        dType = 'byWarehouse';
      }
    }
    // ^  generating a array contain all booking statuses according to their state
    let statuses = journeyTrack(dType);
    console.log("ðŸš€ ~~ bookingDetailsById ~ journeytype:", dType)

    let historyArray = [];
    statuses.map((ele) => {
      //console.log(ele.id)
      let found = bookingData.bookingHistories.filter(
        (element) => element.bookingStatusId === ele.id
      );
      if (found.length > 0) {
        //console.log(found[0].dataValues.bookingStatus)
        let outObj = {
          bookingStatusId: found[0].bookingStatus.id,
          statusText: found[0].bookingStatus.title,
          description: ele.description,
          date: found[0].date,
          time: found[0].time,
          status: true,
        };
        historyArray.push(outObj);
      } else {
        let outObj = {
          bookingStatusId: ele.id,
          statusText: ele.title,
          description: ele.description,
          date: "",
          time: "",
          status: false,
        };
        historyArray.push(outObj);
      }
    });

    // return res.json({dType,historyArray,statuses:statuses,bookingData})
    //^ Gettings Units Symbols and conversion Rates Of this booking For output and conversions
    const systemUnits = await unitsSymbolsAndRates(bookingData.appUnitId);
    //   Convert packege dimensions according to appUnits
    // for (let obj of bookingData.packages) {
    //   obj.weight = unitsConversion(
    //     obj.weight,
    //     systemUnits.conversionRate.weight
    //   );
    //   obj.length = unitsConversion(
    //     obj.length,
    //     systemUnits.conversionRate.length
    //   );
    //   obj.width = unitsConversion(obj.width, systemUnits.conversionRate.length);
    //   obj.height = unitsConversion(
    //     obj.height,
    //     systemUnits.conversionRate.length
    //   );
    //   obj.volume = unitsConversion(
    //     obj.volume,
    //     systemUnits.conversionRate.length
    //   );
    // }

    // TODO Update cancel charges
    let cancelCharges = bookingData.total * 0.25;
    //  'pickupStartTime', 'pickupEndTime', 'dropoffDate', 'dropoffStartTime', 'dropoffEndTime'
    // generating response
    let outObj = {
      bookingId,
      trackingId: bookingData.trackingId,
      consolidation: bookingData.consolidation,
      logisticCompanyTrackingNum: bookingData.logisticCompanyTrackingNum,
      total: bookingData.total,
      bookingStatus: bookingData.bookingStatus,
      //   vehicleType: `${bookingData.vehicleType.title}`,
      //^ updated
      distance: unitsConversion(
        bookingData.distance,
        systemUnits.conversionRate.distance
      ), //^ updated
      // TODO Update currency
      // driverEarning: `${bookingData.billingDetail.pickupDriverEarning}`,//TODO
      // TODO Update currency
      cancelCharges: `${cancelCharges}`,
      bookingType: bookingData.bookingType.title,
      logisticCompany: bookingData.logisticCompany,
      shipmentType: booking.shipmentType ? bookingData.shipmentType.title : "",
      pickup: bookingData.receivingWarehouse ? {
        address: `${bookingData.receivingWarehouse.addressDB.streetAddress} ${bookingData.receivingWarehouse.addressDB.district} ${bookingData.receivingWarehouse.addressDB.city} ${bookingData.receivingWarehouse.addressDB.province} ${bookingData.receivingWarehouse.addressDB.country} ${bookingData.receivingWarehouse.addressDB.postalCode} `,
        lat: bookingData.receivingWarehouse.addressDB.lat,
        lng: bookingData.receivingWarehouse.addressDB.lng,
      } : {},
      dropoff: bookingData.deliveryTypeId === 1 && bookingData.dropoffAddress ? {
        date: bookingData.dropoffDate || "",
        startTime: bookingData.dropoffStartTime || "",
        endTime: bookingData.dropoffEndTime || "",
        address: `${bookingData.dropoffAddress.streetAddress} ${bookingData.dropoffAddress.district} ${bookingData.dropoffAddress.city} ${bookingData.dropoffAddress.province} ${bookingData.dropoffAddress.country} ${bookingData.dropoffAddress.postalCode} `,
        lat: bookingData.dropoffAddress.lat,
        lng: bookingData.dropoffAddress.lng,
      } : bookingData.deliveryTypeId === 2 ? {

        address: `${bookingData.deliveryWarehouse.addressDB.streetAddress} ${bookingData.deliveryWarehouse.addressDB.district} ${bookingData.deliveryWarehouse.addressDB.city} ${bookingData.deliveryWarehouse.addressDB.province} ${bookingData.deliveryWarehouse.addressDB.country} ${bookingData.deliveryWarehouse.addressDB.postalCode} `,
        lat: bookingData.deliveryWarehouse.addressDB.lat,
        lng: bookingData.deliveryWarehouse.addressDB.lng,
      } : {},

      // delivery type
      deliveryType: bookingData.deliveryType ? bookingData.deliveryType : "",
      // packages
      packages: bookingData.packages,
      // submitted offer
      // TODO Update currency
      // counterOffer : bookingData.counterOffers.length === 0? '0.00': bookingData.counterOffers,
      // pickup page data
      instructions: `${bookingData.instruction}`,
      //   vehicleType: `${bookingData.vehicleType.title}`,
      // shipperCommodity: {
      //     // weight: await unitsConversion(bookingData.totalWeight, bookingData.appUnitId, 'wei'),//& upadted
      // },
      senderDetails: bookingData.customer ? {
        number: `${bookingData.customer.countryCode}${bookingData.customer.phoneNum}`,
        name: `${bookingData.customer.firstName} ${bookingData.customer.lastName}`,
        email: `${bookingData.customer.email}`,
        virtualBoxNumber: `${bookingData.customer.virtualBox}`
      } : {
        number: `${bookingData.senderPhone}`,
        name: `${bookingData.senderName}`,
        email: `${bookingData.senderEmail}`,
        virtualBoxNumber: ''
      },
      // // delivery page data
      // receiverCommodity: {
      //     vehicleType: `${bookingData.vehicleType.title}`,
      //     // weight:await unitsConversion(bookingData.totalWeight, bookingData.appUnitId, 'wei'),//^updated
      // },
      receiverDetails: {
        number: `${bookingData.receiverPhone}`,
        name: `${bookingData.receiverName}`,
        email: `${bookingData.receiverEmail}`,
      },
      shipperAmenities:
        bookingData.amenitiesPickup === null ? {} : bookingData.amenitiesPickup,
      receiverAmenities:
        bookingData.amenitiesDropoff === null
          ? {}
          : bookingData.amenitiesDropOff,
      unit: systemUnits.symbol,
      deliveryDriver: bookingData.deliveryDriver || {},
      history: historyArray,
    };

    if (bookingData.consolidation == true) {
      outObj.measurements = {
        weight: unitsConversion(
          bookingData.weight,
          systemUnits.conversionRate.weight
        ),
        length: unitsConversion(
          bookingData.length,
          systemUnits.conversionRate.length
        ),
        width: unitsConversion(
          bookingData.width,
          systemUnits.conversionRate.length
        ),
        height: unitsConversion(
          bookingData.height,
          systemUnits.conversionRate.length
        ),
        volume: unitsConversion(
          bookingData.volume,
          systemUnits.conversionRate.length
        ),
      }
      const weight = calculateWeights([{ actualWeight: bookingData.weight, actualVolume: bookingData.volume }], bookingData.logisticCompany.divisor)
      outObj.chargedWeight = weight.chargedWeight;
    } else {
      const weight = calculateWeights(bookingData.packages, bookingData.logisticCompany.divisor)
      outObj.chargedWeight = weight.chargedWeight;
    }

    if (bookingData.deliveryTypeId === 1 && outObj.chargedWeight > 1000) {
      outObj.ricoAddress = {
        address: `${bookingData.deliveryWarehouse.addressDB.streetAddress} ${bookingData.deliveryWarehouse.addressDB.district} ${bookingData.deliveryWarehouse.addressDB.city} ${bookingData.deliveryWarehouse.addressDB.province} ${bookingData.deliveryWarehouse.addressDB.country} ${bookingData.deliveryWarehouse.addressDB.postalCode} `,
        lat: bookingData.deliveryWarehouse.addressDB.lat,
        lng: bookingData.deliveryWarehouse.addressDB.lng,
      }
    }



    // console.log("Ã°Å¸Å¡â‚¬ ~ file: warehouse.js:985 ~ bookingDetailsById ~ outObj:", bookingData)
    return res.json(returnFunction("1", "Booking Details", outObj, ""));
  } catch (error) {
    console.log(
      "Ã°Å¸Å¡â‚¬ ~ file: warehouse.js:869 ~ bookingDetailsById ~ error:",
      error
    );
    return res.json({
      status: "1",
      message: error.message,
      error: "",
    });
  }
}
/*
        1. All incoming packages
*/
async function incomingToWareHouse(req, res) {
  const warehouseId = req.user.id;
  const bookingsData = await booking.findAll({
    where: {
      status: true,
      paymentConfirmed: true,
      receivingWarehouseId: warehouseId,
      bookingStatusId: { [Op.or]: [1, 2, 3, 4, 5, 16, 13] },
    },
    include: [
      { model: size, attributes: ["title"] },
      { model: shipmentType, attributes: ["title"] },
      { model: unit, as: "weightUnitB", attributes: ["symbol"] },
      { model: bookingStatus, attributes: ["title"] },
      {
        model: addressDBS,
        as: "pickupAddress",
        attributes: ["id", "postalCode", "secondPostalCode", "lat", "lng"],
      },
      {
        model: addressDBS,
        as: "dropoffAddress",
        attributes: ["id", "postalCode", "secondPostalCode", "lat", "lng"],
      },
      { model: warehouse, as: "deliveryWarehouse", attributes: ["name"] },
      {
        model: user,
        as: "receivingDriver",
        attributes: [
          "firstName",
          "lastName",
          "image",
          "countryCode",
          "phoneNum",
        ],
      },
    ],
    attributes: [
      "id",
      "trackingId",
      "pickupDate",
      "pickupEndTime",
      "weight",
      "bookingStatusId",
      "deliveryWarehouseId",
      "bookingTypeId",
    ],
  });
  let bookingCreated = bookingsData.filter(
    (ele) =>
      ele.bookingStatusId === 1 ||
      ele.bookingStatusId === 2 ||
      ele.bookingStatusId === 3 ||
      ele.bookingStatusId === 4 ||
      ele.bookingStatusId === 13
  );
  //let bookingAccepted = bookingsData.filter(ele=> ele.bookingStatusId === 2 || ele.bookingStatusId === 3 );
  //let pickedup = bookingsData.filter(ele=> ele.bookingStatusId === 4);
  let reachedAtWarehouse = bookingsData.filter(
    (ele) => ele.bookingStatusId === 5
  );
  let deliveredAtWarehouse = bookingsData.filter(
    (ele) => ele.bookingStatusId === 16
  );
  let outObj = {
    numOfCreatedbookings: bookingCreated.length,
    bookingCreated,
    //numOfAcceptedbookings: bookingAccepted.length,
    //bookingAccepted,
    //numOfPickedbookings: pickedup.length,
    //pickedup,
    reachedAtWarehouse,
    numOfReachedAtWarehousebookings: reachedAtWarehouse.length,
    numOfDelivered: deliveredAtWarehouse.length,
    deliveredAtWarehouse,
  };

  return res.json(returnFunction("1", "All incoming to warehouse", outObj, ""));
}

/*
s        2. booking details
*/
async function bookingDetails(req, res) {
  const { bookingId } = req.body;
  const defaultDistanceUnit = await defaultUnit.findOne({
    where: { type: "distance", status: true },
    attributes: ["symbol"],
  });
  const defaultCurrencyUnit = await defaultUnit.findOne({
    where: { type: "currency", status: true },
    attributes: ["symbol"],
  });
  const bookingData = await booking.findByPk(bookingId, {
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
          "virtualBox",
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
      { model: size, attributes: ["title"] },
      { model: shipmentType, attributes: ["title"] },
      { model: unit, as: "weightUnitB", attributes: ["symbol"] },
      { model: unit, as: "lengthUnitB", attributes: ["symbol"] },
      { model: bookingStatus, attributes: ["title"] },
      {
        model: addressDBS,
        as: "dropoffAddress",
        attributes: ["id", "postalCode", "secondPostalCode", "lat", "lng"],
      },
      { model: category, attributes: ["title"] },
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
      "ETA",
      "weight",
      "length",
      "width",
      "height",
      "senderName",
      "senderEmail",
      "senderPhone",
      "barcode",
      "catText",
      "distance",
      "scheduleSetBy",
    ],
  });
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
  let outObj = {
    id: bookingData.id,
    trackingId: bookingData.trackingId,
    instructions: `${bookingData.instruction}`,
    barcode: bookingData.barcode,
    scheduleSetBy: bookingData.scheduleSetBy,
    customer: bookingData.customer,
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
      pickupCode: `${bookingData.pickupAddress.postalCode} ${bookingData.pickupAddress.secondPostalCode}`,
      dropoffCode: `${bookingData.dropoffAddress.postalCode} ${bookingData.dropoffAddress.secondPostalCode}`,
      pickupTime: `${bookingData.pickupEndTime}`,
    },
    parcelDetails: {
      shipmentType: `${bookingData.shipmentType.title}`,
      category:
        bookingData.catText === ""
          ? `${bookingData.category.title}`
          : `${bookingData.category.title} (${bookingData.catText})`,
      size: `${bookingData.length}x${bookingData.width}x${bookingData.height} ${bookingData.lengthUnitB.symbol}<sup>3</sup> (${bookingData.size.title})`,
      weight: `${bookingData.weight} ${bookingData.weightUnitB.symbol}`,
      distance: `${bookingData.distance} ${defaultDistanceUnit.symbol}`,
      pickupDate: `${bookingData.pickupDate}`,
      ETA: `${bookingData.ETA}`,
      orderTotal: `${defaultCurrencyUnit.symbol}${bookingData.total}`,
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
        3. Change Status to received at warehouse (Manually)
*/
async function receivedAtWarehouse(req, res) {
  const { bookingId } = req.body;
  const bookingData = await booking.findByPk(bookingId, {
    attributes: [
      "id",
      "trackingId",
      "senderEmail",
      "receivingDriverId",
      "receivingWarehouseId",
      "deliveryWarehouseId",
      "scheduleSetBy",
      "bookingTypeId",
      "receiverEmail",
    ],
    include: [
      {
        model: user,
        as: "customer",
        include: { model: deviceToken, attributes: ["tokenId"] },
        attributes: ["id"],
      },
      {
        model: billingDetails,
        attributes: ["pickupDriverEarning"],
      },
    ],
  });
  const warehouseId = req.user.id;
  let done = await booking.update(
    { bookingStatusId: 16 },
    { where: { id: bookingId } }
  );
  if (done) {
    // creating Booking History
    let dt = Date.now();
    let DT = new Date(dt);
    let currentDate = `${DT.getMonth() + 1
      }-${DT.getDate()}-${DT.getFullYear()}`;
    let currentTime = `${DT.getHours()}:${DT.getMinutes()}:${DT.getSeconds()}`;
    bookingHistory.create({
      date: currentDate,
      time: currentTime,
      bookingId,
      bookingStatusId: 5,
    });
    // for same city, i.e. both warehouse are same; change to status awaiting schedule
    if (bookingData.receivingWarehouseId === bookingData.deliveryWarehouseId) {
      // setting status to awaiting schdule
      await booking.update(
        { bookingStatusId: 8 },
        { where: { id: bookingId } }
      );
      bookingHistory.create({
        date: currentDate,
        time: currentTime,
        bookingId,
        bookingStatusId: 6,
      });
      bookingHistory.create({
        date: currentDate,
        time: currentTime,
        bookingId,
        bookingStatusId: 7,
      });
      bookingHistory.create({
        date: currentDate,
        time: currentTime,
        bookingId,
        bookingStatusId: 8,
      });
      if (bookingData.bookingTypeId === 2) {
        await booking.update(
          { bookingStatusId: 9 },
          { where: { id: bookingId } }
        );
        bookingHistory.create({
          date: currentDate,
          time: currentTime,
          bookingId,
          bookingStatusId: 9,
        });
      }
    }
    if (bookingData.receivingWarehouseId === bookingData.deliveryWarehouseId) {
      // self pick up booking
      if (bookingData.bookingTypeId === 2) {
        // send email to receiver
        transporter.sendMail(
          {
            from: process.env.EMAIL_USERNAME, // sender address
            to: ["sigidevelopers@gmail.com", bookingData.receiverEmail], // list of receivers
            subject: `please pick up booking from warehouse`, // Subject line
            text: `Please come to warehouse`, // plain text body
          },
          function (err, info) {
            if (err) console.log(err);
            console.log(info);
          }
        );
      } else {
        if (bookingData.scheduleSetBy === "sender") {
          // FOR APP USER
          if (bookingData.customer) {
            let to = bookingData.customer.deviceTokens.map((inEle) => {
              return inEle.tokenId;
            });
            // Throwing notifications
            let notification = {
              title: `Booking # ${bookingData.trackingId} needs to be scheduled`,
              body: "Please schedule the booking so that we can deliver you with convenience",
            };
            sendNotification(to, notification);
            transporter.sendMail(
              {
                from: process.env.EMAIL_USERNAME, // sender address
                to: ["sigidevelopers@gmail.com", bookingData.senderEmail], // list of receivers
                subject: `Please schedule the booking(c) # ${bookingData.trackingId}`, // Subject line
                text: `Open the app and schedule the booking`, // plain text body
              },
              function (err, info) {
                if (err) console.log(err);
                console.log(info);
              }
            );
          }
          // FOR ORDER CREATED AT WAREHOUSE
          else {
            // send email to sender
            // GENERATING LINK for scheduleing drop off
            var ciphertext = CryptoJS.AES.encrypt(
              `${bookingData.id}-${bookingData.senderEmail}`,
              process.env.JWT_ACCESS_SECRET
            )
              .toString()
              .replace("+", "xMl3Jk")
              .replace("/", "Por21Ld")
              .replace("=", "Ml32");
            let urlDyn = `${process.env.Base_URL_schedule}?key=${ciphertext}`;
            console.log("------------- URL FOR SCHEDULING DROP OFF", urlDyn);
            transporter.sendMail(
              {
                from: process.env.EMAIL_USERNAME, // sender address
                to: ["sigidevelopers@gmail.com", bookingData.senderEmail], // list of receivers
                subject: `Link for scheduling dropoff(s) # ${bookingData.trackingId}`, // Subject line
                text: `Please click on the link ${urlDyn}`, // plain text body
              },
              function (err, info) {
                if (err) console.log(err);
                console.log(info);
              }
            );
          }
        }
        // FOR SCHEDULE TO BE SET BY RECEIVER
        else {
          // send email to the receiver
          var ciphertext = CryptoJS.AES.encrypt(
            `${bookingData.id}-${bookingData.receiverEmail}`,
            process.env.JWT_ACCESS_SECRET
          )
            .toString()
            .replace("+", "xMl3Jk")
            .replace("/", "Por21Ld")
            .replace("=", "Ml32");
          let urlDyn = `${process.env.Base_URL_schedule}?key=${ciphertext}`;
          console.log("------------- URL FOR SCHEDULING DROP OFF", urlDyn);
          transporter.sendMail(
            {
              from: process.env.EMAIL_USERNAME, // sender address
              to: ["sigidevelopers@gmail.com", bookingData.receiverEmail], // list of receivers
              subject: `Link for scheduling dropoff(r) # ${bookingData.trackingId}`, // Subject line
              text: `Please click on the link ${urlDyn}`, // plain text body
            },
            function (err, info) {
              if (err) console.log(err);
              console.log(info);
            }
          );
        }
      }
    } else {
      // if customer  === null , send email instead
      if (bookingData.customer) {
        // throw notification
        let notification = {
          title: `Booking # ${bookingData.trackingId} reached at origin warehouse`,
          body: "Your parcel reached at our warehouse and will soon be in-transit"
        };
        let to = bookingData.customer.deviceTokens.map((ele) => {
          return ele.tokenId;
        });
        sendNotification(to, notification);
      } else {
        // send email
      }
    }

    let { earning, driverPaymentSystemId } = await getDriverEarning(
      bookingId,
      bookingData.receivingDriverId,
      "pickup"
    );
    billingDetails.update(
      { pickupDriverEarning: earning },
      { where: { bookingId } }
    );

    wallet.create({
      amount: -1 * earning,
      bookingId: bookingId,
      userId: bookingData.receivingDriverId,
      driverPaymentSystemId,
      description: "Receiving Driver Earnings",
    });

    return res.json(
      returnFunction("1", "Booking received by warehouse", {}, "")
    );
  } else
    return res.json(
      returnFunction(
        "0",
        "Internal server error (404)",
        {},
        "Please try again later"
      )
    );
}
//  TODO Do the same thing with scanner as well
/*
        4. Change Status to received at warehouse (Scanner)
*/
/*
        5. Get all active warehouses
*/
async function allActiveWarehouse(req, res) {
  const warehouseData = await warehouse.findAll({
    where: { status: true, classifiedAId: 3 },
    attributes: ["id", "name"],
  });
  return res.json(
    returnFunction("1", "All Active warehouses", warehouseData, "")
  );
}
/*
        6. Change status to transit
*/
async function getAllActiveTransporterGuy(req, res) {
  const userData = await user.findAll({
    where: { status: true, userTypeId: 4 },
    attributes: ["id", "firstName", "lastName"],
  });
  return res.json(
    returnFunction("1", "All active transporter guys", userData, "")
  );
}
/*
        7. Change status to transit
*/
async function toTransit(req, res) {
  const { bookingIds, logisticCompanyId, deliveryWarehouseId } = req.body;
  const warehouseId = req.user.id;

  let bookingData = await booking.findAll({
    where: { id: bookingIds },
    include: [
      { model: addressDBS, as: 'dropoffAddress', attributes: ['title', 'streetAddress', 'building', 'floor', 'apartment', 'district', 'city', 'province', 'country', 'postalCode', 'lat', 'lng'] },
      {
        model: user,
        as: "customer",
        attributes: ["id", "firstName", "email"],
        include: { model: deviceToken, attributes: ["tokenId"] },

      },

      { model: logisticCompany, attributes: ["title"] },
      {
        model: package,
        attributes: [
          "arrived",
        ],
      },
      // {model: warehouse, as: 'receivingWarehouse', attributes: ['id']}
    ],
    attributes: ['receiverName', 'receiverEmail', 'createdAt', 'consolidation', 'trackingId']
  });



  // let tokenArr = [];
  // bookingData.map(ele=>{
  //     ele.customer.deviceTokens.map(inEle=> tokenArr.push(inEle.tokenId))
  // });
  // creating a transit group
  // let nowDate = Date.now();
  // let cDT = new Date(nowDate);
  // let currentDate = `${cDT.getFullYear()}-${("0" + (cDT.getMonth() + 1)).slice(
  //   -2
  // )}-${("0" + cDT.getDate()).slice(-2)}`;
  // let currentTime = `${cDT.getHours()}:${cDT.getMinutes()}:${cDT.getSeconds()}`;
  const time = getDateAndTime();
  let transitId = otpGenerator.generate(10, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: true,
    specialChars: false,
  });
  const intrans = await inTransitGroups.create({
    transitId: `TSH-${transitId}`,
    bookingIds: bookingIds.toString(),
    quantity: bookingIds.length,
    setOffDate: time.currentDate,
    setOffTime: time.currentTime,
    status: "On way",
    logisticCompanyId,
    receivingWarehouseId: warehouseId,
    deliveryWarehouseId,
  });
  //let done = await booking.bulkCreate(updateArr, { updateOnDuplicate: ['id', 'receivingWarehouseId'] });
  let done = await booking.update(
    { bookingStatusId: 11, deliveryWarehouseId },
    { where: { id: { [Op.or]: bookingIds } } }
  );
  // Creating booking history
  let histArr = bookingIds.map((ele) => {
    return {
      date: time.currentDate,
      time: time.currentTime,
      bookingId: ele,
      bookingStatusId: 11,
    };
  });
  bookingHistory.bulkCreate(histArr);
  // Throwing notifications
  bookingData.map((ele) => {
    if (ele.customer) {
      let cus = ele.customer.deviceTokens.map((inEle) => {
        return inEle.tokenId;
      });
      // Throwing notifications
      let notification = {
        title: `In Transit to Puerto Rico`,
        body: "Your order is in transit to Puerto Rico.",
      };
      sendNotification(cus, notification);

    }

    var arrived = ele.packages.filter((res) => res.arrived == "arrived");
    const to = ['sigidevelopers@gmail.com'];
    let name = ele.receiverName
    if (ele.customer) {
      to.push(ele.customer.email)
      name = ele.customer.firstName
    } else {
      to.push(ele.receiverEmail)
    }
    const consolidation = ele.consolidation ? 'yes' : 'no';
    const createdAt = String(ele.createdAt).substring(4, 15);
    toTransitMail(to, name, ele.trackingId, createdAt, arrived.length, ele.logisticCompany.title, consolidation, intrans.transitId)
  });
  if (done)
    return res.json(returnFunction("1", "Status changed to transit", {}, ""));
  else
    return res.json(
      returnFunction(
        "0",
        "Internal server error (404)",
        {},
        "Please try again later"
      )
    );
}

// ! Module 4: In-transit Bookings
/*
        1. Bookings in transit by groups
*/
async function inTransitBookings(req, res) {
  const warehouseId = req.user.id;
  const outgoing = await inTransitGroups.findAll({
    where: { receivingWarehouseId: warehouseId },
    include: [
      {
        model: warehouse,
        as: "receivingWarehouseT",
        attributes: ["companyName"],
        include: {
          model: addressDBS,
          attributes: ["postalCode"],
        },
      },
      {
        model: warehouse,
        as: "deliveryWarehouseT",
        attributes: ["companyName"],
        include: {
          model: addressDBS,
          attributes: ["postalCode"],
        },
      },
      {
        model: logisticCompany,
        attributes: ["title"],
      },
    ],
    attributes: { exclude: ["createdAt", "updatedAt", "userId"] },
  });
  const incoming = await inTransitGroups.findAll({
    where: { deliveryWarehouseId: warehouseId },
    include: [
      {
        model: warehouse,
        as: "receivingWarehouseT",
        attributes: ["companyName"],
        include: {
          model: addressDBS,
          attributes: ["postalCode"],
        },
      },
      {
        model: warehouse,
        as: "deliveryWarehouseT",
        attributes: ["companyName"],
        include: {
          model: addressDBS,
          attributes: ["postalCode"],
        },
      },
      {
        model: logisticCompany,
        attributes: ["title"],
      },
    ],
    attributes: { exclude: ["createdAt", "updatedAt", "userId"] },
  });
  let outOngoing = outgoing.filter((ele) => ele.status === "On way");
  let outCompleted = outgoing.filter((ele) => ele.status === "Delivered");
  let inOngoing = incoming.filter((ele) => ele.status === "On way");
  let inCompleted = incoming.filter((ele) => ele.status === "Delivered");
  inCompleted.map((ele) => (ele.status = "Received"));
  return res.json(
    returnFunction(
      "1",
      "In-Transit bookings",
      {
        outgoing: { outOngoing, outCompleted },
        incoming: { inOngoing, inCompleted },
      },
      ""
    )
  );
}
/*
        2. Detail of in-tranist group
*/
async function transitGroupDetails(req, res) {
  const { inTransitGroupId } = req.body;
  const warehouseId = req.user.id;
  const inTransitGroupData = await inTransitGroups.findByPk(inTransitGroupId, {
    attributes: ["bookingIds"],
  });
  let bookingIdArr = inTransitGroupData.bookingIds.split(",");
  //return res.json(bookingIdArr)
  const bookingsData = await booking.findAll({
    //where: {receivingWarehouseId: warehouseId, deliveryWarehouseId, bookingStatusId: 6},
    where: { id: bookingIdArr },
    include: [
      { model: shipmentType, attributes: ["title"] },

      { model: bookingStatus, attributes: ["title"] },
      {
        model: addressDBS,
        as: "pickupAddress",
        attributes: ["id", "postalCode", "lat", "lng"],
      },
      {
        model: addressDBS,
        as: "dropoffAddress",
        attributes: ["id", "postalCode", "lat", "lng"],
      },
      {
        model: appUnits,
        attributes: ["id"],
        include: [
          {
            model: units,
            as: "weightUnit",
            attributes: ["symbol", "conversionRate"],
          },
          {
            model: units,
            as: "lengthUnit",
            attributes: ["symbol", "conversionRate"],
          },
          {
            model: units,
            as: "distanceUnit",
            attributes: ["symbol", "conversionRate"],
          },
          {
            model: units,
            as: "currencyUnit",
            attributes: ["symbol", "conversionRate"],
          },
        ],
      },
    ],
    attributes: [
      "id",
      "trackingId",
      "pickupDate",
      "pickupEndTime",
      "weight",
      "bookingStatusId",
      "deliveryWarehouseId",
    ],
  });
  return res.json(returnFunction("1", "In-Transit bookings", bookingsData, ""));
}

/*
        3. Received at warehouse from transporter
*/
async function receivedFromTransporter(req, res) {
  const { bookingIds, inTransitGroupId } = req.body;
  console.log('All Bookings ', bookingIds);
  let Ids = bookingIds[0].split(",");
  const bookingData = await booking.findAll({
    where: { id: Ids },
    attributes: [
      "id",
      "trackingId",
      "scheduleSetBy",
      "receiverEmail",
      "bookingTypeId",
      "deliveryTypeId",
      "bookingStatusId",
      "createdAt",
      "consolidation",
      "weight",
      "volume",
      "height",
      "width",
      "length",
    ],
    include: [
      { model: package },
      { model: logisticCompany, attributes: ['title', 'divisor'] },
      {
        model: user,
        as: "customer",
        include: { model: deviceToken, attributes: ["tokenId"] },
        attributes: ["id", "email", "firstName"],
      },
    ],
  });

  // change status to received at warehouse
  await booking.update({ bookingStatusId: 12 }, { where: { id: Ids } });
  // create history
  let recAtWarehouse = [],
    scheduled = [],
    selfIds = [];

  const time = getDateAndTime()

  await inTransitGroups.update(
    { status: "Delivered", arrivalDate: time.currentDate, arrivalTime: time.currentTime },
    { where: { id: inTransitGroupId } }
  );
  await Ids.map((ele) => {
    recAtWarehouse.push({
      date: time.currentDate,
      time: time.currentTime,
      bookingId: ele,
      bookingStatusId: 12,
    });
  });
  // console.log(recAtWarehouse)
  await bookingHistory.bulkCreate(recAtWarehouse);
  // { TODO pending check willl update it later
  // filtering out self pick up bookings and setting status to scheduled
  const pickCaseBookings = bookingData.filter((ele) => ele.deliveryTypeId === 2);
  pickCaseBookings.map((ele) => {
    selfIds.push(ele.id);
    scheduled.push({
      date: time.currentDate,
      time: time.currentTime,
      bookingId: ele.id,
      bookingStatusId: 20,
    });
  });
  console.log('SELF PICKUPS ', selfIds)
  console.log('All Bookings ', Ids)

  if (selfIds.length > 0) {
    const updatedRow = await booking.update(
      { dropoffDate: time.currentDate, bookingStatusId: 20 },
      { where: { id: { [Op.or]: selfIds } } }
    );
    console.log('Updated Rows for self pickup ', updatedRow)
    await bookingHistory.bulkCreate(scheduled);
  }

  // Throw notification to the sender
  bookingData.map(async (ele) => {


    // SEND EMAIL
    const weightData = ele.consolidation ? calculateWeights([{ actualWeight: ele.weight, actualVolume: ele.volume }], ele.logisticCompany.divisor) : calculateWeights(ele.packages, ele.logisticCompany.divisor);
    const timestamp = ele.createdAt;
    const datePortion = String(timestamp).substring(4, 15);
    const consolidation = ele.consolidation ? 'Yes' : 'No';

    // SEND EMAIL

    // FOR SELF PICK UP -- SEND EMAIL TO RECEIVER to pickup from warehouse
    if (ele.deliveryTypeId === 2) {
      if (ele.customer) {
        let to = ele.customer.deviceTokens.map((inEle) => {
          return inEle.tokenId;
        });
        // Throwing notifications
        let notification = {
          title: `Order Arived`,
          body: "Pickup order from Puerto Rico warehouse",
        };
        sendNotification(to, notification, { id: ele.id, bookingStatusId: ele.bookingStatusId });

        selfPickupMail([ele.customer.email, 'sigidevelopers@gmail.com'],
          ele.customer.firstName,
          String(ele.trackingId),
          String(ele.packages.length).padStart(2, 0),
          String(weightData.chargedWeight),
          ele.logisticCompany.title,
          datePortion,
          consolidation
        )
      }
    } else {
      if (ele.customer) {
        let to = ele.customer.deviceTokens.map((inEle) => {
          return inEle.tokenId;
        });
        // Throwing notifications
        let notification = {
          title: `Order Arived`,
          body: "Order arived At Puerto Rico warehouse will be delivered Soon",
        };
        sendNotification(to, notification, { id: ele.id, bookingStatusId: ele.bookingStatusId });
        //  send Email 
        arrivedOrderMail(
          [ele.customer.email, 'sigidevelopers@gmail.com'],
          ele.customer.firstName,
          String(ele.trackingId),
          String(ele.packages.length).padStart(2, 0),
          String(weightData.chargedWeight),
          ele.logisticCompany.title,
          datePortion,
          consolidation
        )
      }

    }

    // FOR DELIVERY

  });
  return res.json(
    returnFunction(
      "1",
      "Bookings received at warehouse & Awaiting To be picked",
      {},
      ""
    )
  );
}
// ! Module 5: Outgoing bookings
/*
        1. All out going bookings (Delivery)
*/
async function outgoingFromWareHouse(req, res) {
  const warehouseId = req.user.id;
  const bookingsData = await booking.findAll({
    // only delivery bookings
    where: {
      deliveryWarehouseId: warehouseId,
      bookingTypeId: 1,
      bookingStatusId: { [Op.or]: [7, 8, 9, 10, 11, 12, 13] },
    },
    include: [
      { model: size, attributes: ["title"] },
      { model: shipmentType, attributes: ["title"] },
      { model: unit, as: "weightUnitB", attributes: ["symbol"] },
      { model: bookingStatus, attributes: ["title"] },
      {
        model: addressDBS,
        as: "pickupAddress",
        attributes: ["id", "postalCode", "secondPostalCode", "lat", "lng"],
      },
      {
        model: addressDBS,
        as: "dropoffAddress",
        attributes: ["id", "postalCode", "secondPostalCode", "lat", "lng"],
      },
      {
        model: user,
        as: "deliveryDriver",
        attributes: [
          "firstName",
          "lastName",
          "image",
          "countryCode",
          "phoneNum",
        ],
      },
    ],
    attributes: [
      "id",
      "trackingId",
      "dropoffDate",
      "dropoffStartTime",
      "dropoffEndTime",
      "weight",
      "bookingStatusId",
      "deliveryWarehouseId",
      "deliveryDriverId",
      "bookingTypeId",
    ],
  });
  let waiting = bookingsData.filter(
    (ele) => ele.bookingStatusId === 7 || ele.bookingStatusId === 8
  );
  let scheduledBookings = bookingsData.filter(
    (ele) => ele.bookingStatusId === 9 || ele.bookingStatusId === 10
  );
  let outgoing = bookingsData.filter(
    (ele) =>
      ele.bookingStatusId === 11 ||
      ele.bookingStatusId === 12 ||
      ele.bookingStatusId === 13
  );
  let outObj = {
    numOfWaitingBookings: waiting.length,
    waiting,
    numOfScheduledBookings: scheduledBookings.length,
    scheduledBookings,
    numOfOutgoingbookings: outgoing.length,
    outgoing,
  };
  return res.json(
    returnFunction("1", "All outgoing from warehouse", outObj, "")
  );
}
/*
        2. Get drivers of specific warehouse 
*/
async function getWarehouseDrivers(req, res) {
  const warehouseId = req.user.id;
  const driverData = await driverDetail.findAll({
    where: { warehouseId, driverTypeId: 2, approvedByAdmin: true },
    //required: false,
    include: {
      where: { status: true },
      required: false,
      model: user,
      attributes: [
        "id",
        "firstName",
        "lastName",
        "image",
        "countryCode",
        "phoneNum",
      ],
    },
    attributes: ["userId"],
  });
  let onlineDrivers = await axios.get(
    "https://theshippinghack-default-rtdb.firebaseio.com/ShippingHack_driver/.json"
  );
  //   console.log('FROM FIRE BASE',onlineDrivers.data)
  //if(onlineDrivers.statusCode != 200) throw CustomException('Error getting driver data', onlineDrivers.statusMessage)
  if (!onlineDrivers.data)
    return res.json(
      returnFunction(
        "0",
        "All the drivers are off line",
        {},
        "Please ask the driver to become online"
      )
    );

  let onlineActivedriver = [];
  // FILTERING ONLINE DRIVERS
  driverData.map((ele) => {
    let exist = onlineDrivers.data.hasOwnProperty(ele.userId);
    if (exist) return onlineActivedriver.push(ele);
    // console.log(exist);
  });
  return res.json(
    returnFunction("1", "All driver of warehouse", onlineActivedriver, '')
  );
}
/*
        3. Assign order to driver
*/
async function assignOrderToDriver(req, res) {
  const warehouseId = req.user.id;
  const { bookingId, bookingType, overRide, driverId } = req.body;
  const bookingData = await booking.findByPk(bookingId, {
    include: [
      {
        model: user,
        as: "customer",
        include: { model: deviceToken, attributes: ["tokenId"] },
        attributes: ["id", "dvToken"],
      },
      {
        model: user,
        as: "deliveryDriver",
        include: { model: deviceToken, attributes: ["tokenId"] },
        attributes: ["id",],
      },
      // {
      //   model: user,
      //   as: "deliveryDriver",
      //   include: { model: deviceToken, attributes: ["tokenId"] },
      //   attributes: ["id"],
      // },
    ],
  });
  const time = getDateAndTime()
  if (bookingData.deliveryTypeId === 1) {
    // Status 2 to prompt warehouse if he wants to overide or not
    if (bookingData.deliveryDriverId !== null && !overRide)
      return res.json(
        returnFunction(
          "2",
          "Driver already assigned",
          {},
          "Would you like to over-ride current driver?"
        )
      );
    await booking.update(
      {
        deliveryDriverId: driverId,
        driverStatus: "Assigned",
        bookingStatusId: 13,
      },
      { where: { id: bookingId } }
    );
    await bookingHistory.create({
      date: time.currentDate,
      time: time.currentTime,
      bookingId,
      bookingStatusId: 13,
    });
    // if customerId ==> null, send email to sender/receiver
    if (bookingData.customer === null) {
      // TODO: send email to sender/receiver
    } else {
      //!TODO solve this
      //   if(bookingData.customer.deviceToken){
      //   let to = bookingData.customer.deviceToken.map((ele) => {
      //     return ele.tokenId;
      //   });
      //   let notification = {
      //     title: `Booking with tracking Id: ${bookingData.trackingId} accepted by driver`,
      //     body: "Our rider has accepted your booking",
      //   };
      //   sendNotification(to, notification);
      // }
    }
    // also throw notification to driver
    //   if(bookingData.deliveryDriverId.deviceToken){
    //!TODO solve this
    //   let recDriver = bookingData.deliveryDriverId.deviceToken.map((ele) => {
    //     return ele.tokenId;
    //   });
    //   let notification = {
    //     title: `Booking assigned by warehouse`,
    //     body: `Booking # ${bookingData.trackingId} is assigned to you`,
    //   };
    //   sendNotification(recDriver, notification);
    // }
    return res.json(returnFunction("1", "Booking assigned to driver", {}, ""));
  }
  // else if (bookingType === "delivery") {
  //   if (bookingData.deliveryDriverId != null && !overRide)
  //     return res.json(
  //       returnFunction(
  //         "2",
  //         "Driver already assigned",
  //         {},
  //         "Would you like to over-ride current driver?"
  //       )
  //     );
  //   booking.update(
  //     {
  //       deliveryDriverId: driverId,
  //       driverStatus: "Assigned",
  //       bookingStatusId: 10,
  //     },
  //     { where: { id: bookingId } }
  //   );
  //   bookingHistory.create({
  //     date: time.currentDate,
  //     time: time.currentTime,
  //     bookingId,
  //     bookingStatusId: 10,
  //   });
  //   // if customerId ==> null, send email to sender/receiver
  //   if (booking.customer === null) {
  //     // TODO: send email to sender/receiver
  //   } else {
  //     let to = bookingData.customer.deviceTokens.map((ele) => {
  //       return ele.tokenId;
  //     });
  //     let notification = {
  //       title: `Booking with tracking Id: ${bookingData.trackingId} accepted by driver`,
  //       body: "Our rider has accepted your booking",
  //     };
  //     sendNotification(to, notification);
  //   }
  //   // also throw notification to driver
  //   let delDriver = bookingData.deliveryDriver.deviceTokens.map((ele) => {
  //     return ele.tokenId;
  //   });
  //   let notification = {
  //     title: `Booking assigned by warehouse`,
  //     body: `Booking # ${bookingData.trackingId} is assigned to you`,
  //   };
  //   sendNotification(delDriver, notification);
  //   return res.json(returnFunction("1", "Booking assigned to driver", {}, ""));}
  else {
    return res.json(
      returnFunction("0", "Incorrect booking type", {}, "No booking found")
    );
  }
}



/*
   Handed Over the order to the driver
*/

async function handedOver(req, res) {
  const { id } = req.body;
  const bookingData = await booking.findByPk(id, {
    include: [
      {
        model: user,
        as: "customer",
        include: { model: deviceToken, attributes: ["tokenId"] },
        attributes: ["id", "dvToken"],
      },
      {
        model: user,
        as: "receivingDriver",
        include: { model: deviceToken, attributes: ["tokenId"] },
        attributes: ["id",],
      },
    ],
  })
  if (bookingData) {
    if (bookingData.bookingStatusId >= 15)
      return res.json(returnFunction("0", "Booking already Handed over to a driver", {}, "Can't perform this opreation"))
    await booking.update(
      {
        driverStatus: "Picked Up",
        bookingStatusId: 21,
      },
      { where: { id } }
    );
    const time = getDateAndTime()
    await bookingHistory.create({
      date: time.currentDate,
      time: time.currentTime,
      bookingId: id,
      bookingStatusId: 21,
    });
    // if customerId ==> null, send email to sender/receiver
    if (bookingData.customer === null) {
      // TODO: send email to sender/receiver
    } else {
      if (bookingData.customer.deviceToken) {
        let to = bookingData.customer.deviceToken.map((ele) => {
          return ele.tokenId;
        });
        let notification = {
          title: `Booking with tracking Id: ${bookingData.trackingId} Picked up by driver`,
          body: "Our rider is on the way to deliver you Order",
        };
        sendNotification(to, notification);
      }
    }
    // also throw notification to driver
    if (bookingData.receivingDriver.deviceToken) {
      let recDriver = bookingData.receivingDriver.deviceToken.map((ele) => {
        return ele.tokenId;
      });
      let notification = {
        title: `Booking Picked from warehouse`,
        body: `Booking # ${bookingData.trackingId} is Picked by you`,
      };
      sendNotification(recDriver, notification);
    }
    return res.json(returnFunction("1", "Booking Handed Over to driver", {}, ""));
  }
  else {
    return res.json(
      returnFunction("0", "Incorrect booking type", {}, "No booking found")
    );
  }
}
// TODO when scheduling the ride throw notification to drivers that new booking available (if delivery ride)
/*
        4. All out going bookings (Self pickup)
*/
async function selfPickupOutgoing(req, res) {
  const warehouseId = req.user.id;
  const bookingsData = await booking.findAll({
    // only selfpickup bookings
    where: {
      deliveryWarehouseId: warehouseId,
      bookingTypeId: 2,
      bookingStatusId: { [Op.or]: [7, 8, 9, 14] },
    },
    include: [
      { model: size, attributes: ["title"] },
      { model: shipmentType, attributes: ["title"] },
      { model: unit, as: "weightUnitB", attributes: ["symbol"] },
      { model: bookingStatus, attributes: ["title"] },
      {
        model: addressDBS,
        as: "pickupAddress",
        attributes: ["id", "postalCode", "secondPostalCode", "lat", "lng"],
      },
      {
        model: addressDBS,
        as: "dropoffAddress",
        attributes: ["id", "postalCode", "secondPostalCode", "lat", "lng"],
      },
    ],
    attributes: [
      "id",
      "trackingId",
      "dropoffDate",
      "dropoffEndTime",
      "weight",
      "bookingStatusId",
      "deliveryWarehouseId",
      "bookingTypeId",
    ],
  });
  let waiting = bookingsData.filter(
    (ele) =>
      ele.bookingStatusId === 7 ||
      ele.bookingStatusId === 8 ||
      ele.bookingStatusId === 9
  );
  let delivered = bookingsData.filter((ele) => ele.bookingStatusId === 14);

  return res.json(
    returnFunction(
      "1",
      "All outgoing from warehouse",
      { waiting, delivered },
      ""
    )
  );
}
/*
        5. Change status to delivered (Self pickup)
*/
async function selfPickupDelivered(req, res) {
  const { bookingId } = req.body;
  const bookingData = await booking.findByPk(bookingId, {
    include: [
      { model: logisticCompany, attributes: ["title", 'divisor'] },
      {
        model: package,
        attributes: [
          "arrived",
          "actualWeight",
          "actualVolume"
        ],
      },
      {
        model: user,
        as: "customer",
        include: { model: deviceToken, attributes: ["tokenId"] },
        attributes: ["id", "firstName", "email"],
      }
    ],
  });
  if (bookingData) {
    const time = getDateAndTime();
    bookingData.bookingStatusId = 21;
    bookingData.dropOffDate = time.currentDate;
    // bookingData.dropoffStartTime= time.currentTimecurrentDate;
    bookingData.dropoffEndTime = time.currentTime;
    // bookingData.deliveredAt= time.currentTimecurrentDate;
    bookingData.status = false;
    await bookingData.save();
    // updating booking status
    // let done = await booking.update(
    //   {
    //     bookingStatusId: 21,
    //     dropOffDate: time.currentDate,
    //     dropoffStartTime: time.currentTime,
    //     dropoffEndTime: time.currentTime,
    //     deliveredAt: time.currentTime,
    //     status: false,
    //   },
    //   { where: { id: bookingId } }
    // );

    //return res.json(done)
    // Creating booking history
    if (bookingData.customer) {
      let to = bookingData.customer.deviceTokens.map((inEle) => {
        return inEle.tokenId;
      });
      // Throwing notifications

      let notification = {
        title: `Booking # ${bookingData.trackingId} is delivered`,
        body: "Your parcel is handed over to the receiver",
      };

      sendNotification(to, notification);
    } else {
      // send email
    }
    bookingHistory.create({
      date: time.currentDate,
      time: time.currentTime,
      bookingId,
      bookingStatusId: 21,
    });

    var arrived = bookingData.packages.filter((ele) => ele.arrived == "arrived");
    const totalWeight = bookingData.consolidation ? calculateWeights([{ actualWeight: bookingData.weight, actualVolume: bookingData.volume }], bookingData.logisticCompany.divisor) : calculateWeights(arrived, bookingData.logisticCompany.divisor);;
    const to = ['sigidevelopers@gmail.com'];
    let name = bookingData.receiverName
    if (bookingData.customer) {
      to.push(bookingData.customer.email)
      name = bookingData.customer.firstName
    } else {
      to.push(bookingData.receiverEmail)
    }
    const consolidation = bookingData.consolidation ? 'Yes' : 'No';

    handOverToCustomerMail(to, name, bookingData.trackingId, arrived.length, bookingData.logisticCompany.title, consolidation, totalWeight.chargedWeight, bookingData.total)


    return res.json(returnFunction("1", "Order Completed Successfully", {}, ""));
  } else {
    res.json(
      returnFunction(
        "0",
        "Internal server error (404)",
        {},
        "Please try again later"
      )
    );
  }
}

/*
  ! Company Address ______________________________________________
*/

/*
 *  1. Add Company Address  ___________________________________
 */

async function addAddress(req, res) {
  const wharehouseId = req.user.id;
  const {
    streetAddress,
    district,
    city,
    province,
    country,
    postalCode,
    lat,
    lng,
    type,
  } = req.body;
  req.body.status = true;
  req.body.warehouseId = wharehouseId;
  2;
  console.log(
    "Ã°Å¸Å¡â‚¬ ~ file: warehouse.js:1365 ~ addAddress ~ req.body:",
    req.body
  );

  const entity = await addressDBS.findOne({
    where: {
      warehouseId: wharehouseId,
      country,
      type,
      province,
      district,
      city,
      lat,
      lng,
      streetAddress,
      postalCode,
      status: true,
    },
  });
  if (entity) {
    throw CustomException(
      "Already Exist",
      "You have already saved this Address"
    );
  }
  const address = await addressDBS.create(req.body);
  const output = {
    id: address.id,
    country: address.country,
    province: address.province,
    district: address.district,
    city: address.city,
    lat: address.lat,
    lng: address.lng,
    streetAddress: address.streetAddress,
  };
  return res.json(returnFunction("1", "Address Added", output, ""));
}

/*
 *  2. Get All Company Address  ___________________________________
 */

async function getAddress(req, res) {
  const warehouseId = req.user.id;
  const condition = req.query.type
    ? { warehouseId, deleted: 0, status: true, type: req.query.type }
    : { warehouseId, deleted: 0, status: true };
  //get all addresses which are not deleted
  const address = await addressDBS.findAll({
    where: condition,
    attributes: [
      "id",
      "title",
      "streetAddress",
      "building",
      "building",
      "floor",
      "apartment",
      "lat",
      "lng",
      "district",
      "city",
      "province",
      "country",
      "postalCode",
    ],
  });
  return res.json(returnFunction("1", "Success", address, ""));
}
/*
 *  3. GetAddress By Id ___________________________________
 */

async function getAddressById(req, res) {
  const warehouseId = req.user.id;
  const addressId = req.params.id;
  //get all addresses which are not deleted
  const companyAddress = await addressDBS.findOne({
    where: { id: addressId, warehouseId, deleted: 0, status: true },
    attributes: [
      "id",
      "title",
      "streetAddress",
      "building",
      "building",
      "floor",
      "apartment",
      "lat",
      "lng",
      "district",
      "city",
      "province",
      "country",
      "postalCode",
    ],
  });
  // if (!companyAddress) {
  //     throw CustomException('No Address Found', 'Incorrect id for the address');
  // }
  return res.json(returnFunction("1", "Success", companyAddress, ""));
}

/*
 *  3. Update Address  ___________________________________
 */

async function updateAddress(req, res) {
  const companyId = req.user.id;
  let { id, ...data } = req.body;
  const {
    country,
    province,
    district,
    city,
    streetAddress,
    lat,
    lng,
    postalCode,
    type,
  } = data;
  const entity = await addressDBS.findOne({
    where: {
      warehouseId: companyId,
      country,
      province,
      district,
      city,
      lat,
      lng,
      streetAddress,
      postalCode,
      type,
      status: true,
    },
  });
  if (entity) {
    throw CustomException(
      "Already Exist",
      "You have already saved this Address"
    );
  }
  const companyAddress = await addressDBS.update(data, { where: { id } });
  if (companyAddress[0] == 0) {
    throw CustomException("Not Updated", "Something went Wrong");
  }
  return res.json(returnFunction("1", "Address Updated", companyAddress, ""));
}

/*
 *  3. Delete Address  ___________________________________
 */

async function deleteAddress(req, res) {
  const { addressId } = req.body;
  const deletedAddress = await addressDBS.update(
    { deleted: true, status: false },
    { where: { id: addressId } }
  );
  if (deletedAddress === 0) {
    return res.status(404).json({ message: "Address not found" });
  }
  return res.json(returnFunction("1", "Deleted Successfully", {}, ""));
}

// ! Module 6: Order Placing
/*
            1. All related Ids
    ________________________________________
*/
async function idsForBooking(req, res) {
  let outObj = await idsFunction();
  return res.json(returnFunction("1", "All related Ids", outObj, ""));
}
/*
            2.  Search Addresses - DBS
    ________________________________________
*/
async function searchAddress(req, res) {
  const { text } = req.body;
  let addresses = await textSearchAddress(text);
  return res.json(returnFunction("1", "Filtered Addresses", { addresses }, ""));
}
/*
            3. Get charges
*/
async function getCharges(req, res) {
  const warehouseId = req.user.id;
  const retObj = await chargeCalculation(req.body, "warehouse", warehouseId);
  return res.json(returnFunction("1", "All Charges", retObj, ""));
}

async function checkCouponValidity(req, res) {
  const { code, senderEmail } = req.body;
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
  //console.log(Date.parse(cDT)> Date.parse(startDT) && Date.parse(cDT)< Date.parse(endDT) )
  if (
    !(
      Date.parse(cDT) > Date.parse(startDT) &&
      Date.parse(cDT) < Date.parse(endDT)
    )
  )
    throw new CustomException("Coupon-code expired", "Please try a valid code");
  //check if the Coupon is already applied by same user
  const alreadyAppliedByUser = await booking.findOne({
    where: { couponId: existCoupon.id, paymentConfirmed: true, senderEmail },
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
  return res.json(returnFunction("1", "Coupon Applied", data, ""));
}
/*
 *  3. create Order  ___________________________________
 */
async function createOrder(req, res) {
  replaceEmptyStringsWithNull(req.body);
  const { bookingData, packageData } = req.body;
  //just for creating bookingDetails
  const billingData = ({
    subTotal,
    discount,
    total,
    distanceCharge,
    weightCharge,
    categoryCharge,
    packingCharge,
    serviceCharge,
    gstCharge,
  } = bookingData);
  let companyId = req.user.id;

  //^ ETA Calculation{
  // const pickupAddress = await addressDBS.findByPk(bookingData.pickupAddressId, {
  //     attributes: ['streetAddress', 'lat', 'lng', 'district', 'city', 'province', 'country'],
  //   });

  // const dropOffAddress = await addressDBS.findByPk(bookingData.dropoffAddressId, {
  //     attributes: ['streetAddress', 'lat', 'lng', 'district', 'city', 'province', 'country']
  //   });

  // calculate Distance between pickup address and dropoff address
  // const bookingDistance = await getDistance(
  //   pickupAddress.lat,
  //   pickupAddress.lng,
  //   dropOffAddress.lat,
  //   dropOffAddress.lng
  // );

  //&getting Current system units
  const systemUnitId = await currentAppUnitsId();

  //^Adding some Important data Before Insert
  bookingData.bookingStatusId = 10; //TODO recevied at warehouse id add into this
  bookingData.receivingWarehouseId = companyId;
  // bookingData.ETA = ETA;
  // bookingData.distance = bookingDistance;//TODO not decided about it
  bookingData.status = true;
  // bookingData.bookingTypeId= 1;
  // bookingData.shipmentTypeId=1;
  // bookingData.logisticCompanyId=1;
  bookingData.appUnitId = systemUnitId;
  // "stripePaymentIntentId":"pi_3NY5GiIUi1Nn55FG2QlPfJSu" //TODO payment integration,
  //^ Create Booking
  const bookingCreated = await booking.create(bookingData);

  //^ Create a unique tracking ID
  let trackingId = otpGenerator.generate(6, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: true,
    specialChars: false,
  });
  trackingId = `TSH-${bookingCreated.id}-${trackingId}`;
  // Update

  //^ Creating Booking History
  const time = getDateAndTime();
  let bokingHistory = {
    date: time.currentDate,
    time: time.currentTime,
    bookingId: bookingCreated.id,
    bookingStatusId: 7,
  };
  await bookingHistory.create(bokingHistory);
  bokingHistory = {
    date: time.currentDate,
    time: time.currentTime,
    bookingId: bookingCreated.id,
    bookingStatusId: 8,
  };
  await bookingHistory.create(bokingHistory);
  bokingHistory = {
    date: time.currentDate,
    time: time.currentTime,
    bookingId: bookingCreated.id,
    bookingStatusId: bookingCreated.bookingStatusId,
  };
  await bookingHistory.create(bokingHistory);

  // let totalWeight=totalVolume=totalLength=totalWidth=totalHeight=0;
  // const barcode = customBarcodeGenerator(trackingId);
  // for (const obj of packageData) {
  //     obj.bookingId = bookingCreated.id;
  //     totalWeight += (obj.weight*1)
  //     totalLength += (obj.length*1)
  //     totalWidth += (obj.width*1)
  //     totalHeight += (obj.height*1)
  // }
  // totalVolume =totalLength*totalWidth*totalHeight;
  //& update bookings
  //   await booking.update({trackingId,barcode,weight:totalWeight,length:totalLength,height:totalHeight,width:totalWidth,volume:totalVolume}, {where: {id: bookingCreated.id}});
  await booking.update({ trackingId }, { where: { id: bookingCreated.id } });
  //^ creating billing details
  billingData.bookingId = bookingCreated.id; // Must add bookingId FK in billingDetails
  // billingData.pickupDriverEarning= total - await adminEarning(total); // Add Driver earning in billingDetails
  // TODO add admin earning and pickup driver earnings
  await billingDetails.create(billingData);
  // let weightOfAllPacksages = 0;
  // for (const obj of packageData) {
  //   weightOfAllPacksages += obj.weight;
  //   obj.bookingId = bookingCreated.id;
  // }
  // comment:weight is more than 1000
  // if (weightOfAllPacksages > 1000) {
  //   //TODO the value will be decided after the meeting.
  //   booking.update(
  //     { bookingStatusId: 3 },
  //     { where: { id: bookingCreated.id } }
  //   );
  //   const bokingHistory = {
  //     date: time.currentDate,
  //     time: time.currentTime,
  //     bookingId: bookingCreated.id,
  //     bookingStatusId: 3,
  //   };
  //   bookingHistory.create(bokingHistory);
  // }

  //^ adding all parcels of this order along with booking id in package table
  for (obj of packageData) {
    obj.arrived = 'arrived'
    obj.bookingId = bookingCreated.id
  }
  await package.bulkCreate(packageData);

  //TODO Units Conversions
  return res.json(
    returnFunction("1", "Created", { bookingId: bookingCreated.id }, "")
  );
}

/*
 *  # package recived  ___________________________________
 */

// async function packageArrived(req, res) {
//   const { id, arrived } = req.body;
//   console.log("ðŸš€ ~ packageArrived ~ req.body:", req.body)
//   let pack = await package.findByPk(id, {
//     include: [{
//       model: booking,
//       include: [{
//         model: user,
//         as: "customer",
//         include: { model: deviceToken, attributes: ["tokenId"] },
//       }, { model: logisticCompany, attributes: ['title'] }],
//     }, { model: ecommerceCompany, attributes: ['title'] }],
//   });
//   if (pack.booking.customer.deviceTokens) {
//     let to = pack.booking.customer.deviceTokens.map((inEle) => {
//       return inEle.tokenId;
//     })
//     let notification;
//     if (arrived === 'arrived') {
//       notification = {
//         title: `Package # ${pack.id} Arrived at Warehouse`,
//         body: `We've received a ${pack.ecommerceCompany.title} package with tracking number # ${pack.trackingNum} at our USA warehouse.`,
//       };
//     }
//     else {
//       notification = {
//         title: `Package Removed from Order`,
//         body: `One package in order #${pack.bookingId} hasn't arrived. It's been removed to avoid delays. Revised order is processing.`,
//       };
//     }
//     sendNotification(to, notification, { id: pack.booking.id, bookingStatusId: pack.booking.bookingStatusId });
//   }
//   pack.arrived = arrived;
//   await pack.save();
//   const allPackages = await package.findAll({
//     where: { bookingId: pack.bookingId },
//     attributes: ["arrived",],
//   });
//   const pendingPackages = allPackages.filter(
//     (e) => e.arrived === "pending"
//   ).length;
//   const rejectedPackages = allPackages.filter(
//     (e) => e.arrived === "neverArrived"
//   ).length;
//   if (rejectedPackages === allPackages.length) {
//     await booking.update(
//       { bookingStatusId: 19 },
//       { where: { id: pack.bookingId } }
//     );
//     const time = getDateAndTime();
//     const bokingHistory = {
//       date: time.currentDate,
//       time: time.currentTime,
//       bookingId: pack.bookingId,
//       bookingStatusId: 19,
//     };
//     await bookingHistory.create(bokingHistory);
//     if (pack.booking.customer.deviceTokens) {
//       let to = pack.booking.customer.deviceTokens.map((inEle) => {
//         return inEle.tokenId;
//       })
//       let notification = {
//         title: `Order Canceled`,
//         body: `We've canceled the Order #${pack.bookingId} as package(s) never arrived`,
//       }
//       sendNotification(to, notification, { id: pack.booking.id, bookingStatusId: pack.booking.bookingStatusId });
//     }
//   } else if (pendingPackages == 0) {
//     await booking.update(
//       { bookingStatusId: 7 },
//       { where: { id: pack.bookingId } }
//     );
//     const time = getDateAndTime();
//     const bokingHistory = {
//       date: time.currentDate,
//       time: time.currentTime,
//       bookingId: pack.bookingId,
//       bookingStatusId: 7,
//     };
//     await bookingHistory.create(bokingHistory);
//     if (pack.booking.customer.deviceTokens) {
//       let to = pack.booking.customer.deviceTokens.map((inEle) => {
//         return inEle.tokenId;
//       })
//       let notification = {
//         title: `Order Received`,
//         body: `Your order #${pack.bookingId} has arrived in the USA warehouse. Processing begins soon.`,
//       }
//       sendNotification(to, notification, { id: pack.booking.id, bookingStatusId: pack.booking.bookingStatusId });
//       // Email
//       const consolidation = pack.booking.consolidation == true ? 'yes' : 'no';
//       const datePortion = String(pack.booking.createdAt).substring(4, 15);

//       arriveUsaMail([pack.booking.customer.email, 'sigidevelopers@gmail.com'],
//         pack.booking.customer.firstName,
//         pack.booking.trackingId,
//         `${allPackages.length}`,
//         rejectedPackages,
//         consolidation,
//         pack.booking.logisticCompany.title,
//         datePortion,
//         'supportEmail@gmail.com', '2903218309128'//TODO replace
//       )
//     }
//   }

//   if (pack)
//     return res.json(
//       returnFunction("1", "Package Status updated succssfully", {}, "")
//     );
//   return res.json(
//     returnFunction("0", "Internal server error (404)", {}, "Package Not found!")
//   );
// }
async function packageArrived(req, res) {
  const { id, arrived } = req.body;
  console.log("🚀 ~ packageArrived ~ req.body:", req.body)
  let pack = await package.findByPk(id, {
    include: [{
      model: booking,
      include: [{
        model: user,
        as: "customer",
        include: { model: deviceToken, attributes: ["tokenId"] },
      }, { model: logisticCompany, attributes: ['title'] }],
    }, { model: ecommerceCompany, attributes: ['title'] }],
  });
  if (pack.booking.customer.deviceTokens) {
    let to = pack.booking.customer.deviceTokens.map((inEle) => {
      return inEle.tokenId;
    })
    let notification;
    if (arrived === 'arrived') {
      notification = {
        title: `Package # ${pack.id} Arrived at Warehouse`,
        body: `We've received a ${pack.ecommerceCompany.title} package with tracking number # ${pack.trackingNum} at our USA warehouse.`,
      };
    }
    else {
      notification = {
        title: `Package Removed from Order`,
        body: `One package in order #${pack.bookingId} hasn't arrived. It's been removed to avoid delays. Revised order is processing.`,
      };
    }
    sendNotification(to, notification, { id: pack.booking.id, bookingStatusId: pack.booking.bookingStatusId });
  }
  pack.arrived = arrived;
  await pack.save();
  const allPackages = await package.findAll({
    where: { bookingId: pack.bookingId },
    attributes: ["arrived",],
  });
  const pendingPackages = allPackages.filter(
    (e) => e.arrived === "pending"
  ).length;
  const rejectedPackages = allPackages.filter(
    (e) => e.arrived === "neverArrived"
  ).length;
  if (rejectedPackages === allPackages.length) {
    await booking.update(
      { bookingStatusId: 19 },
      { where: { id: pack.bookingId } }
    );
    const time = getDateAndTime();
    const bokingHistory = {
      date: time.currentDate,
      time: time.currentTime,
      bookingId: pack.bookingId,
      bookingStatusId: 19,
    };
    await bookingHistory.create(bokingHistory);
    if (pack.booking.customer.deviceTokens) {
      let to = pack.booking.customer.deviceTokens.map((inEle) => {
        return inEle.tokenId;
      })
      let notification = {
        title: `Order Canceled`,
        body: `We've canceled the Order #${pack.bookingId} as package(s) never arrived`,
      }
      sendNotification(to, notification, { id: pack.booking.id, bookingStatusId: pack.booking.bookingStatusId });
    }

  } else if (pendingPackages === 0) {
    await booking.update(
      { bookingStatusId: 7 },
      { where: { id: pack.bookingId } }
    );
    const time = getDateAndTime();
    const bokingHistory = {
      date: time.currentDate,
      time: time.currentTime,
      bookingId: pack.bookingId,
      bookingStatusId: 7,
    };
    await bookingHistory.create(bokingHistory);
    if (pack.booking.customer.deviceTokens) {
      let to = pack.booking.customer.deviceTokens.map((inEle) => {
        return inEle.tokenId;
      })
      let notification = {
        title: `Order Received`,
        body: `Your order #${pack.bookingId} has arrived in the USA warehouse. Processing begins soon.`,
      }
      sendNotification(to, notification, { id: pack.booking.id, bookingStatusId: pack.booking.bookingStatusId });
      // Email
      const consolidation = pack.booking.consolidation == true ? 'yes' : 'no';
      const datePortion = String(pack.booking.createdAt).substring(4, 15);

      arriveUsaMail([pack.booking.customer.email, 'sigidevelopers@gmail.com'],
        pack.booking.customer.firstName,
        pack.booking.trackingId,
        `${allPackages.length}`,
        rejectedPackages,
        consolidation,
        pack.booking.logisticCompany.title,
        datePortion,
        'supportEmail@gmail.com', '2903218309128'//TODO replace
      )
    }
  }

  if (pack)
    return res.json(
      returnFunction("1", "Package Status updated succssfully", {}, "")
    );
  return res.json(
    returnFunction("0", "Internal server error (404)", {}, "Package Not found!")
  );
}



//create Order for Never received packages when the yare in the received Status
async function OrderForNeverReceivedPkg(req, res) {
  const pkgId = req.params.pkgId
  const {arrived}=req.body;

  const pkg = await package.findByPk(pkgId, {
    include: [{
      model: booking,
      include: [{
        model: user,
        as: 'customer',
      }]
    }]
  })
  //console.log("🚀 ~ OrderForNeverReceivedPkg ~ pkg:", pkg)

  const userData = pkg.booking.customer;
  console.log("🚀 ~ OrderForNeverReceivedPkg ~ userData:", userData)
  const bookingData = pkg.booking;
  const createBooking = await booking.create({
    senderName: `${userData.firstName} ${userData.lastName}`,
    senderEmail: userData.email,
    senderPhone: `${userData.phoneNum}`,
    subTotal: 0,
    discount: 0,
    total: 0,
    distance: 0,
    status: true,
    paymentConfirmed: false,
    rated: bookingData.rated,
    consolidation: bookingData.consolidation,
    appUnitId: bookingData.appUnitId,
    bookingTypeId: 1,
    logisticCompanyId: 1,
    customerId: userData.id,
    pickupAddressId: bookingData.pickupAddressId,
    receivingWarehouseId: bookingData.receivingWarehouseId,
    bookingStatusId: 1,
    bookingTypeId: bookingData.bookingTypeId,
    logisticCompanyId: bookingData.logisticCompanyId,

    //deliveryWarehouseId,
    // deliveryTypeId
  })

  let trackingId = otpGenerator.generate(6, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
  trackingId = `TSH-${createBooking.id}-${trackingId}`;
  // Creating barcode
  JsBarcode(svgNode, trackingId, {
    xmlDocument: document,
  });
  const svgText = xmlSerializer.serializeToString(svgNode);
  svg2img(svgText, function (error, buffer) {
    //returns a Buffer
    fs.writeFileSync(`Public/Barcodes/${trackingId}.png`, buffer);
  });



  await booking.update(
    {
      trackingId,
      barcode: `Public/Barcodes/${trackingId}.png`,
    },
    { where: { id: createBooking.id } }
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


  await package.update({
    bookingId: createBooking.id,
  }, {
    where: { id: pkgId }
  })


  let pack = await package.findOne({
    where: { id: pkgId },
    include: [
      {
        model: booking,
        include: [
          {
            model: user,
            as: "customer",
            include: { model: deviceToken, attributes: ["tokenId"] },
          },
          { model: logisticCompany, attributes: ['title'] },
        ],
      },
      { model: ecommerceCompany, attributes: ['title'] },
    ],
  });
  console.log("🚀 ~ OrderForNeverReceivedPkg ~ pack:", pack)
  if (pack.booking.customer.deviceTokens) {
    let to = pack.booking.customer.deviceTokens.map((inEle) => {
      return inEle.tokenId;
    })
    let notification;
    if (arrived === 'arrived') {
      notification = {
        title: `Package # ${pack.id} Arrived at Warehouse`,
        body: `We've received a ${pack.ecommerceCompany.title} package with tracking number # ${pack.trackingNum} at our USA warehouse.`,
      };
    }
    else {
      notification = {
        title: `Package Removed from Order`,
        body: `One package in order #${pack.bookingId} hasn't arrived. It's been removed to avoid delays. Revised order is processing.`,
      };
    }
    sendNotification(to, notification, { id: pack.booking.id, bookingStatusId: pack.booking.bookingStatusId });
  }
  pack.arrived = arrived;
  await pack.save();

    await booking.update(
      { bookingStatusId: 7 },
      { where: { id: pack.bookingId } }
    );
    const time = getDateAndTime();
    const bokingHistory = {
      date: time.currentDate,
      time: time.currentTime,
      bookingId: pack.bookingId,
      bookingStatusId: 7,
    };
    await bookingHistory.create(bokingHistory);
    if (pack.booking.customer.deviceTokens) {
      let to = pack.booking.customer.deviceTokens.map((inEle) => {
        return inEle.tokenId;
      })
      let notification = {
        title: `Order Received`,
        body: `Your order #${pack.bookingId} has arrived in the USA warehouse. Processing begins soon.`,
      }
      sendNotification(to, notification, { id: pack.booking.id, bookingStatusId: pack.booking.bookingStatusId });
      // Email
      const consolidation = pack.booking.consolidation == true ? 'yes' : 'no';
      const datePortion = String(pack.booking.createdAt).substring(4, 15);
    }



  return res.json(returnFunction("1", "Order Created for Package", createBooking));

}

/*
 *  # create remesurements  ___________________________________
 */


// async function createRemeasurement(req, res) {
//   const { id, ...data } = req.body;
//   const detail = await package.findByPk(id, {
//     include: [{ model: booking, attributes: ["appUnitId"] }],
//     attributes: [],
//   });
//   console.log("ðŸš€ ~ createRemeasurement ~ detail:", detail)
//   const units = await unitsSymbolsAndRates(detail.booking.appUnitId);
//   data.actualWeight = convertToBaseUnits(
//     data.actualWeight,
//     units.conversionRate.weight
//   );
//   data.actualLength = convertToBaseUnits(
//     data.actualLength,
//     units.conversionRate.length
//   );
//   data.actualWidth = convertToBaseUnits(
//     data.actualWidth,
//     units.conversionRate.length
//   );
//   data.actualHeight = convertToBaseUnits(
//     data.actualHeight,
//     units.conversionRate.length
//   );
//   data.actualVolume = convertToBaseUnits(
//     data.actualVolume,
//     units.conversionRate.length
//   );
//   const pack = await package.findByPk(id, {
//     include: [{
//       model: booking,
//       include: {
//         model: user,
//         as: "customer",
//         include: { model: deviceToken, attributes: ["tokenId"] },
//       },
//     }, { model: ecommerceCompany, attributes: ['title'] }],
//     where: {
//       arrived: {
//         [Op.eq]: [
//           { arrived: "arrived" },
//         ],
//       }
//     }
//   });
//   //console.log("ðŸš€ ~ createRemeasurement ~ pack:", pack.booking.id)
//   //return res.json(pack)
//   pack.actualWeight = parseFloat(data.actualWeight);
//   pack.actualLength = parseFloat(data.actualLength);
//   pack.actualWidth = parseFloat(data.actualWidth);
//   pack.actualHeight = parseFloat(data.actualHeight);
//   pack.actualVolume = parseFloat(data.actualVolume);
//   pack.categoryId = parseFloat(data.category);
//   await pack.save();
//   const allPackages = await package.findAll({
//     where: { bookingId: pack.bookingId, actualWeight: 0 },
//   });
//   if (allPackages.length == 0) {
//     const parcels = await package.findAll({
//       where: { bookingId: pack.bookingId, arrived: 'arrived' },
//     });
//     const total = calculateTotalValues(parcels)
//     await booking.update(
//       {
//         bookingStatusId: 8,
//         weight: parseFloat(total.weight),
//         length: parseFloat(total.length),
//         width: parseFloat(total.width),
//         height: parseFloat(total.height),
//         volume: parseFloat(total.volume)
//       },
//       { where: { id: pack.bookingId } }
//     );
//     const time = getDateAndTime();
//     // let bokingHistory = {
//     //   date: time.currentDate,
//     //   time: time.currentTime,
//     //   bookingId: pack.bookingId,
//     //   bookingStatusId: 8,
//     // };
//     await bookingHistory.create({
//       date: time.currentDate,
//       time: time.currentTime,
//       bookingId: pack.bookingId,
//       bookingStatusId: 8,
//     });
//     if (pack.booking?.customer?.deviceTokens) {
//       let to = pack.booking.customer.deviceTokens.map((inEle) => {
//         return inEle.tokenId;
//       })
//       let notification = {
//         title: `Re-measurement Complete`,
//         body: `Re-measurement is complete of Order ${pack.bookingId}. Provide delivery info, receiver details, select shipping, and pay for swift delivery`,
//       }
//       sendNotification(to, notification, { id: pack.booking.id, bookingStatusId: pack.booking.bookingStatusId });
//     }
//     let bookingData = await booking.findOne({
//       where: { id: pack.bookingId },
//       include: [
//         {
//           model: user,
//           as: "customer",
//           attributes: ["firstName", "email"],
//         },
//         {
//           model: package,
//           attributes: [
//             "arrived",
//             "actualWeight",
//             "actualVolume"
//           ],
//         },
//         { model: logisticCompany, attributes: ['title', 'divisor'] },
//         // {model: warehouse, as: 'receivingWarehouse', attributes: ['id']}
//       ],
//       attributes: ['receiverName', 'receiverEmail', 'createdAt', 'consolidation', 'trackingId', 'total']
//     });
//     //  res.json({bookingData})

//     var arrived = bookingData.packages.filter((ele) => ele.arrived == "arrived");
//     const totalWeight = calculateWeights(arrived, bookingData.logisticCompany.divisor);
//     console.log("ðŸš€ ~ createRemeasurement ~ totalWeight:", totalWeight)
//     const to = ['sigidevelopers@gmail.com'];
//     let name = bookingData.receiverName
//     if (bookingData.customer) {
//       to.push(bookingData.customer.email)
//       name = bookingData.customer.firstName
//     } else {
//       to.push(bookingData.receiverEmail)
//     }
//     const consolidation = bookingData.consolidation ? 'Yes' : 'No';

//     remeasurementMail(to, name, bookingData.trackingId, arrived.length, consolidation, totalWeight.chargedWeight)
//   }
//   if (pack)
//     return res.json(
//       returnFunction(
//         "1",
//         "Package remesurements are updated succssfully",
//         {},
//         ""
//       )
//     );
//   return res.json(
//     returnFunction("0", "404", {}, "Package Not found!")
//   );
// }
async function createRemeasurement(req, res) {
  const { id, ...data } = req.body;
  const detail = await package.findOne({
    where: { 
      id: id,
      arrived:'arrived' 
    },
    include: [{ model: booking, attributes: ["appUnitId"] }],
    attributes: [],
  });
  
  console.log("🚀 ~ createRemeasurement ~ detail:", detail)
  const units = await unitsSymbolsAndRates(detail.booking.appUnitId);
  data.actualWeight = convertToBaseUnits(
    data.actualWeight,
    units.conversionRate.weight
  );
  data.actualLength = convertToBaseUnits(
    data.actualLength,
    units.conversionRate.length
  );
  data.actualWidth = convertToBaseUnits(
    data.actualWidth,
    units.conversionRate.length
  );
  data.actualHeight = convertToBaseUnits(
    data.actualHeight,
    units.conversionRate.length
  );
  data.actualVolume = convertToBaseUnits(
    data.actualVolume,
    units.conversionRate.length
  );
  const pack = await package.findOne({
    where: {
      id: id, // Specify the primary key condition
      arrived: "arrived" // Condition for the arrived status
    },
    include: [
      {
        model: booking,
        include: {
          model: user,
          as: "customer",
          include: { model: deviceToken, attributes: ["tokenId"] },
        },
      },
      {
        model: ecommerceCompany,
        attributes: ['title']
      }
    ]
  });
  
  //console.log("🚀 ~ createRemeasurement ~ pack:", pack.booking.id)
  //return res.json(pack)
  pack.actualWeight = parseFloat(data.actualWeight);
  pack.actualLength = parseFloat(data.actualLength);
  pack.actualWidth = parseFloat(data.actualWidth);
  pack.actualHeight = parseFloat(data.actualHeight);
  pack.actualVolume = parseFloat(data.actualVolume);
  pack.categoryId = parseFloat(data.category);
  await pack.save();
  const allPackages = await package.findAll({
    where: { bookingId: pack.bookingId, actualWeight: 0,arrived:'arrived' },
  });
   console.log("==================>allPackages==============",allPackages)
  if (allPackages.length === 0) {
    const parcels = await package.findAll({
      where: { bookingId: pack.bookingId, arrived: 'arrived' },
    });
    const total = calculateTotalValues(parcels)
    console.log("==================>total==============",total)
    await booking.update(
      {
        bookingStatusId: 8,
        weight: parseFloat(total.weight),
        length: parseFloat(total.length),
        width: parseFloat(total.width),
        height: parseFloat(total.height),
        volume: parseFloat(total.volume)
      },
      { where: { id: pack.bookingId } }
    );
    const time = getDateAndTime();
    // let bokingHistory = {
    //   date: time.currentDate,
    //   time: time.currentTime,
    //   bookingId: pack.bookingId,
    //   bookingStatusId: 8,
    // };
    await bookingHistory.create({
      date: time.currentDate,
      time: time.currentTime,
      bookingId: pack.bookingId,
      bookingStatusId: 8,
    });
    if (pack.booking?.customer?.deviceTokens) {
      let to = pack.booking.customer.deviceTokens.map((inEle) => {
        return inEle.tokenId;
      })
      let notification = {
        title: `Re-measurement Complete`,
        body: `Re-measurement is complete of Order ${pack.bookingId}. Provide delivery info, receiver details, select shipping, and pay for swift delivery`,
      }
      sendNotification(to, notification, { id: pack.booking.id, bookingStatusId: pack.booking.bookingStatusId });
    }
    let bookingData = await booking.findOne({
      where: { id: pack.bookingId },
      include: [
        {
          model: user,
          as: "customer",
          attributes: ["firstName", "email"],
        },
        {
          model: package,
          attributes: [
            "arrived",
            "actualWeight",
            "actualVolume"
          ],
        },
        { model: logisticCompany, attributes: ['title', 'divisor'] },
        // {model: warehouse, as: 'receivingWarehouse', attributes: ['id']}
      ],
      attributes: ['receiverName', 'receiverEmail', 'createdAt', 'consolidation', 'trackingId', 'total']
    });
    //  res.json({bookingData})

    var arrived = bookingData.packages.filter((ele) => ele.arrived == "arrived");
    const totalWeight = calculateWeights(arrived, bookingData.logisticCompany.divisor);
    console.log("🚀 ~ createRemeasurement ~ totalWeight:", totalWeight)
    const to = ['sigidevelopers@gmail.com'];
    let name = bookingData.receiverName
    if (bookingData.customer) {
      to.push(bookingData.customer.email)
      name = bookingData.customer.firstName
    } else {
      to.push(bookingData.receiverEmail)
    }
    const consolidation = bookingData.consolidation ? 'Yes' : 'No';

    remeasurementMail(to, name, bookingData.trackingId, arrived.length, consolidation, totalWeight.chargedWeight)
  }
  if (pack)
    return res.json(
      returnFunction(
        "1",
        "Package remesurements are updated succssfully",
        {},
        ""
      )
    );
  return res.json(
    returnFunction("0", "404", {}, "Package Not found!")
  );
}

/*
  consolidation remesurements
    _________________________________________
*/

async function consolidationRemesurements(req, res) {
  const { id, ...data } = req.body;
  const booked = await booking.findByPk(id, {
    attributes: [],
    include: [
      {
        model: user,
        as: "customer",
        attributes: ["firstName", "email"],
        include: { model: deviceToken, attributes: ["tokenId"] },
      },
      { model: logisticCompany, attributes: ["title", 'divisor'] },
      {
        model: package,
        attributes: [
          "arrived",
          "actualWeight",
          "actualVolume"
        ],
      },
      // {model: warehouse, as: 'receivingWarehouse', attributes: ['id']}
    ],
    attributes: ['receiverName', 'receiverEmail', 'createdAt', 'volume', 'length', 'width', 'height', 'weight', 'consolidation', 'trackingId', 'total', "appUnitId"]
  });
  if (!booked["appUnitId"] || !booked.consolidation) {
    return res.json(
      returnFunction("0", "Booking Not Found", {}, "Booking Not found!")
    );
  }
  const units = await unitsSymbolsAndRates(booked["appUnitId"]);
  data["weight"] = convertToBaseUnits(
    data["weight"],
    units.conversionRate.weight
  );
  data["length"] = convertToBaseUnits(
    data["length"],
    units.conversionRate.length
  );
  data["width"] = convertToBaseUnits(
    data["width"],
    units.conversionRate.length
  );
  data["height"] = convertToBaseUnits(
    data["height"],
    units.conversionRate.length
  );
  data["volume"] = convertToBaseUnits(
    data["volume"],
    units.conversionRate.length
  );
  data.bookingStatusId = 8;
  await booking.update(data, { where: { id, consolidation: 1 } });
  const time = getDateAndTime();
  let bokingHistory = {
    date: time.currentDate,
    time: time.currentTime,
    bookingId: id,
    bookingStatusId: 8,
  };
  await bookingHistory.create(bokingHistory)
  if (booked.customer.deviceTokens) {
    let to = booked.customer.deviceTokens.map((inEle) => {
      return inEle.tokenId;
    })
    let notification = {
      title: `Consolidation Complete`,
      body: `Re-measurement is complete of Order ${booked.trackingId}. Provide delivery info, receiver details, select shipping, and pay for swift delivery`,
    }
    sendNotification(to, notification, { id: booked.id, bookingStatusId: booked.bookingStatusId });
  }

  var arrived = booked.packages.filter((ele) => ele.arrived == "arrived");
  const totalWeight = booked.consolidation ? calculateWeights([{ actualWeight: booked.weight, actualVolume: booked.volume }], booked.logisticCompany.divisor) : calculateWeights(arrived, booked.logisticCompany.divisor);
  const to = ['sigidevelopers@gmail.com'];
  let name = booked.receiverName
  if (booked.customer) {
    to.push(booked.customer.email)
    name = booked.customer.firstName
  } else {
    to.push(booked.receiverEmail)
  }
  const consolidation = booked.consolidation ? 'Yes' : 'No';

  remeasurementMail(to, name, booked.trackingId, arrived.length, consolidation, totalWeight.chargedWeight)


  return res.json(
    returnFunction("1", "Booking remesurements are updated succssfully", {}, "")
  );
}

/*
            5. Create Order
    _________________________________________
*/
async function createOrder___(req, res) {
  let {
    instruction,
    senderName,
    senderEmail,
    senderPhone,
    receiverEmail,
    receiverPhone,
    receiverName,
    subTotal,
    discount,
    total,
    pickupAddressId,
    dropoffAddressId,
    bookingTypeId,
    categoryId,
    couponId,
    shipmentTypeId,
    sizeId,
    scheduleSetBy,
    weight,
    length,
    width,
    height,
    unitClassId,
    distanceCharge,
    weightCharge,
    categoryCharge,
    shipmentTypeCharge,
    packingCharge,
    serviceCharge,
    gstCharge,
    catText,
  } = req.body;
  let warehouseId = req.user.id;
  const warehouseData = await warehouse.findByPk(warehouseId, {
    attributes: ["addressDBId"],
  });

  if (couponId == 0) couponId = null;
  let weightUnitId, lengthUnitId, volume;
  const dimensionInput = await mblAppDynamic.findOne({
    where: { systemType: "dimensionInput" },
    attributes: ["value"],
  });
  //return res.json(dimensionInput)
  if (dimensionInput.value === "box") {
    // get units and dimension from box size
    let boxData = await size.findByPk(sizeId);
    weight = boxData.weight;
    length = boxData.length;
    width = boxData.width;
    height = boxData.height;
    volume = boxData.volume;
    weightUnitId = boxData.weightUnitId;
    lengthUnitId = boxData.lengthUnitId;
  } else {
    // getting the dimensions & unit class Id from user
    volume = length * width * height;
    // check if units are from user or default
  }
  //return res.json(sizeId)
  // Nearest warehouse to dropoff
  let deliveryWarehouseId = await findNearestWarehouse(dropoffAddressId);
  // ETA
  const pickupAddress = await addressDBS.findByPk(warehouseData.addressDBId, {
    attributes: ["lat", "lng"],
  });
  const dropOffAddress = await addressDBS.findByPk(dropoffAddressId, {
    attributes: ["lat", "lng"],
  });
  let bookingDistance = await getDistance(
    pickupAddress.lat,
    pickupAddress.lng,
    dropOffAddress.lat,
    dropOffAddress.lng
  );
  // getting the eta from DB
  let etaData = await estimatedBookingDays.findOne({
    where: {
      startValue: { [Op.lte]: bookingDistance },
      endValue: { [Op.gte]: [bookingDistance] },
      shipmentTypeId,
    },
    attributes: ["numOfDays"],
  });
  let ETA = "1990-01-01";
  if (!etaData) {
    let nowDate = Date.now();
    let cDT = new Date(nowDate);
    cDT.setDate(cDT.getDate() + 5);
    ETA = `${cDT.getFullYear()}-${cDT.getMonth() + 1}-${cDT.getDate()}`;
  } else {
    let nowDate = Date.now();
    let cDT = new Date(nowDate);
    cDT.setDate(cDT.getDate() + etaData.numOfDays);
    ETA = `${cDT.getFullYear()}-${cDT.getMonth() + 1}-${cDT.getDate()}`;
  }
  booking
    .create({
      pickupDate: "01-01-1990",
      pickupStartTime: "09:00",
      pickupEndTime: "09:00",
      instruction,
      senderName,
      senderEmail,
      senderPhone,
      receiverEmail,
      receiverPhone,
      receiverName,
      subTotal,
      discount,
      total,
      status: true,
      paymentConfirmed: false,
      scheduleSetBy,
      pickupAddressId: warehouseData.addressDBId,
      dropoffAddressId,
      bookingStatusId: 16,
      bookingTypeId,
      categoryId,
      couponId,
      shipmentTypeId,
      sizeId,
      weight,
      length,
      width,
      height,
      volume,
      weightUnitId,
      lengthUnitId,
      receivingWarehouseId: warehouseId,
      deliveryWarehouseId,
      ETA,
      catText,
      distance: bookingDistance,
    })
    .then((bookingData) => {
      // updatng the booking to create a unique tracking ID
      let trackingId = otpGenerator.generate(6, {
        lowerCaseAlphabets: false,
        upperCaseAlphabets: true,
        specialChars: false,
      });
      trackingId = `PPS-${bookingData.id}-${trackingId}`;
      booking.update({ trackingId }, { where: { id: bookingData.id } });
      // Creating barcode
      JsBarcode(svgNode, trackingId, {
        xmlDocument: document,
      });
      const svgText = xmlSerializer.serializeToString(svgNode);
      svg2img(svgText, function (error, buffer) {
        //returns a Buffer
        fs.writeFileSync(`Public/Images/Barcodes/${trackingId}.png`, buffer);
      });
      booking.update(
        { barcode: `Public/Images/Barcodes/${trackingId}.png` },
        { where: { id: bookingData.id } }
      );
      // creating Booking History
      let dt = Date.now();
      let DT = new Date(dt);
      let currentDate = `${DT.getMonth() + 1
        }-${DT.getDate()}-${DT.getFullYear()}`;
      let currentTime = `${DT.getHours()}:${DT.getMinutes()}:${DT.getSeconds()}`;
      bookingHistory.create({
        date: currentDate,
        time: currentTime,
        bookingId: bookingData.id,
        bookingStatusId: 1,
      });
      // Also received at warehouse
      bookingHistory.create({
        date: currentDate,
        time: currentTime,
        bookingId: bookingData.id,
        bookingStatusId: 5,
      });
      // creating billing details
      billingDetails.create({
        subTotal,
        discount,
        total,
        distanceCharge,
        weightCharge,
        categoryCharge,
        shipmentTypeCharge,
        packingCharge,
        serviceCharge,
        gstCharge,
        bookingId: bookingData.id,
      });
      return res.json(
        returnFunction(
          "1",
          "Booking created",
          { bookingId: bookingData.id },
          ""
        )
      );
    })
    .catch((err) =>
      res.json(
        returnFunction(
          "0",
          "Internal server error (404)",
          {},
          `Sorry for the inconvenience. Please try again later Reason: ${err}`
        )
      )
    );
}
/*
            6. Payment Received
    _________________________________________
*/
async function confirmPayment(req, res) {
  const { bookingId } = req.body;
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
  booking.update(
    { status: true, paymentConfirmed: true, paymentBy: "yappy" },
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
      to: ["sigidevelopers@gmail.com", bookingData.senderEmail], // list of receivers
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
      console.log(info);
    }
  );
  return res.json(returnFunction("1", "Payment successful", {}, ""));
}

// ! Module 7 : Driver Registration
// ! _________________________________________________________________________________________________________________________________
/*
            1. Register Step 1 (basic info)
    ________________________________________
*/
async function registerStep1(req, res) {
  const { firstName, lastName, email, countryCode, phoneNum, password } =
    req.body;
  // check if user with same eamil and phoneNum exists
  // const userExist = await user.findOne({
  //   where: {
  //     [Op.or]: [
  //       { email: email },
  //       { [Op.and]: [{ countryCode: countryCode }, { phonenum: phoneNum }] },
  //     ],
  //     deletedAt: { [Op.is]: null },
  //     userTypeId: 2,
  //   },
  // });
  // // checking if already exits
  // if (userExist) {
  //   if (email === userExist.email)
  //     throw new CustomException(
  //       "Users exists",
  //       "The email you entered is already taken"
  //     );
  //   else
  //     throw new CustomException(
  //       "Users exists",
  //       "The phone number you entered is already taken"
  //     );
  // }
  // Chcking if profile photo is missing
  if (!req.file)
    throw CustomException(
      "Profile Image missing",
      "Please chose drivers image"
    );
  let tmpprofileImage = req.file.path;
  let profileImageName = tmpprofileImage.replace(/\\/g, "/");
  // Hashing the password
  let hashedPassword = await bcrypt.hash(password, 10);
  // creating new user
  try {
    const time = getDateAndTime();
    let verifiedAt = time.currentDate;
    let newUser = await user.create({
      firstName,
      lastName,
      email,
      countryCode,
      phoneNum,
      status: false,
      verifiedAt,
      password: hashedPassword,
      userTypeId: 2,
      image: profileImageName,
    });
    return res.json(
      returnFunction(
        "1",
        "Registration Step 1: Completed",
        { id: newUser.id },
        ""
      )
    );
  }
  catch (err) {
    let error = err.errors[0].message ? err.errors[0].message : err
    if (err.errors[0].path)
      error = err.errors[0].path + ' already exsist';
    return res.json(returnFunction('0', '422', {}, error));
  }
}
/*
            2. Get vehicle Types
*/
async function getActiveVehicleTypes(req, res) {
  const vehicleTypeData = await vehicleType.findAll({
    where: { status: true },
    attributes: ["id", "title", "image"],
  });
  return res.json(
    returnFunction("1", "All available vehicle types", vehicleTypeData, "")
  );
}
/*
            3. Register Step 2(Vehicle data)
    ________________________________________
*/
async function registerStep2(req, res) {
  const {
    vehicleTypeId,
    vehicleMake,
    vehicleModel,
    vehicleYear,
    vehicleColor,
    userId,
  } = req.body;
  if (req.files.length < 1) throw new CustomException("Images not uploaded", "Please upload images");
  const time = getDateAndTime()
  let imagesArr = req.files.map((ele) => {
    let tmpPath = ele.path;
    let imagePath = tmpPath.replace(/\\/g, "/");
    let tmpObj = {
      image: imagePath,
      uploadTime: time.currentDate,
      status: true,
      userId,
    };
    return tmpObj;
  });
  // checking if users data exist
  const detailsExist = await driverDetail.findOne({ where: { userId } });
  //return res.json(detailsExist)
  // Details exist --> update the details
  if (detailsExist) {
    driverDetail.update(
      {
        vehicleMake,
        vehicleModel,
        vehicleYear,
        vehicleColor,
        driverTypeId: 2,
        vehicleTypeId,
      },
      { where: { id: detailsExist.id } }
    );
    // Removing the previous vehicle images and adding the new ones
    let imgStatus = await vehicleImage.update(
      { status: false },
      { where: { userId } }
    );
    await vehicleImage.bulkCreate(imagesArr);
    return res.json(
      returnFunction(
        "1",
        "Registration step 2: Completed",
        { detailsId: detailsExist.id, userId },
        ""
      )
    );
  }
  let newEntry = await driverDetail.create({
    vehicleMake,
    vehicleModel,
    vehicleYear,
    vehicleColor,
    driverTypeId: 2,
    vehicleTypeId,
    userId,
  });
  await vehicleImage.bulkCreate(imagesArr);
  return res.json(
    returnFunction(
      "1",
      "Registration step 2: Completed",
      { detailsId: newEntry.id, userId },
      ""
    )
  );
}

/*
            4. Register Step 2(License Info)
    ________________________________________
*/
async function registerStep3(req, res) {
  const warehouseId = req.user.id;
  //const warehouseId = 1;
  const { licIssueDate, licExpiryDate, userId } = req.body;
  //return res.json(req.files)
  console.log(Object.keys(req.files).length)
  if (Object.keys(req.files).length < 2) throw new CustomException("Images not uploaded", "Please upload images");
  let tmpLicFrontImage = req.files.frontImage[0].path;
  let licFrontImage = tmpLicFrontImage.replace(/\\/g, "/");
  let tmpLicBackImage = req.files.backImage[0].path;
  let licBackImage = tmpLicBackImage.replace(/\\/g, "/");
  await driverDetail.update(
    {
      licIssueDate,
      licExpiryDate,
      licFrontImage,
      licBackImage,
      approvedByAdmin: true,
      driverTypeId: 2,
      warehouseId,
    },
    { where: { userId } }
  );
  await user.update({ status: true }, { where: { id: userId } });
  return res.json(returnFunction("1", "Driver created successfully", {}, ""));
}
// TODO Update driver, delete driver, 

/*
    *    Update Driver
*/
async function updateDriverProfile(req, res) {
  const { firstName, lastName, email, countryCode, phoneNum, userId } = req.body;
  try {
    let updatedUser = await user.update({ firstName, lastName, email, countryCode, phoneNum }, { where: { id: userId } });
    return res.json(returnFunction('1', 'driver Profile Updated', updatedUser, ''));
  }
  catch (err) {
    let error = err.errors[0].message ? err.errors[0].message : err
    if (err.errors[0].path)
      error = err.errors[0].path + ' already exsist';
    return res.json(returnFunction('0', '422', {}, error));
  }
}

/*
*   delete driver  deleted:1
*/

async function deleteUser(req, res) {
  const userId = req.query.id;
  const deliverybookings = await booking.findAll({
    where: {
      [Op.and]: [
        { bookingStatusId: [13, 15, 16, 17] },
        { deliveryDriverId: userId }
      ]
    }
  })
  if (deliverybookings.length > 0) {
    return res.json({
      status: '0',
      message: 'Driver has Bookings',
      data: {},
      error: '',
    });
  }

  await user.update({ status: false, deletedAt: Date.now() }, { where: { id: userId } })

  return res.json({
    status: '1',
    message: 'User deleted successfully',
    data: {},
    error: '',
  })
};




/*
 *  Driver License Update
 */

async function updateDriverLicense(req, res) {
  const { userId, licIssueDate, licExpiryDate, imageUpdated } = req.body;
  let msg = ''
  if (imageUpdated === "true") {
    if (req.files.length === 0) throw CustomException('Images Not Uploaded', '')
    let tmpLicFrontImage = req.files.frontImage[0].path;
    let licFrontImage = tmpLicFrontImage.replace(/\\/g, "/");
    let tmpLicBackImage = req.files.backImage[0].path;
    let licBackImage = tmpLicBackImage.replace(/\\/g, "/");
    await driverDetail.update({ licFrontImage, licBackImage, licIssueDate, licExpiryDate }, { where: { userId: userId } });
    msg = 'License images and Dates'
  } else {
    await driverDetail.update({ licIssueDate, licExpiryDate }, { where: { userId: userId } });
    msg = 'Issue and Expiry Dates Only'
  }
  return res.json(returnFunction('1', 'License Info Updated Successfully', msg, ''));
}




/*
            Driver Details
*/
async function driverDetailsById(req, res) {
  // const {driverId} = req.body;
  const driverId = req.query.id;
  //?IMPROVE F
  const userData1 = await user.findOne({
    where: {
      id: driverId,
    },
    include: [
      {
        model: driverDetail,
        include: [
          { model: vehicleType },
          { model: driverType, attributes: ["name"] },
          { model: warehouse, attributes: ["companyName"] },
        ],
        attributes: {
          exclude: [
            "updatedAt",
            "userId",
            "vehicleTypeId",
            "warehouseId",
            "driverTypeId",
          ],
        },
      },

      {
        model: vehicleImage,
        required: false,
        where: { status: true },
        attributes: ["image"],
      },
      {
        model: booking,
        as: "deliveryDriver",
        include: [
          { model: bookingStatus, attributes: ["id", "title"] },
          {
            model: addressDBS,
            as: "pickupAddress",
            attributes: ["postalCode"],
          },
          {
            model: addressDBS,
            as: "dropoffAddress",
            attributes: ["postalCode"],
          },
        ],
        attributes: ["id", "trackingId", "pickupDate"],
      },
    ],
    attributes: {
      exclude: [
        "password",
        "virtualBox",
      ],
    },
  });
  return res.json(
    returnFunction("1", "Driver Details", { userData1 }, "")
  );

  const userData = await user.findOne(
    {
      where: { id: driverId },
    }, {
    include: [
      {
        model: driverDetail,
        include: [
          { model: vehicleType },
          { model: driverType, attributes: ["name"] },
          { model: warehouse, attributes: ["companyName"] },
        ],
        attributes: {
          exclude: [
            "createdAt",
            "updatedAt",
            "userId",
            "vehicleTypeId",
            "warehouseId",
            "driverTypeId",
          ],
        },
      },
      {
        model: vehicleImage,
        where: { status: true },
        attributes: ["image"],
      },
      // {
      //   model: booking,
      //   as: "receivingDriver",
      //   include: [
      //     { model: bookingStatus, attributes: ["id", "title"] },
      //     {
      //       model: addressDBS,
      //       as: "pickupAddress",
      //       attributes: ["postalCode"],
      //     },
      //     {
      //       model: addressDBS,
      //       as: "dropoffAddress",
      //       attributes: ["postalCode"],
      //     },
      //   ],
      //   attributes: ["id", "trackingId", "pickupDate"],
      // },
      // {
      //   model: booking,
      //   as: "deliveryDriver",
      //   include: [
      //     { model: bookingStatus, attributes: ["id", "title"] },
      //     {
      //       model: addressDBS,
      //       as: "pickupAddress",
      //       attributes: ["postalCode"],
      //     },
      //     {
      //       model: addressDBS,
      //       as: "dropoffAddress",
      //       attributes: ["postalCode"],
      //     },
      //   ],
      //   attributes: ["id", "trackingId", "pickupDate"],
      // },
    ],
  }
  );
  // return res.json({ r: userData });
  let objOut = {
    driverProfile: {
      id: userData.id,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      countryCode: userData.countryCode,
      phoneNum: userData.phoneNum,
      image: userData.image,
    },
    Documents: {
      licIssueDate: userData.driverDetail.licIssueDate,
      licExpiryDate: userData.driverDetail.licExpiryDate,
      licFrontImage: userData.driverDetail.licFrontImage,
      licBackImage: userData.driverDetail.licBackImage,
    },
    vehicleDetails: {
      vehicleMake: userData.driverDetail.vehicleMake,
      vehicleModel: userData.driverDetail.vehicleModel,
      vehicleYear: userData.driverDetail.vehicleYear,
      vehicleColor: userData.driverDetail.vehicleColor,
      vehicleImages: userData.vehicleImages,
    },
    vehicleType: {
      title: userData.driverDetail.vehicleType.title,
      image: userData.driverDetail.vehicleType.image,
    },
    // TODO Driver Earning panding
  };
  // TODO show cancelled bookings as well
  return res.json(returnFunction("1", "Driver Details", userData, ""));
}


/*
    *  Driver vehicle Update
 */

async function updateDriverVehicle(req, res) {
  const { vehicleTypeId, vehicleMake, vehicleModel, vehicleYear, vehicleColor, userId, imgUpdate } = req.body;
  if (imgUpdate === 'true') {
    if (req.files.length < 1) throw new CustomException('Vehicle Images not uploaded', 'Please upload images');
    let imagesArr = req.files.map(ele => {
      let tmpPath = ele.path;
      let imagePath = tmpPath.replace(/\\/g, "/");
      const time = getDateAndTime();
      let tmpObj = {
        image: imagePath,
        uploadTime: time.currentDate,
        status: true,
        userId
      };
      return tmpObj;
    });
  }
  // checking if users data exist
  const detailsExist = await driverDetail.findOne({ where: { userId } });
  //return res.json(detailsExist)
  // Details exist --> update the details
  if (detailsExist) {
    driverDetail.update({ vehicleMake, vehicleModel, vehicleYear, vehicleColor, driverTypeId: 2, vehicleTypeId }, { where: { id: detailsExist.id } });
    // Removing the previous vehicle images and adding the new ones
    if (imgUpdate === 'true') {
      await vehicleImage.update({ status: false }, { where: { userId } });
      await vehicleImage.bulkCreate(imagesArr);
    }
    return res.json(returnFunction('1', 'Driver Vehicle Updated Successfully', {}, ''))
  }
  return res.json(returnFunction('0', 'driver details doesn\'t exisit', {}, 'unable to find driver details for this id'))
};

/*  
      Delete Driver 
*/
async function updateDriverStatus(req, res) {
  const { userId, status } = req.body;
  if (status !== 0 && status !== 1)
    return res.json(returnFunction('0', 'Status doesn\'t exsist for the driver', {}, ''))
  const detailsExist = await driverDetail.findOne({ where: { userId } });
  if (detailsExist) {
    await driverDetail.update({ approvedByAdmin: status }, { where: { userId } });
    await user.update({ status }, { where: { id: userId } });
    return res.json(returnFunction('1', 'Driver Status Updated Successfully', {}, ''))
  }
  return res.json(returnFunction('0', 'Driver Details Doesn\'t Exsist', {}, ''))
};



/*
        5. Get All drivers of specific warehouse 
*/
async function getWarehouseDriversAll(req, res) {
  const warehouseId = req.user.id;
  const driverData = await driverDetail.findAll({
    where: { warehouseId, driverTypeId: 2 },
    include: {
      model: user,
      where: { deletedAt: null },
      attributes: [
        "id",
        "firstName",
        "lastName",
        "image",
        "countryCode",
        "phoneNum",
        "status",
      ],
    },
    attributes: {
      exclude: [
        "id",
        "createdAt",
        "updatedAt",
        "driverTypeId",
        "userId",
        "vehicleTypeId",
        "warehouseId",
      ],
    },
  });
  return res.json(
    returnFunction("1", "All drivers of warehouse", driverData, "")
  );
}

// ! Module 8 : Completed Bookings
// ! _________________________________________________________________________________________________________________________________
async function completedBookings(req, res) {
  const warehouseId = req.user.id;
  const bookingData = await booking.findAll({
    where: {
      paymentConfirmed: true,
      [Op.or]: [
        { receivingWarehouseId: warehouseId },
        { deliveryWarehouseId: warehouseId },
      ],
    },
    include: [
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
      { model: bookingStatus, attributes: ["title"] },
      { model: bookingType, attributes: ["title"] },
      { model: category, attributes: ["title"] },
      { model: shipmentType, attributes: ["title"] },
      { model: size, attributes: ["title"] },
      { model: unit, as: "weightUnitB", attributes: ["symbol"] },
      { model: unit, as: "lengthUnitB", attributes: ["symbol"] },
      {
        model: user,
        as: "customer",
        attributes: ["id", "firstName", "lastName"],
      },
      {
        model: user,
        as: "receivingDriver",
        attributes: ["id", "firstName", "lastName"],
      },
      {
        model: user,
        as: "deliveryDriver",
        attributes: ["id", "firstName", "lastName"],
      },
      {
        model: user,
        as: "transporter",
        attributes: ["id", "firstName", "lastName"],
      },
      {
        model: warehouse,
        as: "receivingWarehouse",
        attributes: ["id", "name"],
      },
      { model: warehouse, as: "deliveryWarehouse", attributes: ["id", "name"] },
    ],
    attributes: [
      "id",
      "trackingId",
      "pickupDate",
      "dropoffDate",
      "bookingStatusId",
      "total",
      "deliveredAtPickup",
      "receivingWarehouseId",
      "deliveryWarehouseId",
      "catText",
    ],
  });
  let receivingCompleted = bookingData.filter(
    (ele) =>
      ele.receivingWarehouseId === warehouseId &&
      ele.bookingStatusId > 6 &&
      ele.deliveredAtPickup != "null"
  );
  let deliveryCompleted = bookingData.filter(
    (ele) =>
      ele.deliveryWarehouseId === warehouseId && ele.bookingStatusId == 14
  );

  return res.json(
    returnFunction(
      "1",
      "Completed bookings",
      { receivingCompleted, deliveryCompleted },
      ""
    )
  );
}

// ! Module 9: Profile Management
async function profile_management(req, res) {
  const warehouseid = req.user.id;
  const data = await warehouse.findOne({
    where: {
      id: warehouseid,
    },
    attributes: [
      "email",
      "companyName",
      "companyEmail",
      "countryCode",
      "phoneNum",
    ],
    include: [
      {
        model: addressDBS,
        attributes: [
          "title",
          "streetAddress",
          "building",
          "floor",
          "apartment",
          "district",
          "city",
          "province",
          "country",
          "postalCode",
          "lat",
          "lng",
        ],
      },
    ],
  });
  res.status(200).json({ data: data });
}

// ! Module 10: virtual Box
async function virtualBox(req, res) {
  let data = await user.findOne({
    where: { virtualBox: req.params.id },
    include: [{ model: booking, as: "customersss" }],
  });

  //     let data=await booking.findAll({
  //         include:[{model:user ,as: 'customer',where:{virtualBox:req.params.id}}]})
  // let output= []
  // for(let obj of data){
  //    obj= obj.toJSON();
  //     delete obj.customer;
  //     output.push(obj);
  // }
  res.status(200).json({ data });
}

// ! Module 11: Tracking
// ! _________________________________________________________________________________________________________________________________

/*
        1. Get booking details by tracking Id
*/
async function bookingDetailsByTracking(req, res) {
  const { trackingId } = req.body;
  const defaultDistanceUnit = await defaultUnit.findOne({
    where: { type: "distance", status: true },
    attributes: ["symbol"],
  });
  const defaultCurrencyUnit = await defaultUnit.findOne({
    where: { type: "currency", status: true },
    attributes: ["symbol"],
  });
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
      { model: size, attributes: ["title"] },
      { model: shipmentType, attributes: ["title"] },
      { model: unit, as: "weightUnitB", attributes: ["symbol"] },
      { model: unit, as: "lengthUnitB", attributes: ["symbol"] },
      { model: bookingStatus, attributes: ["title"] },
      {
        model: addressDBS,
        as: "pickupAddress",
        include: [
          { model: corregimiento, attributes: ["title"] },
          { model: province, attributes: ["title"] },
          { model: district, attributes: ["title"] },
        ],
        attributes: [
          "id",
          "postalCode",
          "secondPostalCode",
          "lat",
          "lng",
          "buildingName",
          "questionOne",
          "questionTwo",
          "questionThree",
        ],
      },
      {
        model: addressDBS,
        as: "dropoffAddress",
        include: [
          { model: corregimiento, attributes: ["title"] },
          { model: province, attributes: ["title"] },
          { model: district, attributes: ["title"] },
        ],
        attributes: [
          "id",
          "postalCode",
          "secondPostalCode",
          "lat",
          "lng",
          "buildingName",
          "questionOne",
          "questionTwo",
          "questionThree",
        ],
      },
      { model: category, attributes: ["title"] },
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
  if (!bookingData)
    throw CustomException(
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
  //removing spaces and commas
  let pickupAddressArray = [
    bookingData.pickupAddress.buildingName,
    // bookingData.pickupAddress.questionOne,
    // bookingData.pickupAddress.questionTwo,
    bookingData.pickupAddress.corregimiento.title,
    bookingData.pickupAddress.district.title,
    bookingData.pickupAddress.province.title,
  ];
  let filteredPickupAddressArray = pickupAddressArray.filter(Boolean);
  let pickupAddress = filteredPickupAddressArray.join(", ");
  //let pickupAddress = `${bookingData.pickupAddress.buildingName}, ${bookingData.pickupAddress.floorNumber}, ${bookingData.pickupAddress.towerInfo}, ${bookingData.pickupAddress.corregimiento.title}, ${bookingData.pickupAddress.district.title}, ${bookingData.pickupAddress.province.title}`;
  //let dropoffAddress = `${bookingData.dropoffAddress.buildingName}, ${bookingData.dropoffAddress.floorNumber}, ${bookingData.dropoffAddress.towerInfo}, ${bookingData.dropoffAddress.corregimiento.title}, ${bookingData.dropoffAddress.district.title}, ${bookingData.dropoffAddress.province.title}`;
  let dropoffAddressArray = [
    bookingData.dropoffAddress.buildingName,
    // bookingData.dropoffAddress.questionOne,
    // bookingData.dropoffAddress.questionTwo,
    bookingData.dropoffAddress.corregimiento.title,
    bookingData.dropoffAddress.district.title,
    bookingData.dropoffAddress.province.title,
  ];
  let filteredDropoffAddressArray = dropoffAddressArray.filter(Boolean);
  let dropoffAddress = filteredDropoffAddressArray.join(", ");
  let outObj = {
    id: bookingData.id,
    trackingId: bookingData.trackingId,
    instructions: `${bookingData.instruction}`,
    barcode: bookingData.barcode,
    bookingStatus: bookingData.bookingStatus.title,
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
      pickupCode: `${bookingData.pickupAddress.postalCode} ${bookingData.pickupAddress.secondPostalCode}`,
      pickupAddress,
      dropoffCode: `${bookingData.dropoffAddress.postalCode} ${bookingData.dropoffAddress.secondPostalCode}`,
      dropoffAddress,
      pickupTime: `${bookingData.pickupEndTime}`,
    },
    parcelDetails: {
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


// ! Module 12: Homepage
// ! _________________________________________________________________________________________________________________________________

/*
        1. count of orders for homepage warehouse
*/
async function homePage(req, res) {
  let warehouseId = req.user.id;
  const numOfBookings = await booking.count({
    where: { [Op.or]: [{ receivingWarehouseId: warehouseId }, { deliveryWarehouseId: warehouseId }] },
  });
  const incoming = await booking.count({
    where: {
      [Op.or]: [{
        receivingWarehouseId: warehouseId,
        bookingStatusId: { [Op.lte]: 6 }
      }, { deliveryWarehouseId: warehouseId, bookingStatusId: { [Op.lte]: 9 } }]
    },
  });
  let receivedAtWarehouse = await booking.count({
    where: {
      [Op.or]: [
        { receivingWarehouseId: warehouseId, bookingStatusId: 7 },
        { deliveryWarehouseId: warehouseId, bookingStatusId: 12 },
      ],
    }
  });
  const waitingForConsolidation = await booking.count({
    where: {
      receivingWarehouseId: warehouseId,
      bookingStatusId: 7,
      consolidation: 1,
    },
  });
  const readyToShip = await booking.count({
    where: { [Op.or]: [{ receivingWarehouseId: warehouseId }, { deliveryWarehouseId: warehouseId }], bookingStatusId: 10 },
  });
  const incomingTransit = await booking.count({
    where: { deliveryWarehouseId: warehouseId, bookingStatusId: 11 },
  });
  const outgoingTransit = await booking.count({
    where: { receivingWarehouseId: warehouseId, bookingStatusId: 11 },
  });
  const deliveredAtWarehouse = await booking.count({
    where: { [Op.or]: [{ receivingWarehouseId: warehouseId }, { deliveryWarehouseId: warehouseId, }], bookingStatusId: 12 },
  });
  const deliveredToUser = await booking.count({
    where: {
      [Op.or]: [{ receivingWarehouseId: warehouseId }, { deliveryWarehouseId: warehouseId, }],
      bookingStatusId: { [Op.or]: [18, 21] },
    },
  });
  const awaitingForSelfPickup = await booking.count({
    where: {
      deliveryWarehouseId: warehouseId,
      bookingStatusId: 20,
    }
  })
  const pendingPayements = await booking.count({
    where: {
      [Op.or]: [{ receivingWarehouseId: warehouseId }, { deliveryWarehouseId: warehouseId, }],
      bookingStatusId: 9,
    }
  })
  const cancelled = await booking.count({
    where: {
      [Op.or]: [{ receivingWarehouseId: warehouseId }, { deliveryWarehouseId: warehouseId }],
      bookingStatusId: 19,
    }
  })

  let outObj = {
    allorders: numOfBookings,
    incoming,
    receivedAtWarehouse,
    waitingForConsolidation,
    readyToShip,
    incomingTransit,
    outgoingTransit,
    cancelled,
    pendingPayements,
    deliveredAtWarehouse,
    deliveredToUser,
    awaitingForSelfPickup,
    incomingTransit,
    outgoingTransit
  };

  return res.json(returnFunction("1", "Dashboard general data", outObj, ""));
}
/*
             Get All Category
*/
async function getAllCategory(req, res) {
  const categoryData = await category.findAll({
    where: { status: true },
    attributes: ["id", "title", "status", "charge"],
  });
  return res.json(returnFunction("1", "All categories", categoryData, ""));
}



async function getLogCompaniesForFilter(req, res) {
  const LogCompanies = await logisticCompany.findAll({
    attributes: ['id', 'title']
  });

  return res.json(returnFunction("1", "Logistic companies", LogCompanies, ""));
}

//Direct deliver to customer by logistic company
async function toDirectDelivery(req, res) {
  const bookingsIds = req.body.bookingIds;

  await booking.update({ bookingStatusId: 14 }, { where: { id: bookingsIds } });
  const dt = Date.now();
  const DT = new Date(dt);
  const currentDate = `${DT.getMonth() +
    1}-${DT.getDate()}-${DT.getFullYear()}`;
  const currentTime = `${DT.getHours()}:${DT.getMinutes()}:${DT.getSeconds()}`;
  const data = bookingsIds.map(bookingId => ({
    date: currentDate,
    time: currentTime,
    bookingId: bookingId,
    bookingStatusId: 14
  }));

  await bookingHistory.bulkCreate(data);

  let bookingData = await booking.findAll({
    where: { id: bookingsIds },
    include: [
      { model: addressDBS, as: 'dropoffAddress', attributes: ['title', 'streetAddress', 'building', 'floor', 'apartment', 'district', 'city', 'province', 'country', 'postalCode', 'lat', 'lng'] },
      {
        model: user,
        as: "customer",
        attributes: ["firstName", "email"],
      },

      { model: logisticCompany, attributes: ["title"] },
      {
        model: package,
        attributes: [
          "arrived",
        ],
      },
      // {model: warehouse, as: 'receivingWarehouse', attributes: ['id']}
    ],
    attributes: ['receiverName', 'receiverEmail', 'createdAt', 'consolidation', 'trackingId']
  });

  bookingData.forEach(ele => {
    var arrived = ele.packages.filter((res) => res.arrived == "arrived");

    const to = ['sigidevelopers@gmail.com'];
    let name = ele.receiverName
    if (ele.customer) {
      to.push(ele.customer.email)
      name = ele.customer.firstName
    } else {
      to.push(ele.receiverEmail)
    }
    const consolidation = ele.consolidation ? 'yes' : 'no';
    const createdAt = String(ele.createdAt).substring(4, 15);
    dispatchMail(to, name, ele.trackingId, createdAt, arrived.length, ele.logisticCompany.title, consolidation, ele.dropoffAddress)
  });

  // check if customer is null then reciever will recieve email 

  return res.json(returnFunction("1", "Sucesss", {}, ""));
}

async function markDeliver(req, res) {
  const bookingId = req.body.bookingId;

  await booking.update({ bookingStatusId: 18 }, { where: { id: bookingId } });
  const dt = Date.now();
  const DT = new Date(dt);
  const currentDate = `${DT.getMonth() +
    1}-${DT.getDate()}-${DT.getFullYear()}`;
  const currentTime = `${DT.getHours()}:${DT.getMinutes()}:${DT.getSeconds()}`;


  await bookingHistory.create({
    date: currentDate,
    time: currentTime,
    bookingId: bookingId,
    bookingStatusId: 18
  });

  let bookingData = await booking.findOne({
    where: { id: bookingId },
    include: [
      { model: addressDBS, as: 'dropoffAddress', attributes: ['title', 'streetAddress', 'building', 'floor', 'apartment', 'district', 'city', 'province', 'country', 'postalCode', 'lat', 'lng'] },
      {
        model: user,
        as: "customer",
        attributes: ["firstName", "email"],
      },
      { model: logisticCompany, attributes: ["title", 'divisor'] },
      {
        model: package,
        attributes: [
          "arrived",
          "actualWeight",
          "actualVolume"
        ],
      },
      // {model: warehouse, as: 'receivingWarehouse', attributes: ['id']}
    ],
    attributes: ['receiverName', 'receiverEmail', 'createdAt', 'consolidation', 'trackingId', 'total']
  });


  var arrived = bookingData.packages.filter((ele) => ele.arrived == "arrived");
  const totalWeight = calculateWeights(arrived, bookingData.logisticCompany.divisor);
  const to = ['sigidevelopers@gmail.com'];
  let name = bookingData.receiverName
  if (bookingData.customer) {
    to.push(bookingData.customer.email)
    name = bookingData.customer.firstName
  } else {
    to.push(bookingData.receiverEmail)
  }
  const consolidation = bookingData.consolidation ? 'Yes' : 'No';
  //  const createdAt = String(bookingData.createdAt).substring(4, 15);

  deliveredMail(to, name, bookingData.trackingId, arrived.length, bookingData.logisticCompany.title, consolidation, totalWeight.chargedWeight, bookingData.total, bookingData.dropoffAddress)


  return res.json(returnFunction("1", "Sucesss", {}, ""));
}

//for tracking purpose only
async function updateBookingStatus(req, res) {
  const bookingId = req.body.bookingId;
  const bookingStatus = req.body.bookingStatusId;

  const updated = await booking.update({ bookingStatusId: bookingStatus }, { where: { id: bookingId } });

  return res.json(returnFunction("1", "Sucesss", { updated }, ""));
}

//for tracking purpose only
async function allBookingStatus(req, res) {
  const statuses = await bookingStatus.findAll({ attributes: ["id", 'title'] });
  return res.json(returnFunction("1", "Sucesss", statuses, ""));
}

async function getActiveWarehouse(req, res) {
  const warehouseData = await warehouse.findAll({
    where: req.query.located
      ? { classifiedAId: 3, status: true, located: req.query.located }
      : { classifiedAId: 3, status: true },
    attributes: [
      "id",
      "companyName",
      "located",
    ],
  });
  return res.json(returnFunction("1", "All warehouse", warehouseData, ""));
}

async function addTrackingOnbooking(req, res) {
  const { bookingId, trackingNum } = req.body;
  const warehouseData = await booking.update({ logisticCompanyTrackingNum: trackingNum }, { where: { id: bookingId } });

  return res.json(returnFunction("1", "Tracking Number Added", warehouseData, ""));
}

async function addTrackingOnParcel(req, res) {
  const { parcelId, trackingNum } = req.body;
  const warehouseData = await package.update({ logisticCompanyTrackingNum: trackingNum }, { where: { id: parcelId } });

  return res.json(returnFunction("1", "Tracking Number Added", warehouseData, ""));
}

/*

!_______________________________ Warehouse Location,Zones,Inventory, INBOUND nad OUTBOUND ORDER'S___________________________________!
*/

//=================WAREHOUSE  DASHBOARD FOR INBOUND and OUTBOUND ORDERS===================//
async function warehouseDashboard(req, res) {
  let warehouseID = req.user.id

  const getInboundOrder = await merchantOrder.findAll({
    where: {
      orderType: 'INBOUND',
      merchantorderstatusesId: 1,
      warehouseId: warehouseID,
    }
  })
  //console.log("ðŸš€ ~ warehouseDashboard ~ getInboundOrder:", getInboundOrder)

  const getOutboundOrder = await merchantOrder.findAll({
    where: {
      orderType: 'OUTBOUND',
      merchantorderstatusesId: 1,
      warehouseId: warehouseID,
    }
  })


  const deliveryOrders = await merchantOrder.findAll({
    where: {
      merchantorderstatusesId: 12,
      warehouseId: warehouseID,
    }
  })



  const orderProcessed = await merchantOrder.findAll({
    where: {
      merchantorderstatusesId: 5,
      warehouseId: warehouseID
    }
  })

  const numberOfZones = await warehouseZones.findAll({
    where: {
      warehouseId: warehouseID
    },
    attributes: [
      'id',
      'zoneName',
      'warehouseId'
    ]
  })

  let warehouseAllShelfs = await warehouse.findAll({
    where: {
      id: warehouseID
    },
    include: [
      {
        model: warehouseZones, attributes: ["zoneName"],
        include: {
          model: inWarehouseLocation,
          attributes: ['shelfCode']
        }
      },
    ],
    attributes: ['companyName']
  })


  let outobj = {
    pendingInboundOrders: getInboundOrder,
    pendingOutboundOrders: getOutboundOrder,
    orderOutforDelivery: deliveryOrders,
    ordersProcessing: orderProcessed,
    wareHouseZones: numberOfZones,
    NumberOfShelfinWarehouse: warehouseAllShelfs,


  }



  return res.json(returnFunction("1", "Dashboard", outobj))
}


//=======================Add,Edit,Delete warehouse Locations============================>
async function warehouselocation(req, res) {
  const { shelfCode, warehouseZoneId } = req.body;


  const locationCreate = await inWarehouseLocation.create({
    shelfCode,
    warehouseZoneId,
  })
  console.log("ðŸš€ ~ warehouselocation ~ locationCreate:", locationCreate)


  return res.json(returnFunction("1", "Location Added in Warehouse", locationCreate))

}

//=========================Add,Edit,Delete warehouse Zones========================>
async function wareHouseZone(req, res) {
  const { zoneName } = req.body

  let warehouse = req.user.id

  const wareHouseZone = await warehouseZones.create({
    zoneName,
    warehouseId: warehouse,
  })

  res.json(returnFunction("1", "Warehouse Zone Added", wareHouseZone))

}


async function editwarehouseZone(req, res) {

  const { zoneName, zoneId } = req.body

  const editZone = await warehouseZones.update(
    { zoneName: zoneName },
    { where: { id: zoneId } }
  )
  return res.json(returnFunction("1", "Zone Updated", editZone))

}

async function deleteZOne(req, res) {
  const { zoneId } = req.params

  const deleteZone = await warehouseZones.delete({
    where: {
      id: zoneId
    }
  })


  return res.json(returnFunction("1", "Zone Deleted Sucessfully", deleteZone))

}

//=========================Get Locations of Warehouse==========================>

async function getLocations(req, res) {

  let warehouseId = req.user.id;

  let warehousefind = await warehouse.findAll({
    where: {
      id: warehouseId
    },
    include: [
      {
        model: warehouseZones, attributes: ["zoneName"],
        include: {
          model: inWarehouseLocation,
          attributes: ['shelfCode']
        }
      },
    ],
    attributes: ['companyName']
  })
  //console.log("ðŸš€ ~ getLocations ~ warehousefind:", warehousefind)

  // const formatLocation=`${warehousefind.companyName}-${warehousefind.warehouseZone.zoneName}-${warehousefind.warehouseZone.inWarehouseLocation.shelfCode}`

  // console.log("ðŸš€ ~ getLocations ~ formatLocation:", formatLocation)

  res.json(returnFunction("1", "All Locations", warehousefind))


}

//=========================Get inBound Orders=========================>

async function getInboundOrderWarehouse(req, res) {
  const warehouseID = req.user.id
  try {
    const getInboundOrder = await merchantOrder.findAll({
      where: {
        orderType: 'INBOUND',
        warehouseId: warehouseID,
      },
      include: {
        model: products,
        attributes: ['productName']
      },
      attributes: ['id', 'orderType', 'merchantReference', 'merchantName', 'productId', 'quantity', 'warehouseId', 'merchantId', 'merchantorderstatusesId']
    });

    const orderList = getInboundOrder.map(order => {
      return {
        id: order.id,
        orderType: order.orderType,
        merchantName: order.merchantName,
        merchantReference: order.merchantReference,
        productId: order.productId,
        quantity: order.quantity,
        warehouseId: order.warehouseId,
        merchantorderstatusesId: order.merchantorderstatusesId,
        productName: order.product ? order.product.productName : null,
      };
    });

    return res.json(returnFunction("1", "Inbound Orders for Warehouse", orderList));

  } catch (error) {
    console.error("Error in fetching inbound orders:", error);
    return res.json(returnFunction("0", "Error in fetching inbound orders", null));
  }
}

//====================================Inspect Order in Warhouse===========================>
async function InspectOrder(req, res) {
  const { inboundOrderId } = req.params;
  const { totalQuantity, damagedQuantity, fineQuantity } = req.body

  const response = await merchantOrder.findByPk(inboundOrderId);
  console.log("ðŸš€ ~ InspectOrder ~ response:", inboundOrderId)
  if (!response && response.merchantorderstatusesId !== 1) {
    throw new CustomException("Order is not Available or not in the inTransit Status")
  }


  let realQuantity = response.quantity - damagedQuantity;
  console.log("ðŸš€ ~ InspectOrder ~ realQuantity:", realQuantity)
  let inspected = await productOrder.create({
    totalQuantity: response.quantity,
    damagedQuantity,
    fineQuantity: realQuantity,
    merchantOrderId: inboundOrderId,
    merchantOrderStatusId: response.merchantorderstatusesId,
    productId: response.productId,

  })
  inspected = await inspected.reload();

  await merchantOrder.update(
    {
      quantity: inspected.fineQuantity
    },
    {
      where: {
        id: inboundOrderId
      }
    }
  );

  return res.json(returnFunction("1", "Order Inspection Completed"))


}


//=====================================Statuses At the Confirmation of INBOUND ORDER=============================//
async function InboundStatuses(req, res) {

  const getOrderStatuses = await merchantOrderStatuses.findAll({
    where: {
      id: {
        [Op.in]: ['2', '3', '8', '10']
      }
    },
    attributes: ['id', 'title']
  })
  console.log("ðŸš€ ~ orderReceived ~ getOrderStatuses:", getOrderStatuses)

  return res.json(returnFunction("1", "Statuses for Inbound Order", getOrderStatuses))

}

//=====================================Warehouse Order Conforamtion==================================//

async function orderReceived(req, res) {
  const { inboundOrderId } = req.params;
  const { statusId } = req.body


  const getinboundOrder = await merchantOrder.findOne({
    where: {
      id: inboundOrderId
    },
    include: [{
      model: products,
      attributes: ['productName']
    }, {
      model: warehouse,
      as: 'currentWareHouseLocation',
      attributes: ['email']
    }],
    attributes: ['id', 'orderType', 'merchantReference', 'merchantName', 'productId', 'quantity', 'warehouseId', 'merchantId', 'merchantorderstatusesId']
  })


  const merchantMail = await user.findOne({
    where: {
      id: getinboundOrder.merchantId
    },
    attributes: ['email']
  })
  console.log("ðŸš€ ~ orderReceived ~ merchantMail:", merchantMail)

  //return res.json(getinboundOrder)



  if (!getinboundOrder) {
    throw new CustomException("'Inbound Order not found'")
  }

  getinboundOrder.merchantorderstatusesId = statusId;

  await getinboundOrder.save();
  // TODO Set Up mail for sending to admin, merchant and warehouse.
  //   if(statusId===2){ 
  //   await transporter.sendMail({
  //   from: process.env.EMAIL_USERNAME,
  //   to: [email, merchantMail.email,getinboundOrder.currentWareHouseLocation.email],
  //   subject: "Verification code for Truck Express",
  //   html: registerUserEmail({ name: email, OTP }),
  //   attachments: [
  //     {
  //       filename: "logo.png",
  //       path: `${__dirname}/logo.png`,
  //       cid: "logoImage",
  //     },
  //   ],
  //  });
  //   }

  return res.json(returnFunction("1", "Order Status Updated and Reached in Warehouse"))

}

//======================================Order Putway State==============================//

//<==============Order Statuses for available and putaway===========>//

async function statusesforAvailable(req, res) {

  const statusesafterConfirm = await merchantOrderStatuses.findAll({
    where: {
      id: {
        [Op.in]: [4, 5]
      }
    },
    attributes: ['id', 'title']
  })

  return res.json(returnFunction("1", "Statuses After Confirmation of Order", statusesafterConfirm))
}

async function markOrderPutaway(req, res) {
  const { inboundOrderId } = req.params
  const { statusId } = req.body

  const inboundOrderfind = await merchantOrder.findByPk(inboundOrderId)
  console.log("ðŸš€ ~ markOrderPutaway ~ inboundOrderfind:", inboundOrderfind)

  if (!inboundOrderfind || inboundOrderfind.merchantorderstatusesId !== 2) {
    throw new CustomException("Order must be confirmed before moving to putaway")
  }

  inboundOrderfind.merchantorderstatusesId = statusId;

  await inboundOrderfind.save();


  return res.json(returnFunction("1", "Order Status Updated and Order moved to putaway"))

}

//======================================Get Warehouse Zones and locations==========================//


async function getshelfsCode(req, res) {

  const findshelfs = await inWarehouseLocation.findAll({
    include: {
      model: warehouseZones,
      attributes: ['id', 'zoneName']
    },
    attributes: ['id', 'shelfCode']
  })
  return res.json(returnFunction("1", "Warehouse Shelf with their Zones", findshelfs))

}




//========================================Order Avaiable State========================//

async function orderAvailableState(req, res) {
  const { inboundOrderId } = req.params
  const { shelflocationId } = req.body

  const getinboundOrder = await merchantOrder.findOne({
    where: {
      id: inboundOrderId
    },
    include: [{
      model: products,
      attributes: ['productName']
    }, {
      model: inWarehouseLocation,
      attributes: ['shelfCode'],
      as: 'currentShelfLocation',
      include: {
        model: warehouseZones,
        attributes: ['zoneName']
      }
    }],
    attributes: ['id', 'orderType', 'merchantReference', 'merchantName', 'productId', 'quantity', 'warehouseId', 'merchantId', 'merchantorderstatusesId', 'warehouseshelfId']
  })
  console.log("ðŸš€ ~ orderAvailableState ~ getinboundOrder:", getinboundOrder)


  if (!getinboundOrder || getinboundOrder.merchantorderstatusesId !== 5) {
    throw new CustomException("The Order is Still in Putway State")
  }

  getinboundOrder.warehouseshelfId = shelflocationId;

  getinboundOrder.merchantorderstatusesId = 4;

  await getinboundOrder.save()

  const warehouse = await warehouseinventories.findOne({
    where: {
      productName: getinboundOrder.product.productName
    }
  });
  console.log("ðŸš€ ~ orderAvailableState ~ warehouse:", warehouse)

  if (warehouse) {
    if (getinboundOrder.currentShelfLocation.shelfCode === warehouse.shelfCode &&
      getinboundOrder.currentShelfLocation.warehouseZone.zoneName === warehouse.warehouseZone) {
      console.log("If nested Condition Running=======================>>>>>>");
      warehouse.productWarehouseQuantity += getinboundOrder.quantity;
      await warehouse.save();

    }


  } else {
    console.log("Else Condition Running=======================>>>>>>");

    await warehouseinventories.create({
      productName: getinboundOrder.product.productName,
      productWarehouseQuantity: getinboundOrder.quantity,
      shelfCode: getinboundOrder.currentShelfLocation.shelfCode,
      warehouseZone: getinboundOrder.currentShelfLocation.warehouseZone.zoneName,
      warehouseId: getinboundOrder.warehouseId
    });
  }

  res.json(returnFunction("1", "Order is in Available State"))

}
/*
!_________________________Warehouse Asscoiates && Outbound Order Management_______________________!
 */
//=================================Fetch OUtbound Order================================>

async function getOutboundOrders(req, res) {

  const getOutboundOrder = await merchantOrder.findAll({
    where: {
      orderType: 'OUTBOUND'
    },
    include: {
      model: products,
      attributes: ['productName']

    },
    attributes: ['id', 'orderType', 'merchantReference', 'merchantName', 'productId', 'quantity', 'warehouseId', 'merchantId', 'merchantorderstatusesId']
  })
  console.log("ðŸš€ ~ getOutboundOrders ~ getOutboundOrder:", getOutboundOrder)

  return res.json(returnFunction("1", "All Outbound Orders", getOutboundOrder))

}


//======================Get Order for Specific Associate=================>

async function getOrdersAssignedtoAssociate(req, res) {

  const associateId = req.user.id;

  const ordersfind = await merchantOrder.findAll({
    where: {
      warehouseAssociateId: associateId,
    },
    include: [{
      model: products,
      attributes: ['productName']
    }, {
      model: inWarehouseLocation,
      as: 'receiveingWarehouseShelfCode',
      attributes: ['shelfCode']
    }, {
      model: inWarehouseLocation,
      as: 'currentShelfLocation',
      attributes: ['shelfCode']
    }],
    attributes: ['OrderType', 'merchantName', "merchantReference", 'quantity']
  })
  console.log("ðŸš€ ~ getOrdersAssignedtoAssociate ~ ordersfind:", ordersfind)

  if (!ordersfind) {
    throw new CustomException("No Order Assigned to this Warehouse Associate")
  }

  return res.json(returnFunction("1", "Orders Assigned to Associate", ordersfind))

}

//=====================Assign Order to Associates======================>

async function orderAssignedToAssociates(req, res) {

  const { outboundOrderId, warehouseAssociateId } = req.body

  const orderfound = await merchantOrder.findByPk(outboundOrderId)
  console.log("ðŸš€ ~ orderAssignedToAssociates ~ orderfound:", orderfound)

  if (!orderfound) {
    throw new CustomException('Order Not found')
  }

  orderfound.warehouseAssociateId = warehouseAssociateId;
  orderfound.merchantorderstatusesId = 6;

  await orderfound.save();


  return res.json(returnFunction("1", "Order Assignend to Warehouse Associate"))

}


//========================Batch Orders On the Basis of Location and Zone==========================>
async function getBatchOutboundOrders(req, res) {

  const associateId = req.user.id;
  const getOutboundOrder = await merchantOrder.findAll({
    where: {
      orderType: 'OUTBOUND',
      warehouseAssociateId: associateId,
    },
    include: [
      {
        model: products,
        attributes: ['productName', 'image', 'barCode'],
      },
      {
        model: inWarehouseLocation,
        as: 'currentShelfLocation',
        attributes: ['shelfCode', 'warehousezoneId'],
        include: {
          model: warehouseZones,
          attributes: ['zoneName']
        }
      },
      {
        model: warehouse,
        as: 'warehouseAssociate',
        attributes: ['email', 'companyName']
      }
    ],
    attributes: [
      'id',
      'orderType',
      'merchantReference',
      'merchantName',
      'productId',
      'quantity',
      'warehouseId',
      'merchantId',
      'merchantorderstatusesId',
      'warehouseAssociateId'
    ],
  });

  console.log("ðŸš€ ~ getOutboundOrders ~ getOutboundOrder:", getOutboundOrder[1].currentShelfLocation);


  const groupedOrders = {};
  // return res.json(getOutboundOrder)
  getOutboundOrder.forEach((el) => {
    const order = JSON.parse(JSON.stringify(el))
    //let {warehousezoneId}=order.currentShelfLocation
    const shelfCode = order.currentShelfLocation ? order.currentShelfLocation.shelfCode : null;
    //console.log("ðŸš€ ~ getOutboundOrder.forEach ~ order.currentShelfLocation.warehousezoneId:",order.currentShelfLocation.warehousezoneId)
    const zoneId = order.currentShelfLocation ? order.currentShelfLocation.warehousezoneId : null;
    //console.log("ðŸš€ ~ getOutboundOrder.forEach ~ zoneId:", zoneId)


    if (shelfCode && zoneId) {
      const groupKey = `${zoneId}-${shelfCode}`;
      if (!groupedOrders[groupKey]) {
        groupedOrders[groupKey] = [];
      }
      groupedOrders[groupKey].push(order);
    }
  });


  const batchJobs = [];
  for (const groupKey in groupedOrders) {
    const ordersInSameLocation = groupedOrders[groupKey];
    const newBatchJob = {
      orders: ordersInSameLocation,
      zoneId: ordersInSameLocation[0].currentShelfLocation.warehousezoneId,
      shelfCode: ordersInSameLocation[0].currentShelfLocation.shelfCode,
    };

    batchJobs.push(newBatchJob);
  }

  return res.json(returnFunction("1", "All Outbound Orders with Batch Jobs", { batchJobs }));

}

//=======================Order Status changes to Picked===================>

async function associatePickedOrder(req, res) {
  const { outboundOrderId } = req.params

  const orderfind = await merchantOrder.findByPk(outboundOrderId)

  if (!orderfind || orderfind.merchantorderstatusesId !== 6) {
    throw new CustomException('Order NoOrder not found or not in Picking statust exists')
  }

  orderfind.merchantorderstatusesId = 9;

  await orderfind.save();

  res.json(returnFunction("1", "Job Picked by Associate"))


}

//=================================Packing the Picked Order===================>

async function associatePackingOrder(req, res) {

  const { outboundOrderId } = req.params

  const orderPacked = await merchantOrder.findByPk(outboundOrderId)
  if (!orderPacked || orderPacked.merchantorderstatusesId !== 9) {
    throw new CustomException("Order not found or not ready for packing")
  }

  orderPacked.merchantOrderStatuses = 7;

  await orderPacked.save();


  res.json(returnFunction("1", "Packing started"))

}

//========================Associate Confirm Packing of Order======================>

async function OrderPacked(req, res) {
  const { outboundOrderId } = req.params

  const orderPacked = await merchantOrder.findByPk(outboundOrderId);
  if (!orderPacked || orderPacked.merchantorderstatusesId !== 7) {
    throw new CustomException("Order not found or not in the packing")
  }


  orderPacked.merchantorderstatusesId = 11;

  await orderPacked.save();

  return res.json(returnFunction("1", "Order Packed and ready to Assign to Driver"))
}

//======================================= Assign driver to Order=====================//
async function assignDriverToOrder(req, res) {
  const { outboundOrderId } = req.params
  const { driverId } = req.body;

  const orderget = await merchantOrder.findByPk(outboundOrderId);
  if (!orderget || orderget.merchantorderstatusesId !== 11) {
    throw new CustomException("Order not Found or Order is not in the Packed State")
  }

  if (orderget.warehouseId === orderget.receiveingWarehouse) {
    throw new CustomException("Cannot Assign to Driver to this Order Because the transfer is inside the warehouse")
  }

  orderget.driverId = driverId;

  await orderget.save()

  return res.json(returnFunction("1", "Order Assigned to Order"))

}


//! --------------------Warehouse Inventory------------------------//
async function warehouseInventoryName(req, res) {

  const warehouseID = req.user.id


  const warehouseInventoryFind = await warehouseinventories.findAll({
    where: {
      warehouseId: warehouseID,
    },
    attributes: ['productName', 'productWarehouseQuantity', 'warehouseZone', 'warehouseId']
  })


  return res.json(returnFunction("1", "Products in Warehouse", warehouseInventoryFind))

}

//!----------------------Warehouse Service Orders--------------------------//
async function getServiceOrder(req, res) {
  let warehouseId = req.user.id

  const getWarehouseOrder = await booking.findAll({
    where: {
      receivingWarehouseId: warehouseId,
      merchantcustomerordersId: {
        [Op.ne]: null
      }
    },
    attributes: ['id',
      "pickupDate",
      "pickupStartTime",
      "receiverEmail",
      "receiverPhone",
      "receiverName",
      "senderEmail",
      "senderPhone",
      "senderName",
      "total",
      "weight",
      "productName",
      "productQuantity",
      "pickupAddressType",
      "pickupAddressId",
      "dropoffAddressId",
      "bookingTypeId",
      "merchantcustomerordersId",
      "merchantorderstatusesId",
      "customerId",
      "receivingWarehouseId",

    ]
  })
  console.log("ðŸš€ ~ getServiceOrder ~ getWarehouseOrder:", getWarehouseOrder)

  return res.json(returnFunction("1", "All Service Orders", getWarehouseOrder))

}

async function confirmServiceOrder(req, res) {

  const { serviceOrderId } = req.params

  const confirmOrder = await booking.findByPk(serviceOrderId)
  console.log("ðŸš€ ~ confirmServiceOrder ~ confirmOrder:", confirmOrder);

  // return res.json(confirmOrder)

  confirmOrder.merchantorderstatusesId = 11;

  const warehouseInventory = await warehouseinventories.findOne({
    where: {
      productName: confirmOrder.productName
    }
  })
  console.log("ðŸš€ ~ confirmServiceOrder ~ warehouseInventory:", warehouseInventory)

  // return res.json(warehouseInventory?.productWarehouseQuantity)


  if (warehouseInventory) {
    warehouseInventory.productWarehouseQuantity = warehouseInventory.productWarehouseQuantity - confirmOrder.productName;
    await warehouseInventory.save()
  }

  await confirmOrder.save();

  const bookingData = await booking.findOne({
    where: { id: serviceOrderId },
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
        model: merchantcustomerorders,
        attributes: ['quantity', 'totalAmount', 'productId', 'customerEmail', 'contactNumber'],
        include: [{
          model: products,
          attributes: ['id', 'productName', 'price']
        }]
      },
    ],
  });
  console.log("ðŸš€ ~ confirmServiceOrder ~ bookingData:", bookingData)

  // return res.json(bookingData)


  if (bookingData.bookingTypeId === 7) {
    const fedexShipment = await fedex.createFedexShipmentLoc(bookingData);
    console.log(
      "FEDEX SHIPMENT DATA --------------> : ",
      fedexShipment.data.output.transactionShipments[0].pieceResponses[0]
    );
    bookingData.logisticCompanyTrackingNum =
      fedexShipment.data.output.transactionShipments[0].pieceResponses[0].trackingNumber;
    bookingData.label =
      fedexShipment.data.output.transactionShipments[0].pieceResponses[0].packageDocuments[0].url;
    bookingData.save();
    let outObj = {
      logisticCompanyTrackingNum: bookingData.logisticCompanyTrackingNum,
      label: bookingData.label,
    };
    const response = returnFunction(
      "1",
      "Order Confirmed and Assigned to Fedex Driver to Order",
      outObj,
      ""
    );
    return res.json(response);
  }

  return res.json(returnFunction("1", "Order Confirmed and Ready to Assign Driver to Order"))

}





//==============================================================================================================================================================================//

// ! Module : Employees
/*
!_____________________________________________________________________________________________________________________________________
*/
/*
        1. Get all employees
*/
async function getAllEmployees(req, res) {
  const emplData = await warehouse.findAll({
    where: { classifiedAId: 5 },
    attributes: [
      "id",
      "companyName",
      "email",
      "status",
      "countryCode",
      "phoneNum",
    ],
    include: [
      {
        model: role, attributes: ["name"],
        include: [
          {
            model: permission,
            attributes: ['permissionType'],
            include: [{ model: feature, attributes: ['title', 'featureOf'] }]
          }
        ]

      }
    ],
    // include:[
    //     {
    //         model: warehouse,
    //         as: 'employee',
    //         attributes: ['id', 'companyName'],
    //     } ,
    //     { model: role, attributes: ['name']}
    // ]
  });

  return res.json(returnFunction("1", "All Employees", emplData, ""));
}
/*
        2. Employee details and permissions
*/
async function employeeDetail(req, res) {
  const empId = req.query.employeeId;
  const emplData = await warehouse.findByPk(empId, {
    attributes: [
      "id",
      "companyName",
      "email",
      "status",
      "countryCode",
      "phoneNum",
      "roleId",
    ],
    include: [
      // {
      //     model: warehouse,
      //     as: 'employee',
      //     attributes: [ 'companyName'],
      // } ,
      { model: role, attributes: ["name"] },
    ],
  });
  if (!emplData)
    return res.json(returnFunction("0", "Employee data not available", {}, ""));
  const permissionData = await permission.findAll({
    where: { roleId: emplData.roleId },
  });
  const featureData = await feature.findAll({
    where: { status: true },
    attributes: ["id", "title"],
  });
  let permissionType = ["create", "read", "update", "delete"];
  const employeePermissions = getPermissions(
    featureData,
    permissionData,
    permissionType
  );
  return res.json(
    returnFunction("1", "All Employees", { employeeData: emplData }, "")
  );
}
/*
        3. Get active roles
*/
async function activeRoles(req, res) {
  const roleData = await role.findAll({
    where: { status: true },
    attributes: ["id", "name"],
  });
  return res.json(returnFunction("1", "All active roles", roleData, ""));
}
/*
        4. Add Employee
*/
async function addEmployee(req, res) {
  const { name, email, password, countryCode, phoneNum, roleId } = req.body;
  // check if exist
  // Hashing the password
  let hashedPassword = await bcrypt.hash(password, 10);
  try {
    await warehouse.create({
      companyName: name,
      email,
      password: hashedPassword,
      status: true,
      countryCode,
      phoneNum,
      roleId,
      employeeOf: req.user.id,
      classifiedAId: 5
    });
    return res.json(returnFunction("1", "Employee Added", {}, ""));
  } catch (err) {
    const message = err.errors[0].message ? err.errors[0].message : err;
    return res.json(returnFunction("0", "Error", {}, `${message}`));
  }
}
/*
        5. Employee details and permissions
*/
async function employeeUpdate(req, res) {
  const {
    name,
    email,
    password,
    countryCode,
    phoneNum,
    roleId,
    updatePassword,
    emplId,
  } = req.body;
  // check email uniqueness
  const checkExist = await warehouse.findOne({
    where: {
      email: email ? email : null,
      id: { [Op.not]: emplId },
      classifiedAId: 5,
    },
  });
  if (checkExist)
    throw new CustomException(
      "Employee with the following email exists",
      "Please try another email"
    );
  if (updatePassword) {
    // Hashing the password
    let hashedPassword = await bcrypt.hash(password, 10);
    warehouse.update(
      { companyName: name, email, password: hashedPassword, countryCode, phoneNum, roleId },
      { where: { id: emplId } }
    );
  } else {
    warehouse.update(
      { companyName: name, email, countryCode, phoneNum, roleId },
      { where: { id: emplId } }
    );
  }
  return res.json(returnFunction("1", "Employee data updated", {}, ""));
}
/*
        6. Change status
*/
async function employeeStatus(req, res) {
  const { status, emplId } = req.body;
  warehouse.update({ status }, { where: { id: emplId } });
  return res.json(returnFunction("1", "Employee status updated", {}, ""));
}


// ! Module: Role & Permissions
/*
!_____________________________________________________________________________________________________________________________________
*/
/*
        1. Get all roles
*/
async function allRoles(req, res) {
  const roleData = await role.findAll({ attributes: ["id", "name", "status"] });
  return res.json(returnFunction("1", "All Roles", roleData, ""));
}
/*
        2. Get role description 
*/
async function roleDetails(req, res) {
  const roleId = req.query.roleId;
  console.log(roleId);
  const permissionData = await permission.findAll({
    where: { roleId },
  });
  //return res.json(permissionData)
  const featureData = await feature.findAll({
    where: { status: true },
    attributes: ["id", "title"],
  });
  let permissionType = ["create", "read", "update", "delete"];
  const employeePermissions = getPermissions(
    featureData,
    permissionData,
    permissionType
  );
  return res.json(
    returnFunction("1", "All permissions of a role", employeePermissions, "")
  );
}
/*
        3. All active features 
*/
async function activeFeatures(req, res) {
  const featureData = await feature.findAll({
    where: { status: true },
    attributes: ["id", "title"],
  });
  let permissionType = ["create", "read", "update", "delete"];
  const employeePermissions = getPermissions(featureData, [], permissionType);
  return res.json(
    returnFunction("1", "All active features", employeePermissions, "")
  );
}

/*
        3. Add a role 
*/
async function addRole(req, res) {
  const { name, permissionRole } = req.body;
  // making email unique
  const checkExist = await role.findOne({ where: { name } });
  if (checkExist)
    throw new CustomException("Same role exists", "Please try another name");
  role
    .create({ name, status: true })
    .then((data) => {
      // manipulating to our desired format
      let bulkArray = [];
      permissionRole.map((ele) => {
        if (ele.permissions.create === true)
          bulkArray.push({
            permissionType: "create",
            featureId: ele.id,
            roleId: data.id,
          });
        if (ele.permissions.read === true)
          bulkArray.push({
            permissionType: "read",
            featureId: ele.id,
            roleId: data.id,
          });
        if (ele.permissions.update === true)
          bulkArray.push({
            permissionType: "update",
            featureId: ele.id,
            roleId: data.id,
          });
        if (ele.permissions.delete === true)
          bulkArray.push({
            permissionType: "delete",
            featureId: ele.id,
            roleId: data.id,
          });
      });
      permission.bulkCreate(bulkArray);
      return res.json(returnFunction("1", "Role added", {}, ""));
    })
    .catch((err) => {
      return res.json(returnFunction("1", "Error adding role", {}, `${err}`));
    });
}

/*
        4. Update Role
*/
async function updateRole(req, res) {
  const { name, permissionRole, roleId } = req.body;
  // making email unique
  const checkExist = await role.findOne({
    where: { name, id: { [Op.not]: roleId } },
  });
  if (checkExist)
    throw new CustomException("Same role exists", "Please try another name");
  role
    .update({ name, status: true }, { where: { id: roleId } })
    .then((data) => {
      // Deleting all the previous permissions of that role
      permission
        .destroy({ where: { roleId } })
        .then((deleted) => {
          // manipulating to our desired format
          let bulkArray = [];
          permissionRole.map((ele) => {
            if (ele.permissions.create === true)
              bulkArray.push({
                permissionType: "create",
                featureId: ele.id,
                roleId,
              });
            if (ele.permissions.read === true)
              bulkArray.push({
                permissionType: "read",
                featureId: ele.id,
                roleId,
              });
            if (ele.permissions.update === true)
              bulkArray.push({
                permissionType: "update",
                featureId: ele.id,
                roleId,
              });
            if (ele.permissions.delete === true)
              bulkArray.push({
                permissionType: "delete",
                featureId: ele.id,
                roleId,
              });
          });
          permission.bulkCreate(bulkArray);
          return res.json(returnFunction("1", "Role updated", {}, ""));
        })
        .catch((err) => {
          return res.json(
            returnFunction("1", "Error updating role", {}, `${err}`)
          );
        });
    })
    .catch((err) => {
      return res.json(returnFunction("1", "Error updating role", {}, `${err}`));
    });
}
/*
        4. Update Role Status
*/
async function updateRoleStatus(req, res) {
  const { status, roleId } = req.body;
  role
    .update({ status }, { where: { id: roleId } })
    .then((data) => {
      return res.json(returnFunction("1", "Role Status updated", {}, ""));
    })
    .catch((err) => {
      return res.json(returnFunction("1", "Error updating role", {}, `${err}`));
    });
}


/*
   Get Packges whose status is never Recieved 
*/
async function packagesNeverReceived(req, res) {
  const packages = await package.findAll({
    where: {
      arrived: "neverArrived"
    },
    include: [
      {
        model: booking,
        where:{
            bookingStatusId:{
                 [Op.in]: [1, 19,7,8,10,11,12,13,14,15,16,17,18,20,21]
            },
        },
        include: [{
          model: user,
          as: 'customer',
        },{
          model: warehouse,
          as: "receivingWarehouse",
          attributes: ["companyName", "located"],
        }]
      }
    ],
  })

  return res.json(returnFunction("1", "Details of Package", packages))


}



/*
   Get details of Specific Packges whose status is never Recieved 
*/
async function packagesNeverReceivedDetails(req, res) {
  const pkgId=req.params.pkgId
  const packages = await package.findOne({
    where: {
      id:pkgId,
      arrived: "neverArrived"
    },
    include: [
      {
        model: booking,
        attributes:['trackingId','senderName','senderEmail','senderPhone'],
        include: [{
          model: user,
          as: 'customer',
        }]
      },
      {
        model:category,
        attributes:['title','charge']
      },{
        model:ecommerceCompany,
        attributes:['title']
      }
    ],
  })

  return res.json(returnFunction("1", "Details of Package", packages))


}

/*
!_____________________________________________________________________________________________________________________________________________________
*/
// ! RECURRING FUNCTIONS
let filterBookings = async (bookingData, driverId) => {
  let jobs = [];
  let driverLocation = await axios.get("https://shipping-hack-default-rtdb.firebaseio.com/ShippingHack_driver/" + `${driverId}` + ".json");
  let findDist = false; driverLat = '', driverLng = '';

  if (driverLocation.data != null) {
    driverLat = driverLocation.data.lat;
    driverLng = driverLocation.data.lng;
    findDist = true;
  }

  await Promise.all(
    bookingData.map(async (ele) => {

      let tmpObj = {};

      let billableWeight;
      if (ele.weight < ele.volume / 5000) billableWeight = ele.volume / 5000;
      else if (ele.volume / 5000 < ele.weight) billableWeight = ele.weight;
      else if (ele.weight == "0.00" && ele.volume == "0.00") billableWeight = ele.weight;

      console.log("ðŸš€ ~ file: warehouse.js:4799 ~ bookingData.map ~ billableWeight:", billableWeight)
      let { earning } = await getDriverEarning(ele.id, driverId, 'delivery');
      console.log("ðŸš€ ~ file: warehouse.js:4804 ~ bookingData.map ~ earning:", earning)
      let driverDistance = await getDistance(driverLat, driverLng, ele.dropoffAddress.lat, ele.dropoffAddress.lng) ? await getDistance(driverLat, driverLng, ele.dropoffAddress.lat, ele.dropoffAddress.lng) : 'N/A';

      console.log("ðŸš€ ~ file: warehouse.js:4807 ~ bookingData.map ~ driverDistance:", driverDistance)
      tmpObj = {
        id: ele.id,
        trackingId: ele.trackingId,
        distance: driverDistance === 'N/A' ? `${driverDistance}` : `${driverDistance}`,
        earning: `$${earning}`,
        weight: billableWeight,
        PickUpPoint: `${ele.deliveryWarehouse.addressDB.streetAddress},${ele.deliveryWarehouse.addressDB.city},${ele.deliveryWarehouse.addressDB.district}`,
        dropoffPoint: `${ele.dropoffAddress.streetAddress},${ele.dropoffAddress.city},${ele.dropoffAddress.district}`,
        pickupCode: `${ele.deliveryWarehouse.addressDB.postalCode}`,
        dropoffCode: `${ele.dropoffAddress.postalCode}`,
        bookingStatus: ele.bookingStatusId,
        distanceUnit: 'miles'
      };

      //if(secondsDifference === 0) return null;
      jobs.push(tmpObj);
    }


    )
  );
  // jobs.push(baseUnit)
  return jobs;
};
async function allAssociatedJobs(req, res) {
  const driverId = 71;

  const bookingData = await booking.findAll({//!modified
    where: { deliveryDriverId: driverId, bookingStatusId: { [Op.or]: [13, 15, 16, 17] } },
    include: [
      { model: package, include: { model: category, attributes: ['title'] } },
      {
        model: warehouse, as: 'deliveryWarehouse', include: {
          model: addressDBS, attributes: ['id', 'postalCode', 'lat', 'lng', "streetAddress",
            "building",
            "floor",
            "apartment",
            "district",
            "city",
            "province",
            "country",
            "postalCode"]
        }, attributes: ['id']
      },
      { model: bookingType, attributes: ['title'] },
      { model: bookingStatus, attributes: ['id', 'title'] },
      {
        model: addressDBS, as: 'dropoffAddress', attributes: ['postalCode', 'lat', 'lng', "streetAddress",
          "building",
          "floor",
          "apartment",
          "district",
          "city",
          "province",
          "country",
          "postalCode",]
      },
    ],
    attributes: ['id', 'trackingId', 'weight', 'length', 'width', 'height', 'bookingStatusId']
  });

  //  return res.json(bookingData)
  let outGoingSingle = [], outGoingGroup = [], outPickedSingle = [], outPickedGroup = [], assignedDelivery;
  let filterBooking;
  if (bookingData) {//!modified

    assignedDelivery = await bookingData.filter(ele => ele.bookingStatusId == 13);
    console.log("ðŸš€ ~ file: driver.js:750 ~ allAssociatedJobs ~ assignedDelivery:", assignedDelivery)
    filterBooking = await filterBookings(assignedDelivery, driverId);
    console.log("ðŸš€ ~ file: driver.js:751 ~ allAssociatedJobs ~ filterBooking:", filterBooking)
    //  return res.json(filterBooking);

    // Ongoing (group and single)
    const onGoingData = await onGoingOrder.findAll({
      //!modified
      where: { userId: driverId, ordersStatus: { [Op.or]: [16, 17] } },
    });
    // return res.json(onGoingData)
    onGoingData.map(ele => {
      let ordersInGroup = ele.orderNumbers.split(",").map(num => parseInt(num)).map(num => parseInt(num));
      console.log(ordersInGroup)
      // Ongoing -- status is 12
      if (ele.ordersStatus == 17) {
        let currArr = bookingData.filter(ele => ordersInGroup.includes(ele.id))
        console.log("ðŸš€ ~ file: warehouse.js:4887 ~ allAssociatedJobs ~ currArr:", currArr)
        console.log(currArr)
        // checking if single
        if (ordersInGroup.length === 1) {
          outGoingSingle = currArr
        }
        else outGoingGroup.push({
          groupId: ele.id,
          date: ele.date,
          orderNumbers: ele.orderNumbers,
          sequence: ele.sequence,
          status: ele.status,
          orderCount: ordersInGroup.length,
          warehouse: currArr.length != 0 ? currArr[0].dataValues.deliveryWarehouse : '',
        })
      }
      else if (ele.ordersStatus == 16) {
        let currArr = bookingData.filter(ele => ordersInGroup.includes(ele.id))
        console.log(currArr)
        // checking if single
        if (ordersInGroup.length === 1) outPickedSingle = currArr
        else outPickedGroup.push({
          groupId: ele.id,
          date: ele.date,
          orderNumbers: ele.orderNumbers,
          sequence: ele.sequence,
          status: ele.status,
          orderCount: ordersInGroup.length,
          warehouse: currArr.length != 0 ? currArr[0].dataValues.deliveryWarehouse : '',
        })
      }
    });
    // Condition Ends Here 

  }
  let deliveryJobs = {
    assigned: filterBooking,
    ongoing: { 'group': outGoingGroup, 'single': outGoingSingle },
    picked: { 'group': outPickedGroup, 'single': outPickedSingle },
  };
  return res.json(returnFunction('1', 'Job Pool', { deliveryJobs }, ''));
};

function getPermissions(featureData, permissionData, permissionType) {
  let employeePermissions = featureData.map((ele) => {
    let tmpFeature = permissionData.filter((perm) => perm.featureId === ele.id);
    let tmpPermission = permissionType.reduce((acc, type) => {
      let found = tmpFeature.some((ele) => ele.permissionType === type);
      return { ...acc, [type]: found };
    }, {});
    return { id: ele.id, title: ele.title, permissions: tmpPermission };
  });
  return employeePermissions;
}


/*
!_________________________________________________________________________________________________________________________________________________________
*/

module.exports = {
  distanceCalculator,
  emailTesting,
  notficationsTesting,
  registerWarehouse,
  provideInfo,
  sendOTP,
  verifyOTP,
  signIn,
  resetPassword,
  profileData,
  //Incoming Packages
  bookingDetailsById,
  getAllbookings,
  incomingToWareHouse,
  bookingDetails,
  receivedAtWarehouse,
  allActiveWarehouse,
  getAllActiveTransporterGuy,
  toTransit,
  // In-transit Bookings
  inTransitBookings,
  transitGroupDetails,
  receivedFromTransporter,
  //Outgoing Packages
  outgoingFromWareHouse,
  selfPickupOutgoing,
  selfPickupDelivered,
  getWarehouseDrivers,
  assignOrderToDriver,
  //& Address
  addAddress,
  getAddress,
  getAddressById,
  updateAddress,
  deleteAddress,
  // Order Placing
  idsForBooking,
  searchAddress,
  checkCouponValidity,
  getCharges,
  createOrder,
  packageArrived,
  createRemeasurement,
  consolidationRemesurements,
  handedOver,
  confirmPayment,
  checktrackingNumber,
  // Driver Register
  registerStep1,
  getActiveVehicleTypes,
  registerStep2,
  registerStep3,
  updateDriverProfile,
  updateDriverVehicle,
  updateDriverStatus,
  updateDriverLicense,
  getWarehouseDriversAll,
  deleteUser,
  driverDetailsById,
  // Dashboard
  generalDashboard,
  getRecentActivity,
  completedBookings,
  bookingDetailsByTracking,
  //profile management
  profile_management,
  virtualBox,
  //homepage
  homePage,
  //catageries
  getAllCategory,
  getLogCompaniesForFilter,
  toDirectDelivery,
  markDeliver,
  updateBookingStatus,
  allBookingStatus,
  getActiveWarehouse,
  addTrackingOnParcel,
  addTrackingOnbooking,
  allAssociatedJobs,
  //=====> WareHouse location,Zone ,IboundOrders
  warehouselocation,
  wareHouseZone,
  getLocations,
  getInboundOrderWarehouse,
  orderReceived,
  InboundStatuses,
  markOrderPutaway,
  getshelfsCode,
  statusesforAvailable,
  orderAvailableState,
  getOutboundOrders,
  orderAssignedToAssociates,
  getOrdersAssignedtoAssociate,
  warehouseInventoryName,
  InspectOrder,
  warehouseDashboard,


  //==========Warehouse Associates Working and Batch OutBound Order,
  getBatchOutboundOrders,
  OrderPacked,
  associatePickedOrder,
  associatePackingOrder,
  assignDriverToOrder,

  //========> Employees
  getAllEmployees,
  employeeDetail,
  activeRoles,
  addEmployee,
  employeeUpdate,
  employeeStatus,

  //==============> Roles and Permissions

  allRoles,
  roleDetails,
  activeFeatures,
  addRole,
  updateRole,
  updateRoleStatus,

  //===============Service Orders

  getServiceOrder,
  confirmServiceOrder,
  //======================>
  packagesNeverReceived,
  OrderForNeverReceivedPkg,
  packagesNeverReceivedDetails,
  bookingDetailsCancelled

};

















// will replace
// async function receivedFromTransporter(req, res) {
//   const { bookingIds, inTransitGroupId } = req.body;
//   const bookingData = await booking.findAll({
//     where: { id: { [Op.or]: bookingIds } },
//     attributes: [
//       "id",
//       "trackingId",
//       "scheduleSetBy",
//       "receiverEmail",
//       "bookingTypeId",
//       "deliveryTypeId"
//     ],
//     include: {
//       model: user,
//       as: "customer",
//       include: { model: deviceToken, attributes: ["tokenId"] },
//       attributes: ["id", "email","firstName"],
//     },
//   });
//   // change status to received at warehouse
//   await booking.update({ bookingStatusId: 12 }, { where: { id: bookingIds } });
//   // create history
//   let recAtWarehouse = [],
//     scheduled = [],
//     selfIds = [];
//   const time=getDateAndTime()
//   await inTransitGroups.update(
//     { status: "Delivered", arrivalDate: time.currentDate, arrivalTime: time.currentTime },
//     { where: { id: inTransitGroupId } }
//   );
//   await bookingIds.map((ele) => {
//     recAtWarehouse.push({
//       date: time.currentDate,
//       time: time.currentTime,
//       bookingId: ele,
//       bookingStatusId: 12,
//     });
//   });
//   // console.log(recAtWarehouse)
//   await bookingHistory.bulkCreate(recAtWarehouse);
// // { TODO pending check willl update it later
//   // filtering out self pick up bookings and setting status to scheduled
// //   const pickCaseBookings = bookingData.filter((ele) => ele.deliveryTypeId === 2);
// //   pickCaseBookings.map((ele) => {
// //     selfIds.push(ele.id);
// //     scheduled.push({
// //       date: time.currentDate,
// //       time: time.currentTime,
// //       bookingId: ele.id,
// //       bookingStatusId: 20,
// //     });
// //   });
// //   await booking.update(
// //     { dropoffDate: time.currentDate, bookingStatusId: 20 },
// //     { where: { id: { [Op.or]: selfIds} } }
// //   );
// //   await bookingHistory.bulkCreate(scheduled);
// // }
//   // Throw notification to the sender
//   bookingData.map(async(ele) => {
//     const  weightData = calculateWeights(ele.Packages)
//     const timestamp = bookingData.createdAt;
//     const datePortion = String(timestamp).substring(4, 15);
//     // SEND EMAIL
//     arrivedOrder(
//       bookingData.customer.email,
//       bookingData.customer.firstName,
//       String(bookingData.trackingId),
//       String(bookingData.Packages.length).padStart(2, 0),
//       String(weightData.chargedWeight),
//       bookingData.logisticCompany.title,
//       datePortion
//     );
//     // FOR SELF PICK UP -- SEND EMAIL TO RECEIVER to pickup from warehouse
//     if (ele.deliveryTypeId === 2) {
//       transporter.sendMail(
//         {//TODO pending
//           from: process.env.EMAIL_USERNAME, // sender address
//           to: ["sigidevelopers@gmail.com", bookingData.receiverEmail], // list of receivers
//           subject: `please pick up booking from warehouse`, // Subject line
//           text: `Please come to warehouse to receive your booking  booking id is ${ele.id}`, // plain text body
//         },
//         function (err, info) {
//           if (err) console.log(err);
//           console.log(info);
//         }
//       );
//     }
//     // FOR DELIVERY
//   });
//   return res.json(
//     returnFunction(
//       "1",
//       "Bookings received at warehouse & Awaiting To be picked",
//       {},
//       ""
//     )
//   );
// }