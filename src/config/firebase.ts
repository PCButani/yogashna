import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAUeVmyZ6UGbdfO3Y4ZBlnrMHd7o6DfRKI",
  authDomain: "yogashna.firebaseapp.com",
  projectId: "yogashna",
  storageBucket: "yogashna.firebasestorage.app",
  messagingSenderId: "192332349396",
  appId: "1:192332349396:web:9c87170d6b0ff22dcce041",
  // measurementId is only for Analytics (web). Not needed here.
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
