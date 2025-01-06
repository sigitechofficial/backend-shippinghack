const express = require('express');
const router = express();
const userController = require('../controller/warehouse');
const asyncMiddleware = require('../middleware/async');
const validateToken = require('../middleware/validateAdmin');
const checkwarehousePermission=require('../middleware/checkwarehousePermission')
const multer = require('multer');
const path = require('path');

// ! Module 1: Authentication 

/**
 * @swagger
 * /warehouse/distance-calculator:
 *   post:
 *     tags:
 *       - Warehouse --> Auth
 *     summary: Calculate distance between two locations
 *     description: This endpoint calculates the distance between a starting location and an ending location using latitude and longitude.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               startLocation:
 *                 type: string
 *                 description: The starting location in "latitude,longitude" format.
 *                 example: "40.7128,-74.0060"
 *               endLocation:
 *                 type: string
 *                 description: The destination location in "latitude,longitude" format.
 *                 example: "34.0522,-118.2437"
 *     responses:
 *       200:
 *         description: Distance successfully calculated.
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
 *                   example: "Distance calculated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     distance:
 *                       type: string
 *                       description: The calculated distance between the two locations.
 *                       example: "3940.7 km"
 *       400:
 *         description: Invalid request body or missing location data.
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
 *                   example: "Invalid input"
 *                 error:
 *                   type: string
 *                   example: "Both startLocation and endLocation must be provided in 'latitude,longitude' format."
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
 *                   example: "Error calculating distance"
 *                 error:
 *                   type: string
 *                   example: "There was an issue while calculating the distance between the two locations."
 */

router.post('/distance-calculator', asyncMiddleware(userController.distanceCalculator))
router.post('/emailtesting', asyncMiddleware(userController.emailTesting))            
router.post('/pushNot', asyncMiddleware(userController.notficationsTesting));

/**
 * @swagger
 * /warehouse/signupone:
 *   post:
 *     tags:
 *       - Warehouse --> Auth
 *     summary: Register a new warehouse user
 *     description: This endpoint registers a new warehouse user with the provided email and password. If the email already exists, it returns an error.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email address of the warehouse user.
 *                 example: "warehouse@example.com"
 *               password:
 *                 type: string
 *                 description: The password for the warehouse user account.
 *                 example: "securepassword123"
 *     responses:
 *       200:
 *         description: Warehouse user successfully registered.
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
 *                   example: "Success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The unique ID of the newly created warehouse user.
 *                       example: 1
 *                     email:
 *                       type: string
 *                       description: The email address of the newly registered warehouse user.
 *                       example: "warehouse@example.com"
 *       400:
 *         description: Missing or invalid input data.
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
 *                   example: "Email or Password not Entered"
 *                 error:
 *                   type: string
 *                   example: "Email or Password must be provided."
 *       409:
 *         description: The email already exists for the warehouse user.
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
 *                   example: "Email already Exist try Another Email"
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
 *                   example: "Internal server error"
 *                 error:
 *                   type: string
 *                   example: "There was an error processing the registration."
 */

router.post('/signupone', asyncMiddleware(userController.registerWarehouse));

/**
 * @swagger
 * /warehouse/signuptwo:
 *   post:
 *     tags:
 *       - Warehouse --> Auth
 *     summary: Provide additional company information for warehouse registration
 *     description: This endpoint registers additional details such as company information and address for a warehouse user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - companyName
 *               - companyEmail
 *               - countryCode
 *               - phoneNum
 *               - postalCode
 *               - country
 *               - province
 *               - district
 *               - city
 *               - completeAddress
 *             properties:
 *               id:
 *                 type: integer
 *                 description: The ID of the warehouse user.
 *                 example: 1
 *               companyName:
 *                 type: string
 *                 description: The name of the company.
 *                 example: "ABC Warehouse"
 *               companyEmail:
 *                 type: string
 *                 description: The email address of the company.
 *                 example: "contact@abcwarehouse.com"
 *               countryCode:
 *                 type: string
 *                 description: The country code for the phone number.
 *                 example: "+1"
 *               phoneNum:
 *                 type: string
 *                 description: The phone number of the company.
 *                 example: "+1234567890"
 *               postalCode:
 *                 type: string
 *                 description: The postal code for the company's address.
 *                 example: "12345"
 *               country:
 *                 type: string
 *                 description: The country of the company's location.
 *                 example: "USA"
 *               province:
 *                 type: string
 *                 description: The province or state of the company's location.
 *                 example: "California"
 *               district:
 *                 type: string
 *                 description: The district or region of the company's location.
 *                 example: "Los Angeles"
 *               city:
 *                 type: string
 *                 description: The city of the company's location.
 *                 example: "Los Angeles"
 *               completeAddress:
 *                 type: string
 *                 description: The complete street address of the company.
 *                 example: "123 Warehouse Street"
 *     responses:
 *       200:
 *         description: Company information successfully saved.
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
 *                   example: "Success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The ID of the warehouse user.
 *                       example: 1
 *                     companyName:
 *                       type: string
 *                       description: The name of the company.
 *                       example: "ABC Warehouse"
 *       400:
 *         description: Missing or invalid input data.
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
 *                   example: "Email or Password not Entered"
 *                 error:
 *                   type: string
 *                   example: "Some required fields are missing."
 *       409:
 *         description: The address already exists for the warehouse.
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
 *                   example: "You have already saved this Address"
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
 *                   example: "Internal server error"
 *                 error:
 *                   type: string
 *                   example: "There was an error processing the registration."
 */

router.post('/signuptwo', asyncMiddleware(userController.provideInfo));

/**
 * @swagger
 * /warehouse/signin:
 *   post:
 *     tags:
 *       - Warehouse --> Auth
 *     summary: Sign in with email and password for warehouse user
 *     description: This endpoint allows warehouse users to sign in using their email and password. It validates the user's credentials and provides access to their account.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - dvToken
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email of the warehouse user.
 *                 example: "contact@warehouse.com"
 *               password:
 *                 type: string
 *                 description: The password for the user's account.
 *                 example: "supersecretpassword"
 *               dvToken:
 *                 type: string
 *                 description: Device token for validation.
 *                 example: "some-device-token"
 *     responses:
 *       200:
 *         description: Login successful. Returns user information and an access token.
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
 *                   example: "Login Successful"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The ID of the warehouse user.
 *                       example: 123
 *                     email:
 *                       type: string
 *                       description: The email of the warehouse user.
 *                       example: "contact@warehouse.com"
 *                     name:
 *                       type: string
 *                       description: The name of the warehouse user.
 *                       example: "John Doe"
 *                     companyName:
 *                       type: string
 *                       description: The name of the company.
 *                       example: "ABC Warehouse"
 *                     companyEmail:
 *                       type: string
 *                       description: The email of the company.
 *                       example: "contact@abcwarehouse.com"
 *                     classifiedAId:
 *                       type: integer
 *                       description: The classification ID of the warehouse user.
 *                       example: 3
 *                     accessToken:
 *                       type: string
 *                       description: The JWT access token for the warehouse user.
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIzLCJlbWFpbCI6ImNvbnRhY3RAY2VydC5jb20iLCJkdlRva2VuIjoic29tZS1kZXZpY2UtdG9rZW4ifQ.GxGzWb02P4nlD-2xL7ftuwZqDLXqZlRJm2c"
 *                     address:
 *                       type: object
 *                       description: Address information for the warehouse user.
 *                       properties:
 *                         country:
 *                           type: string
 *                           description: Country of the warehouse location.
 *                           example: "USA"
 *                         province:
 *                           type: string
 *                           description: Province or state of the warehouse location.
 *                           example: "California"
 *                         city:
 *                           type: string
 *                           description: City of the warehouse location.
 *                           example: "Los Angeles"
 *                         district:
 *                           type: string
 *                           description: District of the warehouse location.
 *                           example: "Downtown"
 *                         streetAddress:
 *                           type: string
 *                           description: Street address of the warehouse location.
 *                           example: "123 Warehouse St"
 *       400:
 *         description: Bad request. Missing required fields or invalid credentials.
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
 *                   example: "Bad credentials"
 *       404:
 *         description: Warehouse with the given email not found.
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
 *                   example: "The email you are using to login is not available"
 *       401:
 *         description: Invalid password entered.
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
 *                   example: "Bad credentials"
 *       403:
 *         description: Account blocked by admin.
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
 *                   example: "Blocked by admin"
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
 *                   example: "Internal server error"
 */

router.post('/signin', asyncMiddleware(userController.signIn));

/**
 * @swagger
 * /warehouse/requestotp:
 *   post:
 *     tags:
 *       - Warehouse --> Auth
 *     summary: Send OTP for warehouse user to reset password or for other verifications
 *     description: This endpoint sends a one-time password (OTP) to the specified email address for warehouse users for verification purposes.
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
 *                 description: The email address of the warehouse user.
 *                 example: "contact@warehouse.com"
 *     responses:
 *       200:
 *         description: OTP sent successfully.
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
 *                       description: The OTP ID for the request.
 *                       example: 12345
 *                     warehouseId:
 *                       type: integer
 *                       description: The warehouse ID associated with the OTP.
 *                       example: 67890
 *       400:
 *         description: Email not found or invalid request.
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
 *                   example: "User with the following email does not exist."
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
 *                   example: "Internal server error"
 */
router.post('/requestotp', asyncMiddleware(userController.sendOTP));


/**
 * @swagger
 * /warehouse/verifyotp:
 *   post:
 *     tags:
 *       - Warehouse --> Auth
 *     summary: Verify OTP for warehouse user
 *     description: This endpoint verifies the OTP sent to the warehouse user's email for verification purposes. It checks whether the OTP is valid and not expired.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - OTP
 *               - warehouseId
 *             properties:
 *               OTP:
 *                 type: string
 *                 description: The OTP received by the warehouse user.
 *                 example: "123456"
 *               warehouseId:
 *                 type: integer
 *                 description: The ID of the warehouse user for whom the OTP was sent.
 *                 example: 67890
 *     responses:
 *       200:
 *         description: OTP verified successfully.
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
 *                   example: "OTP Verified"
 *                 data:
 *                   type: object
 *                   properties:
 *                     otpId:
 *                       type: integer
 *                       description: The OTP ID for the verification.
 *                       example: 12345
 *                     warehouseId:
 *                       type: integer
 *                       description: The warehouse ID associated with the OTP.
 *                       example: 67890
 *       400:
 *         description: Wrong OTP provided.
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
 *                   example: "WORNG OTP"
 *       408:
 *         description: OTP expired.
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
 *                   example: "OTP is Expired"
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
 *                   example: "Internal server error"
 */

router.post('/verifyotp', asyncMiddleware(userController.verifyOTP));
router.put('/resetpassword', asyncMiddleware(userController.resetPassword));
router.get('/getprofile', validateToken, asyncMiddleware(userController.profileData));


// ! Module 1: Authentication 
//1. General Data 
router.get('/dashboard/general', validateToken, asyncMiddleware(userController.generalDashboard));
//2. Recent activity 
router.get('/dashboard/recent', validateToken, asyncMiddleware(userController.getRecentActivity));

//! Module 2: Booking
/**
 * @swagger
 * /warehouse/bookings:
 *   get:
 *     tags:
 *       - Warehouse --> Booking Management
 *     summary: Get all bookings based on the filters provided
 *     description: This endpoint allows you to retrieve all bookings, with optional filters for booking status, delivery type, and more.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         schema:
 *           type: string
 *           example: "Bearer YOUR_TOKEN_HERE"
 *         description: The access token for the user (Bearer token).
 *       - in: query
 *         name: bookingStatus
 *         required: false
 *         schema:
 *           type: string
 *           example: "1,2,3"
 *         description: Comma-separated list of booking status IDs to filter bookings.
 *       - in: query
 *         name: deliveryType
 *         required: false
 *         schema:
 *           type: string
 *           example: "1"
 *         description: The delivery type ID to filter bookings by.
 *       - in: query
 *         name: bookingType
 *         required: false
 *         schema:
 *           type: string
 *           example: "2"
 *         description: The booking type ID to filter bookings by.
 *       - in: query
 *         name: consolidation
 *         required: false
 *         schema:
 *           type: string
 *           example: "1"
 *         description: Whether the booking is consolidated (1 for yes, 0 for no).
 *       - in: query
 *         name: transitId
 *         required: false
 *         schema:
 *           type: string
 *           example: "123"
 *         description: Filter by a specific transit group ID.
 *       - in: query
 *         name: virtualBox
 *         required: false
 *         schema:
 *           type: string
 *           example: "VB123"
 *         description: Filter bookings by a customer's virtual box number.
 *       - in: query
 *         name: located
 *         required: false
 *         schema:
 *           type: string
 *           example: "true"
 *         description: Filter bookings by location.
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of bookings based on the filters provided.
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
 *                   example: "All Bookings"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       bookingData:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 12345
 *                           trackingId:
 *                             type: string
 *                             example: "TSH-12345"
 *                           deliveryWarehouse:
 *                             type: string
 *                             example: "Warehouse A"
 *                           receivingWarehouse:
 *                             type: string
 *                             example: "Warehouse B"
 *                           total:
 *                             type: number
 *                             format: float
 *                             example: 150.75
 *                       packages:
 *                         type: object
 *                         properties:
 *                           total:
 *                             type: integer
 *                             example: 3
 *                           arrived:
 *                             type: integer
 *                             example: 2
 *                           neverArrived:
 *                             type: integer
 *                             example: 1
 *                       bookingStatus:
 *                         type: string
 *                         example: "Pending"
 *                       dropoffAddress:
 *                         type: object
 *                         properties:
 *                           streetAddress:
 *                             type: string
 *                             example: "123 Dropoff St"
 *                           district:
 *                             type: string
 *                             example: "District A"
 *                           city:
 *                             type: string
 *                             example: "City B"
 *                           province:
 *                             type: string
 *                             example: "Province X"
 *                       shipmentType:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           title:
 *                             type: string
 *                             example: "Standard"
 *                       logisticCompany:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 10
 *                           title:
 *                             type: string
 *                             example: "Logistic Co"
 *       400:
 *         description: Bad request - invalid or missing parameters.
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
 *                   example: "Invalid parameters"
 *       401:
 *         description: Unauthorized - missing or invalid authentication token.
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
 *                   example: "Unauthorized"
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
 *                   example: "Internal server error"
 */

router.get('/bookings', validateToken,checkwarehousePermission, asyncMiddleware(userController.getAllbookings));

/**
 * @swagger
 * /warehouse/bookingdetails:
 *   get:
 *     tags:
 *       - Warehouse --> Tracking
 *     summary: Get booking details by ID or Tracking ID
 *     description: This endpoint retrieves the details of a booking based on the `id` or `trackingId`. If `id` is provided, it will return details for the specific booking ID. If `s` (trackingId) is provided, it will return details for the specific tracking ID.
 *     parameters:
 *       - in: query
 *         name: id
 *         required: false
 *         schema:
 *           type: integer
 *         description: The ID of the booking.
 *       - in: query
 *         name: s
 *         required: false
 *         schema:
 *           type: string
 *         description: The tracking ID of the booking.
 *       - in: header
 *         name: accessToken
 *         required: true
 *         schema:
 *           type: string
 *           example: "Bearer YOUR_TOKEN_HERE"
 *         description: The access token for the user (Bearer token).
 *     responses:
 *       200:
 *         description: Successfully retrieved the booking details.
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
 *                       example: 12345
 *                     trackingId:
 *                       type: string
 *                       example: "TSH-12345-ABCDE"
 *                     dropoffAddress:
 *                       type: object
 *                       properties:
 *                         streetAddress:
 *                           type: string
 *                           example: "123 Main St"
 *                         city:
 *                           type: string
 *                           example: "Lahore"
 *                         province:
 *                           type: string
 *                           example: "Punjab"
 *                         country:
 *                           type: string
 *                           example: "Pakistan"
 *                         postalCode:
 *                           type: string
 *                           example: "53125"
 *                         lat:
 *                           type: string
 *                           example: "31.5497"
 *                         lng:
 *                           type: string
 *                           example: "74.3436"
 *                     packages:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           trackingNum:
 *                             type: string
 *                             example: "PN123456"
 *                           weight:
 *                             type: number
 *                             example: 12.5
 *                           volume:
 *                             type: number
 *                             example: 1.25
 *       400:
 *         description: Bad request - Missing or invalid parameters.
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
 *                   example: "Bad request"
 *       401:
 *         description: Unauthorized - Missing or invalid authentication token.
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
 *                   example: "Unauthorized"
 *       404:
 *         description: Not found - Booking ID or Tracking ID not found.
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
 *                   example: "Internal server error"
 */

// 2nd for booking management with only id parameter
/**
 * @swagger
 * /warehouse/bookingdetails:
 *   get:
 *     tags:
 *       - Warehouse --> Booking Management
 *     summary: Get booking details by ID or Tracking ID
 *     description: This endpoint retrieves the details of a booking based on the `id` or `trackingId`. If `id` is provided, it will return details for the specific booking ID. If `s` (trackingId) is provided, it will return details for the specific tracking ID.
 *     parameters:
 *       - in: query
 *         name: id
 *         required: false
 *         schema:
 *           type: integer
 *         description: The ID of the booking.
 *       - in: header
 *         name: accessToken
 *         required: true
 *         schema:
 *           type: string
 *           example: "Bearer YOUR_TOKEN_HERE"
 *         description: The access token for the user (Bearer token).
 *     responses:
 *       200:
 *         description: Successfully retrieved the booking details.
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
 *                       example: 12345
 *                     trackingId:
 *                       type: string
 *                       example: "TSH-12345-ABCDE"
 *                     dropoffAddress:
 *                       type: object
 *                       properties:
 *                         streetAddress:
 *                           type: string
 *                           example: "123 Main St"
 *                         city:
 *                           type: string
 *                           example: "Lahore"
 *                         province:
 *                           type: string
 *                           example: "Punjab"
 *                         country:
 *                           type: string
 *                           example: "Pakistan"
 *                         postalCode:
 *                           type: string
 *                           example: "53125"
 *                         lat:
 *                           type: string
 *                           example: "31.5497"
 *                         lng:
 *                           type: string
 *                           example: "74.3436"
 *                     packages:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           trackingNum:
 *                             type: string
 *                             example: "PN123456"
 *                           weight:
 *                             type: number
 *                             example: 12.5
 *                           volume:
 *                             type: number
 *                             example: 1.25
 *       400:
 *         description: Bad request - Missing or invalid parameters.
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
 *                   example: "Bad request"
 *       401:
 *         description: Unauthorized - Missing or invalid authentication token.
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
 *                   example: "Unauthorized"
 *       404:
 *         description: Not found - Booking ID or Tracking ID not found.
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
 *                   example: "Internal server error"
 */
router.get('/bookingdetails', validateToken, asyncMiddleware(userController.bookingDetailsById));
router.get('/bookingDetailsCancelled', validateToken, asyncMiddleware(userController.bookingDetailsCancelled));

// ! Module 3: Incoming to warehouse
//1. All incoming bookings
router.get('/allincoming', validateToken,checkwarehousePermission, asyncMiddleware(userController.incomingToWareHouse));
//2. Booking Details
router.post('/bookingdetails', validateToken, checkwarehousePermission,asyncMiddleware(userController.bookingDetails));
//3. Change status to received at warehouse 
router.post('/atwarehousefromdriver', validateToken, checkwarehousePermission,asyncMiddleware(userController.receivedAtWarehouse));
//4. Get all warehouses 
router.get('/allactivewarehouse', validateToken, checkwarehousePermission,asyncMiddleware(userController.allActiveWarehouse));
//5. Get all active transporter Guy 
router.get('/allactivetransporterguy', validateToken, checkwarehousePermission,asyncMiddleware(userController.getAllActiveTransporterGuy));
//6. Chnage status to transit
/**
 * @swagger
 * /warehouse/totransit:
 *   post:
 *     tags:
 *       - Warehouse --> Booking Management
 *     summary: Change the booking status to "In Transit"
 *     description: This endpoint updates the status of a booking to "In Transit" and sends notifications to the customer.
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
 *               bookingIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: The list of booking IDs to update the status to "In Transit".
 *                 example: [101, 102, 103]
 *               logisticCompanyId:
 *                 type: integer
 *                 description: The ID of the logistic company handling the transit.
 *                 example: 5
 *               deliveryWarehouseId:
 *                 type: integer
 *                 description: The ID of the delivery warehouse.
 *                 example: 2
 *     responses:
 *       200:
 *         description: Booking status successfully updated to "In Transit".
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
 *                   example: "Status changed to transit"
 *                 data:
 *                   type: object
 *                   properties:
 *                     transitId:
 *                       type: string
 *                       example: "TSH-ABC123XYZ"
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
 *                   example: "Invalid input. Booking IDs, logistic company ID, and delivery warehouse ID must be provided."
 *                 error:
 *                   type: string
 *                   example: "Missing or invalid booking IDs, logistic company ID, or delivery warehouse ID."
 *       404:
 *         description: Booking not found with the given IDs.
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
 *                   example: "Booking not found!"
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
 *                   example: "Error changing booking status."
 *                 error:
 *                   type: string
 *                   example: "There was an issue while processing the transit update."
 */

router.post('/totransit', validateToken,checkwarehousePermission, asyncMiddleware(userController.toTransit));

// ! Module 4: In-transit

//1. In-Transit groups
/**
 * @swagger
 * /warehouse/intransitgroups:
 *   get:
 *     tags:
 *       - Warehouse --> Booking Management
 *     summary: Get all in-transit bookings for the warehouse
 *     description: This endpoint returns the in-transit bookings for a warehouse, including both outgoing and incoming packages.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The token to validate the request.
 *         schema:
 *           type: string
 *           example: "your_access_token_here"
 *     responses:
 *       200:
 *         description: Successfully retrieved in-transit bookings.
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
 *                   example: "In-Transit bookings"
 *                 data:
 *                   type: object
 *                   properties:
 *                     outgoing:
 *                       type: object
 *                       properties:
 *                         outOngoing:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               transitId:
 *                                 type: string
 *                                 example: "TSH-ABC123XYZ"
 *                               status:
 *                                 type: string
 *                                 example: "On way"
 *                               receivingWarehouseT:
 *                                 type: object
 *                                 properties:
 *                                   companyName:
 *                                     type: string
 *                                     example: "Warehouse A"
 *                                   addressDBS:
 *                                     type: object
 *                                     properties:
 *                                       postalCode:
 *                                         type: string
 *                                         example: "12345"
 *                               deliveryWarehouseT:
 *                                 type: object
 *                                 properties:
 *                                   companyName:
 *                                     type: string
 *                                     example: "Warehouse B"
 *                                   addressDBS:
 *                                     type: object
 *                                     properties:
 *                                       postalCode:
 *                                         type: string
 *                                         example: "67890"
 *                               logisticCompany:
 *                                 type: object
 *                                 properties:
 *                                   title:
 *                                     type: string
 *                                     example: "Logistic Company A"
 *                         outCompleted:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               transitId:
 *                                 type: string
 *                                 example: "TSH-XYZ987"
 *                               status:
 *                                 type: string
 *                                 example: "Delivered"
 *                               receivingWarehouseT:
 *                                 type: object
 *                                 properties:
 *                                   companyName:
 *                                     type: string
 *                                     example: "Warehouse A"
 *                                   addressDBS:
 *                                     type: object
 *                                     properties:
 *                                       postalCode:
 *                                         type: string
 *                                         example: "12345"
 *                               deliveryWarehouseT:
 *                                 type: object
 *                                 properties:
 *                                   companyName:
 *                                     type: string
 *                                     example: "Warehouse B"
 *                                   addressDBS:
 *                                     type: object
 *                                     properties:
 *                                       postalCode:
 *                                         type: string
 *                                         example: "67890"
 *                               logisticCompany:
 *                                 type: object
 *                                 properties:
 *                                   title:
 *                                     type: string
 *                                     example: "Logistic Company A"
 *                     incoming:
 *                       type: object
 *                       properties:
 *                         inOngoing:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               transitId:
 *                                 type: string
 *                                 example: "TSH-DEF456"
 *                               status:
 *                                 type: string
 *                                 example: "On way"
 *                               receivingWarehouseT:
 *                                 type: object
 *                                 properties:
 *                                   companyName:
 *                                     type: string
 *                                     example: "Warehouse C"
 *                                   addressDBS:
 *                                     type: object
 *                                     properties:
 *                                       postalCode:
 *                                         type: string
 *                                         example: "54321"
 *                               deliveryWarehouseT:
 *                                 type: object
 *                                 properties:
 *                                   companyName:
 *                                     type: string
 *                                     example: "Warehouse D"
 *                                   addressDBS:
 *                                     type: object
 *                                     properties:
 *                                       postalCode:
 *                                         type: string
 *                                         example: "98765"
 *                               logisticCompany:
 *                                 type: object
 *                                 properties:
 *                                   title:
 *                                     type: string
 *                                     example: "Logistic Company B"
 *                         inCompleted:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               transitId:
 *                                 type: string
 *                                 example: "TSH-UVW123"
 *                               status:
 *                                 type: string
 *                                 example: "Delivered"
 *                               receivingWarehouseT:
 *                                 type: object
 *                                 properties:
 *                                   companyName:
 *                                     type: string
 *                                     example: "Warehouse C"
 *                                   addressDBS:
 *                                     type: object
 *                                     properties:
 *                                       postalCode:
 *                                         type: string
 *                                         example: "54321"
 *                               deliveryWarehouseT:
 *                                 type: object
 *                                 properties:
 *                                   companyName:
 *                                     type: string
 *                                     example: "Warehouse D"
 *                                   addressDBS:
 *                                     type: object
 *                                     properties:
 *                                       postalCode:
 *                                         type: string
 *                                         example: "98765"
 *                               logisticCompany:
 *                                 type: object
 *                                 properties:
 *                                   title:
 *                                     type: string
 *                                     example: "Logistic Company B"
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
 *                   example: "Invalid input. Missing required fields."
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
 *                   example: "Error fetching in-transit groups."
 *                 error:
 *                   type: string
 *                   example: "There was an issue while processing the request."
 */

router.get('/intransitgroups', validateToken,checkwarehousePermission, asyncMiddleware(userController.inTransitBookings));
//2. In-Transit group details
/**
 * @swagger
 * /warehouse/intransitgroupdetails:
 *   post:
 *     tags:
 *       - Warehouse --> Booking Management
 *     summary: Retrieve details of an in-transit group
 *     description: This endpoint retrieves detailed booking information for a specific in-transit group using its ID.
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
 *               inTransitGroupId:
 *                 type: integer
 *                 description: The ID of the in-transit group to fetch details for.
 *                 example: 123
 *     responses:
 *       200:
 *         description: Successfully retrieved in-transit group details.
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
 *                   example: "In-Transit bookings"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 101
 *                       trackingId:
 *                         type: string
 *                         example: "TRK-123456"
 *                       pickupDate:
 *                         type: string
 *                         format: date
 *                         example: "2024-12-01"
 *                       pickupEndTime:
 *                         type: string
 *                         format: time
 *                         example: "16:00:00"
 *                       weight:
 *                         type: number
 *                         example: 25.5
 *                       bookingStatusId:
 *                         type: integer
 *                         example: 6
 *                       deliveryWarehouseId:
 *                         type: integer
 *                         example: 2
 *                       pickupAddress:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           postalCode:
 *                             type: string
 *                             example: "12345"
 *                           lat:
 *                             type: number
 *                             example: 40.7128
 *                           lng:
 *                             type: number
 *                             example: -74.0060
 *                       dropoffAddress:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 2
 *                           postalCode:
 *                             type: string
 *                             example: "67890"
 *                           lat:
 *                             type: number
 *                             example: 34.0522
 *                           lng:
 *                             type: number
 *                             example: -118.2437
 *                       shipmentType:
 *                         type: object
 *                         properties:
 *                           title:
 *                             type: string
 *                             example: "Standard Shipping"
 *                       bookingStatus:
 *                         type: object
 *                         properties:
 *                           title:
 *                             type: string
 *                             example: "In Transit"
 *                       appUnits:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 5
 *                           weightUnit:
 *                             type: object
 *                             properties:
 *                               symbol:
 *                                 type: string
 *                                 example: "kg"
 *                               conversionRate:
 *                                 type: number
 *                                 example: 1.0
 *                           lengthUnit:
 *                             type: object
 *                             properties:
 *                               symbol:
 *                                 type: string
 *                                 example: "cm"
 *                               conversionRate:
 *                                 type: number
 *                                 example: 1.0
 *                           distanceUnit:
 *                             type: object
 *                             properties:
 *                               symbol:
 *                                 type: string
 *                                 example: "km"
 *                               conversionRate:
 *                                 type: number
 *                                 example: 1.0
 *                           currencyUnit:
 *                             type: object
 *                             properties:
 *                               symbol:
 *                                 type: string
 *                                 example: "$"
 *                               conversionRate:
 *                                 type: number
 *                                 example: 1.0
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
 *                   example: "Invalid input. In-transit group ID must be provided."
 *                 error:
 *                   type: string
 *                   example: "Missing or invalid in-transit group ID."
 *       404:
 *         description: In-transit group not found with the given ID.
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
 *                   example: "In-transit group not found!"
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
 *                   example: "Error fetching in-transit group details."
 *                 error:
 *                   type: string
 *                   example: "There was an issue while processing the request."
 */

router.post('/intransitgroupdetails', validateToken,checkwarehousePermission, asyncMiddleware(userController.transitGroupDetails));
//3. Received at warehouse from transporter
/**
 * @swagger
 * /warehouse/transitRecived:
 *   post:
 *     tags:
 *       - Warehouse --> Booking Management
 *     summary: Mark bookings as received at the warehouse
 *     description: This endpoint marks multiple bookings as received at the warehouse and updates their statuses. It also sends notifications to customers and updates booking histories.
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
 *               bookingIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: A list of booking IDs to mark as received at the warehouse.
 *                 example: ["101,102,103"]
 *               inTransitGroupId:
 *                 type: integer
 *                 description: The ID of the in-transit group associated with the bookings.
 *                 example: 5
 *     responses:
 *       200:
 *         description: Successfully updated the bookings as received at the warehouse.
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
 *                   example: "Bookings received at warehouse & Awaiting to be picked"
 *                 data:
 *                   type: object
 *                   properties:
 *                     bookingsUpdated:
 *                       type: integer
 *                       example: 3
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
 *                   example: "Invalid input. Booking IDs and in-transit group ID must be provided."
 *                 error:
 *                   type: string
 *                   example: "Missing or invalid booking IDs or in-transit group ID."
 *       404:
 *         description: Bookings or in-transit group not found with the given IDs.
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
 *                   example: "Bookings or in-transit group not found!"
 *       500:
 *         description: Internal server error while processing the request.
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
 *                   example: "Error marking bookings as received at the warehouse."
 *                 error:
 *                   type: string
 *                   example: "There was an issue while updating the booking status."
 */

router.post('/transitRecived', validateToken, checkwarehousePermission,asyncMiddleware(userController.receivedFromTransporter));

// ! Module 5: Outgoing from warehouse
//1. All incoming bookings
router.get('/alloutgoing', validateToken,checkwarehousePermission, asyncMiddleware(userController.outgoingFromWareHouse));
//2. Get all associated drivers
/**
 * @swagger
 * /warehouse/allassociateddrivers:
 *   get:
 *     tags:
 *       - Warehouse --> Booking Management
 *     summary: Get all drivers associated with a warehouse
 *     description: This endpoint retrieves a list of all drivers associated with a warehouse, checks their online status, and returns the drivers who are currently online.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The token to validate the request.
 *         schema:
 *           type: string
 *           example: "your_access_token_here"
 *     responses:
 *       200:
 *         description: Successfully retrieved all drivers associated with the warehouse who are online.
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
 *                   example: "All driver of warehouse"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       userId:
 *                         type: integer
 *                         example: 1
 *                       driverTypeId:
 *                         type: integer
 *                         example: 2
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           firstName:
 *                             type: string
 *                             example: "John"
 *                           lastName:
 *                             type: string
 *                             example: "Doe"
 *                           image:
 *                             type: string
 *                             example: "profile_pic_url"
 *                           countryCode:
 *                             type: string
 *                             example: "+1"
 *                           phoneNum:
 *                             type: string
 *                             example: "1234567890"
 *       400:
 *         description: No online drivers found or drivers are offline.
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
 *                   example: "All the drivers are off line"
 *                 error:
 *                   type: string
 *                   example: "Please ask the driver to become online"
 *       500:
 *         description: Internal server error while fetching drivers.
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
 *                   example: "Error fetching driver data."
 *                 error:
 *                   type: string
 *                   example: "There was an issue while fetching the driver information."
 */

router.get('/allassociateddrivers', validateToken, checkwarehousePermission,asyncMiddleware(userController.getWarehouseDrivers));
//3. Assign driver to booking
/**
 * @swagger
 * /warehouse/assigndriver:
 *   post:
 *     tags:
 *       - Warehouse --> Booking Management
 *     summary: Assign a driver to a booking
 *     description: This endpoint assigns a driver to a booking, updates the booking status, and sends notifications to both the driver and the customer (if applicable).
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
 *               bookingId:
 *                 type: integer
 *                 description: The ID of the booking to which the driver will be assigned.
 *                 example: 123
 *               bookingType:
 *                 type: string
 *                 description: The type of the booking (e.g., "selfPickup", "delivery").
 *                 example: "delivery"
 *               overRide:
 *                 type: boolean
 *                 description: A flag to indicate whether the current driver assignment should be overridden.
 *                 example: false
 *               driverId:
 *                 type: integer
 *                 description: The ID of the driver to assign to the booking.
 *                 example: 456
 *     responses:
 *       200:
 *         description: Successfully assigned the driver to the booking.
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
 *                   example: "Booking assigned to driver"
 *                 data:
 *                   type: object
 *                   properties:
 *                     bookingId:
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
 *                   example: "Invalid input. Booking ID, booking type, and driver ID must be provided."
 *                 error:
 *                   type: string
 *                   example: "Missing or invalid booking ID, booking type, or driver ID."
 *       404:
 *         description: Booking not found with the given ID or incorrect booking type.
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
 *                   example: "Booking not found or incorrect booking type."
 *       500:
 *         description: Internal server error while processing the request.
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
 *                   example: "Error assigning driver."
 *                 error:
 *                   type: string
 *                   example: "There was an issue while assigning the driver to the booking."
 */

router.post('/assigndriver', validateToken, checkwarehousePermission,asyncMiddleware(userController.assignOrderToDriver));
//4. Self pickup bookings
router.get('/selfpickupbookings', validateToken, checkwarehousePermission,asyncMiddleware(userController.selfPickupOutgoing));
//5. Self pickup handed over
/**
 * @swagger
 * /warehouse/selfpickupdelivered:
 *   post:
 *     tags:
 *       - Warehouse --> Booking Management
 *     summary: Mark a self-pickup order as delivered
 *     description: This endpoint marks a self-pickup order as delivered, updates its status, and sends notifications to the customer or email if applicable.
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
 *               bookingId:
 *                 type: integer
 *                 description: The ID of the booking to mark as delivered.
 *                 example: 123
 *     responses:
 *       200:
 *         description: Successfully marked the self-pickup order as delivered and updated the status.
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
 *                   example: "Order Completed Successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     bookingId:
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
 *                   example: "Invalid input. Booking ID must be provided."
 *                 error:
 *                   type: string
 *                   example: "Missing or invalid booking ID."
 *       404:
 *         description: Booking not found with the given ID.
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
 *                   example: "Booking not found!"
 *       500:
 *         description: Internal server error while processing the request.
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
 *                   example: "Error marking order as delivered."
 *                 error:
 *                   type: string
 *                   example: "There was an issue while updating the booking status."
 */

router.post('/selfpickupdelivered', validateToken,checkwarehousePermission, asyncMiddleware(userController.selfPickupDelivered));
//6. order handed over to the driver
/**
 * @swagger
 * /warehouse/handedOver:
 *   post:
 *     tags:
 *       - Warehouse --> Booking Management
 *     summary: Mark a booking as handed over to the driver
 *     description: This endpoint marks a booking as "handed over" to the driver, updates the booking status, and sends notifications to the customer and the receiving driver.
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
 *               id:
 *                 type: integer
 *                 description: The ID of the booking to mark as handed over to the driver.
 *                 example: 123
 *     responses:
 *       200:
 *         description: Successfully marked the booking as handed over to the driver.
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
 *                   example: "Booking Handed Over to driver"
 *                 data:
 *                   type: object
 *                   properties:
 *                     bookingId:
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
 *                   example: "Invalid input. Booking ID must be provided."
 *                 error:
 *                   type: string
 *                   example: "Missing or invalid booking ID."
 *       404:
 *         description: Booking not found with the given ID or booking status already handed over.
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
 *                   example: "Booking not found or already handed over."
 *       500:
 *         description: Internal server error while processing the request.
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
 *                   example: "Error handing over the booking to the driver."
 *                 error:
 *                   type: string
 *                   example: "There was an issue while updating the booking status."
 */

router.post('/handedOver',validateToken,checkwarehousePermission,asyncMiddleware(userController.handedOver))

// ! Module 5: Address__________________
/**
 * @swagger
 * /warehouse/address:
 *   post:
 *     tags:
 *       - Warehouse --> Address Management
 *     summary: Add a new address to the warehouse
 *     description: This endpoint adds a new address to the warehouse. It checks if the address already exists before saving it.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The token to validate the request.
 *         schema:
 *           type: string
 *           example: "your_access_token_here"
 *       - in: header
 *         name: warehouseId
 *         required: true
 *         description: The ID of the warehouse to which the address belongs.
 *         schema:
 *           type: integer
 *           example: 123
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               streetAddress:
 *                 type: string
 *                 description: The street address of the location.
 *                 example: "123 Main St"
 *               district:
 *                 type: string
 *                 description: The district of the location.
 *                 example: "Downtown"
 *               city:
 *                 type: string
 *                 description: The city of the location.
 *                 example: "New York"
 *               province:
 *                 type: string
 *                 description: The province of the location.
 *                 example: "New York"
 *               country:
 *                 type: string
 *                 description: The country of the location.
 *                 example: "USA"
 *               postalCode:
 *                 type: string
 *                 description: The postal code of the location.
 *                 example: "10001"
 *               lat:
 *                 type: number
 *                 description: Latitude of the location.
 *                 example: 40.7128
 *               lng:
 *                 type: number
 *                 description: Longitude of the location.
 *                 example: -74.0060
 *               type:
 *                 type: string
 *                 description: The type of the address (e.g., "pickup", "delivery").
 *                 example: "pickup"
 *     responses:
 *       200:
 *         description: Successfully added the address.
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
 *                   example: "Address Added"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 101
 *                     streetAddress:
 *                       type: string
 *                       example: "123 Main St"
 *                     district:
 *                       type: string
 *                       example: "Downtown"
 *                     city:
 *                       type: string
 *                       example: "New York"
 *                     province:
 *                       type: string
 *                       example: "New York"
 *                     country:
 *                       type: string
 *                       example: "USA"
 *                     postalCode:
 *                       type: string
 *                       example: "10001"
 *                     lat:
 *                       type: number
 *                       example: 40.7128
 *                     lng:
 *                       type: number
 *                       example: -74.0060
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
 *                   example: "Invalid input. All fields must be provided."
 *                 error:
 *                   type: string
 *                   example: "Missing or invalid address fields."
 *       409:
 *         description: Address already exists.
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
 *                   example: "Address already exists."
 *                 error:
 *                   type: string
 *                   example: "This address already exists for the warehouse."
 *       500:
 *         description: Internal server error while processing the request.
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
 *                   example: "Error adding address."
 *                 error:
 *                   type: string
 *                   example: "There was an issue while adding the address."
 */
router.post('/address',validateToken,checkwarehousePermission, asyncMiddleware(userController.addAddress));
/**
 * @swagger
 * /warehouse/address:
 *   get:
 *     tags:
 *       - Warehouse --> Address Management
 *     summary: Retrieve a list of addresses for a warehouse
 *     description: This endpoint retrieves a list of addresses for a specific warehouse. Optionally, it can filter by address type (e.g., "pickup", "delivery").
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The token to validate the request.
 *         schema:
 *           type: string
 *           example: "your_access_token_here"
 *       - in: query
 *         name: type
 *         required: false
 *         description: The type of the address to filter by (e.g., "pickup", "delivery").
 *         schema:
 *           type: string
 *           example: "pickup"
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of addresses.
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
 *                   example: "Success"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 101
 *                       title:
 *                         type: string
 *                         example: "Warehouse Pickup Address"
 *                       streetAddress:
 *                         type: string
 *                         example: "123 Main St"
 *                       building:
 *                         type: string
 *                         example: "Building A"
 *                       floor:
 *                         type: string
 *                         example: "2"
 *                       apartment:
 *                         type: string
 *                         example: "Apt 5B"
 *                       lat:
 *                         type: number
 *                         example: 40.7128
 *                       lng:
 *                         type: number
 *                         example: -74.0060
 *                       district:
 *                         type: string
 *                         example: "Downtown"
 *                       city:
 *                         type: string
 *                         example: "New York"
 *                       province:
 *                         type: string
 *                         example: "New York"
 *                       country:
 *                         type: string
 *                         example: "USA"
 *                       postalCode:
 *                         type: string
 *                         example: "10001"
 *       400:
 *         description: Invalid request or missing required parameters.
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
 *                   example: "Invalid input or missing parameters."
 *                 error:
 *                   type: string
 *                   example: "There was an issue fetching the addresses."
 *       500:
 *         description: Internal server error while fetching addresses.
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
 *                   example: "Error fetching addresses."
 *                 error:
 *                   type: string
 *                   example: "There was an issue while processing the request."
 */

router.get('/address',validateToken,checkwarehousePermission, asyncMiddleware(userController.getAddress));

/**
 * @swagger
 * /warehouse/address/{id}:
 *   get:
 *     tags:
 *       - Warehouse --> Address Management
 *     summary: Retrieve the details of a specific address by ID
 *     description: This endpoint retrieves the details of a specific address based on the provided address ID for a warehouse.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the address to retrieve.
 *         schema:
 *           type: integer
 *           example: 101
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The token to validate the request.
 *         schema:
 *           type: string
 *           example: "your_access_token_here"
 *     responses:
 *       200:
 *         description: Successfully retrieved the address details.
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
 *                   example: "Success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 101
 *                     title:
 *                       type: string
 *                       example: "Warehouse Pickup Address"
 *                     streetAddress:
 *                       type: string
 *                       example: "123 Main St"
 *                     building:
 *                       type: string
 *                       example: "Building A"
 *                     floor:
 *                       type: string
 *                       example: "2"
 *                     apartment:
 *                       type: string
 *                       example: "Apt 5B"
 *                     lat:
 *                       type: number
 *                       example: 40.7128
 *                     lng:
 *                       type: number
 *                       example: -74.0060
 *                     district:
 *                       type: string
 *                       example: "Downtown"
 *                     city:
 *                       type: string
 *                       example: "New York"
 *                     province:
 *                       type: string
 *                       example: "New York"
 *                     country:
 *                       type: string
 *                       example: "USA"
 *                     postalCode:
 *                       type: string
 *                       example: "10001"
 *       404:
 *         description: Address not found with the provided ID.
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
 *                   example: "Address not found."
 *       500:
 *         description: Internal server error while fetching the address details.
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
 *                   example: "Error fetching address."
 *                 error:
 *                   type: string
 *                   example: "There was an issue while fetching the address."
 */

router.get('/address/:id',validateToken, checkwarehousePermission,asyncMiddleware(userController.getAddressById));

/**
 * @swagger
 * /warehouse/address:
 *   put:
 *     tags:
 *       - Warehouse --> Address Management
 *     summary: Update an existing address for a warehouse
 *     description: This endpoint allows the user to update an existing address for the warehouse. It checks if the address already exists before updating.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The token to validate the request.
 *         schema:
 *           type: string
 *           example: "your_access_token_here"
 *       - in: header
 *         name: warehouseId
 *         required: true
 *         description: The ID of the warehouse for which the address is being updated.
 *         schema:
 *           type: integer
 *           example: 123
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 description: The ID of the address to be updated.
 *                 example: 101
 *               country:
 *                 type: string
 *                 description: The country of the address.
 *                 example: "USA"
 *               province:
 *                 type: string
 *                 description: The province of the address.
 *                 example: "New York"
 *               district:
 *                 type: string
 *                 description: The district of the address.
 *                 example: "Downtown"
 *               city:
 *                 type: string
 *                 description: The city of the address.
 *                 example: "New York"
 *               streetAddress:
 *                 type: string
 *                 description: The street address.
 *                 example: "123 Main St"
 *               lat:
 *                 type: number
 *                 description: The latitude of the address.
 *                 example: 40.7128
 *               lng:
 *                 type: number
 *                 description: The longitude of the address.
 *                 example: -74.0060
 *               postalCode:
 *                 type: string
 *                 description: The postal code of the address.
 *                 example: "10001"
 *               type:
 *                 type: string
 *                 description: The type of the address (e.g., "pickup", "delivery").
 *                 example: "pickup"
 *     responses:
 *       200:
 *         description: Successfully updated the address.
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
 *                   example: "Address Updated"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 101
 *                     streetAddress:
 *                       type: string
 *                       example: "123 Main St"
 *                     district:
 *                       type: string
 *                       example: "Downtown"
 *                     city:
 *                       type: string
 *                       example: "New York"
 *                     province:
 *                       type: string
 *                       example: "New York"
 *                     country:
 *                       type: string
 *                       example: "USA"
 *                     postalCode:
 *                       type: string
 *                       example: "10001"
 *                     lat:
 *                       type: number
 *                       example: 40.7128
 *                     lng:
 *                       type: number
 *                       example: -74.0060
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
 *                   example: "There was an issue updating the address."
 *       404:
 *         description: Address not found with the given ID.
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
 *                   example: "Address not found."
 *       409:
 *         description: Address already exists with the same details.
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
 *                   example: "Address already exists."
 *       500:
 *         description: Internal server error while updating the address.
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
 *                   example: "Error updating the address."
 *                 error:
 *                   type: string
 *                   example: "There was an issue while processing the request."
 */
router.put('/address',validateToken, checkwarehousePermission,asyncMiddleware(userController.updateAddress));

/**
 * @swagger
 * /warehouse/deleteaddress:
 *   put:
 *     tags:
 *       - Warehouse --> Address Management
 *     summary: Delete an address for a warehouse
 *     description: This endpoint marks an address as deleted by updating its `deleted` status to `true` and `status` to `false`.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The token to validate the request.
 *         schema:
 *           type: string
 *           example: "your_access_token_here"
 *       - in: header
 *         name: warehouseId
 *         required: true
 *         description: The ID of the warehouse to which the address belongs.
 *         schema:
 *           type: integer
 *           example: 123
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               addressId:
 *                 type: integer
 *                 description: The ID of the address to be deleted.
 *                 example: 101
 *     responses:
 *       200:
 *         description: Successfully deleted the address.
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
 *                   example: "Deleted Successfully"
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
 *                   example: "Invalid input. Address ID must be provided."
 *                 error:
 *                   type: string
 *                   example: "Missing or invalid address ID."
 *       404:
 *         description: Address not found with the provided ID.
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
 *                   example: "Address not found."
 *       500:
 *         description: Internal server error while deleting the address.
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
 *                   example: "Error deleting address."
 *                 error:
 *                   type: string
 *                   example: "There was an issue while processing the request."
 */

router.put('/deleteaddress',validateToken, checkwarehousePermission,asyncMiddleware(userController.deleteAddress)); 

// ! Module 6: Order Creation
//1. Get ids for booking
router.get('/bookingdata', validateToken, checkwarehousePermission,asyncMiddleware(userController.idsForBooking))
//2. Get address using search filter 
router.post('/getaddresses', validateToken, checkwarehousePermission,asyncMiddleware(userController.searchAddress))
//3. Check coupon validity
router.post('/couponvalidity', validateToken,checkwarehousePermission, asyncMiddleware(userController.checkCouponValidity));
// 4. get Charges
router.post('/getcharges', validateToken,checkwarehousePermission, asyncMiddleware(userController.getCharges));
// 5. create booking
router.post('/createorder', validateToken,checkwarehousePermission, asyncMiddleware(userController.createOrder));
//6. Confirm Payment 
router.post('/confirmpayment', validateToken,checkwarehousePermission, asyncMiddleware(userController.confirmPayment));
// 7.Package arrived
/**
 * @swagger
 * /warehouse/packageArrived:
 *   post:
 *     tags:
 *       - Warehouse --> Booking Management
 *     summary: Update the arrival status of a package
 *     description: This endpoint allows updating the arrival status of a package and sends notifications based on the updated status.
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
 *               id:
 *                 type: integer
 *                 description: The ID of the package to update.
 *                 example: 123
 *               arrived:
 *                 type: string
 *                 description: The arrival status of the package ("arrived", "pending", or "neverArrived").
 *                 example: "arrived"
 *             required:
 *               - id
 *               - arrived
 *     responses:
 *       200:
 *         description: Package status successfully updated.
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
 *                   example: "Package Status updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 123
 *                     arrived:
 *                       type: string
 *                       example: "arrived"
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
 *                   example: "Invalid input. Package ID and arrival status must be provided."
 *                 error:
 *                   type: string
 *                   example: "Missing or invalid package ID or arrival status."
 *       404:
 *         description: Package not found with the given ID.
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
 *                   example: "Package not found!"
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
 *                   example: "Error updating package status."
 *                 error:
 *                   type: string
 *                   example: "There was an issue while processing the package arrival update."
 */

router.post('/packageArrived',validateToken,checkwarehousePermission,asyncMiddleware(userController.packageArrived))
// 8. update Remeasurement
/**
 * @swagger
 * /warehouse/remeasurement:
 *   post:
 *     tags:
 *       - Warehouse --> Booking Management
 *     summary: Update package remeasurement details
 *     description: This endpoint allows for the updating of remeasurement details (e.g., weight, dimensions) of a package and updates related booking and package information.
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
 *               id:
 *                 type: integer
 *                 description: The ID of the package to update.
 *                 example: 123
 *               actualWeight:
 *                 type: number
 *                 description: The actual weight of the package in the base unit (e.g., kg).
 *                 example: 10.5
 *               actualLength:
 *                 type: number
 *                 description: The actual length of the package in the base unit (e.g., cm).
 *                 example: 50
 *               actualWidth:
 *                 type: number
 *                 description: The actual width of the package in the base unit (e.g., cm).
 *                 example: 30
 *               actualHeight:
 *                 type: number
 *                 description: The actual height of the package in the base unit (e.g., cm).
 *                 example: 20
 *               actualVolume:
 *                 type: number
 *                 description: The actual volume of the package in the base unit (e.g., cm³).
 *                 example: 30000
 *               category:
 *                 type: integer
 *                 description: The category ID for the package.
 *                 example: 5
 *     responses:
 *       200:
 *         description: Package remeasurement details successfully updated.
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
 *                   example: "Package remeasurements are updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     updatedPackage:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 123
 *                         actualWeight:
 *                           type: number
 *                           example: 10.5
 *                         actualLength:
 *                           type: number
 *                           example: 50
 *                         actualWidth:
 *                           type: number
 *                           example: 30
 *                         actualHeight:
 *                           type: number
 *                           example: 20
 *                         actualVolume:
 *                           type: number
 *                           example: 30000
 *                         category:
 *                           type: integer
 *                           example: 5
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
 *                   example: "Invalid input. Package ID and all required fields must be provided."
 *                 error:
 *                   type: string
 *                   example: "Missing or invalid package ID or other required data."
 *       404:
 *         description: Package not found with the given ID.
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
 *                   example: "Package not found!"
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
 *                   example: "Error updating package remeasurement details."
 *                 error:
 *                   type: string
 *                   example: "There was an issue while processing the remeasurement update."
 */

router.post('/remeasurement',validateToken,checkwarehousePermission,asyncMiddleware(userController.createRemeasurement));
// 9. update consolidate order measurements
/**
 * @swagger
 * /warehouse/consolidateMeasurement:
 *   post:
 *     tags:
 *       - Warehouse --> Booking Management
 *     summary: Update booking consolidation remeasurement details
 *     description: This endpoint allows for updating the consolidation remeasurement details for a booking and related packages.
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
 *               id:
 *                 type: integer
 *                 description: The ID of the booking to update.
 *                 example: 456
 *               weight:
 *                 type: number
 *                 description: The weight of the consolidated booking in the base unit (e.g., kg).
 *                 example: 100.5
 *               length:
 *                 type: number
 *                 description: The length of the consolidated booking in the base unit (e.g., cm).
 *                 example: 150
 *               width:
 *                 type: number
 *                 description: The width of the consolidated booking in the base unit (e.g., cm).
 *                 example: 80
 *               height:
 *                 type: number
 *                 description: The height of the consolidated booking in the base unit (e.g., cm).
 *                 example: 60
 *               volume:
 *                 type: number
 *                 description: The volume of the consolidated booking in the base unit (e.g., cm³).
 *                 example: 720000
 *     responses:
 *       200:
 *         description: Booking consolidation remeasurement details successfully updated.
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
 *                   example: "Booking remeasurements are updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     updatedBooking:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 456
 *                         weight:
 *                           type: number
 *                           example: 100.5
 *                         length:
 *                           type: number
 *                           example: 150
 *                         width:
 *                           type: number
 *                           example: 80
 *                         height:
 *                           type: number
 *                           example: 60
 *                         volume:
 *                           type: number
 *                           example: 720000
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
 *                   example: "Invalid input. Booking ID and all required fields must be provided."
 *                 error:
 *                   type: string
 *                   example: "Missing or invalid booking ID or other required data."
 *       404:
 *         description: Booking not found with the given ID or booking is not eligible for consolidation.
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
 *                   example: "Booking Not Found or Not Eligible for Consolidation."
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
 *                   example: "Error updating booking consolidation remeasurement details."
 *                 error:
 *                   type: string
 *                   example: "There was an issue while processing the consolidation update."
 */

router.post('/consolidateMeasurement',validateToken,checkwarehousePermission,asyncMiddleware(userController.consolidationRemesurements));

// ! Module 7: Create Driver
//1.  Register step 1
const uploadProfileImgs = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, `./Public/Images/Profile`)
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
 * /warehouse/registerstep1:
 *   post:
 *     tags:
 *       - Warehouse --> Driver
 *     summary: Register step 1 for user creation
 *     description: This endpoint allows a user to register by providing their basic information, including a profile image.
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         schema:
 *           type: string
 *           example: "Bearer YOUR_TOKEN_HERE"
 *         description: The access token for the user (Bearer token).
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: The first name of the user.
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 description: The last name of the user.
 *                 example: "Doe"
 *               email:
 *                 type: string
 *                 description: The email address of the user.
 *                 example: "john.doe@example.com"
 *               countryCode:
 *                 type: string
 *                 description: The country code for the user's phone number.
 *                 example: "+1"
 *               phoneNum:
 *                 type: string
 *                 description: The phone number of the user.
 *                 example: "1234567890"
 *               password:
 *                 type: string
 *                 description: The password for the user account.
 *                 example: "securePassword123"
 *               profileImage:
 *                 type: file
 *                 format: binary
 *                 description: The profile image of the user.
 *     responses:
 *       200:
 *         description: Successfully completed the first step of registration.
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
 *                     id:
 *                       type: integer
 *                       description: The ID of the newly created user.
 *                       example: 1
 *       400:
 *         description: Bad request - invalid or missing parameters.
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
 *                   example: "Profile Image missing"
 *       422:
 *         description: Unprocessable Entity - email or phone number already exists.
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
 *                   example: "The email or phone number you entered is already taken"
 */

router.post('/registerstep1',validateToken, uploadProfile.single('profileImage'), asyncMiddleware(userController.registerStep1))

// 2. Get all active vehicles
router.get('/getactivevehicles', validateToken, asyncMiddleware(userController.getActiveVehicleTypes))
//3. Register driver step 2
const uploadVehImgs = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, `./Public/Images/VehicleImages`)
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
 * /warehouse/registerstep2:
 *   post:
 *     tags:
 *       - Warehouse --> Driver
 *     summary: Register step 2 for user vehicle details and images
 *     description: This endpoint allows a user to provide vehicle details and upload images related to the vehicle for the second step of the registration process.
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         schema:
 *           type: string
 *           example: "Bearer YOUR_TOKEN_HERE"
 *         description: The access token for the user (Bearer token).
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               vehicleTypeId:
 *                 type: integer
 *                 description: The ID of the vehicle type (e.g., car, truck).
 *                 example: 1
 *               vehicleMake:
 *                 type: string
 *                 description: The make of the vehicle (e.g., Toyota, Ford).
 *                 example: "Toyota"
 *               vehicleModel:
 *                 type: string
 *                 description: The model of the vehicle (e.g., Corolla, Mustang).
 *                 example: "Corolla"
 *               vehicleYear:
 *                 type: integer
 *                 description: The year the vehicle was manufactured.
 *                 example: 2020
 *               vehicleColor:
 *                 type: string
 *                 description: The color of the vehicle (e.g., red, blue).
 *                 example: "Red"
 *               userId:
 *                 type: integer
 *                 description: The ID of the user who is registering the vehicle.
 *                 example: 123
 *               vehImages:
 *                 type: array
 *                 items:
 *                   type: file
 *                   format: binary
 *                 description: Array of vehicle images to be uploaded. Maximum of 10 images.
 *     responses:
 *       200:
 *         description: Successfully completed the second step of registration with vehicle details and images uploaded.
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
 *                       description: The ID of the user's vehicle registration details.
 *                       example: 123
 *                     userId:
 *                       type: integer
 *                       description: The ID of the user.
 *                       example: 456
 *       400:
 *         description: Bad request - missing or invalid parameters.
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
 *       422:
 *         description: Unprocessable Entity - invalid vehicle data or other errors.
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
 *                   example: "The email or phone number you entered is already taken"
 */
router.post('/registerstep2', validateToken, uploadVeh.array('vehImages', 10), asyncMiddleware(userController.registerStep2));
//1.  Register step 3
const uploadLicImgs = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, `./Public/Images/LicenseImages`);
    },
    filename: (req, file, cb) => {
        cb(null, 'LicImg-' + req.body.userId + '-'+  Date.now() +  path.extname(file.originalname));
    }
});
const uploadLic = multer({
    storage: uploadLicImgs,
});

/**
 * @swagger
 * /warehouse/registerstep3:
 *   post:
 *     tags:
 *       - Warehouse --> Driver
 *     summary: Register step 3 for user license details and images
 *     description: This endpoint allows a user to provide their license details and upload images for the third step of the registration process.
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         schema:
 *           type: string
 *           example: "Bearer YOUR_TOKEN_HERE"
 *         description: The access token for the user (Bearer token).
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               licIssueDate:
 *                 type: string
 *                 description: The issue date of the license.
 *                 example: "2022-01-01"
 *               licExpiryDate:
 *                 type: string
 *                 description: The expiry date of the license.
 *                 example: "2025-01-01"
 *               userId:
 *                 type: integer
 *                 description: The ID of the user for whom the license details are being updated.
 *                 example: 123
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
 *         description: Successfully completed the third step of registration with license details and images uploaded.
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
 *                   example: "Driver created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: integer
 *                       description: The ID of the user whose license details were updated.
 *                       example: 123
 *       400:
 *         description: Bad request - missing or invalid parameters.
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
 *       422:
 *         description: Unprocessable Entity - invalid license data or other errors.
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
 *                   example: "The provided data is invalid"
 */
router.post('/registerstep3', validateToken, uploadLic.fields([{name: 'frontImage', maxCount: 1}, {name: 'backImage', maxCount: 1} ]) , asyncMiddleware(userController.registerStep3));
//2. Get all associated drivers
/**
 * @swagger
 * /warehouse/alldrivers:
 *   get:
 *     tags:
 *       - Warehouse --> Driver
 *     summary: Get all drivers associated with a warehouse
 *     description: This endpoint retrieves all drivers that are associated with a specific warehouse.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         schema:
 *           type: string
 *           example: "Bearer YOUR_TOKEN_HERE"
 *         description: The access token for the user (Bearer token).
 *     responses:
 *       200:
 *         description: Successfully retrieved all drivers associated with the warehouse.
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
 *                   example: "All drivers of warehouse"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The ID of the driver.
 *                         example: 1
 *                       firstName:
 *                         type: string
 *                         description: The first name of the driver.
 *                         example: "John"
 *                       lastName:
 *                         type: string
 *                         description: The last name of the driver.
 *                         example: "Doe"
 *                       image:
 *                         type: string
 *                         description: The profile image URL of the driver.
 *                         example: "http://example.com/profile.jpg"
 *                       countryCode:
 *                         type: string
 *                         description: The country code of the driver's phone number.
 *                         example: "+1"
 *                       phoneNum:
 *                         type: string
 *                         description: The phone number of the driver.
 *                         example: "1234567890"
 *                       status:
 *                         type: string
 *                         description: The status of the driver (active/inactive).
 *                         example: "active"
 *       401:
 *         description: Unauthorized - invalid or missing authentication token.
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
 *                   example: "Unauthorized"
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
 *                   example: "Internal server error"
 */

router.get('/alldrivers', validateToken, checkwarehousePermission,asyncMiddleware(userController.getWarehouseDriversAll));
// update driver profile
/**
 * @swagger
 * /warehouse/updateDriverProfile:
 *   put:
 *     tags:
 *       - Warehouse --> Driver
 *     summary: Update driver profile
 *     description: This endpoint allows a user to update their driver profile with basic information like first name, last name, email, phone number, etc.
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         schema:
 *           type: string
 *           example: "Bearer YOUR_TOKEN_HERE"
 *         description: The access token for the user (Bearer token).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
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
 *                 example: "john.doe@example.com"
 *               countryCode:
 *                 type: string
 *                 description: The country code for the driver's phone number.
 *                 example: "+1"
 *               phoneNum:
 *                 type: string
 *                 description: The phone number of the driver.
 *                 example: "1234567890"
 *               userId:
 *                 type: integer
 *                 description: The ID of the user whose profile is being updated.
 *                 example: 123
 *     responses:
 *       200:
 *         description: Successfully updated the driver profile.
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
 *                   example: "Driver Profile Updated"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The ID of the updated user.
 *                       example: 123
 *       400:
 *         description: Bad request - missing or invalid parameters.
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
 *                   example: "Bad request"
 *       422:
 *         description: Unprocessable Entity - user data is invalid or already exists.
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
 *                   example: "The email or phone number already exists"
 */

router.put('/updateDriverProfile',validateToken,checkwarehousePermission,asyncMiddleware(userController.updateDriverProfile));
// update driver vehicle
/**
 * @swagger
 * /warehouse/updateDriverVehicle:
 *   put:
 *     tags:
 *       - Warehouse --> Driver
 *     summary: Update driver vehicle details and images
 *     description: This endpoint allows a user to update their vehicle details and upload images related to the vehicle.
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         schema:
 *           type: string
 *           example: "Bearer YOUR_TOKEN_HERE"
 *         description: The access token for the user (Bearer token).
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               vehicleTypeId:
 *                 type: integer
 *                 description: The ID of the vehicle type (e.g., car, truck).
 *               vehicleMake:
 *                 type: string
 *                 description: The make of the vehicle (e.g., Toyota, Ford).
 *               vehicleModel:
 *                 type: string
 *                 description: The model of the vehicle (e.g., Corolla, Mustang).
 *               vehicleYear:
 *                 type: integer
 *                 description: The year the vehicle was manufactured.
 *               vehicleColor:
 *                 type: string
 *                 description: The color of the vehicle (e.g., red, blue).
 *               userId:
 *                 type: integer
 *                 description: The ID of the user whose vehicle details are being updated.
 *               imgUpdate:
 *                 type: string
 *                 description: Whether the images need to be updated (true/false).
 *               vehImages:
 *                 type: array
 *                 items:
 *                   type: file
 *                 description: Array of vehicle images to be uploaded. Maximum of 10 images.
 *     responses:
 *       200:
 *         description: Successfully updated the driver vehicle details and images.
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
 *                   example: "Driver Vehicle Updated Successfully"
 *       400:
 *         description: Bad request - missing or invalid parameters.
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
 *                   example: "Vehicle Images not uploaded"
 *       404:
 *         description: Not Found - Driver details do not exist.
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
 *                   example: "Driver details doesn't exist"
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
 *                   example: "Error updating driver vehicle details"
 */

router.put('/updateDriverVehicle',validateToken,uploadVeh.array('vehImages', 10),asyncMiddleware(userController.updateDriverVehicle));
// update status of the driver
/**
 * @swagger
 * /warehouse/updateDriverStatus:
 *   put:
 *     tags:
 *       - Warehouse --> Driver
 *     summary: Update driver status
 *     description: This endpoint updates the driver's status based on the provided user ID and status value.
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         schema:
 *           type: string
 *           example: "Bearer YOUR_TOKEN_HERE"
 *         description: The access token for the user (Bearer token).
 *       - in: body
 *         name: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             userId:
 *               type: integer
 *               description: The ID of the driver whose status is being updated.
 *               example: 1
 *             status:
 *               type: integer
 *               description: The new status of the driver. 0 for inactive, 1 for active.
 *               enum: [0, 1]
 *               example: 1
 *     responses:
 *       200:
 *         description: Successfully updated the driver's status.
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
 *                   example: "Driver Status Updated Successfully"
 *       400:
 *         description: Bad request - missing or invalid parameters.
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
 *                   example: "Status doesn't exist for the driver"
 *       404:
 *         description: Not found - driver details not found.
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
 *                   example: "Driver Details Doesn't Exist"
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
 *                   example: "Internal server error"
 */
router.put('/updateDriverStatus',validateToken,checkwarehousePermission,asyncMiddleware(userController.updateDriverStatus));
// get driver details
/**
 * @swagger
 * /warehouse/driverdetails:
 *   get:
 *     tags:
 *       - Warehouse --> Driver
 *     summary: Get driver details by ID
 *     description: This endpoint retrieves the details of a specific driver, including personal information, vehicle details, and booking history.
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the driver to fetch details for.
 *       - in: header
 *         name: accessToken
 *         required: true
 *         schema:
 *           type: string
 *           example: "Bearer YOUR_TOKEN_HERE"
 *         description: The access token for the user (Bearer token).
 *     responses:
 *       200:
 *         description: Successfully retrieved the driver details.
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
 *                   example: "Driver Details"
 *                 data:
 *                   type: object
 *                   properties:
 *                     driverProfile:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           description: The driver's ID.
 *                           example: 1
 *                         firstName:
 *                           type: string
 *                           description: The driver's first name.
 *                           example: "John"
 *                         lastName:
 *                           type: string
 *                           description: The driver's last name.
 *                           example: "Doe"
 *                         email:
 *                           type: string
 *                           description: The driver's email address.
 *                           example: "john.doe@example.com"
 *                         countryCode:
 *                           type: string
 *                           description: The country code of the driver's phone number.
 *                           example: "+1"
 *                         phoneNum:
 *                           type: string
 *                           description: The driver's phone number.
 *                           example: "1234567890"
 *                         image:
 *                           type: string
 *                           description: URL of the driver's profile image.
 *                           example: "https://example.com/image.jpg"
 *                     Documents:
 *                       type: object
 *                       properties:
 *                         licIssueDate:
 *                           type: string
 *                           description: The issue date of the driver's license.
 *                           example: "2020-01-01"
 *                         licExpiryDate:
 *                           type: string
 *                           description: The expiry date of the driver's license.
 *                           example: "2025-01-01"
 *                         licFrontImage:
 *                           type: string
 *                           description: URL of the driver's license front image.
 *                           example: "https://example.com/licFront.jpg"
 *                         licBackImage:
 *                           type: string
 *                           description: URL of the driver's license back image.
 *                           example: "https://example.com/licBack.jpg"
 *                     vehicleDetails:
 *                       type: object
 *                       properties:
 *                         vehicleMake:
 *                           type: string
 *                           description: The make of the vehicle.
 *                           example: "Toyota"
 *                         vehicleModel:
 *                           type: string
 *                           description: The model of the vehicle.
 *                           example: "Corolla"
 *                         vehicleYear:
 *                           type: integer
 *                           description: The year the vehicle was made.
 *                           example: 2020
 *                         vehicleColor:
 *                           type: string
 *                           description: The color of the vehicle.
 *                           example: "Red"
 *                         vehicleImages:
 *                           type: array
 *                           items:
 *                             type: string
 *                             description: URL of the vehicle images.
 *                             example: "https://example.com/vehicle1.jpg"
 *                     vehicleType:
 *                       type: object
 *                       properties:
 *                         title:
 *                           type: string
 *                           description: The type of the vehicle.
 *                           example: "Sedan"
 *                         image:
 *                           type: string
 *                           description: The image URL for the vehicle type.
 *                           example: "https://example.com/sedan.jpg"
 *       400:
 *         description: Bad request - invalid or missing parameters.
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
 *                   example: "Invalid parameters"
 *       404:
 *         description: Not Found - driver not found.
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
 *                   example: "Driver not found"
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
 *                   example: "Internal server error"
 */

router.get('/driverdetails', validateToken, checkwarehousePermission,asyncMiddleware(userController.driverDetailsById));
// update driver license info
/**
 * @swagger
 * /warehouse/updateDriverLicense:
 *   put:
 *     tags:
 *       - Warehouse --> Driver
 *     summary: Update driver license details
 *     description: This endpoint allows updating the driver’s license details, including the issue and expiry dates and uploading license images.
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         schema:
 *           type: string
 *           example: "Bearer YOUR_TOKEN_HERE"
 *         description: The access token for the user (Bearer token).
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: The ID of the user whose license information is being updated.
 *                 example: 123
 *               licIssueDate:
 *                 type: string
 *                 format: date
 *                 description: The issue date of the driver's license.
 *                 example: "2023-06-15"
 *               licExpiryDate:
 *                 type: string
 *                 format: date
 *                 description: The expiry date of the driver's license.
 *                 example: "2025-06-15"
 *               imageUpdated:
 *                 type: string
 *                 description: Flag indicating if the images are being updated ("true" if images are updated).
 *                 example: "true"
 *               frontImage:
 *                 type: file
 *                 description: The front image of the driver's license.
 *               backImage:
 *                 type: file
 *                 description: The back image of the driver's license.
 *     responses:
 *       200:
 *         description: Successfully updated the driver's license details.
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
 *                   example: "License Info Updated Successfully"
 *                 data:
 *                   type: string
 *                   example: "License images and Dates"
 *       400:
 *         description: Bad request - missing or invalid parameters.
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
 *                   example: "Images Not Uploaded"
 *       404:
 *         description: Not found - user not found with the provided userId.
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
 *                   example: "User not found"
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
 *                   example: "Internal server error"
 */


router.put('/updateDriverLicense',validateToken,uploadLic.fields([{name: 'frontImage', maxCount: 1}, {name: 'backImage', maxCount: 1} ]),asyncMiddleware(userController.updateDriverLicense));
// delete Driver
/**
 * @swagger
 * /warehouse/deleteDriver:
 *   delete:
 *     tags:
 *       - Warehouse --> Driver
 *     summary: Delete a driver
 *     description: This endpoint allows for the deletion of a driver. It checks if the driver has any active bookings before deleting the user.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         schema:
 *           type: string
 *           example: "Bearer YOUR_TOKEN_HERE"
 *         description: The access token for the user (Bearer token).
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           description: The ID of the driver to be deleted.
 *           example: 1
 *     responses:
 *       200:
 *         description: Successfully deleted the driver.
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
 *       400:
 *         description: Driver has active bookings and cannot be deleted.
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
 *       404:
 *         description: Driver not found.
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
 *                   example: "Driver not found"
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
 *                   example: "Internal server error"
 */
router.delete('/deleteDriver',validateToken,checkwarehousePermission,asyncMiddleware(userController.deleteUser))
// ! Module 7: Create Driver

//1. Completed bookings 
router.get('/compeltedbookings', validateToken, asyncMiddleware(userController.completedBookings));

// ! Module 9: profile management
// 1. Get profile details by user Id
/**
 * @swagger
 * /warehouse/profile:
 *   get:
 *     tags:
 *       - Warehouse --> Profile Management
 *     summary: Get warehouse profile information
 *     description: This endpoint retrieves the profile details of the logged-in warehouse user, including personal and address information.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         schema:
 *           type: string
 *           example: "Bearer YOUR_TOKEN_HERE"
 *         description: The access token of the logged-in user (Bearer token).
 *     responses:
 *       200:
 *         description: Successfully retrieved warehouse profile information.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                       description: The email of the warehouse user.
 *                       example: "user@example.com"
 *                     companyName:
 *                       type: string
 *                       description: The company name of the warehouse user.
 *                       example: "Warehouse Ltd."
 *                     companyEmail:
 *                       type: string
 *                       description: The company email of the warehouse user.
 *                       example: "info@warehouse.com"
 *                     countryCode:
 *                       type: string
 *                       description: The country code of the warehouse user's phone number.
 *                       example: "+1"
 *                     phoneNum:
 *                       type: string
 *                       description: The phone number of the warehouse user.
 *                       example: "+1234567890"
 *                     address:
 *                       type: object
 *                       properties:
 *                         title:
 *                           type: string
 *                           description: The address title (e.g., "Main Office").
 *                           example: "Warehouse Office"
 *                         streetAddress:
 *                           type: string
 *                           description: The street address of the warehouse.
 *                           example: "1234 Warehouse St."
 *                         building:
 *                           type: string
 *                           description: The building number or name.
 *                           example: "Building A"
 *                         floor:
 *                           type: string
 *                           description: The floor number in the building.
 *                           example: "Floor 1"
 *                         apartment:
 *                           type: string
 *                           description: The apartment number, if applicable.
 *                           example: "Apt 101"
 *                         district:
 *                           type: string
 *                           description: The district of the warehouse address.
 *                           example: "District 5"
 *                         city:
 *                           type: string
 *                           description: The city of the warehouse address.
 *                           example: "Lahore"
 *                         province:
 *                           type: string
 *                           description: The province of the warehouse address.
 *                           example: "Punjab"
 *                         country:
 *                           type: string
 *                           description: The country of the warehouse address.
 *                           example: "Pakistan"
 *                         postalCode:
 *                           type: string
 *                           description: The postal code of the warehouse address.
 *                           example: "53125"
 *                         lat:
 *                           type: string
 *                           description: The latitude of the warehouse address.
 *                           example: "31.5497"
 *                         lng:
 *                           type: string
 *                           description: The longitude of the warehouse address.
 *                           example: "74.3587"
 *       400:
 *         description: Bad request - missing or invalid parameters.
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
 *                   example: "Bad request"
 *       401:
 *         description: Unauthorized - missing or invalid authentication token.
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
 *                   example: "Unauthorized"
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
 *                   example: "Internal server error"
 */

router.get('/profile',validateToken, asyncMiddleware(userController.profile_management));

// ! Module 10: virtual box
// 1. Get Virtual Box details by virtual box number
/**
 * @swagger
 * /warehouse/virtualBox/{id}:
 *   get:
 *     tags:
 *       - Warehouse --> Profile Management
 *     summary: Get virtual box details
 *     description: This endpoint retrieves information about the warehouse user associated with a specific virtual box ID. It includes booking details for the user.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The virtual box ID for which the details are being fetched.
 *       - in: header
 *         name: accessToken
 *         required: true
 *         schema:
 *           type: string
 *           example: "Bearer YOUR_TOKEN_HERE"
 *         description: The access token for the user (Bearer token).
 *     responses:
 *       200:
 *         description: Successfully retrieved the virtual box details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     virtualBox:
 *                       type: string
 *                       description: The virtual box ID associated with the warehouse.
 *                       example: "12345"
 *                     customersss:
 *                       type: array
 *                       description: A list of bookings associated with the virtual box.
 *                       items:
 *                         type: object
 *                         properties:
 *                           bookingId:
 *                             type: string
 *                             description: The booking ID associated with the virtual box.
 *                             example: "56789"
 *                           customerName:
 *                             type: string
 *                             description: The name of the customer associated with the booking.
 *                             example: "John Doe"
 *                           status:
 *                             type: string
 *                             description: The status of the booking.
 *                             example: "pending"
 *       400:
 *         description: Bad request - missing or invalid parameters.
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
 *                   example: "Bad request"
 *       401:
 *         description: Unauthorized - missing or invalid authentication token.
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
 *                   example: "Unauthorized"
 *       404:
 *         description: Not found - virtual box ID not found.
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
 *                   example: "Virtual box not found"
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
 *                   example: "Internal server error"
 */
router.get('/virtualBox/:id',validateToken, checkwarehousePermission,asyncMiddleware(userController.virtualBox));


// ! Module 11: Tracking
// 1. Get booking details by tracking Id
router.post('/trackorder', asyncMiddleware(userController.bookingDetailsByTracking));


// ! Module 11: dashboard
// 1. homepage
/**
 * @swagger
 * /warehouse/homepage:
 *   get:
 *     tags:
 *       - Warehouse --> Dashboard
 *     summary: Fetch dashboard general data for the warehouse
 *     description: Retrieve various statistics related to bookings for a specific warehouse, including total orders, incoming, in transit, delivered, cancelled, and more.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         schema:
 *           type: string
 *           example: "Bearer YOUR_ACCESS_TOKEN"
 *         description: The access token for authentication (Bearer token).
 *     responses:
 *       200:
 *         description: Successfully fetched dashboard data.
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
 *                   example: "Dashboard general data"
 *                 data:
 *                   type: object
 *                   properties:
 *                     allorders:
 *                       type: integer
 *                       description: Total number of bookings.
 *                       example: 100
 *                     incoming:
 *                       type: integer
 *                       description: Number of incoming bookings.
 *                       example: 50
 *                     receivedAtWarehouse:
 *                       type: integer
 *                       description: Number of bookings received at the warehouse.
 *                       example: 30
 *                     waitingForConsolidation:
 *                       type: integer
 *                       description: Number of bookings waiting for consolidation.
 *                       example: 15
 *                     readyToShip:
 *                       type: integer
 *                       description: Number of bookings ready to ship.
 *                       example: 20
 *                     incomingTransit:
 *                       type: integer
 *                       description: Number of bookings in incoming transit.
 *                       example: 10
 *                     outgoingTransit:
 *                       type: integer
 *                       description: Number of bookings in outgoing transit.
 *                       example: 5
 *                     deliveredAtWarehouse:
 *                       type: integer
 *                       description: Number of bookings delivered at the warehouse.
 *                       example: 25
 *                     deliveredToUser:
 *                       type: integer
 *                       description: Number of bookings delivered to the user.
 *                       example: 40
 *                     awaitingForSelfPickup:
 *                       type: integer
 *                       description: Number of bookings awaiting self-pickup.
 *                       example: 10
 *                     pendingPayements:
 *                       type: integer
 *                       description: Number of bookings with pending payments.
 *                       example: 5
 *                     cancelled:
 *                       type: integer
 *                       description: Number of cancelled bookings.
 *                       example: 3
 *       400:
 *         description: Bad request - invalid parameters or missing authentication token.
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
 *                   example: "Bad request"
 *       401:
 *         description: Unauthorized - missing or invalid authentication token.
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
 *                   example: "Unauthorized"
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
 *                   example: "Internal server error"
 */

router.get('/homepage',validateToken,asyncMiddleware(userController.homePage))
/**
 * @swagger
 * /warehouse/logistic-companies:
 *   get:
 *     tags:
 *       - Warehouse --> Booking Management
 *     summary: Retrieve all active logistic companies
 *     description: This endpoint retrieves all logistic companies that are active (status is true).
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The token to validate the request.
 *         schema:
 *           type: string
 *           example: "your_access_token_here"
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of active logistic companies.
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
 *                   example: "Logistic companies"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       title:
 *                         type: string
 *                         example: "Logistic Company A"
 *       500:
 *         description: Internal server error while fetching logistic companies.
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
 *                   example: "Error fetching logistic companies."
 *                 error:
 *                   type: string
 *                   example: "There was an issue while fetching the logistic companies."
 */

router.get('/logistic-companies',validateToken,asyncMiddleware(userController.getLogCompaniesForFilter))
/**
 * @swagger
 * /warehouse/to-direct-deliver:
 *   post:
 *     tags:
 *       - Warehouse --> Booking Management --> Direct Delivery
 *     summary: Change the booking status to "Direct Delivery"
 *     description: This endpoint updates the booking status to "Direct Delivery" and sends notifications and emails to customers and receivers.
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
 *               bookingIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: The list of booking IDs to update the status to "Direct Delivery".
 *                 example: [101, 102, 103]
 *     responses:
 *       200:
 *         description: Successfully updated the booking statuses to "Direct Delivery" and sent notifications.
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
 *                   example: "Success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     bookingIds:
 *                       type: array
 *                       items:
 *                         type: integer
 *                       example: [101, 102, 103]
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
 *                   example: "Invalid input. Booking IDs must be provided."
 *                 error:
 *                   type: string
 *                   example: "Missing or invalid booking IDs."
 *       404:
 *         description: Bookings not found with the given IDs.
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
 *                   example: "Booking not found."
 *       500:
 *         description: Internal server error while processing the request.
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
 *                   example: "Error updating booking statuses."
 *                 error:
 *                   type: string
 *                   example: "There was an issue while processing the request."
 */

router.post('/to-direct-deliver',validateToken,asyncMiddleware(userController.toDirectDelivery))
/**
 * @swagger
 * /warehouse/mark-deliver:
 *   post:
 *     tags:
 *       - Warehouse --> Booking Management --> Direct Delivery
 *     summary: Mark a booking as delivered
 *     description: This endpoint marks a booking as delivered, updates the booking status, creates a booking history record, and sends notifications and emails to the customer and receiver.
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
 *               bookingId:
 *                 type: integer
 *                 description: The ID of the booking to mark as delivered.
 *                 example: 123
 *     responses:
 *       200:
 *         description: Successfully marked the booking as delivered and sent notifications.
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
 *                   example: "Success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     bookingId:
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
 *                   example: "Invalid input. Booking ID must be provided."
 *                 error:
 *                   type: string
 *                   example: "Missing or invalid booking ID."
 *       404:
 *         description: Booking not found with the given ID.
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
 *                   example: "Booking not found!"
 *       500:
 *         description: Internal server error while processing the request.
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
 *                   example: "Error marking booking as delivered."
 *                 error:
 *                   type: string
 *                   example: "There was an issue while processing the request."
 */

router.post('/mark-deliver',validateToken,asyncMiddleware(userController.markDeliver))

/**
 * @swagger
 * /warehouse/all-booking-statuses:
 *   get:
 *     tags:
 *       - Warehouse --> Tracking 
 *     summary: Get all booking statuses
 *     description: This endpoint retrieves a list of all available booking statuses. Each status includes an ID and a title.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         schema:
 *           type: string
 *           example: "Bearer YOUR_TOKEN_HERE"
 *         description: The access token for the user (Bearer token).
 *     responses:
 *       200:
 *         description: Successfully retrieved the booking statuses.
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
 *                   example: "Success"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       title:
 *                         type: string
 *                         example: "Pending"
 *       400:
 *         description: Bad request - Missing or invalid parameters.
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
 *                   example: "Bad request"
 *       401:
 *         description: Unauthorized - Missing or invalid authentication token.
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
 *                   example: "Unauthorized"
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
 *                   example: "Internal server error"
 */

router.get('/all-booking-statuses',validateToken,asyncMiddleware(userController.allBookingStatus))

/**
 * @swagger
 * /warehouse/update-booking-status:
 *   put:
 *     tags:
 *       - Warehouse --> Tracking 
 *     summary: Update booking status
 *     description: This endpoint updates the status of a booking based on the provided booking ID and new status ID.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         schema:
 *           type: string
 *           example: "Bearer YOUR_TOKEN_HERE"
 *         description: The access token for the user (Bearer token).
 *       - in: body
 *         name: booking
 *         description: Booking ID and new status to update.
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             bookingId:
 *               type: integer
 *               description: The ID of the booking to update.
 *               example: 12345
 *             bookingStatusId:
 *               type: integer
 *               description: The ID of the new booking status.
 *               example: 2
 *     responses:
 *       200:
 *         description: Successfully updated the booking status.
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
 *                   example: "Success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     updated:
 *                       type: integer
 *                       description: The number of rows updated.
 *                       example: 1
 *       400:
 *         description: Bad request - missing or invalid parameters.
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
 *                   example: "Bad request"
 *       401:
 *         description: Unauthorized - missing or invalid authentication token.
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
 *                   example: "Unauthorized"
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
 *                   example: "Internal server error"
 */
router.put('/update-booking-status',validateToken,asyncMiddleware(userController.updateBookingStatus))
router.get('/all-active-warehouse',validateToken,asyncMiddleware(userController.getActiveWarehouse))

// Tracking on Parcel
/**
 * @swagger
 * /warehouse/tracking-on-parcel:
 *   post:
 *     tags:
 *       - Warehouse --> Booking Management
 *     summary: Add tracking number to a parcel
 *     description: This endpoint allows adding a tracking number to a parcel for tracking purposes.
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
 *               parcelId:
 *                 type: integer
 *                 description: The ID of the parcel to update.
 *                 example: 789
 *               trackingNum:
 *                 type: string
 *                 description: The tracking number to assign to the parcel.
 *                 example: "ABC123XYZ"
 *     responses:
 *       200:
 *         description: Tracking number successfully added to the parcel.
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
 *                   example: "Tracking Number Added"
 *                 data:
 *                   type: object
 *                   properties:
 *                     parcelId:
 *                       type: integer
 *                       example: 789
 *                     logisticCompanyTrackingNum:
 *                       type: string
 *                       example: "ABC123XYZ"
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
 *                   example: "Invalid input. Parcel ID and tracking number must be provided."
 *                 error:
 *                   type: string
 *                   example: "Missing or invalid parcel ID or tracking number."
 *       404:
 *         description: Parcel not found with the given ID.
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
 *                   example: "Parcel not found!"
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
 *                   example: "Error adding tracking number to parcel."
 *                 error:
 *                   type: string
 *                   example: "There was an issue while processing the tracking number update."
 */

router.post('/tracking-on-parcel',validateToken,asyncMiddleware(userController.addTrackingOnParcel))
// Tracking on Booking
/**
 * @swagger
 * /warehouse/tracking-on-booking:
 *   post:
 *     tags:
 *       - Warehouse --> Booking Management
 *     summary: Add tracking number to a booking
 *     description: This endpoint allows adding a tracking number to a booking for tracking purposes.
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
 *               bookingId:
 *                 type: integer
 *                 description: The ID of the booking to update.
 *                 example: 123
 *               trackingNum:
 *                 type: string
 *                 description: The tracking number to assign to the booking.
 *                 example: "TRACK123456"
 *     responses:
 *       200:
 *         description: Tracking number successfully added to the booking.
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
 *                   example: "Tracking Number Added"
 *                 data:
 *                   type: object
 *                   properties:
 *                     bookingId:
 *                       type: integer
 *                       example: 123
 *                     logisticCompanyTrackingNum:
 *                       type: string
 *                       example: "TRACK123456"
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
 *                   example: "Invalid input. Booking ID and tracking number must be provided."
 *                 error:
 *                   type: string
 *                   example: "Missing or invalid booking ID or tracking number."
 *       404:
 *         description: Booking not found with the given ID.
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
 *                   example: "Booking not found!"
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
 *                   example: "Error adding tracking number to booking."
 *                 error:
 *                   type: string
 *                   example: "There was an issue while processing the tracking number update."
 */

router.post('/tracking-on-booking',validateToken,asyncMiddleware(userController.addTrackingOnbooking))
 
/**
 * @swagger
 * /warehouse/getallcategory:
 *   get:
 *     tags:
 *       - Warehouse --> Booking Management
 *     summary: Get all categories
 *     description: This endpoint retrieves all categories with their details where the status is true.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         schema:
 *           type: string
 *           example: "Bearer YOUR_TOKEN_HERE"
 *         description: The access token for the user (Bearer token).
 *     responses:
 *       200:
 *         description: Successfully retrieved all categories.
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
 *                   example: "All categories"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The unique identifier of the category.
 *                         example: 1
 *                       title:
 *                         type: string
 *                         description: The title of the category.
 *                         example: "Electronics"
 *                       status:
 *                         type: boolean
 *                         description: The status of the category (true or false).
 *                         example: true
 *                       charge:
 *                         type: number
 *                         format: float
 *                         description: The charge associated with the category.
 *                         example: 15.75
 *       400:
 *         description: Bad request - invalid or missing parameters.
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
 *                   example: "Invalid parameters"
 *       401:
 *         description: Unauthorized - missing or invalid authentication token.
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
 *                   example: "Unauthorized"
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
 *                   example: "Internal server error"
 */

router.get('/getallcategory', validateToken, asyncMiddleware(userController.getAllCategory));
router.get('/associated-jobs',  asyncMiddleware(userController.allAssociatedJobs));

//! Module 12:Warehouse Imventory and Orders:
//Add locations in Warehouse
/**
 * @swagger
 * /warehouse/addLocation:
 *   post:
 *     summary: Add warehouse location
 *     description: Creates a new location in the warehouse with shelf code and zone
 *     tags:
 *       - Warehouse --> Warehouse Location and Merchant Order Management
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
 *               - shelfCode
 *               - warehouseZoneId
 *             properties:
 *               shelfCode:
 *                 type: string
 *                 description: Unique code for the shelf location
 *                 example: 'SHELF-A1'
 *               warehouseZoneId:
 *                 type: integer
 *                 description: ID of the warehouse zone
 *                 example: 1
 *     responses:
 *       '200':
 *         description: Successfully added warehouse location
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
 *                   example: 'Location Added in Warehouse'
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     shelfCode:
 *                       type: string
 *                       example: 'SHELF-A1'
 *                     warehouseZoneId:
 *                       type: integer
 *                       example: 1
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
 *       '403':
 *         description: Forbidden - Insufficient warehouse permissions
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
 *                   example: 'Insufficient warehouse permissions'
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
router.post("/addLocation",validateToken,checkwarehousePermission,asyncMiddleware(userController.warehouselocation));
//Add Zones in the warehouse

/**
 * @swagger
 * /warehouse/addZones:
 *   post:
 *     summary: Add warehouse zone
 *     description: Creates a new zone in the warehouse with zone name
 *     tags:
 *       - Warehouse
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
 *               - zoneName
 *             properties:
 *               zoneName:
 *                 type: string
 *                 description: Name of the warehouse zone
 *                 example: 'Zone A'
 *     responses:
 *       '200':
 *         description: Successfully added warehouse zone
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
 *                   example: 'Warehouse Zone Added'
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     zoneName:
 *                       type: string
 *                       example: 'Zone A'
 *                     warehouseId:
 *                       type: integer
 *                       example: 123
 *       '400':
 *         description: Bad Request - Missing zone name
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                   example: 'Zone Name is required'
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
 *       '403':
 *         description: Forbidden - Insufficient warehouse permissions
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
 *                   example: 'Insufficient warehouse permissions'
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
router.post("/addZones",validateToken,checkwarehousePermission,asyncMiddleware(userController.wareHouseZone));
//get Locations in Warehouse

/**
 * @swagger
 * /warehouse/getLocations:
 *   get:
 *     summary: Get warehouse locations
 *     description: Retrieves all locations for the authenticated warehouse user including zones and shelf codes
 *     tags:
 *       - Warehouse --> Warehouse Location and Merchant Order Management
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Authentication token
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successfully retrieved warehouse locations
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
 *                   example: 'All Locations'
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       companyName:
 *                         type: string
 *                         example: 'Warehouse Corp'
 *                       warehouseZones:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             zoneName:
 *                               type: string
 *                               example: 'Zone A'
 *                             inWarehouseLocations:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   shelfCode:
 *                                     type: string
 *                                     example: 'SHELF-A1'
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
 *       '403':
 *         description: Forbidden - Insufficient warehouse permissions
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
 *                   example: 'Insufficient warehouse permissions'
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
router.get("/getLocations",validateToken,checkwarehousePermission,asyncMiddleware(userController.getLocations));
//Get all the Warehouse Orders
/**
 * @swagger
 * /warehouse/getInboundOrderWarehouse:
 *   get:
 *     summary: Get warehouse inbound orders
 *     description: Retrieves all inbound orders for the authenticated warehouse user
 *     tags:
 *       - Warehouse --> Warehouse Location and Merchant Order Management
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Authentication token
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successfully retrieved inbound orders
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
 *                   example: 'Inbound Orders for Warehouse'
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       orderType:
 *                         type: string
 *                         example: 'INBOUND'
 *                       merchantName:
 *                         type: string
 *                         example: 'Merchant ABC'
 *                       merchantReference:
 *                         type: string
 *                         example: 'REF123'
 *                       productId:
 *                         type: integer
 *                         example: 100
 *                       quantity:
 *                         type: integer
 *                         example: 50
 *                       warehouseId:
 *                         type: integer
 *                         example: 1
 *                       merchantorderstatusesId:
 *                         type: integer
 *                         example: 1
 *                       productName:
 *                         type: string
 *                         example: 'Product XYZ'
 *                         nullable: true
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
 *                   example: 'Error in fetching inbound orders'
 *                 data:
 *                   type: null
 */
router.get("/getInboundOrderWarehouse",validateToken,asyncMiddleware(userController.getInboundOrderWarehouse));
//Inspect Order
/**
 * @swagger
 * /warehouse/InspectOrder/{inboundOrderId}:
 *   post:
 *     summary: Inspect inbound order
 *     description: Performs inspection on an inbound order and records damaged/fine quantities
 *     tags:
 *       - Warehouse --> Warehouse Location and Merchant Order Management --> Warehouse Inventory
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Authentication token
 *         schema:
 *           type: string
 *       - in: path
 *         name: inboundOrderId
 *         required: true
 *         description: ID of the inbound order to inspect
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - totalQuantity
 *               - damagedQuantity
 *               - fineQuantity
 *             properties:
 *               totalQuantity:
 *                 type: integer
 *                 description: Total quantity of items received
 *                 example: 100
 *               damagedQuantity:
 *                 type: integer
 *                 description: Number of damaged items
 *                 example: 5
 *               fineQuantity:
 *                 type: integer
 *                 description: Number of items in good condition
 *                 example: 95
 *     responses:
 *       '200':
 *         description: Successfully completed inspection
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
 *                   example: 'Order Inspection Completed'
 *       '400':
 *         description: Bad Request - Invalid order status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                   example: 'Order is not Available or not in the inTransit Status'
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
router.post("/InspectOrder/:inboundOrderId",validateToken,asyncMiddleware(userController.InspectOrder))
//Statuses get for the  Conformation of Inbound Order
/**
 * @swagger
 * /warehouse/InboundOrderStatuses:
 *   get:
 *     summary: Get inbound order statuses
 *     description: Retrieves list of possible statuses for inbound orders (IDs 2, 3, 8, 10)
 *     tags:
 *       - Warehouse --> Warehouse Location and Merchant Order Management
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Authentication token
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successfully retrieved inbound order statuses
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
 *                   example: 'Statuses for Inbound Order'
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 2
 *                       title:
 *                         type: string
 *                         example: 'Status Title'
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
router.get("/InboundOrderStatuses",validateToken,asyncMiddleware(userController.InboundStatuses))
//Order Received at Warehouse and Set Status
/**
 * @swagger
 * /warehouse/orderWarehouseReached/{inboundOrderId}:
 *   put:
 *     summary: Update order status when received at warehouse
 *     description: Updates the status of an inbound order when it reaches the warehouse
 *     tags:
 *       - Warehouse --> Warehouse Location and Merchant Order Management
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Authentication token
 *         schema:
 *           type: string
 *       - in: path
 *         name: inboundOrderId
 *         required: true
 *         description: ID of the inbound order
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - statusId
 *             properties:
 *               statusId:
 *                 type: integer
 *                 description: New status ID for the order
 *                 example: 2
 *     responses:
 *       '200':
 *         description: Successfully updated order status
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
 *                   example: 'Order Status Updated and Reached in Warehouse'
 *       '400':
 *         description: Bad Request - Order not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                   example: 'Inbound Order not found'
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
router.put("/orderWarehouseReached/:inboundOrderId",validateToken,asyncMiddleware(userController.orderReceived))
//Get the Shelf Codes

/**
 * @swagger
 * /warehouse/getshelfsCode:
 *   get:
 *     summary: Get warehouse shelf codes
 *     description: Retrieves all shelf codes with their associated warehouse zones
 *     tags:
 *       - Warehouse --> Warehouse Location and Merchant Order Management
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Authentication token
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successfully retrieved shelf codes
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
 *                   example: 'Warehouse Shelf with their Zones'
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       shelfCode:
 *                         type: string
 *                         example: 'SHELF-A1'
 *                       warehouseZone:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           zoneName:
 *                             type: string
 *                             example: 'Zone A'
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
router.get("/getshelfsCode",validateToken,asyncMiddleware(userController.getshelfsCode))
//Get Order Statuses putway and Available Set to order

/**
 * @swagger
 * /warehouse/statusesforAvailable:
 *   get:
 *     summary: Get available order statuses
 *     description: Retrieves list of possible statuses after order confirmation (IDs 4 and 5)
 *     tags:
 *       - Warehouse --> Warehouse Location and Merchant Order Management
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Authentication token
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successfully retrieved statuses
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
 *                   example: 'Statuses After Confirmation of Order'
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 4
 *                       title:
 *                         type: string
 *                         example: 'Status Title'
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
router.get("/statusesforAvailable",validateToken,asyncMiddleware(userController.statusesforAvailable));
//To set Order to Putaway State
/**
 * @swagger
 * /warehouse/putawayStatus/{inboundOrderId}:
 *   put:
 *     summary: Mark order as putaway
 *     description: Updates inbound order status to putaway state after confirmation
 *     tags:
 *       - Warehouse --> Warehouse Location and Merchant Order Management
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Authentication token
 *         schema:
 *           type: string
 *       - in: path
 *         name: inboundOrderId
 *         required: true
 *         description: ID of the inbound order
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - statusId
 *             properties:
 *               statusId:
 *                 type: integer
 *                 description: New status ID for putaway state
 *                 example: 5
 *     responses:
 *       '200':
 *         description: Successfully updated order to putaway status
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
 *                   example: 'Order Status Updated and Order moved to putaway'
 *       '400':
 *         description: Bad Request - Invalid order state
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                   example: 'Order must be confirmed before moving to putaway'
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
router.put("/putawayStatus/:inboundOrderId",validateToken,asyncMiddleware(userController.markOrderPutaway))
//To set Order to Avavilable State
/**
 * @swagger
 * /warehouse/orderAvailable/{inboundOrderId}:
 *   put:
 *     summary: Update order to available state
 *     description: Updates inbound order status to available and manages warehouse inventory
 *     tags:
 *       - Warehouse --> Warehouse Location and Merchant Order Management
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Authentication token
 *         schema:
 *           type: string
 *       - in: path
 *         name: inboundOrderId
 *         required: true
 *         description: ID of the inbound order
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shelflocationId
 *             properties:
 *               shelflocationId:
 *                 type: integer
 *                 description: ID of the warehouse shelf location
 *                 example: 1
 *     responses:
 *       '200':
 *         description: Successfully updated order to available state
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
 *                   example: 'Order is in Available State'
 *       '400':
 *         description: Bad Request - Invalid order state
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                   example: 'The Order is Still in Putway State'
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
router.put("/orderAvailable/:inboundOrderId",validateToken,asyncMiddleware(userController.orderAvailableState))
//Get Outbound Order
/**
 * @swagger
 * /warehouse/getOutboundOrders:
 *   get:
 *     summary: Get outbound orders
 *     description: Retrieves all outbound orders with their product details
 *     tags:
 *       - Warehouse --> Warehouse Location and Merchant Order Management
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Authentication token
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successfully retrieved outbound orders
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
 *                   example: 'All Outbound Orders'
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       orderType:
 *                         type: string
 *                         example: 'OUTBOUND'
 *                       merchantReference:
 *                         type: string
 *                         example: 'REF123'
 *                       merchantName:
 *                         type: string
 *                         example: 'Merchant ABC'
 *                       productId:
 *                         type: integer
 *                         example: 100
 *                       quantity:
 *                         type: integer
 *                         example: 50
 *                       warehouseId:
 *                         type: integer
 *                         example: 1
 *                       merchantId:
 *                         type: integer
 *                         example: 200
 *                       merchantorderstatusesId:
 *                         type: integer
 *                         example: 1
 *                       product:
 *                         type: object
 *                         properties:
 *                           productName:
 *                             type: string
 *                             example: 'Product XYZ'
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
router.get("/getOutboundOrders",validateToken,asyncMiddleware(userController.getOutboundOrders));
// Get All Outbound Orders To Assign to the Associate
/**
 * @swagger
 * /warehouse/getOutboundOrdersforAssociate:
 *   get:
 *     summary: Get orders assigned to warehouse associate
 *     description: Retrieves all orders assigned to the authenticated warehouse associate
 *     tags:
 *       - Warehouse --> Warehouse Location and Merchant Order Management
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Authentication token
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successfully retrieved assigned orders
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
 *                   example: 'Orders Assigned to Associate'
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       OrderType:
 *                         type: string
 *                         example: 'OUTBOUND'
 *                       merchantName:
 *                         type: string
 *                         example: 'Merchant ABC'
 *                       merchantReference:
 *                         type: string
 *                         example: 'REF123'
 *                       quantity:
 *                         type: integer
 *                         example: 50
 *                       product:
 *                         type: object
 *                         properties:
 *                           productName:
 *                             type: string
 *                             example: 'Product XYZ'
 *                       receiveingWarehouseShelfCode:
 *                         type: object
 *                         properties:
 *                           shelfCode:
 *                             type: string
 *                             example: 'SHELF-A1'
 *                       currentShelfLocation:
 *                         type: object
 *                         properties:
 *                           shelfCode:
 *                             type: string
 *                             example: 'SHELF-B2'
 *       '400':
 *         description: Bad Request - No orders found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                   example: 'No Order Assigned to this Warehouse Associate'
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
router.get("/getOutboundOrdersforAssociate",validateToken,asyncMiddleware(userController.getOrdersAssignedtoAssociate));
//Assign Order To Associate
/**
 * @swagger
 * /warehouse/assignOrderToAssociate:
 *   post:
 *     summary: Assign order to warehouse associate
 *     description: Assigns an outbound order to a specific warehouse associate
 *     tags:
 *       - Warehouse --> Warehouse Location and Merchant Order Management
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
 *               - outboundOrderId
 *               - warehouseAssociateId
 *             properties:
 *               outboundOrderId:
 *                 type: integer
 *                 description: ID of the outbound order to assign
 *                 example: 1
 *               warehouseAssociateId:
 *                 type: integer
 *                 description: ID of the warehouse associate
 *                 example: 100
 *     responses:
 *       '200':
 *         description: Successfully assigned order to associate
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
 *                   example: 'Order Assignend to Warehouse Associate'
 *       '400':
 *         description: Bad Request - Order not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                   example: 'Order Not found'
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
router.post("/assignOrderToAssociate",validateToken,asyncMiddleware(userController.orderAssignedToAssociates))

//===========Inbound, Outbound Orders dashboard============>
    /**
 * @swagger
 * /warehouse/warehouseDashboard:
 *   get:
 *     summary: Get warehouse dashboard data
 *     description: Retrieves dashboard statistics including orders, zones, and shelf information
 *     tags:
 *       - Warehouse --> Warehouse Location and Merchant Order Management
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Authentication token
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successfully retrieved dashboard data
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
 *                   example: 'Dashboard'
 *                 data:
 *                   type: object
 *                   properties:
 *                     pendingInboundOrders:
 *                       type: array
 *                       description: Inbound orders with status 1
 *                       items:
 *                         type: object
 *                     pendingOutboundOrders:
 *                       type: array
 *                       description: Outbound orders with status 1
 *                       items:
 *                         type: object
 *                     orderOutforDelivery:
 *                       type: array
 *                       description: Orders with status 12 (delivery)
 *                       items:
 *                         type: object
 *                     ordersProcessing:
 *                       type: array
 *                       description: Orders with status 5 (processing)
 *                       items:
 *                         type: object
 *                     wareHouseZones:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           zoneName:
 *                             type: string
 *                             example: 'Zone A'
 *                           warehouseId:
 *                             type: integer
 *                             example: 100
 *                     NumberOfShelfinWarehouse:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           companyName:
 *                             type: string
 *                             example: 'Warehouse Corp'
 *                           warehouseZones:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 zoneName:
 *                                   type: string
 *                                   example: 'Zone A'
 *                                 inWarehouseLocations:
 *                                   type: array
 *                                   items:
 *                                     type: object
 *                                     properties:
 *                                       shelfCode:
 *                                         type: string
 *                                         example: 'SHELF-A1'
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
router.get("/warehouseDashboard",validateToken,asyncMiddleware(userController.warehouseDashboard))


//=======================Warehouse Inventory======================>


    /**
 * @swagger
 * /warehouse/warehouseInventory:
 *   get:
 *     summary: Get warehouse inventory
 *     description: Retrieves all products and their quantities in the authenticated warehouse
 *     tags:
 *       - Warehouse --> Warehouse Location and Merchant Order Management --> Warehouse Inventory
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Authentication token
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successfully retrieved warehouse inventory
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
 *                   example: 'Products in Warehouse'
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       productName:
 *                         type: string
 *                         example: 'Product XYZ'
 *                       productWarehouseQuantity:
 *                         type: integer
 *                         example: 100
 *                       warehouseZone:
 *                         type: string
 *                         example: 'Zone A'
 *                       warehouseId:
 *                         type: integer
 *                         example: 1
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
router.get("/warehouseInventory",validateToken,asyncMiddleware(userController.warehouseInventoryName))

//===============Service Order===================>

// get Service Orders
/**
 * @swagger
 * /warehouse/getServiceOrder:
 *   get:
 *     summary: Get warehouse service orders
 *     description: Retrieves all service orders for the authenticated warehouse
 *     tags:
 *       - Warehouse --> Warehouse Location and Merchant Order Management
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Authentication token
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successfully retrieved service orders
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
 *                   example: 'All Service Orders'
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       pickupDate:
 *                         type: string
 *                         format: date
 *                         example: '2024-03-20'
 *                       pickupStartTime:
 *                         type: string
 *                         example: '10:00'
 *                       receiverEmail:
 *                         type: string
 *                         format: email
 *                         example: 'receiver@example.com'
 *                       receiverPhone:
 *                         type: string
 *                         example: '1234567890'
 *                       receiverName:
 *                         type: string
 *                         example: 'John Doe'
 *                       senderEmail:
 *                         type: string
 *                         format: email
 *                         example: 'sender@example.com'
 *                       senderPhone:
 *                         type: string
 *                         example: '0987654321'
 *                       senderName:
 *                         type: string
 *                         example: 'Jane Smith'
 *                       total:
 *                         type: number
 *                         example: 100.50
 *                       weight:
 *                         type: number
 *                         example: 5.5
 *                       productName:
 *                         type: string
 *                         example: 'Product XYZ'
 *                       productQuantity:
 *                         type: integer
 *                         example: 2
 *                       pickupAddressType:
 *                         type: string
 *                         example: 'residential'
 *                       pickupAddressId:
 *                         type: integer
 *                         example: 1
 *                       dropoffAddressId:
 *                         type: integer
 *                         example: 2
 *                       bookingTypeId:
 *                         type: integer
 *                         example: 1
 *                       merchantcustomerordersId:
 *                         type: integer
 *                         example: 100
 *                       merchantorderstatusesId:
 *                         type: integer
 *                         example: 1
 *                       customerId:
 *                         type: integer
 *                         example: 50
 *                       receivingWarehouseId:
 *                         type: integer
 *                         example: 10
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
router.get("/getServiceOrder",validateToken,asyncMiddleware(userController.getServiceOrder))

//confirm service Order
/**
 * @swagger
 * /warehouse/confirmServiceOrder/{serviceOrderId}:
 *   put:
 *     summary: Confirm service order and update inventory
 *     description: Confirms a service order, updates warehouse inventory, and creates FedEx shipment if applicable
 *     tags:
 *       - Warehouse --> Warehouse Location and Merchant Order Management
 *     parameters:
 *       - in: path
 *         name: serviceOrderId
 *         required: true
 *         description: ID of the service order to confirm
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successfully confirmed order
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
 *                       example: 'Order Confirmed and Ready to Assign Driver to Order'
 *                     data:
 *                       type: object
 *                       example: {}
 *                 - type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: '1'
 *                     message:
 *                       type: string
 *                       example: 'Order Confirmed and Assigned to Fedex Driver to Order'
 *                     data:
 *                       type: object
 *                       properties:
 *                         logisticCompanyTrackingNum:
 *                           type: string
 *                           example: 'FDX123456789'
 *                         label:
 *                           type: string
 *                           description: URL to shipping label
 *                           example: 'https://fedex.com/labels/123.pdf'
 *       '404':
 *         description: Order or inventory not found
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
 *                   example: 'Order or inventory not found'
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
router.put("/confirmServiceOrder/:serviceOrderId",validateToken,asyncMiddleware(userController.confirmServiceOrder))


// ! Warehouse Associates


/**
 * @swagger
 * /warehouse/getBatchOrders:
 *   get:
 *     summary: Get batch outbound orders
 *     description: Retrieves and groups outbound orders by location for the authenticated warehouse associate
 *     tags:
 *       - Warehouse --> Warehouse Location and Merchant Order Management --> Warehouse Associates
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Authentication token
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successfully retrieved batch orders
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
 *                   example: 'All Outbound Orders with Batch Jobs'
 *                 data:
 *                   type: object
 *                   properties:
 *                     batchJobs:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           orders:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: integer
 *                                   example: 1
 *                                 orderType:
 *                                   type: string
 *                                   example: 'OUTBOUND'
 *                                 merchantReference:
 *                                   type: string
 *                                   example: 'REF123'
 *                                 merchantName:
 *                                   type: string
 *                                   example: 'Merchant ABC'
 *                                 productId:
 *                                   type: integer
 *                                   example: 100
 *                                 quantity:
 *                                   type: integer
 *                                   example: 50
 *                                 product:
 *                                   type: object
 *                                   properties:
 *                                     productName:
 *                                       type: string
 *                                       example: 'Product XYZ'
 *                                     image:
 *                                       type: string
 *                                       example: 'product.jpg'
 *                                     barCode:
 *                                       type: string
 *                                       example: '123456789'
 *                                 currentShelfLocation:
 *                                   type: object
 *                                   properties:
 *                                     shelfCode:
 *                                       type: string
 *                                       example: 'SHELF-A1'
 *                                     warehouseZone:
 *                                       type: object
 *                                       properties:
 *                                         zoneName:
 *                                           type: string
 *                                           example: 'Zone A'
 *                                 warehouseAssociate:
 *                                   type: object
 *                                   properties:
 *                                     email:
 *                                       type: string
 *                                       example: 'associate@warehouse.com'
 *                                     companyName:
 *                                       type: string
 *                                       example: 'Warehouse Corp'
 *                           zoneId:
 *                             type: integer
 *                             example: 1
 *                           shelfCode:
 *                             type: string
 *                             example: 'SHELF-A1'
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
router.get("/getBatchOrders",validateToken,asyncMiddleware(userController.getBatchOutboundOrders))


/**
 * @swagger
 * /warehouse/associatePickOrder/{outboundOrderId}:
 *   post:
 *     summary: Mark order as picked by associate
 *     description: Updates outbound order status from assigned (6) to picked (9)
 *     tags:
 *       - Warehouse --> Warehouse Location and Merchant Order Management --> Warehouse Associates
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Authentication token
 *         schema:
 *           type: string
 *       - in: path
 *         name: outboundOrderId
 *         required: true
 *         description: ID of the outbound order to mark as picked
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successfully marked order as picked
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
 *                   example: 'Job Picked by Associate'
 *       '400':
 *         description: Bad Request - Invalid order state
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                   example: 'Order not found or not in Picking status'
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
router.post("/associatePickOrder/:outboundOrderId",validateToken,asyncMiddleware(userController.associatePickedOrder))


/**
 * @swagger
 * /warehouse/associatePackingOrder/{outboundOrderId}:
 *   post:
 *     summary: Start packing an order
 *     description: Updates outbound order status from picked (9) to packing (7)
 *     tags:
 *       - Warehouse --> Warehouse Location and Merchant Order Management --> Warehouse Associates
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Authentication token
 *         schema:
 *           type: string
 *       - in: path
 *         name: outboundOrderId
 *         required: true
 *         description: ID of the outbound order to start packing
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successfully started packing order
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
 *                   example: 'Packing started'
 *       '400':
 *         description: Bad Request - Invalid order state
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                   example: 'Order not found or not ready for packing'
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
router.post("/associatePackingOrder/:outboundOrderId",validateToken,asyncMiddleware(userController.associatePackingOrder))


/**
 * @swagger
 * /warehouse/associatePackedOrder/{outboundOrderId}:
 *   post:
 *     summary: Mark order as packed
 *     description: Updates outbound order status from packing (7) to packed (11)
 *     tags:
 *       - Warehouse --> Warehouse Location and Merchant Order Management --> Warehouse Associates
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Authentication token
 *         schema:
 *           type: string
 *       - in: path
 *         name: outboundOrderId
 *         required: true
 *         description: ID of the outbound order to mark as packed
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successfully marked order as packed
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
 *                   example: 'Order Packed and ready to Assign to Driver'
 *       '400':
 *         description: Bad Request - Invalid order state
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                   example: 'Order not found or not in the packing'
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
router.post("/associatePackedOrder/:outboundOrderId",validateToken,asyncMiddleware(userController.OrderPacked))




// ! 13. Employees
//1. Get all employee
/**
 * @swagger
 * /warehouse/getallemployees:
 *   get:
 *     tags:
 *       - Warehouse --> Employee
 *     summary: Get all employees
 *     description: This endpoint retrieves all employees with their roles and permissions in the warehouse system.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         schema:
 *           type: string
 *           example: "Bearer YOUR_TOKEN_HERE"
 *         description: The access token for the user (Bearer token).
 *     responses:
 *       200:
 *         description: Successfully retrieved all employees.
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
 *                   example: "All Employees"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The employee's unique ID.
 *                         example: 1
 *                       companyName:
 *                         type: string
 *                         description: The company name associated with the employee.
 *                         example: "ABC Logistics"
 *                       email:
 *                         type: string
 *                         description: The email address of the employee.
 *                         example: "john.doe@company.com"
 *                       status:
 *                         type: string
 *                         description: The status of the employee (active/inactive).
 *                         example: "active"
 *                       countryCode:
 *                         type: string
 *                         description: The employee's country code.
 *                         example: "+1"
 *                       phoneNum:
 *                         type: string
 *                         description: The phone number of the employee.
 *                         example: "1234567890"
 *                       role:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             description: The role name of the employee.
 *                             example: "Manager"
 *                           permissions:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 permissionType:
 *                                   type: string
 *                                   description: The permission type associated with the role.
 *                                   example: "read"
 *                                 features:
 *                                   type: array
 *                                   items:
 *                                     type: object
 *                                     properties:
 *                                       title:
 *                                         type: string
 *                                         description: The feature title the permission applies to.
 *                                         example: "View Dashboard"
 *                                       featureOf:
 *                                         type: string
 *                                         description: The context or area the feature is related to.
 *                                         example: "Employee Management"
 *       401:
 *         description: Unauthorized - missing or invalid authentication token.
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
 *                   example: "Unauthorized"
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
 *                   example: "Internal server error"
 */

router.get('/getallemployees', validateToken, checkwarehousePermission, asyncMiddleware(userController.getAllEmployees));
//2. Employee details
/**
 * @swagger
 * /warehouse/employeedetail:
 *   get:
 *     tags:
 *       - Warehouse --> Employee
 *     summary: Get employee details
 *     description: This endpoint retrieves detailed information about a specific employee, including their role and associated permissions.
 *     parameters:
 *       - in: query
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the employee for which details are being fetched.
 *       - in: header
 *         name: accessToken
 *         required: true
 *         schema:
 *           type: string
 *           example: "Bearer YOUR_TOKEN_HERE"
 *         description: The access token for the user (Bearer token).
 *     responses:
 *       200:
 *         description: Successfully retrieved employee details.
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
 *                   example: "All Employees"
 *                 data:
 *                   type: object
 *                   properties:
 *                     employeeData:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           description: The ID of the employee.
 *                           example: 123
 *                         companyName:
 *                           type: string
 *                           description: The name of the company the employee works for.
 *                           example: "Shipping Corp"
 *                         email:
 *                           type: string
 *                           description: The employee's email address.
 *                           example: "employee@shippingcorp.com"
 *                         status:
 *                           type: boolean
 *                           description: The status of the employee (active or inactive).
 *                           example: true
 *                         countryCode:
 *                           type: string
 *                           description: The country code of the employee's phone number.
 *                           example: "+1"
 *                         phoneNum:
 *                           type: string
 *                           description: The employee's phone number.
 *                           example: "1234567890"
 *                         roleId:
 *                           type: integer
 *                           description: The role ID of the employee.
 *                           example: 2
 *                         role:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                               description: The name of the employee's role.
 *                               example: "Manager"
 *       400:
 *         description: Bad request - missing or invalid parameters.
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
 *                   example: "Bad request"
 *       401:
 *         description: Unauthorized - missing or invalid authentication token.
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
 *                   example: "Unauthorized"
 *       404:
 *         description: Not found - employee data not found for the given ID.
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
 *                   example: "Employee data not available"
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
 *                   example: "Internal server error"
 */

router.get('/employeedetail', validateToken, checkwarehousePermission, asyncMiddleware(userController.employeeDetail));
//3. Get active roles
/**
 * @swagger
 * /warehouse/activeroles:
 *   get:
 *     tags:
 *       - Warehouse --> Employee
 *     summary: Get all active roles
 *     description: This endpoint retrieves all active roles in the system.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         schema:
 *           type: string
 *           example: "Bearer YOUR_TOKEN_HERE"
 *         description: The access token for the user (Bearer token).
 *     responses:
 *       200:
 *         description: Successfully retrieved all active roles.
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
 *                   example: "All active roles"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The role ID.
 *                         example: 1
 *                       name:
 *                         type: string
 *                         description: The name of the role.
 *                         example: "Admin"
 *       400:
 *         description: Bad request - missing or invalid parameters.
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
 *                   example: "Bad request"
 *       401:
 *         description: Unauthorized - missing or invalid authentication token.
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
 *                   example: "Unauthorized"
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
 *                   example: "Internal server error"
 */

router.get('/activeroles', validateToken, asyncMiddleware(userController.activeRoles));
//4. Add Employee
/**
 * @swagger
 * /warehouse/addemployeeWarehouse:
 *   post:
 *     tags:
 *       - Warehouse --> Employee
 *     summary: Add a new employee to the warehouse
 *     description: This endpoint allows an authorized user to add a new employee to the warehouse system.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         schema:
 *           type: string
 *           example: "Bearer YOUR_TOKEN_HERE"
 *         description: The access token for the user (Bearer token).
 *       - in: body
 *         name: employee
 *         required: true
 *         description: The details of the employee to be added.
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               description: The name of the employee.
 *               example: "John Doe"
 *             email:
 *               type: string
 *               description: The email of the employee.
 *               example: "john.doe@example.com"
 *             password:
 *               type: string
 *               description: The password for the employee's account.
 *               example: "securepassword123"
 *             countryCode:
 *               type: string
 *               description: The country code for the employee's phone number.
 *               example: "+1"
 *             phoneNum:
 *               type: string
 *               description: The phone number of the employee.
 *               example: "1234567890"
 *             roleId:
 *               type: integer
 *               description: The role ID assigned to the employee.
 *               example: 2
 *     responses:
 *       200:
 *         description: Employee successfully added.
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
 *                   example: "Employee Added"
 *       400:
 *         description: Bad request - missing or invalid parameters.
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
 *                   example: "Error"
 *       401:
 *         description: Unauthorized - missing or invalid authentication token.
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
 *                   example: "Unauthorized"
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
 *                   example: "Internal server error"
 */

router.post('/addemployeeWarehouse', validateToken, checkwarehousePermission, asyncMiddleware(userController.addEmployee));
//5. Update employee
/**
 * @swagger
 * /warehouse/employeeupdate:
 *   put:
 *     tags:
 *       - Warehouse --> Employee
 *     summary: Update employee details
 *     description: This endpoint updates the details of an existing employee, including optional password update.
 *     parameters:
 *       - in: body
 *         name: body
 *         required: true
 *         description: Employee data to be updated.
 *         schema:
 *           type: object
 *           properties:
 *             emplId:
 *               type: integer
 *               description: The ID of the employee to be updated.
 *               example: 123
 *             name:
 *               type: string
 *               description: The name of the employee.
 *               example: "John Doe"
 *             email:
 *               type: string
 *               description: The email address of the employee.
 *               example: "johndoe@example.com"
 *             password:
 *               type: string
 *               description: The new password for the employee (optional, required only if updatePassword is true).
 *               example: "newpassword123"
 *             countryCode:
 *               type: string
 *               description: The country code of the employee's phone number.
 *               example: "+1"
 *             phoneNum:
 *               type: string
 *               description: The phone number of the employee.
 *               example: "1234567890"
 *             roleId:
 *               type: integer
 *               description: The role ID to assign to the employee.
 *               example: 2
 *             updatePassword:
 *               type: boolean
 *               description: Flag to indicate whether the password should be updated. If true, password is required.
 *               example: true
 *     responses:
 *       200:
 *         description: Successfully updated employee data.
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
 *                   example: "Employee data updated"
 *       400:
 *         description: Bad request - missing or invalid parameters.
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
 *                   example: "Bad request"
 *       401:
 *         description: Unauthorized - missing or invalid authentication token.
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
 *                   example: "Unauthorized"
 *       404:
 *         description: Employee not found - invalid employee ID.
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
 *                   example: "Employee not found"
 *       409:
 *         description: Conflict - employee email already exists.
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
 *                   example: "Employee with the following email exists"
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
 *                   example: "Internal server error"
 */

router.put('/employeeupdate', validateToken, checkwarehousePermission, asyncMiddleware(userController.employeeUpdate));
//6. Change employee status
/**
 * @swagger
 * /warehouse/changestatus:
 *   put:
 *     tags:
 *       - Warehouse --> Employee
 *     summary: Change employee status
 *     description: This endpoint updates the status of a specific employee (active or inactive).
 *     parameters:
 *       - in: body
 *         name: body
 *         required: true
 *         description: Employee status and employee ID to update.
 *         schema:
 *           type: object
 *           properties:
 *             status:
 *               type: boolean
 *               description: The status to set for the employee (true for active, false for inactive).
 *               example: true
 *             emplId:
 *               type: integer
 *               description: The ID of the employee whose status is to be updated.
 *               example: 123
 *       - in: header
 *         name: accessToken
 *         required: true
 *         schema:
 *           type: string
 *           example: "Bearer YOUR_TOKEN_HERE"
 *         description: The access token for the user (Bearer token).
 *     responses:
 *       200:
 *         description: Successfully updated employee status.
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
 *                   example: "Employee status updated"
 *       400:
 *         description: Bad request - missing or invalid parameters.
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
 *                   example: "Bad request"
 *       401:
 *         description: Unauthorized - missing or invalid authentication token.
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
 *                   example: "Unauthorized"
 *       404:
 *         description: Not found - employee not found for the given ID.
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
 *                   example: "Employee not found"
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
 *                   example: "Internal server error"
 */

router.put('/changestatus', validateToken, checkwarehousePermission, asyncMiddleware(userController.employeeStatus));


// ! 14. Roles & Permissions
// 1. Get all roles
/**
 * @swagger
 * /warehouse/allroles:
 *   get:
 *     tags:
 *       - Warehouse --> Roles and Permissions
 *     summary: Get all roles
 *     description: This endpoint retrieves all roles along with their ID, name, and status.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         schema:
 *           type: string
 *           example: "Bearer YOUR_TOKEN_HERE"
 *         description: The access token for the user (Bearer token).
 *     responses:
 *       200:
 *         description: Successfully retrieved all roles.
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
 *                   example: "All Roles"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The unique ID of the role.
 *                         example: 1
 *                       name:
 *                         type: string
 *                         description: The name of the role.
 *                         example: "Admin"
 *                       status:
 *                         type: boolean
 *                         description: The status of the role (active/inactive).
 *                         example: true
 *       401:
 *         description: Unauthorized - missing or invalid authentication token.
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
 *                   example: "Unauthorized"
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
 *                   example: "Internal server error"
 */

router.get('/allroles', validateToken, checkwarehousePermission, asyncMiddleware(userController.allRoles));
// 2. Get permissions associated with a role
/**
 * @swagger
 * /warehouse/rolepermissions:
 *   get:
 *     tags:
 *       - Warehouse --> Roles and Permissions
 *     summary: Get role permissions
 *     description: This endpoint retrieves the permissions associated with a specific role. It returns the features and permission types (create, read, update, delete) granted to the role.
 *     parameters:
 *       - in: query
 *         name: roleId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the role for which permissions are being fetched.
 *       - in: header
 *         name: accessToken
 *         required: true
 *         schema:
 *           type: string
 *           example: "Bearer YOUR_TOKEN_HERE"
 *         description: The access token for the user (Bearer token).
 *     responses:
 *       200:
 *         description: Successfully retrieved role permissions.
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
 *                   example: "All permissions of a role"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       featureId:
 *                         type: integer
 *                         description: The ID of the feature.
 *                         example: 1
 *                       featureTitle:
 *                         type: string
 *                         description: The title of the feature.
 *                         example: "Manage Users"
 *                       permissions:
 *                         type: object
 *                         properties:
 *                           create:
 *                             type: boolean
 *                             description: Permission to create.
 *                             example: true
 *                           read:
 *                             type: boolean
 *                             description: Permission to read.
 *                             example: true
 *                           update:
 *                             type: boolean
 *                             description: Permission to update.
 *                             example: true
 *                           delete:
 *                             type: boolean
 *                             description: Permission to delete.
 *                             example: false
 *       400:
 *         description: Bad request - missing or invalid parameters.
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
 *                   example: "Bad request"
 *       401:
 *         description: Unauthorized - missing or invalid authentication token.
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
 *                   example: "Unauthorized"
 *       404:
 *         description: Not found - roleId not found.
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
 *                   example: "Role not found"
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
 *                   example: "Internal server error"
 */
router.get('/rolepermissions', validateToken, checkwarehousePermission, asyncMiddleware(userController.roleDetails));
// 3. Active features
/**
 * @swagger
 * /warehouse/activefeatures:
 *   get:
 *     tags:
 *       - Warehouse --> Roles and Permissions
 *     summary: Get all active features
 *     description: This endpoint retrieves all active features with their permissions. It returns the list of features that are currently active, along with permission types (create, read, update, delete).
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         schema:
 *           type: string
 *           example: "Bearer YOUR_TOKEN_HERE"
 *         description: The access token for the user (Bearer token).
 *     responses:
 *       200:
 *         description: Successfully retrieved active features.
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
 *                   example: "All active features"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The ID of the feature.
 *                         example: 1
 *                       title:
 *                         type: string
 *                         description: The title of the feature.
 *                         example: "Manage Users"
 *                       permissions:
 *                         type: object
 *                         properties:
 *                           create:
 *                             type: boolean
 *                             description: Permission to create.
 *                             example: true
 *                           read:
 *                             type: boolean
 *                             description: Permission to read.
 *                             example: true
 *                           update:
 *                             type: boolean
 *                             description: Permission to update.
 *                             example: true
 *                           delete:
 *                             type: boolean
 *                             description: Permission to delete.
 *                             example: false
 *       400:
 *         description: Bad request - missing or invalid parameters.
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
 *                   example: "Bad request"
 *       401:
 *         description: Unauthorized - missing or invalid authentication token.
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
 *                   example: "Unauthorized"
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
 *                   example: "Internal server error"
 */
router.get('/activefeatures', validateToken, asyncMiddleware(userController.activeFeatures));
// 3. Add new role
/**
 * @swagger
 * /warehouse/addWarehouserole:
 *   post:
 *     tags:
 *       - Warehouse --> Roles and Permissions
 *     summary: Add a new warehouse role
 *     description: This endpoint allows the admin to add a new role for the warehouse along with the permissions associated with it.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         schema:
 *           type: string
 *           example: "Bearer YOUR_TOKEN_HERE"
 *         description: The access token for the user (Bearer token).
 *       - in: body
 *         name: role
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               description: The name of the role to be added.
 *               example: "Manager"
 *             permissionRole:
 *               type: array
 *               description: The list of permissions for the role.
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The ID of the feature for which permissions are being assigned.
 *                     example: 1
 *                   permissions:
 *                     type: object
 *                     properties:
 *                       create:
 *                         type: boolean
 *                         description: Permission to create.
 *                         example: true
 *                       read:
 *                         type: boolean
 *                         description: Permission to read.
 *                         example: true
 *                       update:
 *                         type: boolean
 *                         description: Permission to update.
 *                         example: true
 *                       delete:
 *                         type: boolean
 *                         description: Permission to delete.
 *                         example: false
 *     responses:
 *       200:
 *         description: Successfully added the role and assigned permissions.
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
 *                   example: "Role added"
 *       400:
 *         description: Bad request - the role name already exists.
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
 *                   example: "Same role exists, please try another name."
 *       401:
 *         description: Unauthorized - missing or invalid authentication token.
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
 *                   example: "Unauthorized"
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
 *                   example: "Error adding role"
 */
router.post('/addWarehouserole', validateToken, checkwarehousePermission, asyncMiddleware(userController.addRole));
// 4. Update a role
/**
 * @swagger
 * /warehouse/updaterole:
 *   put:
 *     tags:
 *       - Warehouse --> Roles and Permissions
 *     summary: Update an existing role
 *     description: This endpoint allows updating a role's name and associated permissions.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         schema:
 *           type: string
 *           example: "Bearer YOUR_TOKEN_HERE"
 *         description: The access token for the user (Bearer token).
 *       - in: body
 *         name: roleDetails
 *         required: true
 *         description: Details of the role to update.
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               description: The new name of the role.
 *               example: "Manager"
 *             roleId:
 *               type: integer
 *               description: The ID of the role to update.
 *               example: 1
 *             permissionRole:
 *               type: array
 *               description: List of permissions associated with the role.
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The ID of the feature associated with the permission.
 *                     example: 101
 *                   permissions:
 *                     type: object
 *                     properties:
 *                       create:
 *                         type: boolean
 *                         description: Permission to create.
 *                         example: true
 *                       read:
 *                         type: boolean
 *                         description: Permission to read.
 *                         example: true
 *                       update:
 *                         type: boolean
 *                         description: Permission to update.
 *                         example: true
 *                       delete:
 *                         type: boolean
 *                         description: Permission to delete.
 *                         example: false
 *     responses:
 *       200:
 *         description: Successfully updated the role.
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
 *                   example: "Role updated"
 *                 data:
 *                   type: object
 *       400:
 *         description: Bad request - missing or invalid parameters.
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
 *                   example: "Bad request"
 *       401:
 *         description: Unauthorized - missing or invalid authentication token.
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
 *                   example: "Unauthorized"
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
 *                   example: "Internal server error"
 */

router.put('/updaterole', validateToken, checkwarehousePermission, asyncMiddleware(userController.updateRole));
// 5. Update status of role
/**
 * @swagger
 * /warehouse/updatestatusrole:
 *   put:
 *     tags:
 *       - Warehouse --> Roles and Permissions
 *     summary: Update the status of a role
 *     description: This endpoint allows updating the status of a specific role (e.g., activate or deactivate).
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         schema:
 *           type: string
 *           example: "Bearer YOUR_TOKEN_HERE"
 *         description: The access token for the user (Bearer token).
 *       - in: body
 *         name: roleDetails
 *         required: true
 *         description: The details of the role whose status needs to be updated.
 *         schema:
 *           type: object
 *           properties:
 *             roleId:
 *               type: integer
 *               description: The ID of the role to update.
 *               example: 1
 *             status:
 *               type: boolean
 *               description: The new status of the role. `true` for active, `false` for inactive.
 *               example: true
 *     responses:
 *       200:
 *         description: Successfully updated the role's status.
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
 *                   example: "Role Status updated"
 *                 data:
 *                   type: object
 *       400:
 *         description: Bad request - missing or invalid parameters.
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
 *                   example: "Bad request"
 *       401:
 *         description: Unauthorized - missing or invalid authentication token.
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
 *                   example: "Unauthorized"
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
 *                   example: "Internal server error"
 */

router.put('/updatestatusrole', validateToken, checkwarehousePermission, asyncMiddleware(userController.updateRoleStatus));
//==========check trackingnumber======//
/**
 * @swagger
 * /warehouse/checktrackingNumber/{trackNumber}:
 *   post:
 *     tags:
 *       - Warehouse --> Tracking 
 *     summary: Check if tracking number exists
 *     description: This endpoint checks if a given tracking number exists in the booking records.
 *     parameters:
 *       - in: path
 *         name: trackNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: The tracking number to check in the booking records.
 *       - in: header
 *         name: accessToken
 *         required: true
 *         schema:
 *           type: string
 *           example: "Bearer YOUR_TOKEN_HERE"
 *         description: The access token for the user (Bearer token).
 *     responses:
 *       200:
 *         description: Tracking number found or not found.
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
 *                   example: "Tracking number found"
 *                 data:
 *                   type: boolean
 *                   example: true
 *       404:
 *         description: Tracking number not found.
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
 *                   example: "Tracking Number not found"
 *       401:
 *         description: Unauthorized - missing or invalid authentication token.
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
 *                   example: "Unauthorized"
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
 *                   example: "Internal server error"
 */
router.post("/checktrackingNumber/:trackNumber",asyncMiddleware(userController.checktrackingNumber))


//! Never Received Packges
//=================Get all packages with neverArrived Status
/**
 * @swagger
 * /warehouse/packagesNeverReceived:
 *   get:
 *     tags:
 *       - Warehouse --> Booking Management --> Never Received
 *     summary: Retrieve packages that were never received
 *     description: This endpoint retrieves a list of packages with the status "neverArrived" and their related booking details.
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The token to validate the request.
 *         schema:
 *           type: string
 *           example: "your_access_token_here"
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of packages that were never received.
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
 *                   example: "Details of Package"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       trackingId:
 *                         type: string
 *                         example: "TRK-123456"
 *                       arrived:
 *                         type: string
 *                         example: "neverArrived"
 *                       booking:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 101
 *                           bookingStatusId:
 *                             type: integer
 *                             example: 7
 *                           customer:
 *                             type: object
 *                             properties:
 *                               firstName:
 *                                 type: string
 *                                 example: "John"
 *                               lastName:
 *                                 type: string
 *                                 example: "Doe"
 *                               email:
 *                                 type: string
 *                                 example: "john.doe@example.com"
 *                           receivingWarehouse:
 *                             type: object
 *                             properties:
 *                               companyName:
 *                                 type: string
 *                                 example: "Warehouse A"
 *                               located:
 *                                 type: string
 *                                 example: "New York"
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
 *                   example: "There was an issue fetching the package details."
 *       500:
 *         description: Internal server error while fetching packages.
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
 *                   example: "Error fetching package details."
 *                 error:
 *                   type: string
 *                   example: "There was an issue while processing the request."
 */

router.get("/packagesNeverReceived",validateToken,asyncMiddleware(userController.packagesNeverReceived))

//====================Order for Never Received Packages
/**
 * @swagger
 * /warehouse/OrderForNeverReceivedPkg/{pkgId}:
 *   post:
 *     tags:
 *       - Warehouse --> Booking Management --> Never Received
 *     summary: Create a new order for a package that was never received
 *     description: This endpoint creates a new order for a package that was never received and updates the package status accordingly.
 *     parameters:
 *       - in: path
 *         name: pkgId
 *         required: true
 *         description: The ID of the package for which the order is being created.
 *         schema:
 *           type: integer
 *           example: 123
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
 *               arrived:
 *                 type: string
 *                 description: The arrival status of the package ("arrived" or other statuses).
 *                 example: "arrived"
 *     responses:
 *       200:
 *         description: Successfully created the order for the package and updated its status.
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
 *                   example: "Order Created for Package"
 *                 data:
 *                   type: object
 *                   properties:
 *                     bookingId:
 *                       type: integer
 *                       example: 101
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
 *                   example: "Invalid input. Arrived status must be provided."
 *                 error:
 *                   type: string
 *                   example: "Missing or invalid arrived status."
 *       404:
 *         description: Package not found with the given ID.
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
 *                   example: "Package not found!"
 *       500:
 *         description: Internal server error while processing the request.
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
 *                   example: "Error creating order for the package."
 *                 error:
 *                   type: string
 *                   example: "There was an issue while processing the request."
 */

router.post("/OrderForNeverReceivedPkg/:pkgId",validateToken,asyncMiddleware(userController.OrderForNeverReceivedPkg))

//====================Get details of Never Received Packages
/**
 * @swagger
 * /warehouse/packagesNeverReceivedDetails/{pkgId}:
 *   get:
 *     tags:
 *       - Warehouse --> Booking Management --> Never Received
 *     summary: Retrieve the details of a package that was never received
 *     description: This endpoint retrieves detailed information about a specific package with the status "neverArrived".
 *     parameters:
 *       - in: path
 *         name: pkgId
 *         required: true
 *         description: The ID of the package to retrieve details for.
 *         schema:
 *           type: integer
 *           example: 123
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The token to validate the request.
 *         schema:
 *           type: string
 *           example: "your_access_token_here"
 *     responses:
 *       200:
 *         description: Successfully retrieved the details of the package.
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
 *                   example: "Details of Package"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 123
 *                     arrived:
 *                       type: string
 *                       example: "neverArrived"
 *                     booking:
 *                       type: object
 *                       properties:
 *                         trackingId:
 *                           type: string
 *                           example: "TRK-123456"
 *                         senderName:
 *                           type: string
 *                           example: "John Doe"
 *                         senderEmail:
 *                           type: string
 *                           example: "john.doe@example.com"
 *                         senderPhone:
 *                           type: string
 *                           example: "+11234567890"
 *                         customer:
 *                           type: object
 *                           properties:
 *                             firstName:
 *                               type: string
 *                               example: "John"
 *                             lastName:
 *                               type: string
 *                               example: "Doe"
 *                             email:
 *                               type: string
 *                               example: "john.doe@example.com"
 *                     category:
 *                       type: object
 *                       properties:
 *                         title:
 *                           type: string
 *                           example: "Electronics"
 *                         charge:
 *                           type: number
 *                           example: 50
 *                     ecommerceCompany:
 *                       type: object
 *                       properties:
 *                         title:
 *                           type: string
 *                           example: "Amazon"
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
 *                   example: "Invalid input or missing package ID."
 *                 error:
 *                   type: string
 *                   example: "Package ID must be provided."
 *       404:
 *         description: Package not found with the given ID.
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
 *                   example: "Package not found."
 *       500:
 *         description: Internal server error while fetching package details.
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
 *                   example: "Error fetching package details."
 *                 error:
 *                   type: string
 *                   example: "There was an issue while fetching the package information."
 */

router.get("/packagesNeverReceivedDetails/:pkgId",validateToken,asyncMiddleware(userController.packagesNeverReceivedDetails))








module.exports = router;