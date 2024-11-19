module.exports=(sequelize,DataTypes)=>{
    const paypalCard=sequelize.define('paypalCard',{
        CustomercardId:{
            type:DataTypes.STRING(),
            allowNull:true,
        }
    },{
        timestamps:true
    })

    return paypalCard


}