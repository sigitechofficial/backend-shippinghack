module.exports = (sequelize, DataTypes) =>{
    const structureType = sequelize.define('structureType', {
        icon: {
            type: DataTypes.STRING(),
            allowNull: true,
            defaultValue: "",
        },
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
    });
    structureType.associate = (models)=>{
        structureType.hasMany(models.addressDBS);
        models.addressDBS.belongsTo(structureType);
        structureType.hasMany(models.structQuestion);
        models.structQuestion.belongsTo(structureType);
    };
    return structureType;
};