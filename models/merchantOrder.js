module.exports=(sequelize,DataTypes) =>{
    const merchantOrder=sequelize.define('merchantOrder',{

        orderType:{
            type:DataTypes.ENUM('INBOUND','OUTBOUND')
            
        },
        merchantName:{
            type:DataTypes.STRING(30),
            allowNull:false,
        },
        merchantId:{
            type:DataTypes.STRING(),
            allowNull:false
        },
        merchantReference:{
            type:DataTypes.STRING(),
            allowNull: false,
        },
        quantity:{
            type:DataTypes.INTEGER,
            allowNull:false
        }   
         

    })

    merchantOrder.associate=(models)=>{


        merchantOrder.hasMany(models.productOrder)
        models.productOrder.belongsTo(merchantOrder)
    }

    return merchantOrder

}