module.exports = (sequelize, DataTypes) =>{
    const driverDetail = sequelize.define('driverDetail', {
        approvedByAdmin: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },
        licIssueDate: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        licExpiryDate: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        licFrontImage: {
            type: DataTypes.STRING(),
            allowNull: true,
            defaultValue: ''
        },
        licBackImage: {
            type: DataTypes.STRING(),
            allowNull: true,
            defaultValue: ''
        },
        vehicleMake: {
            type: DataTypes.STRING(),
            allowNull: true,
            defaultValue: ''
        },
        vehicleModel: {
            type: DataTypes.STRING(),
            allowNull: true,
            defaultValue: ''
        },
        vehicleYear: {
            type: DataTypes.STRING(),
            allowNull: true,
            defaultValue: ''
        },
        vehicleColor: {
            type: DataTypes.STRING(),
            allowNull: true,
            defaultValue: ''
        },
    });
    driverDetail.associate = (models)=>{
        driverDetail.hasOne(models.vehicleImage);
        models.vehicleImage.belongsTo(driverDetail);
    };
    
    return driverDetail;
};