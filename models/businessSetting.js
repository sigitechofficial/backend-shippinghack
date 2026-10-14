// Business membership settings: one row. Membership prices, how long an earned
// level is kept, and the storage extension rules once free storage runs out.
module.exports = (sequelize, DataTypes) => {
    const businessSetting = sequelize.define('businessSetting', {
        monthlyPrice: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 12,
        },
        yearlyPrice: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 99,
        },
        // an earned level is kept until this month (1-12) of the next year
        levelResetMonth: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 2,
        },
        // one storage extension = this many days ...
        storageExtensionDays: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 7,
        },
        // ... for this fixed fee ...
        storageExtensionFee: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 7,
        },
        // ... plus this much per day the package has already been expired
        storageExpiredDayFee: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 1,
        },
        // after this many extensions the package is flagged abandoned
        storageMaxExtensions: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 4,
        },
    });
    return businessSetting;
};
