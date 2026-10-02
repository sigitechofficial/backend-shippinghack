module.exports = (sequelize, DataTypes) =>{
    const logisticCompanyCharges = sequelize.define('logisticCompanyCharges', {
        // charged weight band in lb (base unit): From < weight <= To
        startValue:{
            type:DataTypes.DECIMAL(12,4),
            defaultValue:0,
        },
        endValue:{
            type:DataTypes.DECIMAL(12,4),
            defaultValue:0
        },
        ETA: {
            type: DataTypes.STRING(),
            allowNull: true
        },
        bookingType: {
            type: DataTypes.STRING(),
            allowNull: true
        },
        // price per lb of charged weight
        charges:{
            type:DataTypes.DECIMAL(12,4),
            defaultValue:0
        },
        status: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },
        deleted: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },
        flash:{
            type: DataTypes.BOOLEAN,
            default:false
        }
    });
   
    return logisticCompanyCharges;
};