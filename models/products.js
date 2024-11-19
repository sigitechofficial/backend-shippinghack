module.exports=(sequelize,DataTypes)=>{
    const products=sequelize.define("products",{
        productName:{
            type:DataTypes.STRING(40),
            allowNull:false,

        },
        image: {
            type: DataTypes.STRING(),
            allowNull: true,
            defaultValue: "",
        },
        productDescription:{
            type:DataTypes.STRING(100),
            allowNull:true,
            defaultValue:"",

        },
        price:{
            type:DataTypes.DECIMAL(10,2),
            allowNull:false
        },
        quantity:{
            type:DataTypes.INTEGER,
            allowNull:false,
        },
        weight:{
            type:DataTypes.DECIMAL(10,2),
            allowNull:false
        },
        unit:{
            type:DataTypes.STRING(15),
            allowNull:false,
            defaultValue:"lbs"
        },
        productStatus:{
            type:DataTypes.ENUM("Active","Inactive"),
            allowNull:false,
        },
        productCode:{
            type:DataTypes.STRING(20),
            allowNull:false,
        },
        barCode: {
            type: DataTypes.STRING(1024),
            allowNull: true,
            defaultValue: ''  
        },
        subcategoryName:{
            type:DataTypes.STRING(30),
            allowNull:false,
        },
        merchantCategoryName:{
            type:DataTypes.STRING(30),
            allowNull:false,
        }

    },{
        timestamps: true,
        paranoid:true,
    })

    products.associate = (models)=>{
        //Linking with merchant Order table
        products.hasMany(models.merchantOrder);
        models.merchantOrder.belongsTo(products)
        
        //Linking with productOrder table
        products.hasMany(models.productOrder)
        models.productOrder.belongsTo(products)

        //Linking with the merchantCustomerOrder
        products.hasMany(models.merchantcustomerorders)
        models.merchantcustomerorders.belongsTo(products)


    };


    return products

}