require("dotenv").config();
//importing Models
const {
  warehouse,
  user,
  userPlan,
  booking,
  bookingStatus,
  addressDBS,
  size,
  deliveryType,
  shipmentType,
  merchantOrder,
  merchantOrderStatuses,
  warehouseZones,
  merchantSubcategories,
  merchantCategories,
  products,
  unit,
  inWarehouseLocation,
  merchantService,
  category,
  bookingHistory,
  driverDetail,
  driverType,
  vehicleType,
  vehicleImage,
  district,
  deviceToken,
  corregimiento,
  province,
  structureType,
  webUser,
  banner,
  coupon,
  unitClass,
  support,
  FAQs,
  generalCharges,
  weightCharges,
  volumetricWeightCharges,
  distanceCharges,
  wallet,
  driverPaymentSystem,
  estimatedBookingDays,
  pushNotification,
  paymentRequests,
  bank,
  defaultUnit,
  structQuestion,
  role,
  permission,
  feature,
  bookingType,
  appUnits,
  units,
  webPolicy,
  logisticCompany,
  logisticCompanyCharges,
  package,
  ecommerceCompany,
  restrictedItems,
} = require("../models");
const getDistance = require("../utils/distanceCalculator");
const { DOMImplementation, XMLSerializer } = require("xmldom");
const xmlSerializer = new XMLSerializer();
const document = new DOMImplementation().createDocument(
  "http://www.w3.org/1999/xhtml",
  "html",
  null
);
const svgNode = document.createElementNS("http://www.w3.org/2000/svg", "svg");
const svg2img = require("svg2img");
// Importing Custom exception
const CustomException = require("../middleware/errorObject");
//importing redis
const redis_Client = require("../routes/redis_connect");
// Barcode generator
var JsBarcode = require("jsbarcode");
var fs = require("fs");
var path = require("path");
const { sign } = require("jsonwebtoken");
// OTP generator
const otpGenerator = require("otp-generator");
const sendNotification = require("../helper/throwNotification");
const throwNotification=require('../helper/throwNotification')
const adminNotification=require('../helper/adminNotifications')
//const stripe = require('stripe')(process.env.STRIPE_KEY);
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
// Calling mailer
const nodemailer = require("nodemailer");
const sequelize = require("sequelize");
const {
  textSearchAddress,
  getNextPostalCode,
} = require("../controller/customer");
const e = require("express");
const Braintree = require("./braintree");
//Units functions managemnets
const {
  currentAppUnitsId,
  unitsConversion,
  unitsSymbolsAndRates,
  convertToBaseUnits,
} = require("../utils/unitsManagement");
const { virtualBox } = require("./warehouse");
const { title } = require("process");
// Defining the account for sending email
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// ! Module 1: Auth
/*
 *       1. Login Admin
 */
async function signIn(req, res) {
  const { email, password, dvToken } = req.body;
  // Find the admin data based on email, status, and classifiedAId
  const adminData = await warehouse.findOne({
    where: { email, status: true, classifiedAId: [1, 2] },
  });
  if (!adminData) {
    throw new CustomException("User not found", "Please enter valid data");
  }
  const match = await bcrypt.compare(password, adminData.password);
  if (!match) {
    throw new CustomException(
      "Bad credentials",
      "Please enter correct password to continue"
    );
  }
  // if (!adminData.status) {
  //   throw new CustomException('Blocked by', 'Please contact admin to continue');
  // }
  // Update the dvToken for the admin
  await warehouse.update({ dvToken }, { where: { id: adminData.id } });
  const accessToken = sign(
    { id: adminData.id, email: adminData.email, dvToken: dvToken },
    process.env.JWT_ACCESS_SECRET
  );
  // Add the admin's online clients to the Redis database
  redis_Client.hSet(`tsh${adminData.id}`, dvToken, accessToken);

  const output = {
    id: adminData.id,
    name: adminData.name,
    email: adminData.email,
    accessToken,
  };
  // Retrieve feature data where status is true
  const featureData = await feature.findAll({
    where: { status: true },
    attributes: ["id", "title"],
  });
  // Add the featureData to the output
  output.featureData = featureData;

  return res.json(returnFunction("1", "Login Successful", output, ""));
}

// ! Module 2: Customers
/*
 *  1. Get All customers
 */
async function getAllCustomers(req, res) {
  const userData = await user.findAll({
    where: { userTypeId: 1, deletedAt: null },
    attributes: [
      "id",
      "firstName",
      "email",
      "lastName",
      "countryCode",
      "phoneNum",
      "status",
      "virtualBox"

    ],
  });
  let filterUsers = userData.filter((ele) => ele.firstName != "");
  return res.json(returnFunction("1", "All users", filterUsers, ""));
}
/*
 *    2.  Customer Details
 */
async function customerDetailsById(req, res) {
  //const {customerId} = req.body;
  const customerId = req.query.id;
  const userData = await user.findByPk(customerId, {
    include: {
      model: booking,
      as: "customer",
      include: [
        { model: bookingStatus, attributes: ["id", "title"] },
        { model: addressDBS, as: "pickupAddress", attributes: ["postalCode"] },
        { model: addressDBS, as: "dropoffAddress", attributes: ["postalCode"] },
      ],
      attributes: ["id", "trackingId", "pickupDate"],
    },
    attributes: [
      "id",
      "firstName",
      "lastName",
      "email",
      "countryCode",
      "phoneNum",
      [
        sequelize.fn("date_format", sequelize.col("user.createdAt"), "%Y"),
        "joinedOn",
      ],
    ],
  });
  return res.json(returnFunction("1", "Customer Details", userData, ""));
}

/*
        3. booking details
*/
async function bookingDetails(req, res) {
  console.log("🚀 ~ bookingDetails going in this api ~ bookingDetails:")
  const userId = req.query.id;
  console.log("🚀 ~ bookingDetails ~ req.query.id:", req.query.id)
  console.log("🚀 ~ bookingDetails ~ customerId:", userId)
  const bookingData = await booking.findOne({
    where: {
      customerId: userId,
    },
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
      { model: logisticCompany, attributes: ["id", "title"] },
      {
        model: package,
        include: [
          { model: category, attributes: ["title"] },
          { model: ecommerceCompany, attributes: ["title"] },
        ],
        attributes: ["height", "width", "length", "volume", "weight"],
      },
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
      //{model: category, attributes: ['title']},
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
      "senderName",
      "senderEmail",
      "senderPhone",
      "barcode",
      "weight",
      "distance",
      "scheduleSetBy",
    ],
  });
  console.log("🚀 ~ bookingDetails ~ bookingData:", bookingData)
  //return res.json(bookingData)
  const bookingStatuses = await bookingStatus.findAll({
    attributes: ["id", "title"],
  });
  let historyArray = [];
  bookingStatuses.map((ele) => {
    //console.log(ele.id)
    let found = bookingData.bookingHistories.filter(
      (element) => element.bookingStatusId === ele.id
    );
    if (found.length > 0) {
      //console.log(found[0].dataValues.bookingStatus)
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
   console.log("history array======================>",historyArray)
  let data = bookingData.toJSON();
  for (let obj of data.packages) {
    obj.category = obj.category.title;
    delete data.packages.category;
    obj.ecommerceCompany = obj.ecommerceCompany?.title;
    delete data.packages.ecommerceCompany;
  }
  data.bookingHistories = historyArray;
  return res.json(returnFunction("1", "Customer Booking details", data, ""));
}

// ! Module 3: Drivers
/*
            1. Get All drivers
*/
async function getAllDrivers(req, res) {
  const driverData = await user.findAll({
    where: { userTypeId: 2, deletedAt: null },
    include: {
      model: driverDetail,
      include: [
        { model: vehicleType, attributes: ["title"] },
        { model: warehouse, attributes: ["id", "companyname"] },
      ],
      attributes: ["approvedByAdmin", "driverTypeId"],
    },
    attributes: [
      "id",
      "firstName",
      "lastName",
      "email",
      "countryCode",
      "phoneNum",
      "status",
      "image",
    ],
  });

  // filtering out drivers with incomplete data
  let incompleteDriver = driverData.filter((ele) => ele.driverDetail === null);
  let completed = driverData.filter((ele) => ele.driverDetail !== null);
  let freeLance = completed.filter(
    (ele) => ele.driverDetail.driverTypeId === 1
  );
  let associated = completed.filter(
    (ele) => ele.driverDetail.driverTypeId === 2
  );
  return res.json(
    returnFunction(
      "1",
      "All drivers",
      { freeLance, associated, incompleteDriver },
      ""
    )
  );
}
/*
            2.  Driver Details
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
        required:false,
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
    },{
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
            3. Change user status
*/
async function blockUnblockUser(req, res) {
  const { userId, status } = req.body;
  // removing accessToken from db
  deviceToken.destroy({ where: { userId } });
  // removing from redis
  redis_Client.del(`${req.user.id}`);
  user
    .update({ status }, { where: { id: userId } })
    .then((data) => {
      return res.json(
        returnFunction("1", "User status updated successfully", {}, "")
      );
    })
    .catch((err) => {
      return res.json(
        returnFunction("0", "Internal Server Error", {}, `${err}`)
      );
    });
}
/*
            4. Approve driver
*/
async function approveDriver(req, res) {
  const { userId } = req.body;
  const userData = await user.findByPk(userId, {
    include: { model: deviceToken, attributes: ["tokenId"] },
    attributes: ["firstName", "lastName"],
  });
  driverDetail
    .update({ approvedByAdmin: true }, { where: { userId } })
    .then((data) => {
      // throw notification to driver
      let notification = {
        title: `Congratulations! ${userData.firstName} your request is approved `,
        body: "Please login to start your journey with PPS Logistica",
      };
      let to = userData.deviceTokens.map((ele) => {
        return ele.tokenId;
      });
      sendNotification(to, notification);
      return res.json(returnFunction("1", "Driver approved", {}, ""));
    })
    .catch((err) => {
      return res.json(
        returnFunction("0", "Internal Server Error", {}, `${err}`)
      );
    });
}
/*
            5. Driver wallet
*/
async function driverWallet(req, res) {
  //const {driverId} = req.body;
  const driverId = req.query.id;
  //const defaultDistanceUnit = await defaultUnit.findOne({where: {type: 'distance', status: true}, attributes: ['symbol']})
  const defaultCurrencyUnit = await appUnits.findOne({
    where: {status: true },
    include:{
      model:units,
      as:"currencyUnit",
      attributes:['type','symbol']
    },
    attributes:[]
  });
  let userId = driverId;
  const userData = await user.findOne({
    where: { id: userId },
    include: [
      {
        model: bank,
        attributes: ["id", "bankName", "accountName", "accountNumber"],
      },
      {
        model: paymentRequests,
        attributes: [
          "id",
          "amount",
          "type",
          [
            sequelize.fn("date_format", sequelize.col("date"), "%m-%d-%Y"),
            "date",
          ],
          [sequelize.fn("date_format", sequelize.col("time"), "%r"), "time"],
        ],
      },
    ],
  });

  const sumOfEarnings = await wallet.findAll({
    where: { userId },
    attributes: [[sequelize.fn("SUM", sequelize.col("amount")), "Sum"]],
  });
  //return res.json(sumOfEarnings)
  const Paid = await paymentRequests.findAll({
    where: { userId, type: "withdraw", status: "done" },
    attributes: [[sequelize.fn("SUM", sequelize.col("amount")), "paid"]],
  });

  let total =
    sumOfEarnings[0].dataValues.Sum === null
      ? "0.00"
      : sumOfEarnings[0].dataValues.Sum;
  total = -1 * parseFloat(total);
  let paid =
    Paid[0].dataValues.paid === null ? "0.00" : Paid[0].dataValues.paid;
  //return res.json(paid)

  let balance = total - parseFloat(paid);
  let paymentRequestsData = [];
  let obj = {};

  userData.paymentRequests.map((ele) => {
    obj = {
      id: ele.id,
      amount: `${defaultCurrencyUnit.symbol}` + ele.amount,
      type: ele.type,
      date: `${ele.date} ${ele.time}`,
    };
    paymentRequestsData.push(obj);
  });
  console.log(total, balance);
  const tmpObj = {
    totalEarning: !total ? "0.00" : `${total}`,
    availableBalance: !balance ? "0.00" : `${balance}`,
    bank: userData.banks[0] ?? {},
    transactions: paymentRequestsData,
    currencyUnit: defaultCurrencyUnit.currencyUnit.symbol,
  };

  return res.json(returnFunction("1", "Wallet", tmpObj, ""));
}
/*
            6. Pay to driver
*/
async function payToDriver(req, res) {
  let { driverId, amount } = req.body;
  let nowDate = Date.now();
  let cDT = new Date(nowDate);
  let date = `${cDT.getFullYear()}-${("0" + (cDT.getMonth() + 1)).slice(-2)}-${(
    "0" + cDT.getDate()
  ).slice(-2)}`;
  let time = `${cDT.getHours()}:${cDT.getMinutes()}:${cDT.getSeconds()}`;
  paymentRequests
    .create({
      amount,
      status: "done",
      type: "withdraw",
      userId: driverId,
      date,
      time,
    })
    .then((data) => {
      return res.json(returnFunction("1", "Paid to driver", {}, ""));
    })
    .catch((err) => {
      return res.json(
        returnFunction("0", "Internal server error", {}, `${err}`)
      );
    });
}

// ! Module 4: Warehouse

/*
            1. Get All warehouses
*/
async function getAllWarehouse(req, res) {
  const warehouseData = await warehouse.findAll({
    where: req.query.located
      ? { classifiedAId: 3, status: true, located: req.query.located }
      : { classifiedAId: 3, status: true },
    include: { model: addressDBS, attributes: ["country", "city"] },
    attributes: [
      "id",
      "companyName",
      "email",
      "countryCode",
      "phoneNum",
      "located",
    ],
  });
  return res.json(returnFunction("1", "All warehouse data", warehouseData, ""));
}
/*
 *curr        2. Get warehouse details
 */
async function warehouseDetails(req, res) {
  const warehouseId = req.params.id;
  const warehouseData = await warehouse.findByPk(warehouseId, {
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
      {
        model: booking,
        as: "receivingWarehouse",
        include: [
          {
            model: addressDBS,
            as: "pickupAddress",
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
          { model: bookingStatus, attributes: ["title"] },
        ],
        attributes: ["id", "trackingId", "pickupDate", "total"],
      },
      {
        model: booking,
        as: "deliveryWarehouse",
        include: [
          {
            model: addressDBS,
            as: "dropoffAddress",
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
          { model: bookingStatus, attributes: ["title"] },
        ],
        attributes: ["id", "trackingId", "ETA", "total"],
      },
    ],
    attributes: ["id", "companyName", "email", "phoneNum"],
  });
  console.log("🚀 ~ warehouseDetails ~ warehouseData:", warehouseData.receivingWarehouse)
  return res.json(returnFunction("1", "Warehouse details", warehouseData, ""));
}
/*
            3.  Search Addresses - DBS
    ________________________________________
*/
async function searchAddress(req, res) {
  const { text } = req.body;
  let addresses = await textSearchAddress(text);
  return res.json(returnFunction("1", "Filtered Addresses", { addresses }, ""));
}
/*
 *done   4. Create warehouse
 */
async function createWarehouse(req, res) {
  const {
    email,
    password,
    companyName,
    country,
    province,
    district,
    city,
    completeAddress,
    located,
    countryCode,
    phoneNum,
  } = req.body;
  // console.log("ðŸš€ ~ file: admin.js:482 ~ createWarehouse ~ req.body:", req.body)
  if (email === null || password === null) {
    throw CustomException("Empty", "Email or Password not Entered");
  }
  classifiedAs = 3;
  const entity = await warehouse.findOne({
    where: { email, classifiedAId: classifiedAs },
  }); //TODO deleted:0
  if (entity) {
    return res.json(returnFunction("2", "Email Exist Already", {}, ""));
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  const companyAddress = await addressDBS.create({
    country,
    province,
    district,
    city,
    streetAddress: completeAddress,
  });
  const companyInfo = await warehouse.create({
    email,
    password: hashedPassword,
    addressDBId: companyAddress.id,
    companyName,
    status: true,
    classifiedAId: 3,
    located,
    countryCode,
    phoneNum,
  });
  await addressDBS.update(
    { warehouseId: companyInfo.id },
    { where: { id: companyAddress.id } }
  );
  const output = {
    companyId: companyInfo.id,
    id: companyInfo.id,
    email,
    companyName,
    located: companyInfo.located,
    address: `${country},${province},${district},${city},${completeAddress}`,
  };
  return res.json(returnFunction("1", "Success", output, ""));
}
/*
 *done        5. Update warehouse
 */
async function updateWarehouse(req, res) {
  const { address, warehouseId, ...input } = req.body;
  const Data = await warehouse.findByPk(warehouseId, {
    attributes: ["addressDBId"],
  });
  //adding status true
  const updated = await warehouse.update(input, { where: { id: warehouseId } });
  await addressDBS.update(address, { where: { id: Data.addressDBId } });
  // const updatedAddres = await warehouse.update(input, {where: { id:warehouseId }});
  if (updated == false)
    throw new CustomException("Not Found", "Something went wrong");
  return res.json(returnFunction("1", "Updated", {}, ""));
}
/*
    TODO        6. Delete warehouse
*/
async function deleteWarehouse(req, res) {
  const { warehouseId } = req.body;
  warehouse
    .update({ status: false }, { where: { id: warehouseId } })
    .then((data) => {
      return res.json(
        returnFunction("1", "Warehouse deleted successfully", {}, "")
      );
    })
    .catch((err) => {
      return res.json(
        returnFunction("0", "Internal Server Error", {}, `${err}`)
      );
    });
}

// ! Module 5: Address System
/*
            1. Get All addresses
*/
async function getAllAddresses(req, res) {
  const addressData = await addressDBS.findAll({
    where: { removed: false },
    include: [
      { model: structureType, attributes: ["title"] },
      { model: corregimiento, attributes: ["title"] },
      { model: district, attributes: ["title"] },
      { model: province, attributes: ["title"] },
      { model: user, attributes: ["firstName", "lastName"] },
      { model: webUser, attributes: ["name", "surName"] },
      { model: warehouse, attributes: ["name"] },
    ],
    attributes: [
      "id",
      "postalCode",
      "secondPostalCode",
      "addedBy",
      "verified",
      "buildingName",
    ],
  });
  let sortedData = addressData.sort((a, b) => a.id - b.id);
  return res.json(returnFunction("1", "All Addresses", sortedData, ""));
}
/*
            2. Get address details
*/
async function addressDetails(req, res) {
  //const {addressId} = req.body;
  const addressId = req.query.id;
  const addressData = await addressDBS.findByPk(addressId, {
    include: [
      {
        model: structureType,
        attributes: ["icon", "title"],
        include: { model: structQuestion, attributes: ["label"] },
      },
      { model: corregimiento, attributes: ["title"] },
      { model: district, attributes: ["title"] },
      { model: province, attributes: ["title"] },
      {
        model: user,
        attributes: [
          "firstName",
          "lastName",
          "email",
          "countryCode",
          "phoneNum",
          [
            sequelize.fn("date_format", sequelize.col("user.createdAt"), "%Y"),
            "joinedOn",
          ],
        ],
      },
      {
        model: webUser,
        attributes: [
          "name",
          "surName",
          "email",
          "phoneNum",
          "whatsapp",
          [
            sequelize.fn(
              "date_format",
              sequelize.col("webUser.createdAt"),
              "%Y"
            ),
            "joinedOn",
          ],
        ],
      },
      { model: warehouse, attributes: ["name", "email"] },
    ],
    attributes: {
      exclude: [
        "removed",
        "createdAt",
        "updatedAt",
        "corregimientoId",
        "districtId",
        "provinceId",
        "userId",
        "webUserId",
      ],
    },
  });
  let userData =
    addressData.addedBy === "app"
      ? {
          name: `${addressData.user.firstName} ${addressData.user.lastName}`,
          email: addressData.user.email,
          phone: `${addressData.user.countryCode} ${addressData.user.phoneNum}`,
          memberSince: addressData.user.dataValues.joinedOn,
        }
      : addressData.addedBy === "web"
      ? {
          name: `${addressData.webUser.name} ${addressData.webUser.surName}`,
          email: addressData.webUser.email,
          phone: `${addressData.webUser.phoneNum}`,
          whatsapp: addressData.webUser.whatsapp,
          memberSince: addressData.webUser.dataValues.joinedOn,
        }
      : {
          name: `${addressData.warehouse.name}`,
          email: addressData.warehouse.email,
          phone: ``,
          whatsapp: ``,
          memberSince: `2023`,
        };
  addressData.dataValues.senderDetails = userData;
  addressData.dataValues.structureType.structQuestions.map((ele, ind) => {
    if (ind === 0) ele.dataValues.value = addressData.dataValues.questionOne;
    if (ind === 1) ele.dataValues.value = addressData.dataValues.questionTwo;
    if (ind === 2) ele.dataValues.value = addressData.dataValues.questionThree;
  });
  delete addressData.dataValues.user;
  delete addressData.dataValues.webUser;
  delete addressData.dataValues.warehouse;
  delete addressData.dataValues.questionOne;
  delete addressData.dataValues.questionTwo;
  delete addressData.dataValues.questionThree;
  if (addressData.dataValues.structureTypeId === 1) {
    // adding to ask building Name
    addressData.dataValues.label = "Building Name:";
  } else if (addressData.dataValues.structureTypeId === 2) {
    // adding to ask building Name
    addressData.dataValues.label = "";
  } else if (addressData.dataValues.structureTypeId === 3) {
    // adding to ask building Name
    addressData.dataValues.label = "Neighborhood Name:";
  } else if (addressData.dataValues.structureTypeId === 4) {
    // adding to ask building Name
    addressData.dataValues.label = "Winery Name:";
  } else if (addressData.dataValues.structureTypeId === 5) {
    // adding to ask building Name
    addressData.dataValues.label = "Business Name:";
  } else if (addressData.dataValues.structureTypeId === 6) {
    // adding to ask building Name
    addressData.dataValues.label = "Building Name:";
  }

  return res.json(returnFunction("1", "Address Details", addressData, ""));
}
/*
            3. Generate random postal code
*/
async function generateRandomCode(req, res) {
  let number = otpGenerator.generate(4, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: true,
    specialChars: false,
  });
  return res.json(returnFunction("1", "Random number", { number }, ""));
}
/*
            3. Approve Address
*/
async function approveAddress(req, res) {
  const { lat, lng, addressId } = req.body;
  const addressData = await addressDBS.findByPk(addressId, {
    include: { model: corregimiento, attributes: ["id", "lastCode"] },
  });
  let nextCode = getNextPostalCode(addressData.corregimiento.lastCode);
  addressDBS
    .update(
      { lat, lng, secondPostalCode: nextCode, verified: true },
      { where: { id: addressId } }
    )
    .then((data) => {
      corregimiento.update(
        { lastCode: nextCode },
        { where: { id: addressData.corregimiento.id } }
      );
      return res.json(returnFunction("1", "Address approved", {}, ""));
    })
    .catch((err) => {
      return res.json(
        returnFunction("0", "Internal server error", {}, `${err}`)
      );
    });
}
/*
            4. Edit Address
*/
async function editAddress(req, res) {
  // TODO what can be edited?
}
/*
            5. Delete Address
*/
async function deleteAddress(req, res) {
  const { addressId } = req.body;
  addressDBS
    .update({ removed: true }, { where: { id: addressId } })
    .then((data) => {
      return res.json(returnFunction("1", "Address deleted", {}, ""));
    })
    .catch((err) => {
      return res.json(
        returnFunction("0", "Internal server error", {}, `${err}`)
      );
    });
}

// ! Module 6: Banners
/*
            1. Add Banner 
*/
async function addBanner(req, res) {
  if (!req.file)
    throw new CustomException("Image not uploaded", "Please upload image");
  const { description } = req.body;
  let tmpPath = req.file.path;
  let imagePath = tmpPath.replace(/\\/g, "/");
  banner.create({
    title: "Banner",
    description,
    image: imagePath,
    status: true,
  });
  return res.json(returnFunction("1", "Banner Added", {}, ""));
}
/*
            2. Get all banners
*/
async function getAllBanners(req, res) {
  const bannerData = await banner.findAll({
    where: { status: true },
    attributes: ["id", "description", "image", "status"],
  });
  return res.json(returnFunction("1", "All banners", bannerData, ""));
}
/*
            3. Update banner
*/
async function updateBanner(req, res) {
  const { description, bannerId , updateImage} = req.body;
   let input = {}
  if (updateImage == 'true') {   
    if (!req.file)
      throw new CustomException("Image not uploaded", "Please upload image");
    let tmpPath = req.file.path;
    imagePath = tmpPath.replace(/\\/g, "/");
    input = { title: "Banner", description, image:imagePath }
  }else{
    input = { title: "Banner", description}
  }
  await banner.update(
    input,
    { where: { id: bannerId } }
  );
  
  return res.json(returnFunction("1", "Banner updated", {}, ""));
}
/*
            4. Change banner status
*/
async function changeBannerStatus(req, res) {
  const { status, bannerId } = req.body;
  banner.update({ status }, { where: { id: bannerId } });
  return res.json(returnFunction("1", "Banner status changed", {}, ""));
}

// ! Module 7: Categories
/*
            1. Add Category
*/
async function addCategory(req, res) {
  const { title, charge } = req.body;
  const catExist = await category.findOne({where: {title}});
  if(catExist) throw CustomException('A category with the following name already exist', 'Please try some other name');
  const newCategory=  category.create({ title, charge, status: true })

  return res.json(returnFunction("1", "Category added", {id : newCategory.id}, ""));
}
/*
            2. Get All Category
*/
async function getAllCategory(req, res) {
  //const defaultDistanceUnit = await defaultUnit.findOne({where: {type: 'distance', status: true}, attributes: ['symbol']})
  // const defaultCurrencyUnit = await defaultUnit.findOne({where: {type: 'currency', status: true}, attributes: ['symbol']})
  const categoryData = await category.findAll({
    where: { status: true },
    attributes: ["id", "title", "status", "charge"],
  });
  return res.json(returnFunction("1", "All categories", categoryData, ""));
}
/*
            3. Update Category
*/
async function updateCategory(req, res) {
  const { title, charge, categoryId } = req.body;
  // const catExist = await category.findOne({where: {[Op.or]:[{[Op.or]: [{title},{title: title.toLowerCase() }], id: {[Op.not]: categoryId}}]}});
  // if(catExist) throw CustomException('A category with the following name already exist', 'Please try some other name');
  category
    .update({ title, charge }, { where: { id: categoryId } })
    .then((data) => {
      return res.json(returnFunction("1", "Category updated", {}, ""));
    })
    .catch((err) => {
      const message = err.errors[0].message ? err.errors[0].message : err; //improve
      return res.json(
        returnFunction("0", "Internal Server Error", {}, `${message}`)
      );
    });
}
/*
            4. Change Category Status
*/
async function changeCategoryStatus(req, res) {
  const { status, categoryId } = req.body;
  const data = await category.update({ status }, { where: { id: categoryId } });
  if (data[0])
    return res.json(returnFunction("1", "Category Deleted Successfully", {}, ""));
  return res.json(returnFunction("0", "Category doesn't exsist", {}, ""));
}

// ! Module 8: Coupons
/*
            1. Add Coupon 
*/
async function addCoupon(req, res) {
  const { code, value, from, to, type, condAmount } = req.body;
  const codeExist = await coupon.findOne({ where: { code, status: true } });
  if (codeExist)
    throw new CustomException(
      "A coupon with the following name already exists",
      "Please try some other name"
    );
  coupon
    .create({
      code,
      value,
      from: `${from} 05:00`,
      to: `${to} 04:59`,
      type,
      condAmount,
      status: true,
    })
    .then((data) => {
      return res.json(returnFunction("1", "Coupon Added", {}, ""));
    })
    .catch((err) => {
      return res.json(
        returnFunction("0", "Internal Server Error", {}, `${err}`)
      );
    });
}
/*
            2. Get all coupons 
*/
async function getAllCoupon(req, res) {
  //const defaultDistanceUnit = await defaultUnit.findOne({where: {type: 'distance', status: true}, attributes: ['symbol']})
  const defaultCurrencyUnit = await defaultUnit.findOne({
    where: { type: "currency", status: true },
    attributes: ["symbol"],
  });
  const couponData = await coupon.findAll({
    attributes: [
      "id",
      "code",
      "value",
      [sequelize.fn("date_format", sequelize.col("from"), "%b %D, %Y"), "from"],
      [sequelize.fn("date_format", sequelize.col("to"), "%b %D, %Y"), "to"],
      "type",
      "condAMount",
      "status",
    ],
  });
  return res.json(
    returnFunction(
      "1",
      "All coupons",
      { couponData, currencyUnit: defaultCurrencyUnit.symbol },
      ""
    )
  );
}
/*
            3. Update coupons 
*/
async function updateCoupon(req, res) {
  const { value, from, to, couponId, condAmount } = req.body;
  // cannot update code & type
  coupon
    .update(
      { value, from: `${from} 05:00`, to: `${to} 04:59` },
      { where: { id: couponId } }
    )
    .then((data) => {
      return res.json(returnFunction("1", "Coupon Updated", {}, ""));
    })
    .catch((err) => {
      return res.json(returnFunction("1", "Coupon Updated", {}, ""));
    });
}
/*
            4. Update coupons 
*/
async function changeCouponStatus(req, res) {
  const { status, couponId } = req.body;
  coupon
    .update({ status }, { where: { id: couponId } })
    .then((data) => {
      return res.json(returnFunction("1", "Coupon status changed", {}, ""));
    })
    .catch((err) => {
      return res.json(
        returnFunction("0", "Internal Server Error", {}, `${err}`)
      );
    });
}

// ! Module 9: Size
/*
            1. Get weight & length units 
*/
async function getUnitsClass(req, res) {
  const unitData = await unitClass.findAll({
    attributes: { exclude: ["createdAt", "updatedAt"] },
  });
  return res.json(returnFunction("1", "Unit classes", unitData, ""));
}
/*
            2. Add size
*/
async function addSize(req, res) {
  const { title, weight, length, width, height, unitClassId } = req.body;
  const sizeExist = await size.findOne({ where: { title, status: true } });
  if (sizeExist)
    throw new CustomException(
      "A size with the same name already exists",
      " Please try some other name"
    );
  // check on image
  if (!req.file)
    throw new CustomException("Image not uploaded", "Please upload image");
  let tmpPath = req.file.path;
  let imagePath = tmpPath.replace(/\\/g, "/");
  // getting units
  let unitData = await unit.findAll({
    where: { unitClassId, status: true },
  });
  let weightUnit = unitData.filter((ele) => ele.type === "weight");
  let lengthUnit = unitData.filter((ele) => ele.type === "length");
  if (lengthUnit.length === 0 || weightUnit.length === 0)
    throw new CustomException(
      "The system of unit is not properly defined",
      "Please select some other"
    );
  let volume = parseFloat(length) * parseFloat(width) * parseFloat(height);
  size.create({
    title,
    weight,
    length,
    width,
    height,
    volume,
    status: true,
    image: imagePath,
    weightUnitId: weightUnit[0].id,
    lengthUnitId: lengthUnit[0].id,
  });
  return res.json(returnFunction("1", "Size added", {}, ""));
}
/*
            3. get all sizes
*/
async function getAllSize(req, res) {
  const sizeData = await size.findAll({
    where: { status: true },
    include: [
      {
        model: unit,
        as: "weightUnitS",
        attributes: ["symbol"],
        include: { model: unitClass, attributes: ["id", "title"] },
      },
      { model: unit, as: "lengthUnitS", attributes: ["symbol"] },
    ],
    attributes: ["id", "title", "weight", "length", "width", "height", "image"],
  });
  return res.json(returnFunction("1", "All size", sizeData, ""));
}
/*
            4. Update size
*/
async function updateSize(req, res) {
  const {
    title,
    weight,
    length,
    width,
    height,
    unitClassId,
    sizeId,
    updateImage,
  } = req.body;
  const sizeExist = await size.findOne({
    where: { title, status: true, id: { [Op.not]: sizeId } },
  });
  if (sizeExist)
    throw new CustomException(
      "A size with the same name already exists",
      " Please try some other name"
    );
  // check on image
  let imagePath = "";
  if (updateImage === "true") {
    if (!req.file)
      throw new CustomException("Image not uploaded", "Please upload image");
    let tmpPath = req.file.path;
    imagePath = tmpPath.replace(/\\/g, "/");
  }
  // getting units
  let unitData = await unit.findAll({
    where: { unitClassId, status: true },
  });
  let weightUnit = unitData.filter((ele) => ele.type === "weight");
  let lengthUnit = unitData.filter((ele) => ele.type === "length");
  if (lengthUnit.length === 0 || weightUnit.length === 0)
    throw new CustomException(
      "The system of unit is not properly defined",
      "Please select some other"
    );
  let volume = parseFloat(length) * parseFloat(width) * parseFloat(height);
  if (updateImage === "true") {
    size.update(
      {
        title,
        weight,
        length,
        width,
        height,
        volume,
        status: true,
        image: imagePath,
        weightUnitId: weightUnit[0].id,
        lengthUnitId: lengthUnit[0].id,
      },
      { where: { id: sizeId } }
    );
  } else {
    size.update(
      {
        title,
        weight,
        length,
        width,
        height,
        volume,
        status: true,
        weightUnitId: weightUnit[0].id,
        lengthUnitId: lengthUnit[0].id,
      },
      { where: { id: sizeId } }
    );
  }
  return res.json(returnFunction("1", "Size Updated", {}, ""));
}
/*
            5. Change size status
*/
async function changeSizeStatus(req, res) {
  const { status, sizeId } = req.body;
  size
    .update({ status }, { where: { id: sizeId } })
    .then((data) => {
      return res.json(returnFunction("1", "Size Status Changed", {}, ""));
    })
    .catch((err) => {
      return res.json(
        returnFunction("0", "Internal Server Error", {}, `${err}`)
      );
    });
}
// ! Module 10: Structure types
/*
            1. Add structure type 
*/
async function addStruct(req, res) {
  const { title } = req.body;
  const structExist = await structureType.findOne({
    where: { title, status: true },
  });
  if (structExist)
    throw new CustomException(
      "A structure type with the same name already exists",
      " Please try some other name"
    );
  // check on image
  if (!req.file)
    throw new CustomException("Image not uploaded", "Please upload image");
  let tmpPath = req.file.path;
  let imagePath = tmpPath.replace(/\\/g, "/");
  structureType
    .create({ icon: imagePath, title, status: true })
    .then((data) => {
      return res.json(
        returnFunction("1", "Structure added successfully", {}, "")
      );
    })
    .catch((err) => {
      return res.json(
        returnFunction("0", "Internal Server Error", {}, `${err}`)
      );
    });
}
/*
            2. Get all structure types 
*/
async function getAllStruct(req, res) {
  const structData = await structureType.findAll({
    where: { status: true },
    attributes: ["id", "icon", "title", "status"],
  });
  return res.json(returnFunction("1", "All structure types", structData, ""));
}
/*
            3. Update Structure type
*/
async function updateStruct(req, res) {
  const { title, structId, updateImage } = req.body;
  const structExist = await structureType.findOne({
    where: { title, status: true, id: { [Op.not]: structId } },
  });
  if (structExist)
    throw new CustomException(
      "A struct with the same name already exists",
      " Please try some other name"
    );
  // check on image
  let imagePath = "";
  if (updateImage === "true") {
    if (!req.file)
      throw new CustomException("Image not uploaded", "Please upload image");
    let tmpPath = req.file.path;
    imagePath = tmpPath.replace(/\\/g, "/");
  }
  if (updateImage === "true") {
    structureType.update(
      { title, icon: imagePath },
      { where: { id: structId } }
    );
  } else {
    structureType.update({ title }, { where: { id: structId } });
  }
  return res.json(returnFunction("1", "struct Updated", {}, ""));
}
/*
            4. Change structure status
*/
async function changeStructStatus(req, res) {
  const { status, structId } = req.body;
  structureType
    .update({ status }, { where: { id: structId } })
    .then((data) => {
      return res.json(
        returnFunction("1", "Structure status updated successfully", {}, "")
      );
    })
    .catch((err) => {
      return res.json(
        returnFunction("0", "Internal Server Error", {}, `${err}`)
      );
    });
}

// ! Module 11: Vehicle Types
/*
 *     1. Add vehicle
 */
async function addVehicle(req, res) {
  let { title, baseRate, perUnitRate, weightCapacity, volumeCapacity } =
    req.body;
  const appUnitId = await currentAppUnitsId();
  const units = await unitsSymbolsAndRates(appUnitId);
  weightCapacity = convertToBaseUnits(
    weightCapacity,
    units.conversionRate.weight
  );
  volumeCapacity = convertToBaseUnits(
    volumeCapacity,
    units.conversionRate.length
  );
  const vehicleExist = await vehicleType.findOne({
    where: { title, status: true },
  });
  if (vehicleExist)
    throw new CustomException(
      "A vehicle with the same name already exists",
      " Please try some other name"
    );
  // check on image
  let imagePath = "";
  if (req.file) {
    let tmpPath = req.file.path;
    imagePath = tmpPath.replace(/\\/g, "/");
    // getting units
  } else {
    imagePath = ""; // throw new CustomException('Image not uploaded', 'Please upload image');
  }
  created = await vehicleType.create({
    title,
    status: true,
    image: imagePath,
    baseRate,
    perUnitRate,
    weightCapacity,
    volumeCapacity,
  });
  return res.json(returnFunction("1", "Vehicle added", created, ""));
}

/*
 *   2. Get all vehicles
 */
async function getAllVehicle(req,res){
    let vehicleData = await vehicleType.findAll({
        where: {status:true},//TODO   DELETED missing in db
    });
    const appUnitId = await currentAppUnitsId();
    const units = await unitsSymbolsAndRates(appUnitId);     
 
    for (let vehicleType of vehicleData) {
      vehicleType.weightCapacity =  unitsConversion(vehicleType.weightCapacity, units.conversionRate.weight);
      vehicleType.volumeCapacity =  unitsConversion(vehicleType.volumeCapacity, units.conversionRate.length);
    }
    return res.json(returnFunction('1', 'All Vehicles Types', {vehicleData, unit: units.symbol}, ''));
}
/*
 *        3. Update vehicle
 */

async function updateVehicle(req, res) {
  //updateImage this will set true frim req.body if image updated
  let {
    title,
    baseRate,
    perUnitRate,
    weightCapacity,
    volumeCapacity,
    vehicleId,
    updateImage,
  } = req.body;
  const appUnitId = await currentAppUnitsId();
  const units = await unitsSymbolsAndRates(appUnitId);
  weightCapacity = convertToBaseUnits(
    weightCapacity,
    units.conversionRate.weight
  );
  volumeCapacity = convertToBaseUnits(
    volumeCapacity,
    units.conversionRate.length
  );

  const vehicleExist = await vehicleType.findOne({
    where: { title, status: true, id: { [Op.not]: vehicleId } },
  });
  if (vehicleExist)
    throw new CustomException(
      "A size with the same name already exists",
      " Please try some other name"
    );
  // check on image
  let imagePath = "";
  if (updateImage === "true") {
    if (!req.file)
      throw new CustomException("Image not uploaded", "Please upload image");
    let tmpPath = req.file.path;
    imagePath = tmpPath.replace(/\\/g, "/");

    await vehicleType.update(
      {
        title,
        baseRate,
        perUnitRate,
        weightCapacity,
        volumeCapacity,
        image: imagePath,
      },
      { where: { id: vehicleId } }
    );
  } else {
    await vehicleType.update(
      { title, baseRate, perUnitRate, weightCapacity, volumeCapacity },
      { where: { id: vehicleId } }
    );
  }
  return res.json(returnFunction("1", "Vehicle Type updated", {}, ""));
}

/*
 *        4. Change vehicle status
 */
async function changeVehicleStatus(req, res) {
  const { status, vehicleId } = req.body;
  vehicleType
    .update({ status }, { where: { id: vehicleId } })
    .then((data) => {
      return res.json(
        returnFunction("1", "Vehicle status Deleted successfully", {}, "")
      );
    })
    .catch((err) => {
      return res.json(
        returnFunction("0", "Internal Server Error", {}, `${err}`)
      );
    });
}

/*
 *        5. Delete vehicle
 */
//TODO DELETED Not exist coloumn in Db
async function deleteVehicle(req, res) {
  const { vehicleId } = req.body;
  const deletedVehicle = await vehicleType.update(
    { deleted: true },
    { where: { id: vehicleId } }
  );
  if (deletedVehicle === 0) {
    // No vehicle found with the provided ID
    return res.status(404).json({ message: "vehicle not found" });
  }
  // vehicle deleted successfully
  return res.status(200).json({ message: "vehicle deleted" });
}

//  ! Module 12. Units

/*
 *        Get Unit Types
 */
async function getUnitsTypes(req, res) {
  const output = [
     "length",
     "weight",
     "distance",
     "currency",
  ];
  return res.json(returnFunction("1", "All Units Types", output, ""));
}
/*
 *        Add Unit
 */
async function addUnit(req, res) {
  const { type, name, symbol, desc, conversionRate } = req.body;
  const exist = await units.findOne({
    where: { symbol, status: true, deleted: false },
  });
  if (exist)
    throw new CustomException(
      `( ${symbol} ) Already Exist`,
      " Please try Another "
    );
  const created = await units.create({
    type,
    name,
    symbol,
    desc,
    conversionRate,
    status: true,
  });
  return res.json(
    returnFunction("1", "Unit Created Successfully", created, "")
  );
}

/*
 *        Update Unit  Status
 */

async function updateUnitStatus(req, res) {
  const { unitId, status } = req.body;
  const updated = await units.update({ status }, { where: { id: unitId } });
  if (updated[0]) {
    return res.json(returnFunction("1", "Unit Updated Successfully", {}, ""));
  }
  return res.json(returnFunction("1", "UnitId doesn't exsist", {}, ""));
}
/*
 *        Update Unit
 */
async function updateUnit(req, res) {
  const { unitId, type, name, symbol, desc, conversionRate } = req.body;
  const exist = await units.findOne({
    where: { symbol, id: { [Op.not]: unitId } },
  });
  if (exist)
    throw new CustomException(
      `( ${symbol} ) Already Exist`,
      " Please try Another "
    );
  const updated = await units.update(
    { type, name, symbol, desc, conversionRate },
    { where: { id: unitId } }
  );
  return res.json(returnFunction("1", "Unit Updated Successfully", {}, ""));
}

/*
 *        Add AppUnit
 */
async function addAppUnit(req, res) {
  const { weightUnitId, lengthUnitId, distanceUnitId, currencyUnitId } =
    req.body;
  const unitExist = await appUnits.findOne({
    where: {
      weightUnitId,
      lengthUnitId,
      distanceUnitId,
      currencyUnitId,
      status: true,
    },
  });
  if (unitExist)
    throw new CustomException("same units", "Already usings theses!");
  if (!unitExist) {
    await appUnits.update({ status: false }, { where: {} });
  }
  const newSystemUnits = await appUnits.create({
    weightUnitId,
    lengthUnitId,
    distanceUnitId,
    currencyUnitId,
    status: true,
  });
  return res.json(returnFunction("1", "New System Units", newSystemUnits, ""));
}

/*
 *        2. Current System Units
 */
async function currentSystemUnits(req, res) {
  const appUnitId = await currentAppUnitsId();
  console.log(
    "ðŸš€ ~ file: admin.js:1192 ~ currentSystemUnits ~ appUnitId:",
    appUnitId
  );
  const systemUnitData = await appUnits.findByPk(appUnitId, {
    attributes: ["id"],
    include: [
      {
        model: units,
        as: "weightUnit",
        attributes: ["id", "type", "name", "symbol"],
      },
      {
        model: units,
        as: "lengthUnit",
        attributes: ["id", "type", "name", "symbol"],
      },
      {
        model: units,
        as: "distanceUnit",
        attributes: ["id", "type", "name", "symbol"],
      },
      {
        model: units,
        as: "currencyUnit",
        attributes: ["id", "type", "name", "symbol"],
      },
    ],
  });
  return res.json(
    returnFunction("1", "Current System Units", systemUnitData, "")
  );
}

/*
 *        3. Get All  Units
 */
async function getAllUnits(req, res) {
  //?Improve
  //status:true is removed from all units.findall()
  const lengthData = await units.findAll({
    where: { type: "length" },
    attributes: ["id", "type", "name", "symbol", "conversionRate"],
  });
  const weightData = await units.findAll({
    where: { type: "weight" },
    attributes: ["id", "type", "name", "symbol", "conversionRate"],
  });
  const distanceData = await units.findAll({
    where: { type: "distance" },
    attributes: ["id", "type", "name", "symbol", "conversionRate"],
  });
  const currencyData = await units.findAll({
    where: { type: "currency" },
    attributes: ["id", "type", "name", "symbol", "conversionRate"],
  });
  const output = {
    length: lengthData,
    weight: weightData,
    distance: distanceData,
    currency: currencyData,
  };
  return res.json(returnFunction("1", "All Units", output, ""));
}

// ! Module 13. Support
/*
            1. Get support
*/
async function getSupport(req, res) {
  const supportData = await support.findAll({
    attributes: ["id", "title", "key", "value"],
  });
  let email = supportData.filter((ele) => ele.key === "support_email");
  let phone = supportData.filter((ele) => ele.key === "support_phone");
  return res.json(
    returnFunction(
      "1",
      "Support Data",
      { email: email[0], phone: phone[0] },
      ""
    )
  );
}
/*
            2. Update support
*/
async function updateSupport(req, res) {
  const { value, supportId } = req.body;
  support
    .update({ value }, { where: { id: supportId } })
    .then((data) => {
      return res.json(
        returnFunction("1", "Support Information updated", {}, "")
      );
    })
    .catch((err) => {
      return res.json(
        returnFunction("0", "Internal Server Error", {}, `${err}`)
      );
    });
}

// ! Module 14: FAQs
/*
 *         1. Add FAQ
 */
async function addFAQ(req, res) {
  const { title, answer } = req.body;
  const exsist = await FAQs.findOne({ where: { title } });
  if (exsist) return res.json(returnFunction("0", "FAQ already exist", "", ""));
  const created = await FAQs.create({
    title,
    answer,
    status: true,
    deleted: false,
  });
  return res.json(returnFunction("1", "FAQ added", created, ""));
}
/*
 *       2. Get all FAQs
 */
async function allFAQs(req, res) {
  const faqData = await FAQs.findAll({
    where: { deleted: false },
    attributes: ["id", "title", "answer", "status"],
  });
  return res.json(returnFunction("1", "All FAQs", faqData, ""));
}
/*
 *     3. Update FAQ
 */
async function updateFAQ(req, res) {
  const { title, answer, faqId } = req.body;
  const update = await FAQs.update(
    { title, answer },
    { where: { id: faqId, deleted: false } }
  );
  if (update[0]) return res.json(returnFunction("1", "FAQ updated", {}, ""));
  return res.json(returnFunction("0", "FAQ Not Found", {}, ""));
}
/*
 *    4. Change FAQ Status
 */
async function changeFAQStatus(req, res) {
  const { status, faqId } = req.body;
  const faq = await FAQs.update(
    { status },
    { where: { id: faqId, deleted: false } }
  );
  if (faq[0])
    return res.json(returnFunction("1", "FAQ status updated", {}, ""));
  return res.json(returnFunction("0", "FAQ Not Found", {}, ""));
}
/*
 *    5. Delete FAQ
 */
async function deleteFAQ(req, res) {
  const { faqId } = req.body;
  const fa = await FAQs.update(
    { status: false, deleted: true },
    { where: { id: faqId } }
  );
  if (fa[0])
    return res.json(returnFunction("1", "FAQ Deleted Successfully", {}, ""));
  return res.json(returnFunction("1", "FAQ Not Found", {}, ""));
}

// ! Module 15: Charges
/* 1. General Charges  */
// /-------------------------------
/*
 *     1.1 Get general charges
 */
async function getGenCharges(req, res) {
  const charges = await generalCharges.findAll({
    attributes: ["key", "id", "information", "value"],
  });

  return res.json(returnFunction("1", "General Charges", charges, ""));
}
/*
 *     1.2 Update general charge
 */
async function updateGenCharges(req, res) {
  const { value, cId } = req.body;
  generalCharges
    .update({ value }, { where: { id: cId } })
    .then((data) => {
      return res.json(returnFunction("1", "Charges updated", {}, ""));
    })
    .catch((err) => {
      return res.json(
        returnFunction("0", "Internal Server Error", {}, `${err}`)
      );
    });
}

/* 2. Distance Charges  */
// /-------------------------------
/*
 *    2.1 Add new range
 */
async function addDistCharge(req, res) {
  let { title, startValue, endValue, price } = req.body;
  const appUnitId = await currentAppUnitsId();
  const units = await unitsSymbolsAndRates(appUnitId);
  startValue = convertToBaseUnits(startValue, units.conversionRate.distance);
  endValue = convertToBaseUnits(endValue, units.conversionRate.distance);

  distanceCharges
    .create({ title, startValue, endValue, price })
    .then((data) => {
      return res.json(returnFunction("1", "New range added", data, ""));
    })
    .catch((err) => {
      return res.json(
        returnFunction("0", "Internal Server Error", {}, `${err}`)
      );
    });
}
/*
 *     2.2 Get all distance charges
 */
async function getDistCharges(req, res) {
  const distCharData = await distanceCharges.findAll({
    attributes: ["id", "title", "startValue", "endValue", "price", "unit"],
  });
  const appUnitId = await currentAppUnitsId();
  const units = await unitsSymbolsAndRates(appUnitId);

  for (let disData of distCharData) {
    disData.startValue = unitsConversion(
      disData.startValue,
      units.conversionRate.distance
    );
    disData.endValue = unitsConversion(
      disData.endValue,
      units.conversionRate.distance
    );
  }
  return res.json(
    returnFunction(
      "1",
      "Get all distance charges",
      { distCharData, unit: units.symbol.distance },
      ""
    )
  );
}
/*
 *    2.3 Update distance charges
 */
async function updateDistCharge(req, res) {
  const { title, startValue, endValue, price, chargeId } = req.body;
  distanceCharges
    .update({ title, startValue, endValue, price }, { where: { id: chargeId } })
    .then((data) => {
      return res.json(returnFunction("1", "Charge updated", {}, ""));
    })
    .catch((err) => {
      return res.json(
        returnFunction("0", "Internal Server Error", {}, `${err}`)
      );
    });
}
/*
            2.4 Delete Distance charge
*/
async function deleteDistCharge(req, res) {
  const { chargeId } = req.body;
  distanceCharges
    .destroy({ where: { id: chargeId } })
    .then((data) => {
      return res.json(returnFunction("1", "Charge deleted", {}, ""));
    })
    .catch((err) => {
      return res.json(
        returnFunction("0", "Internal Server Error", {}, `${err}`)
      );
    });
}

/*
 * 3. Weight Charges
 */
// /-------------------------------
/*
 *     3.1 Add new range
 */
async function addWeightCharge(req, res) {
  let { title, startValue, endValue, price } = req.body;
  const appUnitId = await currentAppUnitsId();
  const units = await unitsSymbolsAndRates(appUnitId);
  startValue = convertToBaseUnits(startValue, units.conversionRate.weight);
  endValue = convertToBaseUnits(endValue, units.conversionRate.weight);
  weightCharges
    .create({ title, startValue, endValue, price })
    .then((data) => {
      return res.json(returnFunction("1", "New range added", {}, ""));
    })
    .catch((err) => {
      return res.json(
        returnFunction("0", "Internal Server Error", {}, `${err}`)
      );
    });
}
/*
 *     2.2 Get all weight charges
 */
async function getWeightCharges(req, res) {
  const weightCharData = await weightCharges.findAll({
    attributes: ["id", "title", "startValue", "endValue", "price", "unit"],
  });
  const appUnitId = await currentAppUnitsId();
  const units = await unitsSymbolsAndRates(appUnitId);

  for (let weightData of weightCharData) {
    weightData.startValue = unitsConversion(
      weightData.startValue,
      units.conversionRate.weight
    );
    weightData.endValue = unitsConversion(
      weightData.endValue,
      units.conversionRate.weight
    );
  }
  //const defaultDistanceUnit = await defaultUnit.findOne({where: {type: 'distance', status: true}, attributes: ['symbol']})
  //const defaultCurrencyUnit = await defaultUnit.findOne({where: {type: 'currency', status: true}, attributes: ['symbol']})
  return res.json(
    returnFunction(
      "1",
      "Get all distance charges",
      { weightCharData, unit: units.symbol.weight },
      ""
    )
  );
}
/*
 *    2.3 Update weight charges
 */
async function updateWeightCharge(req, res) {
  const { title, startValue, endValue, price, chargeId } = req.body;
  weightCharges
    .update({ title, startValue, endValue, price }, { where: { id: chargeId } })
    .then((data) => {
      return res.json(returnFunction("1", "Charge updated", {}, ""));
    })
    .catch((err) => {
      return res.json(
        returnFunction("0", "Internal Server Error", {}, `${err}`)
      );
    });
}
/*
            2.4 Delete weight charge
*/
async function deleteWeightCharge(req, res) {
  const { chargeId } = req.body;
  weightCharges
    .destroy({ where: { id: chargeId } })
    .then((data) => {
      return res.json(returnFunction("1", "Charge deleted", {}, ""));
    })
    .catch((err) => {
      return res.json(
        returnFunction("0", "Internal Server Error", {}, `${err}`)
      );
    });
}

/* 4. VW Charges  */
// /-------------------------------
/*
 *   4.1 Add new range
 */
async function addVWCharge(req, res) {
  let { title, startValue, endValue, price } = req.body;
  const appUnitId = await currentAppUnitsId();
  const units = await unitsSymbolsAndRates(appUnitId);
  startValue = convertToBaseUnits(startValue, units.conversionRate.length);
  endValue = convertToBaseUnits(endValue, units.conversionRate.length);
  volumetricWeightCharges
    .create({ title, startValue, endValue, price })
    .then((data) => {
      return res.json(returnFunction("1", "New range added", {}, ""));
    })
    .catch((err) => {
      return res.json(
        returnFunction("0", "Internal Server Error", {}, `${err}`)
      );
    });
}

/*
 *   4.2 Get all VW charges
 */
async function getVWCharges(req, res) {
  const weightCharData = await volumetricWeightCharges.findAll({
    attributes: ["id", "title", "startValue", "endValue", "price", "unit"],
  });
  const appUnitId = await currentAppUnitsId();
  const units = await unitsSymbolsAndRates(appUnitId);

  for (let VWeightData of weightCharData) {
    VWeightData.startValue = unitsConversion(
      VWeightData.startValue,
      units.conversionRate.length
    );
    VWeightData.endValue = unitsConversion(
      VWeightData.endValue,
      units.conversionRate.length
    );
  }
  //const defaultDistanceUnit = await defaultUnit.findOne({where: {type: 'distance', status: true}, attributes: ['symbol']})
  //const defaultCurrencyUnit = await defaultUnit.findOne({where: {type: 'currency', status: true}, attributes: ['symbol']})
  return res.json(
    returnFunction(
      "1",
      "Get all distance charges",
      { weightCharData, unit: units.symbol.length },
      ""
    )
  );
}

/*
 *     4.3 Update VW charges
 */
async function updateVWCharge(req, res) {
  const { title, startValue, endValue, price, chargeId } = req.body;
  volumetricWeightCharges
    .update({ title, startValue, endValue, price }, { where: { id: chargeId } })
    .then((data) => {
      return res.json(returnFunction("1", "Charge updated", {}, ""));
    })
    .catch((err) => {
      return res.json(
        returnFunction("0", "Internal Server Error", {}, `${err}`)
      );
    });
}
/*
            4.4 Delete VW charge
*/
async function deleteVWCharge(req, res) {
  const { chargeId } = req.body;
  volumetricWeightCharges
    .destroy({ where: { id: chargeId } })
    .then((data) => {
      return res.json(returnFunction("1", "Charge deleted", {}, ""));
    })
    .catch((err) => {
      return res.json(
        returnFunction("0", "Internal Server Error", {}, `${err}`)
      );
    });
}
// ! Module 16 : Driver Registration
// * _________________________________________________________________________________________________________________________________
/*
          *  1. Register Step 1 (basic info)
    ________________________________________
*/
async function registerStep1(req, res) {
  const { firstName, lastName, email, countryCode, phoneNum, password } =req.body;
  console.log("ðŸš€ ~ file: admin.js:1431 ~ registerStep1 ~ email:", email);
  // check if user with same eamil and phoneNum exists
  const userExist = await user.findOne({
    where: {
      [Op.or]: [
        { email },
        { [Op.and]: [{ countryCode: countryCode }, { phonenum: phoneNum }] },
      ],
      deletedAt: null,
      userTypeId: 2,
    },
  });
  // checking if already exits
  if (userExist) {
    if (email === userExist.email)
      throw new CustomException(
        "Users exists",
        "The email you entered is already taken"
      );
    else
      throw new CustomException(
        "Users exists",
        "The phone number you entered is already taken"
      );
  }
  if (!req.file)
    throw new CustomException(
      "Profile Image missing",
      "Please chose drivers image"
    );
  // Chcking if profile photo is missing
  let tmpprofileImage = req.file.path;
  let profileImageName = tmpprofileImage.replace(/\\/g, "/");
  // Hashing the password
  let hashedPassword = await bcrypt.hash(password, 10);
  // creating new user
  let nowDate = Date.now();
  let cDT = new Date(nowDate);
  let verifiedAt = `${cDT.getFullYear()}-${("0" + (cDT.getMonth() + 1)).slice(
    -2
  )}-${("0" + cDT.getDate()).slice(-2)}`;
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
/*
 *       2. Get vehicle Types
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
    *        3. Register Step 2(Vehicle data)
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
  if (req.files.length < 1)
    throw new CustomException(
      "Vehicle Images not uploaded",
      "Please upload images"
    );
  let imagesArr = req.files.map((ele) => {
    let tmpPath = ele.path;
    let imagePath = tmpPath.replace(/\\/g, "/");
    let tmpObj = {
      image: imagePath,
      //uploadTime: Date.now(),
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
    await vehicleImage.update({ status: false }, { where: { userId } });
    await vehicleImage.bulkCreate(imagesArr);
    return res.json(
      returnFunction(
        "1",
        "Registration step 2: Completed",
        { detailsId: detailsExist.id, userId, imagesArr },
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
      { detailsId: newEntry.id, userId, imagesArr },
      ""
    )
  );
}
/*
 *        4. Active Warehouse
 */
async function allActiveWarehouse(req, res) {
  const warehouseData = await warehouse.findAll({
    where: { status: true, classifiedAId: 3 },
    attributes: ["id", "companyName"],
  });
  return res.json(
    returnFunction("1", "All Active warehouses", warehouseData, "")
  );
}
/*
    *        5. Register Step 2(License Info)
    ________________________________________
*/
async function registerStep3(req, res) {
  const { licIssueDate, licExpiryDate, warehouseId, userId } = req.body;
  if (!req.files.frontImage && !req.files.backImage)
    throw CustomException("Images missing", "Please Upload images");
  let tmpLicFrontImage = req.files.frontImage[0].path;
  let licFrontImage = tmpLicFrontImage.replace(/\\/g, "/");
  let tmpLicBackImage = req.files.backImage[0].path;
  let licBackImage = tmpLicBackImage.replace(/\\/g, "/");
  driverDetail.update(
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
  user.update({ status: true }, { where: { id: userId } });
  return res.json(returnFunction("1", "Driver created successfully", {}, ""));
}
/*
 *    Update Driver
 */
async function updateDriverProfile(req, res) {
  const { firstName, lastName, email, countryCode, phoneNum, userId } =
    req.body;

  // check if user with same eamil and phoneNum exists
  if (email || phoneNum) {
    const userExist = await user.findOne({
      where: {
        [Op.or]: [
          email ? { email } : null,
          phoneNum
            ? {
                [Op.and]: [
                  { countryCode: countryCode },
                  { phonenum: phoneNum },
                ],
              }
            : null,
        ],
        deletedAt: null,
        userTypeId: 2,
      },
    });
    // checking if already exits
    if (userExist) {
      if (email === userExist.email)
        throw new CustomException(
          "Users exists",
          "The email you entered is already taken"
        );
      else if (
        phoneNum === userExist.phoneNum &&
        countryCode === userExist.countryCode
      )
        throw new CustomException(
          "Users exists",
          "The phone number you entered is already taken"
        );
    }
  }

  let updatedUser = await user.update(
    { firstName, lastName, email, countryCode, phoneNum },
    { where: { id: userId } }
  );
  return res.json(
    returnFunction("1", "driver Profile Updated", updatedUser, "")
  );
}



/*
 *  Driver License Update
 */

async function updateDriverLicense(req,res){
  const {userId,licIssueDate,licExpiryDate,imageUpdated } = req.body;
    let msg =''
    if(imageUpdated === "true"){
    if(req.files.length===0) throw CustomException('Images Not Uploaded','')
    let tmpLicFrontImage = req.files.frontImage[0].path;
    let licFrontImage = tmpLicFrontImage.replace(/\\/g, "/");
    let tmpLicBackImage = req.files.backImage[0].path;
    let licBackImage = tmpLicBackImage.replace(/\\/g, "/");
    await driverDetail.update({licFrontImage, licBackImage, licIssueDate, licExpiryDate }, {where: {userId:userId}});
    msg = 'License images and Dates'
    }else{
        await driverDetail.update({licIssueDate, licExpiryDate }, {where: {userId:userId}});
        msg = 'Issue and Expiry Dates Only'
    }
    return res.json(returnFunction('1', 'License Info Updated Successfully', msg, ''));
}






/*
 *  Driver vehicle Update
 */

async function updateDriverVehicle(req, res) {
  const {
    vehicleTypeId,
    vehicleMake,
    vehicleModel,
    vehicleYear,
    vehicleColor,
    userId,
    imgUpdate,
  } = req.body;
  if (imgUpdate === "true") {
    if (!req.files)
      throw new CustomException(
        "Vehicle Images not uploaded",
        "Please upload images"
      );
    let imagesArr = req.files.map((ele) => {
      let tmpPath = ele.path;
      let imagePath = tmpPath.replace(/\\/g, "/");
      let tmpObj = {
        image: imagePath,
        //uploadTime: Date.now(),
        status: true,
        userId,
      };
      return tmpObj;
    });
  }
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
    if (imgUpdate === "true") {
      await vehicleImage.update({ status: false }, { where: { userId } });
      await vehicleImage.bulkCreate(imagesArr);
    }
    return res.json(
      returnFunction("1", "Driver Vehicle Updated Successfully", {}, "")
    );
  }
  return res.json(
    returnFunction(
      "0",
      "driver details doesn't exisit",
      {},
      "unable to find driver details for this id"
    )
  );
}

/*  
      Delete Driver 
*/
async function updateDriverStatus(req,res){
  const {userId,status} = req.body;
  if(status!==0 && status!==1)
  return res.json(returnFunction('0', 'Status doesn\'t exsist for the driver', {}, ''))
  const detailsExist = await driverDetail.findOne({where: {userId}});
  if(detailsExist){
      await driverDetail.update({approvedByAdmin:status}, {where: {userId}});
      await user.update({status}, {where: {id:userId}});
      return res.json(returnFunction('1', 'Driver Status Updated Successfully', {}, ''))
  }
  return res.json(returnFunction('0', 'Driver Details Doesn\'t Exsist', {}, ''))
};
/*
 *  specific warehouse drivers
 */
async function getSpecifiWearhouseDrivers(req, res) {
  const { warehouseId } = req.body;
  const wearhouseDrivers = await driverDetail.findAll({
    where: { warehouseId: warehouseId },
    include: {
      model: user,
      attributes: ["firstName", "lastName", "email", "countryCode", "phoneNum"],
    },
  });
  return res.json(
    returnFunction("1", "All specific warehouse drivers", wearhouseDrivers, "")
  );
}

// ! Module 17 : Transporter Guy
/*
!_____________________________________________________________________________________________________________________________________
*/
/*
            1. Get all transporters
*/
async function allTransporterGuy(req, res) {
  const userData = await user.findAll({
    where: { userTypeId: 4, deletedAt: { [Op.is]: null } },
    attributes: [
      "id",
      "firstName",
      "lastName",
      "email",
      "countryCode",
      "phoneNum",
      "image",
    ],
  });
  return res.json(
    returnFunction("1", "All active transporter guys", userData, "")
  );
}
/*
            2. Add transporter
*/
async function addTransporter(req, res) {
  const { firstName, lastName, email, countryCode, phoneNum } = req.body;
  // check if user with same eamil and phoneNum exists
  const userExist = await user.findOne({
    where: {
      [Op.or]: [
        { email: email },
        { [Op.and]: [{ countryCode: countryCode }, { phonenum: phoneNum }] },
      ],
      deletedAt: { [Op.is]: null },
      userTypeId: 4,
    },
  });
  //return res.json(userExist)
  if (userExist) {
    if (email === userExist.email)
      throw new CustomException(
        "Users exists",
        "The email you entered is already taken"
      );
    else
      throw new CustomException(
        "Users exists",
        "The phone number you entered is already taken"
      );
  }
  // Chcking if profile photo is missing
  if (!req.file)
    throw CustomException(
      "Profile Image missing",
      "Please add transpoter image"
    );
  let tmpprofileImage = req.file.path;
  let profileImageName = tmpprofileImage.replace(/\\/g, "/");
  // Hashing the password
  //let hashedPassword = await bcrypt.hash(password, 10);
  // creating new user
  let nowDate = Date.now();
  let cDT = new Date(nowDate);
  let verifiedAt = `${cDT.getFullYear()}-${("0" + (cDT.getMonth() + 1)).slice(
    -2
  )}-${("0" + cDT.getDate()).slice(-2)}`;
  let newUser = await user.create({
    firstName,
    lastName,
    email,
    countryCode,
    phoneNum,
    status: true,
    verifiedAt,
    password: "",
    userTypeId: 4,
    image: profileImageName,
  });
  return res.json(returnFunction("1", "Transporter Added", {}, ""));
}
/*
            3. Update transporter
*/
async function updateTransporter(req, res) {
  const {
    firstName,
    lastName,
    email,
    countryCode,
    phoneNum,
    imageUpdate,
    transporterId,
  } = req.body;
  // check if another user with same email and phoneNum exists
  const userExist = await user.findOne({
    where: {
      id: { [Op.not]: [transporterId] },
      [Op.or]: [
        { email: email },
        { [Op.and]: [{ countryCode: countryCode }, { phonenum: phoneNum }] },
      ],
      deletedAt: { [Op.is]: null },
      userTypeId: 4,
    },
  });
  //return res.json(userExist)
  if (userExist) {
    if (email === userExist.email)
      throw new CustomException(
        "Users exists",
        "The email you entered is already taken"
      );
    else
      throw new CustomException(
        "Users exists",
        "The phone number you entered is already taken"
      );
  }
  if (imageUpdate) {
    user.update(
      { firstName, lastName, email, countryCode, phoneNum },
      { where: { id: transporterId } }
    );
  } else {
    if (!req.file)
      throw CustomException(
        "Profile Image missing",
        "Please add transpoter image"
      );
    let tmpprofileImage = req.file.path;
    let profileImageName = tmpprofileImage.replace(/\\/g, "/");
    user.update(
      {
        firstName,
        lastName,
        email,
        countryCode,
        phoneNum,
        image: profileImageName,
      },
      { where: { id: transporterId } }
    );
  }
  return res.json(returnFunction("1", "Transporter Updated", {}, ""));
}
/*
            4. Delete transporter
*/
async function deleteTransporter(req, res) {
  const { transporterId } = req.body;
  let nowDate = Date.now();
  let cDT = new Date(nowDate);
  let deletedAt = `${cDT.getFullYear()}-${("0" + (cDT.getMonth() + 1)).slice(
    -2
  )}-${("0" + cDT.getDate()).slice(-2)}`;
  user.update({ deletedAt, status: false }, { where: { id: transporterId } });
  return res.json(returnFunction("1", "Transporter Deleted", {}, ""));
}
// ! Module 18: Provinces
/*
!_____________________________________________________________________________________________________________________________________
*/
/*
            1. Get all provinces
*/
async function getAllProvince(req, res) {
  const provinceData = await province.findAll({
    attributes: { exclude: ["createdAt", "updatedAt"] },
  });
  return res.json(returnFunction("1", "All provinces", provinceData, ""));
}
/*
            2. Add province
*/
async function addProvince(req, res) {
  const { title, key } = req.body;
  let capTitle = title.charAt(0).toUpperCase() + title.slice(1);
  const exist = await province.findOne({ where: { title: capTitle } });
  if (exist)
    throw CustomException("Already exists", "Please try some other name");
  province
    .create({ title: capTitle, key, status: true })
    .then((data) => {
      return res.json(returnFunction("1", "Province Added", {}, ""));
    })
    .catch((err) => {
      return res.json(
        returnFunction("1", "Internal Server Error", {}, `${err}`)
      );
    });
}
/*
            3. Update provinces
*/
async function updateProvince(req, res) {
  const { title, key, provinceId } = req.body;
  let capTitle = title.charAt(0).toUpperCase() + title.slice(1);
  const exist = await province.findOne({
    where: { title: capTitle, id: { [Op.not]: provinceId } },
  });
  if (exist)
    throw CustomException("Already exists", "Please try some other name");
  province
    .update({ title: capTitle, key, provinceId }, { where: { id: provinceId } })
    .then((data) => {
      return res.json(returnFunction("1", "Province Updated", {}, ""));
    })
    .catch((err) => {
      return res.json(
        returnFunction("1", "Internal Server Error", {}, `${err}`)
      );
    });
}
/*
            4. Delete province
*/
async function deleteProvince(req, res) {
  let { status, provinceId } = req.body;
  province
    .update({ status }, { where: { id: provinceId } })
    .then((data) => {
      return res.json(
        returnFunction("1", "Status changed successfully", {}, "")
      );
    })
    .catch((err) => {
      return res.json(
        returnFunction("1", "Internal Server Error", {}, `${err}`)
      );
    });
}

// ! Module 19: District
/*
!_____________________________________________________________________________________________________________________________________
*/
/*
            1. Get all District
*/
async function getAllDistrict(req, res) {
  const districtData = await district.findAll({
    attributes: { exclude: ["createdAt", "updatedAt"] },
    include: { model: province, attributes: ["title"] },
  });
  return res.json(returnFunction("1", "All Districts", districtData, ""));
}
/*
            2. Get all active provinces
*/
async function getAllActiveProvince(req, res) {
  const provinceData = await province.findAll({
    where: { status: true },
    attributes: { exclude: ["createdAt", "updatedAt", "status"] },
  });
  return res.json(returnFunction("1", "All provinces", provinceData, ""));
}
/*
            3. Add District
*/
async function addDistrict(req, res) {
  const { title, key, provinceId } = req.body;
  let capTitle = title.charAt(0).toUpperCase() + title.slice(1);
  const exist = await district.findOne({
    where: { title: capTitle, provinceId },
  });
  if (exist)
    throw CustomException("Already exists", "Please try some other name");
  district
    .create({ title: capTitle, key, status: true, provinceId })
    .then((data) => {
      return res.json(returnFunction("1", "District Added", {}, ""));
    })
    .catch((err) => {
      return res.json(
        returnFunction("1", "Internal Server Error", {}, `${err}`)
      );
    });
}
/*
            4. Update Districts
*/
async function updateDistrict(req, res) {
  const { title, provinceId, key, districtId } = req.body;
  let capTitle = title.charAt(0).toUpperCase() + title.slice(1);
  const exist = await district.findOne({
    where: { title: capTitle, provinceId, id: { [Op.not]: districtId } },
  });
  if (exist)
    throw CustomException("Already exists", "Please try some other name");
  district
    .update({ title: capTitle, key, provinceId }, { where: { id: districtId } })
    .then((data) => {
      return res.json(returnFunction("1", "District Updated", {}, ""));
    })
    .catch((err) => {
      return res.json(
        returnFunction("1", "Internal Server Error", {}, `${err}`)
      );
    });
}
/*
            5. Delete District
*/
async function deleteDistrict(req, res) {
  let { status, districtId } = req.body;
  district
    .update({ status }, { where: { id: districtId } })
    .then((data) => {
      return res.json(
        returnFunction("1", "Status changed successfully", {}, "")
      );
    })
    .catch((err) => {
      return res.json(
        returnFunction("1", "Internal Server Error", {}, `${err}`)
      );
    });
}
// ! Module 20: Corregimiento
/*
!_____________________________________________________________________________________________________________________________________
*/
/*
            1. Get all Corregimiento
*/
async function getAllCorregimiento(req, res) {
  const corregimientoData = await corregimiento.findAll({
    attributes: { exclude: ["createdAt", "updatedAt"] },
    include: {
      model: district,
      attributes: ["id", "title"],
      include: { model: province, attributes: ["id", "title"] },
    },
  });
  return res.json(
    returnFunction("1", "All Corregimientos", corregimientoData, "")
  );
}
/*
            2. Get all active provinces
*/
async function getAllActiveDistricts(req, res) {
  const ditrictData = await district.findAll({
    where: { status: true },
    attributes: { exclude: ["createdAt", "updatedAt", "status", "provinceId"] },
  });
  return res.json(returnFunction("1", "All districts", ditrictData, ""));
}
/*
            3. Add Corregimiento
*/
async function addCorregimiento(req, res) {
  const { title, value, districtId, provinceId } = req.body;
  let capTitle = title.charAt(0).toUpperCase() + title.slice(1);
  const exist = await corregimiento.findOne({
    where: { title: capTitle, districtId },
  });
  if (exist)
    throw CustomException("Already exists", "Please try some other name");
  // generating key based on province & district
  const provinceData = await province.findByPk(provinceId, {
    attributes: ["key"],
  });
  const districtData = await district.findByPk(districtId, {
    attributes: ["key"],
  });
  let key = `${provinceData.key}${districtData.key}`;
  let nomenclature = `${key}${value}`;
  corregimiento
    .create({
      title: capTitle,
      key,
      value,
      nomenclature,
      status: true,
      districtId,
    })
    .then((data) => {
      return res.json(returnFunction("1", "Corregimiento Added", {}, ""));
    })
    .catch((err) => {
      return res.json(
        returnFunction("1", "Internal Server Error", {}, `${err}`)
      );
    });
}
/*
            4. Update Corregimientos
*/
async function updateCorregimiento(req, res) {
  const { title, value, districtId, corregimientoId, provinceId } = req.body;
  let capTitle = title.charAt(0).toUpperCase() + title.slice(1);
  const exist = await corregimiento.findOne({
    where: { title: capTitle, districtId, id: { [Op.not]: corregimientoId } },
  });
  if (exist)
    throw CustomException("Already exists", "Please try some other name");
  // generating key based on province & district
  const provinceData = await province.findByPk(provinceId, {
    attributes: ["key"],
  });
  const districtData = await district.findByPk(districtId, {
    attributes: ["key"],
  });
  let key = `${provinceData.key}${districtData.key}`;
  let nomenclature = `${key}${value}`;
  corregimiento
    .update(
      { title: capTitle, key, value, nomenclature, districtId },
      { where: { id: corregimientoId } }
    )
    .then((data) => {
      return res.json(returnFunction("1", "Corregimiento Updated", {}, ""));
    })
    .catch((err) => {
      return res.json(
        returnFunction("1", "Internal Server Error", {}, `${err}`)
      );
    });
}
/*
            5. Delete Corregimiento
*/
async function deleteCorregimiento(req, res) {
  let { status, corregimientoId } = req.body;
  corregimiento
    .update({ status }, { where: { id: corregimientoId } })
    .then((data) => {
      return res.json(
        returnFunction("1", "Status changed successfully", {}, "")
      );
    })
    .catch((err) => {
      return res.json(
        returnFunction("1", "Internal Server Error", {}, `${err}`)
      );
    });
}
// ! Module 21: Bookings
/*
!_____________________________________________________________________________________________________________________________________
*/
/*
            1. Get all Bookings
*/
// let bookingData = await booking.findAll({
//     where: {
//       [Op.and]: [
//         req.query.type
//           ? {
//               status: true,
//               [Op.not]: [{ appUnitId: null }],
//               bookingTypeId: req.query.type,
//             }
//           : { status: true, [Op.not]: [{ appUnitId: null }] },
//         {
//           [Op.or]: [
//             {
//               '$receivingWarehouse.located$': req.query.located || { [Op.ne]: null },
//             },
//             {
//               '$deliveryWarehouse.located$': req.query.located || { [Op.ne]: null },
//             },
//           ],
//         },
//       ],
//     },
//     include: [
//       // ... other included models ...
//       {
//         model: warehouse,
//         as: 'receivingWarehouse',
//         attributes: ['companyName', 'located'],
//       },
//       {
//         model: warehouse,
//         as: 'deliveryWarehouse',
//         attributes: ['companyName', 'located'],
//       },
//       // ... rest of the included models ...
//       {
//         model: appUnits,
//         attributes: ['id'],
//         include: [
//           { model: units, as: 'weightUnit', attributes: ['symbol', 'conversionRate'] },
//           { model: units, as: 'lengthUnit', attributes: ['symbol', 'conversionRate'] },
//           { model: units, as: 'distanceUnit', attributes: ['symbol', 'conversionRate'] },
//           { model: units, as: 'currencyUnit', attributes: ['symbol', 'conversionRate'] },
//         ],
//       },
//     ],
//     attributes: ['id', 'trackingId', 'distance', 'total', 'appUnitId'],
//   });

async function getAllbookings(req, res) {
  let bookingData = await booking.findAll({
    where: {
      [Op.and]: [
        req.query.bookingType
          ? {
              status: true,
              [Op.not]: [{ appUnitId: null }],
              bookingTypeId: req.query.bookingType,
            }
          : { status: true, [Op.not]: [{ appUnitId: null }] },
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
        where: req.query.bookingStatus
          ? { id: req.query.bookingStatus }
          : { id: { [Op.lte]: 15 } },
        attributes: ["id", "title"],
      },
      {
        model: addressDBS,
        as: "pickupAddress",
        attributes: ["id", "streetAddress", "district", "city", "province"],
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
      "distance",
      "total",
      "appUnitId",
      "weight",
    ],
  });
  console.log("🚀 ~ getAllbookings ~ bookingData:", bookingData)

  let output = [];
  let outobj = {};
  for (let obj of bookingData) {
    outobj = {
      bookingData: {
        id: obj.id,
        trackingId: obj.trackingId,
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
      // bookingStatus: obj.bookingStatus.title,
      // pickupAddress:{
      //     id:  obj.pickupAddress.id,
      //     streetAddress:obj.pickupAddress.streetAddress,
      //     district: obj.pickupAddress.district,
      //     city: obj.pickupAddress.city,
      //     province: obj.pickupAddress.province
      // },
      dropoffAddress: {
        id: obj.dropoffAddress && obj.dropoffAddress.id,
        streetAddress: obj.dropoffAddress && obj.dropoffAddress.streetAddress,
        district: obj.dropoffAddress && obj.dropoffAddress.district,
        city: obj.dropoffAddress && obj.dropoffAddress.city,
        province: obj.dropoffAddress && obj.dropoffAddress.province,
      },
      unit: {
        weight: obj.appUnit.weightUnit.symbol,
        length: obj.appUnit.lengthUnit.symbol,
        distance: obj.appUnit.distanceUnit.symbol,
        currency: obj.appUnit.currencyUnit.symbol,
      },
    };
    output.push(outobj);
  }

  return res.json(returnFunction("1", "All Bookings", output, ""));
}

//  Order Scheduled
// async function orderDetatils(req, res) {
//   let condition = {id:0}
//   const bookingId = req.query.id;
//   if (req.query.id) condition = {id: req.query.id}
//   if (req.query.s) condition = {trackingId:req.query.s}
//   let bookingData = await booking.findOne({
//     where:condition,
//     include: [
//       // {model: user, as: 'customer', attributes: ['firstName', 'lastName', 'email', 'countryCode', 'phoneNum', [sequelize.fn('date_format', sequelize.col('customer.createdAt'), '%Y'), 'joinedOn']]},
//       {
//         model: user,
//         as: "receivingDriver",
//         attributes: [
//           "firstName",
//           "lastName",
//           "email",
//           "countryCode",
//           "phoneNum",
//           "image",
//           [
//             sequelize.fn(
//               "date_format",
//               sequelize.col("receivingDriver.createdAt"),
//               "%Y"
//             ),
//             "joinedOn",
//           ],
//         ],
//       },
//       {
//         model: user,
//         as: "deliveryDriver",
//         attributes: [
//           "firstName",
//           "lastName",
//           "email",
//           "countryCode",
//           "phoneNum",
//           "image",
//           [
//             sequelize.fn(
//               "date_format",
//               sequelize.col("deliveryDriver.createdAt"),
//               "%Y"
//             ),
//             "joinedOn",
//           ],
//         ],
//       },
//       { model: logisticCompany, attributes: ["id", "title"] },
//       {
//         model: package,
//         include: [
//           { model: category, attributes: ["title"] },
//           { model: ecommerceCompany, attributes: ["title"] },
//         ],
//         attributes: ["actualHeight", "actualLength", "actualLength", "actualHeight", "actualWeight"],
//       },
//       { model: shipmentType, attributes: ["title"] },
//       { model: bookingStatus, attributes: ["title"] },
//       {
//         model: addressDBS,
//         as: "pickupAddress",
//         attributes: ["id", "postalCode", "lat", "lng"],
//       },
//       {
//         model: addressDBS,
//         as: "dropoffAddress",
//         attributes: ["id", "postalCode", "lat", "lng"],
//       },
//       //{model: category, attributes: ['title']},
//       {
//         model: bookingHistory,
//         attributes: [
//           "id",
//           [
//             sequelize.fn("date_format", sequelize.col("date"), "%m-%d-%Y"),
//             "date",
//           ],
//           [sequelize.fn("date_format", sequelize.col("time"), "%r"), "time"],
//         ],
//         include: { model: bookingStatus, attributes: ["id", "title"] },
//       },
//     ],
//     attributes: [
//       "id",
//       "trackingId",
//       "pickupDate",
//       "pickupEndTime",
//       "instruction",
//       "receiverEmail",
//       "receiverPhone",
//       "receiverName",
//       "total",
//       "ETA",
//       "senderName",
//       "senderEmail",
//       "senderPhone",
//       "barcode",
//       "weight",
//       "distance",
//       "scheduleSetBy",
//     ],
//   });
//   //console.log("🚀 ~ orderDetatils ~ bookingData:", bookingData)

//   // Histories --> setting up the format
//   const bookingStatuses = await bookingStatus.findAll({
//     attributes: ["id", "title"],
//   });
//   //console.log("🚀 ~ orderDetatils ~ bookingStatuses:", bookingStatuses)
//   let historyArray = [];
//   bookingStatuses.map((ele) => {
//     let found = bookingData.bookingHistories.filter(
//       (element) => element.bookingStatus.id === ele.id
//     );
//     if (found.length > 0) {
//       let outObj = {
//         bookingStatusId: found[0].bookingStatus.id,
//         statusText: found[0].bookingStatus.title,
//         date: found[0].date,
//         time: found[0].time,
//         status: true,
//       };
//       historyArray.push(outObj);
//     } else {
//       let outObj = {
//         bookingStatusId: ele.id,
//         statusText: ele.title,
//         date: "",
//         time: "",
//         status: false,
//       };
//       historyArray.push(outObj);
//     }
//   });
//    //console.log("=================================>",historyArray)
//   let data = bookingData.toJSON();
//   //console.log("🚀 ~ orderDetatils ~ data:", data)
//   for (let obj of data.packages) {
//     obj.category = obj.category.title;
//     delete data.packages.category;
//     obj.ecommerceCompany = obj.ecommerceCompany?.title;
//     delete data.packages.ecommerceCompany;
//   }
//   data.bookingHistories = historyArray;
//   // return res.json(returnFunction("1", "Booking details", data, ""));
//   //return res.json(bookingData.customer)
//   let outObj = {
//     id: bookingData.id,
//     trackingId: bookingData.trackingId,
//     instructions: `${bookingData.instruction}`,
//     barcode: bookingData.barcode,
//     scheduleSetBy: bookingData.scheduleSetBy,
//     senderDetails: {
//       name: `${bookingData.senderName} `,
//       email: `${bookingData.senderEmail}`,
//       phone: `${bookingData.senderPhone}`,
//       // memberSince: bookingData.customer? `${bookingData.customer.dataValues.joinedOn}`: '',
//     },
//     recipientDetails: {
//       name: `${bookingData.receiverName}`,
//       email: `${bookingData.receiverEmail}`,
//       phone: `${bookingData.receiverPhone}`,
//     },
//     deliveryDetails: {
//       pickupCode: `${bookingData.pickupAddress.postalCode} ${bookingData.pickupAddress.secondPostalCode}`,
//       dropoffCode: `${bookingData.dropoffAddress.postalCode} ${bookingData.dropoffAddress.secondPostalCode}`,
//       pickupTime: `${bookingData.pickupEndTime}`,
//     },
//     parcelDetails: {
//       shipmentType: `${bookingData.shipmentType?.title}`,
//       category: `${bookingData.packages.category?.title}`,
//       size: `${bookingData.packages.length}x${bookingData.packages.width}x${bookingData.packages.height}`,
//       weight: `${bookingData.weight}`,
//       distance: `${bookingData.distance}`,
//       pickupDate: `${bookingData.pickupDate}`,
//       ETA: `${bookingData.ETA}`,
//       orderTotal: `${bookingData.defaultCurrencyUnit?.symbol}${bookingData.total}`,
//     },
//     receivingDriver:
//       bookingData.receivingDriver === null
//         ? {}
//         : {
//             name: `${bookingData.receivingDriver.firstName} ${bookingData.receivingDriver.lastName}`,
//             email: `${bookingData.receivingDriver.email}`,
//             phone: `${bookingData.receivingDriver.countryCode} ${bookingData.receivingDriver.phoneNum}`,
//             memberSince: `${bookingData.receivingDriver.dataValues.joinedOn}`,
//             image: `${bookingData.receivingDriver.image}`,
//           },
//     // transporterGuy : bookingData.transporter === null? {}: {
//     //     name: `${bookingData.transporter.firstName} ${bookingData.transporter.lastName}`,
//     //     email: `${bookingData.transporter.email}`,
//     //     phone: `${bookingData.transporter.countryCode} ${bookingData.transporter.phoneNum}`,
//     //     memberSince: `${bookingData.transporter.dataValues.joinedOn}`,
//     //     image: `${bookingData.transporter.image}`
//     // },
//     logisticCompany: bookingData.logisticCompany,
//     deliveryDriver:
//       bookingData.deliveryDriver === null
//         ? {}
//         : {
//             name: `${bookingData.deliveryDriver.firstName} ${bookingData.deliveryDriver.lastName}`,
//             email: `${bookingData.deliveryDriver.email}`,
//             phone: `${bookingData.deliveryDriver.countryCode} ${bookingData.deliveryDriver.phoneNum}`,
//             memberSince: `${bookingData.deliveryDriver.dataValues.joinedOn}`,
//             image: `${bookingData.deliveryDriver.image}`,
//           },
//     bookingHistory: historyArray,
//   };
//   return res.json(returnFunction("1", "Booking details", outObj, ""));
// }


async function checktrackingNumber(req,res) {

  const{trackNumber}=req.params

  const findTracknumber=await booking.findOne({
    where:{
      trackingId:trackNumber,
    }
  })

  if(!findTracknumber){
    return res.json(returnFunction("1","Not found",false))
    }

    return res.json(returnFunction("1","Found",true))
  
}




async function orderDetatils(req, res) {
  try {
  let condition = {id :req.query.id}
    if(req.query.s){
        condition = {trackingId:`${req.query.s}`}
    }
    // const warehouseId = req.user.id;
    let bookingData = await booking.findOne({
        where:condition,
      include: [
        {model: addressDBS, as: 'dropoffAddress', attributes:[ 'title', 'streetAddress', 'building', 'floor', 'apartment', 'district', 'city', 'province', 'country', 'postalCode', 'lat', 'lng']},
        
        {  model:warehouse ,as :'receivingWarehouse',  attributes:['id'], include:{ model: addressDBS, attributes:[ 'title', 'streetAddress', 'building', 'floor', 'apartment', 'district', 'city', 'province', 'country', 'postalCode', 'lat', 'lng']}},
        {  model:warehouse ,as :'deliveryWarehouse', attributes:['id'],  include:{ model: addressDBS, attributes:[ 'title', 'streetAddress', 'building', 'floor', 'apartment', 'district', 'city', 'province', 'country', 'postalCode', 'lat', 'lng']}},
       
        {
          model: bookingHistory,
          include: { model: bookingStatus, attributes: ["id", "title"] },
          attributes: ["date", "time", "bookingStatusId"],
        },
        {
          model:user,
          as:"customer",
          attributes:["virtualBox","firstName",'lastName','email','countryCode','phoneNum']
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
        { model: logisticCompany, attributes: ["title", "logo",'divisor'] },
        { model: shipmentType, attributes: ["title"] },
        { model: vehicleType, attributes: ["title"] },
        // {model: billingDetails, where :{[Op.not] : [{pickupDriverEarning :null}]} ,attributes: ['pickupDriverEarning']},//TODO
        {
          model: package,
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
    if(!bookingData){
      throw new  CustomException("Wrong tracking Number")
    }
    // return res.json(bookingData);
    const bookingId = bookingData.id;
    const units=await unitsSymbolsAndRates(bookingData.appUnitId);

    for(obj of bookingData.packages){
      obj.weight=unitsConversion(obj.weight,units.conversionRate.weight);
      obj.length=unitsConversion(obj.length,units.conversionRate.length);
      obj.width=unitsConversion(obj.width,units.conversionRate.length);
      obj.height=unitsConversion(obj.height,units.conversionRate.length);
      obj.volume=unitsConversion(obj.volume,units.conversionRate.length);
      //TODO pending for actual weight and lenghts
    }
    
    let dType = 'selfPickup';
    if(bookingData.deliveryTypeId == 1){
        const totalWeight = calculateWeights(bookingData.packages,bookingData.logisticCompany.divisor);
 
        if (totalWeight.chargedWeight < 1000) {
            dType = 'direct';
        }else if(bookingData.deliveryTypeId == 2 && bookingData.customerId == null){
            dType = 'warehouseSelf'; // if created from warehouse and type is selfpickup
        }else{
            dType = 'byWarehouse';
        }
    }
    // ^  generating a array contain all booking statuses according to their state
    let statuses = journeyTrack(dType);
    console.log("🚀 ~~ bookingDetailsById ~ journeytype:", dType)
    
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
      shipmentType: booking.shipmentType? bookingData.shipmentType.title:"",
      pickup:  bookingData.receivingWarehouse?{
        address: `${bookingData.receivingWarehouse.addressDB.streetAddress} ${bookingData.receivingWarehouse.addressDB.district} ${bookingData.receivingWarehouse.addressDB.city} ${bookingData.receivingWarehouse.addressDB.province} ${bookingData.receivingWarehouse.addressDB.country} ${bookingData.receivingWarehouse.addressDB.postalCode} `,
        lat: bookingData.receivingWarehouse.addressDB.lat,
        lng: bookingData.receivingWarehouse.addressDB.lng,
      }:{},
      dropoff: bookingData.deliveryTypeId ===1 && bookingData.dropoffAddress?{
        date: bookingData.dropoffDate||"",
        startTime: bookingData.dropoffStartTime||"",
        endTime: bookingData.dropoffEndTime||"",
        address: `${bookingData.dropoffAddress.streetAddress} ${bookingData.dropoffAddress.district} ${bookingData.dropoffAddress.city} ${bookingData.dropoffAddress.province} ${bookingData.dropoffAddress.country} ${bookingData.dropoffAddress.postalCode} `,
        lat: bookingData.dropoffAddress.lat,
        lng: bookingData.dropoffAddress.lng,
      }: bookingData.deliveryTypeId ===2?{
    
        address: `${bookingData.deliveryWarehouse.addressDB.streetAddress} ${bookingData.deliveryWarehouse.addressDB.district} ${bookingData.deliveryWarehouse.addressDB.city} ${bookingData.deliveryWarehouse.addressDB.province} ${bookingData.deliveryWarehouse.addressDB.country} ${bookingData.deliveryWarehouse.addressDB.postalCode} `,
        lat: bookingData.deliveryWarehouse.addressDB.lat,
        lng: bookingData.deliveryWarehouse.addressDB.lng,
      }:{},
      
      // delivery type
      deliveryType:bookingData.deliveryType? bookingData.deliveryType:"",
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
      senderDetails:bookingData.customer?{
        number: `+${bookingData.customer.countryCode}${bookingData.customer.phoneNum}`,
        name: `${bookingData.customer.firstName} ${bookingData.customer.lastName}`,
        email: `${bookingData.customer.email}`,
        virtualBoxNumber: `${bookingData.customer.virtualBox}`
      }: {
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
      deliveryDriver : bookingData.deliveryDriver || "",
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
      const  weight = calculateWeights([{actualWeight: bookingData.weight,actualVolume:bookingData.volume}],bookingData.logisticCompany.divisor)
      outObj.chargedWeight = weight.chargedWeight;
    }else{
      const  weight = calculateWeights(bookingData.packages,bookingData.logisticCompany.divisor)
      outObj.chargedWeight = weight.chargedWeight;
    }

    if(bookingData.deliveryTypeId === 1 && outObj.chargedWeight > 1000){
      outObj.ricoAddress ={
        address: `${bookingData.deliveryWarehouse.addressDB.streetAddress} ${bookingData.deliveryWarehouse.addressDB.district} ${bookingData.deliveryWarehouse.addressDB.city} ${bookingData.deliveryWarehouse.addressDB.province} ${bookingData.deliveryWarehouse.addressDB.country} ${bookingData.deliveryWarehouse.addressDB.postalCode} `,
        lat: bookingData.deliveryWarehouse.addressDB.lat,
        lng: bookingData.deliveryWarehouse.addressDB.lng,
      }
    }



    // console.log("ðŸš€ ~ file: warehouse.js:985 ~ bookingDetailsById ~ outObj:", bookingData)
    return res.json(returnFunction("1", "Booking Details", outObj, ""));
  } catch (error) {
    console.log(
      "ðŸš€ ~ file: warehouse.js:869 ~ bookingDetailsById ~ error:",
      error
    );
    return res.json({
      status: "1",
      message: error.message,
      error: "",
    });
  }
}

// ! Module 22: Dashboard
//!_____________________________________________________________________________________________________________________________________

/*
            1. General Data
*/
async function getGeneral(req, res) {
  let adminId = req.user.id;
  let nowDate = Date.now();
  let todayStart = new Date(nowDate);
  let today_start = `${todayStart.getFullYear()}-${(
    "0" +
    (todayStart.getMonth() + 1)
  ).slice(-2)}-${("0" + todayStart.getDate()).slice(-2)}`;
  const userData = await user.findAll({
    where: { deletedAt: { [Op.is]: null } },
    attributes: ["userTypeId", "status"],
  });
  const numOfBookings = await booking.count({
    where: { paymentConfirmed: true },
  });
  const numOfWarehouses = await warehouse.count({
    where: { status: true, classifiedAId: 3 },
  });
  const earnings = await booking.sum("total", {
    where: { paymentConfirmed: true },
  });
  const todayEarnings = await booking.sum("total", {
    where: { pickupDate: { [Op.eq]: today_start }, paymentConfirmed: true },
  });
  const balance = await wallet.sum("amount", { where: { adminId } });
  const paidToDrivers = await wallet.sum("amount", {
    where: {
      description: {
        [Op.or]: ["Receiving Driver Earnings", "Delivery Driver Earnings"],
      },
    },
  });
  let numOfUsers = userData.filter((ele) => ele.userTypeId === 1).length;
  let numOfDrivers = userData.filter((ele) => ele.userTypeId === 2).length;
  let blockedUsers = userData.filter(
    (ele) => ele.userTypeId === 1 && !ele.status
  ).length;
  let blockedDrivers = userData.filter(
    (ele) => ele.userTypeId === 2 && !ele.status
  ).length;
  const defaultCurrencyUnit = await defaultUnit.findOne({
    where: { type: "currency", status: true },
    attributes: ["symbol"],
  });
  let outObj = {
    numOfUsers,
    numOfDrivers,
    blockedUsers,
    blockedDrivers,
    numOfBookings,
    numOfWarehouses,
    earnings,
    todayEarnings: todayEarnings === null ? "0.00" : todayEarnings,
    balance: -1 * balance,
    driverEarnings: -1 * paidToDrivers,
    currencyUnit: defaultCurrencyUnit.symbol,
  };
  return res.json(returnFunction("1", "Dashboard general data", outObj, ""));
}
/*
            2.  Graph data
*/
async function graphData(req, res) {
  const admin = req.params.id;
  let monthArr = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "July",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const userData = await user.findAll({
    where: { deletedAt: { [Op.is]: null }, userTypeId: 1 },
    attributes: ["createdAt"],
  });
  const bookingData = await booking.findAll({
    where: { paymentConfirmed: true },
    attributes: ["createdAt", "total"],
  });
  let months = [],
    usersWithMonths = [],
    bookingsWithMonths = [],
    earningsWithMonths = [];
  let cDate = new Date();
  // Running a loop to get earnings for past 11 months
  for (let i = 0; i <= 11; i++) {
    let oneMonthStart = new Date(cDate.getFullYear(), cDate.getMonth() - i, 0);
    let oneMonthEnd = new Date(cDate.getFullYear(), cDate.getMonth() - i, 0);
    oneMonthStart.setDate(1);
    oneMonthStart.setHours(0, 0, 1);
    oneMonthEnd.setHours(23, 59, 0);
    let mStart = oneMonthStart.toString();
    let mEnd = oneMonthEnd.toString();
    //console.log(mStart, mEnd)
    let monthlyUsers = userData.filter(
      (b) =>
        Date.parse(oneMonthStart) < Date.parse(b.createdAt) &&
        Date.parse(b.createdAt) < Date.parse(oneMonthEnd)
    ).length;
    let monthlyBookings = bookingData.filter(
      (b) =>
        Date.parse(oneMonthStart) < Date.parse(b.createdAt) &&
        Date.parse(b.createdAt) < Date.parse(oneMonthEnd)
    ).length;
    let totalEarnings = 0;
    let oneMonthData = bookingData.filter(
      (b) =>
        Date.parse(oneMonthStart) < Date.parse(b.createdAt) &&
        Date.parse(b.createdAt) < Date.parse(oneMonthEnd)
    );
    totalEarnings = oneMonthData.reduce(
      (pVal, cVal) => pVal + parseFloat(cVal.total),
      0
    );
    let tmpObj = totalEarnings.toFixed(2);
    usersWithMonths.push(monthlyUsers);
    bookingsWithMonths.push(monthlyBookings);
    earningsWithMonths.push(tmpObj);
    months.push(
      `${monthArr[oneMonthStart.getMonth()]} ${oneMonthStart.getFullYear()}`
    );
  }
  //return res.json({usersWithMonths, bookingsWithMonths, earningsWithMonths})
  // get data of current month
  let date = new Date(cDate);
  let currentDate = date.getDate();
  let startOfCurrentMonth = new Date(
    cDate.getTime() - (currentDate - 1) * 24 * 60 * 60 * 1000
  );
  let currtotalEarnings = 0;
  let oneMonthData = bookingData.filter(
    (b) =>
      Date.parse(startOfCurrentMonth) < Date.parse(b.createdAt) &&
      Date.parse(b.createdAt) < Date.parse(date)
  );
  currtotalEarnings = oneMonthData.reduce(
    (pVal, cVal) => pVal + parseFloat(cVal.total),
    0
  );
  let tmpObj = currtotalEarnings.toFixed(2);
  earningsWithMonths.unshift(tmpObj);
  let monthlyUsers = userData.filter(
    (b) =>
      Date.parse(startOfCurrentMonth) < Date.parse(b.createdAt) &&
      Date.parse(b.createdAt) < Date.parse(date)
  ).length;
  let monthlyBookings = bookingData.filter(
    (b) =>
      Date.parse(startOfCurrentMonth) < Date.parse(b.createdAt) &&
      Date.parse(b.createdAt) < Date.parse(date)
  ).length;
  usersWithMonths.unshift(monthlyUsers);
  bookingsWithMonths.unshift(monthlyBookings);
  months.unshift(`${monthArr[date.getMonth()]} ${date.getFullYear()}`);

  return res.json({
    status: "1",
    message: "Data of previous year",
    body: {
      usersWithMonths: usersWithMonths.reverse(),
      bookingsWithMonths: bookingsWithMonths.reverse(),
      earningsWithMonths: earningsWithMonths.reverse(),
      months: months.reverse(),
    },
    errors: "",
  });
}

// ! Module 23: Driver Payment System
/*
!_____________________________________________________________________________________________________________________________________
*/
/*
            1. Get payment systems
*/
async function getPaymentSystems(req, res) {
  const systemData = await driverPaymentSystem.findAll({
    attributes: { exclude: ["createdAt", "updatedAt"] },
  });
  return res.json(returnFunction("1", "All payment systems", systemData, ""));
}
/*
            1. Update payment system status
*/
async function updatePaymentSystemStatus(req, res) {
  const { paymentSystemId } = req.body;
  await driverPaymentSystem.update({ status: false }, { where: {} });
  await driverPaymentSystem.update(
    { status: true },
    { where: { id: paymentSystemId } }
  );
  return res.json(returnFunction("1", "Payment system updated", {}, ""));
}
// ! Module 24: Estimated booking days
/*
!_____________________________________________________________________________________________________________________________________
*/
/*
            24.1 Get all distance charges
*/
async function getAllEstRanges(req, res) {
  const estData = await estimatedBookingDays.findAll({
    attributes: [
      "id",
      "title",
      "startValue",
      "endValue",
      "numOfDays",
      "unit",
      "shipmentTypeId",
    ],
    include: { model: shipmentType, attributes: ["title"] },
  });
  const stdRanges = estData.filter((ele) => ele.shipmentTypeId === 2);
  const FlashRanges = estData.filter((ele) => ele.shipmentTypeId === 1);
  return res.json(
    returnFunction(
      "1",
      "All ranges for est booking days",
      { stdRanges, FlashRanges },
      ""
    )
  );
}
/*
            24.2 Get Active shipment Types
*/
async function getActiveShipmentType(req, res) {
  const shipmentdata = await shipmentType.findAll({
    where: { status: true },
    attributes: ["id", "title"],
  });
  return res.json(
    returnFunction("1", "All active shipment types", shipmentdata, "")
  );
}
/*
            24.3 Get Active shipment Types
*/
async function addEstDays(req, res) {
  const { title, startValue, endValue, numOfDays, shipmentTypeId } = req.body;
  estimatedBookingDays
    .create({
      title,
      startValue,
      endValue,
      numOfDays,
      shipmentTypeId,
      unit: "miles",
    })
    .then((data) => {
      return res.json(returnFunction("1", "New range added", {}, ""));
    })
    .catch((err) => {
      return res.json(
        returnFunction("0", "Internal Server Error", {}, `${err}`)
      );
    });
}
/*
            24.3 Get Active shipment Types
*/
async function updateEstDays(req, res) {
  const { title, startValue, endValue, numOfDays, shipmentTypeId, estDaysId } =
    req.body;
  estimatedBookingDays
    .update(
      { title, startValue, endValue, numOfDays, shipmentTypeId },
      { where: { id: estDaysId } }
    )
    .then((data) => {
      return res.json(returnFunction("1", "Rnage updated", {}, ""));
    })
    .catch((err) => {
      return res.json(
        returnFunction("0", "Internal Server Error", {}, `${err}`)
      );
    });
}
/*
            24.4 Delete est days range
*/
async function deleteEstDays(req, res) {
  const { estDaysId } = req.body;
  estimatedBookingDays
    .destroy({ where: { id: estDaysId } })
    .then((data) => {
      return res.json(returnFunction("1", "Range deleted", {}, ""));
    })
    .catch((err) => {
      return res.json(
        returnFunction("0", "Internal Server Error", {}, `${err}`)
      );
    });
}

// ! Module 25 : Address DBS
// ! _________________________________________________________________________________________________________________________________
/*
            1. Get structure types
*/
async function getStructTypes(req, res) {
  const structureData = await structureType.findAll({
    where: { status: true },
    include: { model: structQuestion, attributes: ["question"] },
    attributes: ["id", "title"],
  });
  structureData.map((ele) => {
    if (ele.id === 1) {
      // adding to ask building Name
      ele.dataValues.requireField = true;
      ele.dataValues.label = "Building Name:";
    }
    if (ele.id === 2) {
      // adding to ask building Name
      ele.dataValues.requireField = false;
      ele.dataValues.label = "";
    }
    if (ele.id === 3) {
      // adding to ask building Name
      ele.dataValues.requireField = true;
      ele.dataValues.label = "Neighborhood Name:";
    }
    if (ele.id === 4) {
      // adding to ask building Name
      ele.dataValues.requireField = true;
      ele.dataValues.label = "Winery Name:";
    }
    if (ele.id === 5) {
      // adding to ask building Name
      ele.dataValues.requireField = true;
      ele.dataValues.label = "Business Name:";
    }
    if (ele.id === 6) {
      // adding to ask building Name
      ele.dataValues.requireField = true;
      ele.dataValues.label = "Building Name:";
    }
  });
  return res.json(
    returnFunction("1", "All structure types", { structureData }, "")
  );
}
/*2.92
            2. Get province
*/
async function getProvince(req, res) {
  const provinceData = await province.findAll({
    where: { status: true },
    attributes: ["id", "title"],
  });
  return res.json(returnFunction("1", "All provinces", { provinceData }, ""));
}
/*
            3. Get district based on province
*/
async function getDistrict(req, res) {
  //const {provinceId} = req.body;
  const provinceId = req.query.id;
  const districtData = await district.findAll({
    where: { provinceId, status: true },
    attributes: ["id", "title"],
  });
  return res.json(
    returnFunction(
      "1",
      "All district belonging to province",
      { districtData },
      ""
    )
  );
}
/*
            4. Get district based on province
*/
async function getCorregimiento(req, res) {
  //const {districtId} = req.body;
  const districtId = req.query.id;
  const corregimientoData = await corregimiento.findAll({
    where: { districtId, status: true },
    attributes: ["id", "title"],
  });
  return res.json(
    returnFunction(
      "1",
      "All corregimiento belonging to district",
      { corregimientoData },
      ""
    )
  );
}
/*
            5. Send Zip Code Request
*/
async function createZipCode(req, res) {
  const panelId = req.user.id;
  //const userId = 2;
  const {
    structureTypeId,
    buildingName,
    questionOne,
    questionTwo,
    questionThree,
    lat,
    lng,
    provinceId,
    districtId,
    corregimientoId,
  } = req.body;
  const corregimientoData = await corregimiento.findByPk(corregimientoId, {
    attributes: ["nomenclature", "lastCode"],
  });
  let nextCode = getNextPostalCode(corregimientoData.lastCode);
  // Create an entry in the DB
  addressDBS.create({
    postalCode: corregimientoData.nomenclature,
    secondPostalCode: nextCode,
    buildingName,
    questionOne,
    questionTwo,
    questionThree,
    addedBy: "panel",
    verified: true,
    removed: false,
    corregimientoId,
    districtId,
    provinceId,
    structureTypeId,
    warehouseId: panelId,
    lat,
    lng,
  });
  corregimiento.update(
    { lastCode: nextCode },
    { where: { id: corregimientoId } }
  );
  return res.json(returnFunction("1", "Address request sent", {}, ""));
}
/*
            6. Bulk Import DBS data
*/
async function bulkDBSData(req, res) {
  const { data } = req.body;
  let { status, message } = await insertData(data);
  if (status) return res.json(returnFunction("1", message, {}, ""));
  else
    return res.json(returnFunction("0", "Error inserting data", {}, message));
}

// ! Module 26 : Push notifications
// ! _________________________________________________________________________________________________________________________________
/*
        1. Send push notifications
*/

async function throwNot(req, res) {
  const { sendTo, title, body } = req.body;
  // all, onlyCustomers
  let senderData = [],
    to = [];
  if (sendTo === "all") {
    senderData = await user.findAll({
      where: {
        status: true,
        verifiedAt: { [Op.not]: null },
        userTypeId: [1, 2,3],
      },
      attributes: ["languageCheck"],
      include: {
        model: deviceToken,
        where: { status: true },
        attributes: ["tokenId"],
      },
    });
    //return res.json(senderData)
    senderData.map((ele) => {
      ele.deviceTokens.map((token) => {
        if (token.tokenId != null) to.push(token.tokenId);
      });
    });
  } else if (sendTo === "customers") {
    senderData = await user.findAll({
      where: { status: true, verifiedAt: { [Op.not]: null }, userTypeId: [1,3] },
      attributes: ["languageCheck"],
      include: {
        model: deviceToken,
        where: { status: true },
        attributes: ["tokenId"],
      },
    });
    //return res.json(senderData)
    senderData.map((ele) => {
      ele.deviceTokens.map((token) => {
        if (token.tokenId != null) to.push(token.tokenId);
      });
    });
  } else if (sendTo === "drivers") {
    senderData = await user.findAll({
      where: { status: true, verifiedAt: { [Op.not]: null }, userTypeId: [2] },
      attributes: ["languageCheck"],
      include: {
        model: deviceToken,
        where: { status: true },
        attributes: ["tokenId"],
      },
    });
    //return res.json(senderData)
    senderData.map((ele) => {
      ele.deviceTokens.map((token) => {
        if (token.tokenId != null) to.push(token.tokenId);
      });
    });
  }

  const enArray = senderData.filter(item => item.languageCheck === 'en');
  const esArray = senderData.filter(item => item.languageCheck === 'es');


  
  //return res.json(to);
  let notification = { title, body };
  adminNotification(senderData,notification);
  let dt = new Date();
  //adding 5 hours
  dt.setTime(dt.getTime() + 5 * 60 * 60 * 1000);
  pushNotification.create({ at: dt, to: sendTo, title, body });
  return res.json(returnFunction("1", "Push Notifications sent", senderData, ""));
}

/*
        2. Get all sent push notifications
*/
async function getAllPushNot(req, res) {
  const allNotData = await pushNotification.findAll({
    attributes: [
      "id",
      "to",
      "title",
      "body",
      [
        sequelize.fn("date_format", sequelize.col("at"), "%m-%d-%Y %l:%i %p"),
        "at",
      ],
    ],
  });
  return res.json({
    status: "1",
    message: "All Push Notifications",
    data: allNotData,
    error: "",
  });
}




/*
        3. resend push notifications
*/

async function resendNot(req,res){
  const {notId} = req.body;
  const notData = await pushNotification.findByPk(notId, {
      attributes: ['to', 'title', 'body']
  });
  console.log(":rocket: ~ file: admin.js:2411 ~ resendNot ~ notData:", notData)
  let sendTo = notData.to, title = notData.title, body = notData.body;
  // all, onlyCustomers
  let senderData = [], to =[];
  if(sendTo === 'all'){
      senderData = await user.findAll({
          where: {status: true, verifiedAt:{[Op.not]: null}, userTypeId: [1,2]},
          attributes: ['id'],
          include: {model: deviceToken, where: {status: true}, attributes: ['tokenId']}
      });
      //return res.json(senderData)
      senderData.map(ele => {
          ele.deviceTokens.map(token=> {
              if (token.tokenId != null) to.push(token.tokenId);
          })
      });
  }
  else if(sendTo === 'customers'){
      senderData = await user.findAll({
          where: {status: true, verifiedAt:{[Op.not]: null}, userTypeId: [1]},
          attributes: ['id'],
          include: {model: deviceToken, where: {status: true}, attributes: ['tokenId']}
      });
      //return res.json(senderData)
      senderData.map(ele => {
          ele.deviceTokens.map(token=> {
              if (token.tokenId != null) to.push(token.tokenId);
          })
      });
  }
  else if(sendTo === 'drivers'){
      senderData = await user.findAll({
          where: {status: true, verifiedAt:{[Op.not]: null}, userTypeId: [2]},
          attributes: ['id'],
          include: {model: deviceToken, where: {status: true}, attributes: ['tokenId']}
      });
      //return res.json(senderData)
      senderData.map(ele => {
          ele.deviceTokens.map(token=> {
              if (token.tokenId != null) to.push(token.tokenId);
          })
      });
  }
  //return res.json(to);
  let notification = {title, body};
  console.log(":rocket: ~ file: admin.js:2457 ~ resendNot ~ notification:", notification)
  await sendNotification(to, notification);
  return res.json(returnFunction('1', 'Push Notifications sent', {to}, ''))
};


/*
        4. delete push notifications
*/

async function delNot(req,res){
    const {notId} = req.body;
    pushNotification.update({deleted: true}, {where: {id: notId}});
    return res.json(returnFunction('1', 'Push Notifications deleted', {}, ''))
};



// ! Module 10: Restricted Items
        
/*
    *       1. Add Restricted Items 
*/

async function  addRestrictedItem(req,res){
  const {title} = req.body;  
  const itemExist = await restrictedItems.findOne({where: {title, status: true, deleted: false}});
  if(itemExist) return res.json(returnFunction('2', 'Item already exists', {}, ''));
  // check on image
  let imagePath="";
  if (req.file){
      let tmpPath = req.file.path;
      imagePath = tmpPath.replace(/\\/g, "/");
  }else{
     throw new CustomException('Image is require','please upload image');
  }    
  const created= await restrictedItems.create({ title, image: imagePath, status: true});
  
  return res.json(returnFunction('1', 'item added',created, ''));
};


/*
  *       2. Update Restricted Items 
*/

async function  updateRestrictedItem(req,res){
  const {id, title, updateImage} = req.body; 
  const itemExist = await restrictedItems.findOne({where: {title, status: true, id: {[Op.not]: id}}});
  if(itemExist) throw new CustomException('A Item with the same name already exists',' Please try some other name');
  // check on image
  let imagePath = '';
  if(updateImage ===  'true'){
      if (!req.file) throw new CustomException('Image not uploaded', 'Please upload image');
      let tmpPath = req.file.path;
      imagePath = tmpPath.replace(/\\/g, "/");
      console.log("🚀 ~ file: admin.js:1116 ~ updateRestrictedItem  ", imagePath)
      
     await restrictedItems.update(
          {title, image:imagePath },
          {where: {id}}
      );
  }else{
     await  restrictedItems.update(
          {title},
          {where: {id}}
      );
  }
  return res.json(returnFunction('1', 'item Updated', {}, ''));
};
/*
  *       3. Update STATUS Restricted Items 
*/
async function  changeStatusRestrictedItem(req,res){
  const {id,status} = req.body;  
  await restrictedItems.update({ status },{where: {id}});        
  return res.json(returnFunction('1', 'Item Status Updated', {}, ''));
};
/*
  *       3. Get All Restricted Items 
*/
async function getRestrictedItem(req,res){
  const getItems = await restrictedItems.findAll({
      where: {deleted :false},
      attributes: ['id', 'title', 'image','status']
  });
  return res.json(returnFunction('1', 'All Restricted Items', getItems, ''));
};    
/*
  *       3. Delete Restricted Items 
*/
async function  deleteRestrictedItem(req,res){
  const {id} = req.body;  
  await restrictedItems.update({ deleted:true,status:false },{where: {id}});        
  return res.json(returnFunction('1', 'Item Deleted', {}, ''));
};

// ! Module 27: Employees
/*
!_____________________________________________________________________________________________________________________________________
*/
/*
        1. Get all employees
*/
async function getAllEmployees(req, res) {
  const emplData = await warehouse.findAll({
    where: { classifiedAId: 2 },
    attributes: [
      "id",
      "companyName",
      "email",
      "status",
      "countryCode",
      "phoneNum",
    ],
    include: [{ model: role, attributes: ["name"] }],
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
      employeeOf:req.user.id,
      classifiedAId: 2
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
      classifiedAId: 2,
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
      { companyName:name, email, password: hashedPassword, countryCode, phoneNum, roleId },
      { where: { id: emplId } }
    );
  } else {
    warehouse.update(
      { companyName:name, email, countryCode, phoneNum, roleId },
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

// ! Module 28: Role & Permissions
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
// ! Module 29: Logistic companies
/* 1. Logistic companies  */
/*
 *   1.1 Get Logistic companies
 */
async function getLogCompanies(req, res) {
  const LogCompanies = await logisticCompany.findAll({
    // attributes: ['key', 'id', 'information', 'value']
  });

  return res.json(returnFunction("1", "Logistic companies", LogCompanies, ""));
}
/*
 *    1.2 Add Logistic company
 */
async function addLogCompany(req, res) {
  const { title, description, flashCharges, standardCharges ,divisor } = req.body;
  const companyExist = await logisticCompany.findOne({
    where: { title, status: true },
  });
  if (companyExist)
    throw new CustomException(
      "A Logistic company with the same name already exists",
      " Please try some other name"
    );
  // check on image
  if (!req.file)
    throw new CustomException("Image not uploaded", "Please upload image");
  let tmpPath = req.file.path;
  let imagePath = tmpPath.replace(/\\/g, "/");

  logisticCompany.create({
      title,
      description,
      flashCharges,
      standardCharges,
      status: true,
      divisor,
      logo: imagePath,
    })
    .then((data) => {
      return res.json(returnFunction("1", "New Comapany added", data, ""));
    })
    .catch((err) => {
      return res.json(
        returnFunction("0", "Internal Server Error", {}, `${err}`)
      );
    });
}
/*
 *    1.2 Update Logistic companies
 */
async function updateLogCompany(req, res) {
  const { cId, updateImage, ...data } = req.body;
  if (data.title) {
    const companyExist = await logisticCompany.findOne({
      where: { title: data.title, status: true, id: { [Op.not]: cId } },
    });
    if (companyExist)
      throw new CustomException(
        "A Logistic company with the same name already exists",
        " Please try some other name"
      );
  }

  if (updateImage === "true") {
    if (!req.file)
      throw new CustomException("Image not uploaded", "Please upload image");
    let tmpPath = req.file.path;
    let imagePath = tmpPath.replace(/\\/g, "/");
    data["logo"] = imagePath;
  }
  const task = await logisticCompany.update(data, { where: { id: cId } });
  if (task[0]) return res.json(returnFunction("1", "Company updated", {}, ""));
  return res.json(returnFunction("0", "company doesn't exsist", {}, ""));
}
/*
            4. Change Category Status
*/
async function changeLogCompanyStatus(req, res) {
  const { status, companyId } = req.body;
  logisticCompany
    .update({ status }, { where: { id: companyId } })
    .then((data) => {
      return res.json(returnFunction("1", "Category status changed", {}, ""));
    })
    .catch((err) => {
      return res.json(
        returnFunction("0", "Internal Server Error", {}, `${err}`)
      );
    });
}




/*
            5. Get Charges for a Logistic Company
*/
async function getChargesForLog(req,res){
  let condition={};
  condition.status=true;
  condition.deleted=false;
  if(req.query.logisticCompanyId)condition.logisticCompanyId=req.query.logisticCompanyId
  if(req.query.flash)condition.flash=req.query.flash
  const charges=await logisticCompanyCharges.findAll({where:
    condition,include:{model:logisticCompany,attributes:['id','title']}})
  return res.json(
    returnFunction("1","success",{charges},'')
  )
}


/*
            6. update Charges for a Logistic Company
*/
async function updateChargesForLog(req,res){
  const {id,...data}=req.body;
  const updated = await logisticCompanyCharges.update(data,{where:{id}})
  if(!updated[0])
  throw CustomException("logistic Company not found", "Please enter valid data");
  return res.json(
    returnFunction("1","data Updated Successfully",{},'')
  )
 
}


/*
            7. Add Charges for a Logistic Company
*/
async function addChargesForLog(req,res){
  const {startValue,endValue,charges,flash,logisticCompanyId,bookingType} = req.body
  const newCharges = await logisticCompanyCharges.create({startValue,endValue,charges,flash,logisticCompanyId})
  // if(!updated[0])
  // throw CustomException("logistic Company not found", "Please enter valid data");
  return res.json(
    returnFunction("1","New Charges Added Succeessfully",{newCharges},'')
  )
 
}


/*
            8. Update Status of Charges for a Logistic Company
*/
async function updateStatusChargesForLog(req,res){
  const {id,status} = req.body
  const updated = await logisticCompanyCharges.update({status},{where:{id}})
  if(!updated[0])
  throw CustomException("logistic Company not found", "Please enter valid data");
  return res.json(
    returnFunction("1","Updated Succeessfully",{},'')
  )
 
}

/*
            9. Delete Charges for a Logistic Company
*/
async function deleteChargesForLog(req,res){
  const {chargeId} = req.body
  const updated = await logisticCompanyCharges.update({deleted:true},{where:{id:chargeId}})
  if(!updated[0])
  throw CustomException("logistic Company not found", "Please enter valid data");
  return res.json(
    returnFunction("1","Updated Succeessfully",{},'')
  )
 
}


/*
            10. Active Logistic Company
*/


async function activeLog(req,res){
  const data = await logisticCompany.findAll({where:{status:true},attributes:['id','title']})
  return res.json(returnFunction("1","Succeess",{data},''))
 
}

// ! Module get Bussiness Customer

async function adminBussinessCheck(req, res) {
    try {
        // Fetch users with their active user plans
        const customerGet = await user.findAll({
            where: {
                userTypeId: 3,
            },
            include: [
                {
                    model: userPlan,
                    as: 'userPlan',
                    where: {
                        subscriptionStatus: 'Active',
                    },
                    attributes: ['subscriptionPlanID']
                }
            ],
            attributes: ['id','firstName', 'lastName', 'businessName'],
        });

       // console.log("Customer Get Details", customerGet);

        const subscriptionIds = customerGet.map(user => user.userPlan?.dataValues?.subscriptionPlanID).filter(id => id);

        //console.log("Subscription IDs of all the users----->", subscriptionIds);

        const subscriptionDetails=await Promise.all(subscriptionIds.map(id=> Braintree.getSubscriptionDetails(id)));
        



        // console.log("Details of Subscriptions----------->",subscriptionDetails);

        
      const userSubscriptionDetails = await Promise.all(customerGet.map(async user => {
        const subscription = subscriptionDetails.find(
            sub => sub.subscription.id === user?.userPlan?.dataValues?.subscriptionPlanID
        );

        let bookingCount = await checkBookingLimit(user.id);

        //console.log("Booking In Controller---------------------->",bookingCount);

        const obj = {
            subscriptionId: subscription.subscription.id,
            subscription_price: subscription.subscription.price,
            subscription_status: subscription.subscription.status,
            subscription_transactionStatus: subscription.subscription.transactions[0]?.status || 'N/A',
            //subscription_discount: subscription.subscription.discounts[0].amount || 'N/A',
            completedBookings:bookingCount
        };

        // Get booking count and limit
      

        return {
            ...user.dataValues,
            details: obj,
        };
    }));
        return res.json(userSubscriptionDetails);
    } catch (error) {
        console.error('Error fetching customer details:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}


// ! Module 30: Earnings
/*
!_____________________________________________________________________________________________________________________________________
*/
/*
        1. Get general data
*/
async function getGenEarnings(req, res) {}

// ! RECURRING FUNCTIONS

let returnFunction = (status, message, data, error) => {
  return {
    status: `${status}`,
    message: `${message}`,
    data: data,
    error: `${error}`,
  };
};

// Get user by type
async function userByType(typeId) {
  const userData = await user.findAll({
    where: { userTypeId: typeId, deletedAt: null },
    attributes: [
      "id",
      "firstName",
      "lastName",
      "countryCode",
      "phoneNum",
      "status",
    ],
  });
  return userData;
}
// Insert DBS data

async function insertData(data) {
  try {
    // Loop through the data and create/update provinces, districts, and corregimientos
    for (const item of data) {
      // Find or create the province
      const [province_var, provinceCreated] = await province.findOrCreate({
        where: { title: item.province_title },
        defaults: { key: item.province_key, status: true },
      });

      // Find or create the district
      const [district_var, districtCreated] = await district.findOrCreate({
        where: {
          title: item.district_title,
          provinceId: province_var.id,
          status: true,
        },
        defaults: { provinceId: province_var.id, key: item.district_key },
      });

      // Find or create the corregimiento
      const [corregimiento_var, corregimientoCreated] =
        await corregimiento.findOrCreate({
          where: {
            title: item.corregimiento,
            districtId: district_var.id,
            status: true,
          },
          defaults: {
            districtId: district_var.id,
            key: `${item.province_key}${item.district_key}`,
            value: item.corregimiento_value,
            nomenclature: `${item.province_key}${item.district_key}${item.corregimiento_value}`,
          },
        });
    }
    console.log("Data inserted successfully");
    return { status: true, message: "Data inserted successfully" };
  } catch (error) {
    console.error("Error inserting data:", error);
    return { status: true, message: `${error}` };
  }
}

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

async function checkBookingLimit(userId) {
  const bookingLimit = await userPlan.findOne({
    where: { userId: userId },
  });

  if (!bookingLimit) {
    throw CustomException("User doesn't have any subscription");
  }

  const buyDateRecord = await userPlan.findOne({
    where: { userId: userId },
    attributes: ["buyDate"],
  });

  if (!buyDateRecord || !buyDateRecord.buyDate) {
    throw CustomException("Subscription purchase date not found");
  }

  // Convert buyDate to a JavaScript Date object
  const buyDate = new Date(buyDateRecord.buyDate);

  // Set the start date to the purchase date
  const startDate = new Date(buyDate);
  startDate.setUTCHours(0, 0, 0, 0);

  // Calculate the end date as one month after the start date
  const endDate = new Date(startDate);
  endDate.setUTCMonth(startDate.getUTCMonth() + 1);
  endDate.setUTCDate(0); // Last day of the month
  endDate.setUTCHours(23, 59, 59, 999); // End of the last day

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
  }else{
    return bookingCount
  }

}

// ! Module : Web policy
/*
 *     1. Terms & Conditions
 */
async function getTermsConditions(req, res) {
  const data = await webPolicy.findOne({
    where: { title: "Terms & Conditions" },
    attributes: ["id", "title", "value"],
  });
  return res.json(returnFunction("1", "Terms & Conditions", data, ""));
}
/*
 *     2. Update Terms & Conditions
 */
async function updateTermsConditions(req, res) {
  const { content } = req.body;
 await webPolicy.update(
    { value: content },
    { where: { title: "Terms & Conditions" } }
  );
  return res.json(returnFunction("1", "Terms & Conditions Updated", {}, ""));
}
/*
 *     3. Privacy Policy
 */
async function getPrivacyPolicy(req, res) {
  const data = await webPolicy.findOne({
    where: { title: "Privacy Policy" },
    attributes: ["id", "title", "value"],
  });
  return res.json(returnFunction("1", "Privacy Policy", data, ""));
}
/*
 *     4. Update Privacy Policy
 */
async function updatePrivacyPolicy(req, res) {
  const { content } = req.body;
  await webPolicy.update(
    { value: content },
    { where: { title: "Privacy Policy" } }
  );
  return res.json(returnFunction("1", "Privacy Policy Updated", {}, ""));
}

async function homePage(req, res) {
  let adminId = req.user.id;
  let nowDate = Date.now();
  let todayStart = new Date(nowDate);
  let today_start = `${todayStart.getFullYear()}-${(
    "0" +
    (todayStart.getMonth() + 1)
  ).slice(-2)}-${("0" + todayStart.getDate()).slice(-2)}`;
  const userData = await user.findAll({
    where: { deletedAt: { [Op.is]: null } },
    attributes: ["userTypeId", "status"],
  });
  const numOfBookings = await booking.count({
    where: { paymentConfirmed: true },
  });
  const numOfWarehouses = await warehouse.count({
    where: { status: true, classifiedAId: 3 },
  });
  const earnings = await booking.sum("total", {
    where: { paymentConfirmed: true },
  });
  const todayEarnings = await booking.sum("total", {
    where: { pickupDate: { [Op.eq]: today_start }, paymentConfirmed: true },
  });
  const balance = await wallet.sum("amount", { where: { adminId } });
  const paidToDrivers = await wallet.sum("amount", {
    where: {
      description: {
        [Op.or]: ["Receiving Driver Earnings", "Delivery Driver Earnings"],
      },
    },
  });
  let numOfUsers = userData.filter((ele) => ele.userTypeId === 1).length;
  let numOfDrivers = userData.filter((ele) => ele.userTypeId === 2).length;
  let blockedUsers = userData.filter(
    (ele) => ele.userTypeId === 1 && !ele.status
  ).length;
  let blockedDrivers = userData.filter(
    (ele) => ele.userTypeId === 2 && !ele.status
  ).length;
  const defaultCurrencyUnit = await appUnits.findOne({
    where: { status: true },
    include: { model: units, as: "currencyUnit", attributes: ["symbol"] },
  });
  let outObj = {
    numOfUsers,
    numOfDrivers,
    blockedUsers,
    blockedDrivers,
    numOfBookings,
    numOfWarehouses,
    earnings,
    todayEarnings: todayEarnings === null ? "0.00" : todayEarnings,
    balance: -1 * balance,
    driverEarnings: -1 * paidToDrivers,
    currencyUnit: defaultCurrencyUnit.symbol,
  };
  return res.json(returnFunction("1", "Dashboard general data", outObj, ""));
}

//check registeration step
async function checkDriverRegStep(req, res) {
  const { driverId } = req.body;
  const userData = await user.findByPk(driverId, {
    include: [
      {
        model: driverDetail,
        attributes: {
          exclude: [
            "createdAt",
            "updatedAt",
            "userId",
            ,
            "warehouseId",
            "driverTypeId",
          ],
        },
      },
    ],
    attributes: [
      "id",
      "firstName",
      "lastName",
      "email",
      "countryCode",
      "phoneNum",
      "image",
      [
        sequelize.fn(
          "date_format",
          sequelize.col("user.createdAt"),
          "%d/%m/%Y"
        ),
        "joinedOn",
      ],
    ],
  });
  if (!userData.driverDetail)
    return res.json(
      returnFunction(
        2,
        "Start from step 2",
        { id: driverId, email: userData.email },
        ""
      )
    );
  if (!userData.driverDetail.vehicleTypeId)
    return res.json(
      returnFunction(
        2,
        "Start from step 2",
        { id: driverId, email: userData.email },
        ""
      )
    );
  if (!userData.driverDetail.licIssueDate)
    return res.json(
      returnFunction(
        3,
        "Start from step 3",
        { id: driverId, email: userData.email },
        ""
      )
    );
  //if(!userData.driverDetail.licIssueDate) return res.json(returnFunction(3, 'Start from step 3', {id: driverId, email: userData.email }, ''));
  return res.json(returnFunction(1, "Already Completed", {}, ""));
}

//! Module Merchnat Order's and Dashboard
async function merchantDashboard(req,res) {
  const countMerchant=await user.findAndCountAll({
    where:{
      userTypeId:4,
    }
  })
  console.log("🚀 ~ merchantDashboard ~ countMerchant:", countMerchant);

  const countWarehouse=await warehouse.findAndCountAll({
    where:{
      classifiedAId:3,
    }
  })
  console.log("🚀 ~ merchantDashboard ~ countWarehouse:", countWarehouse)

  const inboundOrder=await merchantOrder.findAndCountAll({
    where:{
      orderType:'INBOUND'
    },
    include:[{
      model:merchantOrderStatuses,
      attributes:['title']
    }]

  })

  const outboundOrders=await merchantOrder.findAndCountAll({
    where:{
      orderType:'OUTBOUND'
    },
    include:[{
      model:merchantOrderStatuses,
      attributes:['title']
    }]
  })

  let outputObj={
    totalMerchantCount:countMerchant,
    totalWarehouses:countWarehouse,
    allInboundOrders:inboundOrder,
    allOutboundOrders:outboundOrders,
  }


  return res.json(returnFunction("1","Dashboard Data",outputObj))
  
}

//!Module Add Merchant and assign Service to him
async function registerMerchant(req, res) {
  const { firstName, lastName, countryCode, phoneNum,companyName,taxNumber, dvToken,email,password } = req.body;
    
console.log("Request --------------------> ",req.body)
  let profileImage = null;
  if (req.file) {
    let tmpprofileImage = req.file.path;
    profileImage = tmpprofileImage.replace(/\\/g, "/");
  }

  const userExist = await user.findOne({
    where: {
      [Op.or]: [
        { email },
        { [Op.and]: [{ countryCode: countryCode }, { phonenum: phoneNum }] },
      ],
      deletedAt: null,
      userTypeId: 4,
    },
  });
  if (userExist) {
    if (email === userExist.email)
      throw new CustomException(
        "Users exists",
        "The email you entered is already taken"
      );
    else
      throw new CustomException(
        "Users exists",
        "The phone number you entered is already taken"
      );
  }

  const virtualBoxNumber = await generateUniqueVirtualBoxNumber();

  const confirmNumber=isPhoneNumberInRange(phoneNum)
  if(!confirmNumber){
    throw new CustomException("Phone number is not within the range of 10 Digits.")

  }

  let hashedPassword = await bcrypt.hash(password, 10);
  // creating new user
  let nowDate = Date.now();
  let cDT = new Date(nowDate);
  let verifiedAt = `${cDT.getFullYear()}-${("0" + (cDT.getMonth() + 1)).slice(
    -2
  )}-${("0" + cDT.getDate()).slice(-2)}`;
  let newUser = await user.create({
    firstName,
    lastName,
    email,
    countryCode,
    phoneNum,
    status: true,
    verifiedAt,
    password: hashedPassword,
    userTypeId: 4,
    virtualBox:virtualBoxNumber,
    dvToken,
    image: profileImage,
    companyName,
    taxNumber
  });
  
  return res.json(returnFunction("1","Merchant Register Sucessfully",newUser));
    
}


//!=====================================Add warehouse Locations and Zones============================//
//=======================Add,Delete,Edit warehouse Locations============================>
  async function warehouselocationAdd(req,res) {
    const{shelfCode,warehouseZoneId}=req.body;
  
  
    const locationCreate=await inWarehouseLocation.create({
      shelfCode,
      warehouseZoneId,
    })
    console.log("🚀 ~ warehouselocation ~ locationCreate:", locationCreate)
  
    return res.json(returnFunction("1","Location Added in Warehouse",locationCreate))
    
  }

  //==============Edit Warehouse Location================//

  async function editWarehouseLocation(req,res) {
    const{shelfCode,warehouseZoneId,shelfCodeId}=req.body

    const updateLocation=await inWarehouseLocation.update(
      {shelfCode:shelfCode,warehousezoneId:warehouseZoneId},
      {where:{id:shelfCodeId,}}
    )

    return res.json(returnFunction("1","Warehouse location Updated",updateLocation))
    
  }

  //==================Delete warehoue Location===============//

  async function deleteLocation(req,res) {
    const{warehouseLocationId}=req.params

    const deleteLocation=await inWarehouseLocation.destroy({
      where:{
        id:warehouseLocationId,
      }
    })


    return res.json(returnFunction("1","warehouse Location Deleted",deleteLocation))
    
  }
  
  //=========================Add,Edit,Delete  warehouse Zones========================>
  async function wareHouseZoneAdd(req,res) {
    const{zoneName}=req.body
  
    let warehouse=req.user.id
  
    const wareHouseZone=await warehouseZones.create({
      zoneName,
      warehouseId:warehouse,
    })
  
    res.json(returnFunction("1","Warehouse Zone Added",wareHouseZone))
    
  }



  async function editwarehouseZone(req,res) {

    const{zoneName,zoneId}=req.body

    const editZone=await warehouseZones.update(
      {zoneName:zoneName},
      {where:{id:zoneId}}
    )
    return res.json(returnFunction("1","Zone Updated",editZone))
    
  }

  async function deleteZone(req,res) {
    const{zoneId}=req.params

    const deleteZone=await warehouseZones.destroy({
      where:{
        id:zoneId
      }
    })


    return res.json(returnFunction("1","Zone Deleted Sucessfully",deleteZone))
    
  }

//!===========================Create Products, Categories and Subscategories======================//

/*
           Create Products through CSV
    ________________________________________
*/

async function createProductfromCSV(req,res) {

  if(!req.file){
      throw new CustomException('No file uploaded')
  }

  //const filePath=path.join(__dirname,'../../Public/csvFiles',req.file.filename);

  const fileBuffer = req.file.buffer;
  const fileStream = require('stream').Readable.from(fileBuffer);

  fileStream
  .pipe(csv())
  .on('data',async(row)=>{
      try {

          const imageFileName=row.image;

          const imagePath=path.join(__dirname,'../../Public/productImages/',imageFileName);
          if (!fs.existsSync(imagePath)) {
              throw new CustomException(`Image file ${imageFileName} not found`);
          }

          const findCatName=await merchantCategories.findOne({
            where:{
              title:row.merchantCategoryName,
            },
            attributes:['id','title']
          })
          console.log("🚀 ~ .on ~ findCatName:", findCatName.title)

          const findSubCat=await merchantSubcategories.findOne({
            where:{
              title:row.subCategoryName,
            },
            attributes:['id','title']
          })
          console.log("🚀 ~ .on ~ findSubCat:", findSubCat)

          await products.create({
            productName:row.productName,
              merchantCategoryId:findCatName.id,
              productDescription:row.productDescription,
              merchantCategoryName:findCatName.title,
              image:row.image,
              productCode:row.productCode,
              price:parseFloat(row.price),
              quantity:parseInt(row.quantity, 10),
              weight:parseFloat(row.productWeight),
              unit:row.unit,
              productStatus:row.productStatus,
              subCategoryName:findSubCat.title,
              merchantsubcategoriesId:findSubCat.id,

          })
          
      } catch (error) {
        console.log(error)
        throw  new CustomException(error.message);
      }
  })
  .on('end',()=>{
      // fs.unlinkSync(filePath);
      return res.json(returnFunction("1","Products Created Sucessfully"));
  })
  .on('error', (error) => {
    console.error('Error processing CSV file:', error);
    res.status(500).json({ message: 'Error processing CSV file', error });
});

}

/*
           Create Products
    ________________________________________
*/

async function createProducts(req,res) {

  const{productName,image,productDescription,price,quantity,weight,unit,productStatus,productCode,merchantCategoryId,merchantCategoryName,subCategoryName,merchantSubcategoryId}=req.body;

  let productImage=null;

  console.log("Req File------------------->",req.file);
  if(req.file){
    let tmpproductImage = req.file.path;
    productImage = tmpproductImage.replace(/\\/g, "/");
  }


  const findcatName=await merchantCategories.findOne({
    where:{
      id:merchantCategoryId
    },
    attributes:['id','title']
  })
  console.log("🚀 ~ createProducts ~ findcatName:", findcatName)

  const findsubCat=await merchantSubcategories.findOne({
    where:{
      id:merchantSubcategoryId,
    },
    attributes:['id','title']
  })
  console.log("🚀 ~ createProducts ~ findsubCat:", findsubCat)

  //return res.json(findsubCat);

  const createProducts=await products.create({
    productName,
    productDescription,
    price,
    quantity,
    weight,
    unit:'lbs',
    image:productImage,
    productStatus,
    productCode,
    merchantCategoryId,
    merchantSubcategoryId,
    merchantCategoryName:findcatName.title,
    subcategoryName:findsubCat.title,

  })

  console.log("createProducts===============>",createProducts)


  let code = otpGenerator.generate(6, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
  code = `TSH-${productName}-${code}`;
  // Creating barcode
  JsBarcode(svgNode, code, {
    xmlDocument: document,
  });
  const svgText = xmlSerializer.serializeToString(svgNode);
  svg2img(svgText, function (error, buffer) {
    fs.writeFileSync(`Public/productsBarcode/${code}.png`, buffer);
  });

  await products.update(
    {
      code,
      barCode:`Public/Barcodes/${code}.png`,
    },
    { where: {  id:createProducts.id } }
  );

  return res.json(returnFunction("1","Products are Created",createProducts))

  
}

/*
           Create Categories 
         .___________________________.
*/


async function createCategories(req,res){
  const{title,status}=req.body

  const categoriesCreate=await merchantCategories.create({
    title,
    status
  })

  return res.json(returnFunction("1","Categories Added",categoriesCreate))
}


/*
             Get Categories 
         .___________________________.
*/

async function getCategories(req,res) {

  const getCategories=await merchantCategories.findAll();
  
  return res.json(returnFunction("1","Fetched All Categories",getCategories))
    
  }

/*
           Create SubCategories 
         .___________________________.
*/
async function Subcategories(req,res) {
  const{title,description,status}=req.body

  const createSubCat=await merchantSubcategories.create({
    title,
    description,
    status
  })

  return res.json(returnFunction("1","SubCategory created",createSubCat))
  
}

/*
           Get SubCategories 
         .___________________________.
*/

async function getSubcategories(req,res) {


  const getSubcategories=await merchantSubcategories.findAll();


  return res.json(returnFunction("1","Fetched All Subcategories",getSubcategories))
  
}




/*
           Create BarCodes 
         .___________________________.
*/

async function createBarCode(req,res){

  const{productIds}=req.body;
  if (!Array.isArray(productIds) || productIds.length === 0) {
    return res.status(400).json({ error: 'Product IDs array is required and should not be empty' });
  }

  const updatePromises=productIds.map(async (productId)=>{
    let code = otpGenerator.generate(6, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });
    code = `TSH-${productId}-${code}`;
    // Creating barcode
    JsBarcode(svgNode, code, {
      xmlDocument: document,
    });
    const svgText = xmlSerializer.serializeToString(svgNode);
    svg2img(svgText, function (error, buffer) {
      fs.writeFileSync(`Public/productsBarcode/${code}.png`, buffer);
    });
  
    await products.update(
      {
        code,
        barCode:`Public/Barcodes/${code}.png`,
      },
      { where: {  id:productId } }
    );

  })

  await Promise.all(updatePromises);


  return res.json(returnFunction("1",'Product barcodes updated successfully',))
  
}

/*
             Edit Products
         .___________________________.
*/

async function editProduct(req,res) {

  const{id,productName,image,productDescription,price,quantity,weight,productStatus,productCode,merchantCategoryId,productPhotoChange}=req.body;

  let tempImg=null;
  let newProductImage;

  if(productPhotoChange==='true'){
    if(!req.file){

      throw new CustomException("Add Product Photo")
    
    }
    tempImg=req.file.path;
    newProductImage=tempImg.replace(/\\/g, "/");

  }

 
  const productUpdate=await products.update({
    productName,
    productDescription,
    price,
    quantity,
    weight,
    image:productPhotoChange==='true'?newProductImage:undefined,
    productStatus,
    productCode,
    merchantCategoryId:1,
  },{
    where:{
      id:id,
    }
  })


  return res.json(returnFunction("1","Product Updated Sucessfully"));

  
}

/*
            Get Products 
         .___________________________.
*/

async function getProducts(req,res) {

  const getProducts=await products.findAll();
  // console.log("🚀 ~ getProducts ~ getProducts:", getProducts)


  return res.json(returnFunction("1","All Products Fetched",getProducts))
}

//!============================Inbound and Outbound Orders Creation================================//


async function allMerchants(req,res) {
  const findMerchants=await user.findAll({
    where:{
      userTypeId:4,
    },
    attributes:['id','firstName','lastName','email']
  })

  return res.json(returnFunction("1","All Merchants Fetched",findMerchants))
}

async function createOrder(req, res) {
  const {
    orderType, 
    merchantReference, 
    merchantName, 
    merchantId, 
    items, 
    warehouseId, 
    receiveingWarehouse,
    receiveingShelfCodeId,
    merchantID
  } = req.body;

  //let merchantID = req.user.id;
  const finduser = await user.findByPk(merchantID, {
    attributes: ['firstName', 'lastName']
  });
  
  //console.log("🚀 ~ createInBoundOrder ~ finduser:", finduser);

  const fullName = `${finduser.firstName} ${finduser.lastName}`;

  const orderPromises = items.map(async (product) => {
    const { productId, quantity } = product;


    const productquantity=await products.findOne({
      where:{
        id:productId
  
      },
      attributes:['id','quantity']
    })
    console.log("🚀 Before ~ orderPromises ~ productquantity:", productquantity)
    if(orderType==='INBOUND'){

      if(productquantity.quantity>=quantity){

        productquantity.quantity=productquantity.quantity-quantity;
        await productquantity.save();
      }else{
        throw new CustomException("Entered Quantity is greater than Product Quantity")
      }

    }
    return await merchantOrder.create({
      orderType,
      receiveingWarehouse: orderType === 'OUTBOUND' ? receiveingWarehouse : null,
      merchantReference,
      merchantName: fullName,
      merchantId: merchantID,
      productId,  
      quantity,  
      warehouseId,
      merchantorderstatusesId: 1,
      receiveingShelfCodeId:orderType === 'OUTBOUND'?receiveingShelfCodeId:null
    });
  });

 
  const orderCreate = await Promise.all(orderPromises);

  if(orderType==='OUTBOUND' && receiveingWarehouse ){
    console.log("This Condition runs for the warehouse to warehouse transfer===========>");
    
    const ordermade=items.map(async(product)=>{
      const{productId,quantity}=product;

      return await merchantOrder.create({
        orderType: 'INBOUND',
        receiveingWarehouse: null, 
        merchantReference,
        merchantName: fullName,
        merchantId: merchantID,
        productId,
        quantity,
        warehouseId: receiveingWarehouse,  
        merchantorderstatusesId: 1,  
      });

    })

    return res.json(returnFunction("1", `${orderType} Order has been created with ${ordermade.length} products`, ordermade))

  }

  let to=[];

  let notification = {
    title: `${orderType} Order`,
    body: `${orderType} Order has been created with ${orderCreate.length} products`
  };
  throwNotification(to, notification);

  console.log("🚀 ~ createInBoundOrder ~ orderCreate:", orderCreate);

  return res.json(returnFunction("1", `${orderType} Order has been created with ${orderCreate.length} products`, orderCreate));
}


//==================Get all Categories and Subcategories by name=====================//
async function getCatandSubCatName(req,res) {
  const{categoryName}=req.body

  const findCategory=await merchantCategories.findOne({
    where:{
      title:categoryName
    }
  })

  if(findCategory){
    return res.json(returnFunction("1","Category find",findCategory))
  }


  const findsubCategory=await merchantSubcategories.findOne({
    where:{
      title:categoryName,
    }
  })

  if(findsubCategory){
    return res.json(returnFunction("1","SubCategory Find",findsubCategory))
  }
  
}


//================Create Services=======================//
async function createService(req,res) {
  const{title,status,price}=req.body
  const createService=await merchantService.create({
    title,
    status,
    price
  })

  return res.json(returnFunction("1","Service created",createService))
  
}


//!====================================================================Recurring Functions===============================================================================>>

function isPhoneNumberInRange(phoneNumber) {
  
  const num = parseInt(phoneNumber, 10);
  
  // Check if the number is between 100 and 999
  if (phoneNumber.length===10) {
      return true; // The number is within the range
  } else {
      return false; // The number is not within the range
  }
}

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


function journeyTrack(deliverytype) {
  const direct = [
    {
      id: 1,
      title: 'Order Created',
      description: 'Your order has been created'
    },
    {
      id: 7,
      title: 'Received at Warehouse (USA warehouse)',
      description: 'Confirmation of order received by warehouse'
    },
    {
      id: 8,
      title: 'Re measurements/Labeled',
      description: 'Confirmation of re-measurements and labeling of package(s)'
    },
    {
      id: 9,
      title: 'Pending Payments',
      description: 'Address Added Successfully '
    },
    {
      id: 10,
      title: 'Ready to Ship',
      description: 'Order ready to be deliver to customer directly or indirectly'
    },
    {
      id: 11,
      title: 'In Transit',
      description: 'Package in Transit'
    },
    {
      id: 12,
      title: 'Outgoing /Received',
      description:
        'when Transit received in Puerto Rico warehouse package will be in received'
    },
    {
      id: 13,
      title: 'Driver Assigned/Accepted',
      description: 'Hang on! Your Order is arriving soon'
    },
    {
      id: 14,
      title: "Shipped",
      description: "Order shipped directly to customer from usa wareho..."
    },
    {
      id: 18,
      title: 'Delivered',
      description: 'Your order has been completed'
    },
    {
      id: 19,
      title: 'Cancelled',
      description: 'Order has been cancelled '
    },
  ];
  const byWareHouse = [
    {
      id: 1,
      title: 'Order Created',
      description: 'Your order has been created'
    },
    {
      id: 7,
      title: 'Received at Warehouse (USA warehouse)',
      description: 'Confirmation of order received by warehouse'
    },
    {
      id: 8,
      title: 'Re measurements/Labeled',
      description: 'Confirmation of re-measurements and labeling of package(s)'
    },
    {
      id: 10,
      title: 'Ready to Ship',
      description: 'Order ready to be deliver to customer directly or indirectly'
    },
    {
      id: 11,
      title: 'In Transit',
      description: 'Package in Transit'
    },
    {
      id: 12,
      title: 'Outgoing /Received',
      description:
        'when Transit received in Puerto Rico warehouse package will be in received'
    },
    {
      id: 13,
      title: 'Driver Assigned/Accepted',
      description: 'Hang on! Your Order is arriving soon'
    },
    {
      id: 15,
      title: 'Reached (delivery)',
      description: 'Driver Reached at Wearhouse'
    },
    {
      id: 22,
      title: 'Hand over to Driver',
      description: 'hand over to delivery Driver'
    },
    {
      id: 16,
      title: 'Pickedup (delivery)',
      description: 'order has been picked by customer/driver '
    },
    {
      id: 17,
      title: 'Ongoing/ Start ride',
      description: 'On the way'
    },
    {
      id: 18,
      title: 'Delivered',
      description: 'Your order has been completed'
    },
    {
      id: 19,
      title: 'Cancelled',
      description: 'Order has been cancelled '
    },
  ];
  const selfPickup = [
    {
      id: 1,
      title: 'Order Created',
      description: 'Your order has been created'
    },
    {
      id: 7,
      title: 'Received at Warehouse (USA warehouse)',
      description: 'Confirmation of order received by warehouse'
    },
    {
      id: 8,
      title: 'Re measurements/Labeled',
      description: 'Confirmation of re-measurements and labeling of package(s)'
    },
    
    {
      id: 10,
      title: 'Ready to Ship',
      description: 'Order ready to be deliver to customer directly or indirectly'
    },
    {
      id: 11,
      title: 'In Transit',
      description: 'Package in Transit'
    },
    {
      id: 12,
      title: 'Outgoing /Received',
      description:
      'when Transit received in Puerto Rico warehouse package will be in received'
    },
    {
      id: 20,
      title: 'Awaiting self pickup',
      description: 'Awaiting customer to pickup order from warehouse'
    },
    {
      id: 21,
      title: 'Handed over to customer',
      description: 'Order picked by customer from warehouse'
    },
    {
      id: 19,
      title: 'Cancelled',
      description: 'Order has been cancelled '
    },
     
  ];
  const WarehouseSelf = [
    {
      id: 1,
      title: 'Order Created',
      description: 'Your order has been created'
    },
    {
      id: 7,
      title: 'Received at Warehouse (USA warehouse)',
      description: 'Confirmation of order received by warehouse'
    },
    {
      id: 8,
      title: 'Re measurements/Labeled',
      description: 'Confirmation of re-measurements and labeling of package(s)'
    },
    {
      id: 10,
      title: 'Ready to Ship',
      description: 'Order ready to be deliver to customer directly or indirectly'
    },
    {
      id: 11,
      title: 'In Transit',
      description: 'Package in Transit'
    },
    {
      id: 12,
      title: 'Outgoing /Received',
      description:
        'when Transit received in Puerto Rico warehouse package will be in received'
    },
    {
      id: 20,
      title: 'Awaiting self pickup',
      description: 'Awaiting customer to pickup order from warehouse'
    },
    {
      id: 21,
      title: 'Handed over to customer',
      description: 'Order picked by customer from warehouse'
    },
    {
      id: 19,
      title: 'Cancelled',
      description: 'Order has been cancelled '
    },
  ];
  
  
  if(deliverytype == 'direct'){
    return direct;
  }
  if(deliverytype == 'byWarehouse'){
    return byWareHouse;
  }
  if(deliverytype == 'selfPickup'){
    return selfPickup;
  }
  if(deliverytype == 'warehouseSelf'){
    return WarehouseSelf;
  }
  }


  function calculateWeights(packages , divisor) {

    let weight = 0; 
    let dimensionalWeight = 0;
    let chargedWeight = 0;
    let devider = parseFloat(divisor);
  
    for (let index = 0; index < packages.length; index++) {
      let package = packages[index];
      let Weightcharges = 0;
      let billableWeight;
  
      weight += parseFloat(package.actualWeight);
      dimensionalWeight += parseFloat(package.actualVolume)/devider;
  
      if (parseFloat(package.actualWeight) > dimensionalWeight) {
        billableWeight = parseFloat(package.actualWeight);
      } else if (dimensionalWeight > parseFloat(package.actualWeight)) {
        billableWeight = dimensionalWeight;
      }
  
      chargedWeight += parseFloat(billableWeight);
    }
    return { weight, dimensionalWeight, chargedWeight };
  }

//!===============================================================================================================================================================>>

module.exports = {
  // Auth
  signIn,
  // Customers
  getAllCustomers,
  customerDetailsById,
  bookingDetails,
  // drivers
  getAllDrivers,
  driverDetailsById,
  blockUnblockUser,
  approveDriver,
  driverWallet,
  payToDriver,
  // warehouses
  getAllWarehouse,
  warehouseDetails,
  searchAddress,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  warehouselocationAdd,
  editWarehouseLocation,
  deleteLocation,
  //==>>Zones
  wareHouseZoneAdd,
  editwarehouseZone,
  deleteZone,
  // Addresses
  getAllAddresses,
  addressDetails,
  generateRandomCode,
  approveAddress,
  editAddress,
  deleteAddress,
  // Banners
  addBanner,
  getAllBanners,
  updateBanner,
  changeBannerStatus,
  //^ Category
  addCategory,
  getAllCategory,
  updateCategory,
  changeCategoryStatus,
  // Coupons
  addCoupon,
  getAllCoupon,
  updateCoupon,
  changeCouponStatus,
  // sizes
  getUnitsClass,
  addSize,
  getAllSize,
  updateSize,
  changeSizeStatus,
  // Structure Types
  addStruct,
  getAllStruct,
  updateStruct,
  changeStructStatus,
  //* Vehicle Types
  addVehicle,
  getAllVehicle,
  updateVehicle,
  changeVehicleStatus,
  deleteVehicle,
  //^ Unit
  addUnit,
  getUnitsTypes,
  updateUnit,
  updateUnitStatus,
  addAppUnit,
  currentSystemUnits,
  getAllUnits,
  // Support
  getSupport,
  updateSupport,
  //* FAQs
  addFAQ,
  allFAQs,
  updateFAQ,
  changeFAQStatus,
  deleteFAQ,
  //* Charges
  getGenCharges,
  updateGenCharges,
  addDistCharge,
  getDistCharges,
  updateDistCharge,
  deleteDistCharge,
  addWeightCharge,
  getWeightCharges,
  updateWeightCharge,
  deleteWeightCharge,
  addVWCharge,
  getVWCharges,
  updateVWCharge,
  deleteVWCharge,
  //^ Driver Register
  registerStep1,
  getActiveVehicleTypes,
  registerStep2,
  allActiveWarehouse,
  updateDriverStatus,
  getSpecifiWearhouseDrivers,
  registerStep3,
  updateDriverVehicle,
  updateDriverProfile,
  updateDriverLicense,
  checkDriverRegStep,
  // Transporter Guys
  allTransporterGuy,
  addTransporter,
  updateTransporter,
  deleteTransporter,
  // Provinces
  getAllProvince,
  addProvince,
  updateProvince,
  deleteProvince,
  // Districts
  getAllDistrict,
  getAllActiveProvince,
  addDistrict,
  updateDistrict,
  deleteDistrict,
  // Corregimiento
  getAllCorregimiento,
  getAllActiveDistricts,
  addCorregimiento,
  updateCorregimiento,
  deleteCorregimiento,
  //^ Bookings
  getAllbookings,
  orderDetatils,
  // Dashboard
  getGeneral,
  graphData,
  // Payment system for driver
  getPaymentSystems,
  updatePaymentSystemStatus,
  // Est Booking Days
  getAllEstRanges,
  getActiveShipmentType,
  addEstDays,
  updateEstDays,
  deleteEstDays,
  // Address DBS
  getStructTypes,
  getProvince,
  getDistrict,
  getCorregimiento,
  createZipCode,
  bulkDBSData,
  // Notifications
  throwNot,
  getAllPushNot,
  resendNot,
  delNot,
  // Employees
  getAllEmployees,
  employeeDetail,
  activeRoles,
  addEmployee,
  employeeUpdate,
  employeeStatus,
  //& restricted items
  addRestrictedItem,updateRestrictedItem,changeStatusRestrictedItem,getRestrictedItem,deleteRestrictedItem,
  // Roles & Permissions
  allRoles,
  roleDetails,
  activeFeatures,
  addRole,
  updateRole,
  updateRoleStatus,
  //* Logistic companies
  getLogCompanies,
  addLogCompany,
  updateLogCompany,
  changeLogCompanyStatus,
  getChargesForLog,
  updateChargesForLog,
  addChargesForLog,
  updateStatusChargesForLog,
  deleteChargesForLog,
  //^ Web Policies
  getTermsConditions,
  updateTermsConditions,
  getPrivacyPolicy,
  updatePrivacyPolicy,
  activeLog,
  //homepage page

  homePage ,
  //Admin Get Bussiness User
  adminBussinessCheck,
  //Merchant Admin side
  merchantDashboard,
  registerMerchant,
  //=== Add Products, Categories and Subscategories
  createProductfromCSV,
  createProducts,
  createCategories,
  getCategories,
  Subcategories,
  getSubcategories,
  createBarCode,
  editProduct,
  getProducts,
  //====>Inbound and Outbound Orders
  createOrder,
  getCatandSubCatName,
  checktrackingNumber,
  allMerchants,
  createService
};
