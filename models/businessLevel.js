// Business membership levels (Shipito style): a business user's level is earned
// from the number of shipments in a calendar month, never bought.
module.exports = (sequelize, DataTypes) => {
    const businessLevel = sequelize.define('businessLevel', {
        title: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        // shipments in a month needed to reach this level (first level is 0)
        minShipments: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        // charged per package, in the currency the admin uses
        processingFee: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0,
        },
        // percent off the shipping cost only
        discountPercent: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false,
            defaultValue: 0,
        },
        freeStorageDays: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        sortOrder: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
    });
    return businessLevel;
};
