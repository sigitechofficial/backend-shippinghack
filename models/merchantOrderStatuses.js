module.exports=(sequelize,DataTypes)=>{

    const merchantOrderStatuses=sequelize.define('merchantOrderStatuses',{
        title:{
            type:DataTypes.STRING(30),
            allowNull:false
        },
        description:{
            type:DataTypes.STRING(40),
            allowNull:false,
        }
    })

    merchantOrderStatuses.associate=(models)=>{

        merchantOrderStatuses.hasOne(models.merchantOrder,{foreignKey:'merchantorderstatusesId'})
        models.merchantOrder.belongsTo(merchantOrderStatuses,{foreignKey:'merchantorderstatusesId'})

        merchantOrderStatuses.hasOne(models.productOrder,{as:'OrderStatus',foreignKey:'merchantOrderStatusId'})
        models.productOrder.belongsTo(merchantOrderStatuses,{as:'OrderStatus',foreignKey:'merchantOrderStatusId'})

        merchantOrderStatuses.hasOne(models.merchantcustomerorders,{foreignKey:'merchantorderstatusesId'})
        models.merchantcustomerorders.belongsTo(merchantOrderStatuses,{foreignKey:'merchantorderstatusesId'})

        merchantOrderStatuses.hasOne(models.booking,{foreignKey:'merchantorderstatusesId'});
        models.booking.belongsTo(merchantOrderStatuses,{foreignKey:'merchantorderstatusesId'})

    }


    return merchantOrderStatuses

}