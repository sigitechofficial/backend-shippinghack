module.exports = (sequelize, DataTypes) =>{
    const category = sequelize.define('category', {
        title: {
            type: DataTypes.STRING(),
            unique: {
                args:true,
                msg:'Category Title Already Exsist'
            },
            
            
            
        },
        status: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },
        image: {
            type: DataTypes.STRING(),
            allowNull: true,
            defaultValue: ''
        },
        charge: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
    });
    category.associate = (models)=>{
        category.hasMany(models.package);
        models.package.belongsTo(category);
    };
    return category;
};