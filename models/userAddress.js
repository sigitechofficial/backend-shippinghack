module.exports = (sequelize, DataTypes) =>{
    const userAddress = sequelize.define('userAddress', {
        default: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: true
        },
        status: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: true
        },
        deleted: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },
        type: {
            type: DataTypes.STRING(1024),
            allowNull: true,
            defaultValue: ''
        },

    });
    
    return userAddress;
};