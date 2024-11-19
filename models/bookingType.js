module.exports = (sequelize, DataTypes) =>{
    const bookingType = sequelize.define('bookingType', {
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
    bookingType.associate = (models)=>{
        bookingType.hasMany(models.booking);
        models.booking.belongsTo(bookingType);
    };
    return bookingType;
};