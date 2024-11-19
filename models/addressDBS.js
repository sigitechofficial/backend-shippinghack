module.exports = (sequelize, DataTypes) =>{
    const addressDBS = sequelize.define('addressDBS', {
        title: {
            type: DataTypes.STRING(),
            allowNull: true,
            defaultValue: ''
        },
        streetAddress: {
            type: DataTypes.STRING(),
            allowNull: true,
            defaultValue: ''
        },
        building: {
            type: DataTypes.STRING(),
            allowNull: true,
            defaultValue: ''
        },
        floor: {
            type: DataTypes.STRING(),
            allowNull: true,
            defaultValue: ''
        },
        apartment: {
            type: DataTypes.STRING(),
            allowNull: true,
            defaultValue: ''
        },
        district: {
            type: DataTypes.STRING(),
            allowNull: true,
            defaultValue: ''
        },
        city: {
            type: DataTypes.STRING(),
            allowNull: true,
            defaultValue: ''
        },
        province: {
            type: DataTypes.STRING(),
            allowNull: true,
            defaultValue: ''
        },
        country: {
            type: DataTypes.STRING(),
            allowNull: true,
            defaultValue: ''
        },
        postalCode: {
            type: DataTypes.STRING(),
            allowNull: true,
            defaultValue: ''
        },
        lat: {
            type: DataTypes.STRING(),
            allowNull: true,
            defaultValue: ''
        },
        lng: {
            type: DataTypes.STRING(),
            allowNull: true,
            defaultValue: ''
        },
        status: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: true
        },
        type: {
            type: DataTypes.STRING(1024),
            allowNull: true,
            defaultValue: ''
        },
        deleted: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },
    });
    addressDBS.associate = (models)=>{
        // Linking address to warehouse
        addressDBS.hasOne(models.warehouse);
        models.warehouse.belongsTo(addressDBS);
        // linking address to booking as pickup 
        addressDBS.hasMany(models.booking, {as: 'pickupAddress', foreignKey: 'pickupAddressId'});
        models.booking.belongsTo(addressDBS, {as: 'pickupAddress', foreignKey: 'pickupAddressId'});
        // linking address to booking as dropoff 
        addressDBS.hasMany(models.booking, {as: 'dropoffAddress', foreignKey: 'dropoffAddressId'});
        models.booking.belongsTo(addressDBS, {as: 'dropoffAddress', foreignKey: 'dropoffAddressId'});
        // Linking address to users
        addressDBS.hasMany(models.userAddress);
        models.userAddress.belongsTo(addressDBS);

        //Linking with the merchant Customer table
        addressDBS.hasOne(models.merchantcustomerorders,{foreignKey:'addressDBId'})
        models.merchantcustomerorders.belongsTo(addressDBS,{foreignKey:'addressDBId'})
        
    };
    // addressDBS.sync({alter:true})
    
    return addressDBS;
};