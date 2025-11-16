// Hope4Paws Cloud Functions – Gmail SMTP

const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

const db = admin.firestore();
const auth = admin.auth();

// Load secrets from Secret Manager
const GMAIL_EMAIL = defineSecret("GMAIL_EMAIL");
const GMAIL_APP_PASSWORD = defineSecret("GMAIL_APP_PASSWORD");

// SMTP Transport
function createTransport() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_EMAIL,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

// Distance Helpers
function toRad(v) {
  return (v * Math.PI) / 180;
}

function distanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(a));
}

// Email Helper
async function sendEmail(to, subject, html) {
  const transporter = createTransport();

  try {
    const info = await transporter.sendMail({
      from: `"Hope4Paws Team" <${process.env.GMAIL_EMAIL}>`,
      to,
      subject,
      html,
    });

    console.log("📨 Gmail SMTP sent:", info.accepted);
  } catch (err) {
    console.error("❌ Gmail SMTP error:", err);
  }
}

// 1) Notify Shelters & Volunteers When an Animal Report is Created

exports.notifySheltersAndVolunteers = onDocumentCreated(
  {
    document: "AnimalReports/{reportId}",
    region: "asia-southeast1",
    secrets: [GMAIL_EMAIL, GMAIL_APP_PASSWORD],
  },
  async (event) => {
    const report = event.data.data();
    if (!report) return;

    const { animalType, condition, address, location = {} } = report;
    const { lat, lng } = location;

    const sheltersSnap = await db.collection("Shelters").get();
    const usersSnap = await db.collection("users").get();

    const shelterEmails = [];
    const volunteerTokens = [];
    const MAX_KM = 15;

    sheltersSnap.forEach((doc) => {
      const s = doc.data();
      if (!s.email) return;

      if (s.location && lat && lng) {
        const d = distanceKm(lat, lng, s.location.lat, s.location.lng);
        if (d <= MAX_KM) shelterEmails.push(s.email);
      } else {
        shelterEmails.push(s.email);
      }
    });

    usersSnap.forEach((doc) => {
      const u = doc.data();
      if (u.role === "volunteer" && u.isAvailable && u.fcmToken) {
        if (u.location && lat && lng) {
          const d = distanceKm(lat, lng, u.location.lat, u.location.lng);
          if (d <= MAX_KM) volunteerTokens.push(u.fcmToken);
        } else {
          volunteerTokens.push(u.fcmToken);
        }
      }
    });

    const title = `🚨 ${animalType || "Animal"} Reported`;
    const body = `${condition || "Unknown"} at ${address || "Unknown"}`;

    // Push notification
    if (volunteerTokens.length > 0) {
      await admin.messaging().sendEachForMulticast({
        tokens: volunteerTokens,
        notification: { title, body },
        data: { type: "animal_report", reportId: event.params.reportId },
      });
    }

    // Email shelter
    if (shelterEmails.length > 0) {
      await sendEmail(
        shelterEmails[0],
        title,
        `<p>${body}</p><p>Check admin panel for more details.</p>`
      );
    }

    await db.collection("Notifications").add({
      title,
      body,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      type: "animal_report",
      reportId: event.params.reportId,
    });
  }
);

// 2️) Create Volunteer Account + Send Gmail Welcome Email
exports.createVolunteerAccount = onCall(
  {
    region: "asia-southeast1",
    secrets: [GMAIL_EMAIL, GMAIL_APP_PASSWORD],
  },
  async (request) => {
    try {
      if (!request.auth)
        throw new HttpsError("unauthenticated", "Login required.");

      const callerId = request.auth.uid;
      const callerDoc = await db.collection("users").doc(callerId).get();

      if (!callerDoc.exists || callerDoc.data().role !== "admin")
        throw new HttpsError("permission-denied", "Admins only.");

      const { username, email, password, phone, location } = request.data;
      if (!email || !password || !username)
        throw new HttpsError(
          "invalid-argument",
          "Missing required fields."
        );

      let userRecord;
      try {
        userRecord = await auth.createUser({
          email,
          password,
          displayName: username,
        });
      } catch (err) {
        if (err.code === "auth/email-already-exists")
          throw new HttpsError("already-exists", "Email already registered.");

        throw new HttpsError("internal", err.message);
      }

      const uid = userRecord.uid;

      await db.collection("users").doc(uid).set({
        userId: uid,
        username,
        email,
        phone: phone || "",
        role: "volunteer",
        isAvailable: true,
        location: location || null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Send welcome email using Gmail
      await sendEmail(
        email,
        "Welcome to Hope4Paws 🐾",
        `
          <h2>Welcome, ${username}! 🎉</h2>
          <p>Your volunteer account has been created.</p>
          <p><b>Email:</b> ${email}</p>
          <p><b>Password:</b> ${password}</p>
          <p>Please change your password after your first login.</p>
        `
      );

      return { success: true, userId: uid };
    } catch (err) {
      console.error("Error:", err);
      throw new HttpsError("internal", err.message);
    }
  }
);
