const CustomException = require('../middleware/errorObject');
//import models
const { baseUnits, units, appUnits} = require("../models");

//^ Return current appunit id
async function currentAppUnitsId() {
   try {
    const currentUnits = await appUnits.findOne({where: { status: true }});
    return  currentUnits.id;
   } catch (error) {
    console.log("🚀 ~ file: unitsManagement.js:12 ~ currentAppUnits ~ error:", error);
   }
}

//^ Return the names, symbols and conversion rates of givien appunit id
async function unitsSymbolsAndRates(appUnitId) {
  try {
   const symbols = await appUnits.findByPk(appUnitId,{
    include: [  
      {model: units, as :'weightUnit', attributes: ['name','symbol','conversionRate']},
      {model: units, as :'lengthUnit', attributes: ['name','symbol','conversionRate']},
      {model: units, as :'distanceUnit', attributes: ['name','symbol','conversionRate']},
      {model: units, as :'currencyUnit', attributes: ['name','symbol','conversionRate']},
    ]
  });
  const output={
    symbol:
      { 
      weight : symbols.weightUnit.symbol,
      length : symbols.lengthUnit.symbol,
      distance : symbols.distanceUnit.symbol,
      currency : symbols.currencyUnit.symbol,
      },
      conversionRate:
      {
      weight : symbols.weightUnit.conversionRate,
      length : symbols.lengthUnit.conversionRate,
      distance : symbols.distanceUnit.conversionRate,
      currency : symbols.currencyUnit.conversionRate,// not in use yet 
      },
      names:
      {
      weight : symbols.weightUnit.name,
      length : symbols.lengthUnit.name,
      distance : symbols.distanceUnit.name,
      currency : symbols.currencyUnit.name, 
      }    
    };
   return  output;

  } catch (error) {
   console.log("🚀 ~ file: unitsManagement.js:12 ~ currentAppUnits ~ error:", error);
  }
}


//^ Convert Values to Current Units
 function  unitsConversion(value , conversionRate ) {
     const output =  (parseFloat(value) /  parseFloat(conversionRate)).toFixed(2) //base to current
     return parseFloat(output);
 }

//^ Convert Value to Base Units
function  convertToBaseUnits(value , conversionRate ) {
  const output =  (parseFloat(value) *  parseFloat(conversionRate)).toFixed(2) //current to base
  return parseFloat(output);
}

//  async function  unitsConversion(value , appUnitId , type ) {
//   try {
//       const systemUnit = await appUnits.findOne({
//           where: { id: appUnitId },
//         });
       
//         var output=0;
//         if (type == 'length' || type == 'l' || type == 'len') {

//              let  len = await units.findOne({where: { id:systemUnit.lengthUnitId,type:'length'}});
//             output =  (value * len.conversionRate).toFixed(2);
//              //  output ={
//             //   value: (value / len.conversionRate).toFixed(2),
//             //   unit : len.symbol
//             // };
        
//             } else if(type == 'weight'|| type == 'w' || type == 'wei') {

//               let wei = await units.findOne({where: { id:systemUnit.weightUnitId,type:'weight' }});
//               output = (value * wei.conversionRate).toFixed(2);
//               // output ={
//               //   value: (value / wei.conversionRate).toFixed(2),
//               //   unit : wei.symbol
//               // }; 
              
//             } else if(type == 'distance'|| type == 'd' || type == "dis") {

//               let dis   = await units.findOne({where: { id:systemUnit.distanceUnitId,type:'distance'}});
//               output = (value * dis.conversionRate).toFixed(2);
//               // output ={
//               //   value: (value / dis.conversionRate).toFixed(2),
//               //   unit : dis.symbol
//               // };           
//             }else if(type == 'currency'|| type == 'c' || type == "cur" || type == "curr") {

//               let cur = await units.findOne({where: { id:systemUnit.currencyUnitId,type:'currency'}});
//               output = value; 
//               // output ={
//               //   value: value,
//               //   unit : cur.symbol
//               // };           

//             }

//    return output;
//   } catch (error) {
//    console.log("🚀 ~ file: unitsManagement.js:12 ~ currentAppUnits ~ error:", error);
//   }
// }
 


module.exports = {
  currentAppUnitsId,unitsConversion,unitsSymbolsAndRates,convertToBaseUnits
  };
  
  // include: [
        //   {
        //     model: units,
        //     as: 'weightUnit',
        //     where: { status: true },
        //     attributes: ['id', 'type', 'name', 'symbol', 'desc', 'status', 'conversionRate']
        //   },
        //   {
        //     model: units,
        //     as: 'lengthUnit',
        //     where: { status: true },
        //     attributes: ['id', 'type', 'name', 'symbol', 'desc', 'status', 'conversionRate']
        //   },
        //   {
        //     model: units,
        //     as: 'distanceUnit',
        //     where: { status: true },
        //     attributes: ['id', 'type', 'name', 'symbol', 'desc', 'status', 'conversionRate']
        //   }
        // ]


// output{
        // id: currentUnits.id,
        // lenghtId: currentUnits.lengthUnitId,
        // weightId: currentUnits.weightUnitId,
        // distanceId: currentUnits.distanceUnitId,
        
// }