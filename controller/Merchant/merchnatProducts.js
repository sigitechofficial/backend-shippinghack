require("dotenv").config();
//importing Models
const {
  user,
  otpVerification,
  deviceToken,
  banner,
  products,
  merchantCategories,
  merchantOrder,
  warehouseinventories,
  productOrder,
  merchantcustomerorders,
  merchantSubcategories,
  merchantOrderStatuses,
  bookingType,
  shipmentType,
  category,
  size,
  userPlan,
  addressDBS,
  coupon,
  booking,
  bookingStatus,
  bookingHistory,
  userType,
  cancelledBooking,
  userAddress,
  mblAppDynamic,
  unit,
  unitClass,
  structureType,
  province,
  district,
  corregimiento,
  distanceCharges,
  weightCharges,
  volumetricWeightCharges,
  generalCharges,
  billingDetails,
  links,
  support,
  warehouse,
  rating,
  estimatedBookingDays,
  driverPaymentSystem,
  driverDetail,
  vehicleType,
  FAQs,
  wallet,
  genAppSetting,
  defaultUnit,
  structQuestion,
  webUser,
  ecommerceCompany,
  appUnits,
  units,
  package,
  logisticCompany,
  restrictedItems,
  reason,
  logisticCompanyCharges,
} = require('../../models');
const Shopify = require("shopify-api-node");
//! Shopify Instance
const shopify = new Shopify({
  shopName: process.env.SHOP_NAME,
  apiKey: process.env.SHOPIFY_API_KEY,
  password: process.env.SHOPIFY_APP_PASSWORD,
  apiVersion: "2024-04",
});
const csv = require('csv-parser');
const getDistance = require("../../utils/distanceCalculator");
const {
  pickupDelivery,
  accountCreated,
  orderPlaced,
  emailOTP,
  socialMediaLinks,
  emailButton,
  scheduleDelivery,
} = require("../../helper/emailsHtml");
const socialLinks = socialMediaLinks();
const { attachment } = require("../../helper/attactments");
const attach = attachment();
const { STRIPE_PUBLISHABLE_KEY, STRIPE_SECRET_KEY } = process.env;
const stripe = require("stripe")(STRIPE_SECRET_KEY);
//Brain tree
const Braintree = require("../braintree");
const {
  BtsubscriptionCreateMail,
  BtsubscriptionCancelMail,
  subscriptionExpireFun,
} = require("../../helper/brainTreemails");

// Importing Custom exception
const CustomException = require("../../middleware/errorObject");
//importing redis
const redis_Client = require("../../routes/redis_connect");
const { sign } = require("jsonwebtoken");
const Stripe = require("../stripe");
// OTP generator
const otpGenerator = require("otp-generator");
//const sendNotification = require('../helper/throwNotification');
//const stripe = require('stripe')(process.env.STRIPE_KEY);
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const { v4: uuidv4 } = require('uuid');
const fedex=require("../fedex")
// Calling mailer
const nodemailer = require("nodemailer");
const {attachments}=require("../../helper/attachment")
const attachmentss = attachments();
const sequelize = require("sequelize");
// Barcode generator
var JsBarcode = require("jsbarcode");
var fs = require("fs");
var path = require("path");
const PDFDocument = require("pdfkit");
//var { createCanvas } = require("canvas");
var CryptoJS = require("crypto-js");

const { getDateAndTime, returnFunction } = require("../../utils/helperFuncCompany");
// Defining the account for sending email
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  //secure: true, // use TLS
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});
const axios = require("axios");
var randomstring = require("randomstring");
const {
  registerUserEmail,
  createBooking,
  forgetUserEmail,
} = require("../../helper/emailsHtml");
const { DOMImplementation, XMLSerializer } = require("xmldom");
const xmlSerializer = new XMLSerializer();
const document = new DOMImplementation().createDocument(
  "http://www.w3.org/1999/xhtml",
  "html",
  null
);
const svgNode = document.createElementNS("http://www.w3.org/2000/svg", "svg");
const svg2img = require("svg2img");
const {
  currentAppUnitsId,
  unitsConversion,
  unitsSymbolsAndRates,
} = require("../../utils/unitsManagement");
const { type } = require("os");
const moment = require("moment");
const throwNotification=require('../../helper/throwNotification');
const { title } = require("process");

/*
            1. Create Products through CSV
    ________________________________________
*/

async function createProductfromCSV(req,res) {

    if(!req.file){
        throw new CustomException('No file uploaded')
    }

    //const filePath=path.join(__dirname,'../../Public/csvFiles',req.file.filename);

    const fileBuffer = req.file.buffer;
    const fileStream = require('stream').Readable.from(fileBuffer);

    fileStream
    .pipe(csv())
    .on('data',async(row)=>{
        try {

            const imageFileName=row.image;

            const imagePath=path.join(__dirname,'../../Public/productImages/',imageFileName);
            if (!fs.existsSync(imagePath)) {
                throw new CustomException(`Image file ${imageFileName} not found`);
            }

            const findCatName=await merchantCategories.findOne({
              where:{
                title:row.merchantCategoryName,
              },
              attributes:['id','title']
            })
            console.log("🚀 ~ .on ~ findCatName:", findCatName.title)

            const findSubCat=await merchantSubcategories.findOne({
              where:{
                title:row.subCategoryName,
              },
              attributes:['id','title']
            })
            console.log("🚀 ~ .on ~ findSubCat:", findSubCat)

            await products.create({
              productName:row.productName,
                merchantCategoryId:findCatName.id,
                productDescription:row.productDescription,
                merchantCategoryName:findCatName.title,
                image:row.image,
                productCode:row.productCode,
                price:parseFloat(row.price),
                quantity:parseInt(row.quantity, 10),
                weight:parseFloat(row.productWeight),
                unit:row.unit,
                productStatus:row.productStatus,
                subCategoryName:findSubCat.title,
                merchantsubcategoriesId:findSubCat.id,

            })
            
        } catch (error) {
          console.log(error)
          throw  new CustomException(error.message);
        }
    })
    .on('end',()=>{
        // fs.unlinkSync(filePath);
        return res.json(returnFunction("1","Products Created Sucessfully"));
    })
    .on('error', (error) => {
      console.error('Error processing CSV file:', error);
      res.status(500).json({ message: 'Error processing CSV file', error });
  });

}

/*
            2. Create Products
    ________________________________________
*/

async function createProducts(req,res) {

  const{productName,image,productDescription,price,quantity,weight,unit,productStatus,productCode,merchantCategoryId,merchantCategoryName,subCategoryName,merchantSubcategoryId}=req.body;

  let productImage=null;

  console.log("Req File------------------->",req.file);
  if(req.file){
    let tmpproductImage = req.file.path;
    productImage = tmpproductImage.replace(/\\/g, "/");
  }


  const findcatName=await merchantCategories.findOne({
    where:{
      id:merchantCategoryId
    },
    attributes:['id','title']
  })
  console.log("🚀 ~ createProducts ~ findcatName:", findcatName)

  const findsubCat=await merchantSubcategories.findOne({
    where:{
      id:merchantSubcategoryId,
    },
    attributes:['id','title']
  })
  console.log("🚀 ~ createProducts ~ findsubCat:", findsubCat)

  //return res.json(findsubCat);

  const createProducts=await products.create({
    productName,
    productDescription,
    price,
    quantity,
    weight,
    unit:'lbs',
    image:productImage,
    productStatus,
    productCode,
    merchantCategoryId,
    merchantSubcategoryId,
    merchantCategoryName:findcatName.title,
    subcategoryName:findsubCat.title,

  })

  console.log("createProducts===============>",createProducts)


  let code = otpGenerator.generate(6, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
  code = `TSH-${productName}-${code}`;
  // Creating barcode
  JsBarcode(svgNode, code, {
    xmlDocument: document,
  });
  const svgText = xmlSerializer.serializeToString(svgNode);
  svg2img(svgText, function (error, buffer) {
    fs.writeFileSync(`Public/productsBarcode/${code}.png`, buffer);
  });

  await products.update(
    {
      code,
      barCode:`Public/Barcodes/${code}.png`,
    },
    { where: {  id:createProducts.id } }
  );

  return res.json(returnFunction("1","Products are Created",createProducts))

  
}
/*
            3. Create Categories 
         .___________________________.
*/


async function createCategories(req,res){
  const{title,status}=req.body

  const categoriesCreate=await merchantCategories.create({
    title,
    status
  })

  return res.json(returnFunction("1","Categories Added",categoriesCreate))
}



/*
             Get Categories 
         .___________________________.
*/

async function getCategories(req,res) {

const getCategories=await merchantCategories.findAll();

return res.json(returnFunction("1","Fetched All Categories",getCategories))
  
}




/*
           Create SubCategories 
         .___________________________.
*/
async function createSubcategories(req,res) {
  const{title,description,status}=req.body

  const createSubCat=await merchantSubcategories.create({
    title,
    description,
    status
  })

  return res.json(returnFunction("1","SubCategory created",createSubCat))
  
}

/*
           Get SubCategories 
         .___________________________.
*/

async function getSubcategories(req,res) {


  const getSubcategories=await merchantSubcategories.findAll();


  return res.json(returnFunction("1","Fetched All Subcategories",getSubcategories))
  
}


/*
            4. Create BarCodes 
         .___________________________.
*/

async function createBarCode(req,res){

  const{productIds}=req.body;
  if (!Array.isArray(productIds) || productIds.length === 0) {
    return res.status(400).json({ error: 'Product IDs array is required and should not be empty' });
  }

  const updatePromises=productIds.map(async (productId)=>{
    let code = otpGenerator.generate(6, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });
    code = `TSH-${productId}-${code}`;
    // Creating barcode
    JsBarcode(svgNode, code, {
      xmlDocument: document,
    });
    const svgText = xmlSerializer.serializeToString(svgNode);
    svg2img(svgText, function (error, buffer) {
      fs.writeFileSync(`Public/productsBarcode/${code}.png`, buffer);
    });
  
    await products.update(
      {
        code,
        barCode:`Public/Barcodes/${code}.png`,
      },
      { where: {  id:productId } }
    );

  })

  await Promise.all(updatePromises);


  return res.json(returnFunction("1",'Product barcodes updated successfully',))
  
}

/*
            5. Edit Products
         .___________________________.
*/

async function editProduct(req,res) {

  const{id,productName,image,productDescription,price,quantity,weight,productStatus,productCode,merchantCategoryId,productPhotoChange}=req.body;

  let tempImg=null;
  let newProductImage;

  if(productPhotoChange==='true'){
    if(!req.file){

      throw new CustomException("Add Product Photo")
    
    }
    tempImg=req.file.path;
    newProductImage=tempImg.replace(/\\/g, "/");

  }

 
  const productUpdate=await products.update({
    productName,
    productDescription,
    price,
    quantity,
    weight,
    image:productPhotoChange==='true'?newProductImage:undefined,
    productStatus,
    productCode,
    merchantCategoryId:1,
  },{
    where:{
      id:id,
    }
  })


  return res.json(returnFunction("1","Product Updated Sucessfully"));

  
}

/*
            6. Get Products 
         .___________________________.
*/

async function getProducts(req,res) {

  const getProducts=await products.findAll();
  // console.log("🚀 ~ getProducts ~ getProducts:", getProducts)


  return res.json(returnFunction("1","All Products Fetched",getProducts))

}

/*
            7. Create Order to Send to Warehouse 
         ._______________________________________.
*/

async function createInBoundOrder(req, res) {
  const {
    orderType, 
    merchantReference, 
    merchantName, 
    merchantId, 
    items, 
    warehouseId, 
    logisticCompanyId, 
    receiveingWarehouse,
    receiveingShelfCodeId
  } = req.body;

  let merchantID = req.user.id;
  const finduser = await user.findByPk(merchantID, {
    attributes: ['firstName', 'lastName']
  });
  
  //console.log("🚀 ~ createInBoundOrder ~ finduser:", finduser);

  const fullName = `${finduser.firstName} ${finduser.lastName}`;

  const orderPromises = items.map(async (product) => {
    const { productId, quantity } = product;


    const productquantity=await products.findOne({
      where:{
        id:productId
  
      },
      attributes:['id','quantity']
    })
    console.log("🚀 Before ~ orderPromises ~ productquantity:", productquantity)
    if(orderType==='INBOUND'){

      if(productquantity.quantity>=quantity){

        productquantity.quantity=productquantity.quantity-quantity;
        await productquantity.save();
      }else{
        throw new CustomException("Entered Quantity is greater than Product Quantity")
      }

    }
    return await merchantOrder.create({
      orderType,
      receiveingWarehouse: orderType === 'OUTBOUND' ? receiveingWarehouse : null,
      merchantReference,
      merchantName: fullName,
      merchantId: merchantID,
      productId,  
      quantity,  
      warehouseId,
      merchantorderstatusesId: 1,
      receiveingShelfCodeId:orderType === 'OUTBOUND'?receiveingShelfCodeId:null
    });
  });

 
  const orderCreate = await Promise.all(orderPromises);

  if(orderType==='OUTBOUND' && receiveingWarehouse ){
    console.log("This Condition runs for the warehouse to warehouse transfer===========>");
    
    const ordermade=items.map(async(product)=>{
      const{productId,quantity}=product;

      return await merchantOrder.create({
        orderType: 'INBOUND',
        receiveingWarehouse: null, 
        merchantReference,
        merchantName: fullName,
        merchantId: merchantID,
        productId,
        quantity,
        warehouseId: receiveingWarehouse,  
        merchantorderstatusesId: 1,  
      });

    })

  }

  const merchantdvToken=await deviceToken.findAll({
    where:{
      userId:merchantID,
    },
    attributes:['tokenId']
  })

  let to=[];
  if(merchantdvToken.length===0){
    throw new CustomException("No device token found")
  }else{
    to=merchantdvToken.map((token)=>token.tokenId)
  }

  let notification = {
    title: `${orderType} Order`,
    body: `${orderType} Order has been created with ${orderCreate.length} products from Merchant`
  };
  throwNotification(to, notification);

  console.log("🚀 ~ createInBoundOrder ~ orderCreate:", orderCreate);

  return res.json(returnFunction("1", `${orderType} Order has been created with ${orderCreate.length} products`, orderCreate));
}


/*
            8. Get Merchant Orders 
         .___________________________.
*/

async function getOrderMerchant(req,res){

  const allOrders=await merchantOrder.findAll();
  console.log("🚀 ~ getOrderMerchant ~ allOrders:", allOrders)

  return res.json(returnFunction("1","All Orders Fetched",allOrders))
}


/*
            10. Merchant Orders Inbound
         .___________________________.
*/

async function getOrderInbound(req,res) {

  const merchantinboundOrder=await merchantOrder.findAll({
    where:{
      orderType:'INBOUND',
    },
    include:[{
      model:products,
      attributes:['productName']
    },{
      model:warehouse,
      attributes:['companyName']
    }],
    attributes:['id','orderType','merchantReference','merchantName','productId','quantity','warehouseId','merchantId','merchantorderstatusesId']
  })
  console.log("🚀 ~ getOrderInbound ~ merchantinboundOrder:", merchantinboundOrder)


  return res.json(returnFunction("1",`All ${merchantinboundOrder[0].orderType} fetched`,merchantinboundOrder))
  
}


/*
            11. Merchant Orders OUTBOUND
         .___________________________.
*/

async function getOrderOutbound(req,res) {

  const merchantotboundOrder=await merchantOrder.findAll({
    where:{
      orderType:'OUTBOUND',
    },
    include:[{
      model:products,
      attributes:['productName']
    },{
      model:warehouse,
      attributes:['companyName']
    }],
    attributes:['orderType','merchantReference','merchantName','productId','quantity','warehouseId','merchantId','merchantorderstatusesId','receiveingwarehouse']
  })
  console.log("🚀 ~ getOrderInbound ~ merchantinboundOrder:", merchantotboundOrder)


  return res.json(returnFunction("1",`All ${merchantotboundOrder[0].orderType} fetched`,merchantotboundOrder))
  
}


// !_________________________Merchant Inventory_________________________//

async function merchantInventory(req,res) {
  const{warehouseId,productId}=req.body

  const findWarehouse=await warehouseinventories.findAll({
    where:{
      warehouseId:warehouseId,
    },
    include:[{
      model:warehouse,
      attributes:['companyName']
    }],
    attributes:['productWarehouseQuantity']
  })
  console.log("🚀 ~ merchantDashboard ~ findWarehouse:", findWarehouse)

  const inTransitProducts=await merchantOrder.findAll({
    where:{
      warehouseId:warehouseId,
      merchantorderstatusesId:1,
      productId:productId,
    },
    attributes:['quantity']

  })

  const totalIntransitProduct=inTransitProducts.reduce((ele,product)=>{
    return ele+product.quantity
  },0)

  const damageProducts=await productOrder.findAll({
    where:{
      productId:productId,
    },
    attributes:['damagedQuantity']
  })
  console.log("🚀 ~ merchantInventory ~ damageProducts:", damageProducts)

  const totalDamageProducts=damageProducts.reduce((ele,product)=>{
    return ele+product.damagedQuantity
  },0)

  let outObj={
    warehouseAndQuantity:findWarehouse,
    intransitProduct:totalIntransitProduct,
    damageProducts:totalDamageProducts,
  }


  return res.json(returnFunction("1","Data Fetched",outObj))
}

//! ________________________Merchant Dashboard____________________//

async function merchantDashboard(req,res) {

  const merchantId=req.user.id

  const allInboundOrder=await merchantOrder.findAll({
    where:{
      orderType:'INBOUND',
      merchantId:merchantId,
      merchantorderstatusesId:1,
    }
  })
  console.log("🚀 ~ merchantDashboard ~ allInboundOrder:", allInboundOrder)

  const allOutboundOrders=await merchantOrder.findAll({
    where:{
      merchantId:merchantId,
      orderType:'OUTBOUND',
      merchantorderstatusesId:1
    }
  })
  console.log("🚀 ~ merchantDashboard ~ allOutboundOrders:", allOutboundOrders)

  const allProducts=await warehouseinventories.findAll({
    where:{
      merchantId:merchantId,
    },
    attributes:['productName','productWarehouseQuantity']
  })
  console.log("🚀 ~ merchantDashboard ~ allProducts:", allProducts)
  


  let outObj={
    InboundOrder:allInboundOrder,
    OutBoundOrders:allOutboundOrders,
    AllProductsInInventory:allProducts,
  }

  return res.json(returnFunction("1","Dashboard Data",outObj))

}
  
// !_______________________Order for Customer__________________________//

async function orderforCustomer(req,res) {

  const{items,customerEmail,customerName,contactNumber,deliveryInstruction}=req.body
  let merchantID=req.user.id
  console.log("🚀 ~ orderforCustomer ~ merchantID:", merchantID)
  const { addressData } = req.body;
  const data = addressData;

  const addressCreate=await addressDBS.create(data)
  console.log("🚀 ~ orderforCustomer ~ addressCreate:", addressCreate.id)

  // return res.json(addressCreate)

  let totalAmount=0;

  const orderPromises = items.map(async (product) => {
    const { productId, quantity } = product;


    const productquantity=await products.findOne({
      where:{
        id:productId
  
      },
      attributes:['id','quantity','price']
    })
    console.log("🚀 Before ~ orderPromises ~ productquantity:", productquantity)
    if(productquantity){

      if(productquantity.quantity>=quantity){

        const productTotalPrice= productquantity.price*quantity;
        totalAmount+=productTotalPrice

        productquantity.quantity-=quantity;
        await productquantity.save();
      }else{
        throw new CustomException("Entered Quantity is greater than Product Quantity")
      }
      
    }
    console.log("🚀 ~ orderPromises ~ merchantID:", merchantID)
    return await merchantcustomerorders.create({
      totalAmount:productquantity.price * quantity,
      customerEmail,
      customerName,
      contactNumber,
      merchantId: merchantID,
      deliveryInstruction,
      productId,  
      quantity, 
      merchantorderstatusesId: 1,
      addressDBId:addressCreate.id
    });
  });

 
  const orderCreate = await Promise.all(orderPromises);

  let outobj={
    CustomerDetails:orderCreate,
    customerAddress:addressCreate
  }


  return res.json(returnFunction("1","Customer Order Created",outobj))

}

//======================Customer Order get All====================//
async function getOrdersAll(req,res) {
  const merchantID=req.user.id;

  const getOrders=await merchantcustomerorders.findAll({
    where:{
      merchantId:merchantID,
    }
  })

  if(!getOrders){
    throw new CustomException("Error in Fetching the Order")
  }

  return res.json(returnFunction("1","ALl Customer Order created by Merchants",getOrders))
  
}


//!__________________________Service Order_________________________//

async function serviceOrder(req,res) {
  const merchantId=req.user.id
  //const{orderId,warehouseId}=req.body
  const{orderId}=req.params
  const{pickupAddressType,warehouseId,pickupDate,pickupStartTime}=req.body
  console.log("🚀 ~ serviceOrder ~ orderId:", orderId)


  const orderFind=await merchantcustomerorders.findOne({
    where:{
      id:orderId,
      merchantId:merchantId,
    },
    include:[{
      model:addressDBS,
      attributes:['title','streetAddress','city','province','country','postalCode']
    },{
      model:user,
      attributes:['email','phoneNum','firstName','lastName']
    },{
      model:products,
      attributes:['productName','weight']
    }]
  })

  const merchnatAddress=await addressDBS.findOne({
    where:{
      userId:merchantId,
    }
  })

  let fullName=`${orderFind.user.firstName} ${orderFind.user.lastName}`

  // return res.json(orderFind)

  const totalWeight=orderFind.product.weight*orderFind.quantity;


  const warehouseAddres=await addressDBS.findOne({
    where:{
      warehouseId:warehouseId
    }

  })
  console.log("🚀 ~ serviceOrder ~ warehouseAddres:", warehouseAddres)
  

  const createServiceOrder=await booking.create({
    total:orderFind.totalAmount,
    merchantcustomerordersId:orderId,
    pickupAddressType,
    receivingWarehouseId:pickupAddressType==="warehouse"?warehouseId:null,
    customerId:merchantId,
    receiverEmail:orderFind.customerEmail,
    receiverPhone:orderFind.contactNumber,
    receiverName:orderFind.customerName,
    senderEmail:orderFind.user.email,
    senderPhone:orderFind.user.phoneNum,
    senderName:fullName,
    productQuantity:orderFind.quantity,
    productName:orderFind.product.productName,
    weight:totalWeight,
    dropoffAddressId:orderFind.addressDBId,
    pickupAddressId:pickupAddressType==="merchantAddress"?merchnatAddress.id:warehouseAddres.id,
    bookingTypeId:7,
    merchantorderstatusesId:1,
    pickupDate,
    pickupStartTime,
  })


  const merchantdvToken=await deviceToken.findAll({
    where:{
      userId:merchantId,
    },
    attributes:['tokenId']
  })

  let to=[];
  if(merchantdvToken.length===0){
    throw new CustomException("No device token found")
  }else{
    to=merchantdvToken.map((token)=>token.tokenId)
  }

  let notification = {
    title: `Service Order`,
    body: `Service Order has been created from Merchant`
  };
  throwNotification(to, notification);

  return res.json(returnFunction("1","Service Order has been created",createServiceOrder))
    
}



module.exports={
    createProductfromCSV,
    createProducts,
    createCategories,
    getCategories,
    createSubcategories,
    getSubcategories,
    createBarCode,
    editProduct,
    getProducts,
    createInBoundOrder,
    getOrderMerchant,
    getOrderInbound,
    getOrderOutbound,
    //=========Mini Inventory==========//
    merchantInventory,
    merchantDashboard,
    //===========Merchnat created Order of Customer===========//
    orderforCustomer,
    getOrdersAll,
    serviceOrder

}