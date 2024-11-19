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
router.post('/st2register', uploadVeh.array('vehImages', 10), asyncMiddleware(driverController.registerStep2))
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

router.post('/st3register', uploadLic.fields([{name: 'frontImage', maxCount: 1}, {name: 'backImage', maxCount: 1} ]) , asyncMiddleware(driverController.registerStep3))
router.post('/uploadLic', validateToken, uploadLic.fields([{name: 'frontImage', maxCount: 1}, {name: 'backImage', maxCount: 1} ]) , asyncMiddleware(driverController.uploadLic))
// 6. Login Driver
router.post('/signin', asyncMiddleware(driverController.login))
//7. Forget password request
router.post('/forgetpasswordrequest', asyncMiddleware(driverController.forgetPasswordRequest));
//8. Verify OTP for password change
router.post('/verifyotpforpass', asyncMiddleware(driverController.verifyOTPforPassword));
//9. Change password in resposne to otp
router.post('/changepasswordotp', asyncMiddleware(driverController.changePasswordOTP));
//9. Change password in profile
router.post('/changepassword', validateToken, asyncMiddleware(driverController.changePassword));
// 10. Resend OTP
router.post('/resendotp', asyncMiddleware(driverController.resendOTP))
//11. Session API
router.get('/session', validateToken, asyncMiddleware(driverController.session));
//12. Log out
router.get('/logout', validateToken ,asyncMiddleware(driverController.logout));
//13. Delete user
router.get('/delete', validateToken, asyncMiddleware(driverController.deleteUser));

// ! _________________________________________________________________________
// ! Module 2: Home Page and order handling
//1. Home page api
router.get('/homepage', validateToken, asyncMiddleware(driverController.homePageApi));
//2. Jobs by Date filter
router.post('/jobsbydate', validateToken, asyncMiddleware(driverController.jobsByDateFilter));
//3. Get all associated jobs 
router.post('/associatedjobs', validateToken, asyncMiddleware(driverController.allAssociatedJobs))
//4. Get reasons for postpone
router.get('/getReasons', validateToken, asyncMiddleware(driverController.getReasons))
//5. Postpone a booking
router.post('/postponedBooking', validateToken, asyncMiddleware(driverController.postponedBooking))
//6. Change Status - cancelled
router.post('/cancelled', validateToken, asyncMiddleware(driverController.cancelled))

// ! _________________________________________________________________________
// ! Sub module 2.1: Delivery side
//1. Booking Details
router.post('/bookingdetails', validateToken, asyncMiddleware(driverController.bookingDetailsById))
//2. Assigned to On going jobs 
router.post('/assignedtoongoing', validateToken, asyncMiddleware(driverController.pJobsToOngoing))
//3. Change Status - picked
router.post('/picked', validateToken, asyncMiddleware(driverController.picked))
//4. Book Job Delivery
router.post('/bookJobDelivery', validateToken, asyncMiddleware(driverController.bookJobDelivery))
//5. Group Detail Delivery
router.post('/groupDetailDelivery', validateToken, asyncMiddleware(driverController.groupDetailDelivery))
//6. Reached Delivery
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
router.post('/deliveredDelivery', validateToken, uploadSig.single('signatureFile') , asyncMiddleware(driverController.deliveredDelivery))

// ! _____________________________________ ____________________________________
// ! Module 3: Profile

//1. get profile
router.get('/getProfile', validateToken, asyncMiddleware(driverController.getProfile))
//2. update profile
router.post('/updateProfile', uploadProfile.single('profileImage'), validateToken, asyncMiddleware(driverController.updateProfile))
//3. get vehicle Detail
router.get('/getVehData', validateToken, asyncMiddleware(driverController.getVehData))
//4. update vehicle Detail
router.post('/updateVehData', validateToken, asyncMiddleware(driverController.updateVehData))
//5. disable vehicle image
router.post('/disableVehicImage', validateToken, asyncMiddleware(driverController.disableVehicImage))
//6. get customer support
router.get('/getCustomerSupport', validateToken, asyncMiddleware(driverController.getCustomerSupport))
//7. completed orders
router.get('/getCompletedOrders', validateToken, asyncMiddleware(driverController.getCompletedOrders))
//8. delete licence
router.post('/deleteLic', validateToken, asyncMiddleware(driverController.deleteLic))
//9. get wallet
router.get('/getWallet', validateToken, asyncMiddleware(driverController.getWallet))
//10. add bank
router.post('/addBank', validateToken, asyncMiddleware(driverController.addBank))
//11. send withdraw request
router.post('/updateBank', validateToken, asyncMiddleware(driverController.updateBank))
//12. send withdraw request
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