module.exports = (sequelize, DataTypes) =>{
    const support = sequelize.define('support', {
        title: {
            type: DataTypes.STRING(),
            allowNull: true,
        },
        key: {
            type: DataTypes.STRING(),
            allowNull: true,
        },
        value: {
            type: DataTypes.STRING(),
            defaultValue: ''
        },
        status: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },
    });
    return support;
};