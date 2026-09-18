// A "system of units" (e.g. Metric, Imperial) grouping the weight/length units
// used by package sizes. Kept separate from the existing `units` table (which
// backs the app/base unit-conversion system).
module.exports = (sequelize, DataTypes) => {
    const unitClass = sequelize.define('unitClass', {
        title: {
            type: DataTypes.STRING(),
            allowNull: true,
            defaultValue: ''
        },
        status: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: true
        },
    });
    unitClass.associate = (models) => {
        unitClass.hasMany(models.unit, { foreignKey: 'unitClassId' });
        models.unit.belongsTo(unitClass, { foreignKey: 'unitClassId' });
    };
    return unitClass;
};
