const express = require('express');
const router = express();
const businessController = require('../controller/business');
const asyncMiddleware = require('../middleware/async');
const validateToken = require('../middleware/validateToken');
const multer = require('multer');
const path = require('path');
const Stripe = require('../controller/stripe')
// ! Module 1: Authentication 
//1. Send OTP for registration

/**
 * @swagger
 * /business/registerBusiness:
 *   post:
 *     summary: Register a new business user
 *     description: Creates a new business account or handles existing user verification
 *     tags:
 *       - Business --> Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - businessName
 *               - email
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: First name of the business owner
 *                 example: 'John'
 *               lastName:
 *                 type: string
 *                 description: Last name of the business owner
 *                 example: 'Doe'
 *               businessName:
 *                 type: string
 *                 description: Name of the business
 *                 example: 'Doe Enterprises'
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Business email address
 *                 example: 'john@doeenterprises.com'
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Account password
 *                 example: 'SecurePass123!'
 *               referral:
 *                 type: string
 *                 description: Optional referral code
 *                 example: 'REF123'
 *               signedBy:
 *                 type: string
 *                 description: Optional sign-up source
 *                 example: 'website'
 *     responses:
 *       '200':
 *         description: Successfully registered or sent OTP for verification
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
 *                   example: 'OTP sent successfully'
 *                 data:
 *                   type: object
 *                   properties:
 *                     otpId:
 *                       type: integer
 *                       description: ID of the generated OTP
 *                       example: 1
 *                     userId:
 *                       type: integer
 *                       description: ID of the user
 *                       example: 123
 *       '400':
 *         description: Bad Request - Validation errors or existing user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: '0'
 *                 title:
 *                   type: string
 *                   example: 'Trying to login?'
 *                 message:
 *                   type: string
 *                   example: 'A Business with the following email exists already'
 *       '500':
 *         description: Internal Server Error
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
 *                   example: 'Internal server error'
 * 
 * components:
 *   schemas:
 *     EmailTemplate:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: 'email'
 *         OTP:
 *           type: string
 *           example: '1234'
 */
router.post('/registerBusiness', asyncMiddleware(businessController.registerBusiness))

/**
 * @swagger
 * /business/resendOTP:
 *   post:
 *     summary: Resend OTP verification code
 *     description: Generates and sends a new OTP to the user's email address
 *     tags:
 *       - Business --> Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID of the user requesting new OTP
 *                 example: 123
 *     responses:
 *       '200':
 *         description: Successfully sent new OTP
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: '1'
 *                     message:
 *                       type: string
 *                       example: 'OTP sent successfully to user@example.com'
 *                     data:
 *                       type: object
 *                       properties:
 *                         otpId:
 *                           type: integer
 *                           description: ID of the generated OTP
 *                           example: 1
 *                 - type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: '0'
 *                     message:
 *                       type: string
 *                       example: 'Error sending OTP'
 *                     data:
 *                       type: object
 *                       example: {}
 *                     error:
 *                       type: string
 *                       description: Error details if OTP sending fails
 *                       example: 'Email service error'
 *       '400':
 *         description: Bad Request - User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                   example: 'Sorry, we could not fetch the associated data'
 *                 message:
 *                   type: string
 *                   example: 'Please try sending again'
 *       '500':
 *         description: Internal Server Error
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
 *                   example: 'Internal server error'
 */
router.post('/resendOTP', asyncMiddleware(businessController.resendOTP))

/**
 * @swagger
 * /business/verifyotpsignup:
 *   post:
 *     summary: Verify OTP for business signup
 *     description: Verifies the OTP sent during registration and creates a Stripe customer account
 *     tags:
 *       - Business --> Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otpId
 *               - OTP
 *               - userId
 *             properties:
 *               otpId:
 *                 type: integer
 *                 description: ID of the OTP verification record
 *                 example: 1
 *               OTP:
 *                 type: string
 *                 description: 4-digit OTP code received via email
 *                 example: '1234'
 *               userId:
 *                 type: integer
 *                 description: ID of the user being verified
 *                 example: 123
 *     responses:
 *       '200':
 *         description: Successfully verified OTP
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
 *                   example: 'OTP verified'
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: integer
 *                       example: 123
 *       '400':
 *         description: Bad Request - Invalid OTP or verification failed
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                       example: 'Sorry, we could not fetch the data'
 *                     message:
 *                       type: string
 *                       example: 'Please rensend OTP to continue'
 *                 - type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                       example: 'You entered incorrect OTP'
 *                     message:
 *                       type: string
 *                       example: 'Please enter correct OTP to continue'
 *       '500':
 *         description: Internal Server Error
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
 *                   example: 'Internal server error'
 */
router.post('/verifyotpsignup', asyncMiddleware(businessController.verifyOTPforSignUp))

//3. Sign in the user
router.post('/login', asyncMiddleware(businessController.signInUser));
//4. Forget password request
/**
 * @swagger
 * /business/forgetpasswordrequest:
 *   post:
 *     summary: Request password reset OTP
 *     description: Sends a password reset OTP to the business user's email address
 *     tags:
 *       - Business --> Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address of the business account
 *                 example: 'business@example.com'
 *     responses:
 *       '200':
 *         description: Successfully sent or updated OTP
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: '1'
 *                     message:
 *                       type: string
 *                       example: 'OTP sent successfully'
 *                     data:
 *                       type: object
 *                       properties:
 *                         otpId:
 *                           type: integer
 *                           description: ID of the generated/updated OTP
 *                           example: 1
 *                 - type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: '1'
 *                     message:
 *                       type: string
 *                       example: 'OTP updated successfully'
 *                     data:
 *                       type: object
 *                       properties:
 *                         otpId:
 *                           type: integer
 *                           description: ID of the updated OTP
 *                           example: 1
 *       '400':
 *         description: Bad Request - Invalid email or user not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                   example: 'Invalid information'
 *                 message:
 *                   type: string
 *                   example: 'No user exists against this email'
 *       '500':
 *         description: Internal Server Error
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
 *                   example: 'Error sending OTP'
 *                 data:
 *                   type: object
 *                   example: {}
 *                 error:
 *                   type: string
 *                   description: Error details
 *                   example: 'Email service error'
 */
router.post('/forgetpasswordrequest', asyncMiddleware(businessController.forgetPasswordRequest));
//5. Verify OTP for password change
/**
 * @swagger
 * /business/verifyotp:
 *   post:
 *     summary: Verify OTP for password reset
 *     description: Validates the OTP sent during password reset request
 *     tags:
 *       - Business --> Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otpId
 *               - OTP
 *             properties:
 *               otpId:
 *                 type: integer
 *                 description: ID of the OTP verification record
 *                 example: 1
 *               OTP:
 *                 type: string
 *                 description: 4-digit OTP code received via email
 *                 example: '1234'
 *     responses:
 *       '200':
 *         description: Successfully verified OTP
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
 *                   example: 'OTP verified'
 *                 data:
 *                   type: object
 *                   properties:
 *                     otpId:
 *                       type: integer
 *                       description: ID of the verified OTP record
 *                       example: 1
 *                     userId:
 *                       type: integer
 *                       description: ID of the user requesting password reset
 *                       example: 123
 *       '400':
 *         description: Bad Request - Invalid OTP or verification failed
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                       example: 'Sorry, we could not fetch the data'
 *                     message:
 *                       type: string
 *                       example: 'Please rensend OTP to continue'
 *                 - type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                       example: 'You entered incorrect OTP'
 *                     message:
 *                       type: string
 *                       example: 'Please enter correct OTP to continue'
 *       '500':
 *         description: Internal Server Error
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
 *                   example: 'Internal server error' 
 */
router.post('/verifyotp', asyncMiddleware(businessController.verifyOTPforPassword));
//6. Change password in resposne to otp
/**
 * @swagger
 * /business/changepasswordotp:
 *   post:
 *     summary: Change password using verified OTP
 *     description: Updates user password after OTP verification in forgot password flow
 *     tags:
 *       - Business --> Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - otpId
 *               - password
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID of the user changing password
 *                 example: 123
 *               otpId:
 *                 type: integer
 *                 description: ID of the verified OTP record
 *                 example: 1
 *               password:
 *                 type: string
 *                 format: password
 *                 description: New password
 *                 example: 'NewSecurePass123!'
 *     responses:
 *       '200':
 *         description: Successfully changed password
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
 *                   example: 'Password updated successfully. Please login to continue'
 *                 data:
 *                   type: object
 *                   example: {}
 *       '400':
 *         description: Bad Request - Invalid request or verification status
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                       example: 'Sorry, we could not fetch the data'
 *                     message:
 *                       type: string
 *                       example: 'Please rensend OTP to continue'
 *                 - type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                       example: 'OTP not verified yet'
 *                     message:
 *                       type: string
 *                       example: 'Please verify OTP first'
 *       '500':
 *         description: Internal Server Error
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
 *                   example: 'Internal server error'
 */
router.post('/changepasswordotp', asyncMiddleware(businessController.changePasswordOTP));
//7. Session API

/**
 * @swagger
 * /business/session:
 *   get:
 *     summary: Get business user session details
 *     description: Retrieves authenticated business user's session information
 *     tags:
 *       - Business --> Auth
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Authentication token
 *         schema:
 *           type: string
 *       - in: body
 *         name: sessionData
 *         required: false
 *         schema:
 *           type: object
 *           properties:
 *             guestUser:
 *               type: boolean
 *               description: Flag to indicate if user is a guest
 *               example: false
 *     responses:
 *       '200':
 *         description: Successfully retrieved session data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: '1'
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 123
 *                     firstName:
 *                       type: string
 *                       example: 'John'
 *                     lastName:
 *                       type: string
 *                       example: 'Doe'
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: 'john@example.com'
 *                     status:
 *                       type: boolean
 *                       example: true
 *                     countryCode:
 *                       type: string
 *                       example: '+1'
 *                     phoneNum:
 *                       type: string
 *                       example: '1234567890'
 *       '401':
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                   example: 'Login failed'
 *                 message:
 *                   type: string
 *                   example: ''
 *       '403':
 *         description: Forbidden - User is blocked
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                   example: 'You are blocked by Admin'
 *                 message:
 *                   type: string
 *                   example: 'Please contact support for more information'
 *       '404':
 *         description: Not Found - User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                   example: 'Sorry no user found!'
 *                 message:
 *                   type: string
 *                   example: 'Please contact support for more information'
 *       '500':
 *         description: Internal Server Error
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
 *                   example: 'Internal server error'
 */
router.get('/session', validateToken, asyncMiddleware(businessController.session));
//8. Log out

/**
 * @swagger
 * /business/logout:
 *   get:
 *     summary: Logout business user
 *     description: Logs out user by removing device token and clearing Redis cache
 *     tags:
 *       - Business --> Auth
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Authentication token
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successfully logged out
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
 *                   example: 'Log-out successfully'
 *                 data:
 *                   type: object
 *                   example: {}
 *                 error:
 *                   type: string
 *                   example: ''
 *       '401':
 *         description: Unauthorized - Invalid or missing token
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
 *                   example: 'Unauthorized access'
 *       '500':
 *         description: Internal Server Error
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
 *                   example: 'Internal server error'
 *                 data:
 *                   type: object
 *                   example: {}
 *                 error:
 *                   type: string
 *                   example: 'There is some error logging out. Please try again'
 */
router.get('/logout', validateToken ,asyncMiddleware(businessController.logout));
//9. Delete user
/**
 * @swagger
 * /business/delete:
 *   post:
 *     summary: Delete business user account
 *     description: Soft deletes user account after checking for active bookings
 *     tags:
 *       - Business --> Auth
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Authentication token
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successfully deleted user or blocked due to active bookings
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: '1'
 *                     message:
 *                       type: string
 *                       example: 'User deleted successfully'
 *                     data:
 *                       type: object
 *                       example: {}
 *                     error:
 *                       type: string
 *                       example: ''
 *                 - type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: '0'
 *                     message:
 *                       type: string
 *                       example: 'Customer has Bookings'
 *                     data:
 *                       type: object
 *                       example: {}
 *                     error:
 *                       type: string
 *                       example: ''
 *       '401':
 *         description: Unauthorized - Invalid or missing token
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
 *                   example: 'Unauthorized access'
 *       '500':
 *         description: Internal Server Error
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
 *                   example: 'Internal server error'
 */
router.post('/delete', validateToken, asyncMiddleware(businessController.deleteUser));
//9. Get All Subscription Plans
router.post('/SubscriptionPlans', validateToken, asyncMiddleware(businessController.SubscriptionPlans));
//9. choose Subscription Plan
router.post('/choosePlan', validateToken, asyncMiddleware(businessController.choosePlan));

// ! Subscription Create
//*____________________________________________________________________

//=======================================================================================================//
// Redundant Routes No need to use
router.post('/SubscriptionCreate',asyncMiddleware(businessController.subscriptionCreate));

router.get('/AllSubscription',asyncMiddleware(businessController.subscriptionGet));

router.post('/CustomerSubscribe',asyncMiddleware(businessController.subscribeSubscription));

router.post('/PaypalProduct',asyncMiddleware(businessController.paypalProductCreate));

router.get('/PaypalPlans',asyncMiddleware(businessController.PayPalPlanget));

router.get('/PaypalPlanGet',asyncMiddleware(businessController.PayPalPlan));

router.post('/PlanDeactivate',asyncMiddleware(businessController.PlanDeactivation));

//router.post("/SubscribePlan",validateToken,asyncMiddleware(businessController.Subscription));

router.get('/SubscriptionDetails/:id',asyncMiddleware(businessController.SubscriptionDetails));

router.get('/SubscriptionDetailsByID/:id',asyncMiddleware(businessController.planByID));

router.post("/CardDetails",asyncMiddleware(businessController.PayPalCardInfo));

router.get("/getCardInfo",asyncMiddleware(businessController.getCardById));

//=======================================================================================================//


//! ----------------------------------------Brain Tree Routes----------------------------//
//-----------------------Brain Tree Routes-----------------//

/**
 * @swagger
 * /business/PlanCreate:
 *   post:
 *     summary: Create subscription plans
 *     description: Creates both monthly and yearly subscription plans in Braintree
 *     tags:
 *       - Business --> Brain Tree Subscription
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - limit
 *               - monthlyPrice
 *               - yearlyPrice
 *             properties:
 *               title:
 *                 type: string
 *                 description: Name of the subscription plan
 *                 example: 'New Premium'
 *               limit:
 *                 type: integer
 *                 description: Usage limit for the plan
 *                 example: 10
 *               monthlyPrice:
 *                 type: string
 *                 description: Price for monthly subscription
 *                 example: '20.00'
 *               yearlyPrice:
 *                 type: string
 *                 description: Price for yearly subscription
 *                 example: '40.00'
 *     responses:
 *       '200':
 *         description: Successfully created plans
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
 *                   example: 'Plan Created'
 *                 data:
 *                   type: object
 *                   properties:
 *                     monthplanCreate:
 *                       type: object
 *                       description: Monthly plan details from Braintree
 *                     yearPlanCreate:
 *                       type: object
 *                       description: Yearly plan details from Braintree
 *       '400':
 *         description: Bad Request - Invalid plan data
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
 *                   example: 'Invalid plan data'
 *       '500':
 *         description: Internal Server Error
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
 *                   example: 'Internal server error'
 */
router.post("/PlanCreate",asyncMiddleware(businessController.createPlanController));


/**
 * @swagger
 * /business/CreateCustomer:
 *   post:
 *     summary: Create a Braintree customer
 *     description: Creates a customer in Braintree payment gateway using user details
 *     tags:
 *       - Business --> Brain Tree Subscription
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Authentication token
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successfully created customer
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
 *                   example: 'Customer Created'
 *                 data:
 *                   type: object
 *                   description: Customer details from Braintree
 *       '401':
 *         description: Unauthorized - Invalid or missing token
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
 *                   example: 'Unauthorized access'
 *       '404':
 *         description: User not found
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
 *                   example: 'User not found'
 *       '500':
 *         description: Internal Server Error
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
 *                   example: 'Internal server error'
 */
router.post("/CreateCustomer",validateToken,asyncMiddleware(businessController.createCustomer))


/**
 * @swagger
 * /business/CreateSubscription:
 *   post:
 *     summary: Create a new subscription
 *     description: Creates a subscription plan for the user with Braintree integration
 *     tags:
 *       - Business --> Brain Tree Subscription
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Authentication token
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - planId
 *               - billingFrequency
 *               - cardToken
 *             properties:
 *               planId:
 *                 type: string
 *                 description: Braintree plan identifier
 *                 example: 'plan_123xyz'
 *               billingFrequency:
 *                 type: string
 *                 description: Billing cycle frequency (MONTHLY/Yearly)
 *                 example: 'MONTHLY'
 *               cardToken:
 *                 type: string
 *                 description: Token for the payment card
 *                 example: 'token_abc123'
 *     responses:
 *       '200':
 *         description: Successfully created subscription
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
 *                   example: 'Subscription Created'
 *                 data:
 *                   type: object
 *                   properties:
 *                     subscriptionId:
 *                       type: object
 *                       description: Subscription details from Braintree
 *       '400':
 *         description: Bad Request - Invalid request or existing subscription
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                   example: 'User Already have Subscription'
 *       '401':
 *         description: Unauthorized - Invalid or missing token
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
 *                   example: 'Unauthorized access'
 *       '500':
 *         description: Internal Server Error or Transaction Failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                   example: 'Your Transaction Failed'
 */
router.post("/CreateSubscription",validateToken,asyncMiddleware(businessController.createSubscriptionController))


/**
 * @swagger
 * /business/newCard:
 *   post:
 *     summary: Add a new card for business user
 *     description: Stores a new credit/debit card using Braintree payment gateway
 *     tags:
 *       - Business --> Brain Tree Subscription
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Authentication token
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cardDetails
 *             properties:
 *               cardDetails:
 *                 type: object
 *                 required:
 *                   - number
 *                   - cardholderName
 *                   - expire_month
 *                   - expire_year
 *                   - cvv2
 *                 properties:
 *                   number:
 *                     type: string
 *                     description: Card number
 *                     example: '5555555555554444'
 *                   cardholderName:
 *                     type: string
 *                     description: Name on the card
 *                     example: 'Kiran'
 *                   expire_month:
 *                     type: string
 *                     description: Card expiration month (MM)
 *                     example: '11'
 *                   expire_year:
 *                     type: string
 *                     description: Card expiration year (YYYY)
 *                     example: '2024'
 *                   cvv2:
 *                     type: string
 *                     description: Card security code
 *                     example: '122'
 *     responses:
 *       '200':
 *         description: Successfully added new card
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
 *                   example: 'Customer New Card Added'
 *                 data:
 *                   type: object
 *                   description: Card details from Braintree
 *       '400':
 *         description: Bad Request - Invalid card details
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
 *                   example: 'Invalid card details'
 *       '401':
 *         description: Unauthorized - Invalid or missing token
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
 *                   example: 'Unauthorized access'
 *       '500':
 *         description: Internal Server Error
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
 *                   example: 'Internal server error'
 */
router.post("/newCard",validateToken,asyncMiddleware(businessController.storeNewCard))


/**
 * @swagger
 * /business/getSubscription:
 *   get:
 *     summary: Get subscription details
 *     description: Retrieves subscription and transaction details from Braintree
 *     tags:
 *       - Business --> Brain Tree Subscription
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subscriptionId
 *             properties:
 *               subscriptionId:
 *                 type: string
 *                 description: Braintree subscription identifier
 *                 example: 'sub_123xyz'
 *     responses:
 *       '200':
 *         description: Successfully retrieved subscription details
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
 *                   example: 'Subscription Detail'
 *                 data:
 *                   type: object
 *                   properties:
 *                     subscription:
 *                       type: object
 *                       description: Subscription details from Braintree
 *                     transactions:
 *                       type: array
 *                       description: Transaction history for the subscription
 *       '400':
 *         description: Bad Request - Invalid subscription ID
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
 *                   example: 'Invalid subscription ID'
 *       '500':
 *         description: Internal Server Error
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
 *                   example: 'Internal server error'
 */
router.get('/getSubscription',asyncMiddleware(businessController.getSubscriptionDetailsController));


/**
 * @swagger
 * /business/getAllPlans:
 *   get:
 *     summary: Get all subscription plans
 *     description: Retrieves all available subscription plans from Braintree
 *     tags:
 *       - Business --> Brain Tree Subscription
 *     responses:
 *       '200':
 *         description: Successfully retrieved plans
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
 *                   example: 'All PLans'
 *                 data:
 *                   type: array
 *                   description: List of subscription plans
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: 'plan_123'
 *                       name:
 *                         type: string
 *                         example: 'Premium Plan'
 *                       price:
 *                         type: string
 *                         example: '29.99'
 *                       billingFrequency:
 *                         type: string
 *                         example: 'monthly'
 *       '500':
 *         description: Internal Server Error
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
 *                   example: 'Internal server error'
 */
router.get("/getAllPlans",asyncMiddleware(businessController.getAllPlansBT));

router.get("/expiryDate",asyncMiddleware(businessController.expiryDate));

router.post("/WebHooks",asyncMiddleware(businessController.WebHooks));


/**
 * @swagger
 * /business/CancelSubscription:
 *   post:
 *     summary: Cancel subscription
 *     description: Cancels a subscription in Braintree and updates user plan status
 *     tags:
 *       - Business --> Brain Tree Subscription
 *     parameters:
 *       - in: query
 *         name: subscriptionId
 *         required: true
 *         description: Braintree subscription identifier
 *         schema:
 *           type: string
 *         example: 'sub_123xyz'
 *     responses:
 *       '200':
 *         description: Successfully cancelled subscription
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
 *                   example: 'Subscription Cancelled'
 *                 data:
 *                   type: object
 *                   example: {}
 *       '400':
 *         description: Bad Request - Invalid subscription ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                   example: 'Invalid Subscription ID'
 *       '500':
 *         description: Internal Server Error
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
 *                   example: 'Internal server error'
 */
router.post("/CancelSubscription",asyncMiddleware(businessController.subscriptionCancelsBraintree))

/**
 * @swagger
 * /business/cardUpdate:
 *   put:
 *     summary: Update card details
 *     description: Updates existing card information in Braintree
 *     tags:
 *       - Business --> Brain Tree Subscription
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Authentication token
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cardToken
 *               - cardDetails
 *             properties:
 *               cardToken:
 *                 type: string
 *                 description: Token of the card to be updated
 *                 example: 'card_token_xyz'
 *               cardDetails:
 *                 type: object
 *                 required:
 *                   - number
 *                   - cardholderName
 *                   - expire_month
 *                   - expire_year
 *                   - cvv2
 *                 properties:
 *                   number:
 *                     type: string
 *                     description: Card number
 *                     example: '5555555555554444'
 *                   cardholderName:
 *                     type: string
 *                     description: Name on the card
 *                     example: 'John Doe'
 *                   expire_month:
 *                     type: string
 *                     description: Card expiration month (MM)
 *                     example: '12'
 *                   expire_year:
 *                     type: string
 *                     description: Card expiration year (YYYY)
 *                     example: '2025'
 *                   cvv2:
 *                     type: string
 *                     description: Card security code
 *                     example: '123'
 *     responses:
 *       '200':
 *         description: Successfully updated card
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
 *                   example: 'Card Information Updated'
 *                 data:
 *                   type: object
 *                   description: Updated card details from Braintree
 *       '400':
 *         description: Bad Request - Invalid card details
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
 *                   example: 'Invalid card details'
 *       '401':
 *         description: Unauthorized - Invalid or missing token
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
 *                   example: 'Unauthorized access'
 *       '500':
 *         description: Internal Server Error
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
 *                   example: 'Internal server error'
 */
router.put("/cardUpdate",validateToken,asyncMiddleware(businessController.btcardUpdate));

/**
 * @swagger
 * /business/paymentMethodRevoked:
 *   delete:
 *     summary: Revoke payment method
 *     description: Revokes/removes a payment method from Braintree using card token
 *     tags:
 *       - Business --> Brain Tree Subscription
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cardToken
 *             properties:
 *               cardToken:
 *                 type: string
 *                 description: Token of the card to be revoked
 *                 example: 'card_token_xyz'
 *     responses:
 *       '200':
 *         description: Successfully revoked payment method
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
 *                   example: 'Payment Method Revoked'
 *                 data:
 *                   type: object
 *                   description: Revocation details from Braintree
 *       '400':
 *         description: Bad Request - Invalid card token
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
 *                   example: 'Invalid card token'
 *       '500':
 *         description: Internal Server Error
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
 *                   example: 'Internal server error'
 */
router.delete("/paymentMethodRevoked",asyncMiddleware(businessController.PaymentRevoked))


/**
 * @swagger
 * /business/getPlanById:
 *   get:
 *     summary: Get subscription plan by ID
 *     description: Retrieves specific subscription plan details from Braintree
 *     tags:
 *       - Business --> Brain Tree Subscription
 *     parameters:
 *       - in: query
 *         name: planId
 *         required: true
 *         description: Braintree plan identifier
 *         schema:
 *           type: string
 *         example: 'plan_123xyz'
 *     responses:
 *       '200':
 *         description: Successfully retrieved plan details
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
 *                   example: 'Plan Details: '
 *                 data:
 *                   type: object
 *                   description: Plan details from Braintree
 *       '400':
 *         description: Bad Request - Invalid plan ID
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
 *                   example: 'Invalid plan ID'
 *       '500':
 *         description: Internal Server Error
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
 *                   example: 'Internal server error'
 */
router.get("/getPlanById",asyncMiddleware(businessController.getPlanByID));


/**
 * @swagger
 * /business/customerAllCards:
 *   get:
 *     summary: Get all cards for customer
 *     description: Retrieves all saved payment cards for the authenticated business user
 *     tags:
 *       - Business --> Brain Tree Subscription
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Authentication token
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successfully retrieved customer cards
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
 *                   example: 'Customer All Cards'
 *                 data:
 *                   type: array
 *                   description: List of saved cards from Braintree
 *                   items:
 *                     type: object
 *                     properties:
 *                       token:
 *                         type: string
 *                         example: 'card_token_xyz'
 *                       cardType:
 *                         type: string
 *                         example: 'Visa'
 *                       last4:
 *                         type: string
 *                         example: '4444'
 *                       expirationMonth:
 *                         type: string
 *                         example: '12'
 *                       expirationYear:
 *                         type: string
 *                         example: '2025'
 *       '401':
 *         description: Unauthorized - Invalid or missing token
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
 *                   example: 'Unauthorized access'
 *       '500':
 *         description: Internal Server Error
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
 *                   example: 'Internal server error'
 */
router.get("/customerAllCards",validateToken,asyncMiddleware(businessController.customerCards));

/**
 * @swagger
 * /business/planUpdate:
 *   put:
 *     summary: Update subscription plan
 *     description: Updates an existing subscription plan in Braintree
 *     tags:
 *       - Business --> Brain Tree Subscription
 *     parameters:
 *       - in: query
 *         name: planId
 *         required: true
 *         description: Braintree plan identifier
 *         schema:
 *           type: string
 *         example: 'plan_123xyz'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - limit
 *               - price
 *             properties:
 *               limit:
 *                 type: integer
 *                 description: Usage limit for the plan
 *                 example: 10
 *               price:
 *                 type: string
 *                 description: Price for the subscription plan
 *                 example: '16.00'
 *     responses:
 *       '200':
 *         description: Successfully updated plan
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
 *                   example: 'Plan Updated Sucessfully'
 *                 data:
 *                   type: object
 *                   description: Updated plan details from Braintree
 *       '400':
 *         description: Bad Request - Invalid plan data
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
 *                   example: 'Invalid plan data'
 *       '500':
 *         description: Internal Server Error
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
 *                   example: 'Internal server error'
 */
router.put("/planUpdate",asyncMiddleware(businessController.planUpdate));


/**
 * @swagger
 * /business/getSubID:
 *   get:
 *     summary: Get active subscription ID
 *     description: Retrieves active subscription details for the authenticated business user
 *     tags:
 *       - Business --> Brain Tree Subscription
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Authentication token
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successfully retrieved subscription details
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: '1'
 *                     message:
 *                       type: string
 *                       example: 'No Active Subscription'
 *                     data:
 *                       type: object
 *                       example: {}
 *                 - type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: '0'
 *                     message:
 *                       type: string
 *                       example: 'Active Subscription ID'
 *                     data:
 *                       type: object
 *                       properties:
 *                         subscriptionId:
 *                           type: string
 *                           description: Braintree subscription identifier
 *                           example: 'sub_123xyz'
 *                         subscriptiondata:
 *                           type: object
 *                           description: Detailed subscription information from Braintree
 *       '401':
 *         description: Unauthorized - Invalid or missing token
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
 *                   example: 'Unauthorized access'
 *       '500':
 *         description: Internal Server Error
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
 *                   example: 'Internal server error'
 */
router.get("/getSubID",validateToken,asyncMiddleware(businessController.getCustomerActiveSubscription))


/**
 * @swagger
 * /business/convertCustomer:
 *   put:
 *     summary: Convert user to business customer
 *     description: Converts a regular user to a business customer and creates Braintree customer
 *     tags:
 *       - Business --> Brain Tree Subscription
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Authentication token
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - businessName
 *               - referral
 *             properties:
 *               businessName:
 *                 type: string
 *                 description: Name of the business
 *                 example: 'My Business LLC'
 *               referral:
 *                 type: string
 *                 description: Referral code or source
 *                 example: 'REF123'
 *     responses:
 *       '200':
 *         description: Successfully converted to business customer
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
 *                   example: 'User Updated In Business'
 *                 data:
 *                   type: object
 *                   example: {}
 *       '400':
 *         description: Bad Request - Invalid user type or deleted user
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
 *                   example: 'Invalid user type or user not found'
 *       '401':
 *         description: Unauthorized - Invalid or missing token
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
 *                   example: 'Unauthorized access'
 *       '500':
 *         description: Internal Server Error
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
 *                   example: 'Internal server error'
 */
router.put("/convertCustomer",validateToken,asyncMiddleware(businessController.customerConvert))

router.post("/fedexGetInfo",asyncMiddleware(businessController.fedexGet))


/**
 * @swagger
 * /business/checkCustomer:
 *   get:
 *     summary: Check if customer exists in Braintree
 *     description: Verifies if the authenticated user exists as a customer in Braintree
 *     tags:
 *       - Business --> Brain Tree Subscription
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Authentication token
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successfully checked customer existence
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: '1'
 *                     message:
 *                       type: string
 *                       example: 'Customer Exists'
 *                     data:
 *                       type: object
 *                       properties:
 *                         userExists:
 *                           type: boolean
 *                           example: true
 *                 - type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: '1'
 *                     message:
 *                       type: string
 *                       example: 'Customer Not Exists'
 *                     data:
 *                       type: object
 *                       properties:
 *                         userExists:
 *                           type: boolean
 *                           example: false
 *       '401':
 *         description: Unauthorized - Invalid or missing token
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
 *                   example: 'Unauthorized access'
 *       '500':
 *         description: Internal Server Error
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
 *                   example: 'Internal server error'
 */
router.get("/checkCustomer",validateToken,asyncMiddleware(businessController.checkBrainTreeCustomer))




module.exports = router;