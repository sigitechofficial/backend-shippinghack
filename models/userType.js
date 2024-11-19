module.exports = (sequelize, DataTypes) =>{
    const userType = sequelize.define('userType', {
        name: {
            type: DataTypes.STRING(),
            allowNull: true,
        },
    },{
       timestamps: true,
    }
    
);
    userType.associate = (models)=>{
        userType.hasMany(models.user);
        models.user.belongsTo(userType);
    };
    

    // userType.sync({alter:true})
    
    return userType;
};