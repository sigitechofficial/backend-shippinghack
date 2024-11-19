module.exports = (sequelize, DataTypes) =>{
    const generalCharges = sequelize.define('generalCharges', {
        title: {
            type: DataTypes.STRING(),
            allowNull: true,
        },
        key: {
            type: DataTypes.STRING(),
            allowNull: true,
        },
        value: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        information: {
            type: DataTypes.STRING(),
            allowNull: true,
        },
        
    });
    return generalCharges;
};