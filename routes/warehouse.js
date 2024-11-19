const express = require('express');
const router = express();
const userController = require('../controller/warehouse');
const asyncMiddleware = require('../middleware/async');
const validateToken = require('../middleware/validateAdmin');
const checkwarehousePermission=require('../middleware/checkwarehousePermission')
const multer = require('multer');
const path = require('path');

// ! Module 1: Authentication 
router.post('/distance-calculator', asyncMiddleware(userController.distanceCalculator))
router.post('/emailtesting', asyncMiddleware(userController.emailTesting))            
router.post('/pushNot', asyncMiddleware(userController.notficationsTesting));
router.post('/signupone', asyncMiddleware(userController.registerWarehouse));
router.post('/signuptwo', asyncMiddleware(userController.provideInfo));
router.post('/signin', asyncMiddleware(userController.signIn));
router.post('/requestotp', asyncMiddleware(userController.sendOTP));
router.post('/verifyotp', asyncMiddleware(userController.verifyOTP));
router.put('/resetpassword', asyncMiddleware(userController.resetPassword));
router.get('/getprofile', validateToken, asyncMiddleware(userController.profileData));


// ! Module 1: Authentication 
//1. General Data 
router.get('/dashboard/general', validateToken, asyncMiddleware(userController.generalDashboard));
//2. Recent activity 
router.get('/dashboard/recent', validateToken, asyncMiddleware(userController.getRecentActivity));

//! Module 2: Booking 
router.get('/bookings', validateToken,checkwarehousePermission, asyncMiddleware(userController.getAllbookings));
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
router.post('/totransit', validateToken,checkwarehousePermission, asyncMiddleware(userController.toTransit));

// ! Module 4: In-transit

//1. In-Transit groups
router.get('/intransitgroups', validateToken,checkwarehousePermission, asyncMiddleware(userController.inTransitBookings));
//2. In-Transit group details
router.post('/intransitgroupdetails', validateToken,checkwarehousePermission, asyncMiddleware(userController.transitGroupDetails));
//3. Received at warehouse from transporter
router.post('/transitRecived', validateToken, checkwarehousePermission,asyncMiddleware(userController.receivedFromTransporter));

// ! Module 5: Outgoing from warehouse
//1. All incoming bookings
router.get('/alloutgoing', validateToken,checkwarehousePermission, asyncMiddleware(userController.outgoingFromWareHouse));
//2. Get all associated drivers
router.get('/allassociateddrivers', validateToken, checkwarehousePermission,asyncMiddleware(userController.getWarehouseDrivers));
//3. Assign driver to booking
router.post('/assigndriver', validateToken, checkwarehousePermission,asyncMiddleware(userController.assignOrderToDriver));
//4. Self pickup bookings
router.get('/selfpickupbookings', validateToken, checkwarehousePermission,asyncMiddleware(userController.selfPickupOutgoing));
//5. Self pickup handed over
router.post('/selfpickupdelivered', validateToken,checkwarehousePermission, asyncMiddleware(userController.selfPickupDelivered));
//6. order handed over to the driver
router.post('/handedOver',validateToken,checkwarehousePermission,asyncMiddleware(userController.handedOver))

// ! Module 5: Address__________________
router.post('/address',validateToken,checkwarehousePermission, asyncMiddleware(userController.addAddress));
router.get('/address',validateToken,checkwarehousePermission, asyncMiddleware(userController.getAddress)); 
router.get('/address/:id',validateToken, checkwarehousePermission,asyncMiddleware(userController.getAddressById));
router.put('/address',validateToken, checkwarehousePermission,asyncMiddleware(userController.updateAddress));
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
router.post('/packageArrived',validateToken,checkwarehousePermission,asyncMiddleware(userController.packageArrived))
// 8. update Remeasurement
router.post('/remeasurement',validateToken,checkwarehousePermission,asyncMiddleware(userController.createRemeasurement));
// 9. update consolidate order measurements
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
router.post('/registerstep3', validateToken, uploadLic.fields([{name: 'frontImage', maxCount: 1}, {name: 'backImage', maxCount: 1} ]) , asyncMiddleware(userController.registerStep3));
//2. Get all associated drivers
router.get('/alldrivers', validateToken, checkwarehousePermission,asyncMiddleware(userController.getWarehouseDriversAll));
// update driver profile
router.put('/updateDriverProfile',validateToken,checkwarehousePermission,asyncMiddleware(userController.updateDriverProfile));
// update driver vehicle
router.put('/updateDriverVehicle',validateToken,checkwarehousePermission,asyncMiddleware(userController.updateDriverVehicle));
// update status of the driver
router.put('/updateDriverStatus',validateToken,checkwarehousePermission,asyncMiddleware(userController.updateDriverStatus));
// get driver details
router.get('/driverdetails', validateToken, checkwarehousePermission,asyncMiddleware(userController.driverDetailsById));
// update driver license info
router.put('/updateDriverLicense',validateToken,uploadLic.fields([{name: 'frontImage', maxCount: 1}, {name: 'backImage', maxCount: 1} ]),asyncMiddleware(userController.updateDriverLicense));
// delete Driver 
router.delete('/deleteDriver',validateToken,checkwarehousePermission,asyncMiddleware(userController.deleteUser))
// ! Module 7: Create Driver

//1. Completed bookings 
router.get('/compeltedbookings', validateToken, asyncMiddleware(userController.completedBookings));

// ! Module 9: profile management
// 1. Get profile details by user Id
router.get('/profile',validateToken, asyncMiddleware(userController.profile_management));

// ! Module 10: virtual box
// 1. Get Virtual Box details by virtual box number
router.get('/virtualBox/:id',validateToken, checkwarehousePermission,asyncMiddleware(userController.virtualBox));


// ! Module 11: Tracking
// 1. Get booking details by tracking Id
router.post('/trackorder', asyncMiddleware(userController.bookingDetailsByTracking));


// ! Module 11: dashboard
// 1. homepage

router.get('/homepage',validateToken,asyncMiddleware(userController.homePage))
router.get('/logistic-companies',validateToken,asyncMiddleware(userController.getLogCompaniesForFilter))
router.post('/to-direct-deliver',validateToken,asyncMiddleware(userController.toDirectDelivery))
router.post('/mark-deliver',validateToken,asyncMiddleware(userController.markDeliver))

router.get('/all-booking-statuses',validateToken,asyncMiddleware(userController.allBookingStatus))
router.put('/update-booking-status',validateToken,asyncMiddleware(userController.updateBookingStatus))
router.get('/all-active-warehouse',validateToken,asyncMiddleware(userController.getActiveWarehouse))
router.post('/tracking-on-parcel',validateToken,asyncMiddleware(userController.addTrackingOnParcel))
router.post('/tracking-on-booking',validateToken,asyncMiddleware(userController.addTrackingOnbooking))
  
router.get('/getallcategory', validateToken, asyncMiddleware(userController.getAllCategory));
router.get('/associated-jobs',  asyncMiddleware(userController.allAssociatedJobs));

//! Module 12:Warehouse Imventory and Orders:
//Add locations in Warehouse
router.post("/addLocation",validateToken,checkwarehousePermission,asyncMiddleware(userController.warehouselocation));
//Add Zones in the warehouse
router.post("/addZones",validateToken,checkwarehousePermission,asyncMiddleware(userController.wareHouseZone));
//get Locations in Warehouse
router.get("/getLocations",validateToken,checkwarehousePermission,asyncMiddleware(userController.getLocations));
//Get all the Warehouse Orders
router.get("/getInboundOrderWarehouse",validateToken,asyncMiddleware(userController.getInboundOrderWarehouse));
//Inspect Order
router.post("/InspectOrder/:inboundOrderId",asyncMiddleware(userController.InspectOrder))
//Statuses get for the  Conformation of Inbound Order
router.get("/InboundOrderStatuses",asyncMiddleware(userController.InboundStatuses))
//Order Received at Warehouse and Set Status
router.put("/orderWarehouseReached/:inboundOrderId",asyncMiddleware(userController.orderReceived))
//Get the Shelf Codes
router.get("/getshelfsCode",asyncMiddleware(userController.getshelfsCode))
//Get Order Statuses putway and Available Set to order
router.get("/statusesforAvailable",asyncMiddleware(userController.statusesforAvailable));
//To set Order to Putaway State
router.put("/putawayStatus/:inboundOrderId",asyncMiddleware(userController.markOrderPutaway))
//To set Order to Avavilable State
router.put("/orderAvailable/:inboundOrderId",asyncMiddleware(userController.orderAvailableState))
//Get Outbound Order
router.get("/getOutboundOrders",asyncMiddleware(userController.getOutboundOrders));
// Get All Outbound Orders To Assign to the Associate
router.get("/getOutboundOrdersforAssociate",validateToken,asyncMiddleware(userController.getOrdersAssignedtoAssociate));
//Assign Order To Associate
router.post("/assignOrderToAssociate",asyncMiddleware(userController.orderAssignedToAssociates))

//===========Inbound, Outbound Orders dashboard============>
router.get("/warehouseDashboard",validateToken,asyncMiddleware(userController.warehouseDashboard))


//=======================Warehouse Inventory======================>

router.get("/warehouseInventory",validateToken,asyncMiddleware(userController.warehouseInventoryName))

//===============Service Order===================>

// get Service Orders
router.get("/getServiceOrder",validateToken,asyncMiddleware(userController.getServiceOrder))

//confirm service Order
router.put("/confirmServiceOrder/:serviceOrderId",asyncMiddleware(userController.confirmServiceOrder))


// ! Warehouse Associates

router.get("/getBatchOrders",validateToken,asyncMiddleware(userController.getBatchOutboundOrders))

router.post("/associatePickOrder/:outboundOrderId",asyncMiddleware(userController.associatePickedOrder))

router.post("/associatePackingOrder/:outboundOrderId",asyncMiddleware(userController.associatePackingOrder))

router.post("/associatePackedOrder/:outboundOrderId",asyncMiddleware(userController.OrderPacked))




// ! 13. Employees
//1. Get all employee
router.get('/getallemployees', validateToken, checkwarehousePermission, asyncMiddleware(userController.getAllEmployees));
//2. Employee details
router.get('/employeedetail', validateToken, checkwarehousePermission, asyncMiddleware(userController.employeeDetail));
//3. Get active roles
router.get('/activeroles', validateToken, asyncMiddleware(userController.activeRoles));
//4. Add Employee
router.post('/addemployeeWarehouse', validateToken, checkwarehousePermission, asyncMiddleware(userController.addEmployee));
//5. Update employee
router.put('/employeeupdate', validateToken, checkwarehousePermission, asyncMiddleware(userController.employeeUpdate));
//6. Change employee status
router.put('/changestatus', validateToken, checkwarehousePermission, asyncMiddleware(userController.employeeStatus));


// ! 14. Roles & Permissions
// 1. Get all roles
router.get('/allroles', validateToken, checkwarehousePermission, asyncMiddleware(userController.allRoles));
// 2. Get permissions associated with a role
router.get('/rolepermissions', validateToken, checkwarehousePermission, asyncMiddleware(userController.roleDetails));
// 3. Active features
router.get('/activefeatures', validateToken, asyncMiddleware(userController.activeFeatures));
// 3. Add new role
router.post('/addWarehouserole', validateToken, checkwarehousePermission, asyncMiddleware(userController.addRole));
// 4. Update a role
router.put('/updaterole', validateToken, checkwarehousePermission, asyncMiddleware(userController.updateRole));
// 5. Update status of role
router.put('/updatestatusrole', validateToken, checkwarehousePermission, asyncMiddleware(userController.updateRoleStatus));
//==========check trackingnumber
router.post("/checktrackingNumber/:trackNumber",asyncMiddleware(userController.checktrackingNumber))


//! Never Received Packges
//=================Get all packages with neverArrived Status
router.get("/packagesNeverReceived",validateToken,asyncMiddleware(userController.packagesNeverReceived))

//====================Order for Never Received Packages
router.post("/OrderForNeverReceivedPkg/:pkgId",validateToken,asyncMiddleware(userController.OrderForNeverReceivedPkg))

//====================Get details of Never Received Packages
router.get("/packagesNeverReceivedDetails/:pkgId",validateToken,asyncMiddleware(userController.packagesNeverReceivedDetails))








module.exports = router;