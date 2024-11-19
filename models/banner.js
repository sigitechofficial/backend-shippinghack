module.exports = (sequelize, DataTypes) =>{
    const banner = sequelize.define('banner', {
        title: {
            type: DataTypes.STRING(),
            allowNull: true,
            defaultValue: 'Banner'
        },
        description: {
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
            allowNull: true,
            defaultValue: false
        },
    });
    return banner;
};