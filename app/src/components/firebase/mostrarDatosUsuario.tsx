import { useEffect, useState } from "react";
import { IonText } from "@ionic/react";

//import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import { fetchUserRoles } from "../../Services/firebase/roles";
import { auth } from "../../Services/firebase/config/firebaseConfig";

import { onAuthStateChanged, User } from "firebase/auth";
import { roluser } from "../../models/roluser";

export const MostrarDatosUsuario = () => {
  const [user, setUser] = useState<User | undefined>();

  const [roles, setRoles] = useState<roluser[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        fetchUserRoles(user.uid || "")
          .then((rolesList) => {
            setRoles(rolesList);
          })
          .catch(() => {
            setRoles([]);
          });
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <>
      {user ? (
        <div>
          <IonText>
            <h2>Welcome, {user?.displayName}</h2>
            <p>Email: {user?.email}</p>
            <p>UID: {user?.uid}</p>
            <ul>
              {roles?.map((role) => (
                <li key={role?.id}>{role?.rol}</li>
              ))}
            </ul>
          </IonText>
        </div>
      ) : (
        <IonText>
          <p>No user is currently signed in.</p>
        </IonText>
      )}
    </>
  );
};
