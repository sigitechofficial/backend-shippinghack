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
        // size-weight divisor in in³ per lb (139 for FedEx/UPS)
        divisor: {
            type: DataTypes.DECIMAL(12,4),
            // a number in responses (the apps read it as a number)
            get() {
                const v = this.getDataValue('divisor');
                return v === null || v === undefined ? v : Number(v);
            },
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