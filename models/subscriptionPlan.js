module.exports = (sequelize, DataTypes) =>{
    const subscriptionPlan = sequelize.define('subscriptionPlan', {
        title: {
            type: DataTypes.STRING(),
            allowNull: false,
        },
        shippingPerMonth:{
            type:DataTypes.STRING(),
            allowNull:false
        },
        processing: {
            type: DataTypes.STRING(),
            allowNull: true,
        },
        shippingDiscount: {
            type: DataTypes.INTEGER(),
            allowNull: true,
        },
        freeStorage: {
            type: DataTypes.STRING(),
            allowNull: true,
            defaultValue: false
        },
        returns:{
            type:DataTypes.STRING(),
            allowNull:false
        },
        pickAndPack:{
            type:DataTypes.STRING(),
            allowNull:false
        },
        apiAccess:{
            type:DataTypes.STRING(),
            allowNull:false,
        },
        annual_price: {
            type: DataTypes.INTEGER,  
          },
          monthly_price: {
            type: DataTypes.INTEGER,
          }
    });
    
    return subscriptionPlan;
};