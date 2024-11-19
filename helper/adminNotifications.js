const admin = require('firebase-admin');
const translate = require('translate-google');
const { deviceToken, user } = require('../models');

async function sendNotification(input, notification) {
  try {


 const enTokens = input
  .filter(item => item.dataValues.languageCheck === 'en')
  .flatMap(item => item.deviceTokens.map(token => token.tokenId));

const esTokens = input
  .filter(item => item.dataValues.languageCheck === 'es')
  .flatMap(item => item.deviceTokens.map(token => token.tokenId));
 
    console.log("🚀 ~ sendNotification ~ enTokens:", enTokens)
    console.log("🚀 ~ sendNotification ~ esTokens:", esTokens)

    if (enTokens.length > 0) {
       const translatedTitleEn = await translate(notification.title, { to: 'en' });
       const translatedBodyEn = await translate(notification.body, { to: 'en' });

      const messageEn = {
        tokens: enTokens,
        notification: {
          title: translatedTitleEn,
          body: translatedBodyEn,
        },
        data: {}, // Any additional data can be added here
      };

      const responseEn = await admin.messaging().sendEachForMulticast(messageEn);
      console.log('Successfully sent English messages:', responseEn);
    }

    // Send Spanish notifications
    if (esTokens.length > 0) {
      const translatedTitleEs = await translate(notification.title, { to: 'es' });
      console.log("🚀 ~ sendNotification ~ translatedTitleEs:", translatedTitleEs)
      const translatedBodyEs = await translate(notification.body, { to: 'es' });
      console.log("🚀 ~ sendNotification ~ translatedBodyEs:", translatedBodyEs)

      const messageEs = {
        tokens: esTokens,
        notification: {
          title: translatedTitleEs,
          body: translatedBodyEs,
        },
        data: {}, // Any additional data can be added here
      };

      const responseEs = await admin.messaging().sendEachForMulticast(messageEs);
      console.log('Successfully sent Spanish messages:', responseEs);
    }

  } catch (error) {
    console.error("Error sending notification:", error);
  }
}

module.exports = sendNotification;
