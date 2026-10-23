// 1) Paste your Firebase web config here (Firebase console → Project settings → Your apps → Web app)
export const firebaseConfig = {
  apiKey: "AIzaSyB0eFA-ITIs5bxyNElOeIN7zAyh4dOG3m8",
  authDomain: "logic-elle3ba.firebaseapp.com",
  projectId: "logic-elle3ba",
  storageBucket: "logic-elle3ba.firebasestorage.app",
  messagingSenderId: "375912885378",
  appId: "1:375912885378:web:eda3d5b128c0f5f64c989b",
};

// 2) The ONE admin account (create it in Firebase → Authentication → Users). Must match firestore.rules.
export const ADMIN_EMAIL = "admin@logic.com";

// Team logins are "team01", "team02"... internally mapped to team01@<this domain>. No need to change.
export const TEAM_EMAIL_DOMAIN = "le3ba.app";
