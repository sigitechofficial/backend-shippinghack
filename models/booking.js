module.exports = (sequelize, DataTypes) =>{
    const booking = sequelize.define('booking', {
        trackingId: {
            type: DataTypes.STRING(),
            allowNull: true,
            defaultValue: 'TSH-default-1000'
        },
        pickupDate: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        pickupStartTime: {
            type: DataTypes.TIME,
            allowNull: true,
        },
        pickupEndTime: {
            type: DataTypes.TIME,
            allowNull: true,
        },
        dropoffDate: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        dropoffStartTime: {
            type: DataTypes.TIME,
            allowNull: true,
        },
        dropoffEndTime: {
            type: DataTypes.TIME,
            allowNull: true,
        },
        instruction: {
            type: DataTypes.STRING(),
            allowNull: true,
            defaultValue: ''
        },
        receiverEmail: {
            type: DataTypes.STRING(),
            allowNull: true,
            defaultValue: ''
        },
        receiverPhone: {
            type: DataTypes.STRING(),
            allowNull: true,
            defaultValue: ''
        },
        receiverName: {
            type: DataTypes.STRING(),
            allowNull: true,
            defaultValue: ''
        },
        senderEmail: {
            type: DataTypes.STRING(),
            allowNull: true,
            defaultValue: ''
        },
        senderPhone: {
            type: DataTypes.STRING(),
            allowNull: true,
            defaultValue: ''
        },
        senderName: {
            type: DataTypes.STRING(),
            allowNull: true,
            defaultValue: ''
        },
        subTotal: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: true,
            defaultValue: '0.00'
        },
        discount: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: true,
            defaultValue: '0.00'
        },
        total: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: true,
            defaultValue: '0.00'
        },
        status: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },
        paymentConfirmed: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },
        scheduleSetBy: {
            type: DataTypes.STRING(),
            allowNull: true,
            defaultValue: ''
        },
        ETA: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        weight: {
            type: DataTypes.DECIMAL(8,2),
            allowNull: true,
            defaultValue: '0'
        },
        length: {
            type: DataTypes.DECIMAL(8,2),
            allowNull: true,
            defaultValue: '0'
        },
        width: {
            type: DataTypes.DECIMAL(8,2),
            allowNull: true,
            defaultValue: '0'
        },
        height: {
            type: DataTypes.DECIMAL(8,2),
            allowNull: true,
            defaultValue: '0'
        },
        volume: {
            type: DataTypes.DECIMAL(8,2),
            allowNull: true,
            defaultValue: '0'
        },
        distance: {
            type: DataTypes.DECIMAL(8,2),
            allowNull: true,
            defaultValue: '0'
        },
        driverStatus: {
            type: DataTypes.STRING(),
            allowNull: true,
            defaultValue: ''
        },
        deliveredAt: {
            type: DataTypes.TIME,
            allowNull: true,
        },
        deliveredAtPickup: {
            type: DataTypes.TIME,
            allowNull: true,
        },
        rated: {
            type: DataTypes.STRING(),
            allowNull: true,
            defaultValue: 'pending'  
        },
        barcode: {
            type: DataTypes.STRING(1024),
            allowNull: true,
            defaultValue: ''  
        },
        signatureImage: {
            type: DataTypes.STRING(1024),
            allowNull: true,
            defaultValue: '' 
        },
        paypalOrderId: {
            type: DataTypes.STRING(255),
            allowNull: true,  
        },
        paymentBy: {
            type: DataTypes.STRING(255),
            allowNull: true,  
        },
        captureId: {
            type: DataTypes.STRING(255),
            allowNull: true,  
        },
        catText: {
            type: DataTypes.STRING(255),
            allowNull: true,  
        },
        consolidation:{
            type:DataTypes.BOOLEAN,
            default:false,
        },
        logisticCompanyTrackingNum: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: null  
        },
        label: {
            type: DataTypes.JSON,
            allowNull: true,  
        },
        productName:{
            type:DataTypes.STRING(40),
            allowNull:true,
        },
        productQuantity:{
            type:DataTypes.INTEGER,
            allowNull:true,
        },
        pickupAddressType:{
            type:DataTypes.ENUM('warehouse','merchantAddress'),
            allowNull:true,
        }

    });
    booking.associate = (models)=>{
        // 
        booking.hasMany(models.package);
        models.package.belongsTo(booking);
        
        booking.hasMany(models.bookingHistory);
        models.bookingHistory.belongsTo(booking);
        
        booking.hasOne(models.cancelledBooking);
        models.cancelledBooking.belongsTo(booking);
        
        booking.hasOne(models.billingDetails);
        models.billingDetails.belongsTo(booking);
        
        booking.hasMany(models.postponedOrder);
        models.postponedOrder.belongsTo(booking);

        booking.hasOne(models.rating);
        models.rating.belongsTo(booking);

        booking.hasMany(models.wallet);
        models.wallet.belongsTo(booking);
    };

    // booking.sync({force:true})
    
    return booking;
};