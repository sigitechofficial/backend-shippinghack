module.exports = (sequelize, DataTypes) =>{
    const warehouse = sequelize.define('warehouse', {
        email: {
            type: DataTypes.STRING(),
            allowNull: false,
            unique:{
                args:true,
                msg:'Email already exsist'
            }
        },
        password: {
            type: DataTypes.STRING(),
            allowNull: true,
        },
        companyName: {
            type: DataTypes.STRING(),
            allowNull: true,
        },
        companyEmail: {
            type: DataTypes.STRING(),
            allowNull: true,
        },
        status: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
        },
        dvToken: {
            type: DataTypes.STRING(),
            allowNull: true,
        },
        countryCode: {
            type: DataTypes.STRING(16),
            allowNull: true,
            defaultValue: "",
        },
        phoneNum: {
            type: DataTypes.STRING(72),
            allowNull: true,
            defaultValue: "",
        },
        located: {
            type: DataTypes.STRING(),
            allowNull: true,
        },
        
    });
    warehouse.associate = (models)=>{
        warehouse.hasMany(models.driverDetail);
        models.driverDetail.belongsTo(warehouse);
        // linking user to booking as receivingWarehouse
        warehouse.hasMany(models.booking, {as: 'receivingWarehouse', foreignKey: 'receivingWarehouseId'});
        models.booking.belongsTo(warehouse, {as: 'receivingWarehouse', foreignKey: 'receivingWarehouseId'});
        // linking user to booking as deliveryWarehouse
        warehouse.hasMany(models.booking, {as: 'deliveryWarehouse', foreignKey: 'deliveryWarehouseId'});
        models.booking.belongsTo(warehouse, {as: 'deliveryWarehouse', foreignKey: 'deliveryWarehouseId'}); 

        warehouse.hasMany(models.wallet, {as: 'admin', foreignKey: 'adminId'});
        models.wallet.belongsTo(warehouse, {as: 'admin', foreignKey: 'adminId'});
        // linking to intransit 
        warehouse.hasMany(models.inTransitGroups, {as: 'receivingWarehouseT', foreignKey: 'receivingWarehouseId'});
        models.inTransitGroups.belongsTo(warehouse, {as: 'receivingWarehouseT', foreignKey: 'receivingWarehouseId'});
        // linking to intransit
        warehouse.hasMany(models.inTransitGroups, {as: 'deliveryWarehouseT', foreignKey: 'deliveryWarehouseId'});
        models.inTransitGroups.belongsTo(warehouse, {as: 'deliveryWarehouseT', foreignKey: 'deliveryWarehouseId'}); 
        warehouse.belongsTo(warehouse,{as :'employee', foreignKey: 'employeeOf'})
        warehouse.hasMany(models.addressDBS);

        models.addressDBS.belongsTo(warehouse);

        warehouse.hasOne(models.merchantOrder,{as:'currentWareHouseLocation',foreignKey:'warehouseId'});
        models.merchantOrder.belongsTo(models.warehouse,{as:'currentWareHouseLocation',foreignKey:'warehouseId'})

        warehouse.hasOne(models.merchantOrder,{as:'receiveingWarehouseId',foreignKey:'receiveingWarehouse'});
        models.merchantOrder.belongsTo(models.warehouse,{as:'receiveingWarehouseId',foreignKey:'receiveingWarehouse'})

        //=========Warehouse and warehouseZones Relation ==========>
        warehouse.hasOne(models.warehouseZones)
        models.warehouseZones.belongsTo(warehouse)


        //==========Warehouse and MerchantOrder Relation===========>
        warehouse.hasOne(models.merchantOrder)
        models.merchantOrder.belongsTo(warehouse)


        //=========WarehouseAssociate and merchant Order realtion============>

            warehouse.hasMany(models.merchantOrder,{as:'warehouseAssociate',foreignKey:'warehouseAssociateId'})
            models.merchantOrder.belongsTo(warehouse,{as:'warehouseAssociate',foreignKey:'warehouseAssociateId'})

        //=========Warehouse and warehouseInventory Realtion============>

            warehouse.hasMany(models.warehouseinventories,{foreignKey:'warehouseId'})
            models.warehouseinventories.belongsTo(warehouse,{foreignKey:'warehouseId'})

        
    };
        // warehouse.sync({alter:true})
    

    return warehouse;
};