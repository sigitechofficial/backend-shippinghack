module.exports = (sequelize, DataTypes) => {
    const webPolicy = sequelize.define('webPolicy', {
        title: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        value: {
            type: DataTypes.TEXT,
            allowNull: true,
        }, 
        status: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        }
    });
    return webPolicy;
};
