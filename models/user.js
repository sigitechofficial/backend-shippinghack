const { Op } = require('sequelize');
const subscriptionPlan = require('./subscriptionPlan');
const CustomException = require("../middleware/errorObject");
module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define(
    "user",
    {
      firstName: {
        type: DataTypes.STRING(),
        allowNull: true,
        defaultValue: "",
      },
      lastName: {
        type: DataTypes.STRING(),
        allowNull: true,
        defaultValue: "",
      },
      email: {
        type: DataTypes.STRING(),
        allowNull: true,
        defaultValue: "",
      },
      countryCode: {
        type: DataTypes.STRING(16),
        allowNull: true,
        defaultValue: null,
      },
      phoneNum: {
        type: DataTypes.STRING(72),
        allowNull: true,
        defaultValue: "",
        validate: {
          noSpecialCharacters(value) {
              // Regular expression to check for special characters
              if (/[^0-9]/.test(value)) {
                  throw new CustomException('Phone number cannot contain special characters.');
              }
          }
      }
      },
      password: {
        type: DataTypes.STRING(),
        allowNull: true,
        defaultValue: "",
      },
      virtualBox: {
        type: DataTypes.STRING(),
        allowNull: true,
        defaultValue: "",
      },
      status: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true,
      },
      verifiedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      stripeCustomerId: {
        type: DataTypes.STRING(),
        allowNull: true,
        defaultValue: "",
      },
      dvToken: {
        type: DataTypes.STRING(),
        allowNull: true,
        defaultValue: "",
      },
      image: {
        type: DataTypes.STRING(),
        allowNull: true,
        defaultValue: "",
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      signedFrom: {
        type: DataTypes.STRING(),
        allowNull: true,
        defaultValue: "",
      },
      businessName:{
        type: DataTypes.STRING(),
        allowNull:true,
      },
      referral:{
        type:DataTypes.STRING(),
        allowNull:true,
      },
      companyName:{
        type:DataTypes.STRING(30),
        allowNull:true,
      },
      taxNumber:{
        type:DataTypes.INTEGER(),
        allowNull:true,
      },
      languageCheck:{
        type:DataTypes.ENUM('en','es'),
        allowNull:true,
        defaultValue:'en'

      }
    },
    {
        uniqueKeys: 
        {
          Email: 
          {
            fields: ["email"],
          },
          PhoneNumber: 
          {
            fields: ["countryCode", "phoneNum"],
            where: {
              [Op.or]: [
                { countryCode: { [Op.not]: null } },
                { countryCode: { [Op.not]: '' } }, // Enforce uniqueness for non-empty countryCode
                { phoneNum: { [Op.not]: null } },    // Enforce uniqueness for non-empty phoneNum
              ],
            },
          },
        }
    }
  );

  user.associate = (models) => {
    // LINK to OTP Table
    user.hasOne(models.otpVerification);
    models.otpVerification.belongsTo(user);
    // LINK to driver detail
    user.hasOne(models.driverDetail);
    models.driverDetail.belongsTo(user);
    // LINK to driver vehicle images
    user.hasMany(models.vehicleImage);
    models.vehicleImage.belongsTo(user);
    // LINK to device Tokens
    user.hasMany(models.deviceToken);
    models.deviceToken.belongsTo(user);

    // linking user to booking as customer
    user.hasMany(models.booking, { as: "customer", foreignKey: "customerId" });
    models.booking.belongsTo(user, {
      as: "customer",
      foreignKey: "customerId",
    });
    // linking user to booking as receivingDriver
    user.hasMany(models.booking, {
      as: "receivingDriver",
      foreignKey: "receivingDriverId",
    });
    models.booking.belongsTo(user, {
      as: "receivingDriver",
      foreignKey: "receivingDriverId",
    });
    // linking user to booking as deliveryDriver
    user.hasMany(models.booking, {
      as: "deliveryDriver",
      foreignKey: "deliveryDriverId",
    });
    models.booking.belongsTo(user, {
      as: "deliveryDriver",
      foreignKey: "deliveryDriverId",
    });

    // linking user to booking as transporter
    user.hasMany(models.booking, {
      as: "transporter",
      foreignKey: "transporterId",
    });
    models.booking.belongsTo(user, {
      as: "transporter",
      foreignKey: "transporterId",
    });

    // Linking user to booking cancelled by
    user.hasMany(models.cancelledBooking);
    models.cancelledBooking.belongsTo(user);
    // Linking user to address
    user.hasMany(models.userAddress);
    models.userAddress.belongsTo(user);

    user.hasMany(models.onGoingOrder);
    models.onGoingOrder.belongsTo(user);

    user.hasMany(models.addressDBS);
    models.addressDBS.belongsTo(user);

    user.hasMany(models.postponedOrder);
    models.postponedOrder.belongsTo(user);

    user.hasMany(models.rating);
    models.rating.belongsTo(user);

    user.hasMany(models.paymentRequests);
    models.paymentRequests.belongsTo(user);

    user.hasMany(models.bank);
    models.bank.belongsTo(user);

    user.hasMany(models.wallet);
    models.wallet.belongsTo(user);

    user.hasMany(models.deviceToken);
    models.deviceToken.belongsTo(user);


    //Linking User with Subscription

    user.hasOne(models.userPlan, { foreignKey: 'userId' });
    models.userPlan.belongsTo(user);

    user.hasMany(models.paypalCard,{foreignKey:"userId"});
    models.paypalCard.belongsTo(user);
    

    //Linking with the merchantcustomerorders table
    user.hasMany(models.merchantcustomerorders,{foreignKey:"merchantId"})
    models.merchantcustomerorders.belongsTo(user,{foreignKey:"merchantId"})

    //linking user to merchant services
    user.hasOne(models.merchantService)
    models.merchantService.belongsTo(user)

    // linking user to transit group
    // user.hasMany(models.inTransitGroups);
    // models.inTransitGroups.belongsTo(user);
  };
  // user.sync({alter:true})
  return user;
};
