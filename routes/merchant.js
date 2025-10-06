const express = require('express');
const router = express();
const adminController = require('../controller/admin');
const wareHouseController = require('../controller/warehouse');
const merchantController=require('../controller/Merchant/merchantAuth')
const merchantProductController=require('../controller/Merchant/merchnatProducts');
const userController = require('../controller/customer');
const asyncMiddleware = require('../middleware/async');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const validateToken = require('../middleware/validateAdmin'); 
const checkPermission = require('../middleware/checkPermission');
const { file } = require('pdfkit');
const CustomException = require('../middleware/errorObject');

// Helper function to ensure directory exists
const ensureDirExists = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

/**
 * @swagger
 * /merchant/sendotp:
 *   post:
 *     summary: Send OTP for merchant registration/verification
 *     description: Sends OTP to email for new merchant registration or existing unverified user
 *     tags:
 *       - Merchant Panel --> Auth
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
 *                 format: email
 *                 description: Email address for registration/verification
 *                 example: merchant@example.com
 *               password:
 *                 type: string
 *                 description: Password for new registration
 *                 example: 'Password123!'
 *               signedBy:
 *                 type: string
 *                 description: Optional sign-up method
 *                 example: 'email'
 *               dvToken:
 *                 type: string
 *                 description: Optional device token
 *                 example: 'device_token_123'
 *     responses:
 *       '200':
 *         description: OTP sent successfully
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
 *                       example: 123
 *                     userId:
 *                       type: integer
 *                       example: 456
 *       '400':
 *         description: Bad Request - User exists or is a driver
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                   example: 'Trying to login?'
 *                 message:
 *                   type: string
 *                   example: 'A user with the following email exists already'
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
 *                   example: 'Error details'
 */
router.post('/sendotp', asyncMiddleware(merchantController.sendOTP))

/**
 * @swagger
 * /merchant/resendOTP:
 *   post:
 *     summary: Resend OTP to user
 *     description: Generates and sends a new OTP to the user's registered email
 *     tags:
 *       - Merchant Panel --> Auth
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
 *                 description: ID of the user requesting OTP resend
 *                 example: 123
 *     responses:
 *       '200':
 *         description: OTP resent successfully
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
 *                   example: 'OTP sent successfully to user@example.com'
 *                 data:
 *                   type: object
 *                   properties:
 *                     otpId:
 *                       type: integer
 *                       example: 456
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
 *                   example: 'Error sending OTP'
 *                 data:
 *                   type: object
 *                   example: {}
 *                 error:
 *                   type: string
 *                   example: 'Error details'
 */
router.post('/resendOTP', asyncMiddleware(merchantController.resendOTP))

/**
 * @swagger
 * /merchant/verifyotpsignup:
 *   post:
 *     summary: Verify OTP for merchant signup
 *     description: Verifies OTP and completes merchant registration with Stripe customer creation
 *     tags:
 *       - Merchant Panel --> Auth
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
 *                 example: 123
 *               OTP:
 *                 type: string
 *                 description: 4-digit OTP code
 *                 example: '1234'
 *               userId:
 *                 type: integer
 *                 description: ID of the user being verified
 *                 example: 456
 *     responses:
 *       '200':
 *         description: OTP verified successfully
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
 *                       example: 456
 *       '400':
 *         description: Bad Request - Invalid OTP or verification failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                   example: 'You entered incorrect OTP'
 *                 message:
 *                   type: string
 *                   example: 'Please enter correct OTP to continue'
 *       '404':
 *         description: Not Found - OTP data not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                   example: 'Sorry, we could not fetch the data'
 *                 message:
 *                   type: string
 *                   example: 'Please rensend OTP to continue'
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
 *                   example: 'Error verifying OTP'
 */
router.post('/verifyotpsignup', asyncMiddleware(merchantController.verifyOTPforSignUp))

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

// for taking products picture of merchant
const uploadProductImgs = multer.diskStorage({
    destination: (req, file, cb) => {
        const dirPath = `./Public/productImages`;
        ensureDirExists(dirPath);
        cb(null, dirPath)
    },
    filename: (req, file, cb) => {
        cb(null, 'profile-' + '-' + Date.now() +  path.extname(file.originalname))
    }
})
const uploadProductPic = multer({
    storage: uploadProductImgs,
});

// CSV file 

const uploadfiles=multer.diskStorage({
    destination:(req,file,cb)=>{
        const dirPath = './Public/csvFiles';
        ensureDirExists(dirPath);
        cb(null, dirPath)
    },
    filename:(req,file,cb)=>{
        const fileExtension=path.extname(file.originalname);
        const baseName=path.basename(file.originalname,fileExtension);
        cb(null,`${baseName}-${Date.now()}${fileExtension}`)
    }
})

const storage = multer.memoryStorage();

const upload=multer({
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

// register Merchant

/**
 * @swagger
 * /merchant/register:
 *   post:
 *     summary: Register merchant user details
 *     description: Complete merchant registration with profile details after OTP verification
 *     tags:
 *       - Merchant Panel --> Auth
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: profileImage
 *         type: file
 *         description: Profile image file (optional)
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - userId
 *               - countryCode
 *               - phoneNum
 *               - companyName
 *               - taxNumber
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: 'John'
 *               lastName:
 *                 type: string
 *                 example: 'Doe'
 *               userId:
 *                 type: integer
 *                 example: 123
 *               countryCode:
 *                 type: string
 *                 example: '+1'
 *               phoneNum:
 *                 type: string
 *                 example: '1234567890'
 *               companyName:
 *                 type: string
 *                 example: 'Acme Corp'
 *               taxNumber:
 *                 type: string
 *                 example: 'TAX123456'
 *               dvToken:
 *                 type: string
 *                 description: Device token
 *                 example: 'device_token_123'
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
 *                   example: 'User Register Successfully'
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 123
 *                         firstName:
 *                           type: string
 *                           example: 'John'
 *                         lastName:
 *                           type: string
 *                           example: 'Doe'
 *                         email:
 *                           type: string
 *                           example: 'john@example.com'
 *                     accessToken:
 *                       type: string
 *                       example: 'jwt_token_here'
 *                     warehouseAddress:
 *                       type: string
 *                       example: '123 Main St, City, State, 12345 Country'
 *                     virtualBoxNumber:
 *                       type: string
 *                       example: 'VB123456'
 *       '400':
 *         description: Bad Request - Validation errors
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                   example: 'Phone number is not within the range of 10 Digits.'
 *       '401':
 *         description: Unauthorized - OTP not verified
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
 *                   example: 'Please verify your OTP first'
 */
router.post('/register', uploadProfile.single('profileImage'), asyncMiddleware(merchantController.registerUser));
// Sign in the Merchant


/**
 * @swagger
 * /merchant/login:
 *   post:
 *     summary: Authenticate merchant user
 *     description: Authenticates merchant with email/password or social login (Google/Apple)
 *     tags:
 *       - Merchant Panel --> Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - dvToken
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: merchant@example.com
 *               password:
 *                 type: string
 *                 description: Required for email login
 *                 example: 'Password123!'
 *               dvToken:
 *                 type: string
 *                 description: Device token for notifications
 *                 example: 'device_token_123'
 *               signedBy:
 *                 type: string
 *                 enum: ['', 'google', 'apple']
 *                 description: Authentication method
 *                 example: ''
 *     responses:
 *       '200':
 *         description: Successfully authenticated
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
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 123
 *                         firstName:
 *                           type: string
 *                           example: 'John'
 *                         lastName:
 *                           type: string
 *                           example: 'Doe'
 *                         email:
 *                           type: string
 *                           format: email
 *                           example: 'john@example.com'
 *                         joinedOn:
 *                           type: string
 *                           example: '2024'
 *                         countryCode:
 *                           type: string
 *                           example: '+1'
 *                         phoneNum:
 *                           type: string
 *                           example: '1234567890'
 *                     accessToken:
 *                       type: string
 *                       example: 'jwt_token_here'
 *       '400':
 *         description: Bad Request - Various error scenarios
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                   example: 'Bad credentials'
 *                 message:
 *                   type: string
 *                   example: 'Please enter correct password to continue'
 *       '401':
 *         description: Unauthorized - Account blocked or unverified
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                   example: 'Blocked by admin'
 *                 message:
 *                   type: string
 *                   example: 'Please contact admin to continue'
 *       '404':
 *         description: Not Found - User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                   example: 'User not found'
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
 *                   example: 'Internal server error'
 */
router.post('/login', asyncMiddleware(merchantController.signInUser));


// ! _____________________________Products Creation Controllers_______________________________________ // !

/**
 * @swagger
 * /merchant/uploadProducts:
 *   post:
 *     summary: Upload products from CSV
 *     description: This API allows the merchant to upload product details from a CSV file. The CSV file should contain product information including name, description, category, price, etc. The images specified in the CSV must be present in the productImages folder.
 *     tags:
 *       - Merchant Panel --> Products, Categories ,Inboubd & Outbound Orders
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
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The CSV file containing product details.
 *       responses:
 *       '200':
 *         description: Successfully uploaded and processed products from CSV
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
 *         description: Bad Request - No file uploaded or invalid file format
 *         content:
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
 *         description: Internal Server Error - Error processing the CSV file
 *         content:
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
 */

router.post('/uploadProducts', upload.single('file'), asyncMiddleware(merchantProductController.createProductfromCSV));



/**
 * @swagger
 * /merchant/createProduct:
 *   post:
 *     summary: Create a new product
 *     description: This API allows the merchant to create a new product, including product details such as name, description, price, quantity, and category, along with an optional product image. A barcode is also generated for the product.
 *     tags:
 *       - Merchant Panel --> Products, Categories ,Inboubd & Outbound Orders
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
 *               productName:
 *                 type: string
 *                 description: The name of the product.
 *                 example: 'Smartphone'
 *               productDescription:
 *                 type: string
 *                 description: A brief description of the product.
 *                 example: 'Latest model with 128GB storage'
 *               price:
 *                 type: number
 *                 description: The price of the product.
 *                 example: 499.99
 *               quantity:
 *                 type: integer
 *                 description: The available quantity of the product.
 *                 example: 100
 *               weight:
 *                 type: number
 *                 description: The weight of the product.
 *                 example: 0.5
 *               unit:
 *                 type: string
 *                 description: The unit of measurement for the weight (e.g., lbs or kg).
 *                 example: 'lbs'
 *               productStatus:
 *                 type: string
 *                 description: The status of the product (e.g., available, out of stock).
 *                 example: 'available'
 *               productCode:
 *                 type: string
 *                 description: The unique product code.
 *                 example: 'SKU-12345'
 *               merchantCategoryId:
 *                 type: integer
 *                 description: The ID of the product's merchant category.
 *                 example: 1
 *               merchantSubcategoryId:
 *                 type: integer
 *                 description: The ID of the product's merchant subcategory.
 *                 example: 2
 *               productImage:
 *                 type: string
 *                 description: The image of the product (uploaded file).
 *                 format: binary
 *     responses:
 *       '200':
 *         description: Successfully created the new product
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
 *                       description: The ID of the newly created product.
 *                       example: 1
 *                     productName:
 *                       type: string
 *                       description: The name of the created product.
 *                       example: 'Smartphone'
 *                     productCode:
 *                       type: string
 *                       description: The unique product code.
 *                       example: 'SKU-12345'
 *                     price:
 *                       type: number
 *                       description: The price of the created product.
 *                       example: 499.99
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
 *         description: Internal Server Error - Error creating the product
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: '0'
 *                 message:
 *                   type: string
 *                   example: 'Error creating product'
 */

router.post('/createProduct',uploadProductPic.single('productImage'),asyncMiddleware(merchantProductController.createProducts));


/**
 * @swagger
 * /merchant/createCategories:
 *   post:
 *     summary: Create new category
 *     description: This API allows the admin to create a new product category with a title and status.
 *     tags:
 *       - Merchant Panel --> Products, Categories ,Inboubd & Outbound Orders
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
 *                 example: 'Electronics'
 *               status:
 *                 type: boolean
 *                 description: The status of the category (true for active, false for inactive).
 *                 example: true
 *     responses:
 *       '200':
 *         description: Successfully created the category
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
 *                       description: The ID of the newly created category.
 *                       example: 1
 *                     title:
 *                       type: string
 *                       description: The title of the created category.
 *                       example: 'Electronics'
 *                     status:
 *                       type: boolean
 *                       description: The status of the created category.
 *                       example: true
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
 *                   example: 'All fields are required'
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
 *         description: Internal Server Error - Error creating the category
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: '0'
 *                 message:
 *                   type: string
 *                   example: 'Error creating category'
 */

router.post("/createCategories",validateToken,asyncMiddleware(merchantProductController.createCategories));



/**
 * @swagger
 * /merchant/getCategories:
 *   get:
 *     summary: Get all categories
 *     description: This API allows the admin to fetch all categories stored in the system.
 *     tags:
 *       - Merchant Panel --> Products, Categories ,Inboubd & Outbound Orders
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
 *         description: Successfully retrieved all categories
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
 *                         description: The ID of the category.
 *                         example: 1
 *                       title:
 *                         type: string
 *                         description: The title of the category.
 *                         example: 'Electronics'
 *                       status:
 *                         type: boolean
 *                         description: The status of the category (active or inactive).
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

router.get("/getCategories",validateToken,asyncMiddleware(merchantProductController.getCategories));


/**
 * @swagger
 * /merchant/createSubcategories:
 *   post:
 *     summary: Create a new subcategory
 *     description: This API allows the admin to create a new subcategory by providing a title, description, and status.
 *     tags:
 *       - Merchant Panel --> Products, Categories ,Inboubd & Outbound Orders
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
 *                 description: The title of the new subcategory.
 *                 example: 'Smartphones'
 *               description:
 *                 type: string
 *                 description: A brief description of the subcategory.
 *                 example: 'Mobile phones and accessories'
 *               status:
 *                 type: boolean
 *                 description: The status of the subcategory (true for active, false for inactive).
 *                 example: true
 *     responses:
 *       '200':
 *         description: Successfully created the new subcategory
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
 *                   example: 'Subcategory created'
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The ID of the newly created subcategory.
 *                       example: 1
 *                     title:
 *                       type: string
 *                       description: The title of the subcategory.
 *                       example: 'Smartphones'
 *                     description:
 *                       type: string
 *                       description: The description of the subcategory.
 *                       example: 'Mobile phones and accessories'
 *                     status:
 *                       type: boolean
 *                       description: The status of the subcategory.
 *                       example: true
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
 *                   example: 'All fields are required'
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
 *         description: Internal Server Error - Error creating the subcategory
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: '0'
 *                 message:
 *                   type: string
 *                   example: 'Error creating subcategory'
 */

router.post("/createSubcategories",validateToken,asyncMiddleware(merchantProductController.createSubcategories))


/**
 * @swagger
 * /merchant/getSubcategories:
 *   get:
 *     summary: Get all subcategories
 *     description: This API allows the admin to fetch all subcategories stored in the system.
 *     tags:
 *       - Merchant Panel --> Products, Categories ,Inboubd & Outbound Orders
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
 *         description: Successfully retrieved all subcategories
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
 *                         description: The ID of the subcategory.
 *                         example: 1
 *                       title:
 *                         type: string
 *                         description: The title of the subcategory.
 *                         example: 'Smartphones'
 *                       description:
 *                         type: string
 *                         description: The description of the subcategory.
 *                         example: 'Mobile phones and accessories'
 *                       status:
 *                         type: boolean
 *                         description: The status of the subcategory (active or inactive).
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

router.get("/getSubcategories",validateToken,asyncMiddleware(merchantProductController.getSubcategories))


/**
 * @swagger
 * /admin/createBarcodes:
 *   post:
 *     summary: Create barcodes for multiple products
 *     description: This API allows the admin to create barcodes for multiple products by providing an array of product IDs. A unique barcode is generated for each product.
 *     tags:
 *       - Merchant Panel --> Products, Categories ,Inboubd & Outbound Orders
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
 *               productIds:
 *                 type: array
 *                 description: An array of product IDs for which barcodes should be generated.
 *                 items:
 *                   type: integer
 *                   example: 1
 *     responses:
 *       '200':
 *         description: Successfully generated barcodes for the products
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
 *       '400':
 *         description: Bad Request - Invalid or missing product IDs array
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: '0'
 *                 message:
 *                   type: string
 *                   example: 'Product IDs array is required and should not be empty'
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
 *         description: Internal Server Error - Error generating barcodes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: '0'
 *                 message:
 *                   type: string
 *                   example: 'Error generating product barcodes'
 */

router.post("/createBarcodes",validateToken,asyncMiddleware(merchantProductController.createBarCode))


/**
 * @swagger
 * /merchant/editProducts:
 *   put:
 *     summary: Edit product details
 *     description: This API allows the admin to update product details, including the product name, description, price, quantity, weight, product status, product code, and optionally, the product photo.
 *     tags:
 *       - Merchant Panel --> Products, Categories ,Inboubd & Outbound Orders
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
 *                 description: The ID of the product to update.
 *                 example: 1
 *               productName:
 *                 type: string
 *                 description: The updated name of the product.
 *                 example: 'Smartphone X'
 *               productDescription:
 *                 type: string
 *                 description: The updated description of the product.
 *                 example: 'Latest model with 256GB storage'
 *               price:
 *                 type: number
 *                 description: The updated price of the product.
 *                 example: 599.99
 *               quantity:
 *                 type: integer
 *                 description: The updated quantity available for the product.
 *                 example: 50
 *               weight:
 *                 type: number
 *                 description: The updated weight of the product.
 *                 example: 0.6
 *               productStatus:
 *                 type: string
 *                 description: The updated status of the product (e.g., available, out of stock).
 *                 example: 'available'
 *               productCode:
 *                 type: string
 *                 description: The updated product code.
 *                 example: 'SKU-67890'
 *               productPhotoChange:
 *                 type: string
 *                 description: Indicates whether the product photo is being changed (true or false).
 *                 example: 'true'
 *               productImage:
 *                 type: string
 *                 description: The new product image (uploaded file). Required if `productPhotoChange` is true.
 *                 format: binary
 *     responses:
 *       '200':
 *         description: Successfully updated the product
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
 *       '400':
 *         description: Bad Request - Missing or invalid fields, or missing product image when changing the photo
 *         content:
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
 *         description: Internal Server Error - Error updating the product
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: '0'
 *                 message:
 *                   type: string
 *                   example: 'Error updating product'
 */

router.put("/editProducts",validateToken,uploadProductPic.single('productImage'),asyncMiddleware(merchantProductController.editProduct));


/**
 * @swagger
 * /merchant/getProducts:
 *   get:
 *     summary: Get all products
 *     description: This API allows the admin to fetch all products stored in the system.
 *     tags:
 *       - Merchant Panel --> Products, Categories ,Inboubd & Outbound Orders
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
 *         description: Successfully retrieved all products
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
 *                         description: The ID of the product.
 *                         example: 1
 *                       productName:
 *                         type: string
 *                         description: The name of the product.
 *                         example: 'Smartphone'
 *                       productDescription:
 *                         type: string
 *                         description: The description of the product.
 *                         example: 'Latest model with 128GB storage'
 *                       price:
 *                         type: number
 *                         description: The price of the product.
 *                         example: 499.99
 *                       quantity:
 *                         type: integer
 *                         description: The quantity available.
 *                         example: 100
 *                       weight:
 *                         type: number
 *                         description: The weight of the product.
 *                         example: 0.5
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

router.get("/getProducts",validateToken,asyncMiddleware(merchantProductController.getProducts));


/**
 * @swagger
 * /merchant/createOrder:
 *   post:
 *     summary: Create a new inbound or outbound order
 *     description: This API allows the admin to create a new order, either inbound or outbound, by providing the necessary order details such as order type, merchant reference, items, warehouse information, and receiving shelf code.
 *     tags:
 *       - Merchant Panel --> Products, Categories ,Inboubd & Outbound Orders
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
 *               orderType:
 *                 type: string
 *                 description: The type of the order (INBOUND or OUTBOUND).
 *                 example: 'INBOUND'
 *               merchantReference:
 *                 type: string
 *                 description: The merchant's reference number for the order.
 *                 example: 'ORD123456'
 *               items:
 *                 type: array
 *                 description: A list of items in the order.
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: integer
 *                       description: The ID of the product in the order.
 *                       example: 1
 *                     quantity:
 *                       type: integer
 *                       description: The quantity of the product ordered.
 *                       example: 10
 *               warehouseId:
 *                 type: integer
 *                 description: The ID of the warehouse where the products are stored.
 *                 example: 1
 *               receiveingWarehouse:
 *                 type: integer
 *                 description: The ID of the receiving warehouse (for OUTBOUND orders).
 *                 example: 2
 *               receiveingShelfCodeId:
 *                 type: integer
 *                 description: The ID of the receiving shelf code (for OUTBOUND orders).
 *                 example: 1
 *     responses:
 *       '200':
 *         description: Successfully created the order
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
 *                   example: 'INBOUND Order has been created with 10 products'
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The ID of the created order.
 *                         example: 1
 *                       orderType:
 *                         type: string
 *                         description: The type of the order.
 *                         example: 'INBOUND'
 *                       merchantReference:
 *                         type: string
 *                         description: The merchant's reference number for the order.
 *                         example: 'ORD123456'
 *                       productId:
 *                         type: integer
 *                         description: The ID of the product in the order.
 *                         example: 1
 *                       quantity:
 *                         type: integer
 *                         description: The quantity of the product ordered.
 *                         example: 10
 *       '400':
 *         description: Bad Request - Missing or invalid fields, or quantity greater than available stock
 *         content:
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
 *         description: Internal Server Error - Error creating the order
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: '0'
 *                 message:
 *                   type: string
 *                   example: 'Error creating order'
 */
router.post("/createOrder",validateToken,asyncMiddleware(merchantProductController.createInBoundOrder));


/**
 * @swagger
 * /merchant/getOrders:
 *   get:
 *     summary: Get all orders
 *     description: This API allows the admin to fetch all orders placed in the system.
 *     tags:
 *       - Merchant Panel --> Products, Categories ,Inboubd & Outbound Orders
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
 *         description: Successfully retrieved all orders
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
 *                   example: 'All Orders Fetched'
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The ID of the order.
 *                         example: 1
 *                       orderType:
 *                         type: string
 *                         description: The type of the order (e.g., INBOUND, OUTBOUND).
 *                         example: 'INBOUND'
 *                       merchantReference:
 *                         type: string
 *                         description: The merchant's reference number for the order.
 *                         example: 'ORD123456'
 *                       productId:
 *                         type: integer
 *                         description: The ID of the product in the order.
 *                         example: 1
 *                       quantity:
 *                         type: integer
 *                         description: The quantity of the product in the order.
 *                         example: 10
 *                       warehouseId:
 *                         type: integer
 *                         description: The ID of the warehouse for the order.
 *                         example: 1
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

router.get("/getOrders",validateToken,asyncMiddleware(merchantProductController.getOrderMerchant));


/**
 * @swagger
 * /merchant/inboundOrders:
 *   get:
 *     summary: Get all inbound orders
 *     description: This API allows the admin to fetch all inbound orders, including product details and associated warehouse information.
 *     tags:
 *       - Merchant Panel --> Products, Categories ,Inboubd & Outbound Orders
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
 *         description: Successfully retrieved all inbound orders
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
 *                   example: 'All INBOUND fetched'
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The ID of the order.
 *                         example: 1
 *                       orderType:
 *                         type: string
 *                         description: The type of the order (INBOUND).
 *                         example: 'INBOUND'
 *                       merchantReference:
 *                         type: string
 *                         description: The merchant's reference number for the order.
 *                         example: 'ORD123456'
 *                       merchantName:
 *                         type: string
 *                         description: The name of the merchant.
 *                         example: 'John Doe'
 *                       productId:
 *                         type: integer
 *                         description: The ID of the product in the order.
 *                         example: 1
 *                       productName:
 *                         type: string
 *                         description: The name of the product in the order.
 *                         example: 'Smartphone'
 *                       quantity:
 *                         type: integer
 *                         description: The quantity of the product in the order.
 *                         example: 10
 *                       warehouseId:
 *                         type: integer
 *                         description: The ID of the warehouse for the order.
 *                         example: 1
 *                       warehouseCompanyName:
 *                         type: string
 *                         description: The company name of the warehouse.
 *                         example: 'ABC Warehouse'
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

router.get("/inboundOrders",validateToken,asyncMiddleware(merchantProductController.getOrderInbound));


/**
 * @swagger
 * /merchant/outboundOrders:
 *   get:
 *     summary: Get all outbound orders
 *     description: This API allows the admin to fetch all outbound orders, including product details and associated warehouse information.
 *     tags:
 *       - Merchant Panel --> Products, Categories ,Inboubd & Outbound Orders
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
 *         description: Successfully retrieved all outbound orders
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
 *                   example: 'All OUTBOUND fetched'
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       orderType:
 *                         type: string
 *                         description: The type of the order (OUTBOUND).
 *                         example: 'OUTBOUND'
 *                       merchantReference:
 *                         type: string
 *                         description: The merchant's reference number for the order.
 *                         example: 'ORD123456'
 *                       merchantName:
 *                         type: string
 *                         description: The name of the merchant.
 *                         example: 'John Doe'
 *                       productId:
 *                         type: integer
 *                         description: The ID of the product in the order.
 *                         example: 1
 *                       productName:
 *                         type: string
 *                         description: The name of the product in the order.
 *                         example: 'Smartphone'
 *                       quantity:
 *                         type: integer
 *                         description: The quantity of the product in the order.
 *                         example: 10
 *                       warehouseId:
 *                         type: integer
 *                         description: The ID of the warehouse for the order.
 *                         example: 1
 *                       warehouseCompanyName:
 *                         type: string
 *                         description: The company name of the warehouse.
 *                         example: 'ABC Warehouse'
 *                       receiveingWarehouse:
 *                         type: integer
 *                         description: The ID of the receiving warehouse for the order.
 *                         example: 2
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

router.get("/outboundOrders",validateToken,asyncMiddleware(merchantProductController.getOrderOutbound))

//4. Attach address to Merchant

/**
 * @swagger
 * /merchant/attachaddress:
 *   post:
 *     summary: Attach a new address to a user
 *     description: This API allows the user to add a new address (pickup or dropoff) by providing address details. It will validate the postal code and associate the address with the user.
 *     tags:
 *       - Merchant Panel --> Products, Categories ,Inboubd & Outbound Orders
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the user to authenticate the request.
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
 *               type:
 *                 type: string
 *                 description: The type of the address (pickup or dropoff).
 *                 example: "pickup"
 *               addressData:
 *                 type: object
 *                 description: The details of the address to be added.
 *                 properties:
 *                   title:
 *                     type: string
 *                     description: The title or label for the address.
 *                     example: "LocalAddress"
 *                   streetAddress:
 *                     type: string
 *                     description: The street address.
 *                     example: "Str.No4, block B"
 *                   building:
 *                     type: string
 *                     description: The building number or name.
 *                     example: "4"
 *                   floor:
 *                     type: string
 *                     description: The floor number.
 *                     example: "0"
 *                   apartment:
 *                     type: string
 *                     description: The apartment number.
 *                     example: "21"
 *                   district:
 *                     type: string
 *                     description: The district or area name.
 *                     example: "Canal Bank Housing"
 *                   city:
 *                     type: string
 *                     description: The city name.
 *                     example: "Lahore"
 *                   province:
 *                     type: string
 *                     description: The province name.
 *                     example: "Punjab"
 *                   country:
 *                     type: string
 *                     description: The country name.
 *                     example: "Pakistan"
 *                   postalCode:
 *                     type: string
 *                     description: The postal code for the address.
 *                     example: "53125"
 *                   lat:
 *                     type: string
 *                     description: The latitude coordinate.
 *                     example: "1123545"
 *                   lng:
 *                     type: string
 *                     description: The longitude coordinate.
 *                     example: "115884"
 *     responses:
 *       '200':
 *         description: Successfully attached the address to the user
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
 *                   example: 'Address Saved'
 *                 data:
 *                   type: object
 *                   properties:
 *                     newAddress:
 *                       type: integer
 *                       description: The ID of the newly added address.
 *                       example: 1
 *       '400':
 *         description: Bad Request - Invalid or missing address data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: '0'
 *                 message:
 *                   type: string
 *                   example: 'Type not selected'
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
 *         description: Internal Server Error - Error saving the address
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: '0'
 *                 message:
 *                   type: string
 *                   example: 'Error saving address'
 */

router.post('/attachaddress', validateToken, asyncMiddleware(userController.addAddress));
// Merchnat creates Order Customer

/**
 * @swagger
 * /merchant/orderforCustomer:
 *   post:
 *     summary: Create an order for a customer
 *     description: This API allows the merchant to create an order for a customer, including customer details, items, and delivery instructions.
 *     tags:
 *       - Merchant Panel --> Products, Categories ,Inboubd & Outbound Orders
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the merchant to authenticate the request.
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
 *               items:
 *                 type: array
 *                 description: A list of items being ordered by the customer.
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: integer
 *                       description: The ID of the product being ordered.
 *                       example: 1
 *                     quantity:
 *                       type: integer
 *                       description: The quantity of the product ordered.
 *                       example: 2
 *               customerEmail:
 *                 type: string
 *                 description: The email address of the customer.
 *                 example: 'customer@example.com'
 *               customerName:
 *                 type: string
 *                 description: The name of the customer.
 *                 example: 'John Doe'
 *               contactNumber:
 *                 type: string
 *                 description: The contact number of the customer.
 *                 example: '+1234567890'
 *               deliveryInstruction:
 *                 type: string
 *                 description: Any special instructions for delivery.
 *                 example: 'Leave at the front door'
 *               addressData:
 *                 type: object
 *                 description: The address where the order should be delivered.
 *                 properties:
 *                   title:
 *                     type: string
 *                     description: The title or label for the address.
 *                     example: 'Home'
 *                   streetAddress:
 *                     type: string
 *                     description: The street address.
 *                     example: '123 Main St'
 *                   city:
 *                     type: string
 *                     description: The city for the delivery address.
 *                     example: 'Lahore'
 *                   province:
 *                     type: string
 *                     description: The province for the delivery address.
 *                     example: 'Punjab'
 *                   country:
 *                     type: string
 *                     description: The country for the delivery address.
 *                     example: 'Pakistan'
 *                   postalCode:
 *                     type: string
 *                     description: The postal code for the delivery address.
 *                     example: '53125'
 *     responses:
 *       '200':
 *         description: Successfully created the order for the customer
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
 *                   example: 'Customer Order Created'
 *                 data:
 *                   type: object
 *                   properties:
 *                     CustomerDetails:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           totalAmount:
 *                             type: number
 *                             description: The total amount for the order.
 *                             example: 100.99
 *                           customerEmail:
 *                             type: string
 *                             description: The email address of the customer.
 *                             example: 'customer@example.com'
 *                           customerName:
 *                             type: string
 *                             description: The name of the customer.
 *                             example: 'John Doe'
 *                     customerAddress:
 *                       type: object
 *                       properties:
 *                         title:
 *                           type: string
 *                           description: The title or label for the address.
 *                           example: 'Home'
 *                         streetAddress:
 *                           type: string
 *                           description: The street address.
 *                           example: '123 Main St'
 *                         city:
 *                           type: string
 *                           description: The city for the delivery address.
 *                           example: 'Lahore'
 *                         province:
 *                           type: string
 *                           description: The province for the delivery address.
 *                           example: 'Punjab'
 *                         country:
 *                           type: string
 *                           description: The country for the delivery address.
 *                           example: 'Pakistan'
 *                         postalCode:
 *                           type: string
 *                           description: The postal code for the delivery address.
 *                           example: '53125'
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
 *                   example: 'Entered Quantity is greater than Product Quantity'
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
 *         description: Internal Server Error - Error creating the order
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: '0'
 *                 message:
 *                   type: string
 *                   example: 'Error creating order'
 */

router.post("/orderforCustomer",validateToken,asyncMiddleware(merchantProductController.orderforCustomer))
// Get Orders created by Merchant

/**
 * @swagger
 * /merchant/getOrdersAll:
 *   get:
 *     summary: Get all orders created by the merchant
 *     description: This API allows the merchant to fetch all orders created by them, including customer orders and associated details.
 *     tags:
 *       - Merchant Panel --> Products, Categories ,Inboubd & Outbound Orders
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the merchant to authenticate the request.
 *         schema:
 *           type: string
 *           example: 'your-access-token-here'
 *     responses:
 *       '200':
 *         description: Successfully retrieved all orders created by the merchant
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
 *                   example: 'All Customer Order created by Merchants'
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The ID of the order.
 *                         example: 1
 *                       customerEmail:
 *                         type: string
 *                         description: The email address of the customer.
 *                         example: 'customer@example.com'
 *                       customerName:
 *                         type: string
 *                         description: The name of the customer.
 *                         example: 'John Doe'
 *                       totalAmount:
 *                         type: number
 *                         description: The total amount for the order.
 *                         example: 100.99
 *                       productId:
 *                         type: integer
 *                         description: The ID of the product in the order.
 *                         example: 1
 *                       quantity:
 *                         type: integer
 *                         description: The quantity of the product ordered.
 *                         example: 2
 *                       merchantId:
 *                         type: integer
 *                         description: The ID of the merchant.
 *                         example: 1
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
 *         description: Internal Server Error - Error fetching orders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: '0'
 *                 message:
 *                   type: string
 *                   example: 'Error in Fetching the Order'
 */

router.get("/getOrdersAll",validateToken,asyncMiddleware(merchantProductController.getOrdersAll))
// Create service Order

/**
 * @swagger
 * /merchant/serviceOrder/{orderId}:
 *   post:
 *     summary: Create a service order for a customer
 *     description: This API allows the merchant to create a service order for a customer, including the pickup address, warehouse details, and scheduling information.
 *     tags:
 *       - Merchant Panel --> Products, Categories ,Inboubd & Outbound Orders
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the merchant to authenticate the request.
 *         schema:
 *           type: string
 *           example: 'your-access-token-here'
 *       - in: path
 *         name: orderId
 *         required: true
 *         description: The ID of the order for which the service order is being created.
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
 *               pickupAddressType:
 *                 type: string
 *                 description: The type of pickup address (merchantAddress or warehouse).
 *                 example: 'warehouse'
 *               warehouseId:
 *                 type: integer
 *                 description: The ID of the warehouse where the product will be picked up.
 *                 example: 1
 *               pickupDate:
 *                 type: string
 *                 description: The date when the pickup will occur.
 *                 example: '2023-12-25'
 *               pickupStartTime:
 *                 type: string
 *                 description: The start time for the pickup.
 *                 example: '10:00'
 *     responses:
 *       '200':
 *         description: Successfully created the service order
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
 *                   example: 'Service Order has been created'
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The ID of the newly created service order.
 *                       example: 1
 *                     total:
 *                       type: number
 *                       description: The total amount of the service order.
 *                       example: 100.99
 *       '400':
 *         description: Bad Request - Invalid or missing fields
 *         content:
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
 *         description: Internal Server Error - Error creating the service order
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: '0'
 *                 message:
 *                   type: string
 *                   example: 'Error creating service order'
 */

router.post("/serviceOrder/:orderId",validateToken,asyncMiddleware(merchantProductController.serviceOrder))

//!_____________________________Dashboard,Inventory_____________________________//


/**
 * @swagger
 * /merchant/merchantInventory:
 *   get:
 *     summary: Get merchant inventory details
 *     description: This API allows the merchant to fetch details about the inventory, including the total quantity available, in-transit quantity, and damaged quantity for a specific product in a given warehouse.
 *     tags:
 *       - Merchant Panel --> Inventory & Dashboard
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the merchant to authenticate the request.
 *         schema:
 *           type: string
 *           example: 'your-access-token-here'
 *       - in: query
 *         name: warehouseId
 *         required: true
 *         description: The ID of the warehouse to fetch inventory details for.
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: productId
 *         required: true
 *         description: The ID of the product to fetch inventory details for.
 *         schema:
 *           type: integer
 *           example: 1001
 *     responses:
 *       '200':
 *         description: Successfully retrieved the merchant's inventory details
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
 *                   example: 'Data Fetched'
 *                 data:
 *                   type: object
 *                   properties:
 *                     warehouseAndQuantity:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           productWarehouseQuantity:
 *                             type: integer
 *                             description: The total quantity of the product in the warehouse.
 *                             example: 100
 *                     intransitProduct:
 *                       type: integer
 *                       description: The total quantity of the product in transit.
 *                       example: 20
 *                     damageProducts:
 *                       type: integer
 *                       description: The total quantity of the damaged products.
 *                       example: 5
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
 *                   example: 'Invalid or missing parameters'
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
 *         description: Internal Server Error - Error retrieving the inventory details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: '0'
 *                 message:
 *                   type: string
 *                   example: 'Error fetching inventory data'
 */

router.get("/merchantInventory",validateToken,asyncMiddleware(merchantProductController.merchantInventory))

//===================Merchant Dashboard=============>>

/**
 * @swagger
 * /merchant/merchantDashboard:
 *   get:
 *     summary: Get merchant dashboard data
 *     description: This API allows the merchant to fetch their dashboard data, including inbound orders, outbound orders, and all products in inventory.
 *     tags:
 *       - Merchant Panel --> Inventory & Dashboard
 *     parameters:
 *       - in: header
 *         name: accessToken
 *         required: true
 *         description: The access token of the merchant to authenticate the request.
 *         schema:
 *           type: string
 *           example: 'your-access-token-here'
 *     responses:
 *       '200':
 *         description: Successfully retrieved the merchant's dashboard data
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
 *                     InboundOrder:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: The ID of the inbound order.
 *                             example: 1
 *                           orderType:
 *                             type: string
 *                             description: The type of the order (INBOUND).
 *                             example: 'INBOUND'
 *                           productName:
 *                             type: string
 *                             description: The name of the product in the order.
 *                             example: 'Product A'
 *                           quantity:
 *                             type: integer
 *                             description: The quantity of the product in the inbound order.
 *                             example: 20
 *                     OutBoundOrders:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: The ID of the outbound order.
 *                             example: 2
 *                           orderType:
 *                             type: string
 *                             description: The type of the order (OUTBOUND).
 *                             example: 'OUTBOUND'
 *                           productName:
 *                             type: string
 *                             description: The name of the product in the order.
 *                             example: 'Product B'
 *                           quantity:
 *                             type: integer
 *                             description: The quantity of the product in the outbound order.
 *                             example: 15
 *                     AllProductsInInventory:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           productName:
 *                             type: string
 *                             description: The name of the product in the inventory.
 *                             example: 'Product A'
 *                           productWarehouseQuantity:
 *                             type: integer
 *                             description: The total quantity of the product in the warehouse.
 *                             example: 50
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
 *         description: Internal Server Error - Error fetching dashboard data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: '0'
 *                 message:
 *                   type: string
 *                   example: 'Error fetching dashboard data'
 */

router.get("/merchantDashboard",validateToken,asyncMiddleware(merchantProductController.merchantDashboard))
















module.exports = router;