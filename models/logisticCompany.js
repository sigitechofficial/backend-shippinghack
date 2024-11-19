module.exports = (sequelize, DataTypes) =>{
    const logisticCompany = sequelize.define('logisticCompany', {
        title: {
            type: DataTypes.STRING(),
            allowNull: true,
            defaultValue: ''
        },
        description: {
            type: DataTypes.STRING(),
            allowNull: true,
            defaultValue: ''
        },
        status: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },
        flashCharges: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        divisor: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        standardCharges: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        logo: {
            type: DataTypes.STRING(),
            allowNull: true,
            defaultValue: "",
        },
        deleted: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        }
    });
    logisticCompany.associate = (models)=>{
        logisticCompany.hasMany(models.booking);
        models.booking.belongsTo(logisticCompany);

        
        logisticCompany.hasMany(models.inTransitGroups);
        models.inTransitGroups.belongsTo(logisticCompany);

        logisticCompany.hasMany(models.logisticCompanyCharges);
        models.logisticCompanyCharges.belongsTo(logisticCompany);
    };
    
    
    return logisticCompany;
};