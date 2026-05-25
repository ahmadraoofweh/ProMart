let app;
let db;
let auth;

export function getFirebase() {
    if (typeof window === "undefined") return null;

    if (!app) {
        const { initializeApp, getApps } = require("firebase/app");
        const { getFirestore } = require("firebase/firestore");
        const { getAuth } = require("firebase/auth");

        const firebaseConfig = {
            apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
            authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        };

        app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);
    }

    return { db, auth };
}