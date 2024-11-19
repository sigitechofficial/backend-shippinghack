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
const validateToken = require('../middleware/validateAdmin'); 
const checkPermission = require('../middleware/checkPermission');
const { file } = require('pdfkit');
const CustomException = require('../middleware/errorObject');



router.post('/sendotp', asyncMiddleware(merchantController.sendOTP))
router.post('/resendOTP', asyncMiddleware(merchantController.resendOTP))
router.post('/verifyotpsignup', asyncMiddleware(merchantController.verifyOTPforSignUp))

// for taking profile picture of customer
const uploadProfileImgs = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, `./Public/Profile`)
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
        cb(null, `./Public/productImages`)
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
        cb(null,'./Public/csvFiles')
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
router.post('/register', uploadProfile.single('profileImage'), asyncMiddleware(merchantController.registerUser));
// Sign in the Merchant
router.post('/login', asyncMiddleware(merchantController.signInUser));


// ! _____________________________Products Creation Controllers_______________________________________ // !

router.post('/uploadProducts', upload.single('file'), asyncMiddleware(merchantProductController.createProductfromCSV));

router.post('/createProduct',uploadProductPic.single('productImage'),asyncMiddleware(merchantProductController.createProducts));

router.post("/createCategories",asyncMiddleware(merchantProductController.createCategories));

router.get("/getCategories",asyncMiddleware(merchantProductController.getCategories));

router.post("/createSubcategories",asyncMiddleware(merchantProductController.createSubcategories))

router.get("/getSubcategories",asyncMiddleware(merchantProductController.getSubcategories))

router.post("/createBarcodes",asyncMiddleware(merchantProductController.createBarCode))

router.put("/editProducts",uploadProductPic.single('productImage'),asyncMiddleware(merchantProductController.editProduct));

router.get("/getProducts",asyncMiddleware(merchantProductController.getProducts));

router.post("/createOrder",validateToken,asyncMiddleware(merchantProductController.createInBoundOrder));

router.get("/getOrders",asyncMiddleware(merchantProductController.getOrderMerchant));

router.get("/inboundOrders",asyncMiddleware(merchantProductController.getOrderInbound));

router.get("/outboundOrders",asyncMiddleware(merchantProductController.getOrderOutbound))

//4. Attach address to Merchant
router.post('/attachaddress', validateToken, asyncMiddleware(userController.addAddress));
// Merchnat creates Order Customer
router.post("/orderforCustomer",validateToken,asyncMiddleware(merchantProductController.orderforCustomer))
// Get Orders created by Merchant
router.get("/getOrdersAll",validateToken,asyncMiddleware(merchantProductController.getOrdersAll))
// Create service Order
router.post("/serviceOrder/:orderId",validateToken,asyncMiddleware(merchantProductController.serviceOrder))

//!_____________________________Dashboard,Inventory_____________________________//

router.get("/merchantInventory",asyncMiddleware(merchantProductController.merchantInventory))

//===================Merchant Dashboard=============>>
router.get("/merchantDashboard",validateToken,asyncMiddleware(merchantProductController.merchantDashboard))
















module.exports = router;