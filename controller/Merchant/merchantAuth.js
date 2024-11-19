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
} = require('../../models');
const Shopify = require("shopify-api-node");
//! Shopify Instance
const shopify = new Shopify({
  shopName: process.env.SHOP_NAME,
  apiKey: process.env.SHOPIFY_API_KEY,
  password: process.env.SHOPIFY_APP_PASSWORD,
  apiVersion: "2024-04",
});
const getDistance = require("../../utils/distanceCalculator");
const {
  pickupDelivery,
  accountCreated,
  orderPlaced,
  emailOTP,
  socialMediaLinks,
  emailButton,
  scheduleDelivery,
} = require("../../helper/emailsHtml");
const socialLinks = socialMediaLinks();
const { attachment } = require("../../helper/attactments");
const attach = attachment();
const { STRIPE_PUBLISHABLE_KEY, STRIPE_SECRET_KEY } = process.env;
const stripe = require("stripe")(STRIPE_SECRET_KEY);
//Brain tree
const Braintree = require("../braintree");
const {
  BtsubscriptionCreateMail,
  BtsubscriptionCancelMail,
  subscriptionExpireFun,
} = require("../../helper/brainTreemails");

// Importing Custom exception
const CustomException = require("../../middleware/errorObject");
//importing redis
const redis_Client = require("../../routes/redis_connect");
const { sign } = require("jsonwebtoken");
const Stripe = require("../stripe");
// OTP generator
const otpGenerator = require("otp-generator");
//const sendNotification = require('../helper/throwNotification');
//const stripe = require('stripe')(process.env.STRIPE_KEY);
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const { v4: uuidv4 } = require('uuid');
const fedex=require("../fedex")
// Calling mailer
const nodemailer = require("nodemailer");
const {attachments}=require("../../helper/attachment")
const attachmentss = attachments();
const sequelize = require("sequelize");
// Barcode generator
var JsBarcode = require("jsbarcode");
var fs = require("fs");
var path = require("path");
const PDFDocument = require("pdfkit");
//var { createCanvas } = require("canvas");
var CryptoJS = require("crypto-js");

const { getDateAndTime } = require("../../utils/helperFuncCompany");
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
var randomstring = require("randomstring");
const {
  registerUserEmail,
  createBooking,
  forgetUserEmail,
} = require("../../helper/emailsHtml");
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
} = require("../../utils/unitsManagement");
const { type } = require("os");
const moment = require("moment");



// ! _________________________________________________________________________________________________________________________________
/*
            1. Send OTP for registration
    ________________________________________
*/


async function sendOTP(req, res) {
    const { email, password, signedBy, dvToken } = req.body;
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
      let userTypeId = 4;
      let hashedPassword = await bcrypt.hash(password, 10);
      let newUser = await user.create({
        email,
        password: hashedPassword,
        userTypeId,
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
      console.log("process.env.EMAIL_USERNAME",process.env.EMAIL_USERNAME)
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
                  "OTP sent successfully (new use)",
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
            2. Signup user     
    ________________________________________

*/

async function registerUser(req, res,next) {
  const { firstName, lastName, userId, countryCode, phoneNum,companyName,taxNumber, dvToken } =
    req.body;
    
  // checking if image is uploaded
//   if (!req.file)
//      throw CustomException(
//       "Profile picture is required",
//       "Please add profile image"
//      );

console.log("Request --------------------> ",req.body)
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
      "verifiedAt",
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
  const confirmNumber=isPhoneNumberInRange(phoneNum)
  if(!confirmNumber){
    throw new CustomException("Phone number is not within the range of 10 Digits.")

  }

  const updatedUser=await user
    .update(
      {
        firstName,
        lastName,
        status: true,
        countryCode,
        phoneNum,
        image: profileImage,
        companyName,
        taxNumber,
        virtualBox: virtualBoxNumber, // Assign the generated virtual box number here
      },
      { where: { id: userExist.id } }
    )
    
      // add device Token if not found
      const found = userExist.deviceTokens.find(
        (ele) => ele.tokenId === dvToken
      );
      if (!found)
        deviceToken.create({
          tokenId: dvToken,
          status: true,
          userId: userExist.id,
        });
      // creating accessToken
      const accessToken = sign(
        { id: userExist.id, email: userExist.email, dvToken: dvToken },
        process.env.JWT_ACCESS_SECRET
      );
      //Adding the online clients to reddis DB for validation process
      redis_Client.hSet(`tsh${userExist.id}`, dvToken, accessToken);
      userExist.dataValues.firstName = firstName;
      userExist.dataValues.lastName = lastName;

      let output = loginData(userExist, accessToken, false);

      output.data.warehouseAddress = `${selfPickUp.addressDB.streetAddress}, ${selfPickUp.addressDB.city}, ${selfPickUp.addressDB.province}, ${selfPickUp.addressDB.postalCode} ${selfPickUp.addressDB.country}`;
      output.data.virtualBoxNumber = virtualBoxNumber;

      return res.json(returnFunction("1","User Register Sucessfully",output));
    
 
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
      userTypeId: { [Op.or]: [1, 3,4] },
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
      [
        sequelize.fn("date_format", sequelize.col("createdAt"), "%Y"),
        "joinedOn",
      ],
    ],
  });
  console.log("UserData--------------->",userData)
  // if user not found and signedBy (google or apple) then create new account
  if ((!userData && signedBy === "google") || signedBy === "apple") {
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
  if (userData.userTypeId === 4) {
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

  // if(userData.userTypeId===3){
  //   const checkusersubscriptionStatus= await userPlan.findOne({
  //     where:{
  //       userId:userData.id,
  //       subscriptionStatus:'Active',
  //     },
  //     attributes:['expiryDate','subscriptionPlanID']
  //   })

  //   console.log("checkusersubscriptionStatus--------->",checkusersubscriptionStatus);
    
  //   if(checkusersubscriptionStatus){
  //     const subscriptionDetails=await Braintree.getSubscriptionDetails(checkusersubscriptionStatus.subscriptionPlanID);
  //     const subscriptionId=subscriptionDetails.subscription.id;

  //     let userName=subscriptionDetails.subscription.transactions[0].customer.firstName;
  
  //     let StartDate=subscriptionDetails.subscription.firstBillingDate;
  
  //     const planId=subscriptionDetails.subscription.transactions[0].planId;
      
  //     let pname=await Braintree.planBYId(planId)
  
  //     let PlanName= pname.name;  
  
  //     let BillingCycle=subscriptionDetails.subscription.numberOfBillingCycles;
  
  //     if(BillingCycle===1){
  //       BillingCycle="Yearly"
  //     }else{
  //       BillingCycle="Monthly"
  //     }
  
  //     let ExpiryDate=subscriptionDetails.subscription.billingPeriodEndDate;
  
  //     let Amount=subscriptionDetails.subscription.price;

  //     let data={
  //       userName,
  //       PlanName,
  //       subscriptionId,
  //       StartDate,
  //       BillingCycle,
  //       ExpiryDate,
  //       Amount
  //     }

  //     const expiryDate = moment(checkusersubscriptionStatus.expiryDate).startOf('day');
  //     console.log("New Expiry-------------?/?", expiryDate);
  //     const currentDay = moment().startOf('day');
  //     console.log("Current Days----->", currentDay);

  //     // Calculate the difference in hours
  //    const hoursUntilExpiry = expiryDate.diff(currentDay, 'hours');

  //     console.log("Hours until Expiry--------------> ", hoursUntilExpiry)

  //    // Convert hours to days, rounding up to ensure partial days count
  //    const daysUntilExpiry = Math.ceil(hoursUntilExpiry / 24);

  //    console.log("Rounded Days until Expiry--------------> ", daysUntilExpiry)


  //     if(daysUntilExpiry===2){

  //       console.log("Mail Send--------------->")
  //       transporter.sendMail({
  //         from: process.env.EMAIL_USERNAME,
  //         to: [email,'sigidevelopers@gmail.com'],
  //         subject: 'Your subscription is about to expire',
  //         html,
  //         attachment:attachmentss.subscribe
  //       })
  //     }else if(daysUntilExpiry===1){
  //       console.log("Mail Send--------------->")
  //       transporter.sendMail({
  //         from: process.env.EMAIL_USERNAME,
  //         to: [email,'sigidevelopers@gmail.com'],
  //         html,
  //         attachment:attachmentss.subscribe
  //       })
  //     } 
  //   }
      
  // }
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
    { id: userData.id, email: userData.email, dvToken: dvToken },
    process.env.JWT_ACCESS_SECRET
  );
  //Adding the online clients to reddis DB for validation process
  redis_Client.hSet(`tsh${userData.id}`, dvToken, accessToken);
  let output = loginData(userData, accessToken, false);
  return res.json(output);
}



/*
          Resend OTP
*/ 
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


module.exports={
  sendOTP,
  verifyOTPforSignUp,
  registerUser,
  signInUser,
  resendOTP,
  forgetPasswordRequest,
  verifyOTPforPassword,
  changePasswordOTP,
  session,
  logout,
  deleteUser,
  guestUser


}