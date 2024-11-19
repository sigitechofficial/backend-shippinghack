const merchantOrder = require("./merchantOrder");

module.exports = (sequelize, DataTypes) =>{
    const bookingStatus = sequelize.define('bookingStatus', {
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
    });
    bookingStatus.associate = (models)=>{
        bookingStatus.hasMany(models.booking);
        models.booking.belongsTo(bookingStatus);
        
        bookingStatus.hasMany(models.bookingHistory);
        models.bookingHistory.belongsTo(bookingStatus);

        
    };
    return bookingStatus;
};