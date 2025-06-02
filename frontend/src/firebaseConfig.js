// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; 

const firebaseConfig = {
  apiKey: "AIzaSyAA9rUf18qqwqxCB1M4V59VXZqyIeG4zIc",
  authDomain: "fraude-app.firebaseapp.com",
  projectId: "fraude-app",
  storageBucket: "fraude-app.appspot.com",
  messagingSenderId: "449473100714",
  appId: "1:449473100714:web:11a76f04001fb5e8a289d3"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app); 

export { db, auth }; 
