module.exports=(sequelize,DataTypes)=>{
    const merchantcustomerorders=sequelize.define('merchantcustomerorders',{
        quantity:{
            type:DataTypes.INTEGER,
            allowNUll:false
        },
        totalAmount:{
            type:DataTypes.FLOAT,
            allowNUll:false
        },
        customerName:{
            type:DataTypes.STRING(20),
            allowNUll:false,

        },
        customerEmail:{
            type:DataTypes.STRING(),
            allowNUll:false,
            isEmail:true,

        },
        contactNumber:{
            type:DataTypes.STRING(10),
            allowNUll:false,
        },
        deliveryInstruction:{
            type:DataTypes.STRING(100),
            allowNUll:true,
        }
    })

    merchantcustomerorders.associate=(models)=>{

        merchantcustomerorders.hasMany(models.booking,{foreignKey:'merchantcustomerordersId'})
        models.booking.belongsTo(merchantcustomerorders,{foreignKey:'merchantcustomerordersId'})

    }


    return merchantcustomerorders

}