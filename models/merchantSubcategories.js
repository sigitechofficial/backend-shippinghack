//Categories For Merchant
module.exports=(sequelize,DataTypes)=>{
    const merchantSubcategories=sequelize.define('merchantSubcategories',{
        title:{
            type:DataTypes.STRING(20),
            allowNull: false,
            uniquw:{
                args:true,
                msg:"Category already exists"
            },
            defaultValue:""
        },
        description:{
            type:DataTypes.STRING(50),
            allowNull:true,
        },
        status: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        }

    },{
        timestamps:true,
    })


    merchantSubcategories.associate = (models)=>{
        merchantSubcategories.hasMany(models.products);
        models.products.belongsTo(merchantSubcategories);
    };

    return merchantSubcategories;
}