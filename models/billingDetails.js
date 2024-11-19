module.exports = (sequelize, DataTypes) =>{
    const billingDetails = sequelize.define('billingDetails', {
        subTotal: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: true,
        },
        discount: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: true,
        },
        total: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: true,
        },
        distanceCharge: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: true,
        },
        weightCharge: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: true,
        },
        categoryCharge: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: true,
        },
        shipmentTypeCharge: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: true,
        },
        packingCharge: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: true,
        },
        serviceCharge: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: true,
        },
        gstCharge: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: true,
        },
        adminEarning: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: true,
        },
        pickupDriverEarning: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: true,
        },
        deliveryDriverEarning: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: true,
        }, 
    });
    return billingDetails;
};