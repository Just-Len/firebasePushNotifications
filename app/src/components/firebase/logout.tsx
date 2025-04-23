import { signOut } from "firebase/auth";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";

import { useHistory } from "react-router-dom";
import { auth } from "../../Services/firebase/config/firebaseConfig";
import { IonButton, IonIcon } from "@ionic/react";

const Logout = () => {
  const history = useHistory();
  const handleLogout = async () => {
    try {
      await signOut(auth);
      await FirebaseAuthentication.signOut();

      history.push("/login");
    } catch (error: any) {
      console.error("Error al cerrar sesión: ", error);
    }
  };
  return (
    <IonButton onClick={handleLogout} expand='block'>
      <IonIcon slot='start' name='logo-google'></IonIcon>
      Cerrar sesión
    </IonButton>
  );
};

export default Logout;
