module.exports = (sequelize, DataTypes) =>{
    const paymentRequests = sequelize.define('paymentRequests', {
        amount: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: true,
            defaultValue: '0.00'
        },
        status: {
            type: DataTypes.STRING(),
            defaultValue: false,
        },
        type: {
            type: DataTypes.STRING(),
            allowNull: true,
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        time: {
            type: DataTypes.TIME,
            allowNull: true,
        },
    });
    // paymentRequests.associate = (models)=>{
    //     paymentRequests.hasMany(models.driverDetail);
    //     models.driverDetail.belongsTo(paymentRequests);
    // };
    
    return paymentRequests;
};