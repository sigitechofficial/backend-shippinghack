module.exports = (sequelize, DataTypes) =>{
    const wallet = sequelize.define('wallet', {
        amount: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: true,
            defaultValue: '0.00'
        },
        currency: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: '$'
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: ''
        },
        
    });
    return wallet;
};