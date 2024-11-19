// ! RECURRING FUNCTIONS FOR COMPANY CONTROLLERS
//^ Requires for invoices
const { booking, size, addressDBS, category, package ,generalCharges,coupon} = require("../models");
const {currentAppUnitsId,unitsConversion,unitsSymbolsAndRates} = require('./unitsManagement');
const { Op, where, or } = require("sequelize");
const CustomException = require('../middleware/errorObject');

//&Requires for Barcode{
const JsBarcode = require("jsbarcode");
const fs = require("fs");
const { DOMImplementation, XMLSerializer } = require("xmldom");
const xmlSerializer = new XMLSerializer();
const document = new DOMImplementation().createDocument(
  "http://www.w3.org/1999/xhtml",
  "html",
  null
);
const svgNode = document.createElementNS("http://www.w3.org/2000/svg", "svg");
const svg2img = require("svg2img");
const { log } = require("console");
//&}

let returnFunction = (status, message, data, error) => {
  return {
    status: `${status}`,
    message: `${message}`,
    data: data,
    error: `${error}`,
  };
};

// return the distance in Kilometers ()
function getDistance(userLat, userLng, orderLat, orderLng) {
  const earth_radius = 6371;
  const dLat = (Math.PI / 180) * (orderLat - userLat);
  const dLon = (Math.PI / 180) * (orderLng - userLng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((Math.PI / 180) * orderLat) *
      Math.cos((Math.PI / 180) * orderLat) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.asin(Math.sqrt(a));
  const d = earth_radius * c; // d is in mles
  const km = d * 1.60934; // coonvert miles into kms
  return km;
}

// eplace any empty string values with null,
function replaceEmptyStringsWithNull(obj) {
  for (const key in obj) {
    if (typeof obj[key] === "object") {
      if (Array.isArray(obj[key])) {
        // Handle arrays
        for (let i = 0; i < obj[key].length; i++) {
          replaceEmptyStringsWithNull(obj[key][i]);
        }
      } else {
        // Recursively check nested objects
        replaceEmptyStringsWithNull(obj[key]);
      }
    } else if (obj[key] === "") {
      // Replace empty string values with null
      obj[key] = null;
    }
  }
}

//^ Creating barcodegenerator Which takes trackingId as input and return a barcode____________________________
function customBarcodeGenerator(trackingId) {
  JsBarcode(svgNode, trackingId, {
    xmlDocument: document,
  });

  const svgText = xmlSerializer.serializeToString(svgNode);
  svg2img(svgText, function (error, buffer) {
    //returns a Buffer
    fs.writeFileSync(`Public/Images/Barcodes/${trackingId}.png`, buffer); //?Make you Have this directory Public/Images/Barcodes/
  });

  const barcode = `Public/Images/Barcodes/${trackingId}.png`;
  return barcode;
}

 //^ Inovoice response function____________________________________________________________
async function customInvoiceOutputGenerator(bookingData,pickupAddress,dropOffAddress,parcel,appUnitId) {
  const packageDetails = [];
  const units = await unitsSymbolsAndRates(appUnitId);

await Promise.all(parcel.map(async (item, index) => {
  packageDetails[index] = {
    packageId: item.id,
    barcode: item.barcode,
    category: item.categoryId == null ? item.catText : item.category.title,
    size: item.size.title,
    weight:  unitsConversion(item.size.weight, units.conversionRate.weight),
    length: unitsConversion(item.size.length, units.conversionRate.length),
    width:  unitsConversion(item.size.width, units.conversionRate.length),
    height: unitsConversion(item.size.height, units.conversionRate.length),
    volume: unitsConversion(item.size.volume, units.conversionRate.length),
  };
}));

 
 const totalW =  unitsConversion(bookingData.totalWeight, units.conversionRate.weight);

  //^ Generating response
  let output = {
    bookingId: bookingData.id,
    trackingId: bookingData.trackingId,
    total: bookingData.total,
    totalWeight: unitsConversion( totalW, units.conversionRate.distance),
    distance: unitsConversion( bookingData.distance, units.conversionRate.distance),
    pickupAddress: pickupAddress,
    dropOffAddress:dropOffAddress,
  receiver: {
    name: bookingData.receiverName,
    email: bookingData.receiverEmail,
    phone: bookingData.receiverPhone,
    phone: bookingData.receiverPhone,
    companyName: bookingData.receiverCompany,
  },
  sender: {
      name: bookingData.senderName,
      email: bookingData.senderEmail,
      phone: bookingData.senderPhone,
      phone: bookingData.senderPhone,
      companyName: bookingData.senderCompany,
    },
  packageDetails,
  unit : units.symbol,
  };
  //^Return output
  return output;
}

//^ Creating Inovoice generator function______________________________________
async function customMultipleInvoicesGenerator(id) {
  try {
    
    const bookingData = await booking.findByPk(id, {
      attributes: ['id','total', 'trackingId', 'receiverName', 'receiverEmail', 'receiverPhone', 'senderName', 'senderEmail', 'senderPhone', 'distance', 'receiverCompany', 'senderCompany', 'pickupAddressId', 'dropoffAddressId','totalWeight','appUnitId'],
    });
    let systemUnitId= bookingData.appUnitId
    if (!bookingData) {
      console.log( '"NO BOOKING DATA"', bookingData.appUnitId);
    }
    // console.log(bookingData);
      
    const pickupAddress = await addressDBS.findByPk(bookingData.pickupAddressId, {
      attributes: ['streetAddress', 'lat', 'lng', 'district', 'city', 'province', 'country'],
    });

    const dropOffAddress = await addressDBS.findByPk(bookingData.dropoffAddressId, {
      attributes: ['streetAddress', 'lat', 'lng', 'district', 'city', 'province', 'country']
    });

    const parcel = await package.findAll({
      attributes: ['id', 'barcode', 'catText'],
      where: { bookingId: bookingData.id },
      include: [
        {
          model: size,
          attributes: ['title','weight', 'length', 'width', 'height', 'volume'],
        },
        { model: category, attributes: ['title', 'charge'] },
      ],
    });
    // console.log( '"NO BOOKING DATA"' , parcel);

    if (!bookingData || !pickupAddress || !dropOffAddress || !parcel) {
      throw new Error('Data retrieval error');
    }

    return await customInvoiceOutputGenerator(bookingData, pickupAddress, dropOffAddress,parcel, systemUnitId);
  } catch (error) {
    console.error(error);
    throw new Error('Error! Bookkings Not Found');
  }
}



//^ Function that will return Admin earning______________________________________
async function adminEarning(total) {
  try {
    let charges = await generalCharges.findAll({
      where: { [Op.or] : [{key: 'company'},{key: 'driver'}]  },
      attributes: ['key','value']
  });
  let percentageFromCompany = charges[0].value;
  let percentageFromDriver = charges[1].value;
  let adminEarning =((percentageFromCompany + percentageFromDriver) / 100) * total;
  return adminEarning; // admin earning
  } catch (error) {
    console.error(error);
    throw new Error('Error! In Calculation Fuction');
  }
}

async function adminPercentage() {
  try {
    let charges = await generalCharges.findAll({
      where: { [Op.or] : [{key: 'company'},{key: 'driver'}]  },
      attributes: ['key','value']
  });
  let percentageFromCompany = charges[0].value;
  let percentageFromDriver = charges[1].value;
  let total = percentageFromCompany + percentageFromDriver;
  return total; // admin earning
  } catch (error) {
    console.error(error);
    throw new Error('Error! In Calculation Fuction');
  }
}

async function couponCheck(code, userId){
  const existCoupon = await coupon.findOne({where: {code: code, status: true}})
  //Check is the Coupon with the given code exists or not
  if(!existCoupon) throw new CustomException('Invalid Coupon-code', 'Please try a valid code')
  // checking the expiry of token
  //return res.json(existCoupon);
  const cDate = Date.now();
  const cDT = new Date(cDate);
  const startDT = new Date(existCoupon.from)
  const endDT = new Date(existCoupon.to)
  //console.log(Date.parse(cDT)> Date.parse(startDT) && Date.parse(cDT)< Date.parse(endDT) )
  if(!(Date.parse(cDT)> Date.parse(startDT) && Date.parse(cDT)< Date.parse(endDT))) throw new CustomException('Coupon-code expired', 'Please try a valid code')
  //check if the Coupon is already applied by same user
  const alreadyAppliedByUser = await booking.findOne({where: {couponId: existCoupon.id, paymentConfirmed: true, receivingWarehouseId: userId}});
  if(alreadyAppliedByUser) throw new CustomException('Coupon already availed', 'Please try a valid one');
  // If type of coupon change to conditional, check that condition as well
  // if(existCoupon.type === 'conditional'){
  //     if(subTotal < existCoupon.condAmount) throw new CustomException('Coupon cannot be availed as your billing amount is less the applicable condition', 'Please try a valid one');
  // }
  let data = {
      id:existCoupon.id ,
      discount: existCoupon.value,
      code: existCoupon.code,

  };
  return data;
};


function getDateAndTime(){
  const dt = Date.now();
  const DT = new Date(dt);
  const currentDate = `${
    DT.getMonth() + 1
  }-${DT.getDate()}-${DT.getFullYear()}`;
  const currentTime = `${DT.getHours()}:${DT.getMinutes()}:${DT.getSeconds()}`;
  const t={
    currentTime,
    currentDate,
  }
  return t;
}


 function calculateWeights(packages , divisor) {

  let weight = 0; 
  let dimensionalWeight = 0;
  let chargedWeight = 0;
  let devider = parseFloat(divisor);

  for (let index = 0; index < packages.length; index++) {
    let package = packages[index];
    let Weightcharges = 0;
    let billableWeight;

    weight += parseFloat(package.actualWeight);
    dimensionalWeight += parseFloat(package.actualVolume)/devider;

    if (parseFloat(package.actualWeight) > dimensionalWeight) {
      billableWeight = parseFloat(package.actualWeight);
    } else if (dimensionalWeight > parseFloat(package.actualWeight)) {
      billableWeight = dimensionalWeight;
    }

    chargedWeight += parseFloat(billableWeight);
  }
  return { weight, dimensionalWeight, chargedWeight };
}

function journeyTrack(deliverytype) {
const direct = [
  {
    id: 1,
    title: 'Order Created',
    description: 'Your order has been created'
  },
  {
    id: 7,
    title: 'Received at Warehouse (USA warehouse)',
    description: 'Confirmation of order received by warehouse'
  },
  {
    id: 8,
    title: 'Re measurements/Labeled',
    description: 'Confirmation of re-measurements and labeling of package(s)'
  },
  {
    id: 9,
    title: 'Pending Payments',
    description: 'Address Added Successfully '
  },
  {
    id: 10,
    title: 'Ready to Ship',
    description: 'Order ready to be deliver to customer directly or indirectly'
  },
  {
    id: 11,
    title: 'In Transit',
    description: 'Package in Transit'
  },
  {
    id: 12,
    title: 'Outgoing /Received',
    description:
      'when Transit received in Puerto Rico warehouse package will be in received'
  },
  {
    id: 13,
    title: 'Driver Assigned/Accepted',
    description: 'Hang on! Your Order is arriving soon'
  },
  {
    id: 14,
    title: "Shipped",
    description: "Order shipped directly to customer from usa wareho..."
  },
  {
    id: 18,
    title: 'Delivered',
    description: 'Your order has been completed'
  },
  {
    id: 19,
    title: 'Cancelled',
    description: 'Order has been cancelled '
  },
];
const byWareHouse = [
  {
    id: 1,
    title: 'Order Created',
    description: 'Your order has been created'
  },
  {
    id: 7,
    title: 'Received at Warehouse (USA warehouse)',
    description: 'Confirmation of order received by warehouse'
  },
  {
    id: 8,
    title: 'Re measurements/Labeled',
    description: 'Confirmation of re-measurements and labeling of package(s)'
  },
  {
    id: 10,
    title: 'Ready to Ship',
    description: 'Order ready to be deliver to customer directly or indirectly'
  },
  {
    id: 11,
    title: 'In Transit',
    description: 'Package in Transit'
  },
  {
    id: 12,
    title: 'Outgoing /Received',
    description:
      'when Transit received in Puerto Rico warehouse package will be in received'
  },
  {
    id: 13,
    title: 'Driver Assigned/Accepted',
    description: 'Hang on! Your Order is arriving soon'
  },
  {
    id: 15,
    title: 'Reached (delivery)',
    description: 'Driver Reached at Wearhouse'
  },
  {
    id: 22,
    title: 'Hand over to Driver',
    description: 'hand over to delivery Driver'
  },
  {
    id: 16,
    title: 'Pickedup (delivery)',
    description: 'order has been picked by customer/driver '
  },
  {
    id: 17,
    title: 'Ongoing/ Start ride',
    description: 'On the way'
  },
  {
    id: 18,
    title: 'Delivered',
    description: 'Your order has been completed'
  },
  {
    id: 19,
    title: 'Cancelled',
    description: 'Order has been cancelled '
  },
];
const selfPickup = [
  {
    id: 1,
    title: 'Order Created',
    description: 'Your order has been created'
  },
  {
    id: 7,
    title: 'Received at Warehouse (USA warehouse)',
    description: 'Confirmation of order received by warehouse'
  },
  {
    id: 8,
    title: 'Re measurements/Labeled',
    description: 'Confirmation of re-measurements and labeling of package(s)'
  },
  
  {
    id: 10,
    title: 'Ready to Ship',
    description: 'Order ready to be deliver to customer directly or indirectly'
  },
  {
    id: 11,
    title: 'In Transit',
    description: 'Package in Transit'
  },
  {
    id: 12,
    title: 'Outgoing /Received',
    description:
    'when Transit received in Puerto Rico warehouse package will be in received'
  },
  {
    id: 20,
    title: 'Awaiting self pickup',
    description: 'Awaiting customer to pickup order from warehouse'
  },
  {
    id: 21,
    title: 'Handed over to customer',
    description: 'Order picked by customer from warehouse'
  },
  {
    id: 19,
    title: 'Cancelled',
    description: 'Order has been cancelled '
  },
   
];
const WarehouseSelf = [
  {
    id: 1,
    title: 'Order Created',
    description: 'Your order has been created'
  },
  {
    id: 7,
    title: 'Received at Warehouse (USA warehouse)',
    description: 'Confirmation of order received by warehouse'
  },
  {
    id: 8,
    title: 'Re measurements/Labeled',
    description: 'Confirmation of re-measurements and labeling of package(s)'
  },
  {
    id: 10,
    title: 'Ready to Ship',
    description: 'Order ready to be deliver to customer directly or indirectly'
  },
  {
    id: 11,
    title: 'In Transit',
    description: 'Package in Transit'
  },
  {
    id: 12,
    title: 'Outgoing /Received',
    description:
      'when Transit received in Puerto Rico warehouse package will be in received'
  },
  {
    id: 20,
    title: 'Awaiting self pickup',
    description: 'Awaiting customer to pickup order from warehouse'
  },
  {
    id: 21,
    title: 'Handed over to customer',
    description: 'Order picked by customer from warehouse'
  },
  {
    id: 19,
    title: 'Cancelled',
    description: 'Order has been cancelled '
  },
];


if(deliverytype == 'direct'){
  return direct;
}
if(deliverytype == 'byWarehouse'){
  return byWareHouse;
}
if(deliverytype == 'selfPickup'){
  return selfPickup;
}
if(deliverytype == 'warehouseSelf'){
  return WarehouseSelf;
}
}

function calculateTotalValues(objectsArray) {
  // Initialize totals object
  let totals = {
    weight: 0,
    length: 0,
    width: 0,
    height: 0,
    volume: 0
  };

  // Iterate through each object in the array
  objectsArray.forEach(data => {
    // Add values to totals
    totals.weight += data.actualWeight || 0;
    totals.length += data.actualLength || 0;
    totals.width += data.actualWidth || 0;
    totals.height += data.actualHeight || 0;
    totals.volume += data.actualVolume || 0;
  });

  // Return the totals object
  return totals;
}
module.exports = {
  adminPercentage,
  adminEarning,
  returnFunction,
  getDistance,
  replaceEmptyStringsWithNull,
  customBarcodeGenerator,
  customMultipleInvoicesGenerator ,
  customInvoiceOutputGenerator,
  couponCheck,
  getDateAndTime,
  calculateWeights,
  journeyTrack,calculateTotalValues
};


// const All = [
//   {
//     id: 1,
//     title: 'Order Created',
//     description: 'Your order has been created'
//   },
//   {
//     id: 7,
//     title: 'Received at Warehouse (USA warehouse)',
//     description: 'Confirmation of order received by warehouse'
//   },
//   {
//     id: 8,
//     title: 'Re measurements/Labeled',
//     description: 'Confirmation of re-measurements and labeling of package(s)'
//   },
//   {
//     id: 9,
//     title: 'Pending Payments',
//     description: 'Address Added Successfully '
//   },
//   {
//     id: 10,
//     title: 'Ready to Ship',
//     description: 'Order ready to be deliver to customer directly or indirectly'
//   },
//   {
//     id: 11,
//     title: 'In Transit',
//     description: 'Package in Transit'
//   },
//   {
//     id: 12,
//     title: 'Outgoing /Received',
//     description:
//       'when Transit received in Puerto Rico warehouse package will be in received'
//   },
//   {
//     id: 13,
//     title: 'Driver Assigned/Accepted',
//     description: 'Hang on! Your Order is arriving soon'
//   },
//   {
//     id: 15,
//     title: 'Reached (delivery)',
//     description: 'Driver Reached at Wearhouse'
//   },
//   {
//     id: 16,
//     title: 'Pickedup (delivery)',
//     description: 'order has been picked by customer/driver '
//   },
//   {
//     id: 17,
//     title: 'Ongoing/ Start ride',
//     description: 'On the way'
//   },
//   {
//     id: 18,
//     title: 'Delivered',
//     description: 'Your order has been completed'
//   },
//   {
//     id: 19,
//     title: 'Cancelled',
//     description: 'Order has been cancelled '
//   },
//   {
//     id: 20,
//     title: 'Awaiting self pickup',
//     description: 'Awaiting customer to pickup order from warehouse'
//   },
//   {
//     id: 21,
//     title: 'Handed over to customer',
//     description: 'Order picked by customer from warehouse'
//   },
//   {
//     id: 22,
//     title: 'Hand over to Driver',
//     description: 'hand over to delivery Driver'
//   }
// ];
