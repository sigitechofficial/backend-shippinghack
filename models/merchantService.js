module.exports=(sequelize, DataTypes) => {
    const merchantService = sequelize.define('merchantService', {
        title: {
            type:DataTypes.STRING,
            allowNull: false,
        },
        status: {type:DataTypes.BOOLEAN,
            allowNull: false,
            
        },
        price:{
            type:DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0,
        },
    });
    return merchantService;
}