// Distance bands (distanceCharges) price driver pay per vehicle type. Distances and
// band From/To are in km (the base unit). A distance d matches a band when
// From < d <= To.
const { Op } = require("sequelize");
const { distanceCharges, vehicleType } = require("../models");

function bandFor(bands, distance) {
  return (
    (bands || []).find(
      (band) => distance > Number(band.startValue) && distance <= Number(band.endValue)
    ) || null
  );
}

// True when at least one active vehicle type has a band covering the distance, i.e.
// some driver could be paid for the delivery.
async function anyVehicleCovers(distance) {
  const band = await distanceCharges.findOne({
    where: {
      startValue: { [Op.lt]: distance },
      endValue: { [Op.gte]: distance },
    },
    include: [
      { model: vehicleType, where: { status: true }, attributes: ["id"] },
    ],
    attributes: ["id"],
  });
  return !!band;
}

module.exports = { bandFor, anyVehicleCovers };
