import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  updateProfile 
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc 
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB6AL7UMMGZsrJek7eWW5-kTchzUv5YbOo",
  authDomain: "dogalim.firebaseapp.com",
  projectId: "dogalim",
  storageBucket: "dogalim.firebasestorage.app",
  messagingSenderId: "970570198182",
  appId: "1:970570198182:web:71fbaec83a70cd62f39867",
  measurementId: "G-QJHWPVVB4L"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const db = getFirestore(app);

export const syncUserProfile = async (user, additionalData = {}) => {
  if (!user) return null;
  
  try {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      const newUserData = {
        uid: user.uid,
        email: user.email,
        displayName: additionalData.displayName || user.displayName || "İsimsiz Satıcı",
        username: additionalData.username || user.email?.split("@")[0] || "",
        createdAt: new Date().toISOString()
      };
      
      await setDoc(userRef, newUserData);

      if (additionalData.displayName && user.displayName !== additionalData.displayName) {
        await updateProfile(user, { displayName: additionalData.displayName });
      }

      return newUserData;
    }

    return userSnap.data();
  } catch (error) {
    console.error("Firestore profil hatası (Devam ediliyor):", error);
    // Firestore hatası olsa bile oturumu kilitlenmesin diye null dönüyoruz
    return null;
  }
};

export const updateUserProfileData = async (user, newDisplayName, newUsername) => {
  if (!user) return;
  
  await updateProfile(user, {
    displayName: newDisplayName
  });

  const userRef = doc(db, "users", user.uid);
  await updateDoc(userRef, {
    displayName: newDisplayName,
    username: newUsername
  });
};

export default app;