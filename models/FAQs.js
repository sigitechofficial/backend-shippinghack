module.exports = (sequelize, DataTypes) =>{
    const FAQs = sequelize.define('FAQs', {
        title: {
            type: DataTypes.TEXT('medium'),
            allowNull: true,
        },
        answer: {
            type: DataTypes.TEXT('long'),
            allowNull: true,
        },
        status: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },
        deleted: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },
    });
    return FAQs;
};