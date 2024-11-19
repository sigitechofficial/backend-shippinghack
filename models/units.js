module.exports = (sequelize, DataTypes) => {
    const units = sequelize.define('units', {
      type: {
        type: DataTypes.STRING(),
        allowNull: true,
      },
      name: {
        type: DataTypes.STRING(),
        allowNull: true,
      },
      symbol: {
        type: DataTypes.STRING(),
        allowNull: true,
      },
      desc: {
        type: DataTypes.STRING(),
        allowNull: true,
      },
      status: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true,
      },
      conversionRate: {
        type: DataTypes.DECIMAL(8, 4),
        allowNull: true,
      },
      deleted: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
    });
  
    units.associate = (models) => {
      // Linking as weight units
      units.hasMany(models.appUnits, { as: 'weightUnit', foreignKey: 'weightUnitId' });
      models.appUnits.belongsTo(units, { as: 'weightUnit', foreignKey: 'weightUnitId' });
  
      // Linking as length units
      units.hasMany(models.appUnits, { as: 'lengthUnit', foreignKey: 'lengthUnitId' });
      models.appUnits.belongsTo(units, { as: 'lengthUnit', foreignKey: 'lengthUnitId' });
  
      // Linking as Distance units
      units.hasMany(models.appUnits, { as: 'distanceUnit', foreignKey: 'distanceUnitId' });
      models.appUnits.belongsTo(units, { as: 'distanceUnit', foreignKey: 'distanceUnitId' });

      units.hasMany(models.appUnits, { as: 'currencyUnit', foreignKey: 'currencyUnitId' });
      models.appUnits.belongsTo(units, { as: 'currencyUnit', foreignKey: 'currencyUnitId' });

      // Linking as base units
      units.hasMany(models.baseUnits, { as: 'weightUnitB', foreignKey: 'weightUnitId' });
      models.baseUnits.belongsTo(units, { as: 'weightUnitB', foreignKey: 'weightUnitId' });
  
      // Linking as length units
      units.hasMany(models.baseUnits, { as: 'lengthUnitB', foreignKey: 'lengthUnitId' });
      models.baseUnits.belongsTo(units, { as: 'lengthUnitB', foreignKey: 'lengthUnitId' });
  
      // Linking as Distance units
      units.hasMany(models.baseUnits, { as: 'distanceUnitB', foreignKey: 'distanceUnitId' });
      models.baseUnits.belongsTo(units, { as: 'distanceUnitB', foreignKey: 'distanceUnitId' });

      units.hasMany(models.baseUnits, { as: 'currencyUnitB', foreignKey: 'currencyUnitId' });
      models.baseUnits.belongsTo(units, { as: 'currencyUnitB', foreignKey: 'currencyUnitId' });

    };
  
    return units;
  };
  