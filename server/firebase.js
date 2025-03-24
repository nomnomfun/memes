import admin from "firebase-admin";
import fs from "fs";

//const serviceAccount = JSON.parse(fs.readFileSync("./secrets/firebaseAdminKey.json", "utf8"));
const serviceAccount = JSON.parse(fs.readFileSync("./etc/secrets/firebaseAdminKey.json", "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore(); // Firestore instance

export { db };
