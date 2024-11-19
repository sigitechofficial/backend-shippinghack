module.exports = (sequelize, DataTypes) =>{
    const driverType = sequelize.define('driverType', {
        name: {
            type: DataTypes.STRING(),
            allowNull: true,
        },
    });
    driverType.associate = (models)=>{
        driverType.hasMany(models.driverDetail);
        models.driverDetail.belongsTo(driverType);
    };
    
    return driverType;
};