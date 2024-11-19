module.exports = (sequelize, DataTypes) =>{
    const classifiedAs = sequelize.define('classifiedAs', {
        name: {
            type: DataTypes.STRING(),
            allowNull: true,
        },
    });
    classifiedAs.associate = (models)=>{
        classifiedAs.hasMany(models.warehouse);
        models.warehouse.belongsTo(classifiedAs);
    };
    
    return classifiedAs;
};