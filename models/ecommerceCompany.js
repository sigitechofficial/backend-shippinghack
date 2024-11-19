module.exports = (sequelize, DataTypes) =>{
    const ecommerceCompany = sequelize.define('ecommerceCompany', {
        title: {
            type: DataTypes.STRING(),
            allowNull: true,
            defaultValue: ''
        },
        description: {
            type: DataTypes.STRING(),
            allowNull: true,
            defaultValue: ''
        },
        charge: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        status: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },
        deleted: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },

    });
    ecommerceCompany.associate = (models)=>{
        ecommerceCompany.hasMany(models.package);
        models.package.belongsTo(ecommerceCompany);
    };
    return ecommerceCompany;
};