module.exports = (sequelize, DataTypes) =>{
    const structQuestion = sequelize.define('structQuestion', {
        question: {
            type: DataTypes.TEXT(),
            allowNull: true,
            defaultValue: ''
        },
        label: {
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
    
    return structQuestion;
};