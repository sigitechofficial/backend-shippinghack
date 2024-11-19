const express = require('express');
const router = express();
const userController = require('../controller/customer');
const userControllerN = require('../controller/warehouse');
const adminController=require('../controller/admin')
const asyncMiddleware = require('../middleware/async');
const validateToken = require('../middleware/validateToken');
const multer = require('multer');
const path = require('path');
const Stripe = require('../controller/stripe')
const driverController = require('../controller/driver');
// ! Module 1: Authentication 
//1. Send OTP for registration
router.post('/sendotp', asyncMiddleware(userController.sendOTP))
router.post('/resendOTP', asyncMiddleware(userController.resendOTP))
router.post('/verifyotpsignup', asyncMiddleware(userController.verifyOTPforSignUp))


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

//2. Register user
router.post('/register', uploadProfile.single('profileImage'), asyncMiddleware(userController.registerUser));

router.post('/registerUserMobile', uploadProfile.single('profileImage'), asyncMiddleware(userController.registerUserMobile));
//3. Sign in the user
router.post('/login', asyncMiddleware(userController.signInUser));
//4. Forget password request
router.post('/forgetpasswordrequest', asyncMiddleware(userController.forgetPasswordRequest));
//5. Verify OTP for password change
router.post('/verifyotp', asyncMiddleware(userController.verifyOTPforPassword));
//6. Change password in resposne to otp
router.post('/changepasswordotp', asyncMiddleware(userController.changePasswordOTP));
//7. Session API
router.get('/session', validateToken, asyncMiddleware(userController.session));
//8. Log out
router.get('/logout', validateToken ,asyncMiddleware(userController.logout));
//9. Delete user
router.post('/delete', validateToken, asyncMiddleware(userController.deleteUser));
//10. Session API
router.post('/guestuser', asyncMiddleware(userController.guestUser));

// ! Module 2: Home & Send Parcel
// 1. Homepage 
router.get('/homepage', validateToken, asyncMiddleware(userController.homepage))
//
//router.get('/pdf',  asyncMiddleware(userController.downloadLabelDEMO))
// shipping Calculater
router.post('/shippingCalculater', asyncMiddleware(userController.shippingCalculater))
// 2. Get all required IDs 
router.get('/idsforbooking', validateToken, asyncMiddleware(userController.idsForBooking))
// 3. get Charges
router.post('/getcharges', validateToken, asyncMiddleware(userController.getcharges));
// 4. create booking - International orders
router.post('/createbookingint', validateToken, asyncMiddleware(userController.createOrderInt));
//
router.post('/addDropOfAddress', validateToken, asyncMiddleware(userController.dropOfAddress));
// 5. create booking - Local orders
router.post('/createbookingloc', validateToken, asyncMiddleware(userController.createOrderLoc)); 
// 6. Cancel booking 
router.post('/cancelbooking', validateToken, asyncMiddleware(userController.cancelBooking));
//
router.get('/cancelbookingReacons', validateToken, asyncMiddleware(userController.cancelbookingReacons));

// 7. expected Packages
router.get('/expectedPackages', validateToken, asyncMiddleware(userController.expectedPackages));
// 8. PAckages in warehouse
router.get('/packagesInWarehouse', validateToken, asyncMiddleware(userController.packagesInWarehouse));
// 9. Sent Packages
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
router.get('/restricteditems', asyncMiddleware(userController.fetchRestrictedItems));

// ! Module 4: Drawer 
//1. Get user profile 
router.get('/getprofile', validateToken, asyncMiddleware(userController.getProfile));
//2. update user profile 
router.put('/updateprofile', validateToken, uploadProfile.single('profileImage'), asyncMiddleware(userController.updateProfile));
//3. Get all attached addresses
router.get('/getattachaddresses', validateToken, asyncMiddleware(userController.savedAddressesOfUser));
//4. Attach address to user
router.post('/attachaddress', validateToken, asyncMiddleware(userController.addAddress));
//5. Unattach address to user 
router.post('/unattachaddress', validateToken, asyncMiddleware(userController.unattachAddressToUser));
//6. Get order of a user 
router.get('/myorders', validateToken, asyncMiddleware(userController.myOrders));
//7. Get order details 
router.post('/chooseLogisticCompany', validateToken, asyncMiddleware(userController.chooseLogisticCompany));
//
router.post('/orderdetails', validateToken, asyncMiddleware(userController.orderDetails));
//8. Get support and privacy
router.get('/links', validateToken, asyncMiddleware(userController.supportData));
//9. Update password
router.post('/updatepassword', validateToken, asyncMiddleware(userController.updatePassword));
///
router.put('/updateAddress', validateToken, asyncMiddleware(userController.updateAddress));


//. Change default address
router.put('/changedefault', validateToken, asyncMiddleware(userController.changeDefaultAddress));
router.get('/downloadpdf', asyncMiddleware(userController.downloadPDF));

// Custom Routes

router.get('/getAllCategory', validateToken,asyncMiddleware(adminController.getAllCategory));

router.get('/getLogCompanies',validateToken, asyncMiddleware(adminController.getLogCompanies));

// ! Module 5: Rating
// 1. Add/Skip rating
router.post('/addskiprating', validateToken, asyncMiddleware(userController.addSkipRating));
// 2. Booking whose rating is pending
router.get('/pendingratingbookings', validateToken, asyncMiddleware(userController.unRatedBookings));

// ! Reasons

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
router.post('/trackorder', asyncMiddleware(userController.bookingDetailsByTracking));
// ! Module : Shopify API's
router.get('/allProducts', asyncMiddleware(userController.allProducts));
router.get('/Orders', asyncMiddleware(userController.Orders));
router.post('/shopifyOrderDetails', asyncMiddleware(userController.shopifyOrderDetails));
router.post('/shopifyOrder', asyncMiddleware(userController. shopifyOrder));
// ! Module  : Payment___________________
router.post('/payment', asyncMiddleware(userController.payment));
// ! Module : Cards__________________
router.post('/addCard',validateToken, asyncMiddleware(userController.addCard));
// Get All Cards
router.get('/cards',validateToken, asyncMiddleware(userController.GetCustomercards));

router.put('/deletecard',validateToken, asyncMiddleware(userController.deletecards));
//
router.post('/downloadLabel', validateToken, asyncMiddleware(userController.downloadLabel));
//
router.post('/makepaymentbynewcard', validateToken, asyncMiddleware(userController.makepaymentbynewcard));
//
router.post('/makepaymentBySavedCard', validateToken, asyncMiddleware(userController.makepaymentBySavedCard));

//Stripe checkout Sessions
router.post('/checkoutSessionsCheck',validateToken,asyncMiddleware(userController.checkoutSessionsCheck))

//Language Update Key
router.put('/changeLanguageApi',validateToken,asyncMiddleware(userController.changeLanguageApi))

//Get Session
router.post("/retrieveSession",asyncMiddleware(userController.retrieveSession))

//get Intent
router.post("/intentGet",asyncMiddleware(userController.intentGet))

//!---------------------------Stripe Checkout Webhooks-------------------------------->>
router.post("/StripeWebhook",asyncMiddleware(userController.stripeWebhook))

//!---------------------------Track Fedex Order-------------------------------->>

router.post("/trackFedexOrder",asyncMiddleware(userController.trackFedexOrder))
module.exports = router;