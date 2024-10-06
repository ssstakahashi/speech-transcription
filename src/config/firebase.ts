import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider,
} from "firebase/auth";
import { getMessaging } from "firebase/messaging";

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: import.meta.env.VITE_FIREBASE_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  mesurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
// export const db = firebaseApp.firestore();
export const auth = getAuth(app);

export const messaging = getMessaging(app);
// export const storage = firebase.storage();
export const provider = new GoogleAuthProvider();

export const getAccessToken = async ()  => {
  try {
    const token = await auth.currentUser?.getIdToken(true);
    return token;
  } catch (error) {
    console.error(error);
  }
}






// export const setSession = setPersistence(auth, browserSessionPersistence);
