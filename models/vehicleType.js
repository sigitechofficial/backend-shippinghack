module.exports = (sequelize, DataTypes) =>{
    const vehicleType = sequelize.define('vehicleType', {
        title: {
            type: DataTypes.STRING(),
            allowNull: true,
            defaultValue: ''
        },
        image: {
            type: DataTypes.STRING(),
            allowNull: true,
            defaultValue: ''
        },
        status: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        baseRate: {
            type: DataTypes.FLOAT(8,2),
            defaultValue: '0.00',
        },
        perUnitRate: {
            type: DataTypes.FLOAT(8,2),
            defaultValue: '0.00',
        },
        perRideCharge: {
            type: DataTypes.FLOAT(8,2),
            defaultValue: '0.00',
        },
        weightCapacity: {
            type: DataTypes.FLOAT(8,2),
            defaultValue: '0.00',
        },
        volumeCapacity: {
            type: DataTypes.FLOAT(8,2),
            defaultValue: '0.00',
        },

    });
    vehicleType.associate = (models)=>{
        vehicleType.hasMany(models.driverDetail);
        models.driverDetail.belongsTo(vehicleType);
        
        vehicleType.hasMany(models.booking);
        models.booking.belongsTo(vehicleType);

        vehicleType.hasMany(models.distanceCharges);
        models.distanceCharges.belongsTo(vehicleType);
        
    };
    
    return vehicleType;
};