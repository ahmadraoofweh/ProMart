
let app;
let db;
let auth;
let storage;
export function getFirebase() {
    if (typeof window === "undefined") return null;

    if (!app) {
        const { initializeApp, getApps } = require("firebase/app");
        const { getFirestore } = require("firebase/firestore");
        const { getAuth } = require("firebase/auth");
        const { getStorage } = require("firebase/storage");
        const firebaseConfig = {
            apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
            authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,

        };

        app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);
        storage = getStorage(app);
    }

    return { db, auth, storage };
}
