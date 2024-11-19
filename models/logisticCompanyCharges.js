module.exports = (sequelize, DataTypes) =>{
    const logisticCompanyCharges = sequelize.define('logisticCompanyCharges', {
        startValue:{
            type:DataTypes.FLOAT,
            defaultValue:0,
        },
        endValue:{
            type:DataTypes.FLOAT,
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
        charges:{
            type:DataTypes.DECIMAL(10,2),
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