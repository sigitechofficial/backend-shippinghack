module.exports = (sequelize, DataTypes) =>{
    const package = sequelize.define('package', {
        trackingNum: {
            type: DataTypes.STRING(1024),
            allowNull: true,
            defaultValue: ''  
        },
        name: {
            type: DataTypes.STRING(1024),
            allowNull: true,
            defaultValue: ''  
        },
        email: {
            type: DataTypes.STRING(1024),
            allowNull: true,
            defaultValue: ''  
        },
        phone: {
            type: DataTypes.STRING(1024),
            allowNull: true,
            defaultValue: ''  
        },
        weight: {
            type: DataTypes.DECIMAL(12,2),
            allowNull: true,
            defaultValue: '0'
        },
        length: {
            type: DataTypes.DECIMAL(12,2),
            allowNull: true,
            defaultValue: '0'
        },
        width: {
            type: DataTypes.DECIMAL(12,2),
            allowNull: true,
            defaultValue: '0'
        },
        height: {
            type: DataTypes.DECIMAL(12,2),
            allowNull: true,
            defaultValue: '0'
        },
        volume: {
            type: DataTypes.DECIMAL(15,2),
            allowNull: true,
            defaultValue: '0'
        },
        deliveryDate: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        note: {
            type: DataTypes.STRING(1024),
            allowNull: true,
            defaultValue: ''  
        },
        barcode: {
            type: DataTypes.STRING(1024),
            allowNull: true,
            defaultValue: ''  
        },
        catText: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: ''  
        },
        total: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: true,
            defaultValue: '0.00'
        },
        status: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        arrived:{
            type:DataTypes.ENUM('neverArrived','pending','arrived'),
            defaultValue:'pending',
        },
        actualWeight: {
            type: DataTypes.DECIMAL(12,2),
            allowNull: true,
            defaultValue: '0'
        },
        actualLength: {
            type: DataTypes.DECIMAL(12,2),
            allowNull: true,
            defaultValue: '0'
        },
        actualWidth: {
            type: DataTypes.DECIMAL(12,2),
            allowNull: true,
            defaultValue: '0'
        },
        actualHeight: {
            type: DataTypes.DECIMAL(12,2),
            allowNull: true,
            defaultValue: '0'
        },
        actualVolume: {
            type: DataTypes.DECIMAL(15,2),
            allowNull: true,
            defaultValue: '0'
        },
        ETA: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        logisticCompanyTrackingNum: {
            type: DataTypes.STRING(1024),
            allowNull: true,
            defaultValue: null  
        },
        fedexLabel:{
           type: DataTypes.STRING(1024),
           allowNull:true
        }
        
        
    });
    // package.associate = (models)=>{
    // };
    // package.sync({alter:true})
    
    return package;
};