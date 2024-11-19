module.exports = (sequelize, DataTypes) =>{
    const otpVerification = sequelize.define('otpVerification', {
        OTP: {
            type: DataTypes.STRING(5),
            allowNull: true,
        },
        reqAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        expiryAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        verifiedInForgetCase: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
        },
    });
    // otpVerification.associate = (models)=>{
    //     otpVerification.hasOne(models.user);
    //     models.user.belongsTo(otpVerification);
    // };
    
    return otpVerification;
};