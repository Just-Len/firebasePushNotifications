import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from "@ionic/react";
import HandleGoogleSignIn from "../../components/firebase/authentication";
import LoginEmailAndPassword from "../../components/firebase/loginEmailAndPassword";

const Login: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Ingreso</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse='condense'>
          <IonToolbar>
            <IonTitle size='large'>Ingreso</IonTitle>
          </IonToolbar>
        </IonHeader>
        <LoginEmailAndPassword />
        <HandleGoogleSignIn />
      </IonContent>
    </IonPage>
  );
};

export default Login;
