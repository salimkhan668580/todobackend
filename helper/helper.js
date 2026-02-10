const path = require("path");
const jwt = require("jsonwebtoken");
const admin = require("firebase-admin");

const serviceAccountPath = path.resolve(__dirname, "../notification.json");
// const serviceAccount = require(serviceAccountPath);




require("dotenv").config();



const serviceAccount = {
  type: "service_account",
  project_id: process.env.PROJECT_ID,
  private_key_id: process.env.PRIVATE_KEY_ID,
  client_email: process.env.CLIENT_EMAIL,
  private_key: process.env.PRIVATE_KEY.replace(/\\n/g, "\n"),
  client_id:process.env.CLIENT_ID,
  auth_uri:process.env.AUTH_URI,
  token_uri:process.env.TOKEN_URI,
  auth_provider_x509_cert_url:process.env.AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url:process.env.CLIENT_X509_CERT_URL,
  universe_domain:process.env.UNIVERSE_DOMAIN
};


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
