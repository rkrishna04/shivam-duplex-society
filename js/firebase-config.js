// ============================================================
//  firebase-config.js  —  SHIVAM DUPLEX Society App
//  Firebase Project: shivam-a659b
// ============================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore }  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey:            "AIzaSyChN-XKszht7p_FGNTGbNe62yczU35gpzM",
  authDomain:        "shivam-a659b.firebaseapp.com",
  projectId:         "shivam-a659b",
  storageBucket:     "shivam-a659b.firebasestorage.app",
  messagingSenderId: "625266203707",
  appId:             "1:625266203707:web:c21e7699194d3b558bd01e"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);