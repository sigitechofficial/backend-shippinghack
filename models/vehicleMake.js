module.exports = (sequelize, DataTypes) =>{
    const vehicleMake = sequelize.define('vehicleMake', {
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
    vehicleMake.associate = (models)=>{
        vehicleMake.hasMany(models.vehicleModel);
        models.vehicleModel.belongsTo(vehicleMake);
    };
    return vehicleMake;
};