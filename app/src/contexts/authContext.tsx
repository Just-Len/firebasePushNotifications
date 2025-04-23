import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth, authReady } from "../Services/firebase/config/firebaseConfig";

interface AuthContextProps {
  user: User | null;
}

const AuthContext = createContext<AuthContextProps>({ user: null });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
 
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    authReady.then(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
      });

      return () => unsubscribe();
    });
  }, []);

  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
