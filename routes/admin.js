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
router.post('/signin', asyncMiddleware(adminController.signIn))
// ! Module 2: Customer
// 1.  Get all customer
router.get('/allcustomers', validateToken, checkPermission,  asyncMiddleware(adminController.getAllCustomers)) 
//2. Get customer details
router.get('/customerdetails', validateToken, checkPermission,  asyncMiddleware(adminController.customerDetailsById))
//3. Get booking details
router.get('/bookingdetails', validateToken, checkPermission, asyncMiddleware(adminController.bookingDetails))

// ! Module 3: Driver
// 1.  Get all driver
router.get('/alldrivers', validateToken, checkPermission, asyncMiddleware(adminController.getAllDrivers) ) 
//2. Get customer details
router.get('/driverdetails', validateToken, checkPermission, asyncMiddleware(adminController.driverDetailsById))
//3. Change user status
router.put('/userstatus', validateToken, checkPermission, asyncMiddleware(adminController.blockUnblockUser))
//4. Approve driver
router.put('/approvedriver', validateToken, checkPermission,  asyncMiddleware(adminController.approveDriver))
//5.  Get driver wallet
router.get('/driver/wallet', validateToken, checkPermission, asyncMiddleware(adminController.driverWallet) ) 
//5.  Get driver wallet
router.post('/driver/pay', validateToken, checkPermission, asyncMiddleware(adminController.payToDriver) ) 

// ! Module 4: Warehouses
// 1.  Get all driver
router.get('/allwarehouses', validateToken, checkPermission, asyncMiddleware(adminController.getAllWarehouse)) 
//2. Get customer details
router.get('/warehousedetails/:id', validateToken, checkPermission, asyncMiddleware(adminController.warehouseDetails))
//3. Get address using search filter 
router.post('/getaddresses', validateToken, checkPermission, asyncMiddleware(adminController.searchAddress))
//4. Create warehouse 
router.post('/createwarehouse', validateToken, checkPermission, asyncMiddleware(adminController.createWarehouse));
//5. Update warehouse 
router.put('/updatewarehouse', validateToken, checkPermission, asyncMiddleware(adminController.updateWarehouse));
//6. Delete warehouse 
router.put('/deletewarehouse', validateToken, checkPermission, asyncMiddleware(adminController.deleteWarehouse));
//7. Add warehouse Location
router.post('/warehouselocationAdd',validateToken,checkPermission,asyncMiddleware(adminController.warehouselocationAdd))
//8. Edit Warehouse Location
router.put("/editWarehouseLocation",validateToken,checkPermission,asyncMiddleware(adminController.editWarehouseLocation))
//9. Delete Warehouse Information
router.delete("/deleteLocation/:warehouseLocationId",validateToken,checkPermission,asyncMiddleware(adminController.deleteLocation))

//=========================Warehouse Zones============================//
router.post("/wareHouseZoneAdd",validateToken,checkPermission,asyncMiddleware(adminController.wareHouseZoneAdd))

router.put("/editwarehouseZone",validateToken,checkPermission,asyncMiddleware(adminController.editwarehouseZone))

router.delete("/deleteZone/:zoneId",validateToken,checkPermission,asyncMiddleware(adminController.deleteZone))

//! ______________________________Module creating the order Inbound,Outbound______________________________!//

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
router.post('/addbanner', validateToken, checkPermission, upload.single('image'), asyncMiddleware(adminController.addBanner))
//2. Get all banners
router.get('/getallbanners', validateToken, checkPermission, asyncMiddleware(adminController.getAllBanners));
//3. Update a banner
router.put('/updatebanner', validateToken, checkPermission, upload.single('image'), asyncMiddleware(adminController.updateBanner))
//4. Change banner status
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
router.post('/addcategory', validateToken, checkPermission, asyncMiddleware(adminController.addCategory))
//2. Get all categorys
router.get('/getallcategory', validateToken, checkPermission, asyncMiddleware(adminController.getAllCategory));
//3. Update a category
router.put('/updatecategory', validateToken, checkPermission, asyncMiddleware(adminController.updateCategory))
//4. Change category status
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
router.post('/addvehicle',  validateToken, checkPermission,uploadVehicleTypeImage.single('image'), asyncMiddleware(adminController.addVehicle))
//2. Get all vehicles
router.get('/getallvehicle', validateToken, checkPermission, asyncMiddleware(adminController.getAllVehicle));
//3. Update a vehicle
router.put('/updatevehicle', validateToken, checkPermission, uploadVehicleTypeImage.single('image'), asyncMiddleware(adminController.updateVehicle))
//4. Change vehicle status
router.put('/vehiclestatus', validateToken, checkPermission, asyncMiddleware(adminController.changeVehicleStatus))

// ! Module 12: Units  
//*___________________
// 1. Add new unit
router.post('/addappunit', validateToken, checkPermission, asyncMiddleware(adminController.addAppUnit));
// 2. Get all Units
router.get('/currentsystemunits', validateToken, checkPermission, asyncMiddleware(adminController.currentSystemUnits));
// 3. update unit
router.get('/getallunits', validateToken, checkPermission, asyncMiddleware(adminController.getAllUnits)); 
//4. Get unit types addUnit
router.get('/getunitstypes', validateToken, checkPermission, asyncMiddleware(adminController.getUnitsTypes));
//5.  Add Unit 
router.post('/addunit', validateToken, checkPermission, asyncMiddleware(adminController.addUnit));
//5.  Update Unit  
router.put('/updateunit', validateToken, checkPermission, asyncMiddleware(adminController.updateUnit));
//5.  Update Unit 
router.put('/updateunitstatus', validateToken, checkPermission, asyncMiddleware(adminController.updateUnitStatus));

// ! Module 13: Support
// 2. Get support data
router.get('/getsupport', validateToken, checkPermission, asyncMiddleware(adminController.getSupport));
// 3. Update support
router.put('/updatesupport', validateToken, checkPermission, asyncMiddleware(adminController.updateSupport));

// ! Module 14: FAQs
// 1. Add new FAQ
router.post('/addfaq', validateToken, checkPermission, asyncMiddleware(adminController.addFAQ));
// 2. Get all Units
router.get('/allfaqs', validateToken, checkPermission, asyncMiddleware(adminController.allFAQs));
// 3. update FAQ
router.put('/updatefaq', validateToken, checkPermission, asyncMiddleware(adminController.updateFAQ));
// 4. Change FAQ status  
router.put('/changefaqstatus', validateToken, checkPermission, asyncMiddleware(adminController.changeFAQStatus));
// 4. Delete FAQ
router.put('/deletefaqs', validateToken, checkPermission, asyncMiddleware(adminController.deleteFAQ));

// ! Module 15: Charges\
//*_________________________________________________________________________________
/* 1. General Charges  */
// /-------------------------------
// 1.1 Get general charges 
router.get('/getgencharges', validateToken, checkPermission, asyncMiddleware(adminController.getGenCharges));
// 1.2 Update general charges 
router.put('/updategencharges', validateToken, checkPermission, asyncMiddleware(adminController.updateGenCharges));

/* 2. Distance Charges  */
// /-------------------------------
// 2.1 Add Distance charge
router.post('/adddistancecharge', validateToken, checkPermission, asyncMiddleware(adminController.addDistCharge));
// 2.2 Get Distance charge
router.get('/getdistancecharge', validateToken, checkPermission, asyncMiddleware(adminController.getDistCharges));
// 2.3 Update Distance charge
router.put('/updatedistancecharge', validateToken, checkPermission, asyncMiddleware(adminController.updateDistCharge));
// 2.4 Delete Distance charge
router.put('/deletedistancecharge', validateToken, checkPermission,  asyncMiddleware(adminController.deleteDistCharge));

/* 3. Weight Charges  */
// /-------------------------------
// 3.1 Add weight charge
router.post('/addweightcharge', validateToken, checkPermission, asyncMiddleware(adminController.addWeightCharge));
// 3.2 Get weight charge
router.get('/getweightcharge', validateToken, checkPermission, asyncMiddleware(adminController.getWeightCharges));
// 3.3 Update weight charge
router.put('/updateweightcharge', validateToken, checkPermission, asyncMiddleware(adminController.updateWeightCharge));
// 3.4 Delete weight charge
router.put('/deleteweightcharge', validateToken, checkPermission, asyncMiddleware(adminController.deleteWeightCharge));

/* 4. Volumetric weight Charges  */
// /-------------------------------
// 4.1 Add VW charge
router.post('/addvolweicharge', validateToken, checkPermission, asyncMiddleware(adminController.addVWCharge));
// 4.2 Get VW charge
router.get('/getvolweicharge', validateToken, checkPermission, asyncMiddleware(adminController.getVWCharges));
// 4.3 Update VW charge
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
router.post('/registerprofile',validateToken, uploadProfile.single('profileImage'), checkPermission, asyncMiddleware(adminController.registerStep1))
// 2. Update Driver Profile
router.put('/updateDriverProfile',validateToken,checkPermission,asyncMiddleware(adminController.updateDriverProfile))
// 3. Update Driver Vehicle
router.put('/updateDriverVehicle', validateToken,uploadProfile.single('profileImage'),checkPermission,asyncMiddleware(adminController.updateDriverVehicle))
// Update Driver Status
router.put('/updateDriverStatus', validateToken,checkPermission,asyncMiddleware(adminController.updateDriverStatus))
// getSpecifiWearhouseDrivers
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
router.post('/vehilceinfo', validateToken,checkPermission, uploadVeh.array('vehImages', 10), asyncMiddleware(adminController.registerStep2))
//6.  Get active warehouse
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
router.post('/licenseinfo',validateToken, checkPermission, uploadLic.fields([{name: 'frontImage', maxCount: 1}, {name: 'backImage', maxCount: 1} ]) , asyncMiddleware(adminController.registerStep3))

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
router.get('/orderDetails', validateToken, checkPermission, asyncMiddleware(adminController.orderDetatils));
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
router.post('/pushnotifications', validateToken , checkPermission, asyncMiddleware(adminController.throwNot));
router.get('/getnotdata', validateToken, checkPermission, asyncMiddleware(adminController.getAllPushNot));
router.post('/resendnotification', validateToken , checkPermission, asyncMiddleware(adminController.resendNot));
router.put('/deletenotification', validateToken, checkPermission, asyncMiddleware(adminController.delNot));

// ! 27. Employees
//1. Get all employee
router.get('/getallemployees', validateToken, checkPermission, asyncMiddleware(adminController.getAllEmployees));
//2. Employee details
router.get('/employeedetail', validateToken, checkPermission, asyncMiddleware(adminController.employeeDetail));
//3. Get active roles
router.get('/activeroles', validateToken, asyncMiddleware(adminController.activeRoles));
//4. Add Employee
router.post('/addemployee', validateToken, checkPermission, asyncMiddleware(adminController.addEmployee));
//5. Update employee
router.put('/employeeupdate', validateToken, checkPermission, asyncMiddleware(adminController.employeeUpdate));
//6. Change employee status
router.put('/changestatus', validateToken, checkPermission, asyncMiddleware(adminController.employeeStatus));

// ! 28. Roles & Permissions
// 1. Get all roles
router.get('/allroles', validateToken, checkPermission, asyncMiddleware(adminController.allRoles));
// 2. Get permissions associated with a role
router.get('/rolepermissions', validateToken, checkPermission, asyncMiddleware(adminController.roleDetails));
// 3. Active features
router.get('/activefeatures', validateToken, asyncMiddleware(adminController.activeFeatures));
// 3. Add new role
router.post('/addrole', validateToken, checkPermission, asyncMiddleware(adminController.addRole));
// 4. Update a role
router.put('/updaterole', validateToken, checkPermission, asyncMiddleware(adminController.updateRole));
// 5. Update status of role
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
router.get('/getLogCompanies',validateToken, checkPermission, asyncMiddleware(adminController.getLogCompanies));
// 2. Add Logistic Company
router.post('/addLogCompany', validateToken, checkPermission,uploadcompanyLogo.single('image'), asyncMiddleware(adminController.addLogCompany));
// 3. Update Logistic Company
router.put('/updateLogCompany', validateToken, checkPermission,uploadcompanyLogo.single('image'), asyncMiddleware(adminController.updateLogCompany));
// 4. Delete Logistic Company
router.put('/changeCompanyStatus', validateToken, checkPermission, asyncMiddleware(adminController.changeLogCompanyStatus));
// 5. Get Logistic Company Charges
router.get('/getLogCharges',validateToken,checkPermission,asyncMiddleware(adminController.getChargesForLog))
// 6. Update Logistic Company Charges
router.put('/updateLogCharges',validateToken,checkPermission,asyncMiddleware(adminController.updateChargesForLog))
// 7. Add Logistic Company Charges
router.post('/addChargesForLog',validateToken,checkPermission,asyncMiddleware(adminController.addChargesForLog))
// 8. Update status of Logistic Company Charges
router.put('/updateStatusChargesForLog',validateToken,checkPermission,asyncMiddleware(adminController.updateStatusChargesForLog))
// 9. delete Logistic Company Charges
router.put('/deleteChargesForLog',validateToken,checkPermission,asyncMiddleware(adminController.deleteChargesForLog))
// 10. get all active Logistic Componies
router.get('/activeLog',validateToken,checkPermission,asyncMiddleware(adminController.activeLog))


// ! Module: Webpolicy
//*_______________________________________________________________________
router.get('/privacypolicy', validateToken, checkPermission, asyncMiddleware(adminController.getPrivacyPolicy));
router.put('/updateprivacypolicy', validateToken, checkPermission, asyncMiddleware(adminController.updatePrivacyPolicy));
router.get('/termsconditions', validateToken, checkPermission, asyncMiddleware(adminController.getTermsConditions));
router.put('/updatetermsconditions', validateToken, checkPermission, asyncMiddleware(adminController.updateTermsConditions));

router.get('/all-booking-statuses',validateToken,asyncMiddleware(userController.allBookingStatus))
router.put('/update-booking-status',validateToken,asyncMiddleware(userController.updateBookingStatus))
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
router.post('/restricteditem', uploadItemImage.single('image'), validateToken, checkPermission, asyncMiddleware(adminController.addRestrictedItem))
router.get('/restricteditem',validateToken, checkPermission, asyncMiddleware(adminController.getRestrictedItem))
router.put('/restricteditem',  validateToken, checkPermission, uploadItemImage.single('image'), asyncMiddleware(adminController.updateRestrictedItem))
router.put('/changestatusrestricteditem', validateToken, checkPermission, asyncMiddleware(adminController.changeStatusRestrictedItem))
router.put('/deleterestricteditem', validateToken, checkPermission, asyncMiddleware(adminController.deleteRestrictedItem))

// ! Module: dashboard
//*_______________________________________________________________________
router.get('/homepage', validateToken, checkPermission, asyncMiddleware(adminController.homePage));

// ! check driver reg step
//*_______________________________________________________________________
router.post('/checkregstep',validateToken, checkPermission , asyncMiddleware(adminController.checkDriverRegStep))

// ! Admin get Bussiness User

router.get("/getBusinessUser",asyncMiddleware(adminController.adminBussinessCheck))

//! Merchant Admin router

router.get("/merchantDashboard",asyncMiddleware(adminController.merchantDashboard))

router.post("/registerMerchant",uploadProfile.single('profileImage'),asyncMiddleware(adminController.registerMerchant))

//! Merchant Product create , Add categories ,Subcategories
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
router.post("/createProducts",uploadProductPic.single('productImage'),validateToken,checkPermission,asyncMiddleware(adminController.createProducts))
//create categories
router.post("/createCategories",validateToken,checkPermission,asyncMiddleware(adminController.createCategories))
//get categories
router.get("/getCategories",asyncMiddleware(adminController.getCategories))
//create Subcategories
router.post("/Subcategories",validateToken,checkPermission,asyncMiddleware(adminController.Subcategories))
//get subcategories
router.get("/getSubcategories",validateToken,checkPermission,asyncMiddleware(adminController.getSubcategories))
//create barcodes for Product
router.post("/createBarCode",validateToken,checkPermission,asyncMiddleware(adminController.createBarCode))
//edit products
router.put("/editProduct",validateToken,checkPermission,asyncMiddleware(adminController.editProduct))
//get Products
router.get("/getProducts",validateToken,checkPermission,asyncMiddleware(adminController.getProducts))
//get categories and subcategories on the basis of Names
router.get("/getCatandSubCatName",validateToken,checkPermission,asyncMiddleware(adminController.getCatandSubCatName))
//check tracking number
router.post("/checktrackingNumber/:trackNumber",asyncMiddleware(adminController.checktrackingNumber))
//create service for assign to merchant
router.post("/createService",validateToken,checkPermission,asyncMiddleware(adminController.createService))
module.exports = router;
