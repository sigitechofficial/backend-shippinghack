module.exports = (sequelize, DataTypes) =>{
    const driverPaymentSystem = sequelize.define('driverPaymentSystem', {
        systemType: {
            type: DataTypes.STRING(),
            allowNull: true,
        },
        key:{
            type: DataTypes.STRING(),
            allowNull: true,   
        },
        status: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
    });
    driverPaymentSystem.associate = (models)=>{
        driverPaymentSystem.hasMany(models.wallet);
        models.wallet.belongsTo(driverPaymentSystem);
    };
    return driverPaymentSystem;
};