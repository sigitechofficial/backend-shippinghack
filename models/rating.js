module.exports = (sequelize, DataTypes) =>{
    const rating = sequelize.define('rating', {
        value: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0
        },
        comment: {
            type: DataTypes.STRING(),
            allowNull: true,
            defaultValue: ''
        }, 
        at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    });
    // rating.associate = (models)=>{
    //     rating.hasMany(models.appointment);
    //     models.appointment.belongsTo(rating);
    // };
    return rating;
};