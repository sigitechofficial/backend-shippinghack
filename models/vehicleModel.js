module.exports = (sequelize, DataTypes) =>{
    const vehicleModel = sequelize.define('vehicleModel', {
        name: {
            type: DataTypes.STRING(),
            allowNull: true,
            defaultValue: ''
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
    });
    
    return vehicleModel;
};