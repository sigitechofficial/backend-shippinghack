module.exports = (sequelize, DataTypes) =>{
    const baseUnits = sequelize.define('baseUnits', {
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

    });
    return baseUnits;
};