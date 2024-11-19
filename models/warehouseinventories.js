
module.exports=(sequelize,DataTypes)=>{
    const warehouseinventories=sequelize.define('warehouseinventories',{
        productName:{
            type:DataTypes.STRING(40),
            allowNull:false,
        },
        productWarehouseQuantity:{
            type:DataTypes.INTEGER,
            allowNull:false,
        },
        warehouseZone:{
            type:DataTypes.STRING(),
            allowNull:false,
        },
        shelfCode:{
            type:DataTypes.STRING(),
            allowNull:false
        },

    })


    return warehouseinventories
}