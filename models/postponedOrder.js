module.exports = (sequelize, DataTypes) =>{
    const postponedOrder = sequelize.define('postponedOrder', {
        reasonDesc: {
            type: DataTypes.STRING(),
            allowNull: true,
        }
    });
    return postponedOrder;
};