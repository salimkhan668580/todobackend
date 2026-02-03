const jwt = require("jsonwebtoken");
require('dotenv').config()

exports.generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d"
    }
  );
};




const normalizeData = (data = {}) => {
  const result = {};
  Object.keys(data).forEach((key) => {
    result[key] = String(data[key]);
  });
  return result;
};

exports.sendPushNotification = async ({tokens, title, body, type, additionalData = {},}) => {
  // console.log("Preparing to send FCM..........................:", tokens);
  // console.log("token length..........................:", tokens.length);
  if (!tokens || tokens.length === 0) {
    return;
  }
  const baseMessage = {
    notification: { title, body },
    data: normalizeData(additionalData),
    // type: type,
    android: { priority: "high" },
    apns: {
      payload: {
        aps: { sound: "default" },
      },
    },
  };
  console.log("Base message..........................:", baseMessage);
  try {
    if (tokens.length === 1) {
      const token = tokens[0];
      try {
        const message = {
          ...baseMessage,
          token,
        };
        const response = await admin.messaging().send(message);
        console.log("Notification Success (single)");
        return response;
        
      } catch (err) {
        console.log("Notification failed (single)");
        console.log("Error code:", err.code);
        console.log("Error message:", err.message);
        await handleSingleTokenError(err, token);
        return null;
      } 
    }
    if (tokens.length <= 500) {
      const message = {
        ...baseMessage,
        tokens,
      };
      const response = await admin.messaging().sendEachForMulticast(message);

      console.log( "FCM multicast response..........................:", response);
      await handleMulticastCleanup(tokens, response);
      return response;
    }
    const batchSize = 500;
    const batchPromises = [];
    for (let i = 0; i < tokens.length; i += batchSize) {
      const batchTokens = tokens.slice(i, i + batchSize);
      const message = {
        ...baseMessage,
        tokens: batchTokens,
      };
      batchPromises.push(
        admin
          .messaging()
          .sendEachForMulticast(message)
          .then(async (res) => {
            await handleMulticastCleanup(batchTokens, res);
            return res;
          })
      );
    }
    return Promise.all(batchPromises);
  } catch (error) {
    console.error("Unexpected FCM error:", error);
  }
};
