module.exports = (sequelize, DataTypes) =>{
    const onGoingOrder = sequelize.define('onGoingOrder', {
        date: {
            type: DataTypes.DATEONLY,
            allowNull: true,   
        },
        orderNumbers: {
            type: DataTypes.TEXT('long'),
            allowNull: true,
        },
        sequence: {
            type: DataTypes.TEXT('long'),
            allowNull: true,
        },
        status: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },
        ordersStatus: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: false
        },
        isSet: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },
        type: {
            type: DataTypes.STRING(),
            allowNull: true,
        },

    });
    return onGoingOrder;
};