const path = require("path");
const jwt = require("jsonwebtoken");
const admin = require("firebase-admin");
const serviceAccountPath = path.resolve(__dirname, "../notification.json");
const serviceAccount = require(serviceAccountPath);

// ADD THIS LOG to verify the project ID matches your new file
console.log("Firebase initializing for project:", serviceAccount.project_id);

require("dotenv").config();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// utils
const normalizeData = (data = {}) => {
  const result = {};
  Object.keys(data).forEach((key) => {
    result[key] = String(data[key]);
  });
  return result;
};

// exports
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    "sdefefwdasdwaefewfwfdw",
    { expiresIn: "7d" }
  );
};

const sendPushNotification = async ({
  tokens,
  title,
  body,
  type,
  additionalData = {},
}) => {
  console.log("tokens in sender function👉", tokens);
  if (!tokens || tokens.length === 0) return;

  console.log("FCM TOKENS RECEIVED 👉", tokens);

  const baseMessage = {
    notification: { title, body },
    data: normalizeData(additionalData),
    android: { priority: "high" },
    apns: {
      payload: {
        aps: { sound: "default" },
      },
    },
  };

  try {
    // single token
    if (tokens.length === 1) {
      const message = { ...baseMessage, token: tokens[0] };
      return await admin.messaging().send(message);
    }

    // multicast
    const message = { ...baseMessage, tokens };
    return await admin.messaging().sendEachForMulticast(message);
  } catch (error) {
    console.error("FCM Error:", error);
    throw error;
  }
};

module.exports = {
  admin,
  generateToken,
  sendPushNotification,
};
