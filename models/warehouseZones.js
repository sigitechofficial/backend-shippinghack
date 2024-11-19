module.exports=(sequelize,DataTypes) =>{
    const warehouseZones=sequelize.define('warehouseZones',{
        zoneName:{
            type:DataTypes.STRING(),
            allowNull:false,
        }
    },{
        timestamps:true,
        paranoid:true
    })

    warehouseZones.associate=(models) =>{
        warehouseZones.hasOne(models.inWarehouseLocation,{foreignKey:'warehousezoneId'})
        models.inWarehouseLocation.belongsTo(warehouseZones,{foreignKey:'warehousezoneId',onDelete: 'CASCADE'})

    }
    return warehouseZones;
}