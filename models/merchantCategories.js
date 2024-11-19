//Categories For Merchant
module.exports=(sequelize,DataTypes)=>{
    const merchantCategories=sequelize.define('merchantCategories',{
        title:{
            type:DataTypes.STRING(20),
            allowNull: false,
            unique:{
                msg:"Category already exists"
            },
            defaultValue:""
        },
        status: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        }

    },{
        timestamps:true,
    })


    merchantCategories.associate = (models)=>{
        merchantCategories.hasMany(models.products);
        models.products.belongsTo(merchantCategories);
    };

    return merchantCategories;
}