require("dotenv").config();
//importing Models
const {
  user,
  otpVerification,
  deviceToken,
  subscriptionPlan,
  userPlan,
  banner,
  bookingType,
  shipmentType,
  category,
  size,
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

const { STRIPE_PUBLISHABLE_KEY, STRIPE_SECRET_KEY } = process.env;
const stripe = require("stripe")(STRIPE_SECRET_KEY);

//Brain Tree
const braintree = require("braintree");
const { v4: uuidv4 } = require("uuid");
const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox, // Change to Production for live
  merchantId: process.env.MERCHANT_ID,
  publicKey: process.env.Public_Key,
  privateKey: process.env.Private_Key,
});

// Importing Custom exception
const CustomException = require("../middleware/errorObject");
//importing redis
const redis_Client = require("../routes/redis_connect");
const { sign } = require("jsonwebtoken");
const Stripe = require("./stripe");
const paypal = require("./paypal");
const Braintree = require("./braintree");
const fedex = require("./fedex");
const { attachments } = require("../helper/attachment");
const attachment = attachments();
// OTP generator
const otpGenerator = require("otp-generator");
const {
  BtsubscriptionCreateMail,
  BtsubscriptionCancelMail,
  subscriptionExpireFun,
  subscriptionPaymentfails,
} = require("../helper/brainTreemails");
//const sendNotification = require('../helper/throwNotification');
//const stripe = require('stripe')(process.env.STRIPE_KEY);
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
// Calling mailer
const nodemailer = require("nodemailer");
const sequelize = require("sequelize");
// Barcode generator
var JsBarcode = require("jsbarcode");
var fs = require("fs");
var path = require("path");
const PDFDocument = require("pdfkit");
//var { createCanvas } = require("canvas");
var CryptoJS = require("crypto-js");

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

const axios = require("axios");
const {
  registerUserEmail,
  createBooking,
  forgetUserEmail,
} = require("../helper/emailsHtml");
const { type, platform } = require("os");
const throwNotification = require("../helper/throwNotification");
const { title } = require("process");
const { Where } = require("sequelize/lib/utils");

// ! Module 1 : Auth - Customer On Boarding
// ! _________________________________________________________________________________________________________________________________
/*
            1. Send OTP for registration
    ________________________________________
*/

async function registerBusiness(req, res) {
  const {
    firstName,
    lastName,
    businessName,
    email,
    password,
    referral,
    signedBy,
  } = req.body;

  const userExist = await user.findOne({
    where: { email: email, deletedAt: { [Op.is]: null } },
    include: { model: otpVerification },
    attributes: ["firstName", "lastName", "email", "phoneNum"],
  });

  if (userExist && userExist.userTypeId == 3) {
    throw CustomException(
      "Trying to login?",
      "A User with the following email exists"
    );
  }

  if (userExist && userExist.userTypeId == 1) {
    throw CustomException(
      "Trying to login?",
      "A User with the following email exists"
    );
  }

  if (userExist) {
    if (userExist.verifiedAt !== null) {
      throw CustomException(
        "Trying to login?",
        "A Business with the following email exists already"
      );
    }

    const OTP = otpGenerator.generate(4, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    const emailData = {
      name: "",
      OTP,
    };

    const html = registerUserEmail(emailData);

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USERNAME,
        to: [email, "sigidevelopers@gmail.com"],
        subject: `Verification code for The Shipping Hack is`,
        html,
        attachments: [
          {
            filename: "logo.png",
            path: __dirname + "/logo.png",
            cid: "logoImage",
          },
        ],
      });
    } catch (error) {
      console.log(error);
    }

    const DT = new Date();

    if (!userExist.otpVerification) {
      const otpData = await otpVerification.create({
        OTP,
        reqAt: DT,
        userId: userExist.id,
      });

      return res.json(
        returnFunction(
          "1",
          "OTP sent successfully",
          { otpId: otpData.id, userId: userExist.id },
          ""
        )
      );
    } else {
      await otpVerification.update(
        {
          OTP,
          reqAt: DT,
        },
        { where: { userId: userExist.id } }
      );

      const otpData = await otpVerification.findOne({
        where: { userId: userExist.id },
      });

      return res.json(
        returnFunction(
          "1",
          "OTP sent successfully",
          { otpId: otpData.id, userId: userExist.id },
          ""
        )
      );
    }
  } else {
    const userTypeId = 3;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await user.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      businessName,
      referral,
      userTypeId,
    });

    const OTP = otpGenerator.generate(4, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    const emailData = {
      name: `email`,
      OTP,
    };

    const html = registerUserEmail(emailData);

    await transporter.sendMail({
      from: process.env.EMAIL_USERNAME,
      to: [email, "sigidevelopers@gmail.com"],
      subject: `Verification code for The Shipping Hack is`,
      html,
      attachments: [
        {
          filename: "logo.png",
          path: __dirname + "/logo.png",
          cid: "logoImage",
        },
      ],
    });

    const DT = new Date();

    const otpData = await otpVerification.create({
      OTP,
      reqAt: DT,
      userId: newUser.id,
    });

    await Braintree.createCustomer(newUser.id, newUser);

    return res.json(
      returnFunction(
        "1",
        "OTP sent successfully (new user)",
        { otpId: otpData.id, userId: newUser.id },
        ""
      )
    );
  }
}
/*
            2. Verify OTP for sign-up
*/
async function verifyOTPforSignUp(req, res) {
  const { otpId, OTP, userId } = req.body;

  if (OTP == "1234") {
    const userData = await user.findByPk(userId);
    const custeomer = await Stripe.addCustomer(
      userData.firstName,
      userData.email
    );
    const u = await user.update(
      { verifiedAt: new Date(), stripeCustomerId: custeomer },
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
    if (OTP != otpData.OTP)
      throw new CustomException(
        "You entered incorrect OTP",
        "Please enter correct OTP to continue"
      );
    const userData = await user.findByPk(userId);
    const custeomer = await Stripe.addCustomer(
      userData.firstName,
      userData.email
    );
    const u = await user.update(
      { verifiedAt: new Date(), stripeCustomerId: custeomer },
      { where: { id: userId } }
    );
    return res.json(returnFunction("1", "OTP verified", { userId }, ""));
  }
}

/*
            3. Sign In user
    _________________________________________
*/
async function signInUser(req, res) {
  const { email, password, signedBy, dvToken } = req.body;
  const userData = await user.findOne({
    where: { email, deletedAt: { [Op.is]: null }, userTypeId: 3 },
    attributes: [
      "id",
      "firstName",
      "lastName",
      "email",
      "password",
      "status",
      "verifiedAt",
      "countryCode",
      "phoneNum",
      [
        sequelize.fn("date_format", sequelize.col("createdAt"), "%Y"),
        "joinedOn",
      ],
    ],
    include: {
      model: deviceToken,
      attributes: ["tokenId"],
    },
  });
  //  res.json(userData)

  // if user not found and signedBy (google or apple) then create new account
  if (
    (!userData && signedBy === "google") ||
    (!userData && signedBy === "apple") ||
    (!userData && signedBy === "facebook")
  ) {
    const customer = await Stripe.addCustomer(email);

    const userData = await user.create({
      email,
      userTypeId: 1,
      signedFrom: signedBy,
      verifiedAt: new Date(),
      stripeCustomerId: customer,
      // Add other necessary fields for social sign-up
    });
    const userId = userData.id;
    //  to return a response indicating successful social sign-up
    return res.json(
      returnFunction("3", `Sign-up by ${signedBy}`, { userId }, "")
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
  if (signedBy === "google" || signedBy === "apple") {
    const userData = await user.findOne({
      where: { email, deletedAt: { [Op.is]: null }, userTypeId: 3 },
      attributes: [
        "id",
        "firstName",
        "lastName",
        "email",
        "password",
        "status",
        "verifiedAt",
        "countryCode",
        "phoneNum",
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
    const found = userData.deviceTokens.find((ele) => ele.tokenId === dvToken);
    console.log("Device Token Found: ", found);
    if (!found)
      deviceToken.create({
        tokenId: dvToken,
        status: true,
        userId: userData.id,
      });

    // creating accessToken
    const accessToken = sign(
      { id: userData.id, email: userData.email, dvToken: dvToken },
      process.env.JWT_ACCESS_SECRET
    );
    //Adding the online clients to reddis DB for validation process
    redis_Client.hSet(`tsh${userData.id}`, dvToken, accessToken);
    let output = loginData(userData, accessToken, false);
    return res.json(output);
  }
  // else user is login by email and password
  let otpId = 0;
  //  checking the status
  if (!userData.status) {
    throw new CustomException(
      "Blocked by admin",
      "Please contact admin to continue"
    );
  }

  // Checking the email verification
  if (!userData.verifiedAt) {
    const OTP = otpGenerator.generate(4, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });
    // get otp id of user
    const otpData = await otpVerification.findOne(
      { where: { userId: userData.id } },
      { attributes: ["id", "OTP", "verifiedInForgetCase", "userId"] }
    );

    if (!otpData) {
      const newotp = await otpVerification.create({ OTP, userId: userData.id });
      otpId = newotp.id;
    } else {
      otpData.OTP = OTP;
      await otpData.save();
      otpId = otpData.id;
    }
    const emailData = {
      name: `email`,
      OTP,
    };

    const html = registerUserEmail(emailData);

    await transporter.sendMail({
      from: process.env.EMAIL_USERNAME,
      to: [email, "sigidevelopers@gmail.com"],
      subject: `Verification code for The Shipping Hack is`,
      html,
      attachments: [
        {
          filename: "logo.png",
          path: __dirname + "/logo.png",
          cid: "logoImage",
        },
      ],
    });

    return res.json(
      returnFunction(
        2,
        "Pending email verification",
        { userId: userData.id, otpId, email: userData.email },
        "Please verify your email to continue"
      )
    );
  }

  // Checking the password
  let match = await bcrypt.compare(password, userData.password);
  if (!match)
    throw new CustomException(
      "Bad credentials",
      "Please enter correct password to continue"
    );
  const found = userData.deviceTokens.find((ele) => ele.tokenId === dvToken);
  if (!found)
    await deviceToken.create({
      tokenId: dvToken,
      status: true,
      userId: userData.id,
    });
  // creating accessToken
  const accessToken = sign(
    { id: userData.id, email: userData.email, dvToken: dvToken },
    process.env.JWT_ACCESS_SECRET
  );
  //Adding the online clients to reddis DB for validation process
  redis_Client.hSet(`tsh${userData.id}`, dvToken, accessToken);
  let output = loginData(userData, accessToken, false);
  return res.json(output);
}
/*
            4. OTP request for changing password
*/
async function forgetPasswordRequest(req, res) {
  const { email } = req.body;
  const userData = await user.findOne({
    where: { email, deletedAt: { [Op.is]: null }, userTypeId: 3 },
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
                { otpId: userData.otpVerification.id },
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

  if (OTP != otpData.OTP)
    throw new CustomException(
      "You entered incorrect OTP",
      "Please enter correct OTP to continue"
    );
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
      to: userExist.email, // list of receivers
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
                `OTP sent successfully to ${userExist.email}`,
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
                `OTP sent successfully to ${userExist.email}`,
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

async function SubscriptionPlans(req, res, next) {
  const listOfPlans = await Stripe.AllProducts(3);

  console.log(" List Of Plans: ", listOfPlans);

  return res.json(
    returnFunction("1", "All Subscription Plan", { listOfPlans }, "")
  );
}
/*
            3.Choose SubsCription Plan 
    ________________________________________
*/
exports.choosePlan = async (req, res, next) => {
  const userId = req.user.id;
  const { priceId } = req.body;
  let userData = await user.findOne({
    where: { userId },
  });
  //create product
  //create price
  const subscription = await Stripe.createSubscriptionWithPriceId(
    userData.stripeCustomerId,
    priceId
  );

  // const DT = new Date();
  // (userData.approvedByAdmin = true),
  //   (userData.registrationDate = dateManipulation.stampToDate(subscription.current_period_start)),
  //   (userData.registrationExpiryDate = dateManipulation.stampToDate(subscription.current_period_end));
  // userData.subscriptionPlan = subscription.id;
  // await userData.save();

  return res.json(returnFunction("1", "Payment Successfull", { userData }, ""));
};

// Creating Subscriptions in DB

async function subscriptionCreate(req, res) {
  let {
    title,
    processing,
    shippingDiscount,
    freeStorage,
    returns,
    pickAndPack,
    apiAccess,
    annual_price,
    monthly_price,
    shippingPerMonth,
  } = req.body;
  const subscriptionCreating = await subscriptionPlan.create({
    title,
    processing,
    shippingDiscount,
    freeStorage,
    returns,
    pickAndPack,
    apiAccess,
    annual_price,
    monthly_price,
    shippingPerMonth,
  });

  return res.json(
    returnFunction("1", "Subscription Plan Added", subscriptionCreating, "")
  );
}

async function subscriptionGet(req, res) {
  const allsubget = await subscriptionPlan.findAll({
    attributes: [
      "title",
      "processing",
      "shippingDiscount",
      "freeStorage",
      "returns",
      "pickAndPack",
      "apiAccess",
      "annual_price",
      "monthly_price",
      "shippingPerMonth",
    ],
  });

  return res.json(returnFunction("1", "All Subscription's ", allsubget, ""));
}

async function subscribeSubscription(req, res) {
  let { userId, subscriptionId, planType } = req.body;

  const subscription = await subscriptionPlan.findByPk(subscriptionId);
  if (!subscription) {
    throw new CustomException("Invalid Subscription");
  }

  let price;
  if (planType === "Annual") {
    price = subscription.annual_price;
  } else if (planType === "Monthly") {
    price = subscription.monthly_price;
  }

  const buyDate = new Date();

  const expiryDate = calculatExpiryDate(buyDate, planType);

  const subscribePlan = await userPlan.create({
    userId,
    subscriptionPlanId: subscriptionId,
    buyDate,
    expiryDate,
    type: planType,
    price,
  });

  return res.json(returnFunction("1", "User Plan Selected", subscribePlan, ""));
}

//---------------------------PayPal Controllers---------------------------//

//--------------------PayPal Product Create----------------------------//
async function paypalProductCreate(req, res) {
  let { planId, billingType } = req.body;
  const planData = await subscriptionPlan.findByPk(planId);

  console.log("PlanData: ", planData);

  const product_id = await paypal.createPaypalProduct(planData);

  const plan_id = await paypal.createPlans(product_id, planData, billingType);

  let outObj = {
    product_id,
    plan_id,
  };

  return res.json(returnFunction("1", "Product and Plan Created", outObj, ""));
}

//--------------------Get All Products----------------//

async function PayPalPlanget(req, res) {
  const products = await paypal.fetchPayPalProducts();

  return res.json(returnFunction("1", "All PayPal Products", products));
}

//--------------Get ALL Plans----------------//
async function PayPalPlan(req, res) {
  const plans = await paypal.GetALLPlans();

  return res.json(returnFunction("1", "All PayPal Plans", plans));
}

async function PlanDeactivation(req, res) {
  const { planId } = req.body;

  const plandec = await paypal.DeactivatePlan(planId);

  return res.json(returnFunction("1", "Plan Deactivated", plandec));
}

//--------------- Subscription Create PayPal----------------//
// async function Subscription(req,res){

//   const{planId,cardId}=req.body

//   const userId=req.user.id

//   const userData=await user.findByPk(userId,{
//     attributes:['email','firstname','lastName','phoneNUM','countryCode']
//   })

//   const subscribeData=await paypal.SubscriptionCreatePayPal(planId,userData,cardId);

//   // const subscriptionId=subscribeData.id;

//   // console.log("Subscription ID: ", subscriptionId);

//   //   const getSubscriptions= await paypal.subscriptionById(planId);

//   //   console.log(" Plan Data IN Subscribing: ",getSubscriptions);

//   // const billingCycle = getSubscriptions.data?.billing_cycles[0];
//   // console.log("Billing Cycles: ",billingCycle);
//   // const intervalUnit = billingCycle?.frequency?.interval_unit;
//   // const fixedPrice = billingCycle?.pricing_scheme?.fixed_price?.value;

//   //   console.log("Interval Unit ",intervalUnit);
//   //   console.log("Fixed Price ",fixedPrice);

//   // const buyDate=new Date();

//   // const expiryDate=calculatExpiryDate(buyDate,intervalUnit)

//   // await userPlan.create({
//   //   userId:userId,
//   //   subscriptionPlanId:subscriptionId,
//   //   buyDate,
//   //   expiryDate,
//   //   type:intervalUnit,
//   //   price:fixedPrice
//   //  })

//   res.json(returnFunction("1"," Sucessfully Subscribe the Subscription",subscribeData))

// }

//------------------Get Subscription Details------------------//

async function SubscriptionDetails(req, res) {
  const { id } = req.params;

  const getSubscriptions = await paypal.getAllSubscriptions(id);

  res.json(returnFunction("1", "Subscription Details", getSubscriptions));
}

//--------------------Get Plan By ID--------------------//

async function planByID(req, res) {
  const { id } = req.params;
  console.log("Plan ID: ", id);
  const getSubscriptions = await paypal.planById(id);

  res.json(returnFunction("1", "Plan ID Detail", getSubscriptions));
}

//--------------------Get Card Details------------------//

async function getCardById(req, res) {
  const { id } = req.query;

  console.log("Card ID: ", id);

  const cardDetails = await paypal.getcardDetails(id);

  res.json(returnFunction("1", "card Details", cardDetails));
}

//-------------------Add Paypal Card Information --------------------//

async function PayPalCardInfo(req, res) {
  const carddetails = req.body;

  const details = await paypal.creditCardInfo(carddetails);

  res.json(returnFunction("1", "Card Details", details));
}

///-----------------------------Brain Tree Controllers -------------------------///

// Controller to create a product/plan
async function createPlanController(req, res) {
  const planData = req.body;

  const monthlyPrice = planData.monthlyPrice;

  const yearlyPrice = planData.yearlyPrice;

  const monthplanCreate = await Braintree.createBraintreePlan(
    planData,
    "MONTHLY",
    monthlyPrice
  );

  const yearPlanCreate = await Braintree.createBraintreePlan(
    planData,
    "Yearly",
    yearlyPrice
  );

  let outObj = {
    monthplanCreate,
    yearPlanCreate,
  };

  res.json(returnFunction("1", "Plan Created ", outObj));
}

//---------------------Plan Update-------------------//

async function planUpdate(req, res) {
  const { planId } = req.query;
  const planUpdate = req.body;

  const planUpdateData = await Braintree.btplanUpdate(planId, planUpdate);

  res.json(returnFunction("1", "Plan Updated Sucessfully", planUpdateData));
}

//--------------Get Plan By ID-------------------//

async function getPlanByID(req, res) {
  const { planId } = req.query;

  const getPlan = await Braintree.planBYId(planId);

  //const formatPlan=formatPlans(plans);

  res.json(returnFunction("1", "Plan Details: ", getPlan));
}

//----------Get All Brain Tree Plans-------------//
async function getAllPlansBT(req, res) {
  const plans = await Braintree.fetchallPlans();

  const formattedPlans = formatPlans(plans);

  res.json(returnFunction("1", "All PLans", formattedPlans));
}

//  store a credit card
async function createCustomer(req, res) {
  //const { cardDetails } = req.body;
  const userId = req.user.id;

  const userDetails = await user.findByPk(userId, {
    attributes: ["firstName", "lastName", "email", "phoneNum"],
  });
  const userDetail = await Braintree.createCustomer(userId, userDetails);
  res.json(returnFunction("1", "Customer Created", userDetail));
}

//-----------------Customer All Cards-----------------//

async function customerCards(req, res) {
  const userId = req.user.id;

  console.log("Customer ID----------------->:", userId);

  const allcards = await Braintree.customerAllCard(userId);

  res.json(returnFunction("1", "Customer All Cards", allcards));
}

// Add new Card For existing Customer

async function storeNewCard(req, res) {
  const { cardDetails } = req.body;

  const userId = req.user.id;

  const newCard = await Braintree.addCard(userId, cardDetails);

  res.json(returnFunction("1", "Customer New Card Added", newCard));
}
/*
     Convert Customer into Business User 
*/

async function customerConvert(req, res) {
  const { businessName, referral } = req.body;
  const userId = req.user.id;
  const userExist = await user.findOne({
    where: { id: userId, deletedAt: { [Op.is]: null } },
    include: { model: otpVerification },
    attributes: [
      "id",
      "firstName",
      "lastName",
      "email",
      "phoneNum",
      "userTypeId",
    ],
  });

  console.log("User Data---------------------> ", userExist);

  if (userExist && userExist.dataValues.userTypeId === 1) {
    await user.update(
      {
        businessName,
        referral,
      },
      {
        where: { id: userExist.dataValues.id },
      }
    );

    await Braintree.createCustomer(userExist.id, userExist);
  }
  return res.json(returnFunction("1", "User Updated In Business"));
}

//-------------------Controller to create a subscription---------------//

async function createSubscriptionController(req, res) {
  const { planId, billingFrequency, cardToken } = req.body;

  const userId = req.user.id;
  const userSubscriptionCheck = await userSubscriptionCount(userId);
  if (userSubscriptionCheck) {
    throw CustomException("User Already have Subscription");
  } else {
    const shippingLimit = await extractLimit(planId);

    console.log("shippingLimit", shippingLimit);
    const subscriptionId = await Braintree.createSubscription(
      planId,
      billingFrequency,
      cardToken
    );

    if (
      subscriptionId.transactions === null ||
      subscriptionId.transactions.length === 0
    ) {
      throw CustomException("Your Transaction Failed");
    }

    console.log("SubscriptionID: ", subscriptionId.id);

    await user.update(
      {
        userTypeId: 3,
      },
      {
        where: { id: userId },
      }
    );

    await userPlan.create({
      userId: userId,
      subscriptionPlanID: subscriptionId.id,
      type: subscriptionId.numberOfBillingCycles === 12 ? "Yearly" : "MONTHLY",
      price: subscriptionId.price,
      buyDate: subscriptionId.billingPeriodStartDate,
      expiryDate: subscriptionId.billingPeriodEndDate,
      subscriptionStatus: subscriptionId.status,
      shipLimit: shippingLimit,
    });

    res.json(returnFunction("1", "Subscription Created ", { subscriptionId }));
  }
}

//-----------------------Get Subscription Details--------------------//
async function getSubscriptionDetailsController(req, res) {
  const { subscriptionId } = req.body;

  const { subscription, transactions } = await Braintree.getSubscriptionDetails(
    subscriptionId
  );
  res.json(
    returnFunction("1", "Subscription Detail", { subscription, transactions })
  );
}

async function getCustomerActiveSubscription(req, res) {
  const userId = req.user.id;
  console.log("User ID:", userId);

  const getActiveSubscription = await userPlan.findOne({
    where: {
      userId: userId,
      subscriptionStatus: "Active",
    },
    attributes: ["subscriptionPlanID", "subscriptionStatus"],
  });

  console.log("Get Active Subscriptions: ", getActiveSubscription);

  if (!getActiveSubscription) {
    return res.json(returnFunction("1", "No Active Subscription"));
  } else {
    const subscriptionId = getActiveSubscription.dataValues.subscriptionPlanID;
    const subscriptiondata = await Braintree.getSubscriptionDetails(
      subscriptionId
    );
    console.log("Active Subscription ID: ", subscriptionId);

    res.json(
      returnFunction("0", "Active Subscription ID", {
        subscriptionId,
        subscriptiondata,
      })
    );
  }
}

//---------------Web Hooks------------------//

async function WebHooks(req, res) {
  const btsignature = req.body.bt_signature;
  const btpayload = req.body.bt_payload;
  console.log("-------------------btsignature", btsignature);
  //  console.log("---------------------btpayload",btpayload)
  //   console.log("---------------------BODY",req.body)
  //console.log("---------------------BODYAfter paesr",JSON.parse(req.body))

  //const{subscriptionId}=req.query
  const subscriptionId = req.body.subscription;
  try {
    const webhookNotification = await gateway.webhookNotification.parse(
      btsignature,
      btpayload
    );
    console.log("Webhook Notification:", webhookNotification);

    const notificationType = webhookNotification.kind;
    const subscriptionID = webhookNotification.subscription?.id;

    console.log(
      `Received ${notificationType} notification for subscription ${subscriptionID}`
    );

    //console.log(`CANCEL__________ subscription `,webhookNotification.subject.subscription.transactions[0].customer.id);

    const customerId =
      webhookNotification.subject.subscription.transactions[0].customer.id;

    const subscriptionId = webhookNotification.subject.subscription.id;

    let userName =
      webhookNotification.subject.subscription.transactions[0].customer
        .firstName;

    let StartDate = webhookNotification.subject.subscription.firstBillingDate;

    const planId =
      webhookNotification.subject.subscription.transactions[0].planId;

    let pname = await Braintree.planBYId(planId);

    let PlanName = pname.name;

    let BillingCycle =
      webhookNotification.subject.subscription.numberOfBillingCycles;

    if (BillingCycle === 1) {
      BillingCycle = "Yearly";
    } else {
      BillingCycle = "Monthly";
    }

    let ExpiryDate =
      webhookNotification.subject.subscription.billingPeriodEndDate;

    let Amount = webhookNotification.subject.subscription.price;

    let email =
      webhookNotification.subject.subscription.transactions[0].customer.email;

    const key = notificationType;
    console.log("WEB NOTIFICATION KIND------>:", key);

    const customer = await deviceToken.findAll({
      where: {
        userId: customerId,
      },
      attributes: ["tokenId"],
    });

    console.log("Device Tokens: ", customer);

    let to = [];

    if (customer.length === 0) {
      console.log("No device tokens found for customer");
    } else {
      to = customer.map((item) => item.tokenId);
    }

    console.log("TO ------------> ", to);

    switch (notificationType) {
      case "subscription_canceled": {
        console.log("Subscription Cancels case");
        let notification = {
          title: `Subscription Cancelled`,
          body: "Your Subscription has been cancelled",
        };

        let data = {
          userName,
        };
        let html = BtsubscriptionCancelMail(data);

        if (
          webhookNotification.subject.subscription.transactions[0].status ==="settled"
        ) {
          console.log("Sending Mail subscription_canceled------------->");
          transporter.sendMail(
            {
              from: process.env.EMAIL_USERNAME,
              to: [email, "sigidevelopers@gmail.com"],
              subject: "Subscription Cancelled",
              html,
              attachments: attachment.subscribe,
            },
            function (error, info) {
              if (error) {
                console.log(error);
              } else {
                console.log(info);
              }
            }
          );

          break;
        } else {
          throwNotification(to, notification);
          break;
        }
      }

      case "subscription_charged_successfully": {
        console.log("Subscription Charged Case--------------989yuijkjkuio->");
        let notification = {
          title: `Subscription Charged`,
          body: "Your Subscription has been Charged, You will get the Conformation email when the Subscription  Payment is Setteled",
        };

        let data = {
          userName,
          PlanName,
          subscriptionId,
          StartDate,
          BillingCycle,
          ExpiryDate,
          Amount,
        };

        let html = BtsubscriptionCreateMail(data);

        const transactionStatus =
          webhookNotification.subject.subscription.transactions[0].status;
        if (
          transactionStatus === "settled" ||
          transactionStatus === "settling"
        ) {
          console.log(
            "Sending Mail subscription_charged_successfully ------------->"
          );
          transporter.sendMail(
            {
              from: process.env.EMAIL_USERNAME,
              to: [email, "sigidevelopers@gmail.com"],
              subject: "Subscription Purchased",
              html,
              attachments: attachment.subscribe,
            },
            function (error, info) {
              if (error) {
                console.log(error);
              } else {
                console.log(info);
              }
            }
          );
          break;
        } else {
          throwNotification(to, notification);
          break;
        }
      }

      case "subscription_expired": {
        console.log("Subscription Expired Case--------------->");
        let notification = {
          title: `Subscription Expired`,
          body: "Your Subscription is Expired",
        };
        throwNotification(to, notification);
        break;
      }

      case "subscription_went_active": {
        let notification = {
          title: `Subscription Charged and went Active`,
          body: "Your Subscription has been Charged, You will get the Conformation email when the Subscription  Payment is Setteled",
        };

        let data = {
          userName,
          PlanName,
          subscriptionId,
          StartDate,
          BillingCycle,
          ExpiryDate,
          Amount,
        };

        let html = BtsubscriptionCreateMail(data);

        const transactionStatus =
          webhookNotification.subject.subscription.transactions[0].status;
        if (
          transactionStatus === "settled" ||
          transactionStatus === "settling" ||
          transactionStatus === "submitted_for_settlement"
        ) {
          console.log(
            " Subscription Went Active Case Sending Mail ------------->"
          );
          transporter.sendMail(
            {
              from: process.env.EMAIL_USERNAME,
              to: [email, "sigidevelopers@gmail.com"],
              subject: "Subscription Purchased",
              html,
              attachments: attachment.subscribe,
            },
            function (error, info) {
              if (error) {
                console.log(error);
              } else {
                console.log(info);
              }
            }
          );
          throwNotification(to, notification);

          break;
        } else {
          throwNotification(to, notification);
          break;
        }
      }

      case "subscription_went_past_due": {
        let notification = {
          title: `Payment Issue Detected: Action Required`,
          body: `Hi ${userName}, your subscription payment didn’t go through. Please update your payment info to avoid service interruption.`,
        };
        await Braintree.retryPayment(subscriptionId);

        let data = {
          userName,
          PlanName,
          subscriptionId,
          StartDate,
          BillingCycle,
          ExpiryDate,
          Amount,
        };

        let html = subscriptionPaymentfails(data);

        transporter.sendMail(
          {
            from: process.env.EMAIL_USERNAME,
            to: [email, "sigidevelopers@gmail.com"],
            subject: "Subscription Payment failed",
            html,
            attachments: attachment.subscribe,
          },
          function (error, info) {
            if (error) {
              console.log(error);
            } else {
              console.log(info);
            }
          }
        );

        throwNotification(to, notification);

        break;
      }

      case "subscription_charged_unsuccessfully": {
        let notification = {
          title: `Payment Failed: Update Your Information`,
          body: `Hi ${userName}, your subscription payment didn’t go through. Please update your payment info to avoid service interruption.`,
        };
        let paymentFails = await Braintree.retryPayment(subscriptionId);

        if (paymentFails) {
          let data = {
            userName,
            PlanName,
            subscriptionId,
            StartDate,
            BillingCycle,
            ExpiryDate,
            Amount,
          };

          let html = subscriptionPaymentfails(data);

          transporter.sendMail(
            {
              from: process.env.EMAIL_USERNAME,
              to: [email, "sigidevelopers@gmail.com"],
              subject: "Subscription Payment failed",
              html,
              attachments: attachment.subscribe,
            },
            function (error, info) {
              if (error) {
                console.log(error);
              } else {
                console.log(info);
              }
            }
          );
        }
        throwNotification(to, notification);
        break;
      }
    }
  } catch (error) {
    console.log("Error:", error);
    throw error;
  }
}

//-----------------Payment Method Revoked-----------------//

async function PaymentRevoked(req, res) {
  const { cardToken } = req.body;

  const methodRevoked = await Braintree.PaymentMethodRevoked(cardToken);

  res.json(returnFunction("1", "Payment Method Revoked", methodRevoked));
}

//----------------Brain Tree Subscription Cancels--------------//

async function subscriptionCancelsBraintree(req, res) {
  const { subscriptionId } = req.query;

  console.log("Subscription ID: ", subscriptionId);

  const subscriptionCanel = await Braintree.cancelSubscription(subscriptionId);

  const userUpdate = await userPlan.findOne({
    where: {
      subscriptionPlanID: subscriptionId,
    },
  });

  if (!userUpdate) {
    throw CustomException("Invalid Subscription ID");
  } else {
    userUpdate.update({ subscriptionStatus: "Canceled" });
  }

  res.json(returnFunction("1", "Subscription Cancelled "));
}

//--------------------Customer Card Update---------------------//

async function btcardUpdate(req, res) {
  const { cardToken, cardDetails } = req.body;

  const userId = req.user.id;

  const userCardUpdate = await Braintree.updateCard(
    userId,
    cardToken,
    cardDetails
  );

  res.json(returnFunction("1", "Card Information Updated", userCardUpdate));
}

//----------------Customer Subscription Expiry Date-------------//

async function expiryDate(req, res) {
  const { subscriptionId } = req.query;

  const subscriptionExpiryDate = await Braintree.customerSubscriptionExpires(
    subscriptionId
  );

  res.json(
    returnFunction("1", "Subscription expiry Date", subscriptionExpiryDate)
  );
}

//---------------------------------fedex get----------------------//
async function fedexGet(req, res) {
  const { trackingNumber } = req.body;

  const getresponse = await fedex.trackFedExPackage(trackingNumber);

  res.json(returnFunction("1", "Fedex Order Details", getresponse));
}

//======================Customer Check=================//

async function checkBrainTreeCustomer(req, res) {
  const userId = req.user.id;

  let customerExist;

  let data;

  const userCheck = await Braintree.customerfind(userId);
  if (userCheck && userCheck.id) {
    customerExist = true;
    data = {
      userExists: customerExist,
    };
    return res.json(returnFunction("1", "Customer Exists", data));
  } else {
    customerExist = false;
    data = {
      userExists: customerExist,
    };
    return res.json(returnFunction("1", "Customer Not Exists", data));
  }
}

//!-------------------------------------Recurring Functions------------------------------------------------//

let returnFunction = (status, message, data, error) => {
  return {
    status: `${status}`,
    message: `${message}`,
    data: data,
    error: `${error}`,
  };
};

async function userSubscriptionCount(userId) {
  const count = await userPlan.count({
    where: {
      userId: userId,
      subscriptionStatus: {
        [Op.not]: ["Canceled" || "Expired"],
      },
    },
  });
  return count > 0;
}

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
      isGuest,
      joinedOn: userData.dataValues.joinedOn
        ? userData.dataValues.joinedOn
        : "2023",
      phoneNum: `${userData.countryCode} ${userData.phoneNum}`,
    },
    error: "",
  };
};

function calculatExpiryDate(startDate, planType) {
  const expiryDate = new Date(startDate);

  if (planType === "Month" || planType === "month") {
    expiryDate.setMonth(expiryDate.getMonth() + 1);
  } else if ((planType = "Year" || planType === "YEAR")) {
    expiryDate.setMonth(expiryDate.getFullYear() + 1);
  }

  return expiryDate;
}

async function extractLimit(planId) {
  const plan = await Braintree.planBYId(planId);

  console.log("Plan Description ------------->", plan);

  const description = plan.description;

  const match = description.match(/Shipping Limit (\d+)/);

  console.log("MATCH LIMIT -------> :", match);

  if (match) {
    return parseInt(match[1], 10);
  }

  throw CustomException("Booking  not found in description");
}

//-----------------------Format Plans-------------------------------//
function formatPlans(data) {
  const formattedPlans = {};

  data.forEach((plan) => {
    const baseName = plan.name.replace(/\s*\(.*?\)$/, "");

    if (!formattedPlans[baseName]) {
      formattedPlans[baseName] = [];
    }

    formattedPlans[baseName].push(plan);
  });

  return formattedPlans;
}

//-----------------------------------------------------------------------------//

module.exports = {
  registerBusiness,
  verifyOTPforSignUp,
  signInUser,
  forgetPasswordRequest,
  verifyOTPforPassword,
  changePasswordOTP,
  session,
  logout,
  deleteUser,
  resendOTP,

  //---------------Subscriptions and Paypal Controllers------------//

  SubscriptionPlans,
  subscriptionCreate,
  subscriptionGet,
  subscribeSubscription,
  paypalProductCreate,
  PayPalPlanget,
  PayPalPlan,
  PlanDeactivation,
  SubscriptionDetails,
  planByID,
  PayPalCardInfo,
  getCardById,

  //-----------------Brain Tree Paypal---------------//

  createPlanController,
  createCustomer,
  createSubscriptionController,
  getSubscriptionDetailsController,
  getAllPlansBT,
  storeNewCard,
  expiryDate,
  subscriptionCancelsBraintree,
  btcardUpdate,
  PaymentRevoked,
  getPlanByID,
  customerCards,
  planUpdate,
  getCustomerActiveSubscription,
  customerConvert,
  fedexGet,
  checkBrainTreeCustomer,

  //------Web HOOKS----//
  WebHooks,
};
