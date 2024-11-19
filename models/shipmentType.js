module.exports = (sequelize, DataTypes) =>{
    const shipmentType = sequelize.define('shipmentType', {
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
            defaultValue: false
        },
        charge: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
    });
    shipmentType.associate = (models)=>{
        shipmentType.hasMany(models.booking);
        models.booking.belongsTo(shipmentType);
    };
    return shipmentType;
};