module.exports = (sequelize, DataTypes) =>{
    const inTransitGroups = sequelize.define('inTransitGroups', {
        transitId: {
            type: DataTypes.STRING(),
            allowNull: true,
        },
        bookingIds: {
            type: DataTypes.STRING(),
            allowNull: true,
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        setOffDate: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        setOffTime: {
            type: DataTypes.TIME,
            allowNull: true,
        },
        arrivalDate: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        arrivalTime: {
            type: DataTypes.TIME,
            allowNull: true,
        },
        status: {
            type: DataTypes.STRING(),
            allowNull: true,
        },
    });
    return inTransitGroups;
};