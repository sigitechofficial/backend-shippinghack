module.exports = (sequelize, DataTypes) => {
    const corregimiento = sequelize.define('corregimiento', {
        title: {
            type: DataTypes.STRING(),
            allowNull: true,
            defaultValue: ''
        },
        key: {
            type: DataTypes.STRING(),
            allowNull: true,
            defaultValue: ''
        },
        value: {
            type: DataTypes.STRING(),
            allowNull: true,
            defaultValue: ''
        },
        nomenclature: {
            type: DataTypes.STRING(),
            allowNull: true,
            defaultValue: ''
        },
        // Running postal-code counter used when approving addresses.
        lastCode: {
            type: DataTypes.STRING(),
            allowNull: true,
            defaultValue: ''
        },
        status: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: true
        },
    });
    // district association is declared in district.js (district.hasMany(corregimiento)).
    return corregimiento;
};
