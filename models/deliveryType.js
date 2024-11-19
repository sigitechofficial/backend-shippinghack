module.exports = (sequelize, DataTypes) =>{
    const deliveryType = sequelize.define('deliveryType', {
        title: {
            type: DataTypes.STRING(),
            allowNull: true,
            defaultValue: ''
        },
        description: {
            type: DataTypes.STRING(),
            allowNull: true,
            defaultValue: ''
        },
        status: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: true
        },
        charge: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
    });
    deliveryType.associate = (models)=>{
        deliveryType.hasMany(models.booking);
        models.booking.belongsTo(deliveryType);
    };
    return deliveryType;
};