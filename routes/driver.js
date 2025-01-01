const express = require('express');
const router = express();
const driverController = require('../controller/driver');
const asyncMiddleware = require('../middleware/async');
const validateToken = require('../middleware/validateToken');
const multer = require('multer');
const path = require('path');

// ! _________________________________________________________________________
// ! Module 1: Auth

// 1. Register (Basic Info)
const uploadProfileImgs = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, `./Public/Profile`)
    },
    filename: (req, file, cb) => {
        cb(null, 'profile-' + Date.now() +  path.extname(file.originalname))
    }
})
const uploadProfile = multer({
    storage: uploadProfileImgs,
});
/**
 * @swagger
 * /driver/st1register:
 *   post:
 *     tags:
 *       - Driver App --> Auth
 *     summary: Step 1 of driver registration (with file upload for profile image)
 *     description: This endpoint handles the first step of driver registration, where the profile image is uploaded, and user details are validated.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The token to validate the request.
 *         schema:
 *           type: string
 *           example: "your_access_token_here"
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: The first name of the driver.
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 description: The last name of the driver.
 *                 example: "Doe"
 *               email:
 *                 type: string
 *                 description: The email address of the driver.
 *                 example: "johndoe@example.com"
 *               countryCode:
 *                 type: string
 *                 description: The country code for the phone number.
 *                 example: "+1"
 *               phoneNum:
 *                 type: string
 *                 description: The phone number of the driver.
 *                 example: "1234567890"
 *               password:
 *                 type: string
 *                 description: The password for the driver account.
 *                 example: "securePassword123"
 *               profileImage:
 *                 type: string
 *                 format: binary
 *                 description: The profile image of the driver.
 *     responses:
 *       200:
 *         description: Successfully completed registration step 1 and sent verification OTP.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "1"
 *                 message:
 *                   type: string
 *                   example: "Registration Step 1: Completed"
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       example: "1"
 *                     image:
 *                       type: string
 *                       example: "/path/to/image.jpg"
 *                     firstName:
 *                       type: string
 *                       example: "John"
 *                     lastName:
 *                       type: string
 *                       example: "Doe"
 *                     email:
 *                       type: string
 *                       example: "johndoe@example.com"
 *                     phoneNum:
 *                       type: string
 *                       example: "+1 1234567890"
 *                     accessToken:
 *                       type: string
 *                       example: "newAccessToken"
 *                     joinOn:
 *                       type: string
 *                       example: "2024-12-31T12:00:00Z"
 *       400:
 *         description: Invalid request body or missing required fields.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "0"
 *                 message:
 *                   type: string
 *                   example: "Invalid input or missing fields."
 *                 error:
 *                   type: string
 *                   example: "Missing or invalid fields in the request."
 *       409:
 *         description: User with the same email or phone number already exists.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "0"
 *                 message:
 *                   type: string
 *                   example: "User already exists."
 *                 error:
 *                   type: string
 *                   example: "A user with the provided email or phone number already exists."
 *       500:
 *         description: Internal server error while processing the registration.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "0"
 *                 message:
 *                   type: string
 *                   example: "Error processing registration."
 *                 error:
 *                   type: string
 *                   example: "There was an issue while processing the request."
 */

router.post('/st1register', uploadProfile.fields([{name: 'profileImage', maxCount: 1}]), asyncMiddleware(driverController.registerStep1)) 
// 2. Verify OTP
router.post('/verifyotp', asyncMiddleware(driverController.verifyOTP)) 

// 3. Get vehicle types
router.get('/allvehicletypes', asyncMiddleware(driverController.getActiveVehicleTypes));

// 4. Register (Vehicle Data)
const uploadVehImgs = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, `./Public/VehicleImages`)
    },
    filename: (req, file, cb) => {
        cb(null, 'VehImg-' + req.body.userId + '-'+  Date.now() +  path.extname(file.originalname))
    }
})
const uploadVeh = multer({
    storage: uploadVehImgs,
});
/**
 * @swagger
 * /driver/st2register:
 *   post:
 *     tags:
 *       - Driver App --> Auth
 *     summary: Step 2 of driver registration (with vehicle images)
 *     description: This endpoint handles the second step of driver registration, where vehicle details and images are uploaded.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The token to validate the request.
 *         schema:
 *           type: string
 *           example: "your_access_token_here"
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               vehicleTypeId:
 *                 type: integer
 *                 description: The type of vehicle (e.g., car, truck).
 *                 example: 1
 *               vehicleMake:
 *                 type: string
 *                 description: The make (brand) of the vehicle.
 *                 example: "Toyota"
 *               vehicleModel:
 *                 type: string
 *                 description: The model of the vehicle.
 *                 example: "Corolla"
 *               vehicleYear:
 *                 type: integer
 *                 description: The manufacturing year of the vehicle.
 *                 example: 2020
 *               vehicleColor:
 *                 type: string
 *                 description: The color of the vehicle.
 *                 example: "Red"
 *               userId:
 *                 type: integer
 *                 description: The ID of the user.
 *                 example: 123
 *               vehImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                   description: Vehicle images uploaded by the driver (up to 10 images).
 *     responses:
 *       200:
 *         description: Successfully completed registration step 2 and saved the vehicle details and images.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "1"
 *                 message:
 *                   type: string
 *                   example: "Registration step 2: Completed"
 *                 data:
 *                   type: object
 *                   properties:
 *                     detailsId:
 *                       type: integer
 *                       example: 101
 *                     userId:
 *                       type: integer
 *                       example: 123
 *       400:
 *         description: Invalid request body or missing required fields.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "0"
 *                 message:
 *                   type: string
 *                   example: "Invalid input or missing fields."
 *                 error:
 *                   type: string
 *                   example: "Missing or invalid fields in the request."
 *       404:
 *         description: User details not found or images not uploaded.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "0"
 *                 message:
 *                   type: string
 *                   example: "User not found or images not uploaded."
 *       500:
 *         description: Internal server error while processing the registration.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "0"
 *                 message:
 *                   type: string
 *                   example: "Error processing registration."
 *                 error:
 *                   type: string
 *                   example: "There was an issue while processing the request."
 */

router.post('/st2register', uploadVeh.array('vehImages', 10), asyncMiddleware(driverController.registerStep2))
// 5. Upload Vehicle Images
/**
 * @swagger
 * /driver/uploadVehImages:
 *   post:
 *     tags:
 *       - Driver App --> Auth
 *     summary: Upload multiple vehicle images
 *     description: This endpoint allows a driver to upload up to 10 vehicle images.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The token to validate the request.
 *         schema:
 *           type: string
 *           example: "your_access_token_here"
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               vehImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                   description: Vehicle images to be uploaded (up to 10 images).
 *     responses:
 *       200:
 *         description: Successfully uploaded the vehicle images.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "1"
 *                 message:
 *                   type: string
 *                   example: "Vehicle Images Uploaded"
 *       400:
 *         description: No images uploaded or invalid request body.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "0"
 *                 message:
 *                   type: string
 *                   example: "Images not uploaded"
 *                 error:
 *                   type: string
 *                   example: "Please upload images"
 *       500:
 *         description: Internal server error while uploading images.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "0"
 *                 message:
 *                   type: string
 *                   example: "Error uploading vehicle images."
 *                 error:
 *                   type: string
 *                   example: "There was an issue while processing the images."
 */

router.post('/uploadVehImages', validateToken, uploadVeh.array('vehImages', 10), asyncMiddleware(driverController.uploadVehImages))

//5. Register (License Info)
const uploadLicImgs = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, `./Public/LicenseImages`)
    },
    filename: (req, file, cb) => {
        cb(null, 'LicImg-' + req.body.userId + '-'+  Date.now() +  path.extname(file.originalname))
    }
})
const uploadLic = multer({
    storage: uploadLicImgs,
});


/**
 * @swagger
 * /driver/st3register:
 *   post:
 *     tags:
 *       - Driver App --> Auth
 *     summary: Step 3 of driver registration (with license images)
 *     description: This endpoint handles the third step of driver registration, where license images and details are uploaded.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The token to validate the request.
 *         schema:
 *           type: string
 *           example: "your_access_token_here"
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               licIssueDate:
 *                 type: string
 *                 format: date
 *                 description: The issue date of the driver's license.
 *                 example: "2020-01-01"
 *               licExpiryDate:
 *                 type: string
 *                 format: date
 *                 description: The expiry date of the driver's license.
 *                 example: "2025-01-01"
 *               userId:
 *                 type: integer
 *                 description: The ID of the user associated with the driver.
 *                 example: 123
 *               dvToken:
 *                 type: string
 *                 description: The device token for the driver's device.
 *                 example: "device_token_12345"
 *               frontImage:
 *                 type: string
 *                 format: binary
 *                 description: The front image of the driver's license.
 *               backImage:
 *                 type: string
 *                 format: binary
 *                 description: The back image of the driver's license.
 *     responses:
 *       200:
 *         description: Successfully completed registration step 3, updated the driver's details, and generated the access token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "1"
 *                 message:
 *                   type: string
 *                   example: "Registration step 3: Completed"
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       example: "newAccessToken"
 *                     userId:
 *                       type: integer
 *                       example: 123
 *                     firstName:
 *                       type: string
 *                       example: "John"
 *                     lastName:
 *                       type: string
 *                       example: "Doe"
 *                     email:
 *                       type: string
 *                       example: "johndoe@example.com"
 *                     phoneNum:
 *                       type: string
 *                       example: "+1 1234567890"
 *                     onlineStatus:
 *                       type: boolean
 *                       example: true
 *                     dvToken:
 *                       type: string
 *                       example: "device_token_12345"
 *       400:
 *         description: Invalid request body or missing required fields.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "0"
 *                 message:
 *                   type: string
 *                   example: "Invalid input or missing fields."
 *                 error:
 *                   type: string
 *                   example: "Missing or invalid fields in the request."
 *       404:
 *         description: User details not found or images not uploaded.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "0"
 *                 message:
 *                   type: string
 *                   example: "User not found or images not uploaded."
 *       500:
 *         description: Internal server error while processing the registration.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "0"
 *                 message:
 *                   type: string
 *                   example: "Error processing registration."
 *                 error:
 *                   type: string
 *                   example: "There was an issue while processing the request."
 */

router.post('/st3register', uploadLic.fields([{name: 'frontImage', maxCount: 1}, {name: 'backImage', maxCount: 1} ]) , asyncMiddleware(driverController.registerStep3))
/**
 * @swagger
 * /driver/uploadLic:
 *   post:
 *     tags:
 *       - Driver App --> Auth
 *     summary: Upload driver's license images (front and back)
 *     description: This endpoint allows the driver to upload the front and back images of their license.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The token to validate the request.
 *         schema:
 *           type: string
 *           example: "your_access_token_here"
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               frontImage:
 *                 type: string
 *                 format: binary
 *                 description: The front image of the driver's license.
 *               backImage:
 *                 type: string
 *                 format: binary
 *                 description: The back image of the driver's license.
 *     responses:
 *       200:
 *         description: Successfully uploaded the license images.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "1"
 *                 message:
 *                   type: string
 *                   example: "License Images Uploaded"
 *       400:
 *         description: No images uploaded or invalid request body.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "0"
 *                 message:
 *                   type: string
 *                   example: "Images not uploaded"
 *                 error:
 *                   type: string
 *                   example: "Please upload both images"
 *       500:
 *         description: Internal server error while uploading images.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "0"
 *                 message:
 *                   type: string
 *                   example: "Error uploading license images."
 *                 error:
 *                   type: string
 *                   example: "There was an issue while processing the images."
 */

router.post('/uploadLic', validateToken, uploadLic.fields([{name: 'frontImage', maxCount: 1}, {name: 'backImage', maxCount: 1} ]) , asyncMiddleware(driverController.uploadLic))
// 6. Login Driver

/**
 * @swagger
 * /driver/signin:
 *   post:
 *     tags:
 *       - Driver App --> Auth
 *     summary: User login (Driver)
 *     description: This endpoint allows a driver to log in with their email, password, and device token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email address of the driver.
 *                 example: "johndoe@example.com"
 *               password:
 *                 type: string
 *                 description: The password of the driver.
 *                 example: "securePassword123"
 *               dvToken:
 *                 type: string
 *                 description: The device token to associate the device with the login session.
 *                 example: "device_token_12345"
 *     responses:
 *       200:
 *         description: Successfully logged in, returning the driver's details and access token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "1"
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       example: "newAccessToken"
 *                     userId:
 *                       type: integer
 *                       example: 123
 *                     firstName:
 *                       type: string
 *                       example: "John"
 *                     lastName:
 *                       type: string
 *                       example: "Doe"
 *                     email:
 *                       type: string
 *                       example: "johndoe@example.com"
 *                     phoneNum:
 *                       type: string
 *                       example: "+1 1234567890"
 *                     onlineStatus:
 *                       type: boolean
 *                       example: true
 *                     dvToken:
 *                       type: string
 *                       example: "device_token_12345"
 *       2xx:
 *         description: User is not yet verified via email.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "2"
 *                 message:
 *                   type: string
 *                   example: "Pending email verification"
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: integer
 *                       example: 123
 *                     accessToken:
 *                       type: string
 *                       example: "newAccessToken"
 *                     dvToken:
 *                       type: string
 *                       example: "device_token_12345"
 *       3xx:
 *         description: Driver has no vehicle data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "3"
 *                 message:
 *                   type: string
 *                   example: "Pending vehicle data"
 *       4xx:
 *         description: Driver has no license data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "4"
 *                 message:
 *                   type: string
 *                   example: "Pending license data"
 *       400:
 *         description: Invalid credentials or blocked user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "0"
 *                 message:
 *                   type: string
 *                   example: "Invalid email or password."
 *       404:
 *         description: User not found with the provided email.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "0"
 *                 message:
 *                   type: string
 *                   example: "No user exists with this email."
 *       500:
 *         description: Internal server error while logging in.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "0"
 *                 message:
 *                   type: string
 *                   example: "Error processing login."
 *                 error:
 *                   type: string
 *                   example: "There was an issue while processing the login request."
 */

router.post('/signin', asyncMiddleware(driverController.login))
//7. Forget password request
/**
 * @swagger
 * /driver/forgetpasswordrequest:
 *   post:
 *     tags:
 *       - Driver App --> Auth
 *     summary: Request a password reset OTP
 *     description: This endpoint sends an OTP to the user's email for resetting their password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email address of the driver.
 *                 example: "johndoe@example.com"
 *     responses:
 *       200:
 *         description: OTP sent successfully to the provided email.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "1"
 *                 message:
 *                   type: string
 *                   example: "OTP sent successfully to johndoe@example.com"
 *                 data:
 *                   type: object
 *                   properties:
 *                     otpId:
 *                       type: integer
 *                       example: 101
 *                     userId:
 *                       type: integer
 *                       example: 123
 *       400:
 *         description: Invalid email or user not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "0"
 *                 message:
 *                   type: string
 *                   example: "No user exists with this email"
 *                 error:
 *                   type: string
 *                   example: "Invalid email address"
 *       500:
 *         description: Error while sending OTP or updating OTP record.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "0"
 *                 message:
 *                   type: string
 *                   example: "Error sending OTP"
 *                 error:
 *                   type: string
 *                   example: "There was an issue while sending the OTP email"
 */

router.post('/forgetpasswordrequest', asyncMiddleware(driverController.forgetPasswordRequest));
//8. Verify OTP for password change
/**
 * @swagger
 * /driver/verifyotpforpass:
 *   post:
 *     tags:
 *       - Driver App --> Auth
 *     summary: Verify OTP for password reset
 *     description: This endpoint verifies the OTP sent to the user's email for resetting their password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               otpId:
 *                 type: integer
 *                 description: The ID of the OTP record.
 *                 example: 101
 *               OTP:
 *                 type: string
 *                 description: The OTP entered by the user.
 *                 example: "12345"
 *     responses:
 *       200:
 *         description: OTP verified successfully for password reset.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "1"
 *                 message:
 *                   type: string
 *                   example: "OTP verified"
 *                 data:
 *                   type: object
 *                   properties:
 *                     otpId:
 *                       type: integer
 *                       example: 101
 *                     userId:
 *                       type: integer
 *                       example: 123
 *       400:
 *         description: OTP verification failed or incorrect OTP.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "0"
 *                 message:
 *                   type: string
 *                   example: "You entered incorrect OTP"
 *                 error:
 *                   type: string
 *                   example: "Please enter correct OTP to continue"
 *       404:
 *         description: OTP record not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "0"
 *                 message:
 *                   type: string
 *                   example: "Sorry, we could not fetch the data"
 *                 error:
 *                   type: string
 *                   example: "Please resend OTP to continue"
 *       500:
 *         description: Internal server error while verifying OTP.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "0"
 *                 message:
 *                   type: string
 *                   example: "Error verifying OTP"
 *                 error:
 *                   type: string
 *                   example: "There was an issue while processing the OTP verification request"
 */

router.post('/verifyotpforpass', asyncMiddleware(driverController.verifyOTPforPassword));
//9. Change password in resposne to otp
/**
 * @swagger
 * /driver/changepasswordotp:
 *   post:
 *     tags:
 *       - Driver App --> Auth
 *     summary: Change password using verified OTP
 *     description: This endpoint allows the user to change their password after successfully verifying the OTP for password reset.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: The ID of the user whose password is being changed.
 *                 example: 123
 *               otpId:
 *                 type: integer
 *                 description: The ID of the OTP record associated with the password reset.
 *                 example: 101
 *               password:
 *                 type: string
 *                 description: The new password to set for the user.
 *                 example: "newSecurePassword123"
 *     responses:
 *       200:
 *         description: Password updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "1"
 *                 message:
 *                   type: string
 *                   example: "Password updated successfully. Please login to continue"
 *       400:
 *         description: Invalid OTP or OTP not verified yet.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "0"
 *                 message:
 *                   type: string
 *                   example: "OTP not verified yet"
 *                 error:
 *                   type: string
 *                   example: "Please verify OTP first"
 *       404:
 *         description: OTP or user not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "0"
 *                 message:
 *                   type: string
 *                   example: "Sorry, we could not fetch the data"
 *                 error:
 *                   type: string
 *                   example: "Please resend OTP to continue"
 *       500:
 *         description: Error while updating the password.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "0"
 *                 message:
 *                   type: string
 *                   example: "Error updating password"
 *                 error:
 *                   type: string
 *                   example: "There was an issue while processing the password update request"
 */

router.post('/changepasswordotp', asyncMiddleware(driverController.changePasswordOTP));
//9. Change password in profile
/**
 * @swagger
 * /driver/changepassword:
 *   post:
 *     tags:
 *       - Driver App --> Auth
 *     summary: Change user's password
 *     description: This endpoint allows the user to change their password after being authenticated.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The token to validate the request.
 *         schema:
 *           type: string
 *           example: "your_access_token_here"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 description: The new password to set for the user.
 *                 example: "newSecurePassword123"
 *     responses:
 *       200:
 *         description: Password updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "1"
 *                 message:
 *                   type: string
 *                   example: "Password updated successfully."
 *       400:
 *         description: Invalid request body or missing password.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "0"
 *                 message:
 *                   type: string
 *                   example: "Password is required."
 *       404:
 *         description: User not found or invalid user ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "0"
 *                 message:
 *                   type: string
 *                   example: "User not found."
 *       500:
 *         description: Internal server error while updating the password.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "0"
 *                 message:
 *                   type: string
 *                   example: "Error updating password."
 *                 error:
 *                   type: string
 *                   example: "There was an issue while processing the password update request."
 */

router.post('/changepassword', validateToken, asyncMiddleware(driverController.changePassword));
// 10. Resend OTP
/**
 * @swagger
 * /driver/resendotp:
 *   post:
 *     tags:
 *       - Driver App --> Auth
 *     summary: Resend OTP for email verification
 *     description: This endpoint resends the OTP to the user's email for verification purposes.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: The user ID of the driver to whom the OTP will be sent.
 *                 example: 123
 *     responses:
 *       200:
 *         description: OTP resent successfully to the user's email.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "1"
 *                 message:
 *                   type: string
 *                   example: "OTP sent successfully to johndoe@example.com"
 *                 data:
 *                   type: object
 *                   properties:
 *                     otpId:
 *                       type: integer
 *                       example: 101
 *       400:
 *         description: User not found or invalid user ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "0"
 *                 message:
 *                   type: string
 *                   example: "No user exists with this ID"
 *                 error:
 *                   type: string
 *                   example: "Invalid user ID"
 *       500:
 *         description: Error while sending OTP or updating OTP record.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "0"
 *                 message:
 *                   type: string
 *                   example: "Error sending OTP"
 *                 error:
 *                   type: string
 *                   example: "There was an issue while sending the OTP email"
 */

router.post('/resendotp', asyncMiddleware(driverController.resendOTP))
//11. Session API
/**
 * @swagger
 * /driver/session:
 *   get:
 *     tags:
 *       - Driver App --> Auth
 *     summary: Get current session details of the authenticated driver
 *     description: This endpoint fetches the session details of the authenticated driver based on the provided access token.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token to authenticate the user.
 *         schema:
 *           type: string
 *           example: "your_access_token_here"
 *     responses:
 *       200:
 *         description: Successfully fetched the session details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "1"
 *                 message:
 *                   type: string
 *                   example: "Session details fetched successfully."
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: integer
 *                       example: 123
 *                     firstName:
 *                       type: string
 *                       example: "John"
 *                     lastName:
 *                       type: string
 *                       example: "Doe"
 *                     email:
 *                       type: string
 *                       example: "johndoe@example.com"
 *                     status:
 *                       type: integer
 *                       example: 1
 *                     countryCode:
 *                       type: string
 *                       example: "+1"
 *                     phoneNum:
 *                       type: string
 *                       example: "5551234567"
 *                     image:
 *                       type: string
 *                       example: "/images/profile.jpg"
 *                     joinedOn:
 *                       type: string
 *                       example: "2023"
 *                     onlineStatus:
 *                       type: boolean
 *                       example: true
 *       3:
 *         description: Account does not exist.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "3"
 *                 message:
 *                   type: string
 *                   example: "Account does not exist"
 *                 error:
 *                   type: string
 *                   example: "Please create account to continue"
 *       4:
 *         description: User is blocked.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "4"
 *                 message:
 *                   type: string
 *                   example: "You are blocked by Admin"
 *                 error:
 *                   type: string
 *                   example: "Please contact support for more information"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "0"
 *                 message:
 *                   type: string
 *                   example: "Error fetching session details"
 *                 error:
 *                   type: string
 *                   example: "There was an issue while processing the request"
 */

router.get('/session', validateToken, asyncMiddleware(driverController.session));
//12. Log out

/**
 * @swagger
 * /driver/logout:
 *   get:
 *     tags:
 *       - Driver App --> Auth
 *     summary: Logout the user and remove the device token
 *     description: This endpoint logs the user out by removing the device token from the database and Redis.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token used for user authentication.
 *         schema:
 *           type: string
 *           example: "your_access_token_here"
 *     responses:
 *       200:
 *         description: User logged out successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "1"
 *                 message:
 *                   type: string
 *                   example: "Log-out successfully"
 *                 data:
 *                   type: object
 *                   properties: {}
 *       500:
 *         description: Internal server error while logging out.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "0"
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 *                 error:
 *                   type: string
 *                   example: "There is some error logging out. Please try again"
 */

router.get('/logout', validateToken ,asyncMiddleware(driverController.logout));
//13. Delete user
/**
 * @swagger
 * /driver/delete:
 *   get:
 *     tags:
 *       - Driver App --> Auth
 *     summary: Delete the user account
 *     description: This endpoint deletes the user's account after checking if the user has any ongoing bookings.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token for authenticating the user.
 *         schema:
 *           type: string
 *           example: "your_access_token_here"
 *     responses:
 *       200:
 *         description: User deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "1"
 *                 message:
 *                   type: string
 *                   example: "User deleted successfully"
 *                 data:
 *                   type: object
 *                   properties: {}
 *       400:
 *         description: User has ongoing bookings.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "0"
 *                 message:
 *                   type: string
 *                   example: "Driver has Bookings"
 *                 error:
 *                   type: string
 *                   example: ""
 *       500:
 *         description: Internal server error while deleting the user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "0"
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 *                 error:
 *                   type: string
 *                   example: "There was an issue while deleting the user account"
 */

router.get('/delete', validateToken, asyncMiddleware(driverController.deleteUser));

// ! _________________________________________________________________________
// ! Module 2: Home Page and order handling
//1. Home page api
/**
 * @swagger
 * /driver/homepage:
 *   get:
 *     tags:
 *       - Driver App --> Home
 *     summary: Get homepage details for the authenticated driver
 *     description: This endpoint retrieves the homepage data for the authenticated driver, including their approval status, license expiry status, and available drop-off jobs based on their vehicle's capacity.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token to authenticate the driver.
 *         schema:
 *           type: string
 *           example: "your_access_token_here"
 *     responses:
 *       200:
 *         description: Successfully retrieved homepage details for the driver.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "1"
 *                 message:
 *                   type: string
 *                   example: "Home Page"
 *                 data:
 *                   type: object
 *                   properties:
 *                     approvedByAdmin:
 *                       type: boolean
 *                       example: true
 *                     idExpired:
 *                       type: boolean
 *                       example: false
 *                     dropoffJobs:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           bookingId:
 *                             type: integer
 *                             example: 123
 *                           jobType:
 *                             type: string
 *                             example: "dropoff"
 *                           weightRequired:
 *                             type: number
 *                             example: 150
 *                           volumeRequired:
 *                             type: number
 *                             example: 10
 *       400:
 *         description: License expired or missing data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "1"
 *                 message:
 *                   type: string
 *                   example: "Home Page"
 *                 error:
 *                   type: string
 *                   example: "License expired. Please update it to continue."
 *       500:
 *         description: Internal server error while fetching homepage details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "0"
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 *                 error:
 *                   type: string
 *                   example: "There was an issue while fetching the homepage data."
 */

router.get('/homepage', validateToken, asyncMiddleware(driverController.homePageApi));
//2. Jobs by Date filter
/**
 * @swagger
 * /driver/jobsbydate:
 *   post:
 *     tags:
 *       - Driver App --> Home
 *     summary: Filter and get drop-off jobs by date
 *     description: This endpoint allows the driver to filter drop-off jobs by a specific date and the vehicle's capacity (weight and volume).
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token to authenticate the driver.
 *         schema:
 *           type: string
 *           example: "your_access_token_here"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 description: The date to filter jobs by (in YYYY-MM-DD format).
 *                 example: "2024-12-31"
 *     responses:
 *       200:
 *         description: Successfully fetched jobs based on the given filter (date and vehicle capacity).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "1"
 *                 message:
 *                   type: string
 *                   example: "Jobs by filter"
 *                 data:
 *                   type: object
 *                   properties:
 *                     dropoffJobs:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           bookingId:
 *                             type: integer
 *                             example: 123
 *                           jobType:
 *                             type: string
 *                             example: "dropoff"
 *                           weightRequired:
 *                             type: number
 *                             example: 150
 *                           volumeRequired:
 *                             type: number
 *                             example: 10
 *       400:
 *         description: Invalid date or user data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "0"
 *                 message:
 *                   type: string
 *                   example: "Invalid date format or user data"
 *       500:
 *         description: Internal server error while fetching jobs.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "0"
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 *                 error:
 *                   type: string
 *                   example: "There was an issue while fetching the drop-off jobs."
 */

router.post('/jobsbydate', validateToken, asyncMiddleware(driverController.jobsByDateFilter));
//3. Get all associated jobs
/**
 * @swagger
 * /driver/associatedjobs:
 *   post:
 *     tags:
 *       - Driver App --> Home
 *     summary: Get associated jobs for the driver
 *     description: This endpoint retrieves a list of jobs (assigned, ongoing, picked) associated with the driver, based on their current bookings and delivery status.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token for authenticating the driver.
 *         schema:
 *           type: string
 *           example: "your_access_token_here"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 description: The date for filtering jobs (optional).
 *                 example: "2024-12-31"
 *     responses:
 *       200:
 *         description: Successfully fetched associated jobs for the driver.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "1"
 *                 message:
 *                   type: string
 *                   example: "Job Pool"
 *                 data:
 *                   type: object
 *                   properties:
 *                     deliveryJobs:
 *                       type: object
 *                       properties:
 *                         assigned:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               bookingId:
 *                                 type: integer
 *                                 example: 123
 *                               jobType:
 *                                 type: string
 *                                 example: "assigned"
 *                               weightRequired:
 *                                 type: number
 *                                 example: 150
 *                               volumeRequired:
 *                                 type: number
 *                                 example: 10
 *                         ongoing:
 *                           type: object
 *                           properties:
 *                             group:
 *                               type: array
 *                               items:
 *                                 type: object
 *                             single:
 *                               type: array
 *                               items:
 *                                 type: object
 *                         picked:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               bookingId:
 *                                 type: integer
 *                                 example: 123
 *                               jobType:
 *                                 type: string
 *                                 example: "picked"
 *                               weightRequired:
 *                                 type: number
 *                                 example: 150
 *                               volumeRequired:
 *                                 type: number
 *                                 example: 10
 *       400:
 *         description: Invalid date or user data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "0"
 *                 message:
 *                   type: string
 *                   example: "Invalid date or user data"
 *       500:
 *         description: Internal server error while fetching associated jobs.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "0"
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 *                 error:
 *                   type: string
 *                   example: "There was an issue while fetching associated jobs."
 */

router.post('/associatedjobs', validateToken, asyncMiddleware(driverController.allAssociatedJobs))
//4. Get reasons for postpone
/**
 * @swagger
 * /driver/getReasons:
 *   get:
 *     tags:
 *       - Driver App --> Home
 *     summary: Get list of reasons
 *     description: This endpoint retrieves a list of available reasons from the database.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token to authenticate the driver.
 *         schema:
 *           type: string
 *           example: "your_access_token_here"
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of reasons.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "1"
 *                 message:
 *                   type: string
 *                   example: "Reasons List"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       reason:
 *                         type: string
 *                         example: "Driver late"
 *       500:
 *         description: Internal server error while fetching reasons.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "0"
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 *                 error:
 *                   type: string
 *                   example: "There was an issue while fetching the reasons list."
 */

router.get('/getReasons', validateToken, asyncMiddleware(driverController.getReasons))
//5. Postpone a booking
/**
 * @swagger
 * /driver/postponedBooking:
 *   post:
 *     tags:
 *       - Driver App --> Home
 *     summary: Postpone a booking
 *     description: This endpoint allows the driver to postpone a booking and update the status of associated orders. It also creates a record of the postponement with the reason.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token to authenticate the driver.
 *         schema:
 *           type: string
 *           example: "your_access_token_here"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               groupId:
 *                 type: integer
 *                 description: The group ID of the orders to be postponed.
 *                 example: 123
 *               reasonid:
 *                 type: integer
 *                 description: The ID of the reason for postponing the booking.
 *                 example: 1
 *               reasonDesc:
 *                 type: string
 *                 description: The description of the reason for postponing the booking.
 *                 example: "Driver unavailable"
 *     responses:
 *       200:
 *         description: Successfully postponed the booking and updated associated orders.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "1"
 *                 message:
 *                   type: string
 *                   example: "Bookings Postponed"
 *       400:
 *         description: Invalid request data or the booking cannot be postponed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "0"
 *                 message:
 *                   type: string
 *                   example: "Invalid booking status"
 *       404:
 *         description: The group ID or associated orders not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "0"
 *                 message:
 *                   type: string
 *                   example: "Group ID or orders not found"
 *       500:
 *         description: Internal server error while processing the postponement.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "0"
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 *                 error:
 *                   type: string
 *                   example: "There was an issue while postponing the booking."
 */

router.post('/postponedBooking', validateToken, asyncMiddleware(driverController.postponedBooking))
//6. Change Status - cancelled
/**
 * @swagger
 * /driver/cancelled:
 *   post:
 *     tags:
 *       - Driver App --> Home
 *     summary: Cancel a booking by the driver
 *     description: This endpoint allows a driver to cancel a booking that they have accepted, provided the booking is in an acceptable status.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token for authenticating the driver.
 *         schema:
 *           type: string
 *           example: "your_access_token_here"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookingId:
 *                 type: integer
 *                 description: The booking ID of the job to be cancelled.
 *                 example: 123
 *     responses:
 *       200:
 *         description: Successfully cancelled the booking.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "1"
 *                 message:
 *                   type: string
 *                   example: "Booking canceled"
 *       400:
 *         description: The booking is in an invalid state to be cancelled.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "0"
 *                 message:
 *                   type: string
 *                   example: "You cannot cancel jobs at this stage."
 *       404:
 *         description: Booking not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "0"
 *                 message:
 *                   type: string
 *                   example: "Booking Not Found"
 *       500:
 *         description: Internal server error while processing the cancellation.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "0"
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 *                 error:
 *                   type: string
 *                   example: "There was an issue while cancelling the booking."
 */

router.post('/cancelled', validateToken, asyncMiddleware(driverController.cancelled))

// ! _________________________________________________________________________
// ! Sub module 2.1: Delivery side
//1. Booking Details
/**
 * @swagger
 * /driver/bookingdetails:
 *   post:
 *     tags:
 *       - Driver App --> Delivery Side
 *     summary: Fetch booking details by booking ID
 *     description: This endpoint allows the driver to fetch the details of a specific booking, including dropoff and delivery information, customer details, and package information.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token to authenticate the driver.
 *         schema:
 *           type: string
 *           example: "your_access_token_here"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookingId:
 *                 type: integer
 *                 description: The ID of the booking for which details are requested.
 *                 example: 123
 *     responses:
 *       200:
 *         description: Successfully fetched the booking details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "1"
 *                 message:
 *                   type: string
 *                   example: "Booking Details"
 *                 data:
 *                   type: object
 *                   properties:
 *                     bookingId:
 *                       type: integer
 *                       example: 123
 *                     trackingId:
 *                       type: string
 *                       example: "TSH-12345"
 *                     pickupCode:
 *                       type: string
 *                       example: "12345"
 *                     PickUpPoint:
 *                       type: string
 *                       example: "Warehouse XYZ, 123 Main St, City, Province, 12345, Country"
 *                     dropoffPoint:
 *                       type: string
 *                       example: "456 Elm St, City, Province, 67890, Country"
 *                     weight:
 *                       type: integer
 *                       example: 10
 *                     length:
 *                       type: integer
 *                       example: 50
 *                     width:
 *                       type: integer
 *                       example: 30
 *                     height:
 *                       type: integer
 *                       example: 20
 *                     distance:
 *                       type: string
 *                       example: "5.5 miles"
 *                     earning:
 *                       type: string
 *                       example: "$20.00"
 *                     customer:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 101
 *                         firstName:
 *                           type: string
 *                           example: "John"
 *                         lastName:
 *                           type: string
 *                           example: "Doe"
 *                         phoneNum:
 *                           type: string
 *                           example: "+1234567890"
 *                         email:
 *                           type: string
 *                           example: "john.doe@example.com"
 *                     Packages:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           weight:
 *                             type: integer
 *                             example: 10
 *                           length:
 *                             type: integer
 *                             example: 50
 *                           width:
 *                             type: integer
 *                             example: 30
 *                           height:
 *                             type: integer
 *                             example: 20
 *                           instruction:
 *                             type: string
 *                             example: "Handle with care"
 *                           category:
 *                             type: string
 *                             example: "Electronics"
 *                           company:
 *                             type: string
 *                             example: "Ecommerce Co."
 *       400:
 *         description: Invalid booking ID or the booking cannot be found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "0"
 *                 message:
 *                   type: string
 *                   example: "Booking not found"
 *       500:
 *         description: Internal server error while fetching the booking details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "0"
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 *                 error:
 *                   type: string
 *                   example: "There was an issue while fetching the booking details."
 */
router.post('/bookingdetails', validateToken, asyncMiddleware(driverController.bookingDetailsById))
//2. Assigned to On going jobs
/**
 * @swagger
 * /driver/assignedtoongoing:
 *   post:
 *     tags:
 *       - Driver App --> Delivery Side
 *     summary: Assign selected bookings to ongoing status
 *     description: This endpoint allows a driver to assign selected bookings to ongoing status, marking the jobs as in progress for delivery.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token to authenticate the driver.
 *         schema:
 *           type: string
 *           example: "your_access_token_here"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookingIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: List of booking IDs to be marked as ongoing.
 *                 example: [123, 456, 789]
 *     responses:
 *       200:
 *         description: Successfully updated the status of the bookings and assigned them to ongoing.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "1"
 *                 message:
 *                   type: string
 *                   example: "Order status updated"
 *                 data:
 *                   type: object
 *                   properties:
 *                     groupId:
 *                       type: integer
 *                       example: 1
 *       400:
 *         description: Invalid booking IDs or the booking cannot be found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "0"
 *                 message:
 *                   type: string
 *                   example: "Invalid booking IDs"
 *       500:
 *         description: Internal server error while assigning the bookings to ongoing status.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "0"
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 *                 error:
 *                   type: string
 *                   example: "There was an issue while updating the booking statuses."
 */

router.post('/assignedtoongoing', validateToken, asyncMiddleware(driverController.pJobsToOngoing))
//3. Change Status - picked
/**
 * @swagger
 * /driver/picked:
 *   post:
 *     tags:
 *       - Driver App --> Delivery Side
 *     summary: Mark a booking as picked
 *     description: This endpoint allows a driver to mark a booking as "Picked" during the pickup stage.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token to authenticate the driver.
 *         schema:
 *           type: string
 *           example: "your_access_token_here"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookingId:
 *                 type: integer
 *                 description: The ID of the booking to mark as picked.
 *                 example: 123
 *     responses:
 *       200:
 *         description: Successfully marked the booking as picked and updated the booking status.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "1"
 *                 message:
 *                   type: string
 *                   example: "Booking Updated"
 *       400:
 *         description: Invalid booking ID or the booking cannot be found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "0"
 *                 message:
 *                   type: string
 *                   example: "Booking not found"
 *       500:
 *         description: Internal server error while updating the booking status.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "0"
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 *                 error:
 *                   type: string
 *                   example: "There was an issue while updating the booking."
 */

router.post('/picked', validateToken, asyncMiddleware(driverController.picked))
//4. Book Job Delivery
/**
 * @swagger
 * /driver/bookJobDelivery:
 *   post:
 *     tags:
 *       - Driver App --> Delivery Side
 *     summary: Accept a booking for delivery
 *     description: This endpoint allows a driver to accept a delivery booking and marks the booking status as "Accepted (Delivery)".
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token to authenticate the driver.
 *         schema:
 *           type: string
 *           example: "your_access_token_here"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookingId:
 *                 type: integer
 *                 description: The ID of the booking to be accepted.
 *                 example: 123
 *     responses:
 *       200:
 *         description: Successfully booked the delivery job and updated the booking status.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "1"
 *                 message:
 *                   type: string
 *                   example: "Job Booked"
 *       400:
 *         description: Invalid booking ID or the booking cannot be found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "0"
 *                 message:
 *                   type: string
 *                   example: "Booking not found"
 *       500:
 *         description: Internal server error while booking the job.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "0"
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 *                 error:
 *                   type: string
 *                   example: "There was an issue while booking the job."
 */
router.post('/bookJobDelivery', validateToken, asyncMiddleware(driverController.bookJobDelivery))
//5. Group Detail Delivery
/**
 * @swagger
 * /driver/groupDetailDelivery:
 *   post:
 *     tags:
 *       - Driver App --> Delivery Side
 *     summary: Get or assign a delivery sequence for a group of orders based on the driver's current location and optimized route.
 *     description: This endpoint is used by the driver to get a sorted sequence for a group of delivery orders based on the driver's current location or preset sequence.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token to authenticate the driver.
 *         schema:
 *           type: string
 *           example: "your_access_token_here"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               groupId:
 *                 type: integer
 *                 description: The ID of the group for which the delivery sequence is required.
 *                 example: 1
 *     responses:
 *       200:
 *         description: Successfully retrieved or assigned the group orders' sequence.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "1"
 *                 message:
 *                   type: string
 *                   example: "All group orders"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       bookingId:
 *                         type: integer
 *                         example: 123
 *                       trackingId:
 *                         type: string
 *                         example: "ABC123"
 *                       dropOffPoint:
 *                         type: object
 *                         properties:
 *                           lat:
 *                             type: number
 *                             example: 40.7128
 *                           lng:
 *                             type: number
 *                             example: -74.0060
 *                           streetAddress:
 *                             type: string
 *                             example: "123 Main St"
 *                           city:
 *                             type: string
 *                             example: "New York"
 *       400:
 *         description: Invalid group ID or no group found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "0"
 *                 message:
 *                   type: string
 *                   example: "No group found"
 *       500:
 *         description: Error during route optimization or fetching driver's location.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "0"
 *                 message:
 *                   type: string
 *                   example: "Error during route optimization"
 *                 error:
 *                   type: string
 *                   example: "No route found for this group"
 */

router.post('/groupDetailDelivery', validateToken, asyncMiddleware(driverController.groupDetailDelivery))
//6. Reached Delivery
/**
 * @swagger
 * /driver/reachedDelivery:
 *   post:
 *     tags:
 *       - Driver App --> Delivery Side
 *     summary: Mark a delivery as reached by the driver.
 *     description: This endpoint is used to update the booking status to "Reached (Delivery)" when the driver arrives at the delivery point.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token to authenticate the driver.
 *         schema:
 *           type: string
 *           example: "your_access_token_here"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookingId:
 *                 type: integer
 *                 description: The ID of the booking that the driver has reached at the delivery point.
 *                 example: 123
 *     responses:
 *       200:
 *         description: Successfully updated the booking status to "Reached (Delivery)".
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "1"
 *                 message:
 *                   type: string
 *                   example: "Driver Reached at Delivery Point"
 *       400:
 *         description: Invalid booking ID or no booking found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "0"
 *                 message:
 *                   type: string
 *                   example: "Booking not found"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "0"
 *                 message:
 *                   type: string
 *                   example: "An error occurred while updating the booking status"
 */

router.post('/reachedDelivery', validateToken, asyncMiddleware(driverController.reachedDelivery))
//7. Delivered Delivery
const uploadSignature = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, `./Public/SignatureImages`)
    },
    filename: (req, file, cb) => {
        cb(null, 'SigImg-'+  Date.now() +  path.extname(file.originalname))
    }
})
const uploadSig = multer({
    storage: uploadSignature,
});
/**
 * @swagger
 * /driver/deliveredDelivery:
 *   post:
 *     tags:
 *       - Driver App --> Delivery Side
 *     summary: Mark a delivery as delivered by the driver.
 *     description: This endpoint is used to update the booking status to "Delivered" and associate a signature image with the booking when the driver delivers the parcel.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token to authenticate the driver.
 *         schema:
 *           type: string
 *           example: "your_access_token_here"
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               bookingId:
 *                 type: integer
 *                 description: The ID of the booking that the driver has completed delivery for.
 *                 example: 123
 *               signatureFile:
 *                 type: string
 *                 format: binary
 *                 description: Signature image uploaded by the customer to confirm the delivery.
 *     responses:
 *       200:
 *         description: Successfully updated the booking status to "Delivered".
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "1"
 *                 message:
 *                   type: string
 *                   example: "Delivered"
 *       400:
 *         description: Invalid booking ID or no booking found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "0"
 *                 message:
 *                   type: string
 *                   example: "Booking not found"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "0"
 *                 message:
 *                   type: string
 *                   example: "An error occurred while updating the booking status"
 */

router.post('/deliveredDelivery', validateToken, uploadSig.single('signatureFile') , asyncMiddleware(driverController.deliveredDelivery))

// ! _____________________________________ ____________________________________
// ! Module 3: Profile

//1. get profile
/**
 * @swagger
 * /driver/getProfile:
 *   get:
 *     tags:
 *       - Driver App --> Profile
 *     summary: Get the user's profile information.
 *     description: This endpoint is used to retrieve the profile data of the authenticated driver.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token to authenticate the driver.
 *         schema:
 *           type: string
 *           example: "your_access_token_here"
 *     responses:
 *       200:
 *         description: Successfully retrieved the user's profile information.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "1"
 *                 message:
 *                   type: string
 *                   example: "User Profile"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 123
 *                     firstName:
 *                       type: string
 *                       example: "John"
 *                     lastName:
 *                       type: string
 *                       example: "Doe"
 *                     email:
 *                       type: string
 *                       example: "john.doe@example.com"
 *                     countryCode:
 *                       type: string
 *                       example: "+1"
 *                     phoneNum:
 *                       type: string
 *                       example: "1234567890"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-01T00:00:00Z"
 *                     image:
 *                       type: string
 *                       example: "https://example.com/image.jpg"
 *       400:
 *         description: Invalid or expired access token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "0"
 *                 message:
 *                   type: string
 *                   example: "Invalid or expired access token."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "0"
 *                 message:
 *                   type: string
 *                   example: "An error occurred while retrieving the profile."
 */

router.get('/getProfile', validateToken, asyncMiddleware(driverController.getProfile))
//2. update profile
/**
 * @swagger
 * /driver/updateProfile:
 *   post:
 *     summary: Update the driver profile
 *     description: This API is used to update the driver's profile information, including the first name, last name, and profile image.
 *     tags:
 *       - Driver App --> Profile
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Access token of the user.
 *         schema:
 *           type: string
 *           example: 'your-access-token-here'
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: The first name of the driver.
 *                 example: 'John'
 *               lastName:
 *                 type: string
 *                 description: The last name of the driver.
 *                 example: 'Doe'
 *               image:
 *                 type: string
 *                 description: A flag indicating whether an image is uploaded or not.
 *                 enum: ['true', 'false']
 *                 example: 'true'
 *               profileImage:
 *                 type: string
 *                 format: binary
 *                 description: The profile image file of the driver (only required if `image` is set to "true").
 *     responses:
 *       '200':
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: '1'
 *                 message:
 *                   type: string
 *                   example: 'User Profile Updated'
 *       '400':
 *         description: Invalid input data or image not uploaded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: '0'
 *                 message:
 *                   type: string
 *                   example: 'Image Not Uploaded'
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: '0'
 *                 message:
 *                   type: string
 *                   example: 'Internal Server Error'
 */

router.post('/updateProfile', uploadProfile.single('profileImage'), validateToken, asyncMiddleware(driverController.updateProfile))
//3. get vehicle Detail
/**
 * @swagger
 * /driver/getVehData:
 *   get:
 *     summary: Get vehicle data and images for the driver
 *     description: This API is used to fetch the vehicle data along with associated images for the driver.
 *     tags:
 *       - Driver App --> Profile
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Access token of the user to authenticate the request.
 *         schema:
 *           type: string
 *           example: 'your-access-token-here'
 *     responses:
 *       '200':
 *         description: Vehicle data and images retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: '1'
 *                 message:
 *                   type: string
 *                   example: 'Vehicle Data'
 *                 data:
 *                   type: object
 *                   properties:
 *                     vehicData:
 *                       type: object
 *                       description: Vehicle details for the driver.
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         userId:
 *                           type: integer
 *                           example: 123
 *                         vehicleMake:
 *                           type: string
 *                           example: 'Toyota'
 *                         vehicleModel:
 *                           type: string
 *                           example: 'Corolla'
 *                         vehicleYear:
 *                           type: integer
 *                           example: 2020
 *                         vehicleColor:
 *                           type: string
 *                           example: 'Red'
 *                     vehicImages:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           image:
 *                             type: string
 *                             description: URL of the vehicle image
 *                             example: 'https://example.com/path/to/image.jpg'
 *       '401':
 *         description: Unauthorized access - access token is missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: '0'
 *                 message:
 *                   type: string
 *                   example: 'Unauthorized'
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: '0'
 *                 message:
 *                   type: string
 *                   example: 'Internal Server Error'
 */

router.get('/getVehData', validateToken, asyncMiddleware(driverController.getVehData))
//4. update vehicle Detail
/**
 * @swagger
 * /driver/updateVehData:
 *   post:
 *     summary: Update vehicle data for the driver
 *     description: This API is used to update the vehicle data for the driver, including license information and vehicle details.
 *     tags:
 *       - Driver App --> Profile
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Access token of the user to authenticate the request.
 *         schema:
 *           type: string
 *           example: 'your-access-token-here'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               licIssueDate:
 *                 type: string
 *                 example: '2021-01-01'
 *               licExpiryDate:
 *                 type: string
 *                 example: '2025-01-01'
 *               vehicleMake:
 *                 type: string
 *                 example: 'Toyota'
 *               vehicleModel:
 *                 type: string
 *                 example: 'Corolla'
 *               vehicleYear:
 *                 type: integer
 *                 example: 2020
 *               vehicleColor:
 *                 type: string
 *                 example: 'Red'
 *               vehicleTypeId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       '200':
 *         description: Vehicle data updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: '1'
 *                 message:
 *                   type: string
 *                   example: 'Vehicle Data Updated'
 *                 data:
 *                   type: object
 *                   properties:
 *                     licIssueDate:
 *                       type: string
 *                       example: '2021-01-01'
 *                     licExpiryDate:
 *                       type: string
 *                       example: '2025-01-01'
 *                     vehicleMake:
 *                       type: string
 *                       example: 'Toyota'
 *                     vehicleModel:
 *                       type: string
 *                       example: 'Corolla'
 *                     vehicleYear:
 *                       type: integer
 *                       example: 2020
 *                     vehicleColor:
 *                       type: string
 *                       example: 'Red'
 *                     vehicleTypeId:
 *                       type: integer
 *                       example: 1
 *       '401':
 *         description: Unauthorized access - access token is missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: '0'
 *                 message:
 *                   type: string
 *                   example: 'Unauthorized'
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: '0'
 *                 message:
 *                   type: string
 *                   example: 'Internal Server Error'
 */

router.post('/updateVehData', validateToken, asyncMiddleware(driverController.updateVehData))
//5. disable vehicle image
/**
 * @swagger
 * /driver/disableVehicImage:
 *   post:
 *     summary: Disable (delete) vehicle image for a driver
 *     description: This API is used to disable a vehicle image by deleting it from the system.
 *     tags:
 *       - Driver App --> Profile
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the driver to authenticate the request.
 *         schema:
 *           type: string
 *           example: 'your-access-token-here'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               vehicImageId:
 *                 type: integer
 *                 example: 1
 *                 description: The ID of the vehicle image to disable.
 *     responses:
 *       '200':
 *         description: Image disabled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: '1'
 *                 message:
 *                   type: string
 *                   example: 'Image Disabled'
 *       '400':
 *         description: Image not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: '0'
 *                 message:
 *                   type: string
 *                   example: 'Image not found'
 *       '401':
 *         description: Unauthorized access - access token is missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: '0'
 *                 message:
 *                   type: string
 *                   example: 'Unauthorized'
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: '0'
 *                 message:
 *                   type: string
 *                   example: 'Internal Server Error'
 */

router.post('/disableVehicImage', validateToken, asyncMiddleware(driverController.disableVehicImage))
//6. get customer support
/**
 * @swagger
 * /driver/getCustomerSupport:
 *   get:
 *     summary: Get customer support details and FAQs
 *     description: This API retrieves the customer support email, phone, and FAQs.
 *     tags:
 *       - Driver App --> Profile
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the driver to authenticate the request.
 *         schema:
 *           type: string
 *           example: 'your-access-token-here'
 *     responses:
 *       '200':
 *         description: Customer support details and FAQs fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: '1'
 *                 message:
 *                   type: string
 *                   example: 'Customer Support'
 *                 data:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                       example: 'support@example.com'
 *                     phone:
 *                       type: string
 *                       example: '+1234567890'
 *                     faqs:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           question:
 *                             type: string
 *                             example: 'How do I reset my password?'
 *                           answer:
 *                             type: string
 *                             example: 'You can reset your password by going to the account settings and clicking on "Reset Password".'
 *       '401':
 *         description: Unauthorized access - access token is missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: '0'
 *                 message:
 *                   type: string
 *                   example: 'Unauthorized'
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: '0'
 *                 message:
 *                   type: string
 *                   example: 'Internal Server Error'
 */
router.get('/getCustomerSupport', validateToken, asyncMiddleware(driverController.getCustomerSupport))
//7. completed orders
/**
 * @swagger
 * /driver/getCompletedOrders:
 *   get:
 *     summary: Get all completed orders for the driver
 *     description: This API retrieves a list of all completed orders (delivered orders) assigned to the driver.
 *     tags:
 *       - Driver App --> Profile
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the driver to authenticate the request.
 *         schema:
 *           type: string
 *           example: 'your-access-token-here'
 *     responses:
 *       '200':
 *         description: Successfully retrieved completed orders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: '1'
 *                 message:
 *                   type: string
 *                   example: 'Completed Jobs'
 *                 data:
 *                   type: object
 *                   properties:
 *                     deliveryjobs:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           trackingId:
 *                             type: string
 *                             example: 'T12345678'
 *                           status:
 *                             type: string
 *                             example: 'Delivered'
 *                           deliveredAt:
 *                             type: string
 *                             example: '2024-12-31T14:00:00Z'
 *                           pickup:
 *                             type: string
 *                             example: '123 Main St, City, District, 12345, Country'
 *                           dropoff:
 *                             type: string
 *                             example: '456 Elm St, City, District, 67890, Country'
 *                           total:
 *                             type: string
 *                             example: '15.00'
 *       '401':
 *         description: Unauthorized access - access token is missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: '0'
 *                 message:
 *                   type: string
 *                   example: 'Unauthorized'
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: '0'
 *                 message:
 *                   type: string
 *                   example: 'Internal Server Error'
 */

router.get('/getCompletedOrders', validateToken, asyncMiddleware(driverController.getCompletedOrders))
//8. delete licence
/**
 * @swagger
 * /driver/deleteLic:
 *   post:
 *     summary: Delete the driver's license image
 *     description: This API allows the driver to delete either the front or back image of their license.
 *     tags:
 *       - Driver App --> Profile
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the driver to authenticate the request.
 *         schema:
 *           type: string
 *           example: 'your-access-token-here'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               licImage:
 *                 type: string
 *                 description: The license image to delete.
 *                 enum: ['licFrontImage', 'licBackImage']
 *                 example: 'licFrontImage'
 *     responses:
 *       '200':
 *         description: Successfully deleted the license image
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: '1'
 *                 message:
 *                   type: string
 *                   example: 'License Deleted'
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: ''
 *       '400':
 *         description: Bad Request - Invalid `licImage` value
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: '0'
 *                 message:
 *                   type: string
 *                   example: 'Invalid licImage value. Must be either "licFrontImage" or "licBackImage".'
 *       '401':
 *         description: Unauthorized access - access token is missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: '0'
 *                 message:
 *                   type: string
 *                   example: 'Unauthorized'
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: '0'
 *                 message:
 *                   type: string
 *                   example: 'Internal Server Error'
 */

router.post('/deleteLic', validateToken, asyncMiddleware(driverController.deleteLic))
//9. get wallet
/**
 * @swagger
 * /driver/getWallet:
 *   get:
 *     summary: Get the driver's wallet details
 *     description: This API returns the driver's total earnings, available balance, bank details, and transaction history.
 *     tags:
 *       - Driver App --> Profile
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the driver to authenticate the request.
 *         schema:
 *           type: string
 *           example: 'your-access-token-here'
 *     responses:
 *       '200':
 *         description: Successfully retrieved the wallet information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: '1'
 *                 message:
 *                   type: string
 *                   example: 'Wallet'
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalEarning:
 *                       type: string
 *                       example: '-100.00'
 *                     availableBalance:
 *                       type: string
 *                       example: '50.00'
 *                     bank:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         bankName:
 *                           type: string
 *                           example: 'Bank ABC'
 *                         accountName:
 *                           type: string
 *                           example: 'John Doe'
 *                         accountNumber:
 *                           type: string
 *                           example: '1234567890'
 *                     transactions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           amount:
 *                             type: string
 *                             example: '$100.00'
 *                           type:
 *                             type: string
 *                             example: 'paid'
 *                           date:
 *                             type: string
 *                             example: '12-01-2024 10:00:00 AM'
 *       '401':
 *         description: Unauthorized access - access token is missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: '0'
 *                 message:
 *                   type: string
 *                   example: 'Unauthorized'
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: '0'
 *                 message:
 *                   type: string
 *                   example: 'Internal Server Error'
 */

router.get('/getWallet', validateToken, asyncMiddleware(driverController.getWallet))
//10. add bank
/**
 * @swagger
 * /driver/addBank:
 *   post:
 *     summary: Add or update bank details for the driver
 *     description: This API allows the driver to add or update their bank account details. If the driver already has bank details, it will update them.
 *     tags:
 *       - Driver App --> Profile
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the driver to authenticate the request.
 *         schema:
 *           type: string
 *           example: 'your-access-token-here'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bankName:
 *                 type: string
 *                 example: 'Bank ABC'
 *               accountName:
 *                 type: string
 *                 example: 'John Doe'
 *               accountNumber:
 *                 type: string
 *                 example: '1234567890'
 *     responses:
 *       '200':
 *         description: Successfully added or updated bank details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: '1'
 *                 message:
 *                   type: string
 *                   example: 'Bank Added'
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: integer
 *                       example: 1
 *                     bankName:
 *                       type: string
 *                       example: 'Bank ABC'
 *                     accountName:
 *                       type: string
 *                       example: 'John Doe'
 *                     accountNumber:
 *                       type: string
 *                       example: '1234567890'
 *       '400':
 *         description: Bad Request - Invalid data provided
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: '0'
 *                 message:
 *                   type: string
 *                   example: 'Invalid data'
 *       '401':
 *         description: Unauthorized access - access token is missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: '0'
 *                 message:
 *                   type: string
 *                   example: 'Unauthorized'
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: '0'
 *                 message:
 *                   type: string
 *                   example: 'Internal Server Error'
 */

router.post('/addBank', validateToken, asyncMiddleware(driverController.addBank))
//11. send withdraw request
/**
 * @swagger
 * /driver/updateBank:
 *   post:
 *     summary: Update the driver's bank details
 *     description: This API allows the driver to update their bank account details such as bank name, account name, and account number.
 *     tags:
 *       - Driver App --> Profile
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the driver to authenticate the request.
 *         schema:
 *           type: string
 *           example: 'your-access-token-here'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bankName:
 *                 type: string
 *                 description: The name of the bank.
 *                 example: 'Bank of America'
 *               accountName:
 *                 type: string
 *                 description: The name of the account holder.
 *                 example: 'John Doe'
 *               accountNumber:
 *                 type: string
 *                 description: The account number of the bank account.
 *                 example: '123456789012'
 *     responses:
 *       '200':
 *         description: Successfully updated the bank details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: '1'
 *                 message:
 *                   type: string
 *                   example: 'Bank Updated'
 *                 data:
 *                   type: object
 *                   properties:
 *                     bankName:
 *                       type: string
 *                       example: 'Bank of America'
 *                     accountName:
 *                       type: string
 *                       example: 'John Doe'
 *                     accountNumber:
 *                       type: string
 *                       example: '123456789012'
 *       '400':
 *         description: Bad Request - Invalid `bankName`, `accountName`, or `accountNumber` values
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: '0'
 *                 message:
 *                   type: string
 *                   example: 'Invalid data provided'
 *       '401':
 *         description: Unauthorized access - access token is missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: '0'
 *                 message:
 *                   type: string
 *                   example: 'Unauthorized'
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: '0'
 *                 message:
 *                   type: string
 *                   example: 'Internal Server Error'
 */

router.post('/updateBank', validateToken, asyncMiddleware(driverController.updateBank))
//12. send withdraw request
/**
 * @swagger
 * /driver/sendWithdrawRequest:
 *   post:
 *     summary: Submit a withdrawal request
 *     description: This API allows the driver to submit a withdrawal request for a specified amount, ensuring that the amount requested does not exceed the available balance.
 *     tags:
 *       - Driver App --> Profile
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the driver to authenticate the request.
 *         schema:
 *           type: string
 *           example: 'your-access-token-here'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 description: The amount the driver wants to withdraw.
 *                 example: 100.00
 *     responses:
 *       '200':
 *         description: Successfully sent the withdraw request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: '1'
 *                 message:
 *                   type: string
 *                   example: 'Withdraw Request Sent'
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     userId:
 *                       type: integer
 *                       example: 123
 *                     amount:
 *                       type: number
 *                       example: 100.00
 *                     status:
 *                       type: string
 *                       example: 'pending'
 *                     date:
 *                       type: string
 *                       example: '2024-12-31'
 *                     time:
 *                       type: string
 *                       example: '15:30:00'
 *       '400':
 *         description: Bad Request - Requested amount exceeds available balance
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: '0'
 *                 message:
 *                   type: string
 *                   example: 'The requested amount is greater than balance. Please lower your amount and try again.'
 *       '401':
 *         description: Unauthorized access - access token is missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: '0'
 *                 message:
 *                   type: string
 *                   example: 'Unauthorized'
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: '0'
 *                 message:
 *                   type: string
 *                   example: 'Internal Server Error'
 */

router.post('/sendWithdrawRequest', validateToken, asyncMiddleware(driverController.sendWithdrawRequest))

//4. Book a job 
// router.post('/bookjobdropoff', validateToken, asyncMiddleware(driverController.assignJobToDriverDropOff))
// //7. Get all group orders 
// router.post('/getgrouporders', validateToken, asyncMiddleware(driverController.allGroupOrders))
// //8. Change Status
// router.post('/changestatus', validateToken, asyncMiddleware(driverController.changeStatus))

router.get('/test', asyncMiddleware(driverController.testAPI));

router.get("/testNotification",asyncMiddleware(driverController.testNot))

module.exports = router;