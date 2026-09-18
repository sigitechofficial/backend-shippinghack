module.exports = (sequelize, DataTypes) => {
    const province = sequelize.define('province', {
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
    province.associate = (models) => {
        province.hasMany(models.district, { foreignKey: 'provinceId' });
        models.district.belongsTo(province, { foreignKey: 'provinceId' });
    };
    return province;
};
