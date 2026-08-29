import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyD655XMusqRwEgHvbpWh5XPk9QVKNVePrI",
  authDomain: "personalprojectwebsite.firebaseapp.com",
  projectId: "personalprojectwebsite",
  storageBucket: "personalprojectwebsite.firebasestorage.app",
  messagingSenderId: "44825506431",
  appId: "1:44825506431:web:c9fc72ee40b5390ccbc54a",
  measurementId: "G-5KY3E7EC3Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export app so other files in your project can use it
export default app;
