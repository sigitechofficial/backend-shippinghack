module.exports = (sequelize, DataTypes) =>{
    const coupon = sequelize.define('coupon', {
        code: {
            type: DataTypes.STRING(),
            allowNull: true,
            defaultValue: ''
        },
        value: {
            type: DataTypes.FLOAT(8,2),
            allowNull: true,
            defaultValue: '0.00'
        },
        from: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: sequelize.literal("CURRENT_TIMESTAMP")
        },
        to: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: sequelize.literal("CURRENT_TIMESTAMP")
        },
        type: {
            type: DataTypes.STRING(),
            allowNull: true,
            defaultValue: ''
        },
        condAmount: {
            type: DataTypes.FLOAT(8,2),
            allowNull: true,
            defaultValue: '0.00'
        },
        status: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },
    });
    coupon.associate = (models)=>{
        coupon.hasMany(models.booking);
        models.booking.belongsTo(coupon);
    };
    return coupon;
};