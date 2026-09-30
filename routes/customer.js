const express = require('express');
const router = express();
const userController = require('../controller/customer');
const userControllerN = require('../controller/warehouse');
const adminController=require('../controller/admin')
const asyncMiddleware = require('../middleware/async');
const validateToken = require('../middleware/validateToken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Stripe = require('../controller/stripe')
const driverController = require('../controller/driver');

// Helper function to ensure directory exists
const ensureDirExists = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

// ! Module 1: Authentication 
//1. Send OTP for registration
/**
 * @swagger
 * /customer/sendotp:
 *   post:
 *     tags:
 *      - Customer --> Auth
 *     summary: Send OTP for Email Verification
 *     description: This endpoint sends a One-Time Password (OTP) to the user's email for verification. If the user doesn't exist, a new user is created, and an OTP is sent.
 *     requestBody:
 *       description: User details required for sending OTP
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: User's email address
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 description: User's password for account creation
 *                 example: MySecurePassword123!
 *               dvToken:
 *                 type: string
 *                 description: Device token for push notifications (optional)
 *                 example: xyz12345
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: OTP sent successfully
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
 *                   example: "OTP sent successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     otpId:
 *                       type: integer
 *                       example: 101
 *                     userId:
 *                       type: integer
 *                       example: 15
 *       400:
 *         description: Bad Request
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
 *                   example: "Invalid request data"
 *       500:
 *         description: Server error
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
 *                   example: "Error details"
 */
router.post('/sendotp', asyncMiddleware(userController.sendOTP))

/**
 * @swagger
 * /customer/resendOTP:
 *   post:
 *     tags:
 *       - Customer --> Auth
 *     summary: Resend OTP for Email Verification
 *     description: This endpoint resends a One-Time Password (OTP) to the user's email for verification purposes. The OTP is updated or created if it doesn't already exist.
 *     requestBody:
 *       description: User ID for whom the OTP needs to be resent
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID of the user who needs the OTP
 *                 example: 15
 *             required:
 *               - userId
 *     responses:
 *       200:
 *         description: OTP sent successfully
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
 *                   example: OTP sent successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     otpId:
 *                       type: integer
 *                       example: 102
 *       400:
 *         description: Bad Request
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
 *                   example: Error sending OTP
 *                 error:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Server error
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
 *                   example: Internal server error
 *                 error:
 *                   type: string
 *                   example: "Error details"
 */

router.post('/resendOTP', asyncMiddleware(userController.resendOTP))

/**
 * @swagger
 * /customer/verifyotpsignup:
 *   post:
 *     tags:
 *       - Customer --> Auth
 *     summary: Verify OTP for Sign-Up
 *     description: Verifies the OTP provided by the user during the sign-up process. If valid, it marks the user as verified and creates a Stripe customer for them.
 *     requestBody:
 *       description: OTP verification details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               otpId:
 *                 type: integer
 *                 description: ID of the OTP record
 *                 example: 101
 *               OTP:
 *                 type: string
 *                 description: OTP sent to the user's email
 *                 example: "1234"
 *               userId:
 *                 type: integer
 *                 description: ID of the user to be verified
 *                 example: 15
 *             required:
 *               - otpId
 *               - OTP
 *               - userId
 *     responses:
 *       200:
 *         description: OTP verified successfully
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
 *                   example: OTP verified
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: integer
 *                       example: 15
 *       400:
 *         description: OTP verification failed
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
 *                   example: Incorrect OTP
 *                 error:
 *                   type: string
 *                   example: "You entered incorrect OTP"
 *       500:
 *         description: Server error
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
 *                   example: Internal server error
 *                 error:
 *                   type: string
 *                   example: "Error details"
 */

router.post('/verifyotpsignup', asyncMiddleware(userController.verifyOTPforSignUp))


// for taking profile picture of customer
const uploadProfileImgs = multer.diskStorage({
    destination: (req, file, cb) => {
        const dirPath = `./Public/Profile`;
        ensureDirExists(dirPath);
        cb(null, dirPath)
    },
    filename: (req, file, cb) => {
        cb(null, 'profile-' + req?.user?.id + '-' + Date.now() +  path.extname(file.originalname))
    }
})
const uploadProfile = multer({
    storage: uploadProfileImgs,
});

//2. Register user


/**
 * @swagger
 * /customer/register:
 *   post:
 *     tags:
 *       - Customer --> Auth
 *     summary: Register a new user
 *     description: This endpoint registers a new user, verifies their OTP, and updates their profile. It also handles the profile image upload using `multer`.
 *     requestBody:
 *       description: User registration details
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: User's first name
 *                 example: John
 *               lastName:
 *                 type: string
 *                 description: User's last name
 *                 example: Doe
 *               userId:
 *                 type: integer
 *                 description: ID of the user
 *                 example: 15
 *               countryCode:
 *                 type: string
 *                 description: User's country code
 *                 example: +1
 *               phoneNum:
 *                 type: string
 *                 description: User's phone number
 *                 example: 1234567890
 *               dvToken:
 *                 type: string
 *                 description: Device token for notifications
 *                 example: abc12345
 *               languageCheck:
 *                 type: string
 *                 description: User's preferred language
 *                 example: en
 *               profileImage:
 *                 type: string
 *                 format: binary
 *                 description: Profile image file to upload
 *             required:
 *               - firstName
 *               - lastName
 *               - userId
 *               - countryCode
 *               - phoneNum
 *               - dvToken
 *     responses:
 *       200:
 *         description: User registered successfully
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
 *                   example: User Register Successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     virtualBoxNumber:
 *                       type: string
 *                       example: VB123456
 *                     warehouseAddress:
 *                       type: string
 *                       example: 123 Main St, City, Province, Postal Code, Country
 *                     accessToken:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Bad request
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
 *                   example: Validation failed
 *                 error:
 *                   type: string
 *                   example: "Phone number is not within the range of 10 Digits."
 *       500:
 *         description: Server error
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
 *                   example: Internal server error
 *                 error:
 *                   type: string
 *                   example: "Error details"
 */
router.post('/register', uploadProfile.single('profileImage'), asyncMiddleware(userController.registerUser));

router.post('/registerUserMobile', uploadProfile.single('profileImage'), asyncMiddleware(userController.registerUserMobile));
//3. Sign in the user
/**
 * @swagger
 * /customer/login:
 *   post:
 *     tags:
 *       - Customer --> Auth
 *     summary: User Login
 *     description: Authenticate a user using email and password or a social login (Google, Apple, Facebook). If valid, it returns an access token and user data.
 *     requestBody:
 *       description: User login details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 description: User's password for login
 *                 example: MySecurePassword123!
 *               dvToken:
 *                 type: string
 *                 description: Device token for notifications
 *                 example: abc12345
 *               signedBy:
 *                 type: string
 *                 description: The platform used for social login (Google, Apple, Facebook). Leave empty for email/password login.
 *                 example: google
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Login successful
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
 *                   example: Login successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: integer
 *                       example: 15
 *                     accessToken:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     userDetails:
 *                       type: object
 *                       properties:
 *                         firstName:
 *                           type: string
 *                           example: John
 *                         lastName:
 *                           type: string
 *                           example: Doe
 *                         email:
 *                           type: string
 *                           example: user@example.com
 *       400:
 *         description: Bad request
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
 *                   example: Validation failed
 *                 error:
 *                   type: string
 *                   example: "User not found or invalid credentials"
 *       401:
 *         description: Unauthorized
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
 *                   example: Unauthorized access
 *       500:
 *         description: Server error
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
 *                   example: Internal server error
 *                 error:
 *                   type: string
 *                   example: "Error details"
 */

router.post('/login', asyncMiddleware(userController.signInUser));
//4. Forget password request
/**
 * @swagger
 * /customer/forgetpasswordrequest:
 *   post:
 *     tags:
 *       - Customer --> Auth
 *     summary: Request to reset password
 *     description: This endpoint sends a One-Time Password (OTP) to the user's email for resetting their password. If an OTP already exists, it updates the OTP.
 *     requestBody:
 *       description: User's email address for password reset
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address associated with the user account
 *                 example: user@example.com
 *             required:
 *               - email
 *     responses:
 *       200:
 *         description: OTP sent successfully
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
 *                   example: OTP sent successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     otpId:
 *                       type: integer
 *                       example: 101
 *                     userId:
 *                       type: integer
 *                       example: 15
 *       400:
 *         description: Invalid email address
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
 *                   example: Invalid information
 *                 error:
 *                   type: string
 *                   example: "No user exists against this email"
 *       500:
 *         description: Server error
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
 *                   example: Internal server error
 *                 error:
 *                   type: string
 *                   example: "Error details"
 */

router.post('/forgetpasswordrequest', asyncMiddleware(userController.forgetPasswordRequest));
//5. Verify OTP for password change

/**
 * @swagger
 * /customer/verifyotp:
 *   post:
 *     tags:
 *       - Customer --> Auth
 *     summary: Verify OTP for Password Reset
 *     description: Verifies the OTP provided by the user for password reset. Marks the OTP as verified upon success.
 *     requestBody:
 *       description: OTP verification details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               otpId:
 *                 type: integer
 *                 description: ID of the OTP record
 *                 example: 101
 *               OTP:
 *                 type: string
 *                 description: OTP sent to the user's email
 *                 example: "1234"
 *             required:
 *               - otpId
 *               - OTP
 *     responses:
 *       200:
 *         description: OTP verified successfully
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
 *                   example: OTP verified
 *                 data:
 *                   type: object
 *                   properties:
 *                     otpId:
 *                       type: integer
 *                       example: 101
 *                     userId:
 *                       type: integer
 *                       example: 15
 *       400:
 *         description: Invalid OTP or OTP not found
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
 *                   example: Error verifying OTP
 *                 error:
 *                   type: string
 *                   example: "Incorrect OTP or record not found"
 *       500:
 *         description: Server error
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
 *                   example: Internal server error
 *                 error:
 *                   type: string
 *                   example: "Error details"
 */

router.post('/verifyotp', asyncMiddleware(userController.verifyOTPforPassword));
//6. Change password in resposne to otp
/**
 * @swagger
 * /customer/changepasswordotp:
 *   post:
 *     tags:
 *       - Customer --> Auth
 *     summary: Change Password Using OTP
 *     description: Allows users to reset their password using a verified OTP. Updates the password and resets the OTP verification status.
 *     requestBody:
 *       description: Details required to change the password
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID of the user whose password is being changed
 *                 example: 15
 *               otpId:
 *                 type: integer
 *                 description: ID of the OTP record
 *                 example: 101
 *               password:
 *                 type: string
 *                 description: New password for the user
 *                 example: MyNewSecurePassword123!
 *             required:
 *               - userId
 *               - otpId
 *               - password
 *     responses:
 *       200:
 *         description: Password updated successfully
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
 *                   example: Password updated successfully. Please login to continue.
 *                 data:
 *                   type: object
 *                   example: {}
 *       400:
 *         description: Invalid request or OTP not verified
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
 *                   example: OTP not verified yet
 *                 error:
 *                   type: string
 *                   example: "Please verify OTP first"
 *       500:
 *         description: Server error
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
 *                   example: Internal server error
 *                 error:
 *                   type: string
 *                   example: "Error details"
 */

router.post('/changepasswordotp', asyncMiddleware(userController.changePasswordOTP));
//7. Session API
/**
 * @swagger
 * /customer/session:
 *   get:
 *     tags:
 *       - Customer --> Auth
 *     summary: Fetch Current Session
 *     description: Retrieves the current session details for the authenticated user. Ensures the user is active and not blocked.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Access token for authentication
 *         schema:
 *           type: string
 *           example: <your-access-token>
 *     requestBody:
 *       description: Optional guest user indicator
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               guestUser:
 *                 type: boolean
 *                 description: Indicates if the session is for a guest user
 *                 example: false
 *     responses:
 *       200:
 *         description: Session details retrieved successfully
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
 *                   example: Session retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: integer
 *                       example: 15
 *                     firstName:
 *                       type: string
 *                       example: John
 *                     lastName:
 *                       type: string
 *                       example: Doe
 *                     email:
 *                       type: string
 *                       example: user@example.com
 *                     countryCode:
 *                       type: string
 *                       example: +1
 *                     phoneNum:
 *                       type: string
 *                       example: 1234567890
 *                     guestUser:
 *                       type: boolean
 *                       example: false
 *       400:
 *         description: Invalid request or guest session not allowed
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
 *                   example: Login failed
 *                 error:
 *                   type: string
 *                   example: "Guest sessions are not supported"
 *       401:
 *         description: Unauthorized access
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
 *                   example: Unauthorized access
 *       500:
 *         description: Server error
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
 *                   example: Internal server error
 *                 error:
 *                   type: string
 *                   example: "Error details"
 */

router.get('/session', validateToken, asyncMiddleware(userController.session));
//8. Log out
/**
 * @swagger
 * /customer/logout:
 *   get:
 *     tags:
 *       - Customer --> Auth
 *     summary: Log out the user
 *     description: Logs out the user by removing their device token from the database and Redis. Requires a valid access token.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Access token for authentication
 *         schema:
 *           type: string
 *           example: <your-access-token>
 *     responses:
 *       200:
 *         description: User logged out successfully
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
 *                   example: Log-out successfully
 *                 data:
 *                   type: object
 *                   example: {}
 *                 error:
 *                   type: string
 *                   example: ""
 *       500:
 *         description: Internal server error
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
 *                   example: Internal server error
 *                 data:
 *                   type: object
 *                   example: {}
 *                 error:
 *                   type: string
 *                   example: "There is some error logging out. Please try again"
 */

router.get('/logout', validateToken ,asyncMiddleware(userController.logout));
//9. Delete user
/**
 * @swagger
 * /customer/delete:
 *   post:
 *     tags:
 *       - Customer --> Auth
 *     summary: Delete User Account
 *     description: Deletes the user's account if there are no active bookings associated with the user. Marks the account as inactive and sets a deletion timestamp.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Access token for authentication
 *         schema:
 *           type: string
 *           example: <your-access-token>
 *     responses:
 *       200:
 *         description: User account deleted successfully or has active bookings
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
 *                   example: User deleted successfully
 *                 data:
 *                   type: object
 *                   example: {}
 *                 error:
 *                   type: string
 *                   example: ""
 *       400:
 *         description: User has active bookings and cannot be deleted
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
 *                   example: Customer has Bookings
 *                 data:
 *                   type: object
 *                   example: {}
 *                 error:
 *                   type: string
 *                   example: ""
 *       500:
 *         description: Internal server error
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
 *                   example: Internal server error
 *                 data:
 *                   type: object
 *                   example: {}
 *                 error:
 *                   type: string
 *                   example: "Error details"
 */

router.post('/delete', validateToken, asyncMiddleware(userController.deleteUser));
//10. Session API
/**
 * @swagger
 * /customer/guestuser:
 *   post:
 *     tags:
 *       - Customer --> Auth
 *     summary: Guest User Login
 *     description: Allows a guest user to log in with a device token and provides a temporary access token with a 2-hour expiration.
 *     requestBody:
 *       description: Device token required for guest login
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dvToken:
 *                 type: string
 *                 description: Device token for the guest user
 *                 example: abc12345
 *             required:
 *               - dvToken
 *     responses:
 *       200:
 *         description: Guest login successful
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
 *                   example: Guest Login
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       example: "15"
 *                     accessToken:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     isGuest:
 *                       type: boolean
 *                       example: true
 *                 error:
 *                   type: string
 *                   example: ""
 *       500:
 *         description: Internal server error
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
 *                   example: Internal server error
 *                 data:
 *                   type: object
 *                   example: {}
 *                 error:
 *                   type: string
 *                   example: "Error details"
 */

router.post('/guestuser', asyncMiddleware(userController.guestUser));

// ! Module 2: Home & Send Parcel
// 1. Homepage
/**
 * @swagger
 * /customer/homepage:
 *   get:
 *     tags:
 *       - Customer --> Home and Order
 *     summary: Fetch Homepage Data
 *     description: Retrieves homepage data, including banners, booking types, package types, and pickup locations. It also checks for pending ratings.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Access token for authentication
 *         schema:
 *           type: string
 *           example: <your-access-token>
 *     responses:
 *       200:
 *         description: Homepage data retrieved successfully
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
 *                   example: Homepage Data
 *                 data:
 *                   type: object
 *                   properties:
 *                     banners:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           image:
 *                             type: string
 *                             example: "https://example.com/banner1.jpg"
 *                           description:
 *                             type: string
 *                             example: "Summer Sale!"
 *                     callRatingApi:
 *                       type: boolean
 *                       example: true
 *                     bookingTypeData:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           title:
 *                             type: string
 *                             example: "Delivery"
 *                           description:
 *                             type: string
 *                             example: "Deliver your packages safely."
 *                           image:
 *                             type: string
 *                             example: "https://example.com/bookingtype.jpg"
 *                     selectPackageType:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 2
 *                           title:
 *                             type: string
 *                             example: "Fragile Items"
 *                           description:
 *                             type: string
 *                             example: "For items that require extra care."
 *                           image:
 *                             type: string
 *                             example: "https://example.com/fragile.jpg"
 *                     selfPickUp:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         addressDBS:
 *                           type: object
 *                           properties:
 *                             streetAddress:
 *                               type: string
 *                               example: "123 Main St"
 *                             city:
 *                               type: string
 *                               example: "Rico"
 *                             province:
 *                               type: string
 *                               example: "Province Name"
 *                             postalCode:
 *                               type: string
 *                               example: "12345"
 *                             country:
 *                               type: string
 *                               example: "USA"
 *       401:
 *         description: Unauthorized access
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
 *                   example: Unauthorized access
 *       500:
 *         description: Internal server error
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
 *                   example: Internal server error
 *                 error:
 *                   type: string
 *                   example: "Error details"
 */

router.get('/homepage', validateToken, asyncMiddleware(userController.homepage))
//
//router.get('/pdf',  asyncMiddleware(userController.downloadLabelDEMO))
// shipping Calculater


/**
 * @swagger
 *  /customer/shippingCalculater:
 *   post:
 *     tags:
 *       - Customer --> Home and Order
 *     summary: Calculate Shipping Charges
 *     description: Calculates shipping charges for given packages based on origin, destination, booking type, and logistic company rates.
 *     requestBody:
 *       description: Shipping details required for calculation
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               origin:
 *                 type: string
 *                 description: Origin location for the shipment
 *                 example: "New York, NY"
 *               destination:
 *                 type: string
 *                 description: Destination location for the shipment
 *                 example: "Los Angeles, CA"
 *               packages:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     length:
 *                       type: number
 *                       description: Length of the package
 *                       example: 10
 *                     width:
 *                       type: number
 *                       description: Width of the package
 *                       example: 5
 *                     height:
 *                       type: number
 *                       description: Height of the package
 *                       example: 4
 *                     weight:
 *                       type: number
 *                       description: Weight of the package
 *                       example: 2
 *               bookingType:
 *                 type: string
 *                 description: Type of booking for the shipment is Local or international
 *                 example: "Local"
 *             required:
 *               - origin
 *               - destination
 *               - packages
 *               - bookingType
 *     responses:
 *       200:
 *         description: Shipping charges calculated successfully
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
 *                   example: Total Charges
 *                 data:
 *                   type: object
 *                   properties:
 *                     arryofCompanies:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           name:
 *                             type: string
 *                             example: "FedEx"
 *                           logo:
 *                             type: string
 *                             example: "https://example.com/logo.png"
 *                           Actualweight:
 *                             type: string
 *                             example: "5"
 *                           dimensionalWeight:
 *                             type: string
 *                             example: "7"
 *                           chargedWeight:
 *                             type: string
 *                             example: "7"
 *                           charges:
 *                             type: string
 *                             example: "25.50"
 *                           ETA:
 *                             type: string
 *                             example: "2-3 days"
 *                           flash:
 *                             type: boolean
 *                             example: false
 *       400:
 *         description: Invalid input data
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
 *                   example: Invalid input data
 *                 error:
 *                   type: string
 *                   example: "Missing or invalid fields"
 *       500:
 *         description: Internal server error
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
 *                   example: Internal server error
 *                 error:
 *                   type: string
 *                   example: "Error details"
 */

router.post('/shippingCalculater', asyncMiddleware(userController.shippingCalculater))
// 2. Get all required IDs 
router.get('/idsforbooking', validateToken, asyncMiddleware(userController.idsForBooking))
// 3. get Charges
/**
 * @swagger
 * /customer/getcharges:
 *   post:
 *     tags:
 *       - Customer --> Home and Order
 *     summary: Get Charges for a Booking
 *     description: Calculates various charges such as distance, weight, category, shipment type, packing, and service charges based on the input data.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Access token for authentication
 *         schema:
 *           type: string
 *           example: <your-access-token>
 *     requestBody:
 *       description: Details required for charge calculation
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categoryId:
 *                 type: string
 *                 description: Category ID for the package
 *                 example: "1"
 *               weight:
 *                 type: string
 *                 description: Weight of the package
 *                 example: "10"
 *               length:
 *                 type: string
 *                 description: Length of the package
 *                 example: "10"
 *               width:
 *                 type: string
 *                 description: Width of the package
 *                 example: "10"
 *               height:
 *                 type: string
 *                 description: Height of the package
 *                 example: "10"
 *               pickupAddress:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: string
 *                     description: Latitude of the pickup address
 *                     example: ""
 *                   lng:
 *                     type: string
 *                     description: Longitude of the pickup address
 *                     example: ""
 *               dropoffAddress:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: string
 *                     description: Latitude of the dropoff address
 *                     example: ""
 *                   lng:
 *                     type: string
 *                     description: Longitude of the dropoff address
 *                     example: ""
 *               bookingTypeId:
 *                 type: string
 *                 description: Booking type ID
 *                 example: "1"
 *               shipmentTypeId:
 *                 type: string
 *                 description: Shipment type ID
 *                 example: "1"
 *               logisticCompanyId:
 *                 type: string
 *                 description: Logistic company ID
 *                 example: "1"
 *               vehicleTypeId:
 *                 type: string
 *                 description: Vehicle type ID
 *                 example: "1"
 *     responses:
 *       200:
 *         description: Charges calculated successfully
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
 *                   example: All Charges
 *                 data:
 *                   type: object
 *                   properties:
 *                     distanceCharge:
 *                       type: string
 *                       example: "1.00"
 *                     weightCharge:
 *                       type: string
 *                       example: "1.00"
 *                     categoryCharge:
 *                       type: string
 *                       example: "1.00"
 *                     shipmentTypeCharge:
 *                       type: string
 *                       example: "1.00"
 *                     packingCharge:
 *                       type: string
 *                       example: "1.00"
 *                     serviceCharge:
 *                       type: string
 *                       example: "1.00"
 *                     gstCharge:
 *                       type: string
 *                       example: "1.00"
 *                     subTotal:
 *                       type: string
 *                       example: "1.00"
 *                     currencyUnit:
 *                       type: string
 *                       example: "$"
 *       400:
 *         description: Bad request or validation error
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
 *                   example: Validation error
 *                 error:
 *                   type: string
 *                   example: "Missing or invalid fields"
 *       401:
 *         description: Unauthorized access
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
 *                   example: Unauthorized access
 *       500:
 *         description: Internal server error
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
 *                   example: Internal server error
 *                 error:
 *                   type: string
 *                   example: "Error details"
 */

router.post('/getcharges', validateToken, asyncMiddleware(userController.getcharges));
// 4. create booking - International orders


/**
 * @swagger
 *  /customer/createbookingint:
 *   post:
 *     tags:
 *       - Customer --> Home and Order
 *     summary: Create an International Booking
 *     description: Allows authenticated users to create an international booking. Handles package details, consolidation, and ecommerce company association.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Access token for authentication
 *         schema:
 *           type: string
 *           example: <your-access-token>
 *     requestBody:
 *       description: Details required to create a booking
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               packages:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     length:
 *                       type: number
 *                       description: Length of the package
 *                       example: 10
 *                     width:
 *                       type: number
 *                       description: Width of the package
 *                       example: 5
 *                     height:
 *                       type: number
 *                       description: Height of the package
 *                       example: 4
 *                     weight:
 *                       type: number
 *                       description: Weight of the package
 *                       example: 2
 *                     categoryId:
 *                       type: integer
 *                       description: Category ID of the package
 *                       example: 1
 *                     eta:
 *                       type: string
 *                       description: Estimated Time of Arrival
 *                       example: "2-3 days"
 *                     ecommerceCompanyId:
 *                       type: integer
 *                       description: ID of the ecommerce company associated with this package
 *                       example: 101
 *               consolidate:
 *                 type: boolean
 *                 description: Whether the packages should be consolidated
 *                 example: true
 *             required:
 *               - packages
 *     responses:
 *       200:
 *         description: Booking created successfully
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
 *                   example: Your Package has been added successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     Order:
 *                       type: integer
 *                       example: 1001
 *       400:
 *         description: Bad request or validation error
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
 *                   example: Error creating booking
 *                 error:
 *                   type: string
 *                   example: "Missing or invalid data"
 *       401:
 *         description: Unauthorized access
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
 *                   example: Unauthorized access
 *       500:
 *         description: Internal server error
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
 *                   example: Internal server error
 *                 error:
 *                   type: string
 *                   example: "Error details"
 */

router.post('/createbookingint', validateToken, asyncMiddleware(userController.createOrderInt));
//
/**
 * @swagger
 * /customer/addDropOfAddress:
 *   post:
 *     tags:
 *       - Customer --> Home and Order
 *     summary: Add or Update Drop-Off Address
 *     description: Adds or updates the drop-off address for a booking. Supports adding new addresses or selecting an existing one.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Access token for authentication
 *         schema:
 *           type: string
 *           example: <your-access-token>
 *     requestBody:
 *       description: Drop-off address details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookingId:
 *                 type: integer
 *                 description: ID of the booking
 *                 example: 898
 *               dropoffAddressId:
 *                 type: integer
 *                 description: ID of the existing drop-off address
 *                 example: 5
 *               dropOffAddress:
 *                 type: object
 *                 description: Details of the new drop-off address (if adding a new address)
 *                 properties:
 *                   save:
 *                     type: boolean
 *                     description: Whether to save the new address for future use
 *                     example: false
 *                   title:
 *                     type: string
 *                     description: Title for the address (e.g., Home, Office)
 *                     example: Home
 *                   streetAddress:
 *                     type: string
 *                     description: Street address
 *                     example: 174D, abcd
 *                   building:
 *                     type: string
 *                     description: Building number
 *                     example: 1
 *                   floor:
 *                     type: string
 *                     description: Floor number
 *                     example: 1
 *                   apartment:
 *                     type: integer
 *                     description: Apartment number
 *                     example: 5
 *                   district:
 *                     type: string
 *                     description: District name
 *                     example: Raiwind
 *                   city:
 *                     type: string
 *                     description: City name
 *                     example: Lahore
 *                   province:
 *                     type: string
 *                     description: Province name
 *                     example: Punjab
 *                   country:
 *                     type: string
 *                     description: Country name
 *                     example: Pakistan
 *                   postalCode:
 *                     type: string
 *                     description: Postal code
 *                     example: 53125
 *                   lat:
 *                     type: string
 *                     description: Latitude
 *                     example: 31.01256
 *                   lng:
 *                     type: string
 *                     description: Longitude
 *                     example: 74.0000
 *               reciverdetails:
 *                 type: object
 *                 description: Receiver's details
 *                 properties:
 *                   reciverName:
 *                     type: string
 *                     description: Receiver's name
 *                     example: Danish
 *                   reciverEmail:
 *                     type: string
 *                     description: Receiver's email
 *                     example: danish007@gmail.com
 *                   reciverPhone:
 *                     type: string
 *                     description: Receiver's phone number
 *                     example: +923071234567
 *               selfPickup:
 *                 type: boolean
 *                 description: Whether the receiver will self-pickup the package
 *                 example: true
 *               addNewAddress:
 *                 type: boolean
 *                 description: Whether to add a new drop-off address
 *                 example: false
 *     responses:
 *       200:
 *         description: Drop-off address added or updated successfully
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
 *                   example: Address has been added successfully
 *                 data:
 *                   type: object
 *                   example: {}
 *       400:
 *         description: Bad request or validation error
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
 *                   example: Validation error
 *                 error:
 *                   type: string
 *                   example: "Missing or invalid fields"
 *       401:
 *         description: Unauthorized access
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
 *                   example: Unauthorized access
 *       500:
 *         description: Internal server error
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
 *                   example: Internal server error
 *                 error:
 *                   type: string
 *                   example: "Error details"
 */

router.post('/addDropOfAddress', validateToken, asyncMiddleware(userController.dropOfAddress));
// 5. create booking - Local orders

/**
 * @swagger
 *  /customer/createbookingloc:
 *   post:
 *     tags:
 *       - Customer --> Home and Order
 *     summary: Create a Local Booking
 *     description: Allows authenticated users to create a local booking with options for adding new pickup and drop-off addresses or using existing ones.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Access token for authentication
 *         schema:
 *           type: string
 *           example: <your-access-token>
 *     requestBody:
 *       description: Booking details for creating a local booking
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pickupDate:
 *                 type: string
 *                 format: date
 *                 description: Scheduled date for pickup
 *                 example: "2023-07-14"
 *               pickupStartTime:
 *                 type: string
 *                 format: time
 *                 description: Start time for pickup
 *                 example: "11:30"
 *               pickupEndTime:
 *                 type: string
 *                 format: time
 *                 description: End time for pickup
 *                 example: "13:30"
 *               receiverName:
 *                 type: string
 *                 description: Name of the receiver
 *                 example: "Asad"
 *               receiverEmail:
 *                 type: string
 *                 format: email
 *                 description: Email of the receiver
 *                 example: "a@gmail.com"
 *               receiverPhone:
 *                 type: string
 *                 description: Phone number of the receiver
 *                 example: "+15858542574"
 *               vehicleTypeId:
 *                 type: integer
 *                 description: Vehicle type ID for the booking
 *                 example: 3
 *               packages:
 *                 type: array
 *                 description: Details of the packages to be delivered
 *                 items:
 *                   type: object
 *                   properties:
 *                     weight:
 *                       type: string
 *                       description: Weight of the package
 *                       example: "10"
 *                     length:
 *                       type: string
 *                       description: Length of the package
 *                       example: "10"
 *                     width:
 *                       type: string
 *                       description: Width of the package
 *                       example: "10"
 *                     height:
 *                       type: string
 *                       description: Height of the package
 *                       example: "10"
 *                     categoryId:
 *                       type: string
 *                       description: Category ID of the package
 *                       example: "1"
 *                     catText:
 *                       type: string
 *                       description: Text describing the category
 *                       example: ""
 *                     note:
 *                       type: string
 *                       description: Notes for the package
 *                       example: "Handle with care"
 *                     ecommerceCompanyId:
 *                       type: integer
 *                       description: E-commerce company ID associated with the package
 *                       example: 1
 *               addNewPickup:
 *                 type: boolean
 *                 description: Whether to add a new pickup address
 *                 example: false
 *               pickupAddressId:
 *                 type: integer
 *                 description: ID of the existing pickup address
 *                 example: 54
 *               pickupAddress:
 *                 type: object
 *                 description: Details of the new pickup address (if adding a new address)
 *                 properties:
 *                   save:
 *                     type: boolean
 *                     description: Whether to save the new address for future use
 *                     example: true
 *                   title:
 *                     type: string
 *                     description: Title for the address (e.g., Home, Office)
 *                     example: "Home"
 *                   streetAddress:
 *                     type: string
 *                     description: Street address
 *                     example: "174D, abcd"
 *                   building:
 *                     type: string
 *                     description: Building number
 *                     example: "1"
 *                   floor:
 *                     type: string
 *                     description: Floor number
 *                     example: "0"
 *                   apartment:
 *                     type: string
 *                     description: Apartment number
 *                     example: "21"
 *                   district:
 *                     type: string
 *                     description: District name
 *                     example: "Raiwind"
 *                   city:
 *                     type: string
 *                     description: City name
 *                     example: "Lahore"
 *                   province:
 *                     type: string
 *                     description: Province name
 *                     example: "Punjab"
 *                   country:
 *                     type: string
 *                     description: Country name
 *                     example: "Pakistan"
 *                   postalCode:
 *                     type: string
 *                     description: Postal code
 *                     example: "53125"
 *                   lat:
 *                     type: string
 *                     description: Latitude
 *                     example: "1123545"
 *                   lng:
 *                     type: string
 *                     description: Longitude
 *                     example: "115884"
 *                   userId:
 *                     type: string
 *                     description: User ID associated with the address
 *                     example: "2"
 *               addNewDropoff:
 *                 type: boolean
 *                 description: Whether to add a new drop-off address
 *                 example: false
 *               dropoffAddressId:
 *                 type: integer
 *                 description: ID of the existing drop-off address
 *                 example: 55
 *               dropoffAddress:
 *                 type: object
 *                 description: Details of the new drop-off address (if adding a new address)
 *                 properties:
 *                   save:
 *                     type: boolean
 *                     description: Whether to save the new address for future use
 *                     example: false
 *                   title:
 *                     type: string
 *                     description: Title for the address
 *                     example: "Home"
 *                   streetAddress:
 *                     type: string
 *                     description: Street address
 *                     example: "174D, abcd"
 *                   building:
 *                     type: string
 *                     description: Building number
 *                     example: "1"
 *                   floor:
 *                     type: string
 *                     description: Floor number
 *                     example: "0"
 *                   apartment:
 *                     type: string
 *                     description: Apartment number
 *                     example: "21"
 *                   district:
 *                     type: string
 *                     description: District name
 *                     example: "Raiwind"
 *                   city:
 *                     type: string
 *                     description: City name
 *                     example: "Lahore"
 *                   province:
 *                     type: string
 *                     description: Province name
 *                     example: "Punjab"
 *                   country:
 *                     type: string
 *                     description: Country name
 *                     example: "Pakistan"
 *                   postalCode:
 *                     type: string
 *                     description: Postal code
 *                     example: "53125"
 *                   lat:
 *                     type: string
 *                     description: Latitude
 *                     example: "1123545"
 *                   lng:
 *                     type: string
 *                     description: Longitude
 *                     example: "115884"
 *                   userId:
 *                     type: string
 *                     description: User ID associated with the address
 *                     example: "2"
 *     responses:
 *       200:
 *         description: Booking created successfully
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
 *                   example: Booking created
 *                 data:
 *                   type: object
 *                   properties:
 *                     bookingId:
 *                       type: integer
 *                       example: 1001
 *                     total:
 *                       type: number
 *                       example: 12.0
 *                     senderData:
 *                       type: object
 *                       properties:
 *                         senderName:
 *                           type: string
 *                           example: "John Doe"
 *                         senderEmail:
 *                           type: string
 *                           example: "johndoe@example.com"
 *                         senderPhone:
 *                           type: string
 *                           example: "+123456789"
 *                         pickupAddress:
 *                           type: object
 *                           example: {}
 *                     receiverData:
 *                       type: object
 *                       properties:
 *                         receiverName:
 *                           type: string
 *                           example: "Asad"
 *                         receiverEmail:
 *                           type: string
 *                           example: "a@gmail.com"
 *                         receiverPhone:
 *                           type: string
 *                           example: "+15858542574"
 *                         dropoffAddress:
 *                           type: object
 *                           example: {}
 *                     packages:
 *                       type: array
 *                       items:
 *                         type: object
 *                         example: {}
 *                     pickupDate:
 *                       type: string
 *                       example: "2023-07-14"
 *                     pickupStartTime:
 *                       type: string
 *                       example: "11:30"
 *                     pickupEndTime:
 *                       type: string
 *                       example: "13:30"
 *                     barCode:
 *                       type: string
 *                       example: "Public/Barcodes/TSH-1001-XYZ123.png"
 *       400:
 *         description: Bad request or validation error
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
 *                   example: Validation error
 *                 error:
 *                   type: string
 *                   example: "Missing or invalid fields"
 *       401:
 *         description: Unauthorized access
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
 *                   example: Unauthorized access
 *       500:
 *         description: Internal server error
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
 *                   example: Internal server error
 *                 error:
 *                   type: string
 *                   example: "Error details"
 */

router.post('/createbookingloc', validateToken, asyncMiddleware(userController.createOrderLoc)); 
// 6. Cancel booking 
/**
 * @swagger
 * /customer/cancelbooking:
 *   post:
 *     tags:
 *       - Customer --> Home and Order
 *     summary: Cancel a Booking
 *     description: Cancels a booking if no packages have been marked as "arrived". Updates booking and package statuses, records the cancellation reason, and logs the action in booking history.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Access token for authentication
 *         schema:
 *           type: string
 *           example: <your-access-token>
 *     requestBody:
 *       description: Details required to cancel the booking
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookingId:
 *                 type: integer
 *                 description: ID of the booking to cancel
 *                 example: 101
 *               reasonId:
 *                 type: integer
 *                 description: ID of the reason for cancellation
 *                 example: 3
 *               reasonText:
 *                 type: string
 *                 description: Additional text explaining the cancellation reason
 *                 example: "Customer changed their mind"
 *             required:
 *               - bookingId
 *               - reasonId
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
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
 *                   example: Booking Cancelled
 *                 data:
 *                   type: object
 *                   example: {}
 *       400:
 *         description: Validation error or cannot cancel booking
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
 *                   example: "Your package is received. Now you cannot cancel the booking."
 *                 error:
 *                   type: string
 *                   example: "Validation error details"
 *       401:
 *         description: Unauthorized access
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
 *                   example: Unauthorized access
 *       500:
 *         description: Internal server error
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
 *                   example: Internal server error
 *                 error:
 *                   type: string
 *                   example: "Error details"
 */

router.post('/cancelbooking', validateToken, asyncMiddleware(userController.cancelBooking));
//
/**
 * @swagger
 * /customer/cancelbookingReacons:
 *   get:
 *     tags:
 *       - Customer --> Home and Order
 *     summary: Get Cancellation Reasons
 *     description: Retrieves a list of all possible reasons for booking cancellation.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Access token for authentication
 *         schema:
 *           type: string
 *           example: <your-access-token>
 *     responses:
 *       200:
 *         description: List of cancellation reasons retrieved successfully
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
 *                   example: Booking Cancelled
 *                 data:
 *                   type: object
 *                   properties:
 *                     reasons:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: ID of the reason
 *                             example: 1
 *                           title:
 *                             type: string
 *                             description: Title of the cancellation reason
 *                             example: "Customer changed their mind"
 *       401:
 *         description: Unauthorized access
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
 *                   example: Unauthorized access
 *       500:
 *         description: Internal server error
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
 *                   example: Internal server error
 *                 error:
 *                   type: string
 *                   example: "Error details"
 */

router.get('/cancelbookingReacons', validateToken, asyncMiddleware(userController.cancelbookingReacons));

// 7. expected Packages
/**
 * @swagger
 * /customer/expectedPackages:
 *   get:
 *     tags:
 *       - Customer --> Home and Order
 *     summary: Retrieve Expected Packages
 *     description: Fetches a list of expected packages for the authenticated user based on specific booking status and type filters.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Access token for authentication
 *         schema:
 *           type: string
 *           example: <your-access-token>
 *     responses:
 *       200:
 *         description: List of expected packages retrieved successfully
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
 *                   example: All Expected Packages
 *                 data:
 *                   type: object
 *                   properties:
 *                     bookingData:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 101
 *                           createdAt:
 *                             type: string
 *                             description: Booking creation date and time
 *                             example: "15-12-24 05:30:45 PM"
 *                           bookingStatus:
 *                             type: object
 *                             properties:
 *                               title:
 *                                 type: string
 *                                 example: "Pending"
 *                           packages:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: integer
 *                                   example: 201
 *                                 ecommerceCompany:
 *                                   type: object
 *                                   properties:
 *                                     title:
 *                                       type: string
 *                                       example: "Amazon"
 *                           bookingHistory:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: integer
 *                                   example: 301
 *                                 date:
 *                                   type: string
 *                                   example: "12-24-2024"
 *                                 time:
 *                                   type: string
 *                                   example: "05:30:45 PM"
 *                                 bookingStatus:
 *                                   type: object
 *                                   properties:
 *                                     id:
 *                                       type: integer
 *                                       example: 1
 *                                     title:
 *                                       type: string
 *                                       example: "Processing"
 *       401:
 *         description: Unauthorized access
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
 *                   example: Unauthorized access
 *       500:
 *         description: Internal server error
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
 *                   example: Internal server error
 *                 error:
 *                   type: string
 *                   example: "Error details"
 */

router.get('/expectedPackages', validateToken, asyncMiddleware(userController.expectedPackages));
// 8. PAckages in warehouse
/**
 * @swagger
 * /customer/packagesInWarehouse:
 *   get:
 *     tags:
 *       - Customer --> Home and Order
 *     summary: Retrieve Packages in Warehouse
 *     description: Fetches a list of packages that are currently in the warehouse based on specific booking statuses and types for the authenticated user.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Access token for authentication
 *         schema:
 *           type: string
 *           example: <your-access-token>
 *     responses:
 *       200:
 *         description: List of packages in the warehouse retrieved successfully
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
 *                   example: Packages in Warehouse
 *                 data:
 *                   type: object
 *                   properties:
 *                     bookingData:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 101
 *                           createdAt:
 *                             type: string
 *                             description: Booking creation date and time
 *                             example: "15-12-24 05:30:45 PM"
 *                           bookingStatus:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                                 example: 7
 *                               title:
 *                                 type: string
 *                                 example: "In Warehouse"
 *                           packages:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: integer
 *                                   example: 201
 *                                 ecommerceCompany:
 *                                   type: object
 *                                   properties:
 *                                     title:
 *                                       type: string
 *                                       example: "Amazon"
 *                           bookingHistory:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: integer
 *                                   example: 301
 *                                 date:
 *                                   type: string
 *                                   example: "12-24-2024"
 *                                 time:
 *                                   type: string
 *                                   example: "05:30:45 PM"
 *                                 bookingStatus:
 *                                   type: object
 *                                   properties:
 *                                     id:
 *                                       type: integer
 *                                       example: 7
 *                                     title:
 *                                       type: string
 *                                       example: "In Warehouse"
 *       401:
 *         description: Unauthorized access
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
 *                   example: Unauthorized access
 *       500:
 *         description: Internal server error
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
 *                   example: Internal server error
 *                 error:
 *                   type: string
 *                   example: "Error details"
 */

router.get('/packagesInWarehouse', validateToken, asyncMiddleware(userController.packagesInWarehouse));
// 9. Sent Packages
/**
 * @swagger
 * /customer/sentPackages:
 *   get:
 *     tags:
 *       - Customer --> Home and Order
 *     summary: Retrieve Sent Packages
 *     description: Fetches a list of sent packages for the authenticated user based on specific booking statuses and types.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Access token for authentication
 *         schema:
 *           type: string
 *           example: <your-access-token>
 *     responses:
 *       200:
 *         description: List of sent packages retrieved successfully
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
 *                   example: Sent Packages
 *                 data:
 *                   type: object
 *                   properties:
 *                     bookingData:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 101
 *                           createdAt:
 *                             type: string
 *                             description: Booking creation date and time
 *                             example: "15-12-24 05:30:45 PM"
 *                           bookingStatus:
 *                             type: object
 *                             properties:
 *                               title:
 *                                 type: string
 *                                 example: "Shipped"
 *                           packages:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: integer
 *                                   example: 201
 *                                 ecommerceCompany:
 *                                   type: object
 *                                   properties:
 *                                     title:
 *                                       type: string
 *                                       example: "Amazon"
 *       401:
 *         description: Unauthorized access
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
 *                   example: Unauthorized access
 *       500:
 *         description: Internal server error
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
 *                   example: Internal server error
 *                 error:
 *                   type: string
 *                   example: "Error details"
 */

router.get('/sentPackages', validateToken, asyncMiddleware(userController.sentPackages));

// * Redundant code
// Logistic Company
router.post('/getLogisticCompany',  asyncMiddleware(userController.logisticCompanies));
//. Get address using search filter 
router.post('/getaddresses', validateToken, asyncMiddleware(userController.searchAddress))
//. Check coupon validity
router.post('/couponvalidity', validateToken, asyncMiddleware(userController.checkCouponValidity));
// . Reschedule pickup 
router.post('/reschedulepickup', validateToken, asyncMiddleware(userController.reschedulePickup));
// . Schedule Dropoff for booking 
router.post('/scheduledropoff',validateToken, asyncMiddleware(userController.scheduleDropoff));
// . Schedule Dropoff for booking 
router.post('/dropoffscheduleweb', asyncMiddleware(userController.scheduleDropoffByWeb));
// Restricted Items
/**
 * @swagger
 * /customer/restricteditems:
 *   get:
 *     tags:
 *       - Customer --> Home and Order
 *     summary: Retrieve Restricted Items
 *     description: Fetches a list of restricted items with their titles and images.
 *     responses:
 *       200:
 *         description: List of restricted items retrieved successfully
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
 *                   example: List of restricted items
 *                 data:
 *                   type: object
 *                   properties:
 *                     itemsList:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           title:
 *                             type: string
 *                             description: Title of the restricted item
 *                             example: "Explosives"
 *                           image:
 *                             type: string
 *                             description: URL of the item's image
 *                             example: "https://example.com/images/explosives.png"
 *       500:
 *         description: Internal server error
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
 *                   example: Internal server error
 *                 error:
 *                   type: string
 *                   example: "Error details"
 */

router.get('/restricteditems', asyncMiddleware(userController.fetchRestrictedItems));

// ! Module 4: Drawer 
//1. Get user profile 
/**
 * @swagger
 * /customer/getprofile:
 *   get:
 *     tags:
 *       - Customer --> Drawer
 *     summary: Retrieve User Profile
 *     description: Fetches profile details of the authenticated user, including user data and associated warehouse address.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Access token for authentication
 *         schema:
 *           type: string
 *           example: <your-access-token>
 *     responses:
 *       200:
 *         description: User profile details retrieved successfully
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
 *                   example: User Profile Data
 *                 data:
 *                   type: object
 *                   properties:
 *                     userData:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         firstName:
 *                           type: string
 *                           example: "John"
 *                         lastName:
 *                           type: string
 *                           example: "Doe"
 *                         email:
 *                           type: string
 *                           example: "john.doe@example.com"
 *                         countryCode:
 *                           type: string
 *                           example: "+1"
 *                         phoneNum:
 *                           type: string
 *                           example: "1234567890"
 *                         image:
 *                           type: string
 *                           example: "https://example.com/profile.jpg"
 *                         virtualBox:
 *                           type: string
 *                           example: "VB12345"
 *                         userTypeId:
 *                           type: integer
 *                           example: 3
 *                         stripeCustomerId:
 *                           type: string
 *                           example: "cus_ABC123"
 *                         joinedOn:
 *                           type: string
 *                           example: "2022"
 *                     warehouseAddress:
 *                       type: string
 *                       example: "123 Warehouse St, Los Angeles, CA, 90001 USA"
 *                     virtualBoxNumber:
 *                       type: string
 *                       example: "VB12345"
 *       401:
 *         description: Unauthorized access
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
 *                   example: Unauthorized access
 *       500:
 *         description: Internal server error
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
 *                   example: Internal server error
 *                 error:
 *                   type: string
 *                   example: "Error details"
 */

router.get('/getprofile', validateToken, asyncMiddleware(userController.getProfile));
//2. update user profile 
/**
 * @swagger
 * /customer/updateprofile:
 *   put:
 *     tags:
 *       - Customer --> Drawer
 *     summary: Update User Profile
 *     description: Updates the profile of the authenticated user, including optional profile image upload and user type changes.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Access token for authentication
 *         schema:
 *           type: string
 *           example: <your-access-token>
 *     requestBody:
 *       description: User profile details to be updated. All fields should be passed in form-data format.
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: Updated first name of the user
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 description: Updated last name of the user
 *                 example: "Doe"
 *               isProfileChanged:
 *                 type: string
 *                 description: Indicates if the profile image is updated ("true" or "false")
 *                 example: "true"
 *               profileImage:
 *                 type: string
 *                 format: binary
 *                 description: New profile image file (if `isProfileChanged` is "true")
 *               email:
 *                 type: string
 *                 description: Updated email address of the user
 *                 example: "john.doe@example.com"
 *               phoneNum:
 *                 type: string
 *                 description: Updated phone number of the user
 *                 example: "1234567890"
 *               countryCode:
 *                 type: string
 *                 description: Updated country code of the user
 *                 example: "+1"
 *               userTypeId:
 *                 type: integer
 *                 description: Updated user type ID (1 for normal user, 3 for business user)
 *                 example: 1
 *     responses:
 *       200:
 *         description: Profile updated successfully
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
 *                   example: Profile updated successfully
 *                 data:
 *                   type: object
 *                   example: {}
 *       400:
 *         description: Invalid input or missing required fields
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
 *                   example: Invalid input data
 *                 error:
 *                   type: string
 *                   example: "Profile picture is required"
 *       401:
 *         description: Unauthorized access
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
 *                   example: Unauthorized access
 *       500:
 *         description: Internal server error
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
 *                   example: Internal server error
 *                 error:
 *                   type: string
 *                   example: "Error details"
 */

router.put('/updateprofile', validateToken, uploadProfile.single('profileImage'), asyncMiddleware(userController.updateProfile));
//3. Get all attached addresses
/**
 * @swagger
 * /customer/getattachaddresses:
 *   get:
 *     tags:
 *       - Customer --> Drawer
 *     summary: Retrieve Saved Addresses of User
 *     description: Fetches all addresses attached to the authenticated user.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Access token for authentication
 *         schema:
 *           type: string
 *           example: <your-access-token>
 *     responses:
 *       200:
 *         description: List of addresses attached to the user retrieved successfully
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
 *                   example: Attached addresses to user # 1
 *                 data:
 *                   type: object
 *                   properties:
 *                     addressData:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           addressDBId:
 *                             type: integer
 *                             description: Address database ID
 *                             example: 101
 *                           type:
 *                             type: string
 *                             description: Type of the address (e.g., pickup, dropoff)
 *                             example: "pickup"
 *                           addressDBS:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                                 description: Address ID
 *                                 example: 101
 *                               title:
 *                                 type: string
 *                                 description: Title of the address
 *                                 example: "Home"
 *                               streetAddress:
 *                                 type: string
 *                                 description: Street address
 *                                 example: "123 Main Street"
 *                               city:
 *                                 type: string
 *                                 description: City name
 *                                 example: "New York"
 *                               province:
 *                                 type: string
 *                                 description: Province or state name
 *                                 example: "NY"
 *                               country:
 *                                 type: string
 *                                 description: Country name
 *                                 example: "USA"
 *                               postalCode:
 *                                 type: string
 *                                 description: Postal code
 *                                 example: "10001"
 *                               lat:
 *                                 type: string
 *                                 description: Latitude of the address
 *                                 example: "40.7128"
 *                               lng:
 *                                 type: string
 *                                 description: Longitude of the address
 *                                 example: "-74.0060"
 *       401:
 *         description: Unauthorized access
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
 *                   example: Unauthorized access
 *       500:
 *         description: Internal server error
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
 *                   example: Internal server error
 *                 error:
 *                   type: string
 *                   example: "Error details"
 */

router.get('/getattachaddresses', validateToken, asyncMiddleware(userController.savedAddressesOfUser));
//4. Attach address to user
/**
 * @swagger
 * /customer/attachaddress:
 *   post:
 *     tags:
 *       - Customer --> Drawer
 *     summary: Attach Address to User
 *     description: Adds a new address to the user's profile as either a pickup or dropoff address.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Access token for authentication
 *         schema:
 *           type: string
 *           example: <your-access-token>
 *     requestBody:
 *       description: Address details to be attached
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 description: Type of address ("pickup" or "dropoff")
 *                 example: "pickup"
 *               addressData:
 *                 type: object
 *                 description: Address details
 *                 properties:
 *                   title:
 *                     type: string
 *                     description: Title or label for the address
 *                     example: "LocalAddress"
 *                   streetAddress:
 *                     type: string
 *                     description: Street address
 *                     example: "Str.No4, block B"
 *                   building:
 *                     type: string
 *                     description: Building information
 *                     example: "4"
 *                   floor:
 *                     type: string
 *                     description: Floor number
 *                     example: "0"
 *                   apartment:
 *                     type: string
 *                     description: Apartment number
 *                     example: "21"
 *                   district:
 *                     type: string
 *                     description: District name
 *                     example: "Canal Bank Housing"
 *                   city:
 *                     type: string
 *                     description: City name
 *                     example: "Lahore"
 *                   province:
 *                     type: string
 *                     description: Province or state name
 *                     example: "Punjab"
 *                   country:
 *                     type: string
 *                     description: Country name
 *                     example: "Pakistan"
 *                   postalCode:
 *                     type: string
 *                     description: Postal code
 *                     example: "53125"
 *                   lat:
 *                     type: string
 *                     description: Latitude of the address
 *                     example: "1123545"
 *                   lng:
 *                     type: string
 *                     description: Longitude of the address
 *                     example: "115884"
 *     responses:
 *       200:
 *         description: Address attached successfully
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
 *                   example: Address Saved
 *                 data:
 *                   type: object
 *                   properties:
 *                     newAddress:
 *                       type: integer
 *                       description: ID of the newly created address
 *                       example: 101
 *       400:
 *         description: Invalid or missing type or address data
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
 *                   example: Type not selected
 *       401:
 *         description: Unauthorized access
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
 *                   example: Unauthorized access
 *       500:
 *         description: Internal server error
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
 *                   example: Internal server error
 *                 error:
 *                   type: string
 *                   example: "Error details"
 */

router.post('/attachaddress', validateToken, asyncMiddleware(userController.addAddress));
//5. Unattach address to user 
/**
 * @swagger
 * /customer/unattachaddress:
 *   post:
 *     tags:
 *       - Customer --> Drawer
 *     summary: Unattach Address from User
 *     description: Removes an attached address from the user's profile.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Access token for authentication
 *         schema:
 *           type: string
 *           example: <your-access-token>
 *     requestBody:
 *       description: Address ID to be unattached
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               attchedAddressId:
 *                 type: integer
 *                 description: ID of the address to be unattached
 *                 example: 101
 *     responses:
 *       200:
 *         description: Address unattached successfully
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
 *                   example: Address unattached successfully
 *                 data:
 *                   type: object
 *                   example: {}
 *       400:
 *         description: Invalid or missing address ID
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
 *                   example: Invalid address ID
 *       401:
 *         description: Unauthorized access
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
 *                   example: Unauthorized access
 *       500:
 *         description: Internal server error
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
 *                   example: Internal server error
 *                 error:
 *                   type: string
 *                   example: "Error details"
 */

router.post('/unattachaddress', validateToken, asyncMiddleware(userController.unattachAddressToUser));
//6. Get order of a user 

/**
 * @swagger
 * /customer/myorders:
 *   get:
 *     tags:
 *       - Customer --> Drawer
 *     summary: Retrieve User's Orders
 *     description: Fetches all international and local orders of the authenticated user.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Access token for authentication
 *         schema:
 *           type: string
 *           example: <your-access-token>
 *     responses:
 *       200:
 *         description: List of user's orders retrieved successfully
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
 *                   example: My Orders
 *                 data:
 *                   type: object
 *                   properties:
 *                     internationalOrders:
 *                       type: array
 *                       description: List of international orders
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: Booking ID
 *                             example: 101
 *                           trackingId:
 *                             type: string
 *                             description: Tracking ID
 *                             example: "TSH-101-ABC123"
 *                           total:
 *                             type: number
 *                             description: Total cost of the order
 *                             example: 150.0
 *                           createdAt:
 *                             type: string
 *                             description: Order creation date
 *                             example: "2024-01-01T12:00:00Z"
 *                           paymentConfirmed:
 *                             type: boolean
 *                             description: Payment confirmation status
 *                             example: true
 *                           dropoffAddress:
 *                             type: object
 *                             description: Dropoff address details
 *                             properties:
 *                               streetAddress:
 *                                 type: string
 *                                 example: "123 Main Street"
 *                               city:
 *                                 type: string
 *                                 example: "New York"
 *                               country:
 *                                 type: string
 *                                 example: "USA"
 *                           bookingStatus:
 *                             type: object
 *                             description: Current booking status
 *                             properties:
 *                               id:
 *                                 type: integer
 *                                 example: 2
 *                               title:
 *                                 type: string
 *                                 example: "In Transit"
 *                           logisticCompany:
 *                             type: object
 *                             description: Logistic company details
 *                             example: { id: 1, title: "FedEx", logo: "https://example.com/logo.png" }
 *                           package:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 ecommerceCompany:
 *                                   type: object
 *                                   description: E-commerce company details
 *                                   example: { title: "Amazon" }
 *                     localOrders:
 *                       type: array
 *                       description: List of local orders
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: Booking ID
 *                             example: 202
 *                           trackingId:
 *                             type: string
 *                             description: Tracking ID
 *                             example: "TSH-202-XYZ456"
 *                           total:
 *                             type: number
 *                             description: Total cost of the order
 *                             example: 50.0
 *                           createdAt:
 *                             type: string
 *                             description: Order creation date
 *                             example: "2024-01-01T12:00:00Z"
 *                           pickupAddress:
 *                             type: object
 *                             description: Pickup address details
 *                             properties:
 *                               streetAddress:
 *                                 type: string
 *                                 example: "456 Elm Street"
 *                               city:
 *                                 type: string
 *                                 example: "Los Angeles"
 *                               country:
 *                                 type: string
 *                                 example: "USA"
 *                           dropoffAddress:
 *                             type: object
 *                             description: Dropoff address details
 *                             properties:
 *                               streetAddress:
 *                                 type: string
 *                                 example: "789 Oak Street"
 *                               city:
 *                                 type: string
 *                                 example: "San Francisco"
 *                               country:
 *                                 type: string
 *                                 example: "USA"
 *                           bookingStatus:
 *                             type: object
 *                             description: Current booking status
 *                             properties:
 *                               id:
 *                                 type: integer
 *                                 example: 3
 *                               title:
 *                                 type: string
 *                                 example: "Delivered"
 *                           package:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 ecommerceCompany:
 *                                   type: object
 *                                   description: E-commerce company details
 *                                   example: { title: "eBay" }
 *       401:
 *         description: Unauthorized access
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
 *                   example: Unauthorized access
 *       500:
 *         description: Internal server error
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
 *                   example: Internal server error
 *                 error:
 *                   type: string
 *                   example: "Error details"
 */

router.get('/myorders', validateToken, asyncMiddleware(userController.myOrders));
//7. Get order details 
/**
 * @swagger
 * /customer/chooseLogisticCompany:
 *   post:
 *     tags:
 *       - Customer --> Home and Order
 *     summary: Choose a Logistic Company for a Booking
 *     description: Allows users to select a logistic company for their booking and updates the booking with the charges and optional discount if applicable.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Access token for authentication
 *         schema:
 *           type: string
 *           example: <your-access-token>
 *     requestBody:
 *       description: Details of the booking and selected logistic company
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookingId:
 *                 type: integer
 *                 description: ID of the booking for which the logistic company is being selected
 *                 example: 101
 *               logisticCompanyId:
 *                 type: integer
 *                 description: ID of the selected logistic company
 *                 example: 1
 *               charges:
 *                 type: number
 *                 description: Charges provided by the logistic company
 *                 example: 150.50
 *     responses:
 *       200:
 *         description: Logistic company selected and charges updated successfully
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
 *                   example: Logistic Company Added Successfully
 *                 data:
 *                   type: object
 *                   example: {}
 *       400:
 *         description: Invalid subscription ID or no active subscription for business users
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
 *                   example: "Invalid Subscription Id or You don't have any Subscription"
 *                 error:
 *                   type: string
 *                   example: ""
 *       401:
 *         description: Unauthorized access
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
 *                   example: Unauthorized access
 *       500:
 *         description: Internal server error
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
 *                   example: Internal server error
 *                 error:
 *                   type: string
 *                   example: "Error details"
 */

router.post('/chooseLogisticCompany', validateToken, asyncMiddleware(userController.chooseLogisticCompany));
//

/**
 * @swagger
 * /customer/orderdetails:
 *   post:
 *     tags:
 *       - Customer --> Drawer
 *     summary: Fetch Order Details
 *     description: Retrieve the details of a specific order using its booking ID.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Access token for authentication
 *         schema:
 *           type: string
 *           example: <your-access-token>
 *     requestBody:
 *       description: Booking ID of the order
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookingId:
 *                 type: integer
 *                 description: ID of the booking
 *                 example: 123
 *     responses:
 *       200:
 *         description: Order details retrieved successfully
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
 *                   example: Booking Details
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: Booking ID
 *                       example: 123
 *                     trackingId:
 *                       type: string
 *                       description: Unique tracking ID for the booking
 *                       example: "TSH-123-ABC456"
 *                     receiverName:
 *                       type: string
 *                       description: Name of the receiver
 *                       example: "John Doe"
 *                     receiverEmail:
 *                       type: string
 *                       description: Email of the receiver
 *                       example: "john@example.com"
 *                     receiverPhone:
 *                       type: string
 *                       description: Phone number of the receiver
 *                       example: "+1234567890"
 *                     senderName:
 *                       type: string
 *                       description: Name of the sender
 *                       example: "Jane Doe"
 *                     senderEmail:
 *                       type: string
 *                       description: Email of the sender
 *                       example: "jane@example.com"
 *                     senderPhone:
 *                       type: string
 *                       description: Phone number of the sender
 *                       example: "+0987654321"
 *                     total:
 *                       type: number
 *                       description: Total cost of the booking
 *                       example: 150.0
 *                     packages:
 *                       type: array
 *                       description: List of packages in the booking
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           weight:
 *                             type: string
 *                             example: "10.5"
 *                           category:
 *                             type: string
 *                             example: "Electronics"
 *                           ecommerceCompany:
 *                             type: string
 *                             example: "Amazon"
 *                     bookingStatus:
 *                       type: object
 *                       description: Current status of the booking
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 2
 *                         title:
 *                           type: string
 *                           example: "In Transit"
 *                     logisticCompany:
 *                       type: object
 *                       description: Logistic company details
 *                       example: { id: 1, title: "FedEx", logo: "https://example.com/logo.png" }
 *       400:
 *         description: Invalid or missing booking ID
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
 *                   example: Invalid booking ID
 *       401:
 *         description: Unauthorized access
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
 *                   example: Unauthorized access
 *       500:
 *         description: Internal server error
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
 *                   example: Internal server error
 *                 error:
 *                   type: string
 *                   example: Error details
 */

router.post('/orderdetails', validateToken, asyncMiddleware(userController.orderDetails));
//8. Get support and privacy
/**
 * @swagger
 * /customer/links:
 *   get:
 *     tags:
 *       - Customer --> Drawer
 *     summary: Fetch Support Links and Data
 *     description: Retrieve privacy policy, support contact information, and FAQs.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Access token for authentication
 *         schema:
 *           type: string
 *           example: <your-access-token>
 *     responses:
 *       200:
 *         description: Support links and data retrieved successfully
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
 *                   example: Links
 *                 data:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                       description: Support email address
 *                       example: support@example.com
 *                     number:
 *                       type: string
 *                       description: Support phone number
 *                       example: "+1234567890"
 *                     FAQ:
 *                       type: array
 *                       description: Frequently Asked Questions
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           title:
 *                             type: string
 *                             example: "What is the refund policy?"
 *                           answer:
 *                             type: string
 *                             example: "Refunds are processed within 7 business days."
 *                     privacyPolicy:
 *                       type: string
 *                       description: Privacy policy link
 *                       example: "https://example.com/privacy-policy"
 *       401:
 *         description: Unauthorized access
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
 *                   example: Unauthorized access
 *       500:
 *         description: Internal server error
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
 *                   example: Internal server error
 *                 error:
 *                   type: string
 *                   example: Error details
 */

router.get('/links', validateToken, asyncMiddleware(userController.supportData));
//9. Update password
router.post('/updatepassword', validateToken, asyncMiddleware(userController.updatePassword));
///
router.put('/updateAddress', validateToken, asyncMiddleware(userController.updateAddress));


//. Change default address
router.put('/changedefault', validateToken, asyncMiddleware(userController.changeDefaultAddress));
/**
 * @swagger
 * /customer/downloadpdf:
 *   get:
 *     tags:
 *       - Customer --> Home and Order
 *     summary: Download Booking Details as PDF
 *     description: Generates and downloads a PDF containing details of a specific booking, including sender, receiver, and parcel details.
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         description: The ID of the booking for which the PDF is to be generated.
 *         schema:
 *           type: integer
 *           example: 101
 *     responses:
 *       200:
 *         description: PDF generated and downloaded successfully
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *               description: PDF file of booking details
 *       400:
 *         description: Invalid booking ID or missing query parameter
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
 *                   example: Invalid booking ID
 *                 error:
 *                   type: string
 *                   example: Booking not found
 *       500:
 *         description: Internal server error during PDF generation
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
 *                   example: Internal server error
 *                 error:
 *                   type: string
 *                   example: Error details
 */

router.get('/downloadpdf', asyncMiddleware(userController.downloadPDF));

// Custom Routes


/**
 * @swagger
 * /customer/getAllCategory:
 *   get:
 *     tags:
 *       - Customer --> Home and Order
 *     summary: Retrieve All Categories
 *     description: Fetches a list of all active categories along with their details.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Access token for authentication
 *         schema:
 *           type: string
 *           example: <your-access-token>
 *     responses:
 *       200:
 *         description: List of all active categories retrieved successfully
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
 *                   example: All categories
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: ID of the category
 *                         example: 1
 *                       title:
 *                         type: string
 *                         description: Title of the category
 *                         example: "Electronics"
 *                       status:
 *                         type: boolean
 *                         description: Status of the category (active/inactive)
 *                         example: true
 *                       charge:
 *                         type: number
 *                         description: Charge associated with the category
 *                         example: 50.00
 *       401:
 *         description: Unauthorized access
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
 *                   example: Unauthorized access
 *       500:
 *         description: Internal server error
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
 *                   example: Internal server error
 *                 error:
 *                   type: string
 *                   example: "Error details"
 */

router.get('/getAllCategory', validateToken,asyncMiddleware(adminController.getAllCategory));

/**
 * @swagger
 * /customer/getLogCompanies:
 *   get:
 *     tags:
 *       - Customer --> Home and Order
 *     summary: Retrieve Logistic Companies
 *     description: Fetches a list of all logistic companies.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Access token for authentication
 *         schema:
 *           type: string
 *           example: <your-access-token>
 *     responses:
 *       200:
 *         description: List of logistic companies retrieved successfully
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
 *                   example: Logistic companies
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: ID of the logistic company
 *                         example: 1
 *                       title:
 *                         type: string
 *                         description: Name of the logistic company
 *                         example: "FedEx"
 *                       logo:
 *                         type: string
 *                         description: URL of the company's logo
 *                         example: "https://example.com/logo.png"
 *                       information:
 *                         type: string
 *                         description: Additional information about the company
 *                         example: "Leading international delivery service"
 *                       status:
 *                         type: boolean
 *                         description: Status of the logistic company
 *                         example: true
 *       401:
 *         description: Unauthorized access
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
 *                   example: Unauthorized access
 *       500:
 *         description: Internal server error
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
 *                   example: Internal server error
 *                 error:
 *                   type: string
 *                   example: "Error details"
 */

router.get('/getLogCompanies',validateToken, asyncMiddleware(adminController.getLogCompanies));

// ! Module 5: Rating
// 1. Add/Skip rating
/**
 * @swagger
 * /customer/addskiprating:
 *   post:
 *     tags:
 *       - Customer --> Rating
 *     summary: Add or skip rating for a booking
 *     description: Allows the user to either add a rating with feedback or skip the rating for a specific booking.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Access token for authentication
 *         schema:
 *           type: string
 *           example: <your-access-token>
 *     requestBody:
 *       description: Provide details to add or skip a rating
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookingId
 *               - addRating
 *             properties:
 *               value:
 *                 type: integer
 *                 description: Rating value (1-5)
 *                 example: 5
 *               comment:
 *                 type: string
 *                 description: Feedback comment for the rating
 *                 example: "Excellent service!"
 *               bookingId:
 *                 type: integer
 *                 description: The booking ID for which the rating or skip action is applied
 *                 example: 123
 *               addRating:
 *                 type: boolean
 *                 description: Whether to add the rating or skip it (true for add, false for skip)
 *                 example: true
 *     responses:
 *       200:
 *         description: Operation successful
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
 *                   example: Thank-you for the feedback. We highly appreciate it
 *                 data:
 *                   type: object
 *                   example: {}
 *       400:
 *         description: Rating already added
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
 *                   example: Rating already added
 *                 error:
 *                   type: string
 *                   example: You have already rated us. Thank you for your feedback
 *       500:
 *         description: Internal Server Error
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
 *                   example: Internal Server Error
 *                 error:
 *                   type: string
 *                   example: Error details
 */

router.post('/addskiprating', validateToken, asyncMiddleware(userController.addSkipRating));
// 2. Booking whose rating is pending
/**
 * @swagger
 * /customer/pendingratingbookings:
 *   get:
 *     tags:
 *       - Customer --> Rating
 *     summary: Retrieve bookings pending for ratings
 *     description: Fetches all bookings where the user has not yet provided a rating.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Access token for authentication
 *         schema:
 *           type: string
 *           example: <your-access-token>
 *     responses:
 *       200:
 *         description: Successfully fetched unrated bookings
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
 *                   example: Bookings (pending rating)
 *                 data:
 *                   type: object
 *                   properties:
 *                     unRatedBookings:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: Booking ID
 *                             example: 101
 *                           trackingId:
 *                             type: string
 *                             description: Tracking ID of the booking
 *                             example: "TSH-123456"
 *       401:
 *         description: Unauthorized access
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
 *                   example: Unauthorized
 *       500:
 *         description: Internal Server Error
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
 *                   example: Internal Server Error
 *                 error:
 *                   type: string
 *                   example: Error details
 */

router.get('/pendingratingbookings', validateToken, asyncMiddleware(userController.unRatedBookings));

// ! Reasons
/**
 * @swagger
 * /customer/getReasons:
 *   get:
 *     tags:
 *       - Customer --> Reasons
 *     summary: Retrieve reasons list
 *     description: Fetches all available reasons from the system.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Access token for authentication
 *         schema:
 *           type: string
 *           example: <your-access-token>
 *     responses:
 *       200:
 *         description: Successfully fetched reasons list
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
 *                   example: Reasons List
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: Reason ID
 *                         example: 101
 *                       title:
 *                         type: string
 *                         description: Reason title
 *                         example: "Late delivery"
 *                       description:
 *                         type: string
 *                         description: Detailed reason description
 *                         example: "The package was delayed due to unforeseen circumstances."
 *       401:
 *         description: Unauthorized access
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
 *                   example: Unauthorized
 *       500:
 *         description: Internal Server Error
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
 *                   example: Internal Server Error
 *                 error:
 *                   type: string
 *                   example: Error details
 */

router.get('/getReasons', validateToken, asyncMiddleware(driverController.getReasons))

// ! WareHouse

router.get('/profile',validateToken, asyncMiddleware(userControllerN.profile_management));

// ! Module 6: Payment Gateway 
// TODO Pending
// 1. Initiate Payment
router.post('/initiatepayment', validateToken, asyncMiddleware(userController.initatePayment));
// 2. Capture Payment
router.post('/capturepayment', validateToken, asyncMiddleware(userController.capturePayment));
// ! Module 6: Tracking
// 1. Get booking details by tracking Id
/**
 * @swagger
 * /customer/trackorder:
 *   post:
 *     tags:
 *       - Customer --> Drawer
 *     summary: Track Order by Tracking ID
 *     description: Retrieve detailed booking information using the tracking ID.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Access token for authentication
 *         schema:
 *           type: string
 *           example: <your-access-token>
 *     requestBody:
 *       description: Provide tracking ID to fetch booking details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               trackingId:
 *                 type: string
 *                 description: The unique tracking ID of the booking
 *                 example: TSH-12345-XYZ
 *     responses:
 *       200:
 *         description: Booking details retrieved successfully
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
 *                   example: Booking details
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: Booking ID
 *                       example: 123
 *                     trackingId:
 *                       type: string
 *                       description: Tracking ID
 *                       example: TSH-12345-XYZ
 *                     senderDetails:
 *                       type: object
 *                       description: Sender details
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: John Doe
 *                         email:
 *                           type: string
 *                           example: johndoe@example.com
 *                         phone:
 *                           type: string
 *                           example: "+123456789"
 *                         memberSince:
 *                           type: string
 *                           example: "2020"
 *                     recipientDetails:
 *                       type: object
 *                       description: Recipient details
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: Jane Doe
 *                         email:
 *                           type: string
 *                           example: janedoe@example.com
 *                         phone:
 *                           type: string
 *                           example: "+987654321"
 *                     deliveryDetails:
 *                       type: object
 *                       description: Delivery details
 *                       properties:
 *                         pickupCode:
 *                           type: string
 *                           example: "12345"
 *                         dropoffCode:
 *                           type: string
 *                           example: "54321"
 *                         pickupAddress:
 *                           type: string
 *                           example: "123 Main Street, City, State"
 *                         dropoffAddress:
 *                           type: string
 *                           example: "456 Elm Street, City, State"
 *                         pickupTime:
 *                           type: string
 *                           example: "14:00"
 *                     parcelDetails:
 *                       type: object
 *                       description: Parcel details
 *                       properties:
 *                         shipmentType:
 *                           type: string
 *                           example: "Express"
 *                         category:
 *                           type: string
 *                           example: "Electronics"
 *                         weight:
 *                           type: string
 *                           example: "5 kg"
 *                         dimensions:
 *                           type: string
 *                           example: "50x30x20 cm"
 *                     bookingHistory:
 *                       type: array
 *                       description: Booking status history
 *                       items:
 *                         type: object
 *                         properties:
 *                           bookingStatusId:
 *                             type: integer
 *                             example: 1
 *                           statusText:
 *                             type: string
 *                             example: Order Placed
 *                           date:
 *                             type: string
 *                             example: "01-01-2024"
 *                           time:
 *                             type: string
 *                             example: "12:00 PM"
 *                           status:
 *                             type: boolean
 *                             example: true
 *       400:
 *         description: Invalid tracking ID
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
 *                   example: The information you are trying to get is unavailable
 *       401:
 *         description: Unauthorized access
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
 *                   example: Unauthorized access
 *       500:
 *         description: Internal server error
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
 *                   example: Internal server error
 *                 error:
 *                   type: string
 *                   example: Error details
 */

router.post('/trackorder', asyncMiddleware(userController.bookingDetailsByTracking));
// ! Module : Shopify API's
/**
 * @swagger
 * /customer/allProducts:
 *   get:
 *     tags:
 *       - Customer --> Shopify
 *     summary: Fetch all Shopify products
 *     description: Retrieves a list of all products from the Shopify store.
 *     responses:
 *       200:
 *         description: A list of Shopify products retrieved successfully.
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
 *                   example: "All Products"
 *                 data:
 *                   type: object
 *                   properties:
 *                     products:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "gid://shopify/Product/1234567890"
 *                           title:
 *                             type: string
 *                             example: "Sample Product"
 *                           body_html:
 *                             type: string
 *                             example: "<strong>Sample Product Description</strong>"
 *                           vendor:
 *                             type: string
 *                             example: "Shopify Vendor"
 *                           product_type:
 *                             type: string
 *                             example: "Accessories"
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-12-01T10:00:00Z"
 *                           updated_at:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-12-05T15:30:00Z"
 *                           variants:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: string
 *                                   example: "gid://shopify/ProductVariant/1234567890"
 *                                 title:
 *                                   type: string
 *                                   example: "Default Title"
 *                                 price:
 *                                   type: string
 *                                   example: "19.99"
 *                 error:
 *                   type: string
 *                   example: ""
 *       500:
 *         description: Internal server error during fetching products.
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
 *                   example: "Error fetching Shopify products"
 *                 error:
 *                   type: string
 *                   example: "Shopify API Error"
 */
router.get('/allProducts', asyncMiddleware(userController.allProducts));

/**
 * @swagger
 * /customer/Orders:
 *   get:
 *     tags:
 *       - Customer --> Shopify
 *     summary: Fetch all Shopify orders
 *     description: Retrieves a list of all orders from the Shopify store.
 *     responses:
 *       200:
 *         description: A list of Shopify orders retrieved successfully.
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
 *                   example: "All Orders"
 *                 data:
 *                   type: object
 *                   properties:
 *                     orders:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "gid://shopify/Order/1234567890"
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-12-01T10:00:00Z"
 *                           updated_at:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-12-05T15:30:00Z"
 *                           email:
 *                             type: string
 *                             example: "customer@example.com"
 *                           total_price:
 *                             type: string
 *                             example: "99.99"
 *                           currency:
 *                             type: string
 *                             example: "USD"
 *                           line_items:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: string
 *                                   example: "gid://shopify/LineItem/9876543210"
 *                                 title:
 *                                   type: string
 *                                   example: "Sample Product"
 *                                 quantity:
 *                                   type: integer
 *                                   example: 1
 *                                 price:
 *                                   type: string
 *                                   example: "99.99"
 *                 error:
 *                   type: string
 *                   example: ""
 *       500:
 *         description: Internal server error during fetching orders.
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
 *                   example: "Error fetching Shopify orders"
 *                 error:
 *                   type: string
 *                   example: "Shopify API Error"
 */
router.get('/Orders', asyncMiddleware(userController.Orders));
/**
 * @swagger
 * /customer/shopifyOrderDetails:
 *   post:
 *     tags:
 *       - Customer --> Shopify
 *     summary: Fetch details of a specific Shopify order
 *     description: Retrieves detailed information of a specific order from the Shopify store using the order ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderId:
 *                 type: string
 *                 description: The ID of the Shopify order to fetch details for.
 *                 example: "gid://shopify/Order/1234567890"
 *     responses:
 *       200:
 *         description: The details of the specified Shopify order were retrieved successfully.
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
 *                   example: "Order Details"
 *                 data:
 *                   type: object
 *                   properties:
 *                     orders:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "gid://shopify/Order/1234567890"
 *                         created_at:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-12-01T10:00:00Z"
 *                         updated_at:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-12-05T15:30:00Z"
 *                         email:
 *                           type: string
 *                           example: "customer@example.com"
 *                         total_price:
 *                           type: string
 *                           example: "99.99"
 *                         currency:
 *                           type: string
 *                           example: "USD"
 *                         line_items:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 example: "gid://shopify/LineItem/9876543210"
 *                               title:
 *                                 type: string
 *                                 example: "Sample Product"
 *                               quantity:
 *                                 type: integer
 *                                 example: 1
 *                               price:
 *                                 type: string
 *                                 example: "99.99"
 *                 error:
 *                   type: string
 *                   example: ""
 *       400:
 *         description: Bad request, missing or invalid orderId.
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
 *                   example: "Invalid order ID"
 *                 error:
 *                   type: string
 *                   example: "The order ID provided is invalid."
 *       500:
 *         description: Internal server error during fetching order details.
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
 *                   example: "Error fetching Shopify order"
 *                 error:
 *                   type: string
 *                   example: "Shopify API Error"
 */

router.post('/shopifyOrderDetails', asyncMiddleware(userController.shopifyOrderDetails));

/**
 * @swagger
 * /customer/shopifyOrder:
 *   post:
 *     tags:
 *       - Customer --> Shopify
 *     summary: Create a booking from Shopify order
 *     description: This endpoint creates a booking using details from a Shopify order, including handling pickup and dropoff addresses, calculating weight, and updating booking details.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderId:
 *                 type: string
 *                 description: The ID of the Shopify order to be used for creating the booking.
 *                 example: "gid://shopify/Order/1234567890"
 *     responses:
 *       200:
 *         description: The booking was successfully created using the Shopify order details.
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
 *                   example: "Order Created"
 *                 data:
 *                   type: object
 *                   properties:
 *                     bookingId:
 *                       type: string
 *                       example: "TSH-123456-ABCDE"
 *                     trackingId:
 *                       type: string
 *                       example: "TSH-123456-ABCDE"
 *       400:
 *         description: Invalid request body or order ID.
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
 *                   example: "Invalid order ID"
 *                 error:
 *                   type: string
 *                   example: "The provided Shopify order ID is invalid or missing."
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
 *                   example: "Error creating the booking"
 *                 error:
 *                   type: string
 *                   example: "There was an error while creating the booking from the Shopify order."
 */
router.post('/shopifyOrder', asyncMiddleware(userController. shopifyOrder));
// ! Module  : Payment___________________
router.post('/payment', asyncMiddleware(userController.payment));
// ! Module : Cards__________________
router.post('/addCard',validateToken, asyncMiddleware(userController.addCard));
// Get All Cards
router.get('/cards',validateToken, asyncMiddleware(userController.GetCustomercards));

router.put('/deletecard',validateToken, asyncMiddleware(userController.deletecards));
//--------------------------------------
/**
 * @swagger
 * /customer/downloadLabel:
 *   post:
 *     tags:
 *       - Customer --> Drawer
 *     summary: Download Booking Label
 *     description: Retrieve the URL of the label for a specific booking.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Access token for authentication
 *         schema:
 *           type: string
 *           example: <your-access-token>
 *     requestBody:
 *       description: Booking ID of the label to download
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookingId:
 *                 type: integer
 *                 description: ID of the booking
 *                 example: 123
 *     responses:
 *       200:
 *         description: Label URL retrieved successfully
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
 *                   example: Booking Label
 *                 data:
 *                   type: object
 *                   properties:
 *                     Url:
 *                       type: string
 *                       description: URL of the booking label
 *                       example: "https://example.com/labels/booking123.pdf"
 *       400:
 *         description: Invalid or missing booking ID
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
 *                   example: Invalid booking ID
 *       401:
 *         description: Unauthorized access
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
 *                   example: Unauthorized access
 *       500:
 *         description: Internal server error
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
 *                   example: Internal server error
 *                 error:
 *                   type: string
 *                   example: Error details
 */
router.post('/downloadLabel', validateToken, asyncMiddleware(userController.downloadLabel));
/**
 * @swagger
 * /customer/confirmCheckout:
 *   post:
 *     tags:
 *       - Customer --> Drawer
 *     summary: Confirm a Stripe Checkout payment and return the booking label
 *     description: Verifies the Checkout session is paid, finalises the booking (idempotent) and returns its label URLs. Used by the payment-success page so it doesn't depend on the webhook.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sessionId:
 *                 type: string
 *               bookingId:
 *                 type: integer
 */
router.post('/confirmCheckout', validateToken, asyncMiddleware(userController.confirmCheckout));
//---------------------------------------------------
router.post('/makepaymentbynewcard', validateToken, asyncMiddleware(userController.makepaymentbynewcard));
//
router.post('/makepaymentBySavedCard', validateToken, asyncMiddleware(userController.makepaymentBySavedCard));

//Stripe checkout Sessions
/**
 * @swagger
 * /customer/checkoutSessionsCheck:
 *   post:
 *     tags:
 *       - Customer --> Payment
 *     summary: Create a Stripe checkout session
 *     description: Initiates a checkout session for processing payments through Stripe.
 *     requestBody:
 *       description: Details required to create a Stripe checkout session
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 description: The total amount to be charged in USD.
 *                 example: 1000
 *               bookingType:
 *                 type: string
 *                 description: Type of booking (e.g., local or international).
 *                 example: "local"
 *               bookingId:
 *                 type: integer
 *                 description: Unique identifier for the booking.
 *                 example: 234567
 *               successUrl:
 *                 type: string
 *                 description: URL to redirect to upon successful payment.
 *                 example: "https://dev.theshippinghack.com/payment-success"
 *               cancelUrl:
 *                 type: string
 *                 description: URL to redirect to upon payment cancellation.
 *                 example: "https://dev.theshippinghack.com/parcel-detail"
 *     responses:
 *       200:
 *         description: Successfully created Stripe checkout session
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
 *                   example: Session Created
 *                 data:
 *                   type: object
 *                   description: Details of the created Stripe session.
 *                 error:
 *                   type: string
 *                   example: "undefined"
 *       400:
 *         description: Missing or invalid input data
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
 *                   example: Invalid input data
 *                 error:
 *                   type: string
 *                   example: "Invalid amount provided"
 *       500:
 *         description: Internal Server Error
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
 *                   example: Internal Server Error
 *                 error:
 *                   type: string
 *                   example: "Stripe session creation failed"
 */

router.post('/checkoutSessionsCheck',validateToken,asyncMiddleware(userController.checkoutSessionsCheck))

//Language Update Key
/**
 * @swagger
 * /customer/changeLanguageApi:
 *   put:
 *     tags:
 *       - Customer --> Auth
 *     summary: Change user's language preference
 *     description: Updates the language preference of the logged-in user.
 *     requestBody:
 *       description: Language preference data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               language:
 *                 type: string
 *                 description: New language preference for the user.
 *                 example: "en"
 *     responses:
 *       200:
 *         description: Language updated successfully
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
 *                   example: "Language Updated"
 *                 data:
 *                   type: object
 *                   description: Details of the update operation.
 *       400:
 *         description: Missing or invalid input data
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
 *                   example: "Invalid input data"
 *                 error:
 *                   type: string
 *                   example: "Language field is required"
 *       500:
 *         description: Internal Server Error
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
 *                   example: "Internal Server Error"
 *                 error:
 *                   type: string
 *                   example: "Database update failed"
 */

router.put('/changeLanguageApi',validateToken,asyncMiddleware(userController.changeLanguageApi))

//Get Session
router.post("/retrieveSession",asyncMiddleware(userController.retrieveSession))

//Create Intent (customer app PaymentSheet)
/**
 * @swagger
 * /customer/createPaymentIntent:
 *   post:
 *     tags:
 *       - Customer --> Payment
 *     summary: Create the Stripe PaymentIntent for a booking
 *     description: Creates a PaymentIntent for the booking total (booking id kept in the metadata). The app confirms it with the Stripe PaymentSheet and then calls intentGet.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookingId:
 *                 type: integer
 *                 example: 123
 *     responses:
 *       200:
 *         description: "status 1: data has id, client_secret and amount; status 0: order not found, already paid or not priced yet."
 */
router.post("/createPaymentIntent", validateToken, asyncMiddleware(userController.createPaymentIntent))

//get Intent
/**
 * @swagger
 * /customer/intentGet:
 *   post:
 *     tags:
 *       - Customer --> Payment
 *     summary: Retrieve intent and process payment for booking
 *     description: Checks the Stripe PaymentIntent succeeded and belongs to the booking, then records the payment (amount taken from Stripe) and creates the FedEx shipment. Idempotent.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: intentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the Stripe payment intent to retrieve.
 *     requestBody:
 *       description: Booking information
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookingId:
 *                 type: integer
 *                 description: The ID of the booking to process.
 *                 example: 123
 *     responses:
 *       200:
 *         description: Payment processed and booking updated successfully.
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
 *                   example: "Payment successfully Done"
 *                 data:
 *                   type: object
 *                   properties:
 *                     labels:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           label:
 *                             type: string
 *                             example: "https://fedex.com/label.pdf"
 *                 error:
 *                   type: string
 *                   example: ""
 *       400:
 *         description: Invalid or missing input data.
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
 *                   example: "Invalid input data"
 *                 error:
 *                   type: string
 *                   example: "Booking ID or amount is missing"
 *       500:
 *         description: Internal server error during processing.
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
 *                   example: "Internal Server Error"
 *                 error:
 *                   type: string
 *                   example: "Error while processing payment"
 */

router.post("/intentGet", validateToken, asyncMiddleware(userController.intentGet))

//!---------------------------Stripe Checkout Webhooks-------------------------------->>
router.post("/StripeWebhook",asyncMiddleware(userController.stripeWebhook))

//!---------------------------Track Fedex Order-------------------------------->>

/**
 * @swagger
 * /customer/trackFedexOrder:
 *   post:
 *     tags:
 *       - Customer --> Home and Order
 *     summary: Track FedEx Order
 *     description: Fetches tracking details for a FedEx order using the provided tracking number.
 *     requestBody:
 *       description: Tracking number of the FedEx package
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               trackingNumber:
 *                 type: string
 *                 description: Tracking number of the FedEx package
 *                 example: "123456789012"
 *     responses:
 *       200:
 *         description: FedEx order tracking details retrieved successfully
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
 *                   example: Fedex Order Details
 *                 data:
 *                   type: object
 *                   description: Tracking details for the FedEx package
 *                   example:
 *                     trackingNumber: "123456789012"
 *                     status: "In Transit"
 *                     estimatedDelivery: "2024-01-05"
 *                     origin: "New York, NY"
 *                     destination: "Los Angeles, CA"
 *                     currentLocation: "Denver, CO"
 *       400:
 *         description: Invalid or missing tracking number
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
 *                   example: Invalid tracking number
 *                 error:
 *                   type: string
 *                   example: Tracking number not found
 *       500:
 *         description: Internal server error during FedEx tracking
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
 *                   example: Internal server error
 *                 error:
 *                   type: string
 *                   example: Error details
 */

router.post("/trackFedexOrder",asyncMiddleware(userController.trackFedexOrder))
module.exports = router;