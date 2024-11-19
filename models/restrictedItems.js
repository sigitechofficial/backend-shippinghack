module.exports = (sequelize, DataTypes) =>{
    const restrictedItems = sequelize.define('restrictedItems', {
        title: {
            type: DataTypes.STRING(),
            allowNull: true,
            defaultValue: ''
        },
        image: {
            type: DataTypes.STRING(),
            allowNull: true,
            defaultValue: ''
        },
        status: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        deleted: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },

    });
    
    return restrictedItems;
};