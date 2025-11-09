/**
 * Hope4Paws Cloud Functions
 * Handles automatic notifications to nearby shelters & volunteers
 * when a new animal report is created.
 */

const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { getFirestore } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");
const admin = require("firebase-admin");
const fetch = require("node-fetch"); // npm i node-fetch@2 if not installed

admin.initializeApp();
const db = getFirestore();

const MAX_DISTANCE_KM = 15; // limit for "nearby"
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || null;

// ---------- helpers ----------
function toRad(d) {
  return (d * Math.PI) / 180;
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

// optional SendGrid email helper
async function sendEmail(toEmails, subject, text) {
  if (!SENDGRID_API_KEY || !toEmails.length) return;
  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SENDGRID_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: toEmails.map((e) => ({ email: e })) }],
      from: { email: "alerts@hope4paws.app", name: "Hope4Paws Alerts" },
      subject,
      content: [{ type: "text/plain", value: text }],
    }),
  });
  if (!res.ok) console.error("SendGrid error:", await res.text());
}

// ---------- main trigger ----------
exports.notifySheltersAndVolunteers = onDocumentCreated(
  "AnimalReports/{reportId}",
  async (event) => {
    const report = event.data.data();
    if (!report) return;
    console.log("🐾 New animal report created:", report);

    const { animalType, condition, address, location = {} } = report;
    const { lat, lng } = location;

    // gather recipients
    const sheltersSnap = await db.collection("Shelters").get();
    const usersSnap = await db.collection("users").get();

    const nearbyShelterEmails = [];
    const volunteerTokens = [];

    sheltersSnap.forEach((doc) => {
      const s = doc.data();
      if (!s.email) return;
      if (s.location && lat && lng) {
        const dist = distanceKm(lat, lng, s.location.lat, s.location.lng);
        if (dist <= MAX_DISTANCE_KM) nearbyShelterEmails.push(s.email);
      } else {
        nearbyShelterEmails.push(s.email);
      }
    });

    usersSnap.forEach((doc) => {
      const u = doc.data();
      if (u.role === "volunteer" && u.isAvailable && u.fcmToken) {
        if (u.location && lat && lng) {
          const dist = distanceKm(lat, lng, u.location.lat, u.location.lng);
          if (dist <= MAX_DISTANCE_KM) volunteerTokens.push(u.fcmToken);
        } else {
          volunteerTokens.push(u.fcmToken);
        }
      }
    });

    const title = `🚨 ${animalType || "Animal"} reported`;
    const body = `${condition || "No condition"} - ${address || "Unknown"}`;

    // 1️⃣ FCM multicast push
    if (volunteerTokens.length > 0) {
      await getMessaging().sendEachForMulticast({
        tokens: volunteerTokens,
        notification: { title, body },
        data: { type: "animal_report", reportId: event.params.reportId },
      });
      console.log(`✅ Push sent to ${volunteerTokens.length} volunteers`);
    }

    // 2️⃣ Optional SendGrid email to shelters
    if (nearbyShelterEmails.length > 0) {
      await sendEmail(
        nearbyShelterEmails,
        title,
        `${body}\n\nPlease check Hope4Paws Admin for more details.`
      );
      console.log(`📧 Emails sent to ${nearbyShelterEmails.length} shelters`);
    } else {
      console.log("⚠️ No shelter emails found in range.");
    }

    // 3️⃣ Store an in-app notification document
    await db.collection("Notifications").add({
      title,
      body,
      type: "animal_report",
      reportId: event.params.reportId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      address: address || "",
    });
  }
);
