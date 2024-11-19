module.exports = (sequelize, DataTypes) =>{
    const role = sequelize.define('role', {
        name: {
            type: DataTypes.STRING(),
            allowNull: true,
        },
        status: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    });
    role.associate = (models)=>{
        role.hasMany(models.warehouse);
        models.warehouse.belongsTo(role);

        role.hasMany(models.permission);
        models.permission.belongsTo(role);
        
        role.belongsTo(models.warehouse);

    };
    
    return role;
};