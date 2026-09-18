// A unit within a unitClass (type = "weight" | "length" | …). Explicit table
// name `systemUnits` to avoid colliding with the existing `units` table.
module.exports = (sequelize, DataTypes) => {
    const unit = sequelize.define('unit', {
        type: {
            type: DataTypes.STRING(),
            allowNull: true,
            defaultValue: ''
        },
        name: {
            type: DataTypes.STRING(),
            allowNull: true,
            defaultValue: ''
        },
        symbol: {
            type: DataTypes.STRING(),
            allowNull: true,
            defaultValue: ''
        },
        conversionRate: {
            type: DataTypes.DECIMAL(10, 4),
            allowNull: true,
            defaultValue: 1
        },
        status: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: true
        },
    }, {
        tableName: 'systemUnits'
    });
    // unitClass association is declared in unitClass.js.
    return unit;
};
