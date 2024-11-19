module.exports = (sequelize, DataTypes) =>{
    const feature = sequelize.define('feature', {
        title: {
            type: DataTypes.STRING(),
            allowNull: true,
            defaultValue: "",
        },
        status: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
        },
        key: {
            type: DataTypes.STRING(),
            allowNull: true,
            defaultValue: "",
        },
        featureOf: {
            type: DataTypes.STRING(),
            allowNull: true,
            defaultValue: "",
        },
    });
    feature.associate = (models)=>{
        feature.hasMany(models.permission);
        models.permission.belongsTo(feature);
    };
    return feature;
};