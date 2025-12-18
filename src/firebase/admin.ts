
import admin from 'firebase-admin';

// IMPORTANT: These variables should be in your .env.local file
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

let app: admin.app.App;

export async function initializeAdminApp() {
    if (admin.apps.length > 0) {
        app = admin.app();
    } else {
        app = admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey,
            }),
            // Add your databaseURL if you use Realtime Database
        });
    }
    return { app };
}

export const adminApp = app;
