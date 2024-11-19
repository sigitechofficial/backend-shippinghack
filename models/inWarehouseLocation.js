module.exports=(sequelize,DataTypes)=>{
    const inWarehouseLocation=sequelize.define("inWarehouseLocation",{
        shelfCode:{
            type:DataTypes.STRING(),
            allowNull:false,
        }
    },{
        timestamps:true,
        paranoid:true
    })

    inWarehouseLocation.associate=(models)=>{

        inWarehouseLocation.hasOne(models.merchantOrder,{as:'currentShelfLocation',foreignKey:'warehouseshelfId'})
        models.merchantOrder.belongsTo(inWarehouseLocation,{as:'currentShelfLocation',foreignKey:'warehouseshelfId',onDelete: 'CASCADE'})

        inWarehouseLocation.hasOne(models.merchantOrder,{as:'receiveingWarehouseShelfCode',foreignKey:'receiveingShelfCodeId'})
        models.merchantOrder.belongsTo(inWarehouseLocation,{as:'receiveingWarehouseShelfCode',foreignKey:'receiveingShelfCodeId',onDelete: 'CASCADE'})

    }

    return inWarehouseLocation
}