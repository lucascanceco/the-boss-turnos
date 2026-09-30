import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB7QNjL8sVOiqQCwuwAM0AHUohy6s7h4Do",
  authDomain: "theboss-96244.firebaseapp.com",
  databaseURL: "https://theboss-96244-default-rtdb.firebaseio.com",
  projectId: "theboss-96244",
  storageBucket: "theboss-96244.firebasestorage.app",
  messagingSenderId: "379893259070",
  appId: "1:379893259070:web:0a7562b91c725d9290aa6f",
  measurementId: "G-TCT0QML17R"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
