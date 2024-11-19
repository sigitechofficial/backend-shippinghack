module.exports=(sequelize,DataTypes)=>{
    const productOrder=sequelize.define('productOrder',{
        totalQuantity:{
            type:DataTypes.INTEGER,
            allowNull:false
        },
        damagedQuantity:{
            type:DataTypes.INTEGER,
            allowNull:false
        },
        fineQuantity:{
            type:DataTypes.INTEGER,
            allowNull:false
        },
         

    },{

        timestamps:true,

    })

    return productOrder
}