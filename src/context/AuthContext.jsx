import { createContext, useContext, useEffect, useState } from "react";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Fetch additional user data from Firestore
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          } else {
            setUserData(null);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = async (email, password, username, fullName) => {
    // 1. Check if username is already taken (In a real app, do a query, here we assume it's checked before this call)
    // 2. Create auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // 3. Create Firestore document
    const newUserData = {
      uid: user.uid,
      email: user.email,
      username: username,
      fullName: fullName,
      bio: "",
      branch: "",
      graduationYear: "",
      profilePhotoUrl: "",
      resumeUrl: "",
      socialLinks: {
        github: "",
        linkedin: "",
        twitter: "",
        portfolio: ""
      },
      customization: {
        themeColor: "blue",
        style: "modern",
        isDark: false
      },
      createdAt: new Date().toISOString()
    };
    
    await setDoc(doc(db, "users", user.uid), newUserData);
    setUserData(newUserData);
    return userCredential;
  };

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth);
  };

  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  const updateUserData = async (newData) => {
    if (!currentUser) return;
    const userDocRef = doc(db, "users", currentUser.uid);
    await setDoc(userDocRef, newData, { merge: true });
    setUserData(prev => ({ ...prev, ...newData }));
  };

  const value = {
    currentUser,
    userData,
    loading,
    signup,
    login,
    logout,
    resetPassword,
    updateUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
