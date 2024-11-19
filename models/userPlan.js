module.exports=(sequelize,DataTypes)=>{
    const userPlan=sequelize.define('userPlan',{
        buyDate:{
            type:DataTypes.DATE,
            allowNUll:false,
            defaultValue: sequelize.NOW
        },
        expiryDate:{
            type:DataTypes.DATE,
            allowNUll:false
        },
        type:{
            type:DataTypes.STRING(),
            allowNUll:false

        },
        price:{
            type:DataTypes.INTEGER,
            allowNUll:false,
        },
        subscriptionPlanID:{
            type:DataTypes.STRING(),
            allowNUll:false
        },
        subscriptionStatus:{
            type:DataTypes.STRING(),
            allowNUll:false
        },
        shipLimit:{
            type:DataTypes.INTEGER,
            allowNUll:false
        }
    },{

        timestamps:true,

    },{
        
    })


    return userPlan
}