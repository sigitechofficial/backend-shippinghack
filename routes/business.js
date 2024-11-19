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
router.post('/registerBusiness', asyncMiddleware(businessController.registerBusiness))
router.post('/resendOTP', asyncMiddleware(businessController.resendOTP))
router.post('/verifyotpsignup', asyncMiddleware(businessController.verifyOTPforSignUp))

//3. Sign in the user
router.post('/login', asyncMiddleware(businessController.signInUser));
//4. Forget password request
router.post('/forgetpasswordrequest', asyncMiddleware(businessController.forgetPasswordRequest));
//5. Verify OTP for password change
router.post('/verifyotp', asyncMiddleware(businessController.verifyOTPforPassword));
//6. Change password in resposne to otp
router.post('/changepasswordotp', asyncMiddleware(businessController.changePasswordOTP));
//7. Session API
router.get('/session', validateToken, asyncMiddleware(businessController.session));
//8. Log out
router.get('/logout', validateToken ,asyncMiddleware(businessController.logout));
//9. Delete user
router.post('/delete', validateToken, asyncMiddleware(businessController.deleteUser));
//9. Get All Subscription Plans
router.post('/SubscriptionPlans', validateToken, asyncMiddleware(businessController.SubscriptionPlans));
//9. choose Subscription Plan
router.post('/choosePlan', validateToken, asyncMiddleware(businessController.choosePlan));

// ! Subscription Create
//*____________________________________________________________________

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


//-----------------------Brain Tree Routes-----------------//

router.post("/PlanCreate",asyncMiddleware(businessController.createPlanController));

router.post("/CreateCustomer",validateToken,asyncMiddleware(businessController.createCustomer))

router.post("/CreateSubscription",validateToken,asyncMiddleware(businessController.createSubscriptionController))

router.post("/newCard",validateToken,asyncMiddleware(businessController.storeNewCard))

router.get('/getSubscription',asyncMiddleware(businessController.getSubscriptionDetailsController));

router.get("/getAllPlans",asyncMiddleware(businessController.getAllPlansBT));

router.get("/expiryDate",asyncMiddleware(businessController.expiryDate));

router.post("/WebHooks",asyncMiddleware(businessController.WebHooks));

router.post("/CancelSubscription",asyncMiddleware(businessController.subscriptionCancelsBraintree))

router.put("/cardUpdate",validateToken,asyncMiddleware(businessController.btcardUpdate));


router.delete("/paymentMethodRevoked",asyncMiddleware(businessController.PaymentRevoked))

router.get("/getPlanById",asyncMiddleware(businessController.getPlanByID));

router.get("/customerAllCards",validateToken,asyncMiddleware(businessController.customerCards));

router.put("/planUpdate",asyncMiddleware(businessController.planUpdate));

router.get("/getSubID",validateToken,asyncMiddleware(businessController.getCustomerActiveSubscription))

router.put("/convertCustomer",validateToken,asyncMiddleware(businessController.customerConvert))

router.post("/fedexGetInfo",asyncMiddleware(businessController.fedexGet))

router.get("/checkCustomer",validateToken,asyncMiddleware(businessController.checkBrainTreeCustomer))




module.exports = router;