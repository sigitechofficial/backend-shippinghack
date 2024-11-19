require('dotenv').config();


const admin = require('firebase-admin')
const { Op,literal } = require("sequelize");
let {deviceToken}=require('../models');
const translate = require('translate-google'); 
 


const serviceAccount = require('../firebase.json')

// Initialize Firebase Admin SDK using the service account JSON file
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})

module.exports = async function sendNotification(to, notification, data) {
  try {
        
        console.log("Device Token ==========> to",to)
          if (to && to.length > 0) {
    
  const validData = data && typeof data === 'object' ? data : {}
  for (const key in validData) {
    if (typeof validData[key] !== 'string') {
      validData[key] = String(validData[key]) // Convert non-string values to strings
    }
  }


  
    const token=to[0];
    console.log("🚀 ~ sendNotification ~ token:", token);

    const dvfind= await deviceToken.findOne({
        where:{
            tokenId:token
        },
        attributes:
           [
            'userId',
            [
            literal(
              `(SELECT users.languageCheck
               FROM users WHERE users.id = deviceToken.userId)`,
            ),
            'languageCheck',
          ],
        ],
       
    })
    console.log("🚀 ~ sendNotification ~ dvfind:", dvfind.dataValues.languageCheck)

    const userlanguage=dvfind.dataValues.languageCheck;
    console.log("🚀 ~ sendNotification ~ userlanguage:", userlanguage)

    const translateNotificationTitle=await translate(notification.title,{to:userlanguage})
    console.log("🚀 ~ sendNotification ~ translateNotificationTitle:", translateNotificationTitle)
    const translateBody=await translate(notification.body,{to:userlanguage})
    console.log("🚀 ~ sendNotification ~ translateBody:", translateBody)


    let message = {
        tokens: to, 
        notification:{
            title:translateNotificationTitle,
            body:translateBody
        },
        data:validData
    };   
    
        console.log('🚀 ~ Throw ~ to: Not-Empty =-------',message.tokens)
        const response = await admin.messaging().sendEachForMulticast(message)
        console.log('Successfully sent message:', response)
      }
        
    } catch (error) {

        console.error("Error sending notification:", error);
        
    }
}