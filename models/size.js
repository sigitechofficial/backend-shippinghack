// Predefined package sizes, each with weight/length units (from a unitClass).
module.exports = (sequelize, DataTypes) => {
    const size = sequelize.define('size', {
        title: {
            type: DataTypes.STRING(),
            allowNull: true,
            defaultValue: ''
        },
        weight: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: 0
        },
        length: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: 0
        },
        width: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: 0
        },
        height: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: 0
        },
        volume: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: true,
            defaultValue: 0
        },
        image: {
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
    size.associate = (models) => {
        // Two references to the same unit table under distinct aliases.
        size.belongsTo(models.unit, { as: 'weightUnitS', foreignKey: 'weightUnitId' });
        size.belongsTo(models.unit, { as: 'lengthUnitS', foreignKey: 'lengthUnitId' });
    };
    return size;
};
