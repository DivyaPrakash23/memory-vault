const nodemailer = require("nodemailer");
const twilio     = require("twilio");
const webPush    = require("web-push");
const { getIO }  = require("../config/socket");
const User       = require("../models/User");

// Web Push VAPID keys — run: npx web-push generate-vapid-keys
webPush.setVapidDetails(
  "mailto:" + process.env.EMAIL_USER,
  process.env.VAPID_PUBLIC_KEY  || "REPLACE_WITH_VAPID_PUBLIC_KEY",
  process.env.VAPID_PRIVATE_KEY || "REPLACE_WITH_VAPID_PRIVATE_KEY"
);

const twilioClient = process.env.TWILIO_ACCOUNT_SID
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

// ─── In-App via Socket.IO ──────────────────────────────────────────────────
const sendSocketNotification = (userId, payload) => {
  try {
    const io = getIO();
    io.to(userId.toString()).emit("notification", payload);
  } catch (err) {
    console.warn("Socket notify failed:", err.message);
  }
};

// ─── Web Push ─────────────────────────────────────────────────────────────
const sendPushNotification = async (subscription, payload) => {
  if (!subscription) return;
  try {
    await webPush.sendNotification(subscription, JSON.stringify(payload));
  } catch (err) {
    console.warn("Push failed:", err.message);
  }
};

// ─── SMS via Twilio ───────────────────────────────────────────────────────
const sendSMS = async (to, message) => {
  if (!twilioClient) return;
  try {
    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE,
      to,
    });
  } catch (err) {
    console.warn("SMS failed:", err.message);
  }
};

// ─── Email via Nodemailer ─────────────────────────────────────────────────
const sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, text });
  } catch (err) {
    console.warn("Email failed:", err.message);
  }
};

// ─── Master: notify user + optionally escalate to caregivers ─────────────
const sendReminderToUser = async (userId, payload) => {
  const user = await User.findById(userId);
  if (!user) return;

  sendSocketNotification(userId, payload);

  if (user.pushSubscription) {
    await sendPushNotification(user.pushSubscription, payload);
  }
};

const escalateToCaregivers = async (userId, message) => {
  const user = await User.findById(userId).populate("caregiverIds");
  if (!user) return;

  for (const caregiver of user.caregiverIds) {
    sendSocketNotification(caregiver._id, {
      type:    "caregiver_alert",
      message: `Alert for ${user.fullName}: ${message}`,
    });

    if (caregiver.phone) {
      await sendSMS(caregiver.phone, `MemoryVault Alert — ${user.fullName}: ${message}`);
    }

    if (caregiver.email) {
      await sendEmail(
        caregiver.email,
        `MemoryVault Alert — ${user.fullName}`,
        message
      );
    }
  }
};

module.exports = {
  sendReminderToUser,
  escalateToCaregivers,
  sendSMS,
  sendEmail,
  sendSocketNotification,
};
