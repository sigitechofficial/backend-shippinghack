// Messages sent from the website's Contact us form
module.exports = (sequelize, DataTypes) => {
  const contactMessage = sequelize.define('contactMessage', {
    name: { type: DataTypes.STRING(120), allowNull: false },
    email: { type: DataTypes.STRING(190), allowNull: false },
    subject: { type: DataTypes.STRING(120), allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    // set when the email to support could be sent
    emailedAt: { type: DataTypes.DATE, allowNull: true },
  });
  return contactMessage;
};
