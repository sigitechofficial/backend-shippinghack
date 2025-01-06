const express = require('express');
const router = express();
const adminController = require('../controller/admin');
const userController = require('../controller/warehouse');
const asyncMiddleware = require('../middleware/async');
const multer = require('multer');
const path = require('path');
const validateToken = require('../middleware/validateAdmin'); 
const checkPermission = require('../middleware/checkPermission'); 

// CSV file 
const uploadfiles=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'./Public/csvFiles')
    },
    filename:(req,file,cb)=>{
        const fileExtension=path.extname(file.originalname);
        const baseName=path.basename(file.originalname,fileExtension);
        cb(null,`${baseName}-${Date.now()}${fileExtension}`)
    }
})

const storage = multer.memoryStorage();

const uploaded=multer({
    storage:storage,
    //limits:{fileSize:10*1024*1024},
    fileFilter:(req,file,cb)=>{
        const allowedTypes=/csv/;
        const extname=allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if(extname && mimetype){
            return cb(null,true);
        }else{
            cb(new CustomException("Invalid file type. Only CSV, XLS, and XLSX files are allowed."))
        }
    }
})

// ! Module 1:  Auth
/**
 * @swagger
 * /admin/signin:
 *   post:
 *     summary: Admin Sign-in
 *     description: This API allows an admin to sign in by providing their email and password. It will authenticate the admin and return an access token along with their details.
 *     tags:
 *       - Admin --> Auth
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
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
 *               email:
 *                 type: string
 *                 description: The admin's email.
 *                 example: 'admin@shippinghack.com'
 *               password:
 *                 type: string
 *                 description: The admin's password.
 *                 example: 'adminpassword123'
 *               dvToken:
 *                 type: string
 *                 description: The device token to be used for the admin's session.
 *                 example: 'admin-device-token'
 *     responses:
 *       '200':
 *         description: Successfully signed in the admin
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
 *                   example: 'Login Successful'
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: 'Admin Name'
 *                     email:
 *                       type: string
 *                       example: 'admin@shippinghack.com'
 *                     accessToken:
 *                       type: string
 *                       example: 'access-token-here'
 *                     adminType:
 *                       type: string
 *                       example: 'Super Admin'
 *                     userName:
 *                       type: string
 *                       example: 'ShippingHack'
 *                     featureData:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           title:
 *                             type: string
 *                             example: 'Feature 1'
 *       '400':
 *         description: Bad Request - Invalid login credentials
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
 *                   example: 'User not found. Please enter valid data.'
 *       '401':
 *         description: Unauthorized access - invalid credentials
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
 *                   example: 'Bad credentials. Please enter the correct password to continue.'
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

router.post('/signin', asyncMiddleware(adminController.signIn))
// ! Module 2: Customer
// 1.  Get all customer
/**
 * @swagger
 * /admin/allcustomers:
 *   get:
 *     summary: Retrieve all customers
 *     description: This API retrieves a list of all customers (user type 1) who are not deleted.
 *     tags:
 *       - Admin --> Customer
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
 *         schema:
 *           type: string
 *           example: 'your-access-token-here'
 *     responses:
 *       '200':
 *         description: Successfully retrieved all customers
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
 *                   example: 'All users'
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       firstName:
 *                         type: string
 *                         example: 'John'
 *                       lastName:
 *                         type: string
 *                         example: 'Doe'
 *                       email:
 *                         type: string
 *                         example: 'johndoe@example.com'
 *                       countryCode:
 *                         type: string
 *                         example: '+1'
 *                       phoneNum:
 *                         type: string
 *                         example: '1234567890'
 *                       status:
 *                         type: boolean
 *                         example: true
 *                       virtualBox:
 *                         type: string
 *                         example: 'VirtualBoxID123'
 *       '401':
 *         description: Unauthorized - invalid or missing access token
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

router.get('/allcustomers', validateToken, checkPermission,  asyncMiddleware(adminController.getAllCustomers)) 
//2. Get customer details
/**
 * @swagger
 * /admin/customerdetails:
 *   get:
 *     summary: Retrieve details of a specific customer
 *     description: This API retrieves detailed information about a specific customer, including their bookings and addresses.
 *     tags:
 *       - Admin --> Customer
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
 *         schema:
 *           type: string
 *           example: 'your-access-token-here'
 *       - in: query
 *         name: id
 *         required: true
 *         description: The ID of the customer to fetch details for.
 *         schema:
 *           type: string
 *           example: '1'
 *     responses:
 *       '200':
 *         description: Successfully retrieved the customer details
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
 *                   example: 'Customer Details'
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     firstName:
 *                       type: string
 *                       example: 'John'
 *                     lastName:
 *                       type: string
 *                       example: 'Doe'
 *                     email:
 *                       type: string
 *                       example: 'johndoe@example.com'
 *                     countryCode:
 *                       type: string
 *                       example: '+1'
 *                     phoneNum:
 *                       type: string
 *                       example: '1234567890'
 *                     joinedOn:
 *                       type: string
 *                       example: '2022'
 *                     bookings:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 101
 *                           trackingId:
 *                             type: string
 *                             example: 'TSH-123-ABC'
 *                           pickupDate:
 *                             type: string
 *                             example: '2022-11-01'
 *                           pickupAddress:
 *                             type: object
 *                             properties:
 *                               postalCode:
 *                                 type: string
 *                                 example: '12345'
 *                           dropoffAddress:
 *                             type: object
 *                             properties:
 *                               postalCode:
 *                                 type: string
 *                                 example: '54321'
 *                           bookingStatus:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                                 example: 1
 *                               title:
 *                                 type: string
 *                                 example: 'Pending'
 *       '400':
 *         description: Bad Request - Invalid `id` value
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
 *                   example: 'Invalid customer ID'
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

router.get('/customerdetails', validateToken, checkPermission,  asyncMiddleware(adminController.customerDetailsById))
//3. Get booking details
/**
 * @swagger
 * /admin/bookingdetails:
 *   get:
 *     summary: Retrieve details of a specific booking for a customer
 *     description: This API retrieves detailed information about a specific booking, including customer, driver, package, and other related details.
 *     tags:
 *       - Admin --> Customer
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
 *         schema:
 *           type: string
 *           example: 'your-access-token-here'
 *       - in: query
 *         name: id
 *         required: true
 *         description: The ID of the customer whose booking details to fetch.
 *         schema:
 *           type: string
 *           example: '1'
 *     responses:
 *       '200':
 *         description: Successfully retrieved the customer booking details
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
 *                   example: 'Customer Booking details'
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 101
 *                     trackingId:
 *                       type: string
 *                       example: 'TSH-123-ABC'
 *                     receiverName:
 *                       type: string
 *                       example: 'John Doe'
 *                     receiverEmail:
 *                       type: string
 *                       example: 'john.doe@example.com'
 *                     total:
 *                       type: string
 *                       example: '100.00'
 *                     bookingHistories:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           bookingStatusId:
 *                             type: integer
 *                             example: 1
 *                           statusText:
 *                             type: string
 *                             example: 'Pending'
 *                           date:
 *                             type: string
 *                             example: '12-10-2022'
 *                           time:
 *                             type: string
 *                             example: '14:30:00'
 *       '400':
 *         description: Bad Request - Invalid `id` value
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
 *                   example: 'Invalid customer ID'
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

router.get('/bookingdetails', validateToken, checkPermission, asyncMiddleware(adminController.bookingDetails))

// ! Module 3: Driver
// 1.  Get all driver
/**
 * @swagger
 * /admin/alldrivers:
 *   get:
 *     summary: Get all drivers
 *     description: This API allows the admin to fetch all drivers, including freelance and associated drivers, and filter out incomplete driver data.
 *     tags:
 *       - Admin --> Drivers
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
 *         schema:
 *           type: string
 *           example: 'your-access-token-here'
 *     responses:
 *       '200':
 *         description: Successfully retrieved all drivers
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
 *                   example: 'All drivers'
 *                 data:
 *                   type: object
 *                   properties:
 *                     freeLance:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: The ID of the driver.
 *                             example: 1
 *                           firstName:
 *                             type: string
 *                             description: The first name of the driver.
 *                             example: 'John'
 *                           lastName:
 *                             type: string
 *                             description: The last name of the driver.
 *                             example: 'Doe'
 *                           email:
 *                             type: string
 *                             description: The email of the driver.
 *                             example: 'john.doe@example.com'
 *                           countryCode:
 *                             type: string
 *                             description: The country code of the driver's phone number.
 *                             example: '+1'
 *                           phoneNum:
 *                             type: string
 *                             description: The phone number of the driver.
 *                             example: '1234567890'
 *                           status:
 *                             type: boolean
 *                             description: The status of the driver (true = active, false = inactive).
 *                             example: true
 *                           image:
 *                             type: string
 *                             description: The path to the driver's profile image.
 *                             example: '/uploads/driver_1.jpg'
 *                     associated:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: The ID of the driver.
 *                             example: 2
 *                           firstName:
 *                             type: string
 *                             description: The first name of the driver.
 *                             example: 'Jane'
 *                           lastName:
 *                             type: string
 *                             description: The last name of the driver.
 *                             example: 'Smith'
 *                           email:
 *                             type: string
 *                             description: The email of the driver.
 *                             example: 'jane.smith@example.com'
 *                           countryCode:
 *                             type: string
 *                             description: The country code of the driver's phone number.
 *                             example: '+44'
 *                           phoneNum:
 *                             type: string
 *                             description: The phone number of the driver.
 *                             example: '9876543210'
 *                           status:
 *                             type: boolean
 *                             description: The status of the driver (true = active, false = inactive).
 *                             example: true
 *                           image:
 *                             type: string
 *                             description: The path to the driver's profile image.
 *                             example: '/uploads/driver_2.jpg'
 *                     incompleteDriver:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: The ID of the driver.
 *                             example: 3
 *                           firstName:
 *                             type: string
 *                             description: The first name of the driver.
 *                             example: 'Sam'
 *                           lastName:
 *                             type: string
 *                             description: The last name of the driver.
 *                             example: 'Brown'
 *                           email:
 *                             type: string
 *                             description: The email of the driver.
 *                             example: 'sam.brown@example.com'
 *                           countryCode:
 *                             type: string
 *                             description: The country code of the driver's phone number.
 *                             example: '+61'
 *                           phoneNum:
 *                             type: string
 *                             description: The phone number of the driver.
 *                             example: '4567891230'
 *                           status:
 *                             type: boolean
 *                             description: The status of the driver (true = active, false = inactive).
 *                             example: true
 *                           image:
 *                             type: string
 *                             description: The path to the driver's profile image.
 *                             example: '/uploads/driver_3.jpg'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *                   example: 'Internal Server Error'
 */

router.get('/alldrivers', validateToken, checkPermission, asyncMiddleware(adminController.getAllDrivers)) 
//2. Get customer details
/**
 * @swagger
 * /admin/driverdetails:
 *   get:
 *     summary: Get driver details by ID
 *     description: This API allows the admin to fetch detailed information about a driver, including personal details, vehicle details, and bookings.
 *     tags:
 *       - Admin --> Drivers
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
 *         schema:
 *           type: string
 *           example: 'your-access-token-here'
 *       - in: query
 *         name: id
 *         required: true
 *         description: The ID of the driver to fetch details for.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       '200':
 *         description: Successfully retrieved driver details
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
 *                   example: 'Driver Details'
 *                 data:
 *                   type: object
 *                   properties:
 *                     driverProfile:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           description: The ID of the driver.
 *                           example: 1
 *                         firstName:
 *                           type: string
 *                           description: The first name of the driver.
 *                           example: 'John'
 *                         lastName:
 *                           type: string
 *                           description: The last name of the driver.
 *                           example: 'Doe'
 *                         email:
 *                           type: string
 *                           description: The email of the driver.
 *                           example: 'john.doe@example.com'
 *                         countryCode:
 *                           type: string
 *                           description: The country code of the driver's phone number.
 *                           example: '+1'
 *                         phoneNum:
 *                           type: string
 *                           description: The phone number of the driver.
 *                           example: '1234567890'
 *                         image:
 *                           type: string
 *                           description: The profile image URL of the driver.
 *                           example: '/uploads/driver_1.jpg'
 *                     Documents:
 *                       type: object
 *                       properties:
 *                         licIssueDate:
 *                           type: string
 *                           description: The license issue date.
 *                           example: '2020-01-01'
 *                         licExpiryDate:
 *                           type: string
 *                           description: The license expiry date.
 *                           example: '2025-01-01'
 *                         licFrontImage:
 *                           type: string
 *                           description: The front image of the license.
 *                           example: '/uploads/license_front.jpg'
 *                         licBackImage:
 *                           type: string
 *                           description: The back image of the license.
 *                           example: '/uploads/license_back.jpg'
 *                     vehicleDetails:
 *                       type: object
 *                       properties:
 *                         vehicleMake:
 *                           type: string
 *                           description: The make of the vehicle.
 *                           example: 'Toyota'
 *                         vehicleModel:
 *                           type: string
 *                           description: The model of the vehicle.
 *                           example: 'Corolla'
 *                         vehicleYear:
 *                           type: string
 *                           description: The year of the vehicle.
 *                           example: '2020'
 *                         vehicleColor:
 *                           type: string
 *                           description: The color of the vehicle.
 *                           example: 'Red'
 *                         vehicleImages:
 *                           type: array
 *                           items:
 *                             type: string
 *                             description: Vehicle image URLs.
 *                             example: '/uploads/vehicle_image.jpg'
 *                     vehicleType:
 *                       type: object
 *                       properties:
 *                         title:
 *                           type: string
 *                           description: The title of the vehicle type.
 *                           example: 'Sedan'
 *                         image:
 *                           type: string
 *                           description: The image URL of the vehicle type.
 *                           example: '/uploads/vehicle_type.jpg'
 *       '400':
 *         description: Bad Request - Missing or invalid input parameters
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
 *                   example: 'Invalid or missing driver ID'
 *       '401':
 *         description: Unauthorized - Access token is missing or invalid
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
 *       '404':
 *         description: Not Found - Driver not found for the provided ID
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
 *                   example: 'Driver not found for this ID'
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
 *                   example: 'Internal Server Error'
 */

router.get('/driverdetails', validateToken, checkPermission, asyncMiddleware(adminController.driverDetailsById))
//3. Change user status
router.put('/userstatus', validateToken, checkPermission, asyncMiddleware(adminController.blockUnblockUser))
//4. Approve driver
router.put('/approvedriver', validateToken, checkPermission,  asyncMiddleware(adminController.approveDriver))
//5.  Get driver wallet
/**
 * @swagger
 * /admin/driver/wallet:
 *   get:
 *     summary: Get driver's wallet details
 *     description: This API allows the admin to fetch the wallet details for a driver, including their total earnings, available balance, bank details, and payment request history.
 *     tags:
 *       - Admin --> Drivers
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
 *         schema:
 *           type: string
 *           example: 'your-access-token-here'
 *       - in: query
 *         name: id
 *         required: true
 *         description: The ID of the driver whose wallet details are being fetched.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       '200':
 *         description: Successfully retrieved driver's wallet details
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
 *                       description: Total earnings of the driver.
 *                       example: '1000.00'
 *                     availableBalance:
 *                       type: string
 *                       description: Available balance of the driver.
 *                       example: '500.00'
 *                     bank:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           description: The ID of the bank account.
 *                           example: 1
 *                         bankName:
 *                           type: string
 *                           description: The name of the bank.
 *                           example: 'Bank of Example'
 *                         accountName:
 *                           type: string
 *                           description: The account name associated with the bank.
 *                           example: 'John Doe'
 *                         accountNumber:
 *                           type: string
 *                           description: The account number associated with the bank.
 *                           example: '123456789'
 *                     transactions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: The ID of the transaction.
 *                             example: 1
 *                           amount:
 *                             type: string
 *                             description: The amount of the transaction.
 *                             example: '$100.00'
 *                           type:
 *                             type: string
 *                             description: The type of transaction (withdrawal or deposit).
 *                             example: 'withdraw'
 *                           date:
 *                             type: string
 *                             description: The date and time of the transaction.
 *                             example: '12/05/2022 05:00 PM'
 *                     currencyUnit:
 *                       type: string
 *                       description: The currency unit symbol.
 *                       example: '$'
 *       '400':
 *         description: Bad Request - Invalid input or missing fields
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
 *                   example: 'Invalid input or missing required fields'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *       '404':
 *         description: Not Found - Driver not found for the provided ID
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
 *                   example: 'Driver not found for this ID'
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
 *                   example: 'Internal Server Error'
 */

router.get('/driver/wallet', validateToken, checkPermission, asyncMiddleware(adminController.driverWallet) ) 
//5.  Get driver wallet
router.post('/driver/pay', validateToken, checkPermission, asyncMiddleware(adminController.payToDriver) ) 

// ! Module 4: Warehouses
// 1.  Get all driver
/**
 * @swagger
 * /admin/allwarehouses:
 *   get:
 *     summary: Retrieve all warehouses
 *     description: This API retrieves a list of all warehouses, filtered by location if provided.
 *     tags:
 *       - Admin --> Warehouse Management
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
 *         schema:
 *           type: string
 *           example: 'your-access-token-here'
 *       - in: query
 *         name: located
 *         required: false
 *         description: Filter warehouses by location.
 *         schema:
 *           type: string
 *           example: 'New York'
 *     responses:
 *       '200':
 *         description: Successfully retrieved the list of warehouses
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
 *                   example: 'All warehouse data'
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       companyName:
 *                         type: string
 *                         example: 'Shipping Hack Inc.'
 *                       email:
 *                         type: string
 *                         example: 'warehouse@shippinghack.com'
 *                       countryCode:
 *                         type: string
 *                         example: '+1'
 *                       phoneNum:
 *                         type: string
 *                         example: '+1234567890'
 *                       located:
 *                         type: string
 *                         example: 'New York'
 *                       address:
 *                         type: object
 *                         properties:
 *                           country:
 *                             type: string
 *                             example: 'USA'
 *                           city:
 *                             type: string
 *                             example: 'New York'
 *       '400':
 *         description: Bad Request - Invalid query parameters
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
 *                   example: 'Invalid query parameter: located'
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

router.get('/allwarehouses', validateToken, checkPermission, asyncMiddleware(adminController.getAllWarehouse)) 
//2. Get customer details
/**
 * @swagger
 * /admin/warehousedetails/{id}:
 *   get:
 *     summary: Get details of a specific warehouse
 *     description: This API fetches the details of a warehouse, including address, receiving warehouse bookings, and delivery warehouse bookings.
 *     tags:
 *       - Admin --> Warehouse Management
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
 *         schema:
 *           type: string
 *           example: 'your-access-token-here'
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the warehouse whose details are to be fetched.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       '200':
 *         description: Successfully fetched warehouse details
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
 *                   example: 'Warehouse details'
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     companyName:
 *                       type: string
 *                       example: 'Shipping Hack Warehouse'
 *                     email:
 *                       type: string
 *                       example: 'warehouse@shippinghack.com'
 *                     phoneNum:
 *                       type: string
 *                       example: '+1234567890'
 *                     receivingWarehouse:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 101
 *                           trackingId:
 *                             type: string
 *                             example: 'TRK12345'
 *                           pickupDate:
 *                             type: string
 *                             example: '2024-12-01'
 *                           total:
 *                             type: number
 *                             example: 100.50
 *                           pickupAddress:
 *                             type: object
 *                             properties:
 *                               streetAddress:
 *                                 type: string
 *                                 example: '123 Main St'
 *                               city:
 *                                 type: string
 *                                 example: 'Los Angeles'
 *                               postalCode:
 *                                 type: string
 *                                 example: '90001'
 *                               country:
 *                                 type: string
 *                                 example: 'USA'
 *                               lat:
 *                                 type: number
 *                                 example: 34.0522
 *                               lng:
 *                                 type: number
 *                                 example: -118.2437
 *                           bookingStatus:
 *                             type: object
 *                             properties:
 *                               title:
 *                                 type: string
 *                                 example: 'Picked Up'
 *                     deliveryWarehouse:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 102
 *                           trackingId:
 *                             type: string
 *                             example: 'TRK67890'
 *                           ETA:
 *                             type: string
 *                             example: '2024-12-02'
 *                           total:
 *                             type: number
 *                             example: 50.00
 *                           dropoffAddress:
 *                             type: object
 *                             properties:
 *                               streetAddress:
 *                                 type: string
 *                                 example: '456 Elm St'
 *                               city:
 *                                 type: string
 *                                 example: 'San Francisco'
 *                               postalCode:
 *                                 type: string
 *                                 example: '94102'
 *                               country:
 *                                 type: string
 *                                 example: 'USA'
 *                               lat:
 *                                 type: number
 *                                 example: 37.7749
 *                               lng:
 *                                 type: number
 *                                 example: -122.4194
 *                           bookingStatus:
 *                             type: object
 *                             properties:
 *                               title:
 *                                 type: string
 *                                 example: 'Delivered'
 *       '400':
 *         description: Bad Request - Missing or invalid `id` in the path
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
 *                   example: 'Invalid warehouse ID'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *                   example: 'Internal Server Error'
 */

router.get('/warehousedetails/:id', validateToken, checkPermission, asyncMiddleware(adminController.warehouseDetails))
//3. Get address using search filter 
router.post('/getaddresses', validateToken, checkPermission, asyncMiddleware(adminController.searchAddress))
//4. Create warehouse
/**
 * @swagger
 * /admin/createwarehouse:
 *   post:
 *     summary: Create a new warehouse
 *     description: This API allows the admin to create a new warehouse with company information and location details.
 *     tags:
 *       - Admin --> Warehouse Management
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
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
 *               email:
 *                 type: string
 *                 description: Email address of the warehouse
 *                 example: 'warehouse@shippinghack.com'
 *               password:
 *                 type: string
 *                 description: Password for the warehouse
 *                 example: 'securepassword123'
 *               companyName:
 *                 type: string
 *                 description: Name of the company
 *                 example: 'Shipping Hack Warehouse'
 *               country:
 *                 type: string
 *                 description: Country where the warehouse is located
 *                 example: 'USA'
 *               province:
 *                 type: string
 *                 description: Province of the warehouse location
 *                 example: 'California'
 *               district:
 *                 type: string
 *                 description: District of the warehouse location
 *                 example: 'Los Angeles'
 *               city:
 *                 type: string
 *                 description: City of the warehouse location
 *                 example: 'Los Angeles'
 *               completeAddress:
 *                 type: string
 *                 description: Full address of the warehouse
 *                 example: '123 Main St, Suite 100'
 *               located:
 *                 type: string
 *                 description: Location where the warehouse is situated
 *                 example: 'Warehouse District A'
 *               countryCode:
 *                 type: string
 *                 description: Country code for phone number
 *                 example: '+1'
 *               phoneNum:
 *                 type: string
 *                 description: Phone number for the warehouse
 *                 example: '+1234567890'
 *     responses:
 *       '200':
 *         description: Successfully created the warehouse
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
 *                   example: 'Success'
 *                 data:
 *                   type: object
 *                   properties:
 *                     companyId:
 *                       type: integer
 *                       example: 1
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     email:
 *                       type: string
 *                       example: 'warehouse@shippinghack.com'
 *                     companyName:
 *                       type: string
 *                       example: 'Shipping Hack Warehouse'
 *                     located:
 *                       type: string
 *                       example: 'Warehouse District A'
 *                     address:
 *                       type: string
 *                       example: 'USA, California, Los Angeles, 123 Main St, Suite 100'
 *       '400':
 *         description: Bad Request - Missing required fields or invalid data
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
 *                   example: 'Invalid input data'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *                   example: 'Internal Server Error'
 */

router.post('/createwarehouse', validateToken, checkPermission, asyncMiddleware(adminController.createWarehouse));
//5. Update warehouse
/**
 * @swagger
 * /admin/updatewarehouse:
 *   put:
 *     summary: Update the warehouse details
 *     description: This API allows the admin to update the details of a warehouse, including its address and other information.
 *     tags:
 *       - Admin --> Warehouse Management
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
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
 *               warehouseId:
 *                 type: integer
 *                 description: The ID of the warehouse to update.
 *                 example: 1
 *               address:
 *                 type: object
 *                 description: The address data to update for the warehouse.
 *                 properties:
 *                   country:
 *                     type: string
 *                     example: 'USA'
 *                   province:
 *                     type: string
 *                     example: 'California'
 *                   city:
 *                     type: string
 *                     example: 'San Francisco'
 *                   streetAddress:
 *                     type: string
 *                     example: '123 Warehouse St'
 *                   postalCode:
 *                     type: string
 *                     example: '94105'
 *                   lat:
 *                     type: number
 *                     example: 37.7749
 *                   lng:
 *                     type: number
 *                     example: -122.4194
 *               companyName:
 *                 type: string
 *                 example: 'Shipping Hack Warehouse'
 *               email:
 *                 type: string
 *                 example: 'warehouse@shippinghack.com'
 *               phoneNum:
 *                 type: string
 *                 example: '+1234567890'
 *               located:
 *                 type: string
 *                 example: 'USA'
 *               countryCode:
 *                 type: string
 *                 example: '+1'
 *     responses:
 *       '200':
 *         description: Successfully updated the warehouse details
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
 *                   example: 'Updated'
 *                 data:
 *                   type: object
 *                   additionalProperties: true
 *       '400':
 *         description: Bad Request - Invalid `warehouseId` or missing `address` data
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
 *                   example: 'Invalid data or missing fields'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *                   example: 'Internal Server Error'
 */

router.put('/updatewarehouse', validateToken, checkPermission, asyncMiddleware(adminController.updateWarehouse));
//6. Delete warehouse
/**
 * @swagger
 * /admin/deletewarehouse:
 *   put:
 *     summary: Delete a warehouse by setting its status to false
 *     description: This API allows the admin to delete a warehouse by marking it as inactive (status set to false).
 *     tags:
 *       - Admin --> Warehouse Management
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
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
 *               warehouseId:
 *                 type: integer
 *                 description: The ID of the warehouse to delete.
 *                 example: 1
 *     responses:
 *       '200':
 *         description: Successfully deleted the warehouse
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
 *                   example: 'Warehouse deleted successfully'
 *       '400':
 *         description: Bad Request - Invalid or missing `warehouseId`
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
 *                   example: 'Invalid warehouseId'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *                   example: 'Internal Server Error'
 */

router.put('/deletewarehouse', validateToken, checkPermission, asyncMiddleware(adminController.deleteWarehouse));
//7. Add warehouse Location
/**
 * @swagger
 * /admin/warehouselocationAdd:
 *   post:
 *     summary: Add a new location to the warehouse
 *     description: This API allows the admin to add a new location (shelf code and warehouse zone) to the warehouse.
 *     tags:
 *       - Admin --> Warehouse Management
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
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
 *               shelfCode:
 *                 type: string
 *                 description: The shelf code to be added to the warehouse.
 *                 example: 'A12'
 *               warehouseZoneId:
 *                 type: integer
 *                 description: The ID of the warehouse zone where the shelf will be located.
 *                 example: 5
 *     responses:
 *       '200':
 *         description: Location added successfully to the warehouse
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
 *                     shelfCode:
 *                       type: string
 *                       example: 'A12'
 *                     warehouseZoneId:
 *                       type: integer
 *                       example: 5
 *       '400':
 *         description: Bad Request - Missing or invalid `shelfCode` or `warehouseZoneId`
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
 *                   example: 'Invalid data or missing fields'
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
 *                   example: 'Internal Server Error'
 */
router.post('/warehouselocationAdd',validateToken,checkPermission,asyncMiddleware(adminController.warehouselocationAdd))
//8. Edit Warehouse Location
/**
 * @swagger
 * /admin/editWarehouseLocation:
 *   put:
 *     summary: Edit an existing warehouse location
 *     description: This API allows the admin to update an existing warehouse location, including the shelf code and warehouse zone.
 *     tags:
 *       - Admin --> Warehouse Management
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
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
 *               shelfCodeId:
 *                 type: integer
 *                 description: The ID of the warehouse location to be updated.
 *                 example: 1
 *               shelfCode:
 *                 type: string
 *                 description: The new shelf code for the warehouse location.
 *                 example: 'A25'
 *               warehouseZoneId:
 *                 type: integer
 *                 description: The ID of the warehouse zone where the shelf will be located.
 *                 example: 3
 *     responses:
 *       '200':
 *         description: Successfully updated the warehouse location
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
 *                   example: 'Warehouse location Updated'
 *                 data:
 *                   type: object
 *                   additionalProperties: true
 *       '400':
 *         description: Bad Request - Invalid `shelfCodeId`, `shelfCode`, or `warehouseZoneId`
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
 *                   example: 'Invalid data or missing fields'
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
 *                   example: 'Internal Server Error'
 */

router.put("/editWarehouseLocation",validateToken,checkPermission,asyncMiddleware(adminController.editWarehouseLocation))
//9. Delete Warehouse Information
/**
 * @swagger
 * /admin/deleteLocation/{warehouseLocationId}:
 *   delete:
 *     summary: Delete a warehouse location
 *     description: This API allows the admin to delete a specific warehouse location using the location's ID.
 *     tags:
 *       - Admin --> Warehouse Management
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
 *         schema:
 *           type: string
 *           example: 'your-access-token-here'
 *       - in: path
 *         name: warehouseLocationId
 *         required: true
 *         description: The ID of the warehouse location to delete.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       '200':
 *         description: Successfully deleted the warehouse location
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
 *                   example: 'Warehouse Location Deleted'
 *                 data:
 *                   type: object
 *                   additionalProperties: true
 *       '400':
 *         description: Bad Request - Invalid `warehouseLocationId`
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
 *                   example: 'Invalid location ID'
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
 *                   example: 'Internal Server Error'
 */

router.delete("/deleteLocation/:warehouseLocationId",validateToken,checkPermission,asyncMiddleware(adminController.deleteLocation))

//=========================Warehouse Zones============================//
/**
 * @swagger
 * /admin/wareHouseZoneAdd:
 *   post:
 *     summary: Add a new warehouse zone
 *     description: This API allows the admin to add a new zone to a warehouse.
 *     tags:
 *       - Admin --> Warehouse Management
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
 *         schema:
 *           type: string
 *           example: 'your-access-token-here'
 *       - in: body
 *         name: body
 *         description: The details of the warehouse zone to add.
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             zoneName:
 *               type: string
 *               description: The name of the new warehouse zone.
 *               example: 'Zone A'
 *     responses:
 *       '200':
 *         description: Successfully added the warehouse zone
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
 *                   additionalProperties: true
 *       '400':
 *         description: Bad Request - Invalid `zoneName`
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
 *                   example: 'Invalid zone name'
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
 *                   example: 'Internal Server Error'
 */

router.post("/wareHouseZoneAdd",validateToken,checkPermission,asyncMiddleware(adminController.wareHouseZoneAdd))

/**
 * @swagger
 * /admin/editwarehouseZone:
 *   put:
 *     summary: Edit an existing warehouse zone
 *     description: This API allows the admin to update the details of an existing warehouse zone.
 *     tags:
 *       - Admin --> Warehouse Management
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
 *         schema:
 *           type: string
 *           example: 'your-access-token-here'
 *       - in: body
 *         name: body
 *         description: The details of the warehouse zone to update.
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             zoneName:
 *               type: string
 *               description: The name of the warehouse zone to update.
 *               example: 'Updated Zone A'
 *             zoneId:
 *               type: integer
 *               description: The ID of the warehouse zone to update.
 *               example: 1
 *     responses:
 *       '200':
 *         description: Successfully updated the warehouse zone
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
 *                   example: 'Zone Updated'
 *                 data:
 *                   type: object
 *                   additionalProperties: true
 *       '400':
 *         description: Bad Request - Invalid `zoneId` or missing `zoneName`
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
 *                   example: 'Invalid data or missing fields'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *                   example: 'Internal Server Error'
 */

router.put("/editwarehouseZone",validateToken,checkPermission,asyncMiddleware(adminController.editwarehouseZone))

/**
 * @swagger
 * /admin/deleteZone/{zoneId}:
 *   delete:
 *     summary: Delete a warehouse zone
 *     description: This API allows the admin to delete a specific warehouse zone by its `zoneId`.
 *     tags:
 *       - Admin --> Warehouse Management
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
 *         schema:
 *           type: string
 *           example: 'your-access-token-here'
 *       - in: path
 *         name: zoneId
 *         required: true
 *         description: The ID of the warehouse zone to delete.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       '200':
 *         description: Successfully deleted the warehouse zone
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
 *                   example: 'Zone Deleted Successfully'
 *                 data:
 *                   type: object
 *                   additionalProperties: true
 *       '400':
 *         description: Bad Request - Invalid `zoneId`
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
 *                   example: 'Invalid zoneId'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *                   example: 'Internal Server Error'
 */

router.delete("/deleteZone/:zoneId",validateToken,checkPermission,asyncMiddleware(adminController.deleteZone))

//! ______________________________Module creating the order Inbound,Outbound______________________________!//


/**
 * @swagger
 * /admin/createOrder:
 *   post:
 *     summary: Create inbound or outbound merchant order
 *     description: Creates new merchant orders for products with warehouse transfers and inventory management
 *     tags:
 *       - Admin --> Merchant INbound && Outbound Order
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
 *               - orderType
 *               - merchantReference
 *               - merchantID
 *               - items
 *               - warehouseId
 *             properties:
 *               orderType:
 *                 type: string
 *                 enum: [INBOUND, OUTBOUND]
 *                 description: Type of order
 *                 example: 'INBOUND'
 *               merchantReference:
 *                 type: string
 *                 description: Reference number for the order
 *                 example: 'ORD-123'
 *               merchantName:
 *                 type: string
 *                 description: Name of the merchant (optional, will be fetched from merchantID)
 *                 example: 'John Doe'
 *               merchantID:
 *                 type: integer
 *                 description: ID of the merchant creating the order
 *                 example: 1
 *               items:
 *                 type: array
 *                 description: List of products in the order
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: integer
 *                       description: ID of the product
 *                       example: 1
 *                     quantity:
 *                       type: integer
 *                       description: Quantity of the product
 *                       example: 5
 *               warehouseId:
 *                 type: integer
 *                 description: ID of the primary warehouse
 *                 example: 1
 *               receiveingWarehouse:
 *                 type: integer
 *                 description: ID of receiving warehouse (required for OUTBOUND orders with warehouse transfer)
 *                 example: 2
 *               receiveingShelfCodeId:
 *                 type: integer
 *                 description: Shelf code ID in receiving warehouse (required for OUTBOUND orders)
 *                 example: 101
 *     responses:
 *       '200':
 *         description: Successfully created order(s)
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
 *                   example: 'INBOUND Order has been created with 2 products'
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
 *                       merchantReference:
 *                         type: string
 *                         example: 'ORD-123'
 *                       merchantName:
 *                         type: string
 *                         example: 'John Doe'
 *                       merchantId:
 *                         type: integer
 *                         example: 1
 *                       productId:
 *                         type: integer
 *                         example: 1
 *                       quantity:
 *                         type: integer
 *                         example: 5
 *                       warehouseId:
 *                         type: integer
 *                         example: 1
 *                       merchantorderstatusesId:
 *                         type: integer
 *                         example: 1
 *       '400':
 *         description: Bad Request - Validation errors
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
 *                   example: 'Entered Quantity is greater than Product Quantity'
 *       '401':
 *         description: Unauthorized - Invalid or missing access token
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
 *         description: Forbidden - User doesn't have required permissions
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
 *                   example: 'Permission denied'
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
router.post("/createOrder",validateToken,checkPermission,asyncMiddleware(adminController.createOrder ))




// ! Module 5: Address System
// 1. Get all addresses
router.get('/alladdresses', validateToken, checkPermission, asyncMiddleware(adminController.getAllAddresses)); 
// 2. Get address details
router.get('/addressdetails', validateToken, checkPermission, asyncMiddleware(adminController.addressDetails)); 
// 3. Generate random code
router.get('/generatecode', validateToken, asyncMiddleware(adminController.generateRandomCode)); 
// 4. Approve address
router.post('/approveaddress', validateToken, checkPermission, asyncMiddleware(adminController.approveAddress)); 
// 5. Edit address
router.put('/editaddress', validateToken, checkPermission, asyncMiddleware(adminController.editAddress)); 
// 6. Delete address
router.put('/deleteaddress', validateToken, checkPermission, asyncMiddleware(adminController.deleteAddress)); 

// ! Module 6: Banners
//1. Add banners
const uploadBanner = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, `./Public/Banners`)
    },
    filename: (req, file, cb) => {
        cb(null, 'bannerImage-' + Date.now() +  path.extname(file.originalname))
    }
})
const upload = multer({
    storage: uploadBanner,
});

/**
 * @swagger
 * /admin/addbanner:
 *   post:
 *     summary: Add a new banner
 *     description: Creates a new banner with an image and description
 *     tags:
 *       - Admin --> Banners
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Banner image file
 *               description:
 *                 type: string
 *                 description: Description of the banner
 *                 example: 'Special offer banner for summer sale'
 *     responses:
 *       '200':
 *         description: Successfully added banner
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
 *                   example: 'Banner Added'
 *                 data:
 *                   type: object
 *                   example: {}
 *                 error:
 *                   type: string
 *                   example: ''
 *       '400':
 *         description: Bad Request - Image not uploaded
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
 *                   example: 'Image not uploaded'
 *                 error:
 *                   type: string
 *                   example: 'Please upload image'
 *       '401':
 *         description: Unauthorized - Invalid or missing access token
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
 *         description: Forbidden - User doesn't have required permissions
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
 *                   example: 'Permission denied'
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
router.post('/addbanner', validateToken, checkPermission, upload.single('image'), asyncMiddleware(adminController.addBanner))
//2. Get all banners

/**
 * @swagger
 * /admin/getallbanners:
 *   get:
 *     summary: Get all active banners
 *     description: Retrieves a list of all active banners with their details
 *     tags:
 *       - Admin --> Banners
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Authentication token
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successfully retrieved banners
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
 *                   example: 'All banners'
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: Unique identifier for the banner
 *                         example: 1
 *                       description:
 *                         type: string
 *                         description: Description of the banner
 *                         example: 'Special offer banner for summer sale'
 *                       image:
 *                         type: string
 *                         description: Path to the banner image
 *                         example: 'uploads/banners/banner-123.jpg'
 *                       status:
 *                         type: boolean
 *                         description: Status of the banner (always true for active banners)
 *                         example: true
 *                 error:
 *                   type: string
 *                   example: ''
 *       '401':
 *         description: Unauthorized - Invalid or missing access token
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
 *         description: Forbidden - User doesn't have required permissions
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
 *                   example: 'Permission denied'
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
router.get('/getallbanners', validateToken, checkPermission, asyncMiddleware(adminController.getAllBanners));
//3. Update a banner
/**
 * @swagger
 * /admin/updatebanner:
 *   put:
 *     summary: Update an existing banner
 *     description: Updates a banner's description and optionally its image
 *     tags:
 *       - Admin --> Banners
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - bannerId
 *               - description
 *               - updateImage
 *             properties:
 *               bannerId:
 *                 type: integer
 *                 description: ID of the banner to update
 *                 example: 1
 *               description:
 *                 type: string
 *                 description: New description for the banner
 *                 example: 'Updated summer sale banner'
 *               updateImage:
 *                 type: string
 *                 enum: ['true', 'false']
 *                 description: Whether to update the banner image
 *                 example: 'true'
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: New banner image file (required if updateImage is 'true')
 *     responses:
 *       '200':
 *         description: Successfully updated banner
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
 *                   example: 'Banner updated'
 *                 data:
 *                   type: object
 *                   example: {}
 *                 error:
 *                   type: string
 *                   example: ''
 *       '400':
 *         description: Bad Request - Missing required fields or image not uploaded when required
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
 *                   example: 'Image not uploaded'
 *                 error:
 *                   type: string
 *                   example: 'Please upload image'
 *       '401':
 *         description: Unauthorized - Invalid or missing access token
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
 *         description: Forbidden - User doesn't have required permissions
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
 *                   example: 'Permission denied'
 *       '404':
 *         description: Not Found - Banner ID does not exist
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
 *                   example: 'Banner not found'
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
router.put('/updatebanner', validateToken, checkPermission, upload.single('image'), asyncMiddleware(adminController.updateBanner))
//4. Change banner status
/**
 * @swagger
 * /admin/bannerstatus:
 *   put:
 *     summary: Change banner status
 *     description: Updates the active/inactive status of a specific banner
 *     tags:
 *       - Admin --> Banners
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
 *               - bannerId
 *               - status
 *             properties:
 *               bannerId:
 *                 type: integer
 *                 description: ID of the banner to update
 *                 example: 1
 *               status:
 *                 type: boolean
 *                 description: New status for the banner (true for active, false for inactive)
 *                 example: true
 *     responses:
 *       '200':
 *         description: Successfully updated banner status
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
 *                   example: 'Banner status changed'
 *                 data:
 *                   type: object
 *                   example: {}
 *                 error:
 *                   type: string
 *                   example: ''
 *       '400':
 *         description: Bad Request - Missing or invalid parameters
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
 *                   example: 'Invalid parameters'
 *       '401':
 *         description: Unauthorized - Invalid or missing access token
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
 *         description: Forbidden - User doesn't have required permissions
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
 *                   example: 'Permission denied'
 *       '404':
 *         description: Not Found - Banner ID does not exist
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
 *                   example: 'Banner not found'
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
router.put('/bannerstatus', validateToken, checkPermission, asyncMiddleware(adminController.changeBannerStatus))

// ! Module 7: Categories
const uploadCategory = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, `./Public/Categories`)
    },
    filename: (req, file, cb) => {
        cb(null, 'Category-' + Date.now() +  path.extname(file.originalname))
    }
})
const uploadCategoryLogo = multer({
    storage: uploadCategory,
});


/**
 * @swagger
 * /admin/addcategory:
 *   post:
 *     summary: Add a new category
 *     description: This API allows the admin to add a new category with a title and charge.
 *     tags:
 *       - Admin --> Categories
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
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
 *               title:
 *                 type: string
 *                 description: The title of the new category.
 *                 example: 'Shipping'
 *               charge:
 *                 type: number
 *                 format: float
 *                 description: The charge associated with the category.
 *                 example: 100.50
 *     responses:
 *       '200':
 *         description: Successfully added the category
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
 *                   example: 'Category added'
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The ID of the newly created category.
 *                       example: 1
 *       '400':
 *         description: Bad Request - Invalid input or missing fields
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
 *                   example: 'Invalid input or missing required fields'
 *       '409':
 *         description: Conflict - A category with the same title already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: '2'
 *                 message:
 *                   type: string
 *                   example: 'A category with the following name already exists. Please try some other name.'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *                   example: 'Internal Server Error'
 */

router.post('/addcategory', validateToken, checkPermission, asyncMiddleware(adminController.addCategory))
//2. Get all categorys
/**
 * @swagger
 * /admin/getallcategory:
 *   get:
 *     summary: Get all active categories
 *     description: This API allows the admin to fetch all active categories with their ID, title, charge, and status.
 *     tags:
 *       - Admin --> Categories
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
 *         schema:
 *           type: string
 *           example: 'your-access-token-here'
 *     responses:
 *       '200':
 *         description: Successfully retrieved all active categories
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
 *                   example: 'All categories'
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The ID of the category.
 *                         example: 1
 *                       title:
 *                         type: string
 *                         description: The title of the category.
 *                         example: 'Shipping'
 *                       status:
 *                         type: boolean
 *                         description: The status of the category (true = active, false = inactive).
 *                         example: true
 *                       charge:
 *                         type: number
 *                         format: float
 *                         description: The charge associated with the category.
 *                         example: 50.75
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *                   example: 'Internal Server Error'
 */

router.get('/getallcategory', validateToken, checkPermission, asyncMiddleware(adminController.getAllCategory));
//3. Update a category
/**
 * @swagger
 * /admin/updatecategory:
 *   put:
 *     summary: Update category details
 *     description: This API allows the admin to update the details of an existing category, including its title and charge.
 *     tags:
 *       - Admin --> Categories
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
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
 *               categoryId:
 *                 type: integer
 *                 description: The ID of the category to be updated.
 *                 example: 1
 *               title:
 *                 type: string
 *                 description: The new title for the category.
 *                 example: 'Updated Category Title'
 *               charge:
 *                 type: number
 *                 format: float
 *                 description: The new charge for the category.
 *                 example: 100.75
 *     responses:
 *       '200':
 *         description: Successfully updated the category
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
 *                   example: 'Category updated'
 *       '400':
 *         description: Bad Request - Invalid input or missing fields
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
 *                   example: 'Invalid input or missing required fields'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *       '404':
 *         description: Not Found - The category with the provided ID does not exist
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
 *                   example: 'Category not found. Please enter valid data.'
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
 *                   example: 'Internal Server Error'
 */

router.put('/updatecategory', validateToken, checkPermission, asyncMiddleware(adminController.updateCategory))
//4. Change category status
/**
 * @swagger
 * /admin/categorystatus:
 *   put:
 *     summary: Change the status of a category
 *     description: This API allows the admin to change the status of a category (active/inactive).
 *     tags:
 *       - Admin --> Categories
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
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
 *               categoryId:
 *                 type: integer
 *                 description: The ID of the category whose status needs to be changed.
 *                 example: 1
 *               status:
 *                 type: boolean
 *                 description: The new status of the category (true = active, false = inactive).
 *                 example: true
 *     responses:
 *       '200':
 *         description: Successfully updated the category status
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
 *                   example: 'Category updated successfully'
 *       '400':
 *         description: Bad Request - Invalid input or missing fields
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
 *                   example: 'Invalid input or missing required fields'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *       '404':
 *         description: Not Found - The category with the provided ID does not exist
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
 *                   example: 'Category not found. Please enter valid data.'
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
 *                   example: 'Internal Server Error'
 */

router.put('/categorystatus', validateToken, checkPermission, asyncMiddleware(adminController.changeCategoryStatus))

// ! Module 8: Coupons
router.post('/addcoupon', validateToken, checkPermission, asyncMiddleware(adminController.addCoupon))
//2. Get all coupons
router.get('/getallcoupon', validateToken, checkPermission, asyncMiddleware(adminController.getAllCoupon));
//3. Update a coupon
router.put('/updatecoupon', validateToken, checkPermission, asyncMiddleware(adminController.updateCoupon))
//4. Change coupon status
router.put('/couponstatus', validateToken, checkPermission, asyncMiddleware(adminController.changeCouponStatus))

// ! Module 9: Sizes
//1. Get unit types
router.get('/unittypes', validateToken, checkPermission, asyncMiddleware(adminController.getUnitsClass));
// 2. Add sizes
const uploadSize = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, `./Public/Images/Size`)
    },
    filename: (req, file, cb) => {
        cb(null, 'sizeImage-' + Date.now() +  path.extname(file.originalname))
    }
})
const uploadSizeImage = multer({
    storage: uploadSize,
});
router.post('/addsize', uploadSizeImage.single('image'), validateToken, checkPermission, asyncMiddleware(adminController.addSize))
//3. Get all sizes
router.get('/getallsize', validateToken, checkPermission, asyncMiddleware(adminController.getAllSize));
//4. Update a size
router.put('/updatesize', validateToken, checkPermission, uploadSizeImage.single('image'), asyncMiddleware(adminController.updateSize))
//5. Change size status
router.put('/sizestatus', validateToken, checkPermission, asyncMiddleware(adminController.changeSizeStatus))

// ! Module 10: Structure types
// 1. Add sizes
const uploadStrucType = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, `./Public/Images/StructureTypes`)
    },
    filename: (req, file, cb) => {
        cb(null, 'strucIcon-' + Date.now() +  path.extname(file.originalname))
    }
})
const uploadStrucTypeImage = multer({
    storage: uploadStrucType,
});
router.post('/addstruct',  validateToken, checkPermission,uploadStrucTypeImage.single('image'), asyncMiddleware(adminController.addStruct))
//2. Get all structs
router.get('/getallstruct', validateToken, checkPermission, asyncMiddleware(adminController.getAllStruct));
//3. Update a struct
router.put('/updatestruct', validateToken, checkPermission, uploadStrucTypeImage.single('image'), asyncMiddleware(adminController.updateStruct))
//4. Change struct status
router.put('/structstatus', validateToken, checkPermission, asyncMiddleware(adminController.changeStructStatus))

// ! Module 11: Vehicle Types
// 1. Add Vehicles
const uploadVehicleType = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, `./Public/Images/VehicleTypes`)
    },
    filename: (req, file, cb) => {
        console.log()
        cb(null, 'vehicleImage-' + req.body.title + '-'+ Date.now() +  path.extname(file.originalname))
    }
})
const uploadVehicleTypeImage = multer({
    storage: uploadVehicleType,
});

/**
 * @swagger
 * /admin/addvehicle:
 *   post:
 *     summary: Add a new vehicle type
 *     description: This API allows the admin to add a new vehicle type with its details, including image upload.
 *     tags:
 *       - Admin --> Vehicle Types
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
 *         schema:
 *           type: string
 *           example: 'your-access-token-here'
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: The image of the vehicle type (optional).
 *               title:
 *                 type: string
 *                 description: The title of the vehicle type.
 *                 example: 'Sedan'
 *               baseRate:
 *                 type: number
 *                 description: The base rate for the vehicle type.
 *                 example: 100
 *               perUnitRate:
 *                 type: number
 *                 description: The per unit rate for the vehicle type.
 *                 example: 5
 *               weightCapacity:
 *                 type: number
 *                 description: The weight capacity of the vehicle.
 *                 example: 1000
 *               volumeCapacity:
 *                 type: number
 *                 description: The volume capacity of the vehicle.
 *                 example: 50
 *     responses:
 *       '200':
 *         description: Successfully added the new vehicle type
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
 *                   example: 'Vehicle added'
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The ID of the created vehicle type.
 *                       example: 1
 *                     title:
 *                       type: string
 *                       description: The title of the vehicle type.
 *                       example: 'Sedan'
 *                     baseRate:
 *                       type: number
 *                       description: The base rate for the vehicle type.
 *                       example: 100
 *                     perUnitRate:
 *                       type: number
 *                       description: The per unit rate for the vehicle type.
 *                       example: 5
 *                     weightCapacity:
 *                       type: number
 *                       description: The weight capacity of the vehicle.
 *                       example: 1000
 *                     volumeCapacity:
 *                       type: number
 *                       description: The volume capacity of the vehicle.
 *                       example: 50
 *                     image:
 *                       type: string
 *                       description: The path to the image of the vehicle type.
 *                       example: '/uploads/vehicle_sedan.jpg'
 *       '400':
 *         description: Bad Request - Missing or invalid input fields
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
 *                   example: 'Invalid or missing required fields'
 *       '401':
 *         description: Unauthorized - Access token is missing or invalid
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
 *       '409':
 *         description: Conflict - Vehicle with the same name already exists
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
 *                   example: 'A vehicle with the same name already exists'
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
 *                   example: 'Internal Server Error'
 */

router.post('/addvehicle',  validateToken, checkPermission,uploadVehicleTypeImage.single('image'), asyncMiddleware(adminController.addVehicle))
//2. Get all vehicles
/**
 * @swagger
 * /admin/getallvehicle:
 *   get:
 *     summary: Get all active vehicle types
 *     description: This API allows the admin to fetch all active vehicle types, with their weight and volume capacities converted to the base units.
 *     tags:
 *       - Admin --> Vehicle Types
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
 *         schema:
 *           type: string
 *           example: 'your-access-token-here'
 *     responses:
 *       '200':
 *         description: Successfully retrieved all active vehicle types
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
 *                   example: 'All Vehicles Types'
 *                 data:
 *                   type: object
 *                   properties:
 *                     vehicleData:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: The ID of the vehicle type.
 *                             example: 1
 *                           title:
 *                             type: string
 *                             description: The title of the vehicle type.
 *                             example: 'Sedan'
 *                           weightCapacity:
 *                             type: number
 *                             description: The weight capacity of the vehicle (converted to base units).
 *                             example: 1000
 *                           volumeCapacity:
 *                             type: number
 *                             description: The volume capacity of the vehicle (converted to base units).
 *                             example: 50
 *                           image:
 *                             type: string
 *                             description: The image URL of the vehicle type.
 *                             example: '/uploads/vehicle_sedan.jpg'
 *                     unit:
 *                       type: string
 *                       description: The unit of measurement for weight and volume.
 *                       example: 'kg'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *                   example: 'Internal Server Error'
 */

router.get('/getallvehicle', validateToken, checkPermission, asyncMiddleware(adminController.getAllVehicle));
//3. Update a vehicle
/**
 * @swagger
 * /admin/updatevehicle:
 *   put:
 *     summary: Update vehicle type
 *     description: This API allows the admin to update vehicle type details, including title, base rate, per unit rate, weight capacity, volume capacity, and image if updated.
 *     tags:
 *       - Admin --> Vehicle Types
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
 *         schema:
 *           type: string
 *           example: 'your-access-token-here'
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the vehicle type.
 *                 example: 'SUV'
 *               baseRate:
 *                 type: number
 *                 description: The base rate for the vehicle type.
 *                 example: 100
 *               perUnitRate:
 *                 type: number
 *                 description: The per unit rate for the vehicle type.
 *                 example: 20
 *               weightCapacity:
 *                 type: number
 *                 description: The weight capacity of the vehicle.
 *                 example: 2000
 *               volumeCapacity:
 *                 type: number
 *                 description: The volume capacity of the vehicle.
 *                 example: 100
 *               vehicleId:
 *                 type: integer
 *                 description: The ID of the vehicle type to be updated.
 *                 example: 1
 *               updateImage:
 *                 type: string
 *                 description: Flag to indicate whether the image should be updated ('true' or 'false').
 *                 example: 'true'
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: The image file to upload for the vehicle type.
 *     responses:
 *       '200':
 *         description: Successfully updated the vehicle type
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
 *                   example: 'Vehicle Type updated'
 *       '400':
 *         description: Bad Request - Missing or invalid fields
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
 *                   example: 'Invalid input'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *                   example: 'Internal Server Error'
 */

router.put('/updatevehicle', validateToken, checkPermission, uploadVehicleTypeImage.single('image'), asyncMiddleware(adminController.updateVehicle))
//4. Change vehicle status
/**
 * @swagger
 * /admin/vehiclestatus:
 *   put:
 *     summary: Change vehicle status
 *     description: This API allows the admin to update the status of a vehicle type based on its ID.
 *     tags:
 *       - Admin --> Vehicle Types
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
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
 *               status:
 *                 type: boolean
 *                 description: The new status of the vehicle (true for active, false for inactive).
 *                 example: true
 *               vehicleId:
 *                 type: integer
 *                 description: The ID of the vehicle type whose status is to be updated.
 *                 example: 1
 *     responses:
 *       '200':
 *         description: Successfully updated the vehicle status
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
 *                   example: 'Vehicle status updated successfully'
 *       '400':
 *         description: Bad Request - Missing or invalid fields
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
 *                   example: 'Invalid input'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *                   example: 'Internal Server Error'
 */

router.put('/vehiclestatus', validateToken, checkPermission, asyncMiddleware(adminController.changeVehicleStatus))

// ! Module 12: Units  
//*___________________
// 1. Add new unit
/**
 * @swagger
 * /admin/addappunit:
 *   post:
 *     summary: Add a new set of application units
 *     description: This API allows the admin to add a new set of units for weight, length, distance, and currency.
 *     tags:
 *       - Admin --> Unit Management
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
 *         schema:
 *           type: string
 *           example: 'your-access-token-here'
 *       - in: body
 *         name: body
 *         description: The units data to create a new set of application units.
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             weightUnitId:
 *               type: integer
 *               description: The ID of the weight unit.
 *               example: 1
 *             lengthUnitId:
 *               type: integer
 *               description: The ID of the length unit.
 *               example: 2
 *             distanceUnitId:
 *               type: integer
 *               description: The ID of the distance unit.
 *               example: 3
 *             currencyUnitId:
 *               type: integer
 *               description: The ID of the currency unit.
 *               example: 4
 *     responses:
 *       '200':
 *         description: Successfully added new application units
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
 *                   example: 'New System Units'
 *                 data:
 *                   type: object
 *                   additionalProperties: true
 *       '400':
 *         description: Bad Request - Invalid unit IDs or already using the same units
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
 *                   example: 'Already using these units'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *                   example: 'Internal Server Error'
 */

router.post('/addappunit', validateToken, checkPermission, asyncMiddleware(adminController.addAppUnit));
// 2. Get all Units
/**
 * @swagger
 * /admin/currentsystemunits:
 *   get:
 *     summary: Get the current system units
 *     description: This API returns the current system units for weight, length, distance, and currency.
 *     tags:
 *       - Admin --> Unit Management
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
 *         schema:
 *           type: string
 *           example: 'your-access-token-here'
 *     responses:
 *       '200':
 *         description: Successfully fetched current system units
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
 *                   example: 'Current System Units'
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The ID of the app unit.
 *                       example: 1
 *                     weightUnit:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         type:
 *                           type: string
 *                         name:
 *                           type: string
 *                         symbol:
 *                           type: string
 *                     lengthUnit:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         type:
 *                           type: string
 *                         name:
 *                           type: string
 *                         symbol:
 *                           type: string
 *                     distanceUnit:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         type:
 *                           type: string
 *                         name:
 *                           type: string
 *                         symbol:
 *                           type: string
 *                     currencyUnit:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         type:
 *                           type: string
 *                         name:
 *                           type: string
 *                         symbol:
 *                           type: string
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *                   example: 'Internal Server Error'
 */

router.get('/currentsystemunits', validateToken, checkPermission, asyncMiddleware(adminController.currentSystemUnits));
// 3. update unit
/**
 * @swagger
 * /admin/getallunits:
 *   get:
 *     summary: Get all unit types (length, weight, distance, and currency)
 *     description: This API retrieves all units categorized by type (length, weight, distance, and currency).
 *     tags:
 *       - Admin --> Unit Management
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
 *         schema:
 *           type: string
 *           example: 'your-access-token-here'
 *     responses:
 *       '200':
 *         description: Successfully fetched all units
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
 *                   example: 'All Units'
 *                 data:
 *                   type: object
 *                   properties:
 *                     length:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           type:
 *                             type: string
 *                           name:
 *                             type: string
 *                           symbol:
 *                             type: string
 *                           conversionRate:
 *                             type: number
 *                             example: 1.0
 *                     weight:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           type:
 *                             type: string
 *                           name:
 *                             type: string
 *                           symbol:
 *                             type: string
 *                           conversionRate:
 *                             type: number
 *                             example: 1.0
 *                     distance:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           type:
 *                             type: string
 *                           name:
 *                             type: string
 *                           symbol:
 *                             type: string
 *                           conversionRate:
 *                             type: number
 *                             example: 1.0
 *                     currency:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           type:
 *                             type: string
 *                           name:
 *                             type: string
 *                           symbol:
 *                             type: string
 *                           conversionRate:
 *                             type: number
 *                             example: 1.0
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *                   example: 'Internal Server Error'
 */

router.get('/getallunits', validateToken, checkPermission, asyncMiddleware(adminController.getAllUnits)); 
//4. Get unit types addUnit
/**
 * @swagger
 * /admin/getunitstypes:
 *   get:
 *     summary: Get all unit types
 *     description: This API allows the admin to retrieve a list of all unit types available.
 *     tags:
 *       - Admin --> Unit Management
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
 *         schema:
 *           type: string
 *           example: 'your-access-token-here'
 *     responses:
 *       '200':
 *         description: Successfully retrieved all unit types
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
 *                   example: 'All Units Types'
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: 'length'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *                   example: 'Internal Server Error'
 */

router.get('/getunitstypes', validateToken, checkPermission, asyncMiddleware(adminController.getUnitsTypes));
//5.  Add Unit
/**
 * @swagger
 * /admin/addunit:
 *   post:
 *     summary: Add a new unit
 *     description: This API allows the admin to add a new unit to the system.
 *     tags:
 *       - Admin --> Unit Management
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
 *         schema:
 *           type: string
 *           example: 'your-access-token-here'
 *       - in: body
 *         name: body
 *         description: The details of the unit to add.
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             type:
 *               type: string
 *               description: The type of the unit (e.g., weight, distance, etc.)
 *               example: 'weight'
 *             name:
 *               type: string
 *               description: The name of the unit.
 *               example: 'Kilogram'
 *             symbol:
 *               type: string
 *               description: The symbol representing the unit.
 *               example: 'kg'
 *             desc:
 *               type: string
 *               description: A description of the unit.
 *               example: 'Unit of mass'
 *             conversionRate:
 *               type: number
 *               description: The conversion rate for the unit (if applicable).
 *               example: 1
 *     responses:
 *       '200':
 *         description: Successfully added a new unit
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
 *                   example: 'Unit Created Successfully'
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     type:
 *                       type: string
 *                       example: 'weight'
 *                     name:
 *                       type: string
 *                       example: 'Kilogram'
 *                     symbol:
 *                       type: string
 *                       example: 'kg'
 *                     desc:
 *                       type: string
 *                       example: 'Unit of mass'
 *                     conversionRate:
 *                       type: number
 *                       example: 1
 *       '400':
 *         description: Bad Request - Unit with the same symbol already exists
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
 *                   example: '( kg ) Already Exist. Please try Another.'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *                   example: 'Internal Server Error'
 */

router.post('/addunit', validateToken, checkPermission, asyncMiddleware(adminController.addUnit));
//5.  Update Unit 
/**
 * @swagger
 * /admin/updateunit:
 *   put:
 *     summary: Update an existing unit
 *     description: This API allows the admin to update the details of an existing unit, including its type, name, symbol, description, and conversion rate.
 *     tags:
 *       - Admin --> Unit Management
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
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
 *               unitId:
 *                 type: integer
 *                 description: The ID of the unit to update.
 *                 example: 1
 *               type:
 *                 type: string
 *                 example: 'weight'
 *               name:
 *                 type: string
 *                 example: 'Kilogram'
 *               symbol:
 *                 type: string
 *                 example: 'kg'
 *               desc:
 *                 type: string
 *                 example: 'Unit of mass'
 *               conversionRate:
 *                 type: number
 *                 example: 1
 *     responses:
 *       '200':
 *         description: Successfully updated the unit details
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
 *                   example: 'Unit Updated Successfully'
 *                 data:
 *                   type: object
 *                   additionalProperties: true
 *       '400':
 *         description: Bad Request - Invalid `unitId` or missing `type`, `name`, `symbol`, or `conversionRate`
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
 *                   example: 'Invalid data or missing fields'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *                   example: 'Internal Server Error'
 */

router.put('/updateunit', validateToken, checkPermission, asyncMiddleware(adminController.updateUnit));
//5.  Update Unit
/**
 * @swagger
 * /admin/updateunitstatus:
 *   put:
 *     summary: Update the status of an existing unit
 *     description: This API allows the admin to update the status of an existing unit (active or inactive).
 *     tags:
 *       - Admin --> Unit Management
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
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
 *               unitId:
 *                 type: integer
 *                 description: The ID of the unit to update.
 *                 example: 1
 *               status:
 *                 type: boolean
 *                 description: The status of the unit (true for active, false for inactive).
 *                 example: true
 *     responses:
 *       '200':
 *         description: Successfully updated the unit status
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
 *                   example: 'Unit Updated Successfully'
 *                 data:
 *                   type: object
 *                   additionalProperties: true
 *       '400':
 *         description: Bad Request - Invalid `unitId` or missing `status`
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
 *                   example: 'Invalid data or missing fields'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *                   example: 'Internal Server Error'
 */

router.put('/updateunitstatus', validateToken, checkPermission, asyncMiddleware(adminController.updateUnitStatus));

// ! Module 13: Support
// 2. Get support data
/**
 * @swagger
 * /admin/getsupport:
 *   get:
 *     summary: Get support contact details
 *     description: Retrieves support email and phone number information
 *     tags:
 *       - Admin --> Support
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Authentication token
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successfully retrieved support details
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
 *                   example: 'Support Data'
 *                 data:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         title:
 *                           type: string
 *                           example: 'Support Email'
 *                         key:
 *                           type: string
 *                           example: 'support_email'
 *                         value:
 *                           type: string
 *                           example: 'support@example.com'
 *                     phone:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 2
 *                         title:
 *                           type: string
 *                           example: 'Support Phone'
 *                         key:
 *                           type: string
 *                           example: 'support_phone'
 *                         value:
 *                           type: string
 *                           example: '+1234567890'
 *                 error:
 *                   type: string
 *                   example: ''
 *       '401':
 *         description: Unauthorized - Invalid or missing access token
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
 *         description: Forbidden - User doesn't have required permissions
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
 *                   example: 'Permission denied'
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
router.get('/getsupport', validateToken, checkPermission, asyncMiddleware(adminController.getSupport));
// 3. Update support

/**
 * @swagger
 * /admin/updatesupport:
 *   put:
 *     summary: Update support contact information
 *     description: Updates the value of a specific support contact detail (email or phone)
 *     tags:
 *       - Admin --> Support
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
 *               - supportId
 *               - value
 *             properties:
 *               supportId:
 *                 type: integer
 *                 description: ID of the support detail to update
 *                 example: 1
 *               value:
 *                 type: string
 *                 description: New value for the support contact (email or phone)
 *                 example: 'newsupport@example.com'
 *     responses:
 *       '200':
 *         description: Successfully updated support information
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
 *                   example: 'Support Information updated'
 *                 data:
 *                   type: object
 *                   example: {}
 *                 error:
 *                   type: string
 *                   example: ''
 *       '400':
 *         description: Bad Request - Missing or invalid parameters
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
 *                   example: 'Invalid parameters'
 *       '401':
 *         description: Unauthorized - Invalid or missing access token
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
 *         description: Forbidden - User doesn't have required permissions
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
 *                   example: 'Permission denied'
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
 *                   example: 'Internal Server Error'
 *                 data:
 *                   type: object
 *                   example: {}
 *                 error:
 *                   type: string
 *                   description: Error message details
 *                   example: 'Database error occurred'
 */
router.put('/updatesupport', validateToken, checkPermission, asyncMiddleware(adminController.updateSupport));

// ! Module 14: FAQs
// 1. Add new FAQ
/**
 * @swagger
 * /admin/addfaq:
 *   post:
 *     summary: Add a new FAQ
 *     description: This API allows the admin to add a new FAQ with a title and answer.
 *     tags:
 *       - Admin --> FAQ's
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
 *         schema:
 *           type: string
 *           example: 'your-access-token-here'
 *       - in: body
 *         name: body
 *         description: The FAQ data to add.
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             title:
 *               type: string
 *               example: 'What is the return policy?'
 *             answer:
 *               type: string
 *               example: 'You can return the product within 30 days of purchase.'
 *     responses:
 *       '200':
 *         description: Successfully added the FAQ
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
 *                   example: 'FAQ added'
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     title:
 *                       type: string
 *                       example: 'What is the return policy?'
 *                     answer:
 *                       type: string
 *                       example: 'You can return the product within 30 days of purchase.'
 *       '400':
 *         description: Bad Request - FAQ already exists
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
 *                   example: 'FAQ already exist'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *                   example: 'Internal Server Error'
 */

router.post('/addfaq', validateToken, checkPermission, asyncMiddleware(adminController.addFAQ));
// 2. Get all Units
/**
 * @swagger
 * /admin/allfaqs:
 *   get:
 *     summary: Get all FAQs
 *     description: This API allows the admin to retrieve a list of all FAQs that are not deleted.
 *     tags:
 *       - Admin --> FAQ's
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
 *         schema:
 *           type: string
 *           example: 'your-access-token-here'
 *     responses:
 *       '200':
 *         description: Successfully retrieved all FAQs
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
 *                   example: 'All FAQs'
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
 *                         example: 'What is the return policy?'
 *                       answer:
 *                         type: string
 *                         example: 'You can return the product within 30 days of purchase.'
 *                       status:
 *                         type: boolean
 *                         example: true
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *                   example: 'Internal Server Error'
 */

router.get('/allfaqs', validateToken, checkPermission, asyncMiddleware(adminController.allFAQs));
// 3. update FAQ
/**
 * @swagger
 * /admin/updatefaq:
 *   put:
 *     summary: Update an existing FAQ
 *     description: This API allows the admin to update an existing FAQ's title and answer.
 *     tags:
 *       - Admin --> FAQ's
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
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
 *               faqId:
 *                 type: integer
 *                 description: The ID of the FAQ to update.
 *                 example: 1
 *               title:
 *                 type: string
 *                 description: The updated title of the FAQ.
 *                 example: 'What is the return policy?'
 *               answer:
 *                 type: string
 *                 description: The updated answer to the FAQ.
 *                 example: 'You can return the product within 30 days of purchase.'
 *     responses:
 *       '200':
 *         description: Successfully updated the FAQ
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
 *                   example: 'FAQ updated'
 *                 data:
 *                   type: object
 *                   additionalProperties: true
 *       '400':
 *         description: Bad Request - Missing `faqId`, `title`, or `answer`
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
 *                   example: 'Invalid data or missing fields'
 *       '404':
 *         description: FAQ Not Found - The FAQ with the given `faqId` does not exist or is deleted.
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
 *                   example: 'FAQ Not Found'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *                   example: 'Internal Server Error'
 */

router.put('/updatefaq', validateToken, checkPermission, asyncMiddleware(adminController.updateFAQ));
// 4. Change FAQ status
/**
 * @swagger
 * /admin/changefaqstatus:
 *   put:
 *     summary: Change the status of an FAQ
 *     description: This API allows the admin to update the status (active/inactive) of an FAQ.
 *     tags:
 *       - Admin --> FAQ's
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
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
 *               faqId:
 *                 type: integer
 *                 description: The ID of the FAQ whose status is to be changed.
 *                 example: 1
 *               status:
 *                 type: boolean
 *                 description: The new status for the FAQ. `true` for active, `false` for inactive.
 *                 example: true
 *     responses:
 *       '200':
 *         description: Successfully updated the FAQ status
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
 *                   example: 'FAQ status updated'
 *                 data:
 *                   type: object
 *                   additionalProperties: true
 *       '400':
 *         description: Bad Request - Missing or invalid `faqId` or `status`
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
 *                   example: 'Invalid data or missing fields'
 *       '404':
 *         description: FAQ Not Found - The FAQ with the given `faqId` does not exist or is deleted.
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
 *                   example: 'FAQ Not Found'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *                   example: 'Internal Server Error'
 */

router.put('/changefaqstatus', validateToken, checkPermission, asyncMiddleware(adminController.changeFAQStatus));
// 4. Delete FAQ
/**
 * @swagger
 * /admin/deletefaqs:
 *   put:
 *     summary: Delete an FAQ
 *     description: This API allows the admin to delete an FAQ by updating its status and marking it as deleted.
 *     tags:
 *       - Admin --> FAQ's
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
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
 *               faqId:
 *                 type: integer
 *                 description: The ID of the FAQ to delete.
 *                 example: 1
 *     responses:
 *       '200':
 *         description: Successfully deleted the FAQ
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
 *                   example: 'FAQ Deleted Successfully'
 *                 data:
 *                   type: object
 *                   additionalProperties: true
 *       '400':
 *         description: Bad Request - Invalid `faqId` or missing data
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
 *                   example: 'Invalid data or missing fields'
 *       '404':
 *         description: FAQ Not Found - The FAQ with the given `faqId` does not exist.
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
 *                   example: 'FAQ Not Found'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *                   example: 'Internal Server Error'
 */

router.put('/deletefaqs', validateToken, checkPermission, asyncMiddleware(adminController.deleteFAQ));

// ! Module 15: Charges\
//*_________________________________________________________________________________
/* 1. General Charges  */
// /-------------------------------
// 1.1 Get general charges
/**
 * @swagger
 * /admin/getgencharges:
 *   get:
 *     summary: Get all general charges
 *     description: This API allows the admin to fetch all general charge details including key, information, and value.
 *     tags:
 *       - Admin --> Charges Management
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
 *         schema:
 *           type: string
 *           example: 'your-access-token-here'
 *     responses:
 *       '200':
 *         description: Successfully retrieved all general charge data
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
 *                   example: 'General Charges'
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       key:
 *                         type: string
 *                         description: The key of the general charge.
 *                         example: 'Service Fee'
 *                       id:
 *                         type: integer
 *                         description: The ID of the general charge.
 *                         example: 1
 *                       information:
 *                         type: string
 *                         description: The detailed information about the general charge.
 *                         example: 'This charge applies to all services'
 *                       value:
 *                         type: number
 *                         description: The value or amount for the general charge.
 *                         example: 5.00
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *                   example: 'Internal Server Error'
 */

router.get('/getgencharges', validateToken, checkPermission, asyncMiddleware(adminController.getGenCharges));
// 1.2 Update general charges
/**
 * @swagger
 * /admin/updategencharges:
 *   put:
 *     summary: Update general charge value
 *     description: This API allows the admin to update the value of a general charge based on the charge ID.
 *     tags:
 *       - Admin --> Charges Management
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
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
 *               value:
 *                 type: number
 *                 description: The new value for the general charge.
 *                 example: 20
 *               cId:
 *                 type: integer
 *                 description: The ID of the general charge to be updated.
 *                 example: 1
 *     responses:
 *       '200':
 *         description: Successfully updated the general charge
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
 *                   example: 'Charges updated'
 *       '400':
 *         description: Bad Request - Missing or invalid fields
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
 *                   example: 'Invalid input'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *                   example: 'Internal Server Error'
 */

router.put('/updategencharges', validateToken, checkPermission, asyncMiddleware(adminController.updateGenCharges));

/* 2. Distance Charges  */
// /-------------------------------
// 2.1 Add Distance charge
/**
 * @swagger
 * /admin/adddistancecharge:
 *   post:
 *     summary: Add a new distance charge
 *     description: This API allows the admin to add a new distance charge with a title, start value, end value, and price. The start and end values are converted to base units.
 *     tags:
 *       - Admin --> Charges Management
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
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
 *               title:
 *                 type: string
 *                 description: The title of the distance charge.
 *                 example: 'Standard Distance Charge'
 *               startValue:
 *                 type: number
 *                 description: The starting value for the distance charge.
 *                 example: 0
 *               endValue:
 *                 type: number
 *                 description: The ending value for the distance charge.
 *                 example: 100
 *               price:
 *                 type: number
 *                 description: The price for the distance charge.
 *                 example: 15
 *     responses:
 *       '200':
 *         description: Successfully added a new distance charge
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
 *                   example: 'New range added'
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The ID of the newly created distance charge.
 *                       example: 1
 *                     title:
 *                       type: string
 *                       description: The title of the new distance charge.
 *                       example: 'Standard Distance Charge'
 *                     startValue:
 *                       type: number
 *                       description: The start value for the distance charge.
 *                       example: 0
 *                     endValue:
 *                       type: number
 *                       description: The end value for the distance charge.
 *                       example: 100
 *                     price:
 *                       type: number
 *                       description: The price for the distance charge.
 *                       example: 15
 *       '400':
 *         description: Bad Request - Missing or invalid fields
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
 *                   example: 'Invalid input'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *                   example: 'Internal Server Error'
 */

router.post('/adddistancecharge', validateToken, checkPermission, asyncMiddleware(adminController.addDistCharge));
// 2.2 Get Distance charge

/**
 * @swagger
 * /admin/getdistancecharge:
 *   get:
 *     summary: Get all distance charges
 *     description: This API allows the admin to fetch all distance charge details including start value, end value, price, and unit, with values converted to the base units.
 *     tags:
 *       - Admin --> Charges Management
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
 *         schema:
 *           type: string
 *           example: 'your-access-token-here'
 *     responses:
 *       '200':
 *         description: Successfully retrieved all distance charge data
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
 *                   example: 'Get all distance charges'
 *                 data:
 *                   type: object
 *                   properties:
 *                     distCharData:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: The ID of the distance charge.
 *                             example: 1
 *                           title:
 *                             type: string
 *                             description: The title of the distance charge.
 *                             example: 'Standard Distance Charge'
 *                           startValue:
 *                             type: number
 *                             description: The starting value for the distance charge.
 *                             example: 0
 *                           endValue:
 *                             type: number
 *                             description: The ending value for the distance charge.
 *                             example: 100
 *                           price:
 *                             type: number
 *                             description: The price for the distance charge.
 *                             example: 15
 *                           unit:
 *                             type: string
 *                             description: The unit of the distance charge.
 *                             example: 'km'
 *                     unit:
 *                       type: string
 *                       description: The unit of measurement for distance.
 *                       example: 'km'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *                   example: 'Internal Server Error'
 */

router.get('/getdistancecharge', validateToken, checkPermission, asyncMiddleware(adminController.getDistCharges));
// 2.3 Update Distance charge
/**
 * @swagger
 * /admin/updatedistancecharge:
 *   put:
 *     summary: Update distance charge details
 *     description: This API allows the admin to update the title, start value, end value, and price of a distance charge based on the charge ID.
 *     tags:
 *       - Admin --> Charges Management
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
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
 *               title:
 *                 type: string
 *                 description: The title of the distance charge.
 *                 example: 'Standard Distance Charge'
 *               startValue:
 *                 type: number
 *                 description: The starting value for the distance charge.
 *                 example: 0
 *               endValue:
 *                 type: number
 *                 description: The ending value for the distance charge.
 *                 example: 100
 *               price:
 *                 type: number
 *                 description: The price for the distance charge.
 *                 example: 15
 *               chargeId:
 *                 type: integer
 *                 description: The ID of the distance charge to be updated.
 *                 example: 1
 *     responses:
 *       '200':
 *         description: Successfully updated the distance charge
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
 *                   example: 'Charge updated'
 *       '400':
 *         description: Bad Request - Missing or invalid fields
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
 *                   example: 'Invalid input'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *                   example: 'Internal Server Error'
 */

router.put('/updatedistancecharge', validateToken, checkPermission, asyncMiddleware(adminController.updateDistCharge));
// 2.4 Delete Distance charge
router.put('/deletedistancecharge', validateToken, checkPermission,  asyncMiddleware(adminController.deleteDistCharge));

/* 3. Weight Charges  */
// /-------------------------------
// 3.1 Add weight charge
/**
 * @swagger
 * /admin/addweightcharge:
 *   post:
 *     summary: Add a new weight charge
 *     description: This API allows the admin to add a new weight charge with a title, start value, end value, and price. The start and end values are converted to base units.
 *     tags:
 *       - Admin --> Charges Management
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
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
 *               title:
 *                 type: string
 *                 description: The title of the weight charge.
 *                 example: 'Standard Weight Charge'
 *               startValue:
 *                 type: number
 *                 description: The starting value for the weight charge.
 *                 example: 0
 *               endValue:
 *                 type: number
 *                 description: The ending value for the weight charge.
 *                 example: 100
 *               price:
 *                 type: number
 *                 description: The price for the weight charge.
 *                 example: 10
 *     responses:
 *       '200':
 *         description: Successfully added a new weight charge
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
 *                   example: 'New range added'
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The ID of the newly created weight charge.
 *                       example: 1
 *                     title:
 *                       type: string
 *                       description: The title of the new weight charge.
 *                       example: 'Standard Weight Charge'
 *                     startValue:
 *                       type: number
 *                       description: The start value for the weight charge.
 *                       example: 0
 *                     endValue:
 *                       type: number
 *                       description: The end value for the weight charge.
 *                       example: 100
 *                     price:
 *                       type: number
 *                       description: The price for the weight charge.
 *                       example: 10
 *       '400':
 *         description: Bad Request - Missing or invalid fields
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
 *                   example: 'Invalid input'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *                   example: 'Internal Server Error'
 */

router.post('/addweightcharge', validateToken, checkPermission, asyncMiddleware(adminController.addWeightCharge));
// 3.2 Get weight charge
/**
 * @swagger
 * /admin/getweightcharge:
 *   get:
 *     summary: Get all weight charges
 *     description: This API allows the admin to fetch all weight charge details including start value, end value, price, and unit, with values converted to the base units.
 *     tags:
 *       - Admin --> Charges Management
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
 *         schema:
 *           type: string
 *           example: 'your-access-token-here'
 *     responses:
 *       '200':
 *         description: Successfully retrieved all weight charge data
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
 *                   example: 'Get all distance charges'
 *                 data:
 *                   type: object
 *                   properties:
 *                     weightCharData:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: The ID of the weight charge.
 *                             example: 1
 *                           title:
 *                             type: string
 *                             description: The title of the weight charge.
 *                             example: 'Standard Weight Charge'
 *                           startValue:
 *                             type: number
 *                             description: The starting value for the weight charge.
 *                             example: 0
 *                           endValue:
 *                             type: number
 *                             description: The ending value for the weight charge.
 *                             example: 100
 *                           price:
 *                             type: number
 *                             description: The price for the weight charge.
 *                             example: 10
 *                           unit:
 *                             type: string
 *                             description: The unit of the weight charge.
 *                             example: 'kg'
 *                     unit:
 *                       type: string
 *                       description: The unit of measurement for weight.
 *                       example: 'kg'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *                   example: 'Internal Server Error'
 */

router.get('/getweightcharge', validateToken, checkPermission, asyncMiddleware(adminController.getWeightCharges));
// 3.3 Update weight charge
/**
 * @swagger
 * /admin/updateweightcharge:
 *   put:
 *     summary: Update weight charge details
 *     description: This API allows the admin to update the title, start value, end value, and price of a weight charge based on the charge ID.
 *     tags:
 *       - Admin --> Charges Management
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
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
 *               title:
 *                 type: string
 *                 description: The title of the weight charge.
 *                 example: 'Standard Weight Charge'
 *               startValue:
 *                 type: number
 *                 description: The starting value for the weight charge.
 *                 example: 0
 *               endValue:
 *                 type: number
 *                 description: The ending value for the weight charge.
 *                 example: 100
 *               price:
 *                 type: number
 *                 description: The price for the weight charge.
 *                 example: 10
 *               chargeId:
 *                 type: integer
 *                 description: The ID of the weight charge to be updated.
 *                 example: 1
 *     responses:
 *       '200':
 *         description: Successfully updated the weight charge
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
 *                   example: 'Charge updated'
 *       '400':
 *         description: Bad Request - Missing or invalid fields
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
 *                   example: 'Invalid input'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *                   example: 'Internal Server Error'
 */

router.put('/updateweightcharge', validateToken, checkPermission, asyncMiddleware(adminController.updateWeightCharge));
// 3.4 Delete weight charge
router.put('/deleteweightcharge', validateToken, checkPermission, asyncMiddleware(adminController.deleteWeightCharge));

/* 4. Volumetric weight Charges  */
// /-------------------------------
// 4.1 Add VW charge
/**
 * @swagger
 * /admin/addvolweicharge:
 *   post:
 *     summary: Add a new volumetric weight charge
 *     description: This API allows the admin to add a new volumetric weight charge with a title, start value, end value, and price. The start and end values are converted to base units.
 *     tags:
 *       - Admin --> Charges Management
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
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
 *               title:
 *                 type: string
 *                 description: The title of the volumetric weight charge.
 *                 example: 'Standard Volumetric Weight Charge'
 *               startValue:
 *                 type: number
 *                 description: The starting value for the volumetric weight charge.
 *                 example: 0
 *               endValue:
 *                 type: number
 *                 description: The ending value for the volumetric weight charge.
 *                 example: 100
 *               price:
 *                 type: number
 *                 description: The price for the volumetric weight charge.
 *                 example: 10
 *     responses:
 *       '200':
 *         description: Successfully added a new volumetric weight charge
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
 *                   example: 'New range added'
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The ID of the newly created volumetric weight charge.
 *                       example: 1
 *                     title:
 *                       type: string
 *                       description: The title of the new volumetric weight charge.
 *                       example: 'Standard Volumetric Weight Charge'
 *                     startValue:
 *                       type: number
 *                       description: The start value for the volumetric weight charge.
 *                       example: 0
 *                     endValue:
 *                       type: number
 *                       description: The end value for the volumetric weight charge.
 *                       example: 100
 *                     price:
 *                       type: number
 *                       description: The price for the volumetric weight charge.
 *                       example: 10
 *       '400':
 *         description: Bad Request - Missing or invalid fields
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
 *                   example: 'Invalid input'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *                   example: 'Internal Server Error'
 */

router.post('/addvolweicharge', validateToken, checkPermission, asyncMiddleware(adminController.addVWCharge));
// 4.2 Get VW charge
/**
 * @swagger
 * /admin/getvolweicharge:
 *   get:
 *     summary: Get all volumetric weight charges
 *     description: This API allows the admin to fetch all volumetric weight charge details including start value, end value, price, and unit, with values converted to the base units.
 *     tags:
 *       - Admin --> Charges Management
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
 *         schema:
 *           type: string
 *           example: 'your-access-token-here'
 *     responses:
 *       '200':
 *         description: Successfully retrieved all volumetric weight charge data
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
 *                   example: 'Get all volumetric weight charges'
 *                 data:
 *                   type: object
 *                   properties:
 *                     weightCharData:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: The ID of the volumetric weight charge.
 *                             example: 1
 *                           title:
 *                             type: string
 *                             description: The title of the volumetric weight charge.
 *                             example: 'Standard Volumetric Weight Charge'
 *                           startValue:
 *                             type: number
 *                             description: The starting value for the volumetric weight charge.
 *                             example: 0
 *                           endValue:
 *                             type: number
 *                             description: The ending value for the volumetric weight charge.
 *                             example: 100
 *                           price:
 *                             type: number
 *                             description: The price for the volumetric weight charge.
 *                             example: 10
 *                           unit:
 *                             type: string
 *                             description: The unit of the volumetric weight charge.
 *                             example: 'cm'
 *                     unit:
 *                       type: string
 *                       description: The unit of measurement for volumetric weight.
 *                       example: 'cm'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *                   example: 'Internal Server Error'
 */

router.get('/getvolweicharge', validateToken, checkPermission, asyncMiddleware(adminController.getVWCharges));
// 4.3 Update VW charge
/**
 * @swagger
 * /admin/updatevolweicharge:
 *   put:
 *     summary: Update volumetric weight charge details
 *     description: This API allows the admin to update the title, start value, end value, and price of a volumetric weight charge based on the charge ID.
 *     tags:
 *       - Admin --> Charges Management
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
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
 *               title:
 *                 type: string
 *                 description: The title of the volumetric weight charge.
 *                 example: 'Standard Volumetric Weight Charge'
 *               startValue:
 *                 type: number
 *                 description: The starting value for the volumetric weight charge.
 *                 example: 0
 *               endValue:
 *                 type: number
 *                 description: The ending value for the volumetric weight charge.
 *                 example: 100
 *               price:
 *                 type: number
 *                 description: The price for the volumetric weight charge.
 *                 example: 10
 *               chargeId:
 *                 type: integer
 *                 description: The ID of the volumetric weight charge to be updated.
 *                 example: 1
 *     responses:
 *       '200':
 *         description: Successfully updated the volumetric weight charge
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
 *                   example: 'Charge updated'
 *       '400':
 *         description: Bad Request - Missing or invalid fields
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
 *                   example: 'Invalid input'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *                   example: 'Internal Server Error'
 */

router.put('/updatevolweicharge', validateToken, checkPermission, asyncMiddleware(adminController.updateVWCharge));
// 4.4 Delete VW charge
router.put('/deletevolweicharge', validateToken, checkPermission, asyncMiddleware(adminController.deleteVWCharge));

// ! Module 16: Create Driver
//1.  Register step 1
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
 * /admin/registerprofile:
 *   post:
 *     summary: Register user profile (Step 1)
 *     description: This API allows the admin to register a user profile with the provided details, including a profile image.
 *     tags:
 *       - Admin --> Drivers
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
 *         schema:
 *           type: string
 *           example: 'your-access-token-here'
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profileImage:
 *                 type: string
 *                 format: binary
 *                 description: The profile image of the user.
 *               firstName:
 *                 type: string
 *                 description: The first name of the user.
 *                 example: 'John'
 *               lastName:
 *                 type: string
 *                 description: The last name of the user.
 *                 example: 'Doe'
 *               email:
 *                 type: string
 *                 description: The email of the user.
 *                 example: 'john.doe@example.com'
 *               countryCode:
 *                 type: string
 *                 description: The country code of the user's phone number.
 *                 example: '+1'
 *               phoneNum:
 *                 type: string
 *                 description: The phone number of the user.
 *                 example: '1234567890'
 *               password:
 *                 type: string
 *                 description: The password of the user.
 *                 example: 'password123'
 *     responses:
 *       '200':
 *         description: Successfully completed the registration step 1
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
 *                   example: 'Registration Step 1: Completed'
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The ID of the newly registered user.
 *                       example: 1
 *       '400':
 *         description: Bad Request - Invalid input or missing fields
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
 *                   example: 'Invalid input or missing required fields'
 *       '409':
 *         description: Conflict - Email or phone number already exists
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
 *                   example: 'The email or phone number you entered is already taken'
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
 *                   example: 'Internal Server Error'
 */

router.post('/registerprofile',validateToken, uploadProfile.single('profileImage'), checkPermission, asyncMiddleware(adminController.registerStep1))
// 2. Update Driver Profile
/**
 * @swagger
 * /admin/updateDriverProfile:
 *   put:
 *     summary: Update driver profile
 *     description: This API allows the admin to update the driver profile information, including the profile image if it is changed.
 *     tags:
 *       - Admin --> Drivers
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
 *         schema:
 *           type: string
 *           example: 'your-access-token-here'
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profileImage:
 *                 type: string
 *                 format: binary
 *                 description: The new profile image of the driver (only required if `isProfileChanged` is `true`).
 *               firstName:
 *                 type: string
 *                 description: The first name of the driver.
 *                 example: 'John'
 *               lastName:
 *                 type: string
 *                 description: The last name of the driver.
 *                 example: 'Doe'
 *               email:
 *                 type: string
 *                 description: The email of the driver.
 *                 example: 'john.doe@example.com'
 *               countryCode:
 *                 type: string
 *                 description: The country code of the driver's phone number.
 *                 example: '+1'
 *               phoneNum:
 *                 type: string
 *                 description: The phone number of the driver.
 *                 example: '1234567890'
 *               userId:
 *                 type: integer
 *                 description: The ID of the driver to update.
 *                 example: 1
 *               isProfileChanged:
 *                 type: string
 *                 description: A flag indicating whether the profile image has changed ('true' or 'false').
 *                 example: 'true'
 *     responses:
 *       '200':
 *         description: Successfully updated the driver profile
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
 *                   example: 'Driver Profile Updated'
 *                 data:
 *                   type: object
 *                   properties:
 *                     updatedUser:
 *                       type: object
 *                       description: The updated driver profile data.
 *                       properties:
 *                         firstName:
 *                           type: string
 *                           example: 'John'
 *                         lastName:
 *                           type: string
 *                           example: 'Doe'
 *                         email:
 *                           type: string
 *                           example: 'john.doe@example.com'
 *                         countryCode:
 *                           type: string
 *                           example: '+1'
 *                         phoneNum:
 *                           type: string
 *                           example: '1234567890'
 *                         profileImage:
 *                           type: string
 *                           description: The path to the updated profile image.
 *                           example: '/uploads/profile.jpg'
 *       '400':
 *         description: Bad Request - Invalid input or missing fields
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
 *                   example: 'Invalid input or missing required fields'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *       '409':
 *         description: Conflict - Email or phone number already exists
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
 *                   example: 'The email or phone number you entered is already taken'
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
 *                   example: 'Internal Server Error'
 */

router.put('/updateDriverProfile',validateToken,uploadProfile.single('profileImage'),checkPermission,asyncMiddleware(adminController.updateDriverProfile))
// 3. Update Driver Vehicle
/**
 * @swagger
 * /admin/updateDriverVehicle:
 *   put:
 *     summary: Update driver vehicle details
 *     description: This API allows the admin to update the vehicle details of a driver, including the vehicle images if they are updated.
 *     tags:
 *       - Admin --> Drivers
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
 *         schema:
 *           type: string
 *           example: 'your-access-token-here'
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profileImage:
 *                 type: string
 *                 format: binary
 *                 description: The new profile image of the driver (optional, handled by Multer).
 *               vehicleTypeId:
 *                 type: integer
 *                 description: The type ID of the vehicle.
 *                 example: 1
 *               vehicleMake:
 *                 type: string
 *                 description: The make of the vehicle.
 *                 example: 'Toyota'
 *               vehicleModel:
 *                 type: string
 *                 description: The model of the vehicle.
 *                 example: 'Corolla'
 *               vehicleYear:
 *                 type: string
 *                 description: The manufacturing year of the vehicle.
 *                 example: '2020'
 *               vehicleColor:
 *                 type: string
 *                 description: The color of the vehicle.
 *                 example: 'Red'
 *               userId:
 *                 type: integer
 *                 description: The ID of the driver (user) whose vehicle details are being updated.
 *                 example: 1
 *               imgUpdate:
 *                 type: string
 *                 description: A flag indicating if the vehicle images are being updated ('true' or 'false').
 *                 example: 'true'
 *     responses:
 *       '200':
 *         description: Successfully updated the driver vehicle details
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
 *                   example: 'Driver Vehicle Updated Successfully'
 *       '400':
 *         description: Bad Request - Invalid input or missing fields
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
 *                   example: 'Invalid input or missing required fields'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *       '404':
 *         description: Not Found - Driver details do not exist for the provided userId
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
 *                   example: 'Driver details does not exist for this ID'
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
 *                   example: 'Internal Server Error'
 */

router.put('/updateDriverVehicle', validateToken,uploadProfile.single('profileImage'),checkPermission,asyncMiddleware(adminController.updateDriverVehicle))
// Update Driver Status
/**
 * @swagger
 * /admin/updateDriverStatus:
 *   put:
 *     summary: Update driver status
 *     description: This API allows the admin to update the driver's status, including the approval status for the driver.
 *     tags:
 *       - Admin --> Drivers
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
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
 *               userId:
 *                 type: integer
 *                 description: The ID of the driver whose status is to be updated.
 *                 example: 1
 *               status:
 *                 type: integer
 *                 description: The new status of the driver (0 for inactive, 1 for active).
 *                 example: 1
 *     responses:
 *       '200':
 *         description: Successfully updated the driver status
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
 *                   example: 'Driver Status Updated Successfully'
 *       '400':
 *         description: Bad Request - Invalid input or missing fields
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
 *                   example: 'Invalid status. Status must be 0 or 1.'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *       '404':
 *         description: Not Found - Driver details do not exist for the provided userId
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
 *                   example: 'Driver details does not exist for this ID'
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
 *                   example: 'Internal Server Error'
 */

router.put('/updateDriverStatus', validateToken,checkPermission,asyncMiddleware(adminController.updateDriverStatus))
// getSpecifiWearhouseDrivers
/**
 * @swagger
 * /admin/getSpecifiWearhouseDrivers:
 *   get:
 *     summary: Get drivers for a specific warehouse
 *     description: This API allows the admin to fetch all drivers assigned to a specific warehouse.
 *     tags:
 *       - Admin --> Drivers
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
 *         schema:
 *           type: string
 *           example: 'your-access-token-here'
 *       - in: query
 *         name: warehouseId
 *         required: true
 *         description: The ID of the warehouse to filter the drivers.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       '200':
 *         description: Successfully retrieved drivers for the specified warehouse
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
 *                   example: 'All specific warehouse drivers'
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
 *                         example: 'John'
 *                       lastName:
 *                         type: string
 *                         description: The last name of the driver.
 *                         example: 'Doe'
 *                       email:
 *                         type: string
 *                         description: The email of the driver.
 *                         example: 'john.doe@example.com'
 *                       countryCode:
 *                         type: string
 *                         description: The country code of the driver's phone number.
 *                         example: '+1'
 *                       phoneNum:
 *                         type: string
 *                         description: The phone number of the driver.
 *                         example: '1234567890'
 *       '400':
 *         description: Bad Request - Invalid input or missing fields
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
 *                   example: 'Invalid input or missing required fields'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *                   example: 'Internal Server Error'
 */

router.get('/getSpecifiWearhouseDrivers', validateToken,checkPermission,asyncMiddleware(adminController.getSpecifiWearhouseDrivers))
// 4. Get all active vehicles
router.get('/getactivevehicles', validateToken, checkPermission, asyncMiddleware(adminController.getActiveVehicleTypes))
//5. Register driver step 2
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
 * /admin/vehilceinfo:
 *   post:
 *     summary: Register vehicle details for the driver (Step 2)
 *     description: This API allows the admin to register vehicle details for the driver and upload multiple vehicle images.
 *     tags:
 *       - Admin --> Drivers
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
 *         schema:
 *           type: string
 *           example: 'your-access-token-here'
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
 *                 description: Vehicle images to be uploaded (up to 10 images).
 *               vehicleTypeId:
 *                 type: integer
 *                 description: The type ID of the vehicle.
 *                 example: 1
 *               vehicleMake:
 *                 type: string
 *                 description: The make of the vehicle.
 *                 example: 'Toyota'
 *               vehicleModel:
 *                 type: string
 *                 description: The model of the vehicle.
 *                 example: 'Corolla'
 *               vehicleYear:
 *                 type: string
 *                 description: The manufacturing year of the vehicle.
 *                 example: '2020'
 *               vehicleColor:
 *                 type: string
 *                 description: The color of the vehicle.
 *                 example: 'Red'
 *               userId:
 *                 type: integer
 *                 description: The ID of the driver to update the vehicle details for.
 *                 example: 1
 *     responses:
 *       '200':
 *         description: Successfully registered the vehicle details and images for the driver
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
 *                   example: 'Registration step 2: Completed'
 *                 data:
 *                   type: object
 *                   properties:
 *                     detailsId:
 *                       type: integer
 *                       description: The ID of the registered vehicle details.
 *                       example: 1
 *                     userId:
 *                       type: integer
 *                       description: The ID of the driver.
 *                       example: 1
 *                     imagesArr:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           image:
 *                             type: string
 *                             description: The path to the uploaded vehicle image.
 *                             example: '/uploads/vehicle_1.jpg'
 *                           status:
 *                             type: boolean
 *                             description: The status of the uploaded image.
 *                             example: true
 *       '400':
 *         description: Bad Request - Invalid input or missing fields
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
 *                   example: 'Invalid input or missing required fields'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *       '404':
 *         description: Not Found - Driver details do not exist for the provided userId
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
 *                   example: 'Driver details do not exist for this ID'
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
 *                   example: 'Internal Server Error'
 */


router.post('/vehilceinfo', validateToken,checkPermission, uploadVeh.array('vehImages', 10), asyncMiddleware(adminController.registerStep2))
//6.  Get active warehouse
/**
 * @swagger
 * /admin/activewarehouse:
 *   get:
 *     summary: Get all active warehouses
 *     description: This API allows the admin to fetch all active warehouses with a specific classification ID.
 *     tags:
 *       - Admin --> Drivers
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
 *         schema:
 *           type: string
 *           example: 'your-access-token-here'
 *     responses:
 *       '200':
 *         description: Successfully retrieved all active warehouses
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
 *                   example: 'All Active warehouses'
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The ID of the warehouse.
 *                         example: 1
 *                       companyName:
 *                         type: string
 *                         description: The name of the warehouse company.
 *                         example: 'ABC Logistics'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *                   example: 'Internal Server Error'
 */

router.get('/activewarehouse',validateToken, checkPermission, asyncMiddleware(adminController.allActiveWarehouse))

//7.  Register step 3
const uploadLicImgs = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, `./Public/Images/LicenseImages`)
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
 * /admin/licenseinfo:
 *   post:
 *     summary: Register license information for the driver (Step 3)
 *     description: This API allows the admin to register the license information for the driver, including uploading front and back images of the license.
 *     tags:
 *       - Admin --> Drivers
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
 *         schema:
 *           type: string
 *           example: 'your-access-token-here'
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
 *               licIssueDate:
 *                 type: string
 *                 description: The issue date of the driver's license.
 *                 example: '2020-01-01'
 *               licExpiryDate:
 *                 type: string
 *                 description: The expiry date of the driver's license.
 *                 example: '2025-01-01'
 *               warehouseId:
 *                 type: integer
 *                 description: The warehouse ID to assign the driver to.
 *                 example: 1
 *               userId:
 *                 type: integer
 *                 description: The ID of the driver whose license information is being updated.
 *                 example: 1
 *     responses:
 *       '200':
 *         description: Successfully registered the driver's license information
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
 *                   example: 'Driver created successfully'
 *       '400':
 *         description: Bad Request - Missing or invalid images or fields
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
 *                   example: 'Missing required fields or invalid input'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *                   example: 'Internal Server Error'
 */

router.post('/licenseinfo',validateToken, checkPermission, uploadLic.fields([{name: 'frontImage', maxCount: 1}, {name: 'backImage', maxCount: 1} ]) , asyncMiddleware(adminController.registerStep3))

/**
 * @swagger
 * /admin/updateDriverLicense:
 *   put:
 *     summary: Update driver's license information
 *     description: This API allows the admin to update the driver's license information, including uploading the front and back images of the license.
 *     tags:
 *       - Admin --> Drivers
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
 *         schema:
 *           type: string
 *           example: 'your-access-token-here'
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
 *                 description: The front image of the driver's license (optional).
 *               backImage:
 *                 type: string
 *                 format: binary
 *                 description: The back image of the driver's license (optional).
 *               userId:
 *                 type: integer
 *                 description: The ID of the driver whose license information is being updated.
 *                 example: 1
 *               licIssueDate:
 *                 type: string
 *                 description: The issue date of the driver's license.
 *                 example: '2020-01-01'
 *               licExpiryDate:
 *                 type: string
 *                 description: The expiry date of the driver's license.
 *                 example: '2025-01-01'
 *               imageUpdated:
 *                 type: string
 *                 description: A flag indicating if the license images have been updated ('true' or 'false').
 *                 example: 'true'
 *     responses:
 *       '200':
 *         description: Successfully updated the driver's license information
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
 *                   example: 'License Info Updated Successfully'
 *                 data:
 *                   type: string
 *                   example: 'License images and Dates'
 *       '400':
 *         description: Bad Request - Missing or invalid fields
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
 *                   example: 'Invalid or missing required fields'
 *       '401':
 *         description: Unauthorized - Access token is missing or invalid
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
 *       '404':
 *         description: Not Found - Driver not found for the provided userId
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
 *                   example: 'Driver not found for this ID'
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
 *                   example: 'Internal Server Error'
 */

router.put('/updateDriverLicense',validateToken,checkPermission,uploadLic.fields([{name: 'frontImage', maxCount: 1}, {name: 'backImage', maxCount: 1} ]),asyncMiddleware(adminController.updateDriverLicense))



// ! Module 17: Transporter Guys
// 1. Get alll transporters
router.get('/gettransporterguys',validateToken, checkPermission, asyncMiddleware(adminController.allTransporterGuy));
//2. Add transporter
router.post('/addtransporter', validateToken, checkPermission, uploadProfile.single('profileImage'), asyncMiddleware(adminController.addTransporter));
//3.Update transporter
router.put('/updatetransporter', validateToken, checkPermission, uploadProfile.single('profileImage'), asyncMiddleware(adminController.updateTransporter));
//4. Delete transporter
router.put('/deletetransporter', validateToken, checkPermission, asyncMiddleware(adminController.deleteTransporter))

// ! Module 18: Provinces
// 1. Get alll transporters
router.get('/getprovinces', validateToken, checkPermission, asyncMiddleware(adminController.getAllProvince));
//2. Add transporter
router.post('/addprovince', validateToken, checkPermission, asyncMiddleware(adminController.addProvince));
//3.Update transporter
router.put('/updateprovince', validateToken, checkPermission, asyncMiddleware(adminController.updateProvince));
//4. Delete transporter
router.put('/deleteprovince', validateToken, checkPermission, asyncMiddleware(adminController.deleteProvince))

// ! Module 19: Districts
//1. Get alll transporters
router.get('/getdistricts', validateToken, checkPermission, asyncMiddleware(adminController.getAllDistrict));
//2. Get all active provinces
router.get('/activeprovinces', validateToken, checkPermission, asyncMiddleware(adminController.getAllActiveProvince));
//3. Add transporter
router.post('/adddistrict', validateToken, checkPermission, asyncMiddleware(adminController.addDistrict));
//4. Update transporter
router.put('/updatedistrict', validateToken, checkPermission, asyncMiddleware(adminController.updateDistrict));
//5. Delete transporter
router.put('/deletedistrict', validateToken, checkPermission, asyncMiddleware(adminController.deleteDistrict))

// ! Module 20: Corregimiento
//1. Get alll transporters
router.get('/getcorregimiento', validateToken, checkPermission, asyncMiddleware(adminController.getAllCorregimiento));
//2. Get all active provinces
router.get('/activedistricts', validateToken, checkPermission, asyncMiddleware(adminController.getAllActiveDistricts));
//3. Add transporter
router.post('/addcorregimiento', validateToken, checkPermission, asyncMiddleware(adminController.addCorregimiento));
//4. Update transporter
router.put('/updatecorregimiento', validateToken, checkPermission, asyncMiddleware(adminController.updateCorregimiento));
//5. Delete transporter
router.put('/deletecorregimiento', validateToken, checkPermission, asyncMiddleware(adminController.deleteCorregimiento));

// ! Module 21: Bookings
//

/**
 * @swagger
 * /admin/orderDetails:
 *   get:
 *     summary: Get order details by ID or tracking ID
 *     description: This API allows the admin to retrieve the details of an order, either by its ID or tracking ID.
 *     tags:
 *       - Admin --> Booking Management
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
 *         schema:
 *           type: string
 *           example: 'your-access-token-here'
 *       - in: query
 *         name: id
 *         description: The ID of the order to retrieve.
 *         required: false
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: s
 *         description: The tracking ID of the order to retrieve.
 *         required: false
 *         schema:
 *           type: string
 *           example: 'tracking-id-123'
 *     responses:
 *       '200':
 *         description: Successfully retrieved order details
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
 *                   example: 'Booking Details'
 *                 data:
 *                   type: object
 *                   properties:
 *                     bookingId:
 *                       type: integer
 *                       example: 1
 *                     trackingId:
 *                       type: string
 *                       example: 'ABC123'
 *                     total:
 *                       type: number
 *                       example: 100.5
 *                     dropoffAddress:
 *                       type: object
 *                       properties:
 *                         streetAddress:
 *                           type: string
 *                           example: '123 Street Name'
 *                         district:
 *                           type: string
 *                           example: 'District Name'
 *                         city:
 *                           type: string
 *                           example: 'City Name'
 *                         province:
 *                           type: string
 *                           example: 'Province Name'
 *                     receiverDetails:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: 'John Doe'
 *                         email:
 *                           type: string
 *                           example: 'johndoe@example.com'
 *                         number:
 *                           type: string
 *                           example: '+123456789'
 *                     statusHistory:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           statusText:
 *                             type: string
 *                             example: 'Picked up'
 *                           date:
 *                             type: string
 *                             example: '2024-05-01'
 *                           time:
 *                             type: string
 *                             example: '14:00'
 *       '400':
 *         description: Bad Request - Invalid query parameters
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
 *                   example: 'Invalid parameters'
 *       '401':
 *         description: Unauthorized - Invalid or missing access token
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
 *                   example: 'Internal Server Error'
 */

router.get('/orderDetails', validateToken, checkPermission, asyncMiddleware(adminController.orderDetatils));

/**
 * @swagger
 * /admin/bookings:
 *   get:
 *     summary: Get all bookings with optional filters
 *     description: This API allows the admin to retrieve all bookings, with optional filters for booking type and status.
 *     tags:
 *       - Admin --> Booking Management
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
 *         schema:
 *           type: string
 *           example: 'your-access-token-here'
 *       - in: query
 *         name: bookingType
 *         description: The ID of the booking type to filter by.
 *         required: false
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: bookingStatus
 *         description: The ID of the booking status to filter by.
 *         required: false
 *         schema:
 *           type: integer
 *           example: 3
 *     responses:
 *       '200':
 *         description: Successfully retrieved all bookings
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
 *                   example: 'All Bookings'
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
 *                             example: 1
 *                           trackingId:
 *                             type: string
 *                             example: 'ABC123'
 *                           distance:
 *                             type: number
 *                             example: 100.5
 *                           total:
 *                             type: number
 *                             example: 200.0
 *                           totalWeight:
 *                             type: number
 *                             example: 50.0
 *                       dropoffAddress:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           streetAddress:
 *                             type: string
 *                             example: '123 Street'
 *                           district:
 *                             type: string
 *                             example: 'Downtown'
 *                           city:
 *                             type: string
 *                             example: 'CityName'
 *                           province:
 *                             type: string
 *                             example: 'StateName'
 *                       unit:
 *                         type: object
 *                         properties:
 *                           weight:
 *                             type: string
 *                             example: 'kg'
 *                           length:
 *                             type: string
 *                             example: 'm'
 *                           distance:
 *                             type: string
 *                             example: 'km'
 *                           currency:
 *                             type: string
 *                             example: 'USD'
 *       '400':
 *         description: Bad Request - Invalid query parameters
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
 *                   example: 'Invalid query parameters'
 *       '401':
 *         description: Unauthorized - Invalid or missing access token
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
 *                   example: 'Internal Server Error'
 */

router.get('/bookings', validateToken, checkPermission, asyncMiddleware(adminController.getAllbookings));

// ! Module 22: Dashboa rd
router.get('/dashboard/general', validateToken, checkPermission, asyncMiddleware(adminController.getGeneral));
router.get('/dashboard/graph', validateToken, checkPermission, asyncMiddleware(adminController.graphData));
// ! Module 23: Payment system for driver
//1. Get all payment systems
router.get('/driverpaymentsystem', validateToken, checkPermission, asyncMiddleware(adminController.getPaymentSystems));
//2. Update status of payment system
router.post('/updatepaymentsystem', validateToken, checkPermission, asyncMiddleware(adminController.updatePaymentSystemStatus));

// ! Module 24: Ranges for Est days

// 24.1 Get all ranges 
router.get('/getestbookingdays', validateToken, checkPermission, asyncMiddleware(adminController.getAllEstRanges));
// 24.2 Get active shipment types 
router.get('/getactiveshipments', validateToken, checkPermission, asyncMiddleware(adminController.getActiveShipmentType));
// 24.3 Add new range
router.post('/addestdays', validateToken, checkPermission, asyncMiddleware(adminController.addEstDays));
// 24.4 Update range
router.put('/updateestdays', validateToken, checkPermission, asyncMiddleware(adminController.updateEstDays));
//24.5 Delete est days range
router.put('/deleteestdays', validateToken, checkPermission, asyncMiddleware(adminController.deleteEstDays));

// ! Module 25: Address DBS
// 1. Get  structure types 
router.get('/getstructypes', validateToken, checkPermission, asyncMiddleware(adminController.getStructTypes));
// 2. Get province 
router.get('/getprovince', validateToken, checkPermission, asyncMiddleware(adminController.getProvince));
// 3. Get district based on province 
router.get('/getdistrict', validateToken, checkPermission, asyncMiddleware(adminController.getDistrict));
// 4. Get corregimiento based on district 
router.get('/getcorregimientoofdistrict', validateToken, checkPermission, asyncMiddleware(adminController.getCorregimiento));
// 5. Send request for adding address  
router.post('/createzip', validateToken, checkPermission, asyncMiddleware(adminController.createZipCode));
// 6. Bulk import DBS data  
router.post('/importdbsdata', validateToken, checkPermission, asyncMiddleware(adminController.bulkDBSData));

// ! 26. Push Notifications
/**
 * @swagger
 * /admin/pushnotifications:
 *   post:
 *     summary: Send push notifications to users
 *     description: Send push notifications to all users, only customers, or only drivers based on selection
 *     tags:
 *       - Admin --> Push Notification
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
 *               - sendTo
 *               - title
 *               - body
 *             properties:
 *               sendTo:
 *                 type: string
 *                 enum: [all, customers, drivers]
 *                 description: Target audience for the notification
 *                 example: 'all'
 *               title:
 *                 type: string
 *                 description: Title of the notification
 *                 example: 'New Feature Available'
 *               body:
 *                 type: string
 *                 description: Content of the notification
 *                 example: 'Check out our latest update with exciting new features!'
 *     responses:
 *       '200':
 *         description: Successfully sent push notifications
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
 *                   example: 'Push Notifications sent'
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       languageCheck:
 *                         type: string
 *                         example: 'en'
 *                       deviceTokens:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             tokenId:
 *                               type: string
 *                               example: 'device_token_123'
 *       '401':
 *         description: Unauthorized - Invalid or missing access token
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
 *         description: Forbidden - User doesn't have required permissions
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
 *                   example: 'Permission denied'
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
router.post('/pushnotifications', validateToken , checkPermission, asyncMiddleware(adminController.throwNot));

/**
 * @swagger
 * /admin/getnotdata:
 *   get:
 *     summary: Get all push notifications history
 *     description: Retrieves a list of all push notifications that have been sent, including their details and timestamps
 *     tags:
 *       - Admin --> Push Notification
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Authentication token
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successfully retrieved push notifications
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
 *                   example: 'All Push Notifications'
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: Unique identifier for the notification
 *                         example: 1
 *                       to:
 *                         type: string
 *                         description: Target audience of the notification
 *                         enum: [all, customers, drivers]
 *                         example: 'all'
 *                       title:
 *                         type: string
 *                         description: Title of the notification
 *                         example: 'New Feature Available'
 *                       body:
 *                         type: string
 *                         description: Content of the notification
 *                         example: 'Check out our latest update!'
 *                       at:
 *                         type: string
 *                         description: Formatted date and time when notification was sent
 *                         example: '03-15-2024 2:30 PM'
 *                 error:
 *                   type: string
 *                   example: ''
 *       '401':
 *         description: Unauthorized - Invalid or missing access token
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
 *         description: Forbidden - User doesn't have required permissions
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
 *                   example: 'Permission denied'
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
router.get('/getnotdata', validateToken, checkPermission, asyncMiddleware(adminController.getAllPushNot));

/**
 * @swagger
 * /admin/resendnotification:
 *   post:
 *     summary: Resend an existing push notification
 *     description: Resends a previously sent push notification to the same target audience group
 *     tags:
 *       - Admin --> Push Notification
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
 *               - notId
 *             properties:
 *               notId:
 *                 type: integer
 *                 description: ID of the notification to resend
 *                 example: 1
 *     responses:
 *       '200':
 *         description: Successfully resent push notification
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
 *                   example: 'Push Notifications sent'
 *                 data:
 *                   type: object
 *                   properties:
 *                     to:
 *                       type: array
 *                       description: Array of device tokens that received the notification
 *                       items:
 *                         type: string
 *                         example: 'device_token_123'
 *                 error:
 *                   type: string
 *                   example: ''
 *       '400':
 *         description: Bad Request - Invalid notification ID
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
 *                   example: 'Notification not found'
 *       '401':
 *         description: Unauthorized - Invalid or missing access token
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
 *         description: Forbidden - User doesn't have required permissions
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
 *                   example: 'Permission denied'
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

router.post('/resendnotification', validateToken , checkPermission, asyncMiddleware(adminController.resendNot));


/**
 * @swagger
 * /admin/deletenotification:
 *   put:
 *     summary: Delete a push notification
 *     description: Removes a specific push notification from the system using its ID
 *     tags:
 *       - Admin --> Push Notification
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
 *               - notId
 *             properties:
 *               notId:
 *                 type: integer
 *                 description: ID of the notification to delete
 *                 example: 1
 *     responses:
 *       '200':
 *         description: Successfully deleted push notification
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
 *                   example: 'Push Notifications deleted'
 *                 data:
 *                   type: object
 *                   example: {}
 *                 error:
 *                   type: string
 *                   example: ''
 *       '400':
 *         description: Bad Request - Invalid notification ID
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
 *                   example: 'Notification not found'
 *       '401':
 *         description: Unauthorized - Invalid or missing access token
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
 *         description: Forbidden - User doesn't have required permissions
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
 *                   example: 'Permission denied'
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
router.put('/deletenotification', validateToken, checkPermission, asyncMiddleware(adminController.delNot));

// ! 27. Employees
//1. Get all employee
/**
 * @swagger
 * /admin/getallemployees:
 *   get:
 *     summary: Get all employees
 *     description: This API allows the admin to fetch details of all employees with specific attributes such as company name, email, status, and role.
 *     tags:
 *       - Admin --> Employees
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
 *         schema:
 *           type: string
 *           example: 'your-access-token-here'
 *     responses:
 *       '200':
 *         description: Successfully retrieved all employee data
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
 *                   example: 'All Employees'
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The ID of the employee.
 *                         example: 1
 *                       companyName:
 *                         type: string
 *                         description: The name of the employee's company.
 *                         example: 'ABC Corp'
 *                       email:
 *                         type: string
 *                         description: The email address of the employee.
 *                         example: 'employee@abccorp.com'
 *                       status:
 *                         type: string
 *                         description: The employment status of the employee.
 *                         example: 'Active'
 *                       countryCode:
 *                         type: string
 *                         description: The country code of the employee's phone number.
 *                         example: '+1'
 *                       phoneNum:
 *                         type: string
 *                         description: The phone number of the employee.
 *                         example: '1234567890'
 *                       role:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             description: The role of the employee.
 *                             example: 'Admin'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *                   example: 'Internal Server Error'
 */

router.get('/getallemployees', validateToken, checkPermission, asyncMiddleware(adminController.getAllEmployees));
//2. Employee details
/**
 * @swagger
 * /admin/employeedetail:
 *   get:
 *     summary: Get employee details
 *     description: This API allows the admin to fetch detailed information about an employee based on their employee ID. It includes personal data, role, permissions, and features.
 *     tags:
 *       - Admin --> Employees
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
 *         schema:
 *           type: string
 *           example: 'your-access-token-here'
 *       - in: query
 *         name: employeeId
 *         required: true
 *         description: The ID of the employee whose details are to be fetched.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       '200':
 *         description: Successfully retrieved employee details
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
 *                   example: 'All Employees'
 *                 data:
 *                   type: object
 *                   properties:
 *                     employeeData:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           description: The ID of the employee.
 *                           example: 1
 *                         companyName:
 *                           type: string
 *                           description: The company name of the employee.
 *                           example: 'ABC Corp'
 *                         email:
 *                           type: string
 *                           description: The email address of the employee.
 *                           example: 'employee@abccorp.com'
 *                         status:
 *                           type: string
 *                           description: The employment status of the employee.
 *                           example: 'Active'
 *                         countryCode:
 *                           type: string
 *                           description: The country code of the employee's phone number.
 *                           example: '+1'
 *                         phoneNum:
 *                           type: string
 *                           description: The phone number of the employee.
 *                           example: '1234567890'
 *                         roleId:
 *                           type: integer
 *                           description: The ID of the employee's role.
 *                           example: 2
 *                         role:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                               description: The name of the employee's role.
 *                               example: 'Manager'
 *       '400':
 *         description: Bad Request - Missing or invalid parameters
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
 *                   example: 'Invalid input'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *       '404':
 *         description: Not Found - Employee data not available
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
 *                   example: 'Employee data not available'
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
 *                   example: 'Internal Server Error'
 */

router.get('/employeedetail', validateToken, checkPermission, asyncMiddleware(adminController.employeeDetail));
//3. Get active roles
/**
 * @swagger
 * /admin/activeroles:
 *   get:
 *     summary: Get all active roles
 *     description: This API allows the admin to fetch all active roles with their respective IDs and names.
 *     tags:
 *       - Admin --> Employees
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
 *         schema:
 *           type: string
 *           example: 'your-access-token-here'
 *     responses:
 *       '200':
 *         description: Successfully retrieved all active roles
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
 *                   example: 'All active roles'
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The ID of the role.
 *                         example: 1
 *                       name:
 *                         type: string
 *                         description: The name of the active role.
 *                         example: 'Admin'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *                   example: 'Internal Server Error'
 */

router.get('/activeroles', validateToken, asyncMiddleware(adminController.activeRoles));
//4. Add Employee
/**
 * @swagger
 * /admin/addemployee:
 *   post:
 *     summary: Add a new employee
 *     description: This API allows the admin to add a new employee with details such as name, email, password, phone number, and role ID. The password is hashed before saving.
 *     tags:
 *       - Admin --> Employees
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
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
 *               name:
 *                 type: string
 *                 description: The name of the employee.
 *                 example: 'John Doe'
 *               email:
 *                 type: string
 *                 description: The email address of the employee.
 *                 example: 'john.doe@example.com'
 *               password:
 *                 type: string
 *                 description: The password for the employee.
 *                 example: 'password123'
 *               countryCode:
 *                 type: string
 *                 description: The country code of the employee's phone number.
 *                 example: '+1'
 *               phoneNum:
 *                 type: string
 *                 description: The phone number of the employee.
 *                 example: '1234567890'
 *               roleId:
 *                 type: integer
 *                 description: The ID of the role assigned to the employee.
 *                 example: 2
 *     responses:
 *       '200':
 *         description: Successfully added the new employee
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
 *                   example: 'Employee Added'
 *       '400':
 *         description: Bad Request - Missing or invalid fields
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
 *                   example: 'Invalid input'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *                   example: 'Error message here'
 */
router.post('/addemployee', validateToken, checkPermission, asyncMiddleware(adminController.addEmployee));
//5. Update employee

/**
 * @swagger
 * /admin/employeeupdate:
 *   put:
 *     summary: Update employee details
 *     description: This API allows the admin to update an employee's details, such as name, email, phone number, role, and optionally their password.
 *     tags:
 *       - Admin --> Employees
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
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
 *               name:
 *                 type: string
 *                 description: The name of the employee.
 *                 example: 'John Doe'
 *               email:
 *                 type: string
 *                 description: The email address of the employee.
 *                 example: 'john.doe@example.com'
 *               password:
 *                 type: string
 *                 description: The new password for the employee (if updating).
 *                 example: 'newpassword123'
 *               countryCode:
 *                 type: string
 *                 description: The country code of the employee's phone number.
 *                 example: '+1'
 *               phoneNum:
 *                 type: string
 *                 description: The phone number of the employee.
 *                 example: '1234567890'
 *               roleId:
 *                 type: integer
 *                 description: The ID of the role assigned to the employee.
 *                 example: 2
 *               updatePassword:
 *                 type: boolean
 *                 description: Flag to determine whether the password should be updated (true or false).
 *                 example: true
 *               emplId:
 *                 type: integer
 *                 description: The ID of the employee to be updated.
 *                 example: 1
 *     responses:
 *       '200':
 *         description: Successfully updated the employee details
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
 *                   example: 'Employee data updated'
 *       '400':
 *         description: Bad Request - Missing or invalid fields
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
 *                   example: 'Invalid input'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *       '404':
 *         description: Not Found - Employee with provided ID not found
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
 *                   example: 'Employee not found'
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
 *                   example: 'Internal Server Error'
 */

router.put('/employeeupdate', validateToken, checkPermission, asyncMiddleware(adminController.employeeUpdate));
//6. Change employee status
/**
 * @swagger
 * /admin/changestatus:
 *   put:
 *     summary: Change employee status
 *     description: This API allows the admin to update the status of an employee (active or inactive) based on the employee ID.
 *     tags:
 *       - Admin --> Employees
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
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
 *               status:
 *                 type: boolean
 *                 description: The new status of the employee (true for active, false for inactive).
 *                 example: true
 *               emplId:
 *                 type: integer
 *                 description: The ID of the employee whose status is to be updated.
 *                 example: 1
 *     responses:
 *       '200':
 *         description: Successfully updated the employee status
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
 *                   example: 'Employee status updated'
 *       '400':
 *         description: Bad Request - Missing or invalid fields
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
 *                   example: 'Invalid input'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *       '404':
 *         description: Not Found - Employee with provided ID not found
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
 *                   example: 'Employee not found'
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
 *                   example: 'Internal Server Error'
 */

router.put('/changestatus', validateToken, checkPermission, asyncMiddleware(adminController.employeeStatus));

// ! 28. Roles & Permissions
// 1. Get all roles
/**
 * @swagger
 * /admin/allroles:
 *   get:
 *     summary: Get all roles
 *     description: This API allows the admin to fetch details of all roles, including their IDs, names, and statuses.
 *     tags:
 *       - Admin --> Roles & Permissions
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
 *         schema:
 *           type: string
 *           example: 'your-access-token-here'
 *     responses:
 *       '200':
 *         description: Successfully retrieved all roles
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
 *                   example: 'All Roles'
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The ID of the role.
 *                         example: 1
 *                       name:
 *                         type: string
 *                         description: The name of the role.
 *                         example: 'Admin'
 *                       status:
 *                         type: string
 *                         description: The status of the role (e.g., active or inactive).
 *                         example: 'active'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *                   example: 'Internal Server Error'
 */

router.get('/allroles', validateToken, checkPermission, asyncMiddleware(adminController.allRoles));
// 2. Get permissions associated with a role
/**
 * @swagger
 * /admin/rolepermissions:
 *   get:
 *     summary: Get permissions for a specific role
 *     description: This API allows the admin to fetch all permissions assigned to a specific role, including feature access and permission types like create, read, update, and delete.
 *     tags:
 *       - Admin --> Roles & Permissions
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
 *         schema:
 *           type: string
 *           example: 'your-access-token-here'
 *       - in: query
 *         name: roleId
 *         required: true
 *         description: The ID of the role whose permissions need to be fetched.
 *         schema:
 *           type: integer
 *           example: 2
 *     responses:
 *       '200':
 *         description: Successfully retrieved all permissions for the role
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
 *                   example: 'All permissions of a role'
 *                 data:
 *                   type: object
 *                   properties:
 *                     rolePermissions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           featureId:
 *                             type: integer
 *                             description: The ID of the feature.
 *                             example: 1
 *                           featureTitle:
 *                             type: string
 *                             description: The title of the feature.
 *                             example: 'Create Item'
 *                           permissions:
 *                             type: object
 *                             properties:
 *                               create:
 *                                 type: boolean
 *                                 description: Whether the role has create permission for the feature.
 *                                 example: true
 *                               read:
 *                                 type: boolean
 *                                 description: Whether the role has read permission for the feature.
 *                                 example: true
 *                               update:
 *                                 type: boolean
 *                                 description: Whether the role has update permission for the feature.
 *                                 example: false
 *                               delete:
 *                                 type: boolean
 *                                 description: Whether the role has delete permission for the feature.
 *                                 example: false
 *       '400':
 *         description: Bad Request - Missing or invalid fields
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
 *                   example: 'Invalid input'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *                   example: 'Internal Server Error'
 */

router.get('/rolepermissions', validateToken, checkPermission, asyncMiddleware(adminController.roleDetails));
// 3. Active features
/**
 * @swagger
 * /admin/activefeatures:
 *   get:
 *     summary: Get all active features
 *     description: This API allows the admin to fetch all active features, including their IDs and titles, along with the associated permissions (create, read, update, delete).
 *     tags:
 *       - Admin --> Roles & Permissions
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
 *         schema:
 *           type: string
 *           example: 'your-access-token-here'
 *     responses:
 *       '200':
 *         description: Successfully retrieved all active features
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
 *                   example: 'All active features'
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
 *                         example: 'Create Item'
 *                       permissions:
 *                         type: object
 *                         properties:
 *                           create:
 *                             type: boolean
 *                             description: Whether the feature has create permission.
 *                             example: true
 *                           read:
 *                             type: boolean
 *                             description: Whether the feature has read permission.
 *                             example: true
 *                           update:
 *                             type: boolean
 *                             description: Whether the feature has update permission.
 *                             example: false
 *                           delete:
 *                             type: boolean
 *                             description: Whether the feature has delete permission.
 *                             example: false
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *                   example: 'Internal Server Error'
 */

router.get('/activefeatures', validateToken, asyncMiddleware(adminController.activeFeatures));
// 3. Add new role
/**
 * @swagger
 * /admin/addrole:
 *   post:
 *     summary: Add a new role
 *     description: This API allows the admin to add a new role along with its associated permissions for features such as create, read, update, and delete.
 *     tags:
 *       - Admin --> Roles & Permissions
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
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
 *               name:
 *                 type: string
 *                 description: The name of the new role.
 *                 example: 'Admin'
 *               permissionRole:
 *                 type: array
 *                 description: List of permissions associated with the role.
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The ID of the feature.
 *                       example: 1
 *                     permissions:
 *                       type: object
 *                       properties:
 *                         create:
 *                           type: boolean
 *                           description: Permission to create the feature.
 *                           example: true
 *                         read:
 *                           type: boolean
 *                           description: Permission to read the feature.
 *                           example: true
 *                         update:
 *                           type: boolean
 *                           description: Permission to update the feature.
 *                           example: false
 *                         delete:
 *                           type: boolean
 *                           description: Permission to delete the feature.
 *                           example: false
 *     responses:
 *       '200':
 *         description: Successfully added the new role
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
 *                   example: 'Role added'
 *       '400':
 *         description: Bad Request - Missing or invalid fields
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
 *                   example: 'Invalid input'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *                   example: 'Error adding role'
 */
router.post('/addrole', validateToken, checkPermission, asyncMiddleware(adminController.addRole));
// 4. Update a role
/**
 * @swagger
 * /admin/updaterole:
 *   put:
 *     summary: Update role details
 *     description: This API allows the admin to update a role's name and associated permissions, while ensuring the role name remains unique.
 *     tags:
 *       - Admin --> Roles & Permissions
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
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
 *               name:
 *                 type: string
 *                 description: The updated name of the role.
 *                 example: 'Admin'
 *               permissionRole:
 *                 type: array
 *                 description: List of permissions to be assigned to the role.
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The ID of the feature.
 *                       example: 1
 *                     permissions:
 *                       type: object
 *                       properties:
 *                         create:
 *                           type: boolean
 *                           description: Permission to create the feature.
 *                           example: true
 *                         read:
 *                           type: boolean
 *                           description: Permission to read the feature.
 *                           example: true
 *                         update:
 *                           type: boolean
 *                           description: Permission to update the feature.
 *                           example: false
 *                         delete:
 *                           type: boolean
 *                           description: Permission to delete the feature.
 *                           example: false
 *               roleId:
 *                 type: integer
 *                 description: The ID of the role to be updated.
 *                 example: 2
 *     responses:
 *       '200':
 *         description: Successfully updated the role and permissions
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
 *                   example: 'Role updated'
 *       '400':
 *         description: Bad Request - Missing or invalid fields
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
 *                   example: 'Invalid input'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *       '404':
 *         description: Not Found - Role with provided ID not found
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
 *                   example: 'Role not found'
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
 *                   example: 'Error updating role'
 */

router.put('/updaterole', validateToken, checkPermission, asyncMiddleware(adminController.updateRole));
// 5. Update status of role
/**
 * @swagger
 * /admin/updatestatusrole:
 *   put:
 *     summary: Update role status
 *     description: This API allows the admin to update the status of a role (active or inactive) based on the role ID.
 *     tags:
 *       - Admin --> Roles & Permissions   
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
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
 *               status:
 *                 type: boolean
 *                 description: The new status of the role (true for active, false for inactive).
 *                 example: true
 *               roleId:
 *                 type: integer
 *                 description: The ID of the role whose status is to be updated.
 *                 example: 2
 *     responses:
 *       '200':
 *         description: Successfully updated the role status
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
 *                   example: 'Role Status updated'
 *       '400':
 *         description: Bad Request - Missing or invalid fields
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
 *                   example: 'Invalid input'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *       '404':
 *         description: Not Found - Role with provided ID not found
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
 *                   example: 'Role not found'
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
 *                   example: 'Error updating role'
 */

router.put('/updatestatusrole', validateToken, checkPermission, asyncMiddleware(adminController.updateRoleStatus));


// ! 29. Logistic companies
//*_________________________________________________________________________________________
const uploadLogo = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, `./Public/Logos`)
    },
    filename: (req, file, cb) => {
        cb(null, 'companyLogo-' + Date.now() +  path.extname(file.originalname))
    }
})
const uploadcompanyLogo = multer({
    storage: uploadLogo,
});
// 1. Get all Logistic companies
/**
 * @swagger
 * /admin/getLogCompanies:
 *   get:
 *     summary: Get all logistic companies
 *     description: This API allows the admin to fetch the list of all logistic companies.
 *     tags:
 *       - Admin --> Logistic Companies
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
 *         schema:
 *           type: string
 *           example: 'your-access-token-here'
 *     responses:
 *       '200':
 *         description: Successfully retrieved the list of logistic companies
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
 *                   example: 'Logistic companies'
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The ID of the logistic company.
 *                         example: 1
 *                       key:
 *                         type: string
 *                         description: The key associated with the logistic company.
 *                         example: 'company-xyz'
 *                       information:
 *                         type: string
 *                         description: Additional information about the logistic company.
 *                         example: 'This is a global logistic company specializing in freight services.'
 *                       value:
 *                         type: string
 *                         description: A value associated with the logistic company.
 *                         example: 'value-xyz'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *                   example: 'Internal Server Error'
 */
router.get('/getLogCompanies',validateToken, checkPermission, asyncMiddleware(adminController.getLogCompanies));
// 2. Add Logistic Company
/**
 * @swagger
 * /admin/addLogCompany:
 *   post:
 *     summary: Add a new logistic company
 *     description: This API allows the admin to add a new logistic company along with its logo.
 *     tags:
 *       - Admin --> Logistic Companies
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
 *         schema:
 *           type: string
 *           example: 'your-access-token-here'
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: The logo image of the logistic company.
 *               title:
 *                 type: string
 *                 description: The title of the logistic company.
 *                 example: 'XYZ Logistics'
 *               description:
 *                 type: string
 *                 description: The description of the logistic company.
 *                 example: 'XYZ Logistics is a leading provider of shipping and freight services.'
 *               flashCharges:
 *                 type: number
 *                 format: float
 *                 description: The flash charges for the logistic company.
 *                 example: 50.75
 *               standardCharges:
 *                 type: number
 *                 format: float
 *                 description: The standard charges for the logistic company.
 *                 example: 100.00
 *               divisor:
 *                 type: number
 *                 description: The divisor used for the logistic company charges.
 *                 example: 5
 *     responses:
 *       '200':
 *         description: Successfully added the logistic company
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
 *                   example: 'New Company added'
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The ID of the new logistic company.
 *                       example: 1
 *                     title:
 *                       type: string
 *                       description: The title of the logistic company.
 *                       example: 'XYZ Logistics'
 *                     description:
 *                       type: string
 *                       description: The description of the logistic company.
 *                       example: 'XYZ Logistics is a leading provider of shipping and freight services.'
 *                     flashCharges:
 *                       type: number
 *                       format: float
 *                       description: The flash charges for the logistic company.
 *                       example: 50.75
 *                     standardCharges:
 *                       type: number
 *                       format: float
 *                       description: The standard charges for the logistic company.
 *                       example: 100.00
 *                     status:
 *                       type: boolean
 *                       description: The status of the logistic company.
 *                       example: true
 *                     divisor:
 *                       type: number
 *                       description: The divisor used for the logistic company charges.
 *                       example: 5
 *                     logo:
 *                       type: string
 *                       description: The path to the logo image of the logistic company.
 *                       example: '/uploads/logistic-company-logo.jpg'
 *       '400':
 *         description: Bad Request - Invalid input or missing fields
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
 *                   example: 'Invalid input or missing required fields'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *       '409':
 *         description: Conflict - Logistic company with the same title already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: '2'
 *                 message:
 *                   type: string
 *                   example: 'A Logistic company with the same name already exists. Please try some other name.'
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
 *                   example: 'Internal Server Error'
 */

router.post('/addLogCompany', validateToken, checkPermission,uploadcompanyLogo.single('image'), asyncMiddleware(adminController.addLogCompany));
// 3. Update Logistic Company

/**
 * @swagger
 * /admin/updateLogCompany:
 *   put:
 *     summary: Update a logistic company
 *     description: This API allows the admin to update the details of an existing logistic company, including its logo if required.
 *     tags:
 *       - Admin --> Logistic Companies
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
 *         schema:
 *           type: string
 *           example: 'your-access-token-here'
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               cId:
 *                 type: integer
 *                 description: The ID of the logistic company to be updated.
 *                 example: 1
 *               updateImage:
 *                 type: string
 *                 description: A flag indicating whether the image should be updated ('true' or 'false').
 *                 example: 'true'
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: The new logo image of the logistic company (only required if updateImage is 'true').
 *               title:
 *                 type: string
 *                 description: The new title of the logistic company.
 *                 example: 'XYZ Logistics International'
 *               description:
 *                 type: string
 *                 description: The new description of the logistic company.
 *                 example: 'XYZ Logistics International is a leading provider of international shipping services.'
 *               flashCharges:
 *                 type: number
 *                 format: float
 *                 description: The new flash charges for the logistic company.
 *                 example: 75.50
 *               standardCharges:
 *                 type: number
 *                 format: float
 *                 description: The new standard charges for the logistic company.
 *                 example: 150.00
 *               divisor:
 *                 type: number
 *                 description: The new divisor for the logistic company charges.
 *                 example: 10
 *     responses:
 *       '200':
 *         description: Successfully updated the logistic company
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
 *                   example: 'Company updated'
 *       '400':
 *         description: Bad Request - Invalid input or missing fields
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
 *                   example: 'Invalid input or missing required fields'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *       '409':
 *         description: Conflict - Logistic company with the same title already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: '2'
 *                 message:
 *                   type: string
 *                   example: 'A Logistic company with the same name already exists. Please try some other name.'
 *       '404':
 *         description: Not Found - The logistic company with the provided ID does not exist
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
 *                   example: 'Company doesnt exist'
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
 *                   example: 'Internal Server Error'
 */

router.put('/updateLogCompany', validateToken, checkPermission,uploadcompanyLogo.single('image'), asyncMiddleware(adminController.updateLogCompany));
// 4. Delete Logistic Company
/**
 * @swagger
 * /admin/changeCompanyStatus:
 *   put:
 *     summary: Change the status of a logistic company
 *     description: This API allows the admin to change the status of a logistic company.
 *     tags:
 *       - Admin --> Logistic Companies
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
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
 *               companyId:
 *                 type: integer
 *                 description: The ID of the logistic company whose status needs to be updated.
 *                 example: 1
 *               status:
 *                 type: boolean
 *                 description: The new status of the logistic company (true = active, false = inactive).
 *                 example: true
 *     responses:
 *       '200':
 *         description: Successfully changed the status of the logistic company
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
 *                   example: 'Category status changed'
 *       '400':
 *         description: Bad Request - Invalid input or missing fields
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
 *                   example: 'Invalid input or missing required fields'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *                   example: 'Internal Server Error'
 */

router.put('/changeCompanyStatus', validateToken, checkPermission, asyncMiddleware(adminController.changeLogCompanyStatus));
// 5. Get Logistic Company Charges
/**
 * @swagger
 * /admin/getLogCharges:
 *   get:
 *     summary: Get charges for a logistic company
 *     description: This API allows the admin to fetch charges related to a specific logistic company, optionally filtered by logistic company ID and flash charges status.
 *     tags:
 *       - Admin --> Logistic Companies
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
 *         schema:
 *           type: string
 *           example: 'your-access-token-here'
 *       - in: query
 *         name: logisticCompanyId
 *         required: false
 *         description: The ID of the logistic company to filter the charges.
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: flash
 *         required: false
 *         description: Filter charges by flash status (true/false).
 *         schema:
 *           type: boolean
 *           example: true
 *     responses:
 *       '200':
 *         description: Successfully retrieved charges for the logistic company
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
 *                   example: 'success'
 *                 data:
 *                   type: object
 *                   properties:
 *                     charges:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: The ID of the charge.
 *                             example: 1
 *                           title:
 *                             type: string
 *                             description: The title of the logistic company charge.
 *                             example: 'Standard Shipping Charge'
 *                           flash:
 *                             type: boolean
 *                             description: Whether the charge is flash-based.
 *                             example: true
 *                           logisticCompanyId:
 *                             type: integer
 *                             description: The ID of the associated logistic company.
 *                             example: 1
 *                           deleted:
 *                             type: boolean
 *                             description: Whether the charge is deleted.
 *                             example: false
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *                   example: 'Internal Server Error'
 */

router.get('/getLogCharges',validateToken,checkPermission,asyncMiddleware(adminController.getChargesForLog))
// 6. Update Logistic Company Charges
/**
 * @swagger
 * /admin/updateLogCharges:
 *   put:
 *     summary: Update charges for a logistic company
 *     description: This API allows the admin to update the charges related to a logistic company.
 *     tags:
 *       - Admin --> Logistic Companies
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
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
 *               id:
 *                 type: integer
 *                 description: The ID of the charge to be updated.
 *                 example: 1
 *               title:
 *                 type: string
 *                 description: The title of the logistic company charge.
 *                 example: 'Updated Shipping Charge'
 *               flash:
 *                 type: boolean
 *                 description: Whether the charge is flash-based.
 *                 example: true
 *               logisticCompanyId:
 *                 type: integer
 *                 description: The ID of the associated logistic company.
 *                 example: 1
 *               deleted:
 *                 type: boolean
 *                 description: Whether the charge is deleted.
 *                 example: false
 *     responses:
 *       '200':
 *         description: Successfully updated the charges for the logistic company
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
 *                   example: 'Data updated successfully'
 *       '400':
 *         description: Bad Request - Invalid input or missing fields
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
 *                   example: 'Invalid input or missing required fields'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *       '404':
 *         description: Not Found - The logistic company charge with the provided ID does not exist
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
 *                   example: 'Logistic company not found. Please enter valid data.'
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
 *                   example: 'Internal Server Error'
 */

router.put('/updateLogCharges',validateToken,checkPermission,asyncMiddleware(adminController.updateChargesForLog))
// 7. Add Logistic Company Charges
/**
 * @swagger
 * /admin/addChargesForLog:
 *   post:
 *     summary: Add charges for a logistic company
 *     description: This API allows the admin to add new charges for a logistic company.
 *     tags:
 *       - Admin --> Logistic Companies
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
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
 *               startValue:
 *                 type: number
 *                 description: The starting value for the charge range.
 *                 example: 0
 *               endValue:
 *                 type: number
 *                 description: The ending value for the charge range.
 *                 example: 1000
 *               charges:
 *                 type: number
 *                 description: The charge amount for the given range.
 *                 example: 150
 *               flash:
 *                 type: boolean
 *                 description: Whether the charge is flash-based.
 *                 example: true
 *               logisticCompanyId:
 *                 type: integer
 *                 description: The ID of the associated logistic company.
 *                 example: 1
 *               bookingType:
 *                 type: string
 *                 description: The type of booking (e.g., "standard", "express").
 *                 example: "express"
 *     responses:
 *       '200':
 *         description: Successfully added new charges for the logistic company
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
 *                   example: 'New charges added successfully'
 *                 data:
 *                   type: object
 *                   properties:
 *                     newCharges:
 *                       type: object
 *                       description: The newly added charges for the logistic company.
 *                       properties:
 *                         id:
 *                           type: integer
 *                           description: The ID of the newly added charge.
 *                           example: 1
 *                         startValue:
 *                           type: number
 *                           description: The starting value of the charge range.
 *                           example: 0
 *                         endValue:
 *                           type: number
 *                           description: The ending value of the charge range.
 *                           example: 1000
 *                         charges:
 *                           type: number
 *                           description: The charge amount for the range.
 *                           example: 150
 *                         flash:
 *                           type: boolean
 *                           description: Whether the charge is flash-based.
 *                           example: true
 *                         logisticCompanyId:
 *                           type: integer
 *                           description: The ID of the associated logistic company.
 *                           example: 1
 *                         bookingType:
 *                           type: string
 *                           description: The type of booking.
 *                           example: "express"
 *       '400':
 *         description: Bad Request - Invalid input or missing fields
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
 *                   example: 'Invalid input or missing required fields'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *                   example: 'Internal Server Error'
 */

router.post('/addChargesForLog',validateToken,checkPermission,asyncMiddleware(adminController.addChargesForLog))
// 8. Update status of Logistic Company Charges
/**
 * @swagger
 * /admin/updateStatusChargesForLog:
 *   put:
 *     summary: Update the status of charges for a logistic company
 *     description: This API allows the admin to update the status of charges for a specific logistic company.
 *     tags:
 *       - Admin --> Logistic Companies
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
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
 *               id:
 *                 type: integer
 *                 description: The ID of the charge to update.
 *                 example: 1
 *               status:
 *                 type: boolean
 *                 description: The new status of the charge (true = active, false = inactive).
 *                 example: true
 *     responses:
 *       '200':
 *         description: Successfully updated the status of the charge
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
 *                   example: 'Updated successfully'
 *       '400':
 *         description: Bad Request - Invalid input or missing fields
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
 *                   example: 'Invalid input or missing required fields'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *       '404':
 *         description: Not Found - The charge with the provided ID does not exist
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
 *                   example: 'Logistic company charge not found. Please enter valid data.'
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
 *                   example: 'Internal Server Error'
 */

router.put('/updateStatusChargesForLog',validateToken,checkPermission,asyncMiddleware(adminController.updateStatusChargesForLog))
// 9. delete Logistic Company Charges
/**
 * @swagger
 * /admin/deleteChargesForLog:
 *   put:
 *     summary: Delete charges for a logistic company
 *     description: This API allows the admin to delete (mark as deleted) charges for a specific logistic company.
 *     tags:
 *       - Admin --> Logistic Companies
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
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
 *               chargeId:
 *                 type: integer
 *                 description: The ID of the charge to be deleted (marked as deleted).
 *                 example: 1
 *     responses:
 *       '200':
 *         description: Successfully marked the charge as deleted
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
 *                   example: 'Updated successfully'
 *       '400':
 *         description: Bad Request - Invalid input or missing fields
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
 *                   example: 'Invalid input or missing required fields'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *       '404':
 *         description: Not Found - The charge with the provided ID does not exist
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
 *                   example: 'Logistic company charge not found. Please enter valid data.'
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
 *                   example: 'Internal Server Error'
 */

router.put('/deleteChargesForLog',validateToken,checkPermission,asyncMiddleware(adminController.deleteChargesForLog))
// 10. get all active Logistic Componies
/**
 * @swagger
 * /admin/activeLog:
 *   get:
 *     summary: Get active logistic companies
 *     description: This API allows the admin to fetch all active logistic companies with their ID and title.
 *     tags:
 *       - Admin --> Logistic Companies
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
 *         schema:
 *           type: string
 *           example: 'your-access-token-here'
 *     responses:
 *       '200':
 *         description: Successfully retrieved the list of active logistic companies
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
 *                   example: 'Success'
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The ID of the logistic company.
 *                         example: 1
 *                       title:
 *                         type: string
 *                         description: The title of the logistic company.
 *                         example: 'XYZ Logistics'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *                   example: 'Internal Server Error'
 */

router.get('/activeLog',validateToken,checkPermission,asyncMiddleware(adminController.activeLog))


// ! Module: Webpolicy
//*_______________________________________________________________________
/**
 * @swagger
 * /admin/privacypolicy:
 *   get:
 *     summary: Get the privacy policy
 *     description: This API allows the admin to fetch the privacy policy data.
 *     tags:
 *       - Admin --> Web Policy
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
 *         schema:
 *           type: string
 *           example: 'your-access-token-here'
 *     responses:
 *       '200':
 *         description: Successfully fetched the privacy policy
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
 *                   example: 'Privacy Policy'
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     title:
 *                       type: string
 *                       example: 'Privacy Policy'
 *                     value:
 *                       type: string
 *                       example: 'Your privacy is important to us...'
 *       '404':
 *         description: Privacy Policy Not Found - The privacy policy is not available.
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
 *                   example: 'Privacy Policy Not Found'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *                   example: 'Internal Server Error'
 */

router.get('/privacypolicy', validateToken, checkPermission, asyncMiddleware(adminController.getPrivacyPolicy));
/**
 * @swagger
 * /admin/updateprivacypolicy:
 *   put:
 *     summary: Update the privacy policy
 *     description: This API allows the admin to update the privacy policy content.
 *     tags:
 *       - Admin --> Web Policy
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
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
 *               content:
 *                 type: string
 *                 description: The new content for the privacy policy.
 *                 example: 'We have updated our privacy policy to ensure greater transparency...'
 *     responses:
 *       '200':
 *         description: Successfully updated the privacy policy
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
 *                   example: 'Privacy Policy Updated'
 *                 data:
 *                   type: object
 *                   additionalProperties: true
 *       '400':
 *         description: Bad Request - Invalid data or missing content
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
 *                   example: 'Invalid data or missing fields'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *                   example: 'Internal Server Error'
 */

router.put('/updateprivacypolicy', validateToken, checkPermission, asyncMiddleware(adminController.updatePrivacyPolicy));
/**
 * @swagger
 * /admin/termsconditions:
 *   get:
 *     summary: Get the terms and conditions
 *     description: This API allows the admin to fetch the current terms and conditions.
 *     tags:
 *       - Admin --> Web Policy 
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
 *         schema:
 *           type: string
 *           example: 'your-access-token-here'
 *     responses:
 *       '200':
 *         description: Successfully retrieved the terms and conditions
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
 *                   example: 'Terms & Conditions'
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     title:
 *                       type: string
 *                       example: 'Terms & Conditions'
 *                     value:
 *                       type: string
 *                       example: 'These terms govern the usage of our services...'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *                   example: 'Internal Server Error'
 */

router.get('/termsconditions', validateToken, checkPermission, asyncMiddleware(adminController.getTermsConditions));
/**
 * @swagger
 * /admin/updatetermsconditions:
 *   put:
 *     summary: Update the terms and conditions
 *     description: This API allows the admin to update the current terms and conditions.
 *     tags:
 *       - Admin --> Web Policy
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
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
 *               content:
 *                 type: string
 *                 description: The new content of the terms and conditions.
 *                 example: 'Updated terms and conditions content here...'
 *     responses:
 *       '200':
 *         description: Successfully updated the terms and conditions
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
 *                   example: 'Terms & Conditions Updated'
 *                 data:
 *                   type: object
 *                   properties:
 *                     content:
 *                       type: string
 *                       example: 'Updated terms and conditions content here...'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *                   example: 'Internal Server Error'
 */

router.put('/updatetermsconditions', validateToken, checkPermission, asyncMiddleware(adminController.updateTermsConditions));

/**
 * @swagger
 * /admin/all-booking-statuses:
 *   get:
 *     summary: Get all booking statuses
 *     description: Retrieves a list of all available booking statuses with their IDs and titles
 *     tags:
 *       - Admin --> Tracking
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Authentication token
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successfully retrieved booking statuses
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
 *                   example: 'Success'
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The unique identifier of the booking status
 *                         example: 1
 *                       title:
 *                         type: string
 *                         description: The title of the booking status
 *                         example: 'Pending'
 *       '401':
 *         description: Unauthorized - Invalid or missing access token
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
router.get('/all-booking-statuses',validateToken,asyncMiddleware(userController.allBookingStatus))

/**
 * @swagger
 * /admin/update-booking-status:
 *   put:
 *     summary: Update booking status
 *     description: Updates the status of a specific booking
 *     tags:
 *       - Admin --> Tracking
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
 *               - bookingId
 *               - bookingStatusId
 *             properties:
 *               bookingId:
 *                 type: integer
 *                 description: ID of the booking to update
 *                 example: 1
 *               bookingStatusId:
 *                 type: integer
 *                 description: ID of the new booking status
 *                 example: 2
 *     responses:
 *       '200':
 *         description: Successfully updated booking status
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
 *                   example: 'Success'
 *                 data:
 *                   type: object
 *                   properties:
 *                     updated:
 *                       type: array
 *                       description: Number of records updated (0 or 1)
 *                       example: [1]
 *       '400':
 *         description: Bad Request - Invalid input parameters
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
 *                   example: 'Invalid booking ID or status ID'
 *       '401':
 *         description: Unauthorized - Invalid or missing access token
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
router.put('/update-booking-status',validateToken,asyncMiddleware(userController.updateBookingStatus))

/**
 * @swagger
 * /admin/trackorder:
 *   get:
 *     summary: Get detailed order tracking information
 *     description: Retrieves comprehensive details about an order including tracking history, package details, addresses, and status
 *     tags:
 *       - Admin --> Tracking
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Authentication token
 *         schema:
 *           type: string
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *         description: Booking ID (either id or s must be provided)
 *       - in: query
 *         name: s
 *         schema:
 *           type: string
 *         description: Tracking ID (either id or s must be provided)
 *     responses:
 *       '200':
 *         description: Successfully retrieved order details
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
 *                   example: 'Booking Details'
 *                 data:
 *                   type: object
 *                   properties:
 *                     bookingId:
 *                       type: integer
 *                       example: 1
 *                     trackingId:
 *                       type: string
 *                       example: 'TRK123456'
 *                     consolidation:
 *                       type: boolean
 *                       example: false
 *                     logisticCompanyTrackingNum:
 *                       type: string
 *                       example: 'LC123456'
 *                     total:
 *                       type: number
 *                       example: 150.00
 *                     bookingStatus:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         title:
 *                           type: string
 *                           example: 'In Transit'
 *                     distance:
 *                       type: number
 *                       example: 25.5
 *                     cancelCharges:
 *                       type: string
 *                       example: '37.50'
 *                     bookingType:
 *                       type: string
 *                       example: 'Standard'
 *                     logisticCompany:
 *                       type: object
 *                       properties:
 *                         title:
 *                           type: string
 *                           example: 'Express Logistics'
 *                         logo:
 *                           type: string
 *                           example: '/uploads/logo.png'
 *                         divisor:
 *                           type: number
 *                           example: 5000
 *                     shipmentType:
 *                       type: string
 *                       example: 'Express'
 *                     pickup:
 *                       type: object
 *                       properties:
 *                         address:
 *                           type: string
 *                         lat:
 *                           type: number
 *                           example: 25.2048
 *                         lng:
 *                           type: number
 *                           example: 55.2708
 *                     dropoff:
 *                       type: object
 *                       properties:
 *                         date:
 *                           type: string
 *                           example: '2024-03-20'
 *                         startTime:
 *                           type: string
 *                           example: '09:00'
 *                         endTime:
 *                           type: string
 *                           example: '18:00'
 *                         address:
 *                           type: string
 *                         lat:
 *                           type: number
 *                         lng:
 *                           type: number
 *                     deliveryType:
 *                       type: object
 *                       properties:
 *                         title:
 *                           type: string
 *                           example: 'Standard Delivery'
 *                     packages:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           trackingNum:
 *                             type: string
 *                           weight:
 *                             type: number
 *                           volume:
 *                             type: number
 *                     senderDetails:
 *                       type: object
 *                       properties:
 *                         number:
 *                           type: string
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         virtualBoxNumber:
 *                           type: string
 *                     receiverDetails:
 *                       type: object
 *                       properties:
 *                         number:
 *                           type: string
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                     unit:
 *                       type: object
 *                       properties:
 *                         symbol:
 *                           type: string
 *                           example: 'kg'
 *                     history:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           bookingStatusId:
 *                             type: integer
 *                           statusText:
 *                             type: string
 *                           description:
 *                             type: string
 *                           date:
 *                             type: string
 *                           time:
 *                             type: string
 *                           status:
 *                             type: boolean
 *       '400':
 *         description: Bad Request - Invalid tracking number or ID
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
 *                   example: 'Wrong tracking Number'
 *       '401':
 *         description: Unauthorized - Invalid or missing access token
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
router.get('/trackorder',validateToken,asyncMiddleware(adminController.orderDetatils))
// ! Module 10: Restricted Items
const uploadItem = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, `./Public/RestrictedItems`)
    },
    filename: (req, file, cb) => {
        cb(null, 'restricteditem-' + Date.now() +  path.extname(file.originalname))
    }
})
const uploadItemImage = multer({
    storage: uploadItem, 
});
/**
 * @swagger
 * /admin/restricteditem:
 *   post:
 *     summary: Add a restricted item
 *     description: This API allows the admin to add a new restricted item along with an image.
 *     tags:
 *       - Admin --> Restricted Items
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
 *         schema:
 *           type: string
 *           example: 'your-access-token-here'
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the restricted item.
 *                 example: 'Prohibited Item'
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: The image associated with the restricted item.
 *     responses:
 *       '200':
 *         description: Successfully added the restricted item
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
 *                   example: 'Item added'
 *                 data:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                       example: 'Prohibited Item'
 *                     image:
 *                       type: string
 *                       example: '/uploads/restricted-item.jpg'
 *       '400':
 *         description: Bad Request - Image is required or validation error
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
 *                   example: 'Image is required'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *       '409':
 *         description: Conflict - Item already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: '2'
 *                 message:
 *                   type: string
 *                   example: 'Item already exists'
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
 *                   example: 'Internal Server Error'
 */
router.post('/restricteditem', uploadItemImage.single('image'), validateToken, checkPermission, asyncMiddleware(adminController.addRestrictedItem))

/**
 * @swagger
 * /admin/restricteditem:
 *   get:
 *     summary: Get all restricted items
 *     description: This API allows the admin to fetch all restricted items that are not deleted.
 *     tags:
 *       - Admin --> Restricted Items
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
 *         schema:
 *           type: string
 *           example: 'your-access-token-here'
 *     responses:
 *       '200':
 *         description: Successfully retrieved all restricted items
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
 *                   example: 'All Restricted Items'
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
 *                         example: 'Prohibited Item'
 *                       image:
 *                         type: string
 *                         example: '/uploads/restricted-item.jpg'
 *                       status:
 *                         type: boolean
 *                         example: true
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *                   example: 'Internal Server Error'
 */
router.get('/restricteditem',validateToken, checkPermission, asyncMiddleware(adminController.getRestrictedItem))
/**
 * @swagger
 * /admin/restricteditem:
 *   put:
 *     summary: Update a restricted item
 *     description: This API allows the admin to update the details of a restricted item, including its image if required.
 *     tags:
 *       - Admin --> Restricted Items
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
 *         schema:
 *           type: string
 *           example: 'your-access-token-here'
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 description: The ID of the restricted item to be updated.
 *                 example: 1
 *               title:
 *                 type: string
 *                 description: The new title of the restricted item.
 *                 example: 'Updated Prohibited Item'
 *               updateImage:
 *                 type: string
 *                 description: Indicates if the image needs to be updated (true/false).
 *                 example: 'true'
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: The new image for the restricted item. (Only required if updateImage is 'true')
 *                 example: 'file-path-to-image.jpg'
 *     responses:
 *       '200':
 *         description: Successfully updated the restricted item
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
 *                   example: 'Item Updated'
 *       '400':
 *         description: Bad Request - Image not uploaded or other validation errors
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
 *                   example: 'Image not uploaded, please upload image'
 *       '409':
 *         description: Conflict - Item with the same name already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: '2'
 *                 message:
 *                   type: string
 *                   example: 'A Item with the same name already exists. Please try some other name.'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *                   example: 'Internal Server Error'
 */

router.put('/restricteditem',  validateToken, checkPermission, uploadItemImage.single('image'), asyncMiddleware(adminController.updateRestrictedItem))

/**
 * @swagger
 * /admin/changestatusrestricteditem:
 *   put:
 *     summary: Change the status of a restricted item
 *     description: This API allows the admin to update the status (active/inactive) of a restricted item.
 *     tags:
 *       - Admin --> Restricted Items
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
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
 *               id:
 *                 type: integer
 *                 description: The ID of the restricted item whose status is to be updated.
 *                 example: 1
 *               status:
 *                 type: boolean
 *                 description: The new status of the restricted item (true = active, false = inactive).
 *                 example: true
 *     responses:
 *       '200':
 *         description: Successfully updated the status of the restricted item
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
 *                   example: 'Item Status Updated'
 *       '400':
 *         description: Bad Request - Invalid status or ID
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
 *                   example: 'Invalid ID or status'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *                   example: 'Internal Server Error'
 */

router.put('/changestatusrestricteditem', validateToken, checkPermission, asyncMiddleware(adminController.changeStatusRestrictedItem))


/**
 * @swagger
 * /admin/deleterestricteditem:
 *   put:
 *     summary: Delete a restricted item
 *     description: This API allows the admin to delete a restricted item by marking it as deleted and inactive.
 *     tags:
 *       - Admin --> Restricted Items
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
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
 *               id:
 *                 type: integer
 *                 description: The ID of the restricted item to be deleted.
 *                 example: 1
 *     responses:
 *       '200':
 *         description: Successfully deleted the restricted item
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
 *                   example: 'Item Deleted'
 *       '400':
 *         description: Bad Request - Invalid ID
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
 *                   example: 'Invalid ID'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *                   example: 'Internal Server Error'
 */

router.put('/deleterestricteditem', validateToken, checkPermission, asyncMiddleware(adminController.deleteRestrictedItem))

// ! Module: dashboard
//*_______________________________________________________________________
/**
 * @swagger
 * /admin/homepage:
 *   get:
 *     summary: Get general dashboard data for the admin
 *     description: This API provides general data for the admin dashboard, including user stats, earnings, and balances.
 *     tags:
 *       - Admin --> Dashboard
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
 *         schema:
 *           type: string
 *           example: 'your-access-token-here'
 *     responses:
 *       '200':
 *         description: Successfully retrieved the dashboard data
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
 *                   example: 'Dashboard general data'
 *                 data:
 *                   type: object
 *                   properties:
 *                     numOfUsers:
 *                       type: integer
 *                       description: The number of registered users
 *                       example: 150
 *                     numOfDrivers:
 *                       type: integer
 *                       description: The number of registered drivers
 *                       example: 75
 *                     blockedUsers:
 *                       type: integer
 *                       description: The number of blocked users
 *                       example: 10
 *                     blockedDrivers:
 *                       type: integer
 *                       description: The number of blocked drivers
 *                       example: 5
 *                     numOfBookings:
 *                       type: integer
 *                       description: The number of bookings with confirmed payments
 *                       example: 200
 *                     numOfWarehouses:
 *                       type: integer
 *                       description: The number of active warehouses
 *                       example: 20
 *                     earnings:
 *                       type: number
 *                       format: float
 *                       description: The total earnings from bookings
 *                       example: 15000.50
 *                     todayEarnings:
 *                       type: number
 *                       format: float
 *                       description: The earnings for today from confirmed bookings
 *                       example: 500.00
 *                     balance:
 *                       type: number
 *                       format: float
 *                       description: The total balance in the wallet
 *                       example: 2500.00
 *                     driverEarnings:
 *                       type: number
 *                       format: float
 *                       description: The total amount paid to drivers
 *                       example: -1200.00
 *                     currencyUnit:
 *                       type: string
 *                       description: The symbol of the currency unit used in earnings
 *                       example: 'USD'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *                   example: 'Internal Server Error'
 */

router.get('/homepage', validateToken, checkPermission, asyncMiddleware(adminController.homePage));

// ! check driver reg step
//*_______________________________________________________________________
/**
 * @swagger
 * /admin/checkregstep:
 *   post:
 *     summary: Check the current registration step of the driver
 *     description: This API checks the current step of the driver’s registration process based on the available details. It returns which step the driver should start from.
 *     tags:
 *       - Admin --> Drivers
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the admin to authenticate the request.
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
 *               driverId:
 *                 type: integer
 *                 description: The ID of the driver whose registration status is being checked.
 *                 example: 1
 *     responses:
 *       '200':
 *         description: Successfully checked the registration step for the driver
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
 *                   example: 'Already Completed'
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The ID of the driver.
 *                       example: 1
 *                     email:
 *                       type: string
 *                       description: The email of the driver.
 *                       example: 'john.doe@example.com'
 *       '400':
 *         description: Bad Request - Invalid input or missing fields
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
 *                   example: 'Invalid or missing driver ID'
 *       '401':
 *         description: Unauthorized - access token is missing or invalid
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
 *       '404':
 *         description: Not Found - Driver not found for the provided ID
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
 *                   example: 'Driver not found for this ID'
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
 *                   example: 'Internal Server Error'
 */

router.post('/checkregstep',validateToken, checkPermission , asyncMiddleware(adminController.checkDriverRegStep))

// ! Admin get Bussiness User



/**
 * @swagger
 * /admin/getBusinessUser:
 *   get:
 *     summary: Get all business users with subscription details
 *     description: Retrieves business users (userTypeId 3) with their active subscription plans, transaction details, and booking counts
 *     tags:
 *       - Admin --> Bussiness User's
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Authentication token
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successfully retrieved business users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: User ID
 *                     example: 1
 *                   firstName:
 *                     type: string
 *                     description: User's first name
 *                     example: 'John'
 *                   lastName:
 *                     type: string
 *                     description: User's last name
 *                     example: 'Doe'
 *                   businessName:
 *                     type: string
 *                     description: Name of the business
 *                     example: 'Doe Enterprises'
 *                   userPlan:
 *                     type: object
 *                     properties:
 *                       subscriptionPlanID:
 *                         type: string
 *                         description: Braintree subscription plan ID
 *                         example: 'sub_12345'
 *                   details:
 *                     type: object
 *                     properties:
 *                       subscriptionId:
 *                         type: string
 *                         description: Subscription identifier
 *                         example: 'sub_12345'
 *                       subscription_price:
 *                         type: string
 *                         description: Subscription price
 *                         example: '29.99'
 *                       subscription_status:
 *                         type: string
 *                         description: Current status of subscription
 *                         example: 'Active'
 *                       subscription_transactionStatus:
 *                         type: string
 *                         description: Status of the latest transaction
 *                         example: 'settled'
 *                       completedBookings:
 *                         type: integer
 *                         description: Number of completed bookings
 *                         example: 5
 *       '401':
 *         description: Unauthorized - Invalid or missing access token
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
 *         description: Forbidden - User doesn't have required permissions
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
 *                   example: 'Permission denied'
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'Internal Server Error'
 */
router.get("/getBusinessUser",validateToken, checkPermission , asyncMiddleware(adminController.adminBussinessCheck))

//! Merchant Admin router

/**
 * @swagger
 * /admin/merchantDashboard:
 *   get:
 *     summary: Get merchant dashboard statistics
 *     description: Retrieves overview statistics including merchant count, warehouse count, and order details
 *     tags:
 *       - Admin --> Merchant Dashboard
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
 *                   example: 'Dashboard Data'
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalMerchantCount:
 *                       type: object
 *                       properties:
 *                         count:
 *                           type: integer
 *                           description: Total number of merchants
 *                           example: 25
 *                         rows:
 *                           type: array
 *                           description: List of merchant users
 *                           items:
 *                             type: object
 *                     totalWarehouses:
 *                       type: object
 *                       properties:
 *                         count:
 *                           type: integer
 *                           description: Total number of warehouses
 *                           example: 10
 *                         rows:
 *                           type: array
 *                           description: List of warehouses
 *                           items:
 *                             type: object
 *                     allInboundOrders:
 *                       type: object
 *                       properties:
 *                         count:
 *                           type: integer
 *                           description: Total number of inbound orders
 *                           example: 50
 *                         rows:
 *                           type: array
 *                           description: List of inbound orders
 *                           items:
 *                             type: object
 *                             properties:
 *                               merchantOrderStatus:
 *                                 type: object
 *                                 properties:
 *                                   title:
 *                                     type: string
 *                                     example: 'Pending'
 *                     allOutboundOrders:
 *                       type: object
 *                       properties:
 *                         count:
 *                           type: integer
 *                           description: Total number of outbound orders
 *                           example: 45
 *                         rows:
 *                           type: array
 *                           description: List of outbound orders
 *                           items:
 *                             type: object
 *                             properties:
 *                               merchantOrderStatus:
 *                                 type: object
 *                                 properties:
 *                                   title:
 *                                     type: string
 *                                     example: 'Delivered'
 *       '401':
 *         description: Unauthorized - Invalid or missing access token
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
 *         description: Forbidden - User doesn't have required permissions
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
 *                   example: 'Permission denied'
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
router.get("/merchantDashboard",validateToken, checkPermission, asyncMiddleware(adminController.merchantDashboard))


/**
 * @swagger
 * /admin/registerMerchant:
 *   post:
 *     summary: Register a new merchant
 *     description: Creates a new merchant account with company details and profile image
 *     tags:
 *       - Admin --> Register Merchant
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - countryCode
 *               - phoneNum
 *               - companyName
 *               - taxNumber
 *               - email
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: Merchant's first name
 *                 example: 'John'
 *               lastName:
 *                 type: string
 *                 description: Merchant's last name
 *                 example: 'Doe'
 *               countryCode:
 *                 type: string
 *                 description: Country code for phone number
 *                 example: '+1'
 *               phoneNum:
 *                 type: string
 *                 description: Phone number (must be 10 digits)
 *                 example: '1234567890'
 *               companyName:
 *                 type: string
 *                 description: Name of the merchant's company
 *                 example: 'ABC Trading Co.'
 *               taxNumber:
 *                 type: string
 *                 description: Company tax identification number
 *                 example: 'TAX123456'
 *               dvToken:
 *                 type: string
 *                 description: Device token for notifications
 *                 example: 'device_token_123'
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Merchant's email address
 *                 example: 'merchant@example.com'
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Account password
 *                 example: 'SecurePass123'
 *               profileImage:
 *                 type: string
 *                 format: binary
 *                 description: Profile image file (optional)
 *     responses:
 *       '200':
 *         description: Successfully registered merchant
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
 *                   example: 'Merchant Register Successfully'
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     firstName:
 *                       type: string
 *                       example: 'John'
 *                     lastName:
 *                       type: string
 *                       example: 'Doe'
 *                     email:
 *                       type: string
 *                       example: 'merchant@example.com'
 *                     countryCode:
 *                       type: string
 *                       example: '+1'
 *                     phoneNum:
 *                       type: string
 *                       example: '1234567890'
 *                     virtualBox:
 *                       type: string
 *                       example: 'VB123456'
 *                     companyName:
 *                       type: string
 *                       example: 'ABC Trading Co.'
 *                     taxNumber:
 *                       type: string
 *                       example: 'TAX123456'
 *                     image:
 *                       type: string
 *                       example: 'uploads/profiles/image.jpg'
 *       '400':
 *         description: Bad Request - Validation errors
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
 *                   example: 'Users exists'
 *                 error:
 *                   type: string
 *                   example: 'The email you entered is already taken'
 *       '401':
 *         description: Unauthorized - Invalid or missing access token
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
 *         description: Forbidden - User doesn't have required permissions
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
 *                   example: 'Permission denied'
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
router.post("/registerMerchant",validateToken,checkPermission,uploadProfile.single('profileImage'),asyncMiddleware(adminController.registerMerchant))

//! Merchant Product create , Add categories ,Subcategories
/**
 * @swagger
 * /admin/createProductfromCSV:
 *   post:
 *     summary: Create multiple products from CSV file
 *     description: Imports products from a CSV file with corresponding images
 *     tags:
 *       - Admin --> Merchant --> Products && Categories
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: CSV file containing product details
 *     responses:
 *       '200':
 *         description: Successfully created products from CSV
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
 *                   example: 'Products Created Successfully'
 *       '400':
 *         description: Bad Request - File or data validation errors
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
 *                   example: 'No file uploaded'
 *                 error:
 *                   type: string
 *                   example: 'Image file product123.jpg not found'
 *       '401':
 *         description: Unauthorized - Invalid or missing access token
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
 *         description: Forbidden - User doesn't have required permissions
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
 *                   example: 'Permission denied'
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
 *                   example: 'Error processing CSV file'
 * 
 * components:
 *   schemas:
 *     CSVFormat:
 *       type: object
 *       description: Expected CSV file format
 *       properties:
 *         productName:
 *           type: string
 *           example: 'Product 1'
 *         merchantCategoryName:
 *           type: string
 *           example: 'Electronics'
 *         productDescription:
 *           type: string
 *           example: 'Product description here'
 *         image:
 *           type: string
 *           example: 'product1.jpg'
 *         productCode:
 *           type: string
 *           example: 'PROD001'
 *         price:
 *           type: number
 *           example: 99.99
 *         quantity:
 *           type: integer
 *           example: 100
 *         productWeight:
 *           type: number
 *           example: 1.5
 *         unit:
 *           type: string
 *           example: 'kg'
 *         productStatus:
 *           type: string
 *           example: 'active'
 *         subCategoryName:
 *           type: string
 *           example: 'Smartphones'
 */
router.post("/createProductfromCSV",uploaded.single('file'),validateToken,checkPermission,asyncMiddleware(adminController.createProductfromCSV));

// for taking products picture of merchant
const uploadProductImgs = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, `./Public/productImages`)
    },
    filename: (req, file, cb) => {
        cb(null, 'profile-' + '-' + Date.now() +  path.extname(file.originalname))
    }
})
const uploadProductPic = multer({
    storage: uploadProductImgs,
});
//Add Product
/**
 * @swagger
 * /admin/createProducts:
 *   post:
 *     summary: Create a new product
 *     description: Creates a new product with image upload and automatic barcode generation
 *     tags:
 *       - Admin --> Merchant --> Products && Categories
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - productName
 *               - productDescription
 *               - price
 *               - quantity
 *               - weight
 *               - productStatus
 *               - productCode
 *               - merchantCategoryId
 *               - merchantSubcategoryId
 *             properties:
 *               productName:
 *                 type: string
 *                 description: Name of the product
 *                 example: 'Wireless Headphones'
 *               productImage:
 *                 type: string
 *                 format: binary
 *                 description: Product image file
 *               productDescription:
 *                 type: string
 *                 description: Detailed description of the product
 *                 example: 'High-quality wireless headphones with noise cancellation'
 *               price:
 *                 type: number
 *                 description: Product price
 *                 example: 99.99
 *               quantity:
 *                 type: integer
 *                 description: Available quantity
 *                 example: 100
 *               weight:
 *                 type: number
 *                 description: Product weight (in lbs)
 *                 example: 0.5
 *               productStatus:
 *                 type: string
 *                 description: Current status of the product
 *                 example: 'active'
 *               productCode:
 *                 type: string
 *                 description: Product reference code
 *                 example: 'PRD001'
 *               merchantCategoryId:
 *                 type: integer
 *                 description: ID of the product category
 *                 example: 1
 *               merchantSubcategoryId:
 *                 type: integer
 *                 description: ID of the product subcategory
 *                 example: 1
 *     responses:
 *       '200':
 *         description: Successfully created product
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
 *                   example: 'Products are Created'
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     productName:
 *                       type: string
 *                       example: 'Wireless Headphones'
 *                     productDescription:
 *                       type: string
 *                       example: 'High-quality wireless headphones with noise cancellation'
 *                     price:
 *                       type: number
 *                       example: 99.99
 *                     quantity:
 *                       type: integer
 *                       example: 100
 *                     weight:
 *                       type: number
 *                       example: 0.5
 *                     unit:
 *                       type: string
 *                       example: 'lbs'
 *                     image:
 *                       type: string
 *                       example: 'Public/products/headphones.jpg'
 *                     code:
 *                       type: string
 *                       example: 'TSH-WirelessHeadphones-123456'
 *                     barCode:
 *                       type: string
 *                       example: 'Public/Barcodes/TSH-WirelessHeadphones-123456.png'
 *                     merchantCategoryName:
 *                       type: string
 *                       example: 'Electronics'
 *                     subcategoryName:
 *                       type: string
 *                       example: 'Audio Devices'
 *       '400':
 *         description: Bad Request - Validation errors
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
 *                   example: 'Invalid category or subcategory'
 *       '401':
 *         description: Unauthorized - Invalid or missing access token
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
 *         description: Forbidden - User doesn't have required permissions
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
 *                   example: 'Permission denied'
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
router.post("/createProducts",uploadProductPic.single('productImage'),validateToken,checkPermission,asyncMiddleware(adminController.createProducts))
//create categories
/**
 * @swagger
 * /admin/createCategories:
 *   post:
 *     summary: Create a new merchant category
 *     description: Creates a new category for merchant products
 *     tags:
 *       - Admin --> Merchant --> Products && Categories
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
 *               - title
 *               - status
 *             properties:
 *               title:
 *                 type: string
 *                 description: Name of the category
 *                 example: 'Electronics'
 *               status:
 *                 type: boolean
 *                 description: Status of the category (active/inactive)
 *                 example: true
 *     responses:
 *       '200':
 *         description: Successfully created category
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
 *                   example: 'Categories Added'
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     title:
 *                       type: string
 *                       example: 'Electronics'
 *                     status:
 *                       type: boolean
 *                       example: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: '2024-01-20T10:00:00.000Z'
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: '2024-01-20T10:00:00.000Z'
 *       '400':
 *         description: Bad Request - Validation errors
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
 *                   example: 'Invalid category data'
 *       '401':
 *         description: Unauthorized - Invalid or missing access token
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
 *         description: Forbidden - User doesn't have required permissions
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
 *                   example: 'Permission denied'
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
router.post("/createCategories",validateToken,checkPermission,asyncMiddleware(adminController.createCategories))
//get categories
/**
 * @swagger
 * /admin/getCategories:
 *   get:
 *     summary: Get all merchant categories
 *     description: Retrieves a list of all merchant categories
 *     tags:
 *       - Admin --> Merchant --> Products && Categories
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Authentication token
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successfully retrieved categories
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
 *                   example: 'Fetched All Categories'
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: Unique identifier for the category
 *                         example: 1
 *                       title:
 *                         type: string
 *                         description: Name of the category
 *                         example: 'Electronics'
 *                       status:
 *                         type: boolean
 *                         description: Status of the category (active/inactive)
 *                         example: true
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: '2024-01-20T10:00:00.000Z'
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: '2024-01-20T10:00:00.000Z'
 *       '401':
 *         description: Unauthorized - Invalid or missing access token
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
 *         description: Forbidden - User doesn't have required permissions
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
 *                   example: 'Permission denied'
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
router.get("/getCategories",validateToken,checkPermission,asyncMiddleware(adminController.getCategories))
//create Subcategories
/**
 * @swagger
 * /admin/Subcategories:
 *   post:
 *     summary: Create a new merchant subcategory
 *     description: Creates a new subcategory for merchant products
 *     tags:
 *       - Admin --> Merchant --> Products && Categories
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
 *               - title
 *               - status
 *             properties:
 *               title:
 *                 type: string
 *                 description: Name of the subcategory
 *                 example: 'Smartphones'
 *               description:
 *                 type: string
 *                 description: Description of the subcategory
 *                 example: 'Mobile phones and accessories'
 *               status:
 *                 type: boolean
 *                 description: Status of the subcategory (active/inactive)
 *                 example: true
 *     responses:
 *       '200':
 *         description: Successfully created subcategory
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
 *                   example: 'SubCategory created'
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     title:
 *                       type: string
 *                       example: 'Smartphones'
 *                     description:
 *                       type: string
 *                       example: 'Mobile phones and accessories'
 *                     status:
 *                       type: boolean
 *                       example: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: '2024-01-20T10:00:00.000Z'
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: '2024-01-20T10:00:00.000Z'
 *       '400':
 *         description: Bad Request - Validation errors
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
 *                   example: 'Invalid subcategory data'
 *       '401':
 *         description: Unauthorized - Invalid or missing access token
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
 *         description: Forbidden - User doesn't have required permissions
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
 *                   example: 'Permission denied'
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
router.post("/Subcategories",validateToken,checkPermission,asyncMiddleware(adminController.Subcategories))
//get subcategories

/**
 * @swagger
 * /admin/getSubcategories:
 *   get:
 *     summary: Get all merchant subcategories
 *     description: Retrieves a list of all merchant subcategories
 *     tags:
 *       - Admin --> Merchant --> Products && Categories
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Authentication token
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successfully retrieved subcategories
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
 *                   example: 'Fetched All Subcategories'
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: Unique identifier for the subcategory
 *                         example: 1
 *                       title:
 *                         type: string
 *                         description: Name of the subcategory
 *                         example: 'Smartphones'
 *                       description:
 *                         type: string
 *                         description: Description of the subcategory
 *                         example: 'Mobile phones and accessories'
 *                       status:
 *                         type: boolean
 *                         description: Status of the subcategory (active/inactive)
 *                         example: true
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: '2024-01-20T10:00:00.000Z'
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: '2024-01-20T10:00:00.000Z'
 *       '401':
 *         description: Unauthorized - Invalid or missing access token
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
 *         description: Forbidden - User doesn't have required permissions
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
 *                   example: 'Permission denied'
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
router.get("/getSubcategories",validateToken,checkPermission,asyncMiddleware(adminController.getSubcategories))
//create barcodes for Product
/**
 * @swagger
 * /admin/createBarCode:
 *   post:
 *     summary: Generate barcodes for multiple products
 *     description: Creates unique barcodes for specified products and saves them as PNG files
 *     tags:
 *       - Admin --> Merchant --> Products && Categories
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
 *               - productIds
 *             properties:
 *               productIds:
 *                 type: array
 *                 description: Array of product IDs to generate barcodes for
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3]
 *     responses:
 *       '200':
 *         description: Successfully generated barcodes
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
 *                   example: 'Product barcodes updated successfully'
 *                 data:
 *                   type: object
 *                   example: {}
 *       '400':
 *         description: Bad Request - Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'Product IDs array is required and should not be empty'
 *       '401':
 *         description: Unauthorized - Invalid or missing access token
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
 *         description: Forbidden - User doesn't have required permissions
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
 *                   example: 'Permission denied'
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
 *     BarcodeFormat:
 *       type: object
 *       description: Format of generated barcode data
 *       properties:
 *         code:
 *           type: string
 *           description: Unique barcode identifier
 *           example: 'TSH-1-123456'
 *         barCode:
 *           type: string
 *           description: Path to the generated barcode image
 *           example: 'Public/Barcodes/TSH-1-123456.png'
 */
router.post("/createBarCode",validateToken,checkPermission,asyncMiddleware(adminController.createBarCode))
//edit products
/**
 * @swagger
 * /admin/editProduct:
 *   put:
 *     summary: Update product details
 *     description: Updates an existing product's information and optionally its image
 *     tags:
 *       - Admin --> Merchant --> Products && Categories
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - productName
 *               - productDescription
 *               - price
 *               - quantity
 *               - weight
 *               - productStatus
 *               - productCode
 *               - productPhotoChange
 *             properties:
 *               id:
 *                 type: integer
 *                 description: Product ID to update
 *                 example: 1
 *               productName:
 *                 type: string
 *                 description: Updated name of the product
 *                 example: 'Updated Wireless Headphones'
 *               productDescription:
 *                 type: string
 *                 description: Updated product description
 *                 example: 'New improved wireless headphones with better battery life'
 *               price:
 *                 type: number
 *                 description: Updated product price
 *                 example: 129.99
 *               quantity:
 *                 type: integer
 *                 description: Updated product quantity
 *                 example: 50
 *               weight:
 *                 type: number
 *                 description: Updated product weight
 *                 example: 0.45
 *               productStatus:
 *                 type: string
 *                 description: Updated product status
 *                 example: 'active'
 *               productCode:
 *                 type: string
 *                 description: Updated product code
 *                 example: 'PRD-001-UPD'
 *               merchantCategoryId:
 *                 type: integer
 *                 description: Updated category ID (Note --> Currently hardcoded to 1)
 *                 example: 1
 *               productPhotoChange:
 *                 type: string
 *                 enum: ['true', 'false']
 *                 description: Indicates if product photo should be updated
 *                 example: 'false'
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: New product image file (required if productPhotoChange is 'true')
 *     responses:
 *       '200':
 *         description: Successfully updated product
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
 *                   example: 'Product Updated Successfully'
 *                 data:
 *                   type: object
 *                   example: {}
 *       '400':
 *         description: Bad Request - Validation errors
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
 *                   example: 'Add Product Photo'
 *       '401':
 *         description: Unauthorized - Invalid or missing access token
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
 *         description: Forbidden - User doesn't have required permissions
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
 *                   example: 'Permission denied'
 *       '404':
 *         description: Not Found - Product not found
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
 *                   example: 'Product not found'
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
router.put("/editProduct",validateToken,checkPermission,asyncMiddleware(adminController.editProduct))
//get Products
/**
 * @swagger
 * /admin/getProducts:
 *   get:
 *     summary: Get all products
 *     description: Retrieves a list of all products in the system
 *     tags:
 *       - Admin --> Merchant --> Products && Categories
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Authentication token
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successfully retrieved products
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
 *                   example: 'All Products Fetched'
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: Unique identifier for the product
 *                         example: 1
 *                       productName:
 *                         type: string
 *                         description: Name of the product
 *                         example: 'Wireless Headphones'
 *                       productDescription:
 *                         type: string
 *                         description: Detailed description of the product
 *                         example: 'High-quality wireless headphones with noise cancellation'
 *                       price:
 *                         type: number
 *                         description: Product price
 *                         example: 99.99
 *                       quantity:
 *                         type: integer
 *                         description: Available quantity
 *                         example: 50
 *                       weight:
 *                         type: number
 *                         description: Product weight
 *                         example: 0.5
 *                       unit:
 *                         type: string
 *                         description: Unit of measurement
 *                         example: 'lbs'
 *                       image:
 *                         type: string
 *                         description: Path to product image
 *                         example: 'Public/products/headphones.jpg'
 *                       productStatus:
 *                         type: string
 *                         description: Current status of the product
 *                         example: 'active'
 *                       productCode:
 *                         type: string
 *                         description: Unique product code
 *                         example: 'PRD001'
 *                       merchantCategoryId:
 *                         type: integer
 *                         description: ID of the product category
 *                         example: 1
 *                       merchantCategoryName:
 *                         type: string
 *                         description: Name of the product category
 *                         example: 'Electronics'
 *                       code:
 *                         type: string
 *                         description: Barcode identifier
 *                         example: 'TSH-1-123456'
 *                       barCode:
 *                         type: string
 *                         description: Path to barcode image
 *                         example: 'Public/Barcodes/TSH-1-123456.png'
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: '2024-01-20T10:00:00.000Z'
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: '2024-01-20T10:00:00.000Z'
 *       '401':
 *         description: Unauthorized - Invalid or missing access token
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
 *         description: Forbidden - User doesn't have required permissions
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
 *                   example: 'Permission denied'
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
router.get("/getProducts",validateToken,checkPermission,asyncMiddleware(adminController.getProducts))
//get categories and subcategories on the basis of Names
/**
 * @swagger
 * /admin/getCatandSubCatName:
 *   get:
 *     summary: Find category or subcategory by name
 *     description: Searches for a matching category or subcategory based on the provided name
 *     tags:
 *       - Admin --> Merchant --> Products && Categories
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: Authentication token
 *         schema:
 *           type: string
 *       - in: body
 *         name: categoryData
 *         required: true
 *         description: Category name to search
 *         schema:
 *           type: object
 *           required:
 *             - categoryName
 *           properties:
 *             categoryName:
 *               type: string
 *               description: Name to search in categories and subcategories
 *               example: 'Electronics'
 *     responses:
 *       '200':
 *         description: Successfully found category or subcategory
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
 *                       example: 'Category find'
 *                     data:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         title:
 *                           type: string
 *                           example: 'Electronics'
 *                         status:
 *                           type: boolean
 *                           example: true
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: '2024-01-20T10:00:00.000Z'
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: '2024-01-20T10:00:00.000Z'
 *                 - type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: '1'
 *                     message:
 *                       type: string
 *                       example: 'SubCategory Find'
 *                     data:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         title:
 *                           type: string
 *                           example: 'Smartphones'
 *                         description:
 *                           type: string
 *                           example: 'Mobile phones and accessories'
 *                         status:
 *                           type: boolean
 *                           example: true
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: '2024-01-20T10:00:00.000Z'
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: '2024-01-20T10:00:00.000Z'
 *       '400':
 *         description: Bad Request - Invalid or missing category name
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
 *                   example: 'Category name is required'
 *       '401':
 *         description: Unauthorized - Invalid or missing access token
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
 *         description: Forbidden - User doesn't have required permissions
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
 *                   example: 'Permission denied'
 *       '404':
 *         description: Not Found - No matching category or subcategory
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
 *                   example: 'No matching category or subcategory found'
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
router.get("/getCatandSubCatName",validateToken,checkPermission,asyncMiddleware(adminController.getCatandSubCatName))
//check tracking number

/**
 * @swagger
 * /admin/checktrackingNumber/{trackNumber}:
 *   post:
 *     summary: Check if tracking number exists
 *     description: Verifies if a given tracking number exists in the system
 *     tags:
 *       - Admin --> Tracking
 *     parameters:
 *       - in: path
 *         name: trackNumber
 *         required: true
 *         description: Tracking number to check
 *         schema:
 *           type: string
 *         example: 'TRK123456'
 *     responses:
 *       '200':
 *         description: Successfully checked tracking number
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
 *                   example: 'Found'
 *                 data:
 *                   type: boolean
 *                   example: true
 *                   description: true if tracking number exists, false if not found
 *             examples:
 *               found:
 *                 value:
 *                   status: '1'
 *                   message: 'Found'
 *                   data: true
 *               notFound:
 *                 value:
 *                   status: '1'
 *                   message: 'Not found'
 *                   data: false
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
router.post("/checktrackingNumber/:trackNumber",asyncMiddleware(adminController.checktrackingNumber))
//create service for assign to merchant

/**
 * @swagger
 * /admin/createService:
 *   post:
 *     summary: Create a new merchant service
 *     description: Creates a new service with title, status, and price
 *     tags:
 *       - Admin --> Merchant --> Service
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
 *               - title
 *               - status
 *               - price
 *             properties:
 *               title:
 *                 type: string
 *                 description: Name of the service
 *                 example: 'Express Delivery'
 *               status:
 *                 type: boolean
 *                 description: Status of the service (active/inactive)
 *                 example: true
 *               price:
 *                 type: number
 *                 description: Price of the service
 *                 example: 29.99
 *     responses:
 *       '200':
 *         description: Successfully created service
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
 *                   example: 'Service created'
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     title:
 *                       type: string
 *                       example: 'Express Delivery'
 *                     status:
 *                       type: boolean
 *                       example: true
 *                     price:
 *                       type: number
 *                       example: 29.99
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: '2024-01-20T10:00:00.000Z'
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: '2024-01-20T10:00:00.000Z'
 *       '400':
 *         description: Bad Request - Validation errors
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
 *                   example: 'Invalid service data'
 *       '401':
 *         description: Unauthorized - Invalid or missing access token
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
 *         description: Forbidden - User doesn't have required permissions
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
 *                   example: 'Permission denied'
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
router.post("/createService",validateToken,checkPermission,asyncMiddleware(adminController.createService))
module.exports = router;
