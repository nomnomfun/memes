import admin from "firebase-admin";
import fs from "fs";

const secretFilePath = "/etc/secrets/firebaseAdminKey.json";

if (!fs.existsSync(secretFilePath)) {
  console.error("Firebase Admin key file is missing at:", secretFilePath);
} else {
  console.log("Firebase Admin key file found.");
}

const serviceAccount = JSON.parse(fs.readFileSync(secretFilePath, "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore(); // Firestore instance

export { db };
