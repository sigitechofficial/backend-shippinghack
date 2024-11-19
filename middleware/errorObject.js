// const translate = require('translate-google');

// class CustomError extends Error {
//   constructor(message, body) {
//     console.log("🚀 ~ CustomError ~ constructor ~ body:", body);
//     console.log("🚀 ~ CustomError ~ constructor ~ message:", message);

//     super(message);
//     this.message = message;
//     this.body = body || message;
//   }
// }

// async function translateMessage(message, language) {
//   try {
//     const translated = await translate(message, { to: language });
//     return translated;
//   } catch (error) {
//     console.error('Translation Error:', error);
//     return message; // Fallback to original message in case of translation error
//   }
// }

// // Making the function asynchronous
// exports.CustomException = async (message, language) => {
//   try {
//     const translatedMessage = await translateMessage(message, language);
//     console.log("🚀 ~ CustomException ~ translatedMessage:", translatedMessage);
    
//     // Throwing the CustomError after translation
//     throw new CustomError(translatedMessage, translatedMessage);
//   } catch (error) {
//     console.error("🚀 ~ error:", error);
//     // You can rethrow the error if needed or handle it here.
//     throw error;
//   }
// };

class CustomException extends Error {
  constructor(message, body) {
    super(body);
    this.message = message;
    this.body = body
  }
}

module.exports = CustomException;
 

 

// Usage Example
// (async () => {
//   const exception = await CustomException.create('This is a test message', 'es');
//   console.log(exception.message); // Outputs translated message if successful, original message otherwise
// })();

// class CustomErrors extends Error {
//   constructor(message, language, translatedMessage) {
//     super();

//     this.language = language || 'en';
//     this.originalMessage = message;
//     this.message = translatedMessage || message;
//   }

//   // Static async method to create an instance of CustomException
//   static async create(message, language) {
//     if (language === 'en') {
//       return new CustomException(message, language, message);
//     } else {
//       try {
//         const translatedMessage = await CustomException.translateMessage(message, language);
//         return new CustomException(message, language, translatedMessage);
//       } catch (error) {
//         console.error('Translation Error:', error);
//         return new CustomException(message, language, message); // Fallback to original message in case of an error
//       }
//     }
//   }

//   // Function to translate the message
//   static async translateMessage(message, language) {
//     try {
//       const translated = await translate(message, { to: language });
//       return translated;
//     } catch (error) {
//       console.error('Translation Error:', error);
//       return message; // Fallback to original message in case of translation error
//     }
//   }
// }