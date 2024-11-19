module.exports = (sequelize, DataTypes) =>{
    const cancelledBooking = sequelize.define('cancelledBooking', { 
        reasontext:{
            type: DataTypes.STRING(),
            default:""
        }
    });
    
    return cancelledBooking;
};