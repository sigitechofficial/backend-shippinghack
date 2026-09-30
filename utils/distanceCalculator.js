const axios = require('axios');
const googleMapApiKey = 'AIzaSyAVYbP2F93xvY4i59UVNfAfYR62dmbKNFA'
const CustomException = require("../middleware/errorObject");

// module.exports = async function (startLat, startLng, endLat, endLng) {
//         try {
//             const response = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
//                 params: {
//                     origin: `${startLat},${startLng}`,
//                     destination: `${endLat},${endLng}`,
//                     key: `${googleMapApiKey}`
//                 }
//             });
//             const distanceInMeters = response.data.routes[0]?.legs[0]?.distance.value;
//             console.log("🚀 ~ distanceInMeters:", distanceInMeters)
//             // const distanceInKilometers = distanceInMeters / 1000;
//             const distanceInMiles =  distanceInMeters / 1609.34;
//             return parseFloat(distanceInMiles.toFixed(1)) 
//         } catch (error) {
//            throw new CustomException('distance not calculated' , `${error.message}`)
//         }
// }

// Straight-line (haversine) distance in km — the base distance unit that distance
// bands (distanceCharges startValue/endValue) are stored in. The admin's KM/Miles
// setting only changes how bands are entered and shown.
module.exports = async function (userLat, userLng, orderLat, orderLng) {
    const earth_radius = 6371; // km
    const toRad = (deg) => (Math.PI / 180) * deg;
    const dLat = toRad(orderLat - userLat);
    const dLon = toRad(orderLng - userLng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(userLat)) *
        Math.cos(toRad(orderLat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.asin(Math.sqrt(a));
    const km = earth_radius * c;
    return parseFloat(km.toFixed(2));
}
