module.exports = (sequelize, DataTypes) => {
    const district = sequelize.define('district', {
        title: {
            type: DataTypes.STRING(),
            allowNull: true,
            defaultValue: ''
        },
        key: {
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
    district.associate = (models) => {
        district.hasMany(models.corregimiento, { foreignKey: 'districtId' });
        models.corregimiento.belongsTo(district, { foreignKey: 'districtId' });
    };
    return district;
};
