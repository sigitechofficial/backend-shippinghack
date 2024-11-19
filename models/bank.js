module.exports = (sequelize, DataTypes) =>{
    const bank = sequelize.define('bank', {
        bankName: {
            type: DataTypes.STRING(),
            allowNull: true,
        },
        accountName: {
            type: DataTypes.STRING(),
            allowNull: true,
        },
        accountNumber: {
            type: DataTypes.STRING(),
            allowNull: true,
        },
    });
    return bank;
};