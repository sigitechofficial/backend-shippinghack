module.exports = (sequelize, DataTypes) =>{
    const weightCharges = sequelize.define('weightCharges', {
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
    return weightCharges;
};