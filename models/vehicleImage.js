module.exports = (sequelize, DataTypes) =>{
    const vehicleImage = sequelize.define('vehicleImage', {
        image: {
            type: DataTypes.STRING(),
            allowNull: true,
            defaultValue: ''
        },
        uploadTime: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: sequelize.literal("CURRENT_TIMESTAMP")
        },
        status: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: true
        },
    });
    // vehicleImage.associate = (models)=>{
    //     vehicleImage.hasOne(models.user);
    //     models.user.belongsTo(vehicleImage);
    // };
    
    return vehicleImage;
};