module.exports = (sequelize, DataTypes) =>{
    const distanceCharges = sequelize.define('distanceCharges', {
        title: {
            type: DataTypes.STRING(),
            allowNull: true,
        },
        startValue: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        endValue: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        price: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: true,
        },
        unit: {
            type: DataTypes.STRING(),
            allowNull: true,
        }
        
    });
    return distanceCharges;
};