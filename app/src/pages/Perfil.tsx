import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from "@ionic/react";
import { MostrarDatosUsuario } from "../components/firebase/mostrarDatosUsuario";

import "./Perfil.css";
import Logout from "../components/firebase/logout";
import { auth } from "../Services/firebase/config/firebaseConfig";
const Perfil: React.FC = () => {
  const user = auth.currentUser;
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Pefil</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse='condense'>
          <IonToolbar>
            <IonTitle size='large'>Pefil</IonTitle>
          </IonToolbar>
        </IonHeader>
        {user ? (
          <>
            <MostrarDatosUsuario />
            <Logout />
          </>
        ) : (
          <div>No esta logueado</div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Perfil;
