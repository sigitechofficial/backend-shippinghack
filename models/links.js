module.exports = (sequelize, DataTypes) =>{
    const links = sequelize.define('links', {
        title: {
            type: DataTypes.STRING(),
            allowNull: true,
        },
        key: {
            type: DataTypes.STRING(),
            allowNull: true,
        },
        link: {
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
    return links;
};