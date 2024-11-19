require("dotenv").config();
//importing Models
const {
  user,
  otpVerification,
  deviceToken,
  vehicleImage,
  banner,
  postponedOrder,
  bookingType,
  shipmentType,
  category,
  size,
  baseUnits,
  addressDBS,
  bank,
  paymentRequests,
  onGoingOrder,
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
const getDistance = require("../utils/distanceCalculator");
// Importing Custom exception
const CustomException = require("../middleware/errorObject");
//importing redis
const redis_Client = require("../routes/redis_connect");
const { sign } = require("jsonwebtoken");
// OTP generator
const otpGenerator = require("otp-generator");
//const sendNotification = require('../helper/throwNotification');
//const stripe = require('stripe')(process.env.STRIPE_KEY);
const bcrypt = require("bcrypt");
const { Op, where, or } = require("sequelize");
// Calling mailer
const nodemailer = require("nodemailer");
const sequelize = require("sequelize");
const sendNotification = require("../helper/throwNotification");
const { default: axios } = require("axios");
const {
  registerUserEmail,
  accountCreated,
  orderPlaced,
  emailOTP,
  socialMediaLinks,
  emailButton,
  scheduleDelivery,
} = require("../helper/emailsHtml");
const socialLinks = socialMediaLinks();
const { attachment } = require("../helper/attactments");
const deliveredMail = require("../helper/orderDelivery");
const attach = attachment();
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

let dt = Date.now();
let DT = new Date(dt);
let currentDate = `${DT.getFullYear()}-${DT.getMonth() + 1}-${DT.getDate()}`;
let currentTime = `${DT.getHours()}:${DT.getMinutes()}:${DT.getSeconds()}`;

function sortJobs(jobs, jobType) {
  const currentTime = new Date();
  const twoHoursInMilliseconds = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

  // Split jobs into two arrays: jobs with less than 2 hours left and other jobs
  let urgentJobs = [];
  let otherJobs = [];

  // jobs.forEach((job) => {
  //   const jobTime = jobType === 'pickup' ? job.pickupEndTime : job.dropoffEndTime;
  //   const jobDate = jobType === 'pickup' ? job.pickupDate : job.pickupDate;
  //   const jobEndTime = new Date(`${jobDate}T${jobTime}`);

  //   if (timeLeft < twoHoursInMilliseconds) {
  //     urgentJobs.push({ ...job, timeLeft });
  //   } else {
  //     otherJobs.push({ ...job, timeLeft });
  //   }
  // });

  // Sort urgent jobs by time left in ascending order
  // urgentJobs.sort((a, b) => a.timeLeft - b.timeLeft);

  // Sort other jobs by distance in ascending order
  otherJobs.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

  // Combine the two sorted arrays
  let sortedJobs = [...urgentJobs, ...otherJobs];
  for (const ele of sortedJobs) {
    ele.distance = `${ele.distance} mi`;
    delete ele.distanceUnit;
  }
  return sortedJobs;
}

//! function for calculating Total Weight, Total Dimenssional Weight and charged weight
async function calculateWeights(packages, divisor) {
  let weight = 0;
  let dimensionalWeight = 0;
  let chargedWeight = 0;

  for (let index = 0; index < packages.length; index++) {
    let package = packages[index];
    let Weightcharges = 0;
    let billableWeight;

    weight += Number(package.actualWeight);
    dimensionalWeight += Number(package.actualVolume) / divisor;

    if (package.actualWeight > package.actualVolume / divisor) {
      billableWeight = Number(package.actualWeight);
    } else if (
      Number(package.volume) / divisor >
      Number(package.actualWeight)
    ) {
      billableWeight = Math.ceil(Number(package.volume / divisor));
    }

    chargedWeight += Number(billableWeight);
  }
  return { weight, dimensionalWeight, chargedWeight };
}
// ! Module 1 : Auth - Driver On Boarding
// ! _________________________________________________________________________________________________________________________________
/*
            1. Register Step 1 (basic info)
    ________________________________________
*/

async function testNot(req, res) {
  to = ['e5xmBsHUS8-S9blHFD2fJE:APA91bHttueWSCtTrmD68MzaK-rBD7GA2rbViHukLZNCh3lJz55zWJ6f9iBiFSVKy3I1dLLuN2MlaHbeGcLQSkZ5vWw0mH3t6ZkcXPvNis4abzIZ8tPnkhVU-ys4fVjzsHO42oen2WJL'];
  let notification = {
    title: `Driver Cancel job`,
    body: `Your Order  has been canceled by Driver`,
  };
  sendNotification(to, notification);
  return res.json("Hello Notification")
}
async function registerStep1(req, res) {
  const { firstName, lastName, email, countryCode, phoneNum, password } =
    req.body;
  // check if user with same eamil and phoneNum exists
  const userExist = await user.findOne({
    where: {
      [Op.or]: [
        { email: email },
        { [Op.and]: [{ countryCode: countryCode }, { phonenum: phoneNum }] },
      ],
      deletedAt: { [Op.is]: null },
    },
  });
  if (userExist && userExist.userTypeId == 1) {
    throw CustomException(
      "Try to login",
      "A Customer with the follwoing email exists "
    );
  }
  //return res.json(userExist)
  if (userExist) {
    if (email === userExist.email && userExist.verifiedAt !== null)
      throw new CustomException(
        "Users exists",
        "The email you entered is already taken"
      );
    else if (phoneNum === userExist.phoneNum && userExist.verifiedAt !== null) {
      throw new CustomException(
        "Users exists",
        "The phone number you entered is already taken"
      );
    }
    const OTP = otpGenerator.generate(4, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    const emailData = {
      name: ``,
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
    if (!userExist.otpVerification) {
      const otpData = await otpVerification.create({
        OTP,
        reqAt: DT,
        userId: userExist.id,
      });

      let outObj = {
        userId: `${userExist.id}`,
        image: `${userExist.image}`,
        firstName: `${userExist.firstName}`,
        lastName: `${userExist.lastName}`,
        email: `${userExist.email}`,
        phoneNum: `${userExist.countryCode} ${userExist.phoneNum}`,
        accessToken: ``,
        joinOn: DT,
      };
      return res.json(
        returnFunction("1", "Registration Step 1: Completed", outObj, "")
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
      let outObj = {
        userId: `${userExist.id}`,
        image: `${userExist.image}`,
        firstName: `${userExist.firstName}`,
        lastName: `${userExist.lastName}`,
        email: `${userExist.email}`,
        phoneNum: `${userExist.countryCode} ${userExist.phoneNum}`,
        accessToken: ``,
        joinOn: DT,
      };
      return res.json(
        returnFunction("1", "Registration Step 1: Completed", outObj, "")
      );
    }
  } else {
    let hashedPassword = await bcrypt.hash(password, 10);
    let newUser = await user.create({
      firstName,
      lastName,
      email,
      countryCode,
      phoneNum,
      status: true,
      password: hashedPassword,
      userTypeId: 2,
      registeredBy: "self",
    });

    if (typeof req.files.profileImage !== "undefined") {
      let tmpprofileImage = req.files.profileImage[0].path;
      let profileImageName = tmpprofileImage.replace(/\\/g, "/");
      let userUpdate = await user.update(
        { image: profileImageName },
        { where: { id: newUser.id } }
      );
    }

    newUser = await user.findOne({ where: { id: newUser.id } });

    //let output = loginData(newUser, '')
    const otpData = await otpVerification.findOne({
      where: { userId: newUser.id },
    });
    // generating OTP
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
        //if(err) throw new CustomException('Error sending email',`${err}`)
        console.log(info);
        let DT = new Date();
        if (!otpData) {
          otpVerification.create({
            OTP,
            reqAt: DT,
            userId: newUser.id,
          });
        } else {
          otpVerification.update(
            {
              OTP,
              reqAt: DT,
            },
            { where: { userId: newUser.id } }
          );
        }
      }
    );
    let outObj = {
      userId: `${newUser.id}`,
      image: `${newUser.image}`,
      firstName: `${firstName}`,
      lastName: `${lastName}`,
      email: `${email}`,
      phoneNum: `${countryCode} ${phoneNum}`,
      accessToken: ``,
      joinOn: DT,
    };
    return res.json(
      returnFunction("1", "Registration Step 1: Completed", outObj, "")
    );
  }
}
/*
            2. Verify OTP
*/
async function verifyOTP(req, res) {
  const { OTP, userId } = req.body;
  const otpData = await otpVerification.findOne({ where: { userId } });
  if (!otpData)
    throw new CustomException(
      "OTP Data not available",
      "Please try sending OTP again"
    );
  // TODO update the condition
  if (otpData.OTP != OTP && OTP !== "1234")
    throw new CustomException(
      "Invalid OTP",
      "Please enter correct OTP to continue"
    );
  await user.update({ verifiedAt: Date.now() }, { where: { id: userId } });
  return res.json(
    returnFunction("1", "OTP verified successfully", { userId }, "")
  );
}
/*
            3. Get vehicle types
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
            4. Register Step 2(Vehicle data)
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

  if (!req.files.length)
    throw new CustomException("Images not uploaded", "Please upload images");
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
    await driverDetail.update(
      {
        vehicleMake,
        vehicleModel,
        vehicleYear,
        vehicleColor,
        driverTypeId: 1,
        vehicleTypeId,
      },
      { where: { id: detailsExist.id } }
    );
    // Removing the previous vehicle images and adding the new ones
    let imgStatus = await vehicleImage.update(
      { status: false },
      { where: { userId } }
    );
    vehicleImage.bulkCreate(imagesArr);
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
    driverTypeId: 1,
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

async function uploadVehImages(req, res) {
  const userId = req.user.id;

//return res.json(vehimages);
  if (!req.files)
    throw new CustomException("Images not uploaded", "Please upload images");

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
  await vehicleImage.bulkCreate(imagesArr);

  return res.json(returnFunction("1", "Vehicle Images Uploaded", "", ""));
}
/*
            5. Register Step 2(License Info)
    ________________________________________
*/
async function registerStep3(req, res) {
  const { licIssueDate, licExpiryDate, userId, dvToken } = req.body;
  console.log("ðŸš€ ~ registerStep3 ~  req.body:",  req.body)
  const userData = await user.findOne({
    where: { id: userId },
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
      "image",
      [
        sequelize.fn("date_format", sequelize.col("user.createdAt"), "%Y"),
        "joinedOn",
      ],
    ],
  });
  console.log("ðŸš€ ~ registerStep3 ~ userData:", userData)
  //return res.json(req.files)
  let tmpLicFrontImage = req.files.frontImage[0].path;
  let licFrontImage = tmpLicFrontImage.replace(/\\/g, "/");
  let tmpLicBackImage = req.files.backImage[0].path;
  let licBackImage = tmpLicBackImage.replace(/\\/g, "/");
  await driverDetail.update(
    { licIssueDate, licExpiryDate, licFrontImage, licBackImage },
    { where: { userId } }
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
  const requ = await axios.get(
    "https://theshippinghack-default-rtdb.firebaseio.com/ShippingHack_driver/" +
      `${userData.id}` +
      ".json"
  );
  let online_status = false;
  if (requ.data != null) {
    online_status = true;
  }
  let output = loginData(userData, accessToken, online_status, dvToken);
  return res.json(output);
}

async function uploadLic(req, res) {
  const userId = req.user.id;
  //return res.json(req.files)

  // ! Why 2 queries for update when it can be done with a single query

  if (typeof req.files.frontImage !== "undefined") {
    let tmpLicFrontImage = req.files.frontImage[0].path;
    let licFrontImage = tmpLicFrontImage.replace(/\\/g, "/");
    await driverDetail.update({ licFrontImage }, { where: { userId } });
  }

  if (typeof req.files.backImage !== "undefined") {
    let tmpLicBackImage = req.files.backImage[0].path;
    let licBackImage = tmpLicBackImage.replace(/\\/g, "/");
    await driverDetail.update({ licBackImage }, { where: { userId } });
  }

  return res.json(returnFunction("1", "Licence Images Uploaded", "", ""));
}
/*
            6. Login driver
*/
async function login(req, res) {
  const { email, password, dvToken } = req.body;
  let online_status = false;
  const userData = await user.findOne({
    where: { email, deletedAt: { [Op.is]: null } },
    include: [
      { model: deviceToken, attributes: ["tokenId"] },
      { model: driverDetail },
    ],
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
      "userTypeId",
      "image",
      [
        sequelize.fn("date_format", sequelize.col("user.createdAt"), "%Y"),
        "joinedOn",
      ],
    ],
  });
  //user.update({dvToken: dvToken}, {where: {id: userData.id}})
  // if user not found
  if (!userData){
    throw new CustomException(
      "User not found",
      "No user exists against this email"
    )}else if (userData && userData.userTypeId == 1) {
    throw CustomException(
      "The follwoing email belongs to Customer!",
      "Try to login on Customer App"
    );
  }
  // Checking the password
  let match = await bcrypt.compare(password, userData.password);
  if (!match)
    throw new CustomException(
      "Bad credentials",
      "Please enter correct password to continue"
    );
  // Checking the email verification --> statusCode 2
  if (!userData.verifiedAt)
    return res.json(
      returnFunction(
        "2",
        "Pending email verification",
        loginDataForLogin(userData, "accessToken", online_status, dvToken),
        ""
      )
    );
  // checking Vehicle Data  --> statusCode 3
  let checkVehicle = userData.driverDetail
    ? userData.driverDetail.vehicleTypeId
      ? true
      : false
    : false;
  if (!checkVehicle)
    return res.json(
      returnFunction(
        "3",
        "Pending vehicle Data",
        loginDataForLogin(userData, "accessToken", online_status, dvToken),
        ""
      )
    );
  // checking License Data  --> statusCode 4
  let checkId = userData.driverDetail
    ? userData.driverDetail.licIssueDate
      ? true
      : false
    : false;
  if (!checkId)
    return res.json(
      returnFunction(
        "4",
        "Pending License Data",
        loginDataForLogin(userData, "accessToken", online_status, dvToken),
        ""
      )
    );
  //  checking the status
  if (!userData.status)
    throw new CustomException(
      "Blocked by admin",
      "Please contact admin to continue"
    );
  // Checking user status
  const requ = await axios.get(
    "https://theshippinghack-default-rtdb.firebaseio.com/ShippingHack_driver/" +
      `${userData.id}` +
      ".json"
  );
  if (requ.data != null) {
    online_status = true;
  }
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
  console.log("ACCESS-TOKEN=======================>",accessToken);
  //Adding the online clients to reddis DB for validation process
  redis_Client.hSet(`tsh${userData.id}`, dvToken, accessToken);
  let output = loginData(userData, accessToken, online_status, dvToken);
  return res.json(output);
}
/*
            7. OTP request for changing password
*/
async function forgetPasswordRequest(req, res) {
  const { email } = req.body;
  const userData = await user.findOne({
    where: { email, deletedAt: { [Op.is]: null }, userTypeId: 2 },
    include: { model: otpVerification, attributes: ["id"] },
    attributes: ["id"],
  });
  // user not found
  if (!userData)
    throw new CustomException(
      "Invalid information",
      "No user exists against this email"
    );
  let OTP = otpGenerator.generate(5, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
  //return res.json(OTP)
  let html = emailOTP(`${OTP}`, socialLinks, "forget");
  transporter.sendMail(
    {
      from: process.env.EMAIL_USERNAME, // sender address
      to: email, // list of receivers
      subject: `Forget password verification code`, // Subject line
      html,
      attachments: attach.otp,
    },
    function (err, info) {
      //if(err) throw new CustomException('Error sending email',`${err}`)
      //console.log(info);
      let DT = new Date();
      if (userData.otpVerification != null) {
        otpVerification
          .update(
            {
              OTP,
              reqAt: DT,
            },
            { where: { userId: userData.id } }
          )
          .then((otpData) =>
            res.json(
              returnFunction(
                "1",
                `OTP sent successfully to ${email}`,
                {
                  otpId: userData.otpVerification.id,
                  userId: userData.id ?? "",
                },
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
            OTP,
            reqAt: DT,
            userId: userData.id,
          })
          .then((otpData) =>
            res.json(
              returnFunction(
                "1",
                `OTP sent successfully to ${email}`,
                { otpId: otpData.id, userId: userData.id ?? "" },
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
            8. Verify OTP for changing password
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
  //console.log(OTP, otpData.OTP)
  // TODO Update the OTP condition
  if (OTP != otpData.OTP && OTP !== "12345")
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
            9. Change password in response to OTP
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
async function changePassword(req, res) {
  const userId = req.user.id;
  const { password } = req.body;
  const userData = await user.findByPk(userId, {
    attributes: ["id", "password"],
  });
  let hashedPassword = await bcrypt.hash(password, 10);
  userData.password = hashedPassword;
  await userData.save();
  return res.json(
    returnFunction("1", "Password updated successfully.", {}, "")
  );
}
/*
            10. Resend OTP
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

/*
            11. Check session
*/
async function session(req, res) {
  const userId = req.user.id;
  console.log("ÃƒÂ°Ã…Â¸Ã…Â¡Ã¢â€šÂ¬ ~ file: driver.js:416 ~ session ~ userId:", userId);
  // only get those users which are not deleted
  const userData = await user.findOne({
    where: { deletedAt: { [Op.is]: null }, id: userId },
    attributes: [
      "id",
      "firstName",
      "lastName",
      "email",
      "status",
      "countryCode",
      "phoneNum",
      "deletedAt",
      "image",
      [
        sequelize.fn("date_format", sequelize.col("createdAt"), "%Y"),
        "joinedOn",
      ],
    ],
  });
  if (!userData)
    return res.json(
      returnFunction(
        3,
        "Account does not exist",
        {},
        "Please create account to continue"
      )
    );
  // send status = 3 when blocked but not deleted
  if (!userData.status)
    return res.json(
      returnFunction(
        4,
        "You are blocked by Admin",
        {},
        "Please contact support for more information"
      )
    );
  //const accessToken = sign({id: userData.id, email: userData.email, dvToken: "dvToken" }, process.env.JWT_ACCESS_SECRET);
  const accessToken = req.header("accessToken");
  const requ = await axios.get(
    "https://theshippinghack-default-rtdb.firebaseio.com/ShippingHack_driver/" +
      `${userData.id}` +
      ".json"
  );
  let online_status = false;
  if (requ.data != null) {
    online_status = true;
  }
  let output = loginData(userData, accessToken, online_status, "");
  return res.json(output);
}
/*
            12. Log out  
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
    .hDel(`${req.user.id}`, req.user.dvToken)
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
            13. Delete User  
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
              13, // Reached (Pickup)
              15, // Reached at Delivery Point(pickup)
              16, // Pickedup From warehouse(pickup)
              17, // ongoing start Ride (Delivery)
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
      message: "Driver has Bookings",
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

// ! Module 2 : Home
// ! _________________________________________________________________________________________________________________________________

/*
            1. Home & order handling
*/
async function homePageApi(req, res) {
  const userId = req.user.id;

  // get available bookings of current day
  const driverData = await driverDetail.findOne({
    where: { userId },
    attributes: [
      "approvedByAdmin",
      "licExpiryDate",
      "vehicleTypeId",
      "driverTypeId",
    ],
  });
  const cDate = new Date();
  let dt = `${cDate.getFullYear()}-${cDate.getMonth() + 1}-${cDate.getDate()}`;

  let idExpired =
    Date.parse(driverData.licExpiryDate) > Date.parse(dt) ? false : true;
  //console.log(idExpired)
  if (idExpired)
    return res.json(
      returnFunction(
        "1",
        "Home Page",
        {
          approvedByAdmin: driverData.approvedByAdmin,
          idExpired,
          dropoffJobs: [],
        },
        ""
      )
    );
  dt = "";
  const vehicleData = await vehicleType.findByPk(driverData.vehicleTypeId, {
    attributes: ["weightCapacity", "volumeCapacity", "appUnitId"],
  });

  //return res.json(dt)
  let dropoffBookingData = await getBookings(dt, userId);

  // return res.json(dropoffBookingData)
  // Filtering on the basis of capacities
  let dropoffJobs = await filterBookingsOnCapacity(
    dropoffBookingData,
    vehicleData.weightCapacity,
    vehicleData.volumeCapacity,
    "dropoff",
    userId
  );

  let outObj = {
    approvedByAdmin: driverData.approvedByAdmin,
    idExpired,
    dropoffJobs,
  };
  return res.json(returnFunction("1", "Home Page", outObj, ""));
}

/*
            2. Get jobs by date filter
*/

async function jobsByDateFilter(req, res) {
  const userId = req.user.id;
  let { date } = req.body;
  const driverData = await driverDetail.findOne({
    where: { userId },
    attributes: ["vehicleTypeId", "driverTypeId"],
  });
  console.log("driverData====================>",driverData)
   const dt = date ? moment(date).format("YYYY-MM-DD") : "";
  const vehicleData = await vehicleType.findByPk(driverData.vehicleTypeId, {
    attributes: ["weightCapacity", "volumeCapacity"],
  });
  console.log("vehicleData====================>",vehicleData)

  let dropoffBookingData = await getBookings(dt, userId);

  console.log("dropoffBookingData================================================>",dropoffBookingData);
  // Filtering on the basis of capacities
  let dropoffJobs = await filterBookingsOnCapacity(
    dropoffBookingData,
    vehicleData.weightCapacity,
    vehicleData.volumeCapacity,
    "dropoff",
    userId
  );
  let outObj = {
    dropoffJobs: dropoffJobs,
  };
  return res.json(returnFunction("1", "Jobs by filter", outObj, ""));
}

/*
            3. Get all jobs associated with the driver
*/
async function allAssociatedJobs(req, res) {
  const driverId = req.user.id;
  // const driverId = 71;
  const bookingData = await booking.findAll({
    //!modified
    where: {
      deliveryDriverId: driverId,
      bookingStatusId: { [Op.or]: [13, 15, 16, 17] },
    },
    include: [
      { model: package, include: { model: category, attributes: ["title"] } },
      {
        model: warehouse,
        as: "deliveryWarehouse",
        include: {
          model: addressDBS,
          attributes: [
            "id",
            "postalCode",
            "lat",
            "lng",
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
        attributes: ["id"],
      },
      { model: bookingType, attributes: ["title"] },
      { model: bookingStatus, attributes: ["id", "title"] },
      {
        model: addressDBS,
        as: "dropoffAddress",
        attributes: [
          "postalCode",
          "lat",
          "lng",
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
    ],
    attributes: [
      "id",
      "trackingId",
      "weight",
      "length",
      "width",
      "height",
      "volume",
      "bookingStatusId",
    ],
  });
  //  return res.json(bookingData)
  let outGoingSingle = [],
    outGoingGroup = [],
    assignedDelivery;
  let filterBooking;
  let pickuped = [];
  if (bookingData) {
    //!modified
    //Picked deliveries
    pickuped = await bookingData.filter((ele) => ele.bookingStatusId == 16);
    let driverLocation = await axios.get(
      "https://theshippinghack-default-rtdb.firebaseio.com/ShippingHack_driver/" +
        `${driverId}` +
        ".json"
    );
    let findDist = false;
    (driverLat = ""), (driverLng = "");
    if (driverLocation.data != null) {
      driverLat = driverLocation.data.lat;
      driverLng = driverLocation.data.lng;
      findDist = true;
    }
    await Promise.all(
      pickuped.map(async (ele) => {
        let { earning } = await getDriverEarning(ele.id, driverId, "delivery");
        let driverDistance = (await getDistance(
          driverLat,
          driverLng,
          ele.dropoffAddress.lat,
          ele.dropoffAddress.lng
        ))
          ? await getDistance(
              driverLat,
              driverLng,
              ele.dropoffAddress.lat,
              ele.dropoffAddress.lng
            )
          : "N/A";

        ele.dataValues.earning = String(earning);
        ele.dataValues.distance = String(driverDistance);
        await ele.save();
      })
    );
    // Assigned Deliveries
    assignedDelivery = await bookingData.filter(
      (ele) => ele.bookingStatusId == 13
    );
    filterBooking = await filterBookings(assignedDelivery, driverId);

    // Ongoing (group and single)
    const onGoingData = await onGoingOrder.findAll({
      //!modified
      where: { userId: driverId, ordersStatus: 17 },
    });
    // return res.json(onGoingData)
    onGoingData.map((ele) => {
      let ordersInGroup = ele.orderNumbers
        .split(",")
        .map((num) => parseInt(num))
        .map((num) => parseInt(num));
      console.log(ordersInGroup);
      // Ongoing -- status is 12
      if (ele.ordersStatus == 17) {
        let currArr = bookingData.filter((ele) =>
          ordersInGroup.includes(ele.id)
        );
        // checking if single
        if (ordersInGroup.length === 1) {
          outGoingSingle = currArr;
        } else
          outGoingGroup.push({
            groupId: ele.id,
            date: ele.date,
            orderNumbers: ele.orderNumbers,
            sequence: ele.sequence,
            status: ele.status,
            orderCount: ordersInGroup.length,
            warehouse:
              currArr.length != 0
                ? currArr[0].dataValues.deliveryWarehouse
                : {},
          });
      }
    });
    // Condition Ends Here
  }
  let deliveryJobs = {
    assigned: filterBooking,
    ongoing: { group: outGoingGroup, single: outGoingSingle },
    // picked: {'group':outPickedGroup,'single':outPickedSingle},
    picked: pickuped,
  };
  return res.json(returnFunction("1", "Job Pool", { deliveryJobs }, ""));
}
/*
            4. Cancel a booking
*/
// TODO Cancelled on delivery side (api missing)
async function cancelled(req, res) {
  const driverId = req.user.id;
  // const driverId = 10;
  const { bookingId } = req.body;

  const bookingData = await booking.findOne({
    where: { id: bookingId },
    attributes: ["id", "total", "trackingId", "customerId", "bookingStatusId"],
  });
  //  return res.json(bookingData)
  if (!bookingData)
    throw new CustomException("Booking Not Found", "Request booking not found");

  if (bookingData.bookingStatusId == 19) {
    return res.json(returnFunction("1", "Booking Already canceled", {}, ""));
  }
  if (bookingData.bookingStatusId == 13 || bookingData.bookingStatusId == 14) {
    // update single booking
    let dt = Date.now();
    let DT = new Date(dt);
    let currentDate = `${DT.getFullYear()}-${
      DT.getMonth() + 1
    }-${DT.getDate()}`;
    let currentTime = `${DT.getHours()}:${DT.getMinutes()}:${DT.getSeconds()}`;

    // pickup case

    // let type = bookingData.bookingStatusId == 2 ? 'pickup':'dropoff';

    const history = await bookingHistory.findOne({
      where: {
        bookingId: bookingId,
        bookingStatusId: bookingData.bookingStatusId,
      },
    }); // history data to be delted
    await booking.update(
      { bookingStatusId: 19, receivingDriverId: null },
      { where: { id: bookingId } }
    ); //  update booking staus to createed and driver id to null
    await cancelledBooking.create({
      bookingId,
      userId: driverId,
      acceptDate: history.date,
      acceptTime: history.time,
      cancelDate: currentDate,
      cancelTime: currentTime,
    }); //cretae history

    // const onGoing = await onGoingOrder.findOne({
    //     where: { orderNumbers: {[Op.or]:[{ [Op.like]: bookingId },{ [Op.like]: bookingId+',%' },{ [Op.like]: '%,'+bookingId+',%' },{ [Op.like]: '%,'+bookingId }]}  , userId:driverId }
    // });

    // const [ordersString, sequenceString] = [onGoing.orderNumbers, onGoing.sequence];
    // const [orders, sequence] = [ordersString.split(",").map(Number),sequenceString.split(",").map(Number)];
    // if(orders.length  === 1 ){
    //     await onGoing.destroy({where:{id:onGoing.id}})
    // }else{
    //     const [updatedOrders, updatedSequence] = [orders.filter((num) => num != bookingId),sequence.filter((num) => num != bookingId)];

    //     const updatedOrdersString = updatedOrders.join(",");
    //     const updatedSequenceString = updatedSequence.join(",");

    //     await onGoing.update({orderNumbers:updatedOrdersString,sequence:updatedSequenceString},{where:{id:onGoing.id}})
    // }

    await bookingHistory.destroy({ where: { id: history.id } }); // delete accepted booking history of that booking

    // create bookingHistory
    // TODO How calculate driver penality

    // await wallet.create({
    //     amount: (bookingData.total *0.025),
    //     bookingId:bookingData.id,
    //     userId:driverId,
    //     description:"Driver Cancelled"
    // });

    let customer = await deviceToken.findAll({
      where: { userId: bookingData.customerId },
      attributes: ["tokenId"],
    });
    to = customer.map((item) => item.tokenId);
    let notification = {
      title: `Driver Cancel job`,
      body: `Your Order ${bookingData.trackingId} has been canceled by Driver`,
    };
    sendNotification(to, notification);
    return res.json(returnFunction("1", "Booking canceled", "", ""));
  } else {
    throw new CustomException("You can not cancel jobs at this stage.", ""); // 2 is accepted in pickup case & 10 accepted in delivery
  }
}
/*
            5. Get reason for postponing a booking
*/
async function getReasons(req, res) {
  return res.json(
    returnFunction("1", "Reasons List", await reason.findAll(), "")
  );
}
/*
            6. Postpone a booking
*/
async function postponedBooking(req, res) {
  const userId = req.user.id;
  const { groupId, reasonid, reasonDesc } = req.body;

  let ongoing = await onGoingOrder.findOne({ where: { id: groupId } });
  let orders = ongoing.orderNumbers.split(",");

  let bookings = await booking.findAll({ where: { id: orders } });

  let newBookings = "";

  bookings.forEach((element) => {
    if (element.bookingStatusId == 16) {
      newBookings = newBookings + `${element.id}` + ",";
    } else {
      booking.update(
        {
          bookingStatusId: 12, // order created
          receivingDriverId: null,
        },
        { where: { id: element.id } }
      );

      postponedOrder.create({
        reasonId: reasonid,
        reasonDesc,
        bookingId: element.id,
        userId: userId,
      });
    }
  });

  if (newBookings.length > 1) {
    await onGoingOrder.update(
      {
        orderNumbers: newBookings,
        sequence: newBookings,
        ordersStatus: 16, // picked
      },
      { where: { id: groupId } }
    );
  } else {
    await onGoingOrder.destroy({ where: { id: groupId } });
  }
  return res.json(returnFunction("1", "Bookings Postponed", "", ""));
}

// ! Sub Module 2.1 : Pickup side
// ! _________________________________________________________________________________________________________________________________

/*
            1. Job Details
*/
async function bookingDetailsById(req, res) {
  const driverId = req.user.id;
  const { bookingId } = req.body;
  const bookingData = await booking.findByPk(bookingId, {
    include: [
      {
        model: addressDBS,
        as: "dropoffAddress",
        attributes: [
          "postalCode",
          "lat",
          "lng",
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
        model: warehouse,
        as: "deliveryWarehouse",
        include: {
          model: addressDBS,
          attributes: [
            "postalCode",
            "lat",
            "lng",
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
        attributes: ["id"],
      },
      { model: shipmentType, attributes: ["title"] },
      {
        model: package,
        include: [
          { model: category, attributes: ["title"] },
          { model: ecommerceCompany, attributes: ["title"] },
        ],
      },
      {
        model: user,
        as: "customer",
        attributes: ["id", "firstName", "lastName", "countryCode", "phoneNum"],
      },
    ],
    attributes: [
      "trackingId",
      "senderName",
      "senderPhone",
      "weight",
      "length",
      "width",
      "height",
      "receivingDriverId",
      "deliveryDriverId",
      "bookingStatusId",
      "consolidation",
      "customerId",
      "appUnitId",
      "instruction",
    ],
  });
  // return res.json(bookingData)
  if (!bookingData.customerId) {
    bookingData.customer = {
      id: 0,
      firstName: `${bookingData.senderName}`,
      lastName: "",
      countryCode: "",
      phoneNum: `${bookingData.senderPhone}`,
      dvToken: "hkhkhkhkhkhkhkhkhkhk",
    };
  } else {
    let customerDvs = await deviceToken.findOne({
      where: { userId: bookingData.customerId },
    });
    //return res.json(customerDvs)
    // Calculating remaining time
    // var now = new Date(Date.now());
    // var end = new Date(bookingData.pickupDate + " " + bookingData.pickupEndTime);
    // if(now < end){
    //     var difference = end - now;
    // }
    // else{
    //     var difference = 0;
    // }
    // time in seconds
    // var secondsDifference = Math.floor(difference/1000);
    // adding device token to customer object
    bookingData.dataValues.customer.dataValues.dvToken =
      customerDvs == null ? "" : customerDvs.tokenId;
    // calculating distance from pickup to warehouse
  }

  let driver_earning = 0;
  let driver_id = null;
  let orderLat = 0;
  let orderLng = 0;

  let requ = {};
  let online_status = false;
  let driver_distance = 0;

  if (
    bookingData.bookingStatusId == "12" ||
    bookingData.bookingStatusId == "13" ||
    bookingData.bookingStatusId == "14" ||
    bookingData.bookingStatusId == "15" ||
    bookingData.bookingStatusId == "16"
  ) {
    driver_earning = await getDriverEarning(
      bookingId,
      bookingData.deliveryDriverId ? bookingData.deliveryDriverId : driverId,
      "delivery"
    );
    driver_id = bookingData.deliveryDriverId
      ? bookingData.deliveryDriverId
      : driverId;
    orderLat = bookingData.dropoffAddress.lat;
    orderLng = bookingData.dropoffAddress.lng;
  }

  if (driver_id != null) {
    requ = await axios.get(
      "https://theshippinghack-default-rtdb.firebaseio.com/ShippingHack_driver/" +
        `${driver_id}` +
        ".json"
    );
    if (requ.data != null) {
      online_status = true;
      console.log(requ.data.lat, requ.data.lng, orderLat, orderLng);
      driver_distance = await getDistance(
        requ.data.lat,
        requ.data.lng,
        orderLat,
        orderLng
      );
      console.log(driver_distance);
    }
  } else {
    requ = await axios.get(
      "https://theshippinghack-default-rtdb.firebaseio.com/ShippingHack_driver/" +
        `${req.user.id}` +
        ".json"
    );
    if (requ.data != null) {
      online_status = true;
      console.log(requ.data.lat, requ.data.lng, orderLat, orderLng);
      driver_distance = await getDistance(
        requ.data.lat,
        requ.data.lng,
        orderLat,
        orderLng
      );
      console.log(driver_distance);
    }
  }
  console.log(` eEEEEEERERERERER ${typeof driver_earning}`);
  let Packages = [];
  bookingData.packages.map((package) => {
    let items = {
      weight: package.actualWeight,
      length: package.actualLength,
      width: package.actualWidth,
      height: package.actualHeight,
      instruction: package.note,
      category: package.category.title,
      company: package.ecommerceCompany.title,
    };
    Packages.push(items);
  });

  let outObj = {
    bookingId,
    trackingId: bookingData.trackingId,
    pickupCode: `${bookingData.deliveryWarehouse.addressDB.postalCode}`,
    PickUpPoint: `${bookingData.deliveryWarehouse.addressDB.streetAddress}, ${bookingData.deliveryWarehouse.addressDB.city}, ${bookingData.deliveryWarehouse.addressDB.province}, ${bookingData.deliveryWarehouse.addressDB.postalCode} ${bookingData.deliveryWarehouse.addressDB.country}`,
    dropoffPoint: `${bookingData.dropoffAddress.streetAddress}, ${bookingData.dropoffAddress.city}, ${bookingData.dropoffAddress.province}, ${bookingData.dropoffAddress.postalCode}, ${bookingData.dropoffAddress.country}`,
    PickUPLat: bookingData.deliveryWarehouse.addressDB.lat,
    PickUPLng: bookingData.deliveryWarehouse.addressDB.lng,
    dropoffLat: bookingData.dropoffAddress.lat,
    dropoffLng: bookingData.dropoffAddress.lng,
    weight: bookingData.weight,
    length: bookingData.length,
    width: bookingData.width,
    height: bookingData.height,
    dropoffCode: `${bookingData.dropoffAddress.postalCode} `,
    distance: `${driver_distance}`,
    consolidation: bookingData.consolidation,
    earning: `$${driver_earning.earning}`, //TODO removed driver_earning.earning
    customer: bookingData.customer,
    Packages,
  };
  return res.json(returnFunction("1", "Booking Details", outObj, ""));
}

/*
            3. Change pickup jobs status to Ongoing
*/
async function pJobsToOngoing(req, res) {
  const { bookingIds } = req.body;
  let driverId = req.user.id;
  // check if the driver already have ongoing bookings
  // const oldBookingData = await booking.findAll({
  //     where:{ deliveryDriverId: driverId ,bookingStatusId: 17}
  // });
  // if(oldBookingData.length > 0) throw new CustomException('Ask the Warehouse to confirm package handed Over to Driver', 'You already have onging Bookings');

  let bookingData = await booking.findAll({
    where: { id: bookingIds },
    include: [
      {
        model: user,
        as: "customer",
        include: { model: deviceToken, attributes: ["tokenId"] },
        attributes: ["id"],
      },
      {
        model: warehouse,
        as: "deliveryWarehouse",
        include: { model: addressDBS, attributes: ["lat", "lng"] },
      },
    ],
    attributes: ["id", "trackingId", "pickupEndTime", "pickupDate"],
  });

  // change status to OngoingPickup
  await booking.update({ bookingStatusId: 17 }, { where: { id: bookingIds } });

  // filtering the bookings and throwing notifications
  //const validWindowBooking = bookingData.filter(booking => validWindow.includes(booking.id));
  // adding to history
  let dt = Date.now();
  let DT = new Date(dt);
  let currentDate = `${DT.getFullYear()}-${DT.getMonth() + 1}-${DT.getDate()}`;
  let currentTime = `${DT.getHours()}:${DT.getMinutes()}:${DT.getSeconds()}`;
  let historyData = bookingData.map((ele) => {
    let tmpObj = {
      date: currentDate,
      time: currentTime,
      bookingId: ele.id,
      bookingStatusId: 17,
    };
    return tmpObj;
  });
  await bookingHistory.bulkCreate(historyData);
  //Adding to Ongoing Orders
  let retData = await onGoingOrder.create({
    orderNumbers: bookingIds.toString(),
    date: currentDate,
    sequence: bookingIds.toString(),
    status: true,
    userId: driverId,
    ordersStatus: 17,
    type: "delivery",
    isSet: false,
  });
  bookingData.map((ele) => {
    let to = ele.customer.deviceTokens.map((ele) => {
      return ele.tokenId;
    });
    let notification = {
      title: `Booking # ${ele.trackingId} status update`,
      body: "Our rider is on his way",
    };
    sendNotification(to, notification);
  });
  //}
  return res.json(
    returnFunction("1", "Order status updated", { groupId: retData.id }, "")
  );
}

/*
            6. Picked from customer
*/
async function picked(req, res) {
  const driverId = req.user.id;
  const { bookingId } = req.body;

  const bookingStatus = 16; // Picked(pickup)

  await booking.update(
    { bookingStatusId: bookingStatus },
    {
      where: { id: bookingId },
    }
  );

  // create bookingHistory
  let dt = Date.now();
  let DT = new Date(dt);
  let currentDate = `${DT.getFullYear()}-${DT.getMonth() + 1}-${DT.getDate()}`;
  let currentTime = `${DT.getHours()}:${DT.getMinutes()}:${DT.getSeconds()}`;
  // await bookingHistory.create({date: currentDate, time: currentTime, bookingId, bookingStatusId: bookingStatus});
  let historyData = bookingId.map(async (ele) => {
    await bookingHistory.create({
      date: currentDate,
      time: currentTime,
      bookingId: ele,
      bookingStatusId: bookingStatus,
    });
    // let tmpObj = {
    //     date: currentDate,
    //     time: currentTime,
    //     bookingId: ele,
    //     bookingStatusId: bookingStatus
    // };
    // return tmpObj;
  });
  // await  bookingHistory.bulkCreate(historyData);

  return res.json(returnFunction("1", "Booking Updated", {}, ""));
}

// ! Sub Module 2.2 : delivery side
// ! _________________________________________________________________________________________________________________________________

/*
            2. Assign Job to Driver
*/
async function bookJobDelivery(req, res) {
  const driverId = req.user.id;
  const { bookingId } = req.body;

  const bookingStatus = 13; // Accepted (Delivery)

  const bookingData = await booking.findOne({
    where: { id: bookingId },
    attributes: ["id", "trackingId"],
    include: [
      {
        model: user,
        as: "customer",
        attributes: ["id", "firstName", "lastName", "countryCode", "phoneNum"],
        include: [
          {
            model: deviceToken,
          },
        ],
      },
    ],
  });

  if (!bookingData)
    throw new CustomException("Booking Not Found", "Request booking not found");

  // const onGoing = await onGoingOrder.findOne({
  //     where: { orderNumbers: { [Op.like]: '%'+bookingId+'%' } }
  // });

  // update single booking
  await booking.update(
    {
      bookingStatusId: bookingStatus,
      deliveryDriverId: driverId,
    },
    {
      where: { id: bookingId },
    }
  );

  // create bookingHistory
  let dt = Date.now();
  let DT = new Date(dt);
  let currentDate = `${DT.getFullYear()}-${DT.getMonth() + 1}-${DT.getDate()}`;
  let currentTime = `${DT.getHours()}:${DT.getMinutes()}:${DT.getSeconds()}`;
  await bookingHistory.create({
    date: currentDate,
    time: currentTime,
    bookingId,
    bookingStatusId: bookingStatus,
  });

  if (bookingData.customer === null) {
    // TODO: send email to sender/receiver
  } else {
    let to = bookingData.customer.deviceTokens.map((ele) => {
      return ele.tokenId;
    });
    let notification = {
      title: `Booking # ${bookingData.trackingId} accepted by rider`,
      body: "Your parcel will soon be delivered to you",
    };
    sendNotification(to, notification);
  }

  return res.json(returnFunction("1", "Job Booked", "", ""));
}

/*
            5. Group Details
*/
async function groupDetailDelivery(req, res) {
  const { groupId } = req.body;
  const driverId = req.user.id;
  //const driverId = 50;
  const groupData = await onGoingOrder.findOne({
    where: { id: groupId },
  });
  const orderNums = groupData.orderNumbers.split(",");
  const bookingData = await booking.findAll({
    where: { id: orderNums },
    include: [
      { model: bookingStatus, attributes: ["id", "title"] },
      {
        model: addressDBS,
        as: "dropoffAddress",
        attributes: [
          "id",
          "postalCode",
          "lat",
          "lng",
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
    ],
    attributes: ["id", "trackingId"],
  });
  if (groupData.isSet) {
    let tmpArr = groupData.sequence.split(",");
    let sortingArr = tmpArr.map((ele) => {
      return parseInt(ele);
    });

    // Sorting the data on th basis of sequence
    let sortedarr = bookingData.sort(
      (a, b) => sortingArr.indexOf(a.id) - sortingArr.indexOf(b.id)
    );
    return res.json(returnFunction("1", "All group orders", sortedarr, ""));
  } else {
    // Creating a sequence using algorithm
    //getting drivers live location
    const driverData = await axios.get(
      "https://theshippinghack-default-rtdb.firebaseio.com/ShippingHack_driver/" +
        `${driverId}` +
        ".json"
    );
    if (!driverData.data)
      throw CustomException(
        "Driver live location not available",
        "Please go online and try again"
      );
    const driverLat = driverData.data.lat;
    const driverLng = driverData.data.lng;
    let unSortedBookings = bookingData.map((ele) => {
      return {
        bookingId: ele.id,
        lat: parseFloat(ele.dropoffAddress.lat),
        lng: parseFloat(ele.dropoffAddress.lng),
        dropOffPoint: ele.dropoffAddress,
      };
    });
    let route = await optimizeRoute(unSortedBookings, driverLat, driverLng);
    if (route.length === 0)
      throw CustomException(
        "No route found for this group",
        "Please try again"
      );
    //return res.json(route)
    // get sort array from route
    let sortingArr = route.map((ele) => {
      return parseInt(ele.bookingId);
    });
    // updating the sequence
    await onGoingOrder.update(
      { sequence: sortingArr.toString(), isSet: true },
      { where: { id: groupId } }
    );
    // Sorting the data on th basis of sequence
    let sortedarr = bookingData.sort(
      (a, b) => sortingArr.indexOf(a.id) - sortingArr.indexOf(b.id)
    );
    return res.json(
      returnFunction("1", "All group orders(w/a)", sortedarr, "")
    );
  }
}
/*
            6. Reached at delivery Point
*/
async function reachedDelivery(req, res) {
  const { bookingId } = req.body;
  const bookingStatus = 15; // Reached (Delivery)
  const bookingData = await booking.findOne({
    where: { id: bookingId },
    attributes: ["id"],
  });

  if (!bookingData)
    throw new CustomException("Booking Not Found", "Request booking not found");

  // update single booking
  await booking.update(
    {
      bookingStatusId: bookingStatus,
      // receivingDriverId: null
    },
    {
      where: { id: bookingId },
    }
  );

  // create bookingHistory
  let dt = Date.now();
  let DT = new Date(dt);
  let currentDate = `${DT.getFullYear()}-${DT.getMonth() + 1}-${DT.getDate()}`;
  let currentTime = `${DT.getHours()}:${DT.getMinutes()}:${DT.getSeconds()}`;
  await bookingHistory.create({
    date: currentDate,
    time: currentTime,
    bookingId,
    bookingStatusId: bookingStatus,
  });
  return res.json(
    returnFunction("1", "Driver Reached at Delivery Point", "", "")
  );
}
/*
            7. Delivered
*/
async function deliveredDelivery(req, res) {
  const { bookingId } = req.body;
  // const { signatureFile } = req.files;
  if (!bookingId)
    throw new CustomException("Booking Id Required", "Booking Required");
  const bookingStatus = 18; // Delivered

  let bookingData = await booking.findOne({
    where: { id: bookingId },
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
      {
        model: user,
        as: "customer",
        attributes: ["firstName", "email"],
      },

      { model: logisticCompany, attributes: ["title", "divisor"] },
      {
        model: package,
        attributes: ["arrived", "actualWeight", "actualVolume"],
      },
      // {model: warehouse, as: 'receivingWarehouse', attributes: ['id']}
    ],
    attributes: [
      "id",
      "deliveryDriverId",
      "receiverName",
      "receiverEmail",
      "createdAt",
      "consolidation",
      "trackingId",
      "total",
    ],
  });
  if (!bookingData)
    throw new CustomException("Booking Not Found", "Request booking not found");
  // update single booking
  await booking.update(
    {
      bookingStatusId: bookingStatus,
    },
    {
      where: { id: bookingId },
    }
  );

  const ongoing = await onGoingOrder.findOne({
    where: {
      [Op.and]: [
        {
          orderNumbers: {
            [Op.regexp]: `^${bookingId}$|^${bookingId},|,${bookingId},|,${bookingId}$`,
          },
        },
        {
          ordersStatus: 17, // Ongoing(delivery)
        },
      ],
    },
  });
  if (ongoing != null && ongoing.orderNumbers.split(",").length > 0) {
    const bookings = await booking.findAll({
      where: {
        id: ongoing.orderNumbers.split(","),
        bookingStatusId: bookingStatus,
      },
    });
    if (bookings.length == ongoing.orderNumbers.split(",").length) {
      await onGoingOrder.update(
        {
          ordersStatus: bookingStatus,
        },
        {
          where: {
            [Op.and]: [{ id: ongoing.id }],
          },
        }
      );
    }
  }

  // update billing detail for delivery driver
  let { earning } = await getDriverEarning(
    bookingId,
    bookingData.deliveryDriverId,
    "delivery"
  );
  await billingDetails.update(
    { deliveryDriverEarning: earning },
    { where: { bookingId } }
  );

  // create bookingHistory
  let dt = Date.now();
  let DT = new Date(dt);
  let currentDate = `${DT.getFullYear()}-${DT.getMonth() + 1}-${DT.getDate()}`;
  let currentTime = `${
    DT.getHours() + 5
  }:${DT.getMinutes()}:${DT.getSeconds()}`;
  await bookingHistory.create({
    date: currentDate,
    time: currentTime,
    bookingId,
    bookingStatusId: bookingStatus,
  });

  // let tmpsignature = req.files.signatureFile[0].path;
  let tmpsignature = req.file.path;
  let signatureImage = tmpsignature.replace(/\\/g, "/");
  await booking.update(
    { signatureImage, deliveredAt: DT, status: false },
    { where: { id: bookingId } }
  );

  await wallet.create({
    amount: -1 * earning,
    bookingId: bookingId,
    userId: bookingData.deliveryDriverId,
    description: "Delivery Driver Earnings",
  });
  const adminEarning = await wallet.sum("amount", { where: { bookingId } });
  const admin = await warehouse.findOne({
    where: { email: "admin@shippinghack.com" },
  });
  await wallet.create({
    amount: -1 * adminEarning,
    bookingId: bookingId,
    adminId: admin.id,
    description: "Admin Earning",
  });

  //  res.json({bookingData})

  var arrived = bookingData.packages.filter((ele) => ele.arrived == "arrived");
  const totalWeight = calculateWeights(
    arrived,
    bookingData.logisticCompany.divisor
  );
  const to = ["sigidevelopers@gmail.com"];
  let name = bookingData.receiverName;
  if (bookingData.customer) {
    to.push(bookingData.customer.email);
    name = bookingData.customer.firstName;
  } else {
    to.push(bookingData.receiverEmail);
  }
  const consolidation = bookingData.consolidation ? "Yes" : "No";
  const createdAt = String(bookingData.createdAt).substring(4, 15);
  //  toTransitMail (to,name,bookingData.trackingId,createdAt,arrived.length,bookingData.logisticCompany.title,consolidation,'trackingNumberTransit')

  console.log(
    "ðŸš€ ~ file: warehouse.js:177 ~ emailTesting ~ bookingData.dropoffAddress:",
    bookingData.dropoffAddress
  );
  deliveredMail(
    to,
    name,
    bookingData.trackingId,
    arrived.length,
    bookingData.logisticCompany.title,
    consolidation,
    totalWeight.chargedWeight,
    bookingData.total,
    bookingData.dropoffAddress
  );
  //  (email,name,orderNumber,company,consolidation,billableWeight,total,destination)
  return res.json(returnFunction("1", "Delivered", "", ""));
}
// ! Module 3: Drawer

async function getProfile(req, res) {
  const userId = req.user.id;
  const data = await user.findOne({
    where: { id: userId },
    attributes: [
      "id",
      "firstName",
      "lastName",
      "email",
      "countryCode",
      "phoneNum",
      "createdAt",
      "image",
    ],
  });
  return res.json(returnFunction("1", "User Profile", data, ""));
}

async function updateProfile(req, res) {
  const userId = req.user.id;
  const { firstName, lastName, image } = req.body;
  let data = {};
  console.log(req.file);
  if (image === "true") {
    if (typeof req.file == "undefined")
      throw CustomException("Image Not Uploaded", "");
    let tmpprofileImage = req.file.path;
    let profileImageName = tmpprofileImage.replace(/\\/g, "/");
    data = await user.update(
      { firstName, lastName, image: profileImageName },
      {
        where: { id: userId },
      }
    );
    return res.json(returnFunction("1", "User Profile Updated", {}, ""));
  } else {
    data = await user.update(
      { firstName, lastName },
      {
        where: { id: userId },
      }
    );
    return res.json(returnFunction("1", "User Profile Updated", {}, ""));
  }
}

async function getVehData(req, res) {
  const userId = req.user.id;
  const vehicData = await driverDetail.findOne({
    where: { userId },
    include: [{ model: vehicleType }],
  });

  const vehicImages = await vehicleImage.findAll({
    where: {
      [Op.and]: [{ userId }, { status: 1 }],
    },
  });

  let obj = {
    vehicData,
    vehicImages,
  };
  return res.json(returnFunction("1", "Vehicle Data", obj, ""));
}

async function updateVehData(req, res) {
  const userId = req.user.id;
  const {
    licIssueDate,
    licExpiryDate,
    vehicleMake,
    vehicleModel,
    vehicleYear,
    vehicleColor,
    vehicleTypeId,
  } = req.body;
  const data = await driverDetail.update(
    {
      licIssueDate,
      licExpiryDate,
      vehicleMake,
      vehicleModel,
      vehicleYear,
      vehicleColor,
      vehicleTypeId,
    },
    {
      where: { userId },
    }
  );
  return res.json(returnFunction("1", "Vehicle Data Updated", data, ""));
}

async function disableVehicImage(req, res) {
  const userId = req.user.id;
  const { vehicImageId } = req.body;

  const vehimage = await vehicleImage.findByPk(vehicImageId);

  if (!vehimage) {
    const response = returnFunction("0", "Image not found", "", "");
    return res.json(response);
  }

  // Delete the image file
  await fs.unlink(vehimage.image);

  // Remove the record from the database
  await vehicleImage.destroy({
    where: {
      id: vehicImageId,
    },
  });

  console.log("Picture Deleted Successfully!");

  const response = returnFunction("1", "Image Disabled", "", "");
  return res.json(response);
}

async function getCustomerSupport(req, res) {
  const support_email = await support.findOne({
    where: { key: "support_email" },
  });
  const support_phone = await support.findOne({
    where: { key: "support_phone" },
  });

  const dvToken = await warehouse.findOne({
    where: { id: "admin@shippinghack.com" },
  });

  const faqs = await FAQs.findAll({ where: { status: true } });

  let tempObj = {
    email: support_email.value,
    phone: support_phone.value,
    //"admin_dvToken" : dvToken.dvToken,
    faqs: faqs,
  };
  return res.json(returnFunction("1", "Customer Support", tempObj, ""));
}

async function getCompletedOrders(req, res) {
  const driverId = req.user.id;
  let pickedupjobs = [];
  let dropoffjobs = [];

  //return res.json(pickedupjobsData)
  let dropoffjobsData = await booking.findAll({
    where: {
      [Op.and]: [
        { bookingStatusId: 18 }, // delivered
        { deliveryDriverId: driverId },
      ],
    },
    include: [
      { model: bookingStatus, attributes: ["id", "title"] },
      {
        model: addressDBS,
        as: "dropoffAddress",
        attributes: [
          "id",
          "postalCode",
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
        model: warehouse,
        as: "deliveryWarehouse",
        include: {
          model: addressDBS,
          attributes: [
            "id",
            "postalCode",
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
        attributes: ["id"],
      },
      { model: billingDetails, attributes: ["deliveryDriverEarning"] },
    ],
  });

  dropoffjobsData.forEach((ele) => {
    dropoffjobs.push({
      trackingId: ele.trackingId,
      status: ele.bookingStatus.title,
      deliveredAt: ele.deliveredAt,
      pickup: `${ele.deliveryWarehouse.addressDB.streetAddress}, ${ele.deliveryWarehouse.addressDB.city}, ${ele.deliveryWarehouse.addressDB.district}, ${ele.deliveryWarehouse.addressDB.postalCode} ${ele.deliveryWarehouse.addressDB.country}`,
      dropoff: `${ele.dropoffAddress.streetAddress}, ${ele.dropoffAddress.city},${ele.dropoffAddress.district}, ${ele.dropoffAddress.postalCode} ${ele.dropoffAddress.country}`,
      total: ele.billingDetail?.deliveryDriverEarning
        ? `${ele.billingDetail.deliveryDriverEarning}`
        : `0.00`,
    });
  });

  let tempObj = {
    deliveryjobs: dropoffjobs,
  };
  return res.json(returnFunction("1", "Completed Jobs", tempObj, ""));
}

async function deleteLic(req, res) {
  const userId = req.user.id;
  const { licImage } = req.body;

  let update_back = "";
  let update_front = "";

  if (licImage == "licBackImage") {
    update_back = await driverDetail.update(
      { licBackImage: "" },
      { where: { userId } }
    );
  }
  if (licImage == "licFrontImage") {
    update_front = await driverDetail.update(
      { licFrontImage: "" },
      { where: { userId } }
    );
  }

  return res.json(
    returnFunction(
      "1",
      "License Deleted",
      [update_front ?? "", update_back ?? ""],
      ""
    )
  );
}

async function getWallet(req, res) {
  const userId = req.user.id;
  // const defaultCurrencyUnit = await defaultUnit.findOne({where: {type: 'currency', status: true}, attributes: ['symbol']})
  const userData = await user.findOne({
    where: { id: userId },
    include: [
      {
        model: bank,
        // where:
        // //{status:true},
        required: false,
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

  const Paid = await paymentRequests.findAll({
    where: { userId, type: "paid", status: "done" },
    attributes: [[sequelize.fn("SUM", sequelize.col("amount")), "paid"]],
  });

  //return res.json(Paid)

  let total =
    sumOfEarnings[0].dataValues.Sum === null
      ? "0.00"
      : sumOfEarnings[0].dataValues.Sum;
  total = -1 * parseFloat(total);
  let paid =
    Paid[0].dataValues.paid === null ? "0.00" : Paid[0].dataValues.paid;

  let balance = total - parseFloat(paid);
  let paymentRequestsData = [];
  let obj = {};

  userData.paymentRequests.map((ele) => {
    obj = {
      id: ele.id,
      amount: "$" + ele.amount,
      type: ele.type,
      date: `${ele.date} ${ele.time}`,
    };
    paymentRequestsData.push(obj);
  });

  const tmpObj = {
    totalEarning: `${total}`,
    availableBalance: `${balance}`,
    bank: userData.banks[0] ?? {
      id: 0,
      bankName: "",
      accountName: "",
      accountNumber: "",
    },
    transactions: paymentRequestsData,
    // currencyUnit: defaultCurrencyUnit.symbol,
  };

  return res.json(returnFunction("1", "Wallet", tmpObj, ""));
}

async function addBank(req, res) {
  const userId = req.user.id;
  const { bankName, accountName, accountNumber } = req.body;
  const oldBank = await bank.findOne({ where: { userId } });
  if (!oldBank) {
    const newBank = await bank.create({
      userId: userId,
      bankName: bankName,
      accountName: accountName,
      accountNumber: accountNumber,
      status: true,
    });
    return res.json(returnFunction("1", "Bank Added", newBank, ""));
  }
  oldBank.bankName = bankName;
  oldBank.accountName = accountName;
  oldBank.accountNumber = accountNumber;
  await oldBank.save();
  return res.json(returnFunction("1", "Bank Added", oldBank, ""));
}

async function updateBank(req, res) {
  const userId = req.user.id;
  const { bankName, accountName, accountNumber } = req.body;
  const newBank = await bank.update(
    { bankName, accountName, accountNumber },
    { where: { userId } }
  );
  // const newBank = await bank.create({
  //     userId:userId,
  //     bankName:bankName,
  //     accountName:accountName,
  //     accountNumber:accountNumber,
  //     status:true,
  // })
  return res.json(returnFunction("1", "Bank Updated", newBank, ""));
}

async function sendWithdrawRequest(req, res) {
  const userId = req.user.id;
  const { amount } = req.body;
  // check balance and put limit
  const sumOfEarnings = await wallet.findAll({
    where: { userId },
    attributes: [[sequelize.fn("SUM", sequelize.col("amount")), "Sum"]],
  });

  const Paid = await paymentRequests.findAll({
    where: { userId, type: "paid", status: "done" },
    attributes: [[sequelize.fn("SUM", sequelize.col("amount")), "paid"]],
  });
  //return res.json(Paid)
  let total =
    sumOfEarnings[0].dataValues.Sum === null
      ? "0.00"
      : sumOfEarnings[0].dataValues.Sum;
  total = -1 * parseFloat(total);
  let paid =
    Paid[0].dataValues.paid === null ? "0.00" : Paid[0].dataValues.paid;
  let balance = total - parseFloat(paid);
  if (amount > balance)
    throw CustomException(
      "The requested amount is greater than balance",
      "Please lower your amount amount and try again"
    );
  const Paid_Pending = await paymentRequests.findAll({
    where: { userId },
    attributes: [[sequelize.fn("SUM", sequelize.col("amount")), "paid"]],
  });
  let paid_pending =
    Paid[0].dataValues.paid === null ? "0.00" : Paid[0].dataValues.paid;
  let balance_pending = total - parseFloat(paid_pending);
  if (amount > balance_pending)
    throw CustomException(
      "Few requests are pending approval and entered amount is greater than pending balance ",
      "Please lower your amount amount and try again"
    );

  let dt = Date.now();
  let DT = new Date(dt);
  let currentDate = `${DT.getFullYear()}-${DT.getMonth() + 1}-${DT.getDate()}`;
  let currentTime = `${DT.getHours()}:${DT.getMinutes()}:${DT.getSeconds()}`;

  const newPaymentRequests = await paymentRequests.create({
    userId: userId,
    amount: amount,
    status: "pending",
    type: "request",
    date: currentDate,
    time: currentTime,
  });
  return res.json(
    returnFunction("1", "Withdraw Request Sent", newPaymentRequests, "")
  );
}

async function testAPI(req, res) {
  let bookingData = [
    { bookingId: 1, remainingTime: 10, lat: 31.472133, lng: 74.244796 },
    { bookingId: 9, remainingTime: 30, lat: 31.468229, lng: 79.265079 },
    { bookingId: 20, remainingTime: 5, lat: 31.441876, lng: 74.276853 },
    { bookingId: 10, remainingTime: 60, lat: 31.409627, lng: 74.261227 },
  ];
  const driverLat = 31.464362;
  const driverLng = 74.243628;
  // Create array of all locations, including driver's starting location
  // const allLocations = [{ bookingId: "Driver", remainingTime: 0, lat: driverLat, lng: driverLng }, ...bookingData];

  // // Solve the TSP problem
  // const solution = tspSolver(allLocations);

  // // Get the sequence of bookingIds to visit
  // const bookingIdSequence = solution.route.map((location) => location.bookingId);

  // // Log the sequence of bookingIds
  // console.log(bookingIdSequence);
  const route = optimizeRoute(bookingData, driverLat, driverLng);
  console.log(route);

  return res.json(route);
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

let loginData = (userData, accessToken, online_status, dvToken) => {
  return {
    status: "1",
    message: "Login successful",
    data: {
      userId: `${userData.id}`,
      firstName: `${userData.firstName}`,
      lastName: `${userData.lastName}`,
      image: `${userData.image}`,
      email: `${userData.email}`,
      phoneNum: `${userData.countryCode} ${userData.phoneNum}`,
      accessToken: `${accessToken}`,
      online_status: online_status,
      joinedOn: `${userData.dataValues.joinedOn}`,
      dvToken,
    },
    error: "",
  };
};

let loginDataForLogin = (userData, accessToken, online_status, dvToken) => {
  return {
    userId: `${userData.id}`,
    firstName: `${userData.firstName}`,
    lastName: `${userData.lastName}`,
    email: `${userData.email}`,
    phoneNum: `${userData.countryCode} ${userData.phoneNum}`,
    accessToken: `${accessToken}`,
    online_status: online_status,
    joinedOn: `${userData.joinedOn}`,
    dvToken,
  };
};
let filterBookings = async (bookingData, driverId) => {
  let jobs = [];
  let driverLocation = await axios.get(
    "https://theshippinghack-default-rtdb.firebaseio.com/ShippingHack_driver/" +
      `${driverId}` +
      ".json"
  );
  let findDist = false;
  (driverLat = ""), (driverLng = "");
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
      else if (ele.weight == "0.00" && ele.volume == "0.00")
        billableWeight = ele.weight;
      let { earning } = await getDriverEarning(ele.id, driverId, "delivery");
      let driverDistance = (await getDistance(
        driverLat,
        driverLng,
        ele.dropoffAddress.lat,
        ele.dropoffAddress.lng
      ))
        ? await getDistance(
            driverLat,
            driverLng,
            ele.dropoffAddress.lat,
            ele.dropoffAddress.lng
          )
        : "N/A";

      tmpObj = {
        id: ele.id,
        trackingId: ele.trackingId,
        distance:
          driverDistance === "N/A" ? `${driverDistance}` : `${driverDistance}`,
        earning: `$${earning}`,
        weight: billableWeight,
        PickUpPoint: `${ele.deliveryWarehouse.addressDB.streetAddress}, ${ele.deliveryWarehouse.addressDB.city}, ${ele.deliveryWarehouse.addressDB.district}, ${ele.deliveryWarehouse.addressDB.postalCode} ${ele.deliveryWarehouse.addressDB.country}`,
        dropoffPoint: `${ele.dropoffAddress.streetAddress}, ${ele.dropoffAddress.city}, ${ele.dropoffAddress.district}, ${ele.dropoffAddress.postalCode} ${ele.dropoffAddress.country}`,
        pickupCode: `${ele.deliveryWarehouse.addressDB.postalCode}`,
        dropoffCode: `${ele.dropoffAddress.postalCode}`,
        bookingStatus: ele.bookingStatusId,
        distanceUnit: "miles",
      };
      //if(secondsDifference === 0) return null;
      jobs.push(tmpObj);
    })
  );
  // jobs.push(baseUnit)
  return jobs;
};
let filterBookingsOnCapacity = async (
  bookingData,
  weightCapacity,
  volumeCapacity,
  jobType,
  driverId
) => {
  let jobs = [];
  let driverLocation = await axios.get(
    "https://theshippinghack-default-rtdb.firebaseio.com/ShippingHack_driver/" +
      `${driverId}` +
      ".json"
  );
  let findDist = false;
  (driverLat = ""), (driverLng = "");

  if (driverLocation.data != null) {
    driverLat = driverLocation.data.lat;
    driverLng = driverLocation.data.lng;
    findDist = true;
  }

  await Promise.all(
    bookingData.map(async (ele) => {
      console.log("ðŸš€ ~ bookingData.map ~ bookingData:", bookingData)
      let tmpObj = {};
      if (ele.weight > weightCapacity && ele.volume > volumeCapacity) {
      } else {
        let billableWeight;
        if (ele.weight < ele.volume / 5000) billableWeight = ele.volume / 5000;
        else if (ele.volume / 5000 < ele.weight) billableWeight = ele.weight;
        else if (ele.weight == "0.00" && ele.volume == "0.00")
          billableWeight = ele.weight;

        let { earning, message } = await getDriverEarning(
          ele.id,
          driverId,
          "delivery"
        );
        console.log({ earning, message });
        if (earning === 0.0 && message === "Distance Not in Range of Driver ") {
        } else {
          let driverDistance = (await getDistance(
            driverLat,
            driverLng,
            ele.dropoffAddress.lat,
            ele.dropoffAddress.lng
          ))
            ? await getDistance(
                driverLat,
                driverLng,
                ele.dropoffAddress.lat,
                ele.dropoffAddress.lng
              )
            : "N/A";

          tmpObj = {
            id: ele.id,
            trackingId: ele.trackingId,
            distance:
              driverDistance === "N/A"
                ? `${driverDistance}`
                : `${driverDistance}`,
            earning: `$${earning}`,
            weight: billableWeight,
            PickUpPoint: `${ele.deliveryWarehouse.addressDB.streetAddress}, ${ele.deliveryWarehouse.addressDB.city}, ${ele.deliveryWarehouse.addressDB.district}, ${ele.deliveryWarehouse.addressDB.postalCode} ${ele.deliveryWarehouse.addressDB.country}`,
            dropoffPoint: `${ele.dropoffAddress.streetAddress}, ${ele.dropoffAddress.city}, ${ele.dropoffAddress.district}, ${ele.dropoffAddress.postalCode} ${ele.dropoffAddress.country}`,
            pickupCode: `${ele.deliveryWarehouse.addressDB.postalCode}`,
            dropoffCode: `${ele.dropoffAddress.postalCode}`,
            distanceUnit: "miles",
          };

          //if(secondsDifference === 0) return null;
          jobs.push(tmpObj);
        }
      }
    })
  );
  // jobs.push(baseUnit)
  return jobs;
};
// Booking query with date input
async function getBookings(dt, userId) {
  dt = dt ? moment(dt).format("YYYY-MM-DD") : "";
  console.log("get Booking Date=================>",dt)

const checkDeliveryBooking = await booking.findAll({
  where: { bookingStatusId: 13, deliveryDriverId: userId, deliveryTypeId: 1 },
  attributes: ["deliveryWarehouseId"],
});
//console.log("Delivery Warehouse ID from first entry:", checkDeliveryBooking[0].dataValues.deliveryWarehouseId);

//console.log("checkDeliveryBooking============================>",checkDeliveryBooking);

//
let dropoffBookingData = [];
if (checkDeliveryBooking.length === 0) {
    console.log("going into if ==============================>>>>>>>>>>>>>")
  dropoffBookingData = await booking.findAll({
    where:
      dt === ""
        ? { bookingStatusId: 12, deliveryDriverId: null, bookingTypeId: 1 }
        : {
            dropoffDate: { [Op.eq]: dt },
            bookingStatusId: 12,
            deliveryDriverId: null,
            bookingTypeId: 1,
          },
    include: [
      {
        model: warehouse,
        as: "deliveryWarehouse",
        include: {
          model: addressDBS,
          attributes: [
            "id",
            "postalCode",
            "lat",
            "lng",
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
      },
      {
        model: addressDBS,
        as: "dropoffAddress",
        attributes: [
          "id",
          "postalCode",
          "lat",
          "lng",
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
    ],
    attributes: ["id", "trackingId", "weight", "volume", "distance"],
  });
} else {
    console.log("Going into else==========================>")
  dropoffBookingData = await booking.findAll({
    where:
      dt === ""
        ? {
            bookingStatusId: 12,
            deliveryDriverId: null,
            deliveryWarehouseId: checkDeliveryBooking[0].deliveryWarehouseId,
            bookingTypeId: 1,
          }
        : {
            dropoffDate: { [Op.eq]: dt },
            bookingStatusId: 12,
            deliveryDriverId: null,
            deliveryWarehouseId: checkDeliveryBooking[0].dataValues.deliveryWarehouseId,
            bookingTypeId: 1,
          },
    include: [
      {
        model: warehouse,
        as: "deliveryWarehouse",
        include: {
          model: addressDBS,
          attributes: [
            "id",
            "postalCode",
            "lat",
            "lng",
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
      },
      {
        model: addressDBS,
        as: "dropoffAddress",
        attributes: [
          "id",
          "postalCode",
          "lat",
          "lng",
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
    ],
    attributes: ["id", "trackingId", "weight", "volume", "distance"],
  });
}

console.log("dropoffBookingData in getbooking function -------------------------->>>>",dropoffBookingData)

return dropoffBookingData;
}

// async function getDriverEarning(bookingId, driverId, type){
//     let earning = '0.00';
//     const bookingData = await booking.findByPk(bookingId, {
//         include: [

//             { model: addressDBS, as: 'dropoffAddress', attributes: ['lat', 'lng'] },
//             { model: warehouse, as: 'deliveryWarehouse', include: { model: addressDBS, attributes: ['lat', 'lng'] }, attributes: ['id'] },
//         ],
//         attributes: ['trackingId']
//     });
//     console.log(bookingData)
//     const vehicleData = await driverDetail.findOne({
//         where: { userId: driverId },
//         include: { model: vehicleType,include:{model:distanceCharges}, attributes: ['baseRate', 'perUnitRate', 'perRideCharge'] },
//         attributes: ['id']
//     })
//     return res.json(vehicleData);
//     const systemForCal = await driverPaymentSystem.findOne({
//         where: { status: true },
//         attributes: ['id', 'key']
//     })
//     // system type ==> distance_based
//     if (systemForCal.key === 'distance_based') {
//         const baseDistance = await generalCharges.findOne({
//             where: { key: 'baseDistance' },
//             attributes: ['value']
//         })
//          if(type === "delivery"){
//             let distance = await getDistance(bookingData.deliveryWarehouse.addressDB.lat, bookingData.deliveryWarehouse.addressDB.lng, bookingData.dropoffAddress.lat, bookingData.dropoffAddress.lng);
//             console.log(distance)
//             if (distance < baseDistance.value) earning = vehicleData != null ? vehicleData.vehicleType.baseRate : 0
//             else {
//                 let extraMiles = distance - baseDistance.value;
//                 earning = vehicleData != null ? vehicleData.vehicleType.baseRate : 0 + (extraMiles * vehicleData != null ? vehicleData.vehicleType.perUnitRate : 0)
//             }
//         }
//     }
//     // per ride based
//     else {
//         earning = vehicleData != null ? vehicleData.vehicleType.perRideCharge : 0
//     }
//     return {earning, driverPaymentSystemId : systemForCal.id};
// };

//! new Function for driver Earning
async function getDriverEarning(bookingId, driverId, type) {
  let message = "";
  let earning = 0.0;
  const bookingData = await booking.findByPk(bookingId, {
    include: [
      { model: addressDBS, as: "dropoffAddress", attributes: ["lat", "lng"] },
      {
        model: warehouse,
        as: "deliveryWarehouse",
        include: { model: addressDBS, attributes: ["lat", "lng"] },
        attributes: ["id"],
      },
    ],
    attributes: ["trackingId"],
  });
  const vehicleData = await driverDetail.findOne({
    where: { userId: driverId },
    include: {
      model: vehicleType,
      include: { model: distanceCharges },
      attributes: ["baseRate", "perUnitRate", "perRideCharge"],
    },
    attributes: ["id"],
  });
  console.log("");
  
  let distance = await getDistance(
    bookingData.deliveryWarehouse.addressDB.lat,
    bookingData.deliveryWarehouse.addressDB.lng,
    bookingData.dropoffAddress.lat,
    bookingData.dropoffAddress.lng
  );
  //  return res.json(vehicleData);
  for (let range of vehicleData.vehicleType.distanceCharges) {
    if (distance <= range.endValue && distance > range.startValue) {
      earning =
        vehicleData !== null
          ? Number(vehicleData.vehicleType.baseRate) + Number(range.price)
          : 0.0;
    }
  }
  if (earning === 0.0) {
    message = "Distance Not in Range of Driver ";
  }

  // return res.json(returnFunction('1', 'All group orders', {earning, message }, ''));
  return { earning, message };
}
async function optimizeRoute(bookingData, driverLat, driverLng) {
  // Calculate the distances between the driver location and each booking location
  const distances = bookingData.map((booking) => {
    const latDiff = driverLat - booking.lat;
    const lngDiff = driverLng - booking.lng;
    return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
  });

  // Sort the bookings by their remaining time window
  const sortedBookings = bookingData
    .slice()
    .sort((a, b) => a.remainingTime - b.remainingTime);

  // Initialize the current time to 0 and the visited bookings to an empty array
  let currentTime = 0;
  const visitedBookings = [];
  const droppedBookingsIds = [];

  // Visit each booking in order of their remaining time window
  for (const booking of sortedBookings) {
    // Calculate the time needed to travel from the driver location to the booking location
    const travelTime = distances[bookingData.indexOf(booking)];

    // Calculate the time at which the driver would arrive at the booking location
    const arrivalTime = currentTime + travelTime;

    // If the driver arrives too late for the remaining time window, skip the booking
    //   if (arrivalTime > booking.remainingTime) {
    //     //droppedBookings.push(booking.id)
    //     continue;
    //   }

    // Add the booking to the visited bookings and update the current time
    visitedBookings.push(booking);
    currentTime = arrivalTime;
  }

  // Return the visited bookings in the order they were visited
  return visitedBookings;
}

// EXTRA CODE

/*
            8. Change Status
*/
async function changeStatus(req, res) {
  const driverId = req.user.id;
  const { bookingId, status } = req.body;
  const bookingData = await booking.findOne({
    where: { id: bookingId },
    attributes: ["id"],
  });

  const bookingStatusId = status;

  if (!bookingData)
    throw new CustomException("Booking Not Found", "Request booking not found");

  let bookingDataUpdate = "";
  if (bookingStatusId == 15) {
    bookingDataUpdate = await booking.update(
      {
        bookingStatusId: bookingStatusId,
        receivingDriverId: null,
      },
      { where: { id: bookingId } }
    );
  } else {
    bookingDataUpdate = await booking.update(
      {
        bookingStatusId: bookingStatusId,
      },
      { where: { id: bookingId } }
    );
  }

  if (bookingStatusId == 5) {
    // reached at warehouse
    await booking.update(
      {
        driverStatus: "reached",
      },
      { where: { id: bookingId } }
    );
  }

  const ongoing = await onGoingOrder.findAll({
    where: {
      [Op.and]: [{ userId: driverId }, { ordersStatus: 3 }],
    },
  });

  if (ongoing.length > 0) {
    var bookings = await booking.findAll({
      where: {
        [Op.and]: [
          { id: ongoing[0].orderNumbers.split(",") },
          { bookingStatusId },
        ],
      },
    });

    if (bookings.length == ongoing[0].orderNumbers.split(",").length) {
      await onGoingOrder.update(
        {
          ordersStatus: bookingStatusId,
        },
        {
          where: {
            [Op.and]: [{ id: ongoing[0].id }, { userId: driverId }],
          },
        }
      );
    }
  }

  // let orderCount = 0;
  // ongoing.forEach(element => {
  //     orderCount = element.orderNumbers.split(",").length;

  //         if(orderCount == 1){
  //             onGoingOrder.update({
  //                 ordersStatus: bookingStatusId
  //             },
  //             {
  //                 where:{
  //                     [Op.and]:[
  //                         { orderNumbers: bookingId },
  //                         { userId: driverId }
  //                         // { ordersStatus: 13 } // update after arrived
  //                     ]
  //                 }
  //             }
  //             );
  //         }

  //     orderCount = 0;
  // });

  if (!bookingDataUpdate)
    throw new CustomException("Booking Not Found", "Request booking not found");
  return res.json(returnFunction("1", "Booking Updated", "", ""));
}

/*
            7. Get all group orders of a driver by date filter
*/
async function allGroupOrders(req, res) {
  const driverId = req.user.id;
  const { date } = req.body;
  const cDate = new Date(date);
  const dt = `${cDate.getFullYear()}-${
    cDate.getMonth() + 1
  }-${cDate.getDate()}`;
  const groupOrderData = await onGoingOrder.findAll({
    where: { date: { [Op.eq]: dt }, status: true, userId: driverId },
  });
  let outArr = groupOrderData.map((ele) => {
    let tmpArr = ele.orderNumbers.split(",");
    let tmpObj = {
      groupId: ele.id,
      numOfOrders: tmpArr.length,
    };
    return tmpObj;
  });
  return res.json(returnFunction("1", "All group orders", outArr, ""));
}

module.exports = {
  //AUTH
  registerStep1,
  verifyOTP,
  getActiveVehicleTypes,
  registerStep2,
  registerStep3,
  login,
  forgetPasswordRequest,
  verifyOTPforPassword,
  changePasswordOTP,
  resendOTP,
  session,
  logout,
  deleteUser,
  // Home & orders handling
  homePageApi,
  bookingDetailsById,
  jobsByDateFilter,
  allAssociatedJobs,
  pJobsToOngoing,
  allGroupOrders,
  changeStatus,
  getProfile,
  updateProfile,
  getVehData,
  updateVehData,
  postponedBooking,
  getReasons,
  disableVehicImage,
  uploadVehImages,
  getCustomerSupport,
  getCompletedOrders,
  uploadLic,
  deleteLic,
  picked,
  cancelled,
  getWallet,
  addBank,
  updateBank,
  sendWithdrawRequest,
  changePassword,
  bookJobDelivery,
  groupDetailDelivery,
  reachedDelivery,
  deliveredDelivery,
  getDriverEarning,
  testAPI,
  testNot
};