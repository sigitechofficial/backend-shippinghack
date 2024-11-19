module.exports = (sequelize, DataTypes) =>{
    const appUnits = sequelize.define('appUnits', {
        status: {
            type: DataTypes.BOOLEAN,
            allowNull: true
        },
        deleted: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },
    });
    appUnits.associate = (models)=>{
        // Linking as weight units  
        appUnits.hasMany(models.booking);
        models.booking.belongsTo(appUnits);

        appUnits.hasMany(models.vehicleType);
        models.vehicleType.belongsTo(appUnits);
    };
    
    return appUnits;
};